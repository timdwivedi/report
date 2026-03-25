-- ═══════════════════════════════════════════════════════════════════
-- TEMPLATE: Discovery Analytics Engine (per-build migration)
-- ═══════════════════════════════════════════════════════════════════
-- This is a TEMPLATE — NOT a real migration. Agent 1 copies this into
-- each bloom build's `supabase/migrations/{next}_discovery_analytics.sql`
-- with the build's own sequential migration number.
--
-- DO NOT run this in the SAAS Supabase. The SAAS platform only needs
-- migration 219 (bloom_discovery_analytics cross-build aggregate).
--
-- Per-build analytics tables for discovery funnel tracking.
-- Works in demo mode (no data) and production mode (real events).
-- Spec: docs/roadmap/64_discovery_analytics_engine.md

-- ─── 1. Sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    session_id TEXT NOT NULL UNIQUE,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    country TEXT,
    landing_page TEXT,
    ab_assignments JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_org ON analytics_sessions(org_id);
CREATE INDEX idx_sessions_session ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_created ON analytics_sessions(created_at DESC);

-- ─── 2. Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL DEFAULT 'funnel',
    properties JSONB DEFAULT '{}',
    page_path TEXT,
    funnel_stage TEXT,
    quiz_submission_id UUID,
    ab_test_id UUID,
    ab_variant TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org_type ON analytics_events(org_id, event_type);
CREATE INDEX idx_events_session ON analytics_events(session_id);
CREATE INDEX idx_events_funnel ON analytics_events(org_id, funnel_stage, created_at DESC);
CREATE INDEX idx_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_events_ab ON analytics_events(ab_test_id, ab_variant)
    WHERE ab_test_id IS NOT NULL;

-- ─── 3. Daily Funnel Aggregates ─────────────────────────────────
CREATE TABLE IF NOT EXISTS discovery_funnel_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    date DATE NOT NULL,
    landing_views INTEGER DEFAULT 0,
    quiz_starts INTEGER DEFAULT 0,
    quiz_completes INTEGER DEFAULT 0,
    bridge_views INTEGER DEFAULT 0,
    bridge_cta_clicks INTEGER DEFAULT 0,
    application_starts INTEGER DEFAULT 0,
    application_submits INTEGER DEFAULT 0,
    question_dropoffs JSONB DEFAULT '[]',
    archetype_distribution JSONB DEFAULT '{}',
    avg_quiz_time_seconds NUMERIC(6,1),
    avg_bridge_time_seconds NUMERIC(6,1),
    avg_bridge_scroll_depth NUMERIC(4,1),
    voice_text_split JSONB DEFAULT '{}',
    device_breakdown JSONB DEFAULT '{}',
    source_breakdown JSONB DEFAULT '{}',
    ab_test_results JSONB DEFAULT '{}',
    unique_sessions INTEGER DEFAULT 0,
    UNIQUE(org_id, date)
);

CREATE INDEX idx_funnel_daily_org ON discovery_funnel_daily(org_id, date DESC);

-- ─── 4. A/B Tests ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    test_type TEXT NOT NULL DEFAULT 'bridge',
    variants JSONB NOT NULL DEFAULT '[]',
    target_metric TEXT NOT NULL DEFAULT 'bridge_cta_click',
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    winner_variant TEXT,
    stats_cache JSONB DEFAULT '{}',
    confidence_level NUMERIC(5,3),
    min_sample_size INTEGER DEFAULT 100,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ab_tests_org ON ab_tests(org_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status) WHERE status = 'running';

-- ─── 5. A/B Test Assignments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, test_id)
);

CREATE INDEX idx_ab_assign_test ON ab_test_assignments(test_id);
CREATE INDEX idx_ab_assign_session ON ab_test_assignments(session_id);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_funnel_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT events and sessions (quiz takers are anonymous)
CREATE POLICY "Anon insert analytics sessions"
    ON analytics_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert analytics events"
    ON analytics_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert ab assignments"
    ON ab_test_assignments FOR INSERT TO anon WITH CHECK (true);

-- Anon can READ running A/B tests (tracker needs to fetch active tests for variant assignment)
CREATE POLICY "Anon read running ab tests"
    ON ab_tests FOR SELECT TO anon USING (status = 'running');
-- Anon can READ their own A/B assignments (tracker checks existing assignment before creating)
CREATE POLICY "Anon read ab assignments"
    ON ab_test_assignments FOR SELECT TO anon USING (true);

-- Org members can READ their org's data
CREATE POLICY "Org members read analytics sessions"
    ON analytics_sessions FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            UNION SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );
CREATE POLICY "Org members read analytics events"
    ON analytics_events FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            UNION SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );
CREATE POLICY "Org members read funnel daily"
    ON discovery_funnel_daily FOR SELECT USING (
        org_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            UNION SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );
CREATE POLICY "Org members manage ab tests"
    ON ab_tests FOR ALL USING (
        org_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            UNION SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );

-- Service role full access on all tables
CREATE POLICY "Service role analytics sessions" ON analytics_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role analytics events" ON analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role funnel daily" ON discovery_funnel_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role ab tests" ON ab_tests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role ab assignments" ON ab_test_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON analytics_sessions TO service_role;
GRANT ALL ON analytics_events TO service_role;
GRANT ALL ON discovery_funnel_daily TO service_role;
GRANT ALL ON ab_tests TO service_role;
GRANT ALL ON ab_test_assignments TO service_role;
GRANT INSERT ON analytics_sessions TO anon;
GRANT INSERT ON analytics_events TO anon;
GRANT INSERT, SELECT ON ab_test_assignments TO anon;
GRANT SELECT ON ab_tests TO anon;

-- ─── Data Retention ─────────────────────────────────────────────
-- Raw events older than 90 days are deleted (daily aggregates are kept).
-- Sessions older than 90 days are deleted.
-- A/B test assignments for completed tests older than 90 days are deleted.
-- Call via cron or manually: SELECT analytics_cleanup();

CREATE OR REPLACE FUNCTION analytics_cleanup()
RETURNS TABLE(events_deleted BIGINT, sessions_deleted BIGINT, assignments_deleted BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    cutoff TIMESTAMPTZ := NOW() - INTERVAL '90 days';
    ev_count BIGINT;
    sess_count BIGINT;
    assign_count BIGINT;
BEGIN
    -- Delete old raw events (aggregates are preserved in discovery_funnel_daily)
    DELETE FROM analytics_events WHERE created_at < cutoff;
    GET DIAGNOSTICS ev_count = ROW_COUNT;

    -- Delete old sessions
    DELETE FROM analytics_sessions WHERE created_at < cutoff;
    GET DIAGNOSTICS sess_count = ROW_COUNT;

    -- Delete old A/B test assignments for completed tests
    DELETE FROM ab_test_assignments
    WHERE created_at < cutoff
    AND test_id IN (SELECT id FROM ab_tests WHERE status = 'completed');
    GET DIAGNOSTICS assign_count = ROW_COUNT;

    RETURN QUERY SELECT ev_count, sess_count, assign_count;
END;
$$;
