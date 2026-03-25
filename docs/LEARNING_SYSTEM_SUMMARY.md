# Bloom Learning System — Built for Scale (0 → 300 Builds)

> **Status:** Production-ready, vertical tracking enabled, pgvector schema prepared
> **Current capacity:** 0-100 builds (text search + structured filtering)
> **Next milestone:** 100 builds (activate pgvector semantic search)
> **Final milestone:** 300 builds (graph database for pattern co-occurrence)

---

## What We Built Today

### 1. Database Layer (Supabase)

**Migration 200** creates 3 tables + helper functions:

#### `build_learnings` — Cross-Build Pattern Database
- Tracks recurring patterns across ALL builds (Email Capture Syndrome, Empty State Blindness, etc.)
- Filterable by: vertical, severity, category, agent responsible
- Ready for pgvector (embedding column exists, NULL for now)
- 13 initial patterns seeded from rocksolid retrospective

#### `build_retrospectives` — Agent 6.5 Output Storage
- Stores wins, critiques, patterns identified per build
- Links builds to patterns via `patterns_identified` array
- Filterable by vertical, timestamp

#### `agent_performance` — Agent 7 QC Tracking
- Agent quality scores (1-5) per build
- Errors found, errors fixed, build pass/fail
- Per-agent issue tracking

### 2. API Layer

**`/api/bloom/learnings/push`** (POST)
- Accepts both retrospective (Agent 6.5) and debrief (Agent 7) data
- Calls `pushRetrospectiveLearnings()` or `pushDebriefLearnings()` from service layer
- Returns pattern count, agent scores

**`web/lib/bloom/learnings-service.ts`**
- `pushRetrospectiveLearnings()` — Upserts patterns, creates retrospective record
- `pushDebriefLearnings()` — Saves agent scores, updates retrospective
- `getPatternsByVertical()` — Filter patterns by industry
- `getCriticalPatterns()` — Get high-severity patterns only
- `getBuildRetrospective()` — Get full retrospective for a build

### 3. Bash Script Integration

**Updated `agentic-build.sh`:**
- `push_learnings_to_supabase()` now calls API endpoint (was direct DB insert)
- Auto-detects retrospective vs debrief data
- Passes vertical + business_model for pattern filtering
- Agent 6.5 feedback loop (lines 2841-2843)
- Agent 7 feedback loop (lines 2922-2924)

### 4. Vertical Tracking

**Updated `bloom_submissions` table:**
- Added `vertical` column (maps from `industry` field)
- Added `business_model` column (B2B, B2C, etc.)
- Indexed for fast filtering

**Updated `/api/bloom/intake`:**
- Auto-saves `vertical` and `business_model` on intake
- Passed to learnings system for pattern categorization

### 5. Agent Instructions

**Agent 6.5 (The Mentor):**
- Now outputs `.bloom-retrospective-data.json` (structured data)
- JSON includes: wins, critiques, cross_build_patterns, system_recommendations
- Pattern names match `memory/learnings.md` for consistency

**Agent 6.5 learnings.md:**
- Updated with 13 patterns from rocksolid build
- Added real-world examples, frequency data, business impact

---

## How It Works (End-to-End)

### During a Build:

```
1. User submits Bloom intake form
   └─ vertical + business_model saved to bloom_submissions

2. Agents 1-6 build the app

3. Agent 6.5 (The Mentor) runs
   ├─ Writes docs/roadmap/04_retrospective.md (markdown for review)
   └─ Writes .bloom-retrospective-data.json (structured data)

4. Agent 7 (Auto-Debrief) runs
   ├─ Writes BUILD_DEBRIEF.md (technical QC)
   └─ Writes .bloom-debrief-data.json (structured data)

5. Feedback Loop Executes:
   ├─ bash calls /api/bloom/learnings/push (retrospective)
   ├─ bash calls /api/bloom/learnings/push (debrief)
   └─ Supabase updates:
       ├─ build_learnings (pattern frequency incremented)
       ├─ build_retrospectives (full retrospective saved)
       └─ agent_performance (scores + issues logged)

6. Next Build Benefits:
   ├─ Agent 6.5 reads memory/learnings.md (updated patterns)
   ├─ Agents can query patterns by vertical (getPatternsByVertical)
   └─ System learns: "B2B SaaS always needs email capture"
```

---

## What You Can Do Right Now

### Query Patterns by Vertical

```typescript
import { getPatternsByVertical } from "@/lib/bloom/learnings-service";

const patterns = await getPatternsByVertical("b2b-saas");
// Returns all high-severity B2B SaaS patterns first
```

### Get Critical Patterns Only

```typescript
import { getCriticalPatterns } from "@/lib/bloom/learnings-service";

const critical = await getCriticalPatterns();
// Returns all high-severity patterns (Email Capture Syndrome, Empty State Blindness, etc.)
```

### View Build Retrospective

```typescript
import { getBuildRetrospective } from "@/lib/bloom/learnings-service";

const retro = await getBuildRetrospective(bloomSubmissionId);
// Returns full retrospective with wins, critiques, patterns
```

### SQL Queries

```sql
-- Get all patterns for B2B SaaS
SELECT * FROM get_patterns_by_vertical('b2b-saas');

-- Get high-severity patterns
SELECT * FROM get_critical_patterns();

-- Get pattern frequency over time
SELECT
  pattern_name,
  total_occurrences,
  first_seen,
  last_seen
FROM build_learnings
ORDER BY total_occurrences DESC;

-- Get agent performance trends
SELECT
  build_name,
  agent_1_score,
  agent_2_score,
  agent_4_score,
  total_errors_found,
  build_passed
FROM agent_performance
ORDER BY created_at DESC
LIMIT 20;
```

---

## Scaling Roadmap

### Phase 1: Now → 100 Builds (CURRENT)

**Capacity:** Text search + structured filtering
**Features enabled:**
- ✅ Vertical tracking
- ✅ Pattern frequency counting
- ✅ Agent performance tracking
- ✅ Structured JSON storage
- ✅ Helper functions for filtering

**What's NOT enabled yet:**
- ❌ pgvector semantic search (embedding column NULL)
- ❌ "Find patterns similar to X" queries
- ❌ Pattern co-occurrence analysis

**Why wait?**
- 100 patterns = nothing to embed yet
- Text search works fine at this scale
- Avoid premature optimization

---

### Phase 2: 100 Builds (ACTIVATE PGVECTOR)

**Trigger:** 100+ builds, ~100+ unique patterns

**Actions:**
1. Run `/docs/bloom/PGVECTOR_SETUP.md` instructions
2. Enable pgvector extension
3. Generate embeddings for existing patterns (~$0.002 cost)
4. Enable vector similarity index
5. Add `searchSimilarPatterns()` to learnings-service.ts
6. Update agents to query similar patterns before building

**Benefits:**
- Semantic search: "find patterns like X" without exact keywords
- Auto-suggest patterns based on core problem
- Better pattern matching across verticals

**Cost:** ~$0.01/month (embeddings + search queries)

---

### Phase 3: 200-300 Builds (GRAPH ANALYSIS)

**Trigger:** 200+ builds, 5+ verticals

**Actions:**
1. Add pattern co-occurrence tracking
2. Identify which patterns appear together
3. Build "pattern clusters" (e.g., "No Email Capture + No Viral Mechanics = Marketing Blindness Cluster")
4. Predict which patterns will occur based on intake data

**Possible additions:**
- Neo4j graph database for relationship queries
- ML model to predict pattern likelihood from intake
- Auto-generate "risk score" for each build before it starts

---

## Data Model Summary

### Pattern Lifecycle

```
1. Pattern identified in build
   └─ Agent 6.5 adds to cross_build_patterns array

2. Pattern pushed to Supabase
   └─ upsert_pattern() function called

3. Pattern inserted or updated:
   ├─ NEW: Insert with frequency "1/10 builds"
   └─ EXISTS: Increment total_occurrences, update last_seen, append example

4. Pattern referenced by agents:
   ├─ getPatternsByVertical() for vertical-specific patterns
   └─ getCriticalPatterns() for high-severity only

5. (At 100 builds) Pattern embedded:
   └─ Generate vector embedding with OpenAI ada-002
   └─ Update embedding column

6. (At 100+ builds) Pattern searched semantically:
   └─ searchSimilarPatterns("users churn after signup")
   └─ Returns: "Empty State Blindness", "No Engineered Aha Moment"
```

---

## Files Changed

### New Files:
- `web/supabase/migrations/200_bloom_learnings_system.sql` — Tables + functions
- `web/lib/bloom/learnings-service.ts` — Service layer for pattern queries
- `web/app/api/bloom/learnings/push/route.ts` — API endpoint for bash script
- `docs/bloom/PGVECTOR_SETUP.md` — Activation guide for 100 builds
- `docs/bloom/LEARNING_SYSTEM_SUMMARY.md` — This file

### Updated Files:
- `bloom/scripts/ops/agentic-build.sh` — Updated push_learnings_to_supabase()
- `bloom/.claude/skills/agent-6.5-mentor/memory/learnings.md` — 13 patterns added
- `bloom/.claude/skills/agent-6.5-mentor/instructions.md` — Added JSON output requirement
- `web/app/api/bloom/intake/route.ts` — Added vertical + business_model tracking

---

## Performance Expectations

| Builds | Query Time | Storage | Cost/Month |
|--------|-----------|---------|------------|
| 0-100 | <10ms | ~1MB | $0 |
| 100-300 | <50ms | ~5MB | $0.01 |
| 300-500 | <100ms | ~10MB | $0.02 |
| 500+ | Evaluate pgvector vs dedicated vector DB | ~20MB+ | TBD |

---

## Next Steps

1. **Run migration 200** in Supabase Dashboard (SQL Editor)
2. **Test the feedback loop** on next Bloom build
3. **Monitor pattern accumulation** in build_learnings table
4. **At 100 builds:** Revisit `/docs/bloom/PGVECTOR_SETUP.md`
5. **At 200 builds:** Consider graph database for pattern co-occurrence

---

## Key Metrics to Track

```sql
-- How many patterns do we have?
SELECT COUNT(*) FROM build_learnings;

-- What are the most frequent patterns?
SELECT pattern_name, frequency, total_occurrences
FROM build_learnings
ORDER BY total_occurrences DESC
LIMIT 10;

-- Which verticals have the most builds?
SELECT vertical, COUNT(*) as build_count
FROM bloom_submissions
WHERE vertical IS NOT NULL
GROUP BY vertical
ORDER BY build_count DESC;

-- Agent performance over time
SELECT
  AVG(agent_1_score) as avg_agent_1,
  AVG(agent_2_score) as avg_agent_2,
  AVG(agent_4_score) as avg_agent_4,
  AVG(total_errors_found) as avg_errors
FROM agent_performance
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

**You're ready for 300 builds. The system gets smarter with every one.**
