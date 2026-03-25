# Universal Intelligence Engine — Build Pipeline Integration

> **This skill is AUTO-CONSULTED by the Spec Agent, Agent 6.5 (Retro), and Master Plan.**
> It provides intelligence directives that make Bloom builds "smart" — not just CRUD apps.

---

## What This Skill Does

The Intelligence Engine is Bloom's core differentiator. While Lovable/agencies build CRUD apps, Bloom builds apps with **enterprise AI intelligence** baked in from Day 1.

This skill guides agents on:
1. **When** to include intelligence features (based on client intake)
2. **Which** intelligence modules to activate (DNA extraction, scoring, profiling, etc.)
3. **How** to configure them for the client's domain
4. **When** to clean up unused modules (master plan phase)

---

## Intelligence Module Catalog

### Tier 1: Core Intelligence (Always Available)

| Module | What It Does | When to Include |
|--------|-------------|-----------------|
| **Subject DNA Extraction** | Extracts structured intelligence from raw data (profiles, transcripts, forms) | ANY app with "people" to analyze |
| **Scoring Engine** | Multi-dimension scoring with configurable signals and tiers | ANY app that needs to prioritize/rank/qualify |
| **Subject Profiler** | Communication style, personality, decision-making patterns | Apps generating personalized content or messaging |
| **Conversation Analyzer** | Analyzes conversation threads for signals, emotion, intent | Apps with conversations (chat, calls, diagnostics) |
| **Emotional Intelligence** | Detects emotional state and suggests adaptations | Apps where emotional awareness matters (coaching, support) |
| **Predictive Analytics** | Predicts outcomes with risk/winning factors | Apps tracking a pipeline or funnel |
| **Simulation Engine** | Digital twin testing before taking action | Premium: high-stakes decisions only |

### Tier 2: Content Intelligence (Voice + Brand + Quality)

| Module | What It Does | When to Include |
|--------|-------------|-----------------|
| **Voice DNA Service** | Reads voice DNA from DB for authentic content generation | ANY app generating content (posts, emails, messages, reports) |
| **Voice Analyzer** | Linguistic fingerprint extraction with AI-ism detection (71 banned AI words) | ANY app with voice training / Quantum Mirror |
| **Voice Genome Engine** | Incremental Bayesian voice learning ($1M algorithm) — gets BETTER with every sample | ANY app with voice training / Quantum Mirror |
| **Constitution Service** | Org-level brand governance (values, personality, rules, formality) | ANY app where brand consistency matters |
| **Prompt Compiler** | DOE context tier system (minimal/moderate/full) for intelligent prompt assembly | ALL apps using AI generation — this is THE orchestration layer |
| **Prompt Builder** | Full 12-layer DOE adaptive prompt assembly (Constitution→Voice→DNA→Psychographic→Conversation→Emotional→Temporal→Effectiveness→Predictive→Simulation→Examples→Custom) | ALL apps using AI generation — the MASTER prompt assembler |
| **Prompt Loader** | 3-tier prompt resolution: Custom overrides > Runtime prompts > Config defaults, with team member inheritance | ALL apps with customizable prompts |
| **Output Validator** | Quality gates: banned phrases, AI tells, thinking leakage, format artifacts | ALL apps returning AI content to users |

### Tier 3: Adaptive Intelligence (Learning + Optimization)

| Module | What It Does | When to Include |
|--------|-------------|-----------------|
| **Effectiveness Tracker** | Tracks which content styles work for which subject types (learning loop) | Apps doing repeated outreach or content generation |
| **Temporal Intelligence** | Response time patterns, active hours, fatigue scoring, optimal timing | Apps with engagement timing (messaging, emails, follow-ups) |
| **Variation Generator** | Multi-armed bandit (Thompson Sampling) for A/B testing content approaches | Apps needing data-driven content optimization |
| **Journey Pattern Service** | Learns conversion patterns + anti-patterns from successful/failed journeys | Apps with staged pipelines and outcome tracking |
| **Weight Optimizer** | Dynamic signal weighting — learns which signals predict success | Apps with scoring + outcome tracking |
| **Cohort Analyzer** | Time-based cohort analysis — conversion rates, velocity, health scoring | Apps needing analytics dashboards and trend detection |
| **Temporal Decay** | Recency-weighted intelligence — recent patterns valued higher than old | Apps with adaptive learning (prevents stale intelligence) |
| **Learning Context** | Unified intelligence injection — aggregates ALL learned data into prompts | Apps with content generation + adaptive learning |
| **Signal Recorder** | THE INPUT LAYER — records events, triggers downstream intelligence services | ANY app with staged pipeline progression |
| **Conversion Predictor** | Pattern-based outcome prediction using journey patterns + temporal decay | Apps with outcome tracking + enough pattern data |
| **Content Classifier** | AI + rule-based content classification — feeds effectiveness tracker | Apps generating content with effectiveness tracking |

### Tier 0: AI Infrastructure (Foundation Layer)

| Module | What It Does | When to Include |
|--------|-------------|-----------------|
| **AI Service** | Multi-provider LLM router (Anthropic/OpenAI/Gemini) with fallback + retry | ALL apps using AI — THE plumbing layer |
| **Embedding Service** | Vector embeddings + chunking + batch processing for semantic search | Apps with knowledge bases, documents, or semantic search |
| **RAG Service** | Retrieval-Augmented Generation — semantic context injection into prompts | Apps with embeddings (always paired with Embedding Service) |

### Phase 0: Demo Layer (Zero-Database Intelligence)

| Module | What It Does | When to Include |
|--------|-------------|-----------------|
| **Demo Seed Data** | 30 realistic B2B subjects with scores, DNA, profiles, variation arms, voice DNA, constitution | ALWAYS — this IS the sales tool |
| **Demo Data Provider** | Full intelligence getters backed by seed data (no DB, no API, no cost) | ALWAYS — one env var flips demo/production |
| **Demo Intelligence Wrapper** | `getDemoOrReal()` — routes service calls to demo data or real Supabase | ALWAYS — components call this, never raw services |

**How Demo Mode Works:**
```
NEXT_PUBLIC_DEMO_MODE=true  OR  ?demo=true in URL
  → isDemoMode() returns true
  → All *OrDemo() wrappers return seed data
  → Full app works: pipeline view, subject detail, analytics, voice DNA
  → ZERO database. ZERO API calls. ZERO cost.

NEXT_PUBLIC_DEMO_MODE=false (production)
  → isDemoMode() returns false
  → All *OrDemo() wrappers call real Supabase functions
  → Real intelligence engine takes over
```

---

## Phase 0.5: Domain Mapping (Spec Agent — BEFORE Module Detection)

Before selecting modules, the Spec Agent MUST produce a **Domain Mapping** that translates Bloom's universal concepts into the client's specific vocabulary. This is the single most important step — everything downstream depends on it.

### Domain Mapping Template (MANDATORY OUTPUT)

Add this to `01_project_spec.md` BEFORE Intelligence Directives:

```markdown
## Domain Mapping

### Subject Terminology
| Bloom Universal | Client Specific |
|---|---|
| Subject | {e.g., "founder", "lead", "candidate", "student"} |
| Subjects (plural) | {e.g., "founders", "leads"} |
| Subject table | {e.g., "diagnostic_sessions", "leads"} |

### Archetype Mapping
| # | Archetype Name | Description | Key Triggers |
|---|---|---|---|
| 1 | {e.g., "Perfection"} | {one-line} | {3-5 keywords} |
| 2 | ... | ... | ... |
(List ALL archetypes — 5-10 is typical)

### Routing / Tier Mapping
| Tier | Label | Threshold | Action |
|---|---|---|---|
| {e.g., "premium_coaching"} | {display name} | {score ≥ X} | {what happens} |
| {e.g., "skool_community"} | {display name} | {score ≥ 0} | {what happens} |

### Conversation Stage Mapping
| Bloom Generic | Client Specific | Description |
|---|---|---|
| rapport | {e.g., "surface"} | ... |
| exploration | {e.g., "drill"} | ... |
| classification | {e.g., "pattern_lock"} | ... |
| offer | {e.g., "close"} | ... |

### Module Inclusion Manifest
| Module | Include? | Reason |
|---|---|---|
| Subject DNA Extraction | YES/NO | {one-line reason} |
| Scoring Engine | YES/NO | {reason} |
| Subject Profiler | YES/NO | {reason} |
| Conversation Analyzer | YES/NO | {reason} |
| Emotional Intelligence | YES/NO | {reason} |
| Predictive Analytics | YES/NO | {reason} |
| Simulation Engine | YES/NO | {reason — usually NO} |
| Voice DNA Service | YES/NO | {reason} |
| Constitution Service | YES/NO | {reason} |
| Prompt Compiler | YES/NO | {reason} |
| Output Validator | YES/NO | {reason} |
| Effectiveness Tracker | YES/NO | {reason} |
| Temporal Intelligence | YES/NO | {reason} |
| Variation Generator | YES/NO | {reason} |

### NOT APPLICABLE (Explicit Exclusions)
{List modules EXPLICITLY excluded and WHY — just as important as inclusions}
- {e.g., "Voice DNA — app has one voice, not per-subject profiles"}
- {e.g., "Simulation Engine — diagnostic is the real thing, no practice mode"}
```

### Why This Matters (Battle-Test Lesson, Neo 2026-02-13)
When mapping Bloom to the Neo diagnostic app, the hardest part was figuring out what maps and what doesn't. Without this template, agents would include all 25 intelligence services when Neo only needed the demo layer + a preset config. The "NOT APPLICABLE" list saved more time than anything.

---

## Phase 1: Intelligence Detection (Spec Agent)

When generating the project spec, the Spec Agent MUST evaluate which intelligence modules are relevant. **Use the Domain Mapping (Phase 0.5) to drive these decisions — especially the Module Inclusion Manifest.**

### Detection Rules

```
IF intake mentions ANY of these → ENABLE intelligence:
  - "leads", "prospects", "pipeline", "scoring" → sales preset
  - "coaching", "diagnostic", "assessment", "quiz" → coaching preset
  - "revenue ceiling", "identity diagnostic", "neo" → neo-diagnostic preset
  - "candidates", "hiring", "recruitment" → recruitment (adapt sales preset)
  - "students", "learning", "courses" → education (adapt coaching preset)
  - "patients", "health", "wellness" → healthcare (adapt coaching preset)
  - "analyze", "intelligence", "insights" → generic (start from closest preset)

ALWAYS ENABLE (for any AI-generating app):
  - Prompt Compiler (context tiers)
  - Prompt Builder (12-layer DOE assembly)
  - Prompt Loader (3-tier resolution)
  - Output Validator (quality gates)
  - Voice DNA Service (if content generation exists)
  - Voice Analyzer + Voice Genome Engine (if voice training / Quantum Mirror desired)
  - Constitution Service (if brand rules exist)

ENABLE IF repeated engagement exists:
  - Effectiveness Tracker
  - Temporal Intelligence
  - Variation Generator
```

### Spec Agent Directive

Add to `01_project_spec.md` under a new section **"INTELLIGENCE DIRECTIVES"**:

```markdown
## Intelligence Directives

### Enabled Modules
#### Core
- [ ] Subject DNA Extraction (source: {source_types})
- [ ] Scoring Engine (method: {signal_based|dimension_weighted})
- [ ] Subject Profiler
- [ ] Conversation Analyzer
- [ ] Emotional Intelligence
- [ ] Predictive Analytics
- [ ] Simulation Engine

#### Content Intelligence
- [ ] Voice DNA Service (sources: {posts, emails, transcripts})
- [ ] Constitution Service
- [ ] Prompt Compiler (tiers: minimal, moderate, full)
- [ ] Output Validator

#### Adaptive Intelligence
- [ ] Effectiveness Tracker
- [ ] Temporal Intelligence
- [ ] Variation Generator (approaches: {list approaches})

### Config Preset
Base preset: {sales-pipeline|coaching-diagnostic|neo-diagnostic|custom}
Domain: {domain}
Subject type: {singular} / {plural}
Subject table: {table_name}

### Scoring Dimensions
{List the scoring dimensions with weights}

### Archetype Definitions
{List the archetypes if applicable}

### Agent 5 Tasks
- Import `intelligence-registry.ts` → call `getRequiredFiles(enabledIds)` for exact file list
- **DEMO FIRST**: Wire all intelligence UI components using `*OrDemo()` wrappers from `demo/` — this makes the app work instantly without database
- Wire intelligence API routes for enabled modules only
- Generate intelligence.config.ts from this spec
- Run migrations 003a→003d (only the ones needed for enabled modules)
- Connect ScoreCard and DNAPanel components to detail views
- Set up Voice DNA training flow: voice-analyzer + voice-genome-engine (if voice/content generation)
- Configure constitution defaults (if brand governance)
- Wire prompt-builder + prompt-loader into content generation flows
- Wire output-validator before any AI content reaches users
- Wire effectiveness tracking to outcome events
- Initialize variation arms with default approaches
- Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` for demo builds
```

---

## Phase 2: Retro Scan Intelligence (Agent 6.5 / Plan-04)

After the build, Agent 6.5 MUST evaluate the intelligence implementation:

### Evaluation Criteria

1. **Intelligence Completeness**
   - Were all enabled modules actually implemented?
   - Are the API routes wired and functional?
   - Is the intelligence config file generated and correct?
   - Is the prompt compiler wired into content generation flows?
   - Is the output validator running before content reaches users?

2. **Config Quality**
   - Are the scoring dimensions appropriate for this domain?
   - Are the archetypes well-defined with clear identification triggers?
   - Are the tier definitions useful (not too many, not too few)?
   - Are Voice DNA sources correctly identified?
   - Is the constitution populated with meaningful brand rules?

3. **UI Integration**
   - Is there a way to VIEW intelligence data? (ScoreCard, DNAPanel)
   - Is it accessible from the main subject detail view?
   - Does the scoring UI match the screenshot reference (clean dark theme, expandable dimensions)?

4. **Adaptive Loop Quality**
   - Is effectiveness tracking wired to outcome events?
   - Are temporal events being recorded for engagement timing?
   - Are variation arms initialized for content approaches?
   - Is champion promotion configured for the variation generator?

5. **Dead Weight Detection**
   - Are there intelligence modules that were included but aren't relevant?
   - Is the simulation engine included when it shouldn't be?
   - Are there unused preset files that should be removed?
   - Is temporal intelligence included for an app with no timed engagement?

### Output Format (add to 04_retrospective.md)

```markdown
## Intelligence Engine Assessment

### Modules Implemented
| Module | Status | Quality | Notes |
|--------|--------|---------|-------|
| DNA Extraction | OK/MISS | Good/Fair/Poor | ... |
| Scoring | OK/MISS | Good/Fair/Poor | ... |
| Voice DNA | OK/MISS/N/A | Good/Fair/Poor | ... |
| Constitution | OK/MISS/N/A | Good/Fair/Poor | ... |
| Prompt Compiler | OK/MISS | Good/Fair/Poor | ... |
| Output Validator | OK/MISS | Good/Fair/Poor | ... |
| Effectiveness | OK/MISS/N/A | Good/Fair/Poor | ... |
| Temporal | OK/MISS/N/A | Good/Fair/Poor | ... |
| Variation | OK/MISS/N/A | Good/Fair/Poor | ... |
| ... | ... | ... | ... |

### Config Assessment
- Preset used: {name}
- Scoring method: {signal_based|dimension_weighted}
- Dimensions count: {n}
- Archetype count: {n}
- Voice DNA sources: {list}
- Constitution populated: Yes/No
- Quality: {Good/Fair/Poor}

### Adaptive Loop Assessment
- Effectiveness tracking wired: Yes/No
- Temporal events recorded: Yes/No
- Variation arms initialized: Yes/No
- Champion promotion configured: Yes/No

### Cleanup Recommendations
- Remove: {list of unused files}
- Rename: {list of domain-specific renames needed}
- Customize: {list of config values that need client-specific tuning}
```

---

## Phase 3: Master Plan Intelligence Cleanup (Plan-05)

The Master Plan MUST include an intelligence cleanup section that:

### 1. Trims Unused Modules

If a module is disabled in the config, its files should be flagged for removal:

```
IF config.simulation.enabled === false:
  REMOVE: bloom/web/lib/intelligence/core/simulation-engine.ts
  REMOVE: API routes referencing simulation

IF config.conversation.enabled === false:
  REMOVE: bloom/web/lib/intelligence/core/conversation-analyzer.ts
  REMOVE: bloom/web/lib/intelligence/ui/InsightCards.tsx (ConversationStateCard)

IF no content generation:
  REMOVE: bloom/web/lib/intelligence/core/voice-dna-service.ts
  REMOVE: bloom/web/lib/intelligence/core/constitution-service.ts
  REMOVE: bloom/web/lib/intelligence/core/prompt-compiler.ts
  REMOVE: bloom/web/lib/intelligence/core/output-validator.ts

IF no repeated engagement:
  REMOVE: bloom/web/lib/intelligence/core/effectiveness-tracker.ts
  REMOVE: bloom/web/lib/intelligence/core/temporal-service.ts
  REMOVE: bloom/web/lib/intelligence/core/variation-generator.ts
```

### 2. Renames Domain-Specific References

The master plan should include a refactoring directive:

```
RENAME in UI labels:
  "Subject" → "{config.subject.singular}" (e.g., "Participant", "Candidate")
  "Subjects" → "{config.subject.plural}"

RENAME in file names (optional, for clarity):
  subject-dna-extractor.ts → {domain}-dna-extractor.ts (if desired)
```

### 3. Customizes Intelligence Config

Merge any client feedback into the intelligence config:

```
POST-DEMO INTELLIGENCE CUSTOMIZATION:
- Client wants different scoring dimensions? → Update config
- Client wants custom archetypes? → Update config + seed archetypes table
- Client wants different tiers? → Update config
- Client wants specific UI layout? → Customize ScoreCard/DNAPanel
- Client wants custom content approaches? → Update variation generator approaches
- Client wants custom brand rules? → Populate org_constitution table
- Client wants voice training? → Set up voice genome training flow
```

### 4. Output Format (add to 05_master_plan.md)

```markdown
## Intelligence Engine — Phase 2 Roadmap

### Cleanup Tasks
1. Remove: {files to delete}
2. Rename: {domain-specific renames}
3. Customize: {config changes}

### Enhancement Tasks (if client wants more intelligence)
1. {Custom scoring dimension}
2. {Additional archetype}
3. {New signal detection}
4. {Custom content approaches for variation generator}
5. {Voice DNA training with client content samples}

### Priority
Intelligence cleanup: Priority 1 (before launch)
Intelligence enhancements: Priority 2 (post-launch)
```

---

## File Locations

```
bloom/web/lib/intelligence/
├── intelligence-registry.ts           # THE BACKBONE — module registry for build agents
├── index.ts                           # Root barrel (all exports)
├── core/                              # Service layer (domain-agnostic)
│   ├── index.ts                       # Single import point for all services
│   ├── subject-dna-extractor.ts       # DNA extraction from any data
│   ├── subject-scorer.ts              # Configurable scoring engine
│   ├── subject-profiler.ts            # Communication/personality profiling
│   ├── conversation-analyzer.ts       # Conversation state + emotion
│   ├── predictive-service.ts          # Outcome prediction
│   ├── simulation-engine.ts           # Digital twin simulation
│   ├── voice-dna-service.ts           # Quantum Mirror — voice DNA reader
│   ├── voice-analyzer.ts              # Linguistic fingerprint + AI-ism detection
│   ├── voice-genome-engine.ts         # Incremental Bayesian voice learning
│   ├── constitution-service.ts        # Brand governance + personality mapping
│   ├── prompt-compiler.ts             # DOE context tier prompt assembly
│   ├── prompt-builder.ts              # Full 12-layer adaptive prompt assembly
│   ├── prompt-loader.ts               # 3-tier prompt resolution (overrides > runtime > defaults)
│   ├── output-validator.ts            # Quality gates (banned phrases, AI tells)
│   ├── effectiveness-tracker.ts       # Style × Subject learning matrix
│   ├── temporal-service.ts            # Timing patterns + fatigue scoring
│   ├── variation-generator.ts         # Thompson Sampling A/B testing
│   ├── journey-pattern-service.ts     # Conversion + anti-pattern learning
│   ├── weight-optimizer.ts            # Dynamic signal weight optimization
│   ├── cohort-analyzer.ts             # Time-based cohort performance analysis
│   ├── temporal-decay-service.ts      # Recency-weighted intelligence
│   ├── learning-context.ts            # Unified intelligence injection
│   ├── signal-recorder.ts            # Event input layer (feeds all services)
│   ├── conversion-predictor.ts       # Pattern-based outcome prediction
│   └── content-classifier.ts         # AI + rule-based content classification
├── demo/                              # Phase 0 — works without database
│   ├── index.ts                       # Demo barrel exports
│   ├── demo-seed-data.ts             # 30 realistic subjects + effectiveness + voice DNA
│   ├── demo-data-provider.ts         # Full intelligence getters from seed data
│   └── demo-intelligence-wrapper.ts  # getDemoOrReal() routing layer
├── config/
│   ├── intelligence.config.ts         # Config interface + loader
│   └── presets/
│       ├── index.ts                   # Preset registry + domain matcher
│       ├── sales-pipeline.ts          # IP's proven sales config
│       ├── coaching-diagnostic.ts     # Coaching/assessment config
│       └── neo-diagnostic.ts          # Neo revenue ceiling diagnostic (10 archetypes, 2-bucket routing)
├── ui/
│   ├── index.ts                       # UI exports
│   ├── ScoreCard.tsx                  # Universal score display
│   ├── DNAPanel.tsx                   # Universal DNA profile display
│   └── InsightCards.tsx               # Predictive + conversation cards
└── types/
    └── intelligence.types.ts          # All TypeScript types

bloom/web/lib/ai/                          # AI Infrastructure (Foundation)
├── ai-service.ts                      # Multi-provider LLM router (THE plumbing)
├── embedding-service.ts               # Vector embeddings + chunking
└── rag-service.ts                     # Retrieval-Augmented Generation

bloom/supabase/migrations/
├── 003a_core_intelligence.sql         # Core (5 tables): subject_intelligence, logs, config, effectiveness, archetypes
├── 003b_voice_brand.sql               # Voice & Brand (5): voice_genomes, constitution, fingerprints, prompts
├── 003c_adaptive_learning.sql         # Adaptive (6): content_effectiveness, temporal, variation, patterns
└── 003d_vector_search.sql             # Vector (1+RPC): embeddings + match_documents

bloom/web/app/api/intelligence/
├── extract-dna/route.ts               # DNA extraction endpoint
├── score/route.ts                     # Scoring endpoint
└── analyze/route.ts                   # Full analysis pipeline
```

### Database Tables (003a → 003d migrations)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `subject_intelligence` | DNA + Score + Profile + Conversation + Prediction per subject |
| 2 | `intelligence_execution_logs` | AI call tracking (debugging + learning) |
| 3 | `intelligence_configs` | Per-org intelligence config (JSONB) |
| 4 | `intelligence_effectiveness` | General outcome tracking |
| 5 | `intelligence_archetypes` | Custom archetype definitions |
| 6 | `voice_genomes` | Voice DNA (Quantum Mirror v2.0) — incremental Bayesian genome |
| 7 | `org_constitution` | Brand governance (values, personality, rules) |
| 8 | `content_effectiveness` | Style x Subject Type learning matrix |
| 9 | `temporal_events` | Raw engagement timing events |
| 10 | `temporal_patterns` | Aggregated timing patterns |
| 11 | `variation_arms` | Thompson Sampling bandit arms |
| 12 | `content_voice_fingerprints` | Voice fingerprints (raw analysis snapshots) |
| 13 | `prompt_templates` | Client schema overrides (HIGHEST priority prompts) |
| 14 | `runtime_prompts` | AI-generated prompts per org (second priority) |
| 15 | `conversion_patterns` | Successful journey patterns with confidence scoring |
| 16 | `anti_patterns` | Failure patterns to avoid (learned from losses) |
| 17 | `embeddings` | Vector embeddings for semantic search + RAG |

---

## Quick Reference for Agents

> **THE BACKBONE**: `intelligence-registry.ts` is the programmatic single source of truth.
> Import it to query which modules are enabled, what files are needed, and what to clean up.
> Use `detectModulesFromIntake(intakeText)` to auto-detect relevant modules from client data.
> Use `getRequiredFiles(enabledIds)` to get the exact file list for any build.
> Use `getCleanupFiles(enabledIds)` to identify files that should be removed.

- **Spec Agent**: Read registry → `detectModulesFromIntake()` → add Intelligence Directives to spec
- **Agent 1 (Blueprint)**: Use intelligence types in TypeScript types
- **Agent 3 (Shell)**: Include intelligence UI components in layouts
- **Agent 4 (Pages)**: Wire ScoreCard/DNAPanel into detail views
- **Agent 5 (Welder)**: Read registry → `getRequiredFiles()` → wire only needed services, generate config, run migration, set up Voice DNA + Constitution + Prompt system
- **Agent 6.5 (Mentor)**: Read registry → evaluate implementation vs. enabled modules, check adaptive loop quality
- **Master Plan**: Read registry → `getCleanupFiles()` → intelligence cleanup + enhancement roadmap
