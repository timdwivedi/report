-- ============================================================================
-- VECTOR SEARCH & RAG TABLE (1 table + 1 RPC function)
-- ============================================================================
-- Enables semantic search via pgvector embeddings.
-- Used by the Embedding Service + RAG Service for knowledge-base queries.
--
-- INCLUDE WHEN: The app needs semantic search, document retrieval, or RAG.
-- REQUIRES: pgvector extension enabled in Supabase (Dashboard → Extensions).
-- DEPENDS ON: 003a (shared functions: is_org_member, update_updated_at)
-- ============================================================================


-- ============================================================================
-- TABLE 17: EMBEDDINGS (Vector Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID,
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    content_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_org ON embeddings(org_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON embeddings(source_table, source_id);

ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read embeddings" ON embeddings
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Org members can manage embeddings" ON embeddings
    FOR ALL USING (is_org_member(org_id));

CREATE TRIGGER update_embeddings_updated_at
    BEFORE UPDATE ON embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- RPC: SEMANTIC SIMILARITY SEARCH
-- ============================================================================
-- Called by RAGService.retrieveContext() for cosine similarity matching.

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 5,
    filter_org_id UUID DEFAULT NULL,
    filter_group_id UUID DEFAULT NULL,
    filter_source_table TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source_table TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.content,
        e.source_table,
        e.metadata,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM embeddings e
    WHERE
        (filter_org_id IS NULL OR e.org_id = filter_org_id)
        AND (filter_group_id IS NULL OR e.group_id = filter_group_id)
        AND (filter_source_table IS NULL OR e.source_table = filter_source_table)
        AND 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
