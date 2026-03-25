-- ============================================================================
-- ADAPTIVE LEARNING TABLES (6 tables)
-- ============================================================================
-- The learning loop: effectiveness tracking, timing patterns, A/B testing,
-- journey patterns, and anti-patterns. These tables get SMARTER over time.
--
-- INCLUDE WHEN: The app has repeated engagement, outcome tracking, or
-- needs data-driven content optimization.
-- DEPENDS ON: 003a (shared functions: is_org_member, update_updated_at)
-- ============================================================================


-- ============================================================================
-- TABLE 8: CONTENT EFFECTIVENESS (Style x Subject Type Matrix)
-- ============================================================================
-- Which content styles work for which subject types? This table knows.

CREATE TABLE IF NOT EXISTS content_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subject_type TEXT NOT NULL,
    content_style TEXT NOT NULL,
    sends_count INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    engaged_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    positive_rate FLOAT DEFAULT 0,
    engagement_rate FLOAT DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_effectiveness_org ON content_effectiveness(org_id, subject_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_effectiveness_combo ON content_effectiveness(org_id, subject_type, content_style);

ALTER TABLE content_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read content effectiveness" ON content_effectiveness
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Authenticated can track content effectiveness" ON content_effectiveness
    FOR ALL USING (is_org_member(org_id));

CREATE TRIGGER update_content_effectiveness_updated_at
    BEFORE UPDATE ON content_effectiveness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate rates when counters change
CREATE OR REPLACE FUNCTION calculate_effectiveness_rates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sends_count > 0 THEN
        NEW.positive_rate = (NEW.positive_count::float / NEW.sends_count) * 100;
        NEW.engagement_rate = (NEW.engaged_count::float / NEW.sends_count) * 100;
        NEW.conversion_rate = (NEW.converted_count::float / NEW.sends_count) * 100;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_content_effectiveness_rates
    BEFORE INSERT OR UPDATE ON content_effectiveness
    FOR EACH ROW EXECUTE FUNCTION calculate_effectiveness_rates();


-- ============================================================================
-- TABLE 9: TEMPORAL EVENTS (Raw Engagement Events)
-- ============================================================================
-- Raw events for timing intelligence. Feeds temporal patterns.

CREATE TABLE IF NOT EXISTS temporal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hour_of_day INTEGER,
    day_of_week TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temporal_events_subject ON temporal_events(subject_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_temporal_events_org ON temporal_events(org_id);

ALTER TABLE temporal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read temporal events" ON temporal_events
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Authenticated can insert temporal events" ON temporal_events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================================
-- TABLE 10: TEMPORAL PATTERNS (Aggregated Timing Intelligence)
-- ============================================================================
-- Aggregated from temporal_events. Response times, active hours, fatigue.

CREATE TABLE IF NOT EXISTS temporal_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL UNIQUE,
    avg_response_time_minutes INTEGER,
    fastest_response_minutes INTEGER,
    slowest_response_minutes INTEGER,
    response_time_trend TEXT DEFAULT 'unknown',
    most_active_days TEXT[] DEFAULT '{}',
    most_active_hours INTEGER[] DEFAULT '{}',
    timezone_detected TEXT,
    best_performing_send_times JSONB DEFAULT '[]',
    optimal_followup_delay_hours INTEGER,
    current_fatigue_score FLOAT DEFAULT 0,
    urgency_signals JSONB DEFAULT '{}',
    urgency_score FLOAT DEFAULT 0,
    analysis_confidence FLOAT DEFAULT 0,
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temporal_patterns_subject ON temporal_patterns(subject_id);

ALTER TABLE temporal_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read temporal patterns" ON temporal_patterns
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage temporal patterns" ON temporal_patterns
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_temporal_patterns_updated_at
    BEFORE UPDATE ON temporal_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 11: VARIATION ARMS (A/B Testing — Thompson Sampling)
-- ============================================================================
-- Multi-armed bandit for content variation testing.

CREATE TABLE IF NOT EXISTS variation_arms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    approach_name TEXT NOT NULL,
    hook_type TEXT NOT NULL,
    successes INTEGER DEFAULT 0,
    trials INTEGER DEFAULT 0,
    beta_alpha FLOAT DEFAULT 2,
    beta_beta FLOAT DEFAULT 2,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variation_arms_org ON variation_arms(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_variation_arms_combo ON variation_arms(org_id, approach_name);

ALTER TABLE variation_arms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read variation arms" ON variation_arms
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org members can manage variation arms" ON variation_arms
    FOR ALL USING (is_org_member(org_id));


-- ============================================================================
-- TABLE 15: CONVERSION PATTERNS (Journey Pattern Intelligence)
-- ============================================================================
-- Successful event sequences. Powers prediction and pattern matching.

CREATE TABLE IF NOT EXISTS conversion_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_sequence JSONB NOT NULL DEFAULT '[]',
    signal_sequence JSONB DEFAULT '[]',
    description TEXT,
    success_count INTEGER DEFAULT 0,
    total_occurrences INTEGER DEFAULT 0,
    confidence_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversion_patterns_org ON conversion_patterns(org_id, confidence_score DESC);

ALTER TABLE conversion_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read conversion patterns" ON conversion_patterns
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org members can manage conversion patterns" ON conversion_patterns
    FOR ALL USING (is_org_member(org_id));

CREATE TRIGGER update_conversion_patterns_updated_at
    BEFORE UPDATE ON conversion_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 16: ANTI-PATTERNS (Failure Pattern Intelligence)
-- ============================================================================
-- Event sequences that correlate with failures. Red flags.

CREATE TABLE IF NOT EXISTS anti_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_sequence JSONB NOT NULL DEFAULT '[]',
    description TEXT,
    failure_type TEXT,
    failure_count INTEGER DEFAULT 0,
    total_occurrences INTEGER DEFAULT 0,
    failure_rate FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anti_patterns_org ON anti_patterns(org_id, failure_rate DESC);

ALTER TABLE anti_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read anti patterns" ON anti_patterns
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org members can manage anti patterns" ON anti_patterns
    FOR ALL USING (is_org_member(org_id));

CREATE TRIGGER update_anti_patterns_updated_at
    BEFORE UPDATE ON anti_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
