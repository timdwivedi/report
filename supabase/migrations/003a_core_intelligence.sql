-- ============================================================================
-- CORE INTELLIGENCE TABLES (5 tables)
-- ============================================================================
-- These are the MUST-HAVE tables for any intelligence-enabled Bloom app.
-- Contains: subject DNA/score/profile storage, execution logging, config,
-- effectiveness tracking, and archetype definitions.
--
-- ALWAYS INCLUDED when intelligence is enabled.
-- Run AFTER: 001 (initial schema) and 002 (base RLS).
-- ============================================================================


-- ============================================================================
-- SHARED HELPER FUNCTIONS
-- ============================================================================

-- Check org membership (prevents RLS recursion with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = check_org_id
        AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM organizations
        WHERE id = check_org_id
        AND owner_id = auth.uid()
    );
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TABLE 1: SUBJECT INTELLIGENCE (DNA + Score + Profile + Conversation + Prediction)
-- ============================================================================
-- THE core table. Stores ALL intelligence data for a subject.
-- One row per subject per org.

CREATE TABLE IF NOT EXISTS subject_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL,
    subject_type TEXT NOT NULL DEFAULT 'lead',
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- DNA
    dna JSONB DEFAULT '{}',
    dna_extraction_confidence INTEGER DEFAULT 0,
    dna_extracted_at TIMESTAMPTZ,
    dna_model_used TEXT,

    -- Score
    score INTEGER DEFAULT 0,
    score_value INTEGER DEFAULT 0,
    score_verdict TEXT,
    score_breakdown JSONB DEFAULT '[]',
    score_summary TEXT,
    score_tier TEXT,
    score_scored_at TIMESTAMPTZ,
    score_model_used TEXT,

    -- Profile
    profile JSONB DEFAULT '{}',
    profile_confidence FLOAT DEFAULT 0,

    -- Conversation
    conversation_state JSONB DEFAULT '{}',
    emotional_state JSONB,

    -- Prediction
    predictive_insights JSONB,

    -- Simulation
    latest_simulation JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_intelligence_subject ON subject_intelligence(subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_subject_intelligence_org ON subject_intelligence(org_id);
CREATE INDEX IF NOT EXISTS idx_subject_intelligence_score ON subject_intelligence(score DESC);
CREATE INDEX IF NOT EXISTS idx_subject_intelligence_tier ON subject_intelligence(score_tier);

ALTER TABLE subject_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read intelligence" ON subject_intelligence
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage intelligence" ON subject_intelligence
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
        OR user_id = auth.uid()
    );

CREATE TRIGGER update_subject_intelligence_updated_at
    BEFORE UPDATE ON subject_intelligence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 2: INTELLIGENCE EXECUTION LOGS
-- ============================================================================
-- Tracks every AI call. For debugging and learning.

CREATE TABLE IF NOT EXISTS intelligence_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    subject_id UUID,
    operation TEXT NOT NULL,
    model_used TEXT,
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    input_summary TEXT,
    output_summary TEXT,
    result JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_logs_org ON intelligence_execution_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_logs_operation ON intelligence_execution_logs(operation, created_at DESC);

ALTER TABLE intelligence_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read logs" ON intelligence_execution_logs
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Authenticated users can insert logs" ON intelligence_execution_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================================
-- TABLE 3: INTELLIGENCE CONFIG (per org)
-- ============================================================================
-- The full intelligence configuration per organization.

CREATE TABLE IF NOT EXISTS intelligence_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    config JSONB NOT NULL DEFAULT '{}',
    preset_name TEXT,
    custom_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_configs_org ON intelligence_configs(org_id);

ALTER TABLE intelligence_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read configs" ON intelligence_configs
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage configs" ON intelligence_configs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );

CREATE TRIGGER update_intelligence_configs_updated_at
    BEFORE UPDATE ON intelligence_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 4: INTELLIGENCE EFFECTIVENESS (General Outcome Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS intelligence_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    subject_id UUID,
    outcome_type TEXT,
    outcome_details JSONB,
    intelligence_snapshot JSONB,
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_effectiveness_org ON intelligence_effectiveness(org_id, operation, created_at DESC);

ALTER TABLE intelligence_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read effectiveness" ON intelligence_effectiveness
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Authenticated users can track effectiveness" ON intelligence_effectiveness
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================================
-- TABLE 5: INTELLIGENCE ARCHETYPES (per org)
-- ============================================================================

CREATE TABLE IF NOT EXISTS intelligence_archetypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    identification_triggers JSONB DEFAULT '{}',
    color TEXT DEFAULT 'blue',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_archetypes_org ON intelligence_archetypes(org_id, is_active);

ALTER TABLE intelligence_archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read archetypes" ON intelligence_archetypes
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage archetypes" ON intelligence_archetypes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );

CREATE TRIGGER update_intelligence_archetypes_updated_at
    BEFORE UPDATE ON intelligence_archetypes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
