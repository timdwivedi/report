# pgvector Setup for Bloom Learnings (Enable at 100 Builds)

> **Current status:** Schema prepared, embeddings column exists (NULL for now)
> **Activation trigger:** 100+ builds with patterns to embed
> **Expected benefit:** Semantic search for "find patterns similar to X"

---

## Why Wait Until 100 Builds?

**Embeddings are expensive:**
- OpenAI ada-002: $0.0001 per 1K tokens
- 100 patterns × 200 tokens avg = 20K tokens = $0.002 per batch
- Re-embedding on every build update = wasteful at low volume

**You need volume for semantic search to matter:**
- At 10 builds: Text search works fine ("email capture")
- At 100 builds: Semantic search adds value ("lead magnet issues" finds "email capture syndrome" even without exact keywords)
- At 500 builds: Semantic search is essential (too many patterns to keyword-search)

**Current retrieval is fast:**
- Postgres queries with GIN indexes on arrays/JSONB = <10ms
- Adding vector search now = premature optimization

---

## What's Already Prepared

### Migration 200 Added:

```sql
-- Embedding column (NULL for now)
ALTER TABLE build_learnings
ADD COLUMN embedding vector(1536);

-- Index (commented out, enable at 100 builds)
-- CREATE INDEX idx_build_learnings_embedding
--   ON build_learnings USING ivfflat (embedding vector_cosine_ops);
```

### Helper functions ready for filtering:
- `get_patterns_by_vertical(vertical TEXT)`
- `get_critical_patterns()`
- Structured JSON schema with categories, severity, verticals

---

## Activation Checklist (At 100 Builds)

### 1. Enable pgvector Extension

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Generate Embeddings for Existing Patterns

Create `/web/scripts/generate-pattern-embeddings.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbeddings() {
  // Get all patterns with NULL embedding
  const { data: patterns } = await supabase
    .from("build_learnings")
    .select("id, pattern_name, symptom, root_cause, fix")
    .is("embedding", null);

  if (!patterns || patterns.length === 0) {
    console.log("No patterns to embed");
    return;
  }

  console.log(`Generating embeddings for ${patterns.length} patterns...`);

  for (const pattern of patterns) {
    // Combine fields into searchable text
    const text = `${pattern.pattern_name}. ${pattern.symptom}. ${pattern.root_cause}. ${pattern.fix}`;

    // Generate embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Update database
    await supabase
      .from("build_learnings")
      .update({ embedding })
      .eq("id", pattern.id);

    console.log(`✓ Embedded: ${pattern.pattern_name}`);
  }

  console.log("Done! All patterns embedded.");
}

generateEmbeddings();
```

**Run:**
```bash
cd web
npx tsx scripts/generate-pattern-embeddings.ts
```

**Cost:** 100 patterns × 200 tokens = 20K tokens = **$0.002**

### 3. Enable Vector Index

```sql
-- Run in Supabase SQL Editor
CREATE INDEX idx_build_learnings_embedding
  ON build_learnings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- Adjust based on total rows (100 = good for 10K rows)
```

### 4. Add Semantic Search Function

```sql
-- Semantic search: find patterns similar to query text
CREATE OR REPLACE FUNCTION search_similar_patterns(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  pattern_id TEXT,
  pattern_name TEXT,
  symptom TEXT,
  fix TEXT,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.pattern_id,
    bl.pattern_name,
    bl.symptom,
    bl.fix,
    1 - (bl.embedding <=> query_embedding) AS similarity
  FROM build_learnings bl
  WHERE bl.embedding IS NOT NULL
    AND 1 - (bl.embedding <=> query_embedding) > match_threshold
  ORDER BY bl.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_similar_patterns TO authenticated;
```

### 5. Update Learnings Service

Add to `/web/lib/bloom/learnings-service.ts`:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchSimilarPatterns(queryText: string, limit = 10) {
  // Generate embedding for query
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: queryText,
  });

  const queryEmbedding = response.data[0].embedding;

  // Search with pgvector
  const { data, error } = await supabase.rpc("search_similar_patterns", {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,  // 70% similarity minimum
    match_count: limit,
  });

  if (error) {
    console.error("[Learnings] Semantic search error:", error);
    return [];
  }

  return data || [];
}
```

### 6. Update Agent Feedback Loop

Modify `bloom/scripts/ops/agentic-build.sh` to call semantic search:

```bash
# After Agent 0 enhancement, before Agent 1
echo "🔍 Checking for similar past patterns..."

SUBMISSION_ID=$(cat "${OUTPUT_DIR}/.bloom-submission-data.json" | jq -r '.id')
CORE_PROBLEM=$(cat "${OUTPUT_DIR}/.bloom-submission-data.json" | jq -r '.core_problem')

SIMILAR_PATTERNS=$(curl -s "https://your-domain.com/api/bloom/learnings/search" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${CORE_PROBLEM}\", \"limit\": 5}")

# Save to file for agents to reference
echo "$SIMILAR_PATTERNS" > "${OUTPUT_DIR}/.similar-patterns.json"
```

Agents can now reference `.similar-patterns.json` to avoid repeating past mistakes.

---

## Maintenance (Ongoing After Activation)

### Auto-embed New Patterns

Update `pushRetrospectiveLearnings()` in `learnings-service.ts`:

```typescript
// After upserting pattern, generate embedding
const text = `${pattern.pattern_name}. ${pattern.symptom}. ${pattern.root_cause}. ${pattern.fix}`;

const response = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: text,
});

const embedding = response.data[0].embedding;

await supabase
  .from("build_learnings")
  .update({ embedding })
  .eq("id", patternId);
```

Now every new pattern gets embedded automatically.

---

## Performance Benchmarks (Expected)

| Query Type | Without pgvector | With pgvector |
|-----------|------------------|---------------|
| Exact keyword match | <10ms | <10ms (same) |
| Semantic similarity | Not possible | ~50ms |
| "Find patterns like X" | Manual review | Instant |

**Storage overhead:** 1536 floats × 4 bytes × 500 patterns = **3MB** (negligible)

---

## Cost Analysis

| Activity | Frequency | Cost per Month |
|----------|-----------|----------------|
| Initial embedding (100 patterns) | One-time | $0.002 |
| New pattern embedding (10/month) | Per build | $0.0002/month |
| Search queries (100/month) | Per search | $0.01/month |
| **Total** | | **~$0.01/month** |

**Conclusion:** Cheaper than a coffee. The bottleneck is engineering time, not cost.

---

## When to Go Beyond pgvector (500+ Builds)

If you hit 500+ builds and pgvector gets slow:

### Option 1: Dedicated Vector DB (Pinecone)
- **Pros:** Managed, scales infinitely, better performance at 100K+ vectors
- **Cons:** $70/month minimum, data lives outside Supabase
- **When:** pgvector queries exceed 200ms

### Option 2: Hybrid Search (pgvector + Postgres FTS)
- **Pros:** Best of both worlds (keyword + semantic)
- **Cons:** More complex query logic
- **When:** You need both exact match AND fuzzy match

### Option 3: Graph Database (Neo4j)
- **Pros:** Find pattern co-occurrence, "What patterns appear together?"
- **Cons:** Different data model, learning curve
- **When:** You need relationship queries ("Which Agent 4 issues cause Agent 5 fixes?")

---

## Summary

**Right now (0-100 builds):** Text search with GIN indexes is enough
**At 100 builds:** Enable pgvector, generate embeddings, add semantic search
**At 500 builds:** Re-evaluate if pgvector is still fast enough

**Action:** Bookmark this doc. Revisit when you hit 100 builds.
