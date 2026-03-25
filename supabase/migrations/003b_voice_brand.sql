-- ============================================================================
-- VOICE & BRAND INTELLIGENCE TABLES (5 tables)
-- ============================================================================
-- Content intelligence layer: voice DNA, brand governance, prompt management.
-- Needed when the app generates content (posts, emails, messages, reports).
--
-- INCLUDE WHEN: Content generation is enabled in the intelligence config.
-- DEPENDS ON: 003a (shared functions: is_org_member, update_updated_at)
-- ============================================================================


-- ============================================================================
-- TABLE 6: VOICE GENOMES (Quantum Mirror / Voice DNA v2)
-- ============================================================================
-- The user's writing style fingerprint. Used by the prompt system to
-- generate authentic (not generic AI) content.

CREATE TABLE IF NOT EXISTS voice_genomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    genome_data JSONB NOT NULL DEFAULT '{}',
    sample_count INTEGER DEFAULT 0,
    source_types TEXT[] DEFAULT '{}',
    voice_mode TEXT DEFAULT 'written',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_genomes_org ON voice_genomes(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_genomes_org_user ON voice_genomes(org_id, user_id);

ALTER TABLE voice_genomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read voice genomes" ON voice_genomes
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage voice genomes" ON voice_genomes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
        OR user_id = auth.uid()
    );

CREATE TRIGGER update_voice_genomes_updated_at
    BEFORE UPDATE ON voice_genomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 7: ORG CONSTITUTION (Brand Governance)
-- ============================================================================
-- Organization-level brand rules. Sits at TOP of prompt hierarchy.

CREATE TABLE IF NOT EXISTS org_constitution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    values JSONB DEFAULT '[]',
    brand_voice JSONB DEFAULT '{}',
    rules TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_constitution_org ON org_constitution(org_id);

ALTER TABLE org_constitution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read constitution" ON org_constitution
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage constitution" ON org_constitution
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );

CREATE TRIGGER update_org_constitution_updated_at
    BEFORE UPDATE ON org_constitution
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 12: CONTENT VOICE FINGERPRINTS (Legacy — Voice DNA v1)
-- ============================================================================
-- Fallback for legacy voice fingerprints (before voice_genomes).

CREATE TABLE IF NOT EXISTS content_voice_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metrics JSONB DEFAULT '{}',
    signature_phrases TEXT[] DEFAULT '{}',
    hook_patterns TEXT[] DEFAULT '{}',
    closing_patterns TEXT[] DEFAULT '{}',
    tone_labels TEXT[] DEFAULT '{}',
    banned_words TEXT[] DEFAULT '{}',
    sample_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_fingerprints_org ON content_voice_fingerprints(org_id);

ALTER TABLE content_voice_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read voice fingerprints" ON content_voice_fingerprints
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage voice fingerprints" ON content_voice_fingerprints
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );


-- ============================================================================
-- TABLE 13: PROMPT TEMPLATES (Client Schema Overrides — HIGHEST Priority)
-- ============================================================================
-- Custom prompt overrides. HIGHEST priority in 3-tier resolution.

CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    template_content TEXT NOT NULL DEFAULT '',
    required_variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user ON prompt_templates(target_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_org ON prompt_templates(org_id);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own templates" ON prompt_templates
    FOR SELECT USING (target_user_id = auth.uid() OR is_org_member(org_id));

CREATE POLICY "Users can manage own templates" ON prompt_templates
    FOR ALL USING (
        target_user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- TABLE 14: RUNTIME PROMPTS (AI-Generated — Second Priority)
-- ============================================================================
-- AI-generated prompts. Second priority in 3-tier resolution.

CREATE TABLE IF NOT EXISTS runtime_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    prompt_content TEXT NOT NULL DEFAULT '',
    template_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runtime_prompts_org ON runtime_prompts(org_id, is_active);

ALTER TABLE runtime_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read runtime prompts" ON runtime_prompts
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org owners can manage runtime prompts" ON runtime_prompts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM organizations WHERE id = org_id AND owner_id = auth.uid())
    );

CREATE TRIGGER update_runtime_prompts_updated_at
    BEFORE UPDATE ON runtime_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
