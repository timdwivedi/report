/**
 * Intelligence Registry — THE BACKBONE
 *
 * This is the single source of truth that connects the build pipeline agents
 * to the intelligence module library. Every intelligence file is registered here
 * with its metadata, dependencies, and activation rules.
 *
 * WHO READS THIS:
 *   - Spec Agent: Uses detection rules to decide which modules to enable
 *   - Agent 5 (Welder): Reads enabled modules to know which files to wire
 *   - Agent 6.5 (Mentor): Reads to evaluate what was implemented vs what should be
 *   - Master Plan: Reads to know what to clean up vs keep
 *   - Runtime code: Can import and query programmatically
 *
 * HOW IT WORKS:
 *   1. Spec Agent reads client intake → matches against detection rules
 *   2. Generates intelligence directives with enabled module IDs
 *   3. Agent 5 imports this registry → filters by enabled IDs → gets file lists
 *   4. Agent 6.5 compares enabled vs implemented → generates assessment
 *   5. Master Plan uses registry to identify cleanup targets
 */

// ============================================================================
// MODULE REGISTRY
// ============================================================================

export interface IntelligenceModule {
  /** Unique module identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** What this module does (1 line) */
  description: string;

  /** Module tier: determines inclusion priority */
  tier: 1 | 2 | 3;

  /** Category for grouping */
  category: "core" | "content" | "adaptive" | "infrastructure";

  /** Files that belong to this module (relative to bloom/web/lib/intelligence/) */
  files: string[];

  /** Other module IDs this depends on */
  dependencies: string[];

  /** Database tables this module needs (from 003_intelligence_engine.sql) */
  tables: string[];

  /** Config flags that enable this module */
  enabledWhen: string[];

  /** Keywords in client intake that suggest this module is needed */
  detectionKeywords: string[];

  /** Whether this module should ALWAYS be included */
  alwaysInclude: boolean;
}

export const INTELLIGENCE_MODULES: IntelligenceModule[] = [
  // ========================================================================
  // TIER 1: CORE INTELLIGENCE (Subject Understanding)
  // ========================================================================
  {
    id: "dna-extraction",
    name: "Subject DNA Extraction",
    description: "Extracts structured intelligence from raw data (profiles, transcripts, forms)",
    tier: 1,
    category: "core",
    files: ["core/subject-dna-extractor.ts"],
    dependencies: [],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.dna.dimensions.length > 0"],
    detectionKeywords: ["leads", "prospects", "people", "analyze", "profiles", "participants", "candidates", "students", "patients"],
    alwaysInclude: false,
  },
  {
    id: "scoring",
    name: "Scoring Engine",
    description: "Multi-dimension scoring with configurable signals/dimensions and tier mapping",
    tier: 1,
    category: "core",
    files: ["core/subject-scorer.ts"],
    dependencies: ["dna-extraction"],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.scoring.signals.length > 0 || config.scoring.dimensions.length > 0"],
    detectionKeywords: ["scoring", "ranking", "qualifying", "prioritize", "pipeline", "funnel", "assessment"],
    alwaysInclude: false,
  },
  {
    id: "profiling",
    name: "Subject Profiler",
    description: "Communication style, personality patterns, decision-making analysis",
    tier: 1,
    category: "core",
    files: ["core/subject-profiler.ts"],
    dependencies: ["dna-extraction"],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.profiling.enabled !== false"],
    detectionKeywords: ["personalized", "messaging", "communication", "outreach", "coaching", "support"],
    alwaysInclude: false,
  },
  {
    id: "conversation",
    name: "Conversation Analyzer",
    description: "Analyzes threads for signals, emotion, intent, and next-best-action",
    tier: 1,
    category: "core",
    files: ["core/conversation-analyzer.ts"],
    dependencies: [],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.conversation.signal_types.length > 0"],
    detectionKeywords: ["chat", "conversations", "calls", "diagnostics", "support", "messaging", "DMs", "interviews"],
    alwaysInclude: false,
  },
  {
    id: "predictive",
    name: "Predictive Analytics",
    description: "Predicts outcomes with probability, risk factors, and winning factors",
    tier: 1,
    category: "core",
    files: ["core/predictive-service.ts"],
    dependencies: ["dna-extraction", "scoring"],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.prediction.enabled !== false"],
    detectionKeywords: ["pipeline", "funnel", "forecast", "prediction", "conversion", "outcomes"],
    alwaysInclude: false,
  },
  {
    id: "simulation",
    name: "Simulation Engine",
    description: "Digital twin persona generation + wargame testing before action",
    tier: 1,
    category: "core",
    files: ["core/simulation-engine.ts"],
    dependencies: ["dna-extraction", "profiling"],
    tables: ["subject_intelligence"],
    enabledWhen: ["config.simulation.enabled === true"],
    detectionKeywords: ["simulation", "wargame", "test message", "high-stakes"],
    alwaysInclude: false,
  },

  // ========================================================================
  // TIER 2: CONTENT INTELLIGENCE (Voice + Brand + Quality)
  // ========================================================================
  {
    id: "voice-dna",
    name: "Voice DNA Service",
    description: "Reads voice DNA from database for authentic content generation",
    tier: 2,
    category: "content",
    files: ["core/voice-dna-service.ts"],
    dependencies: [],
    tables: ["voice_genomes", "content_voice_fingerprints"],
    enabledWhen: ["any content generation exists"],
    detectionKeywords: ["content", "posts", "emails", "messages", "authentic", "voice", "writing"],
    alwaysInclude: false,
  },
  {
    id: "voice-training",
    name: "Voice Genome Training Engine",
    description: "Learns user's voice from writing samples via incremental Bayesian refinement",
    tier: 2,
    category: "content",
    files: ["core/voice-genome-engine.ts", "core/voice-analyzer.ts"],
    dependencies: ["voice-dna"],
    tables: ["voice_genomes", "content_voice_fingerprints"],
    enabledWhen: ["voice training / Quantum Mirror is desired"],
    detectionKeywords: ["voice cloning", "quantum mirror", "voice training", "writing style", "authentic voice"],
    alwaysInclude: false,
  },
  {
    id: "constitution",
    name: "Constitution Service",
    description: "Org-level brand governance (values, personality, rules, formality)",
    tier: 2,
    category: "content",
    files: ["core/constitution-service.ts"],
    dependencies: [],
    tables: ["org_constitution"],
    enabledWhen: ["brand rules exist"],
    detectionKeywords: ["brand", "values", "personality", "tone", "guidelines", "rules"],
    alwaysInclude: false,
  },
  {
    id: "prompt-compiler",
    name: "Prompt Compiler",
    description: "DOE context tier system — assembles all intelligence into prompts",
    tier: 2,
    category: "content",
    files: ["core/prompt-compiler.ts"],
    dependencies: ["voice-dna", "constitution"],
    tables: [],
    enabledWhen: ["any AI content generation"],
    detectionKeywords: ["AI", "generate", "content", "prompts"],
    alwaysInclude: true,
  },
  {
    id: "prompt-builder",
    name: "Adaptive Prompt Builder",
    description: "Full 12-layer DOE prompt assembly — Constitution through Custom sections",
    tier: 2,
    category: "content",
    files: ["core/prompt-builder.ts"],
    dependencies: ["prompt-compiler", "voice-dna", "constitution"],
    tables: [],
    enabledWhen: ["any AI content generation"],
    detectionKeywords: ["AI", "generate", "content", "prompts", "adaptive"],
    alwaysInclude: true,
  },
  {
    id: "prompt-loader",
    name: "Prompt Loader & DB Service",
    description: "3-tier prompt resolution: overrides > runtime > config defaults, with team inheritance",
    tier: 2,
    category: "infrastructure",
    files: ["core/prompt-loader.ts"],
    dependencies: ["prompt-compiler"],
    tables: ["intelligence_configs", "prompt_templates", "runtime_prompts"],
    enabledWhen: ["prompt templates or runtime prompts exist"],
    detectionKeywords: ["prompts", "templates", "overrides", "customization"],
    alwaysInclude: true,
  },
  {
    id: "output-validator",
    name: "Output Validator",
    description: "Quality gates: banned phrases, AI tells, thinking leakage, format artifacts",
    tier: 2,
    category: "content",
    files: ["core/output-validator.ts"],
    dependencies: [],
    tables: [],
    enabledWhen: ["any AI content returned to users"],
    detectionKeywords: ["quality", "validation", "content"],
    alwaysInclude: true,
  },

  // ========================================================================
  // TIER 3: ADAPTIVE INTELLIGENCE (Learning + Optimization)
  // ========================================================================
  {
    id: "effectiveness",
    name: "Effectiveness Tracker",
    description: "Style x Subject Type learning matrix — tracks what works for whom",
    tier: 3,
    category: "adaptive",
    files: ["core/effectiveness-tracker.ts"],
    dependencies: [],
    tables: ["content_effectiveness"],
    enabledWhen: ["repeated outreach or content generation"],
    detectionKeywords: ["outreach", "campaigns", "messaging", "emails", "follow-ups", "sequences"],
    alwaysInclude: false,
  },
  {
    id: "temporal",
    name: "Temporal Intelligence",
    description: "Response time patterns, active hours, fatigue scoring, optimal timing",
    tier: 3,
    category: "adaptive",
    files: ["core/temporal-service.ts"],
    dependencies: [],
    tables: ["temporal_events", "temporal_patterns"],
    enabledWhen: ["timed engagement exists"],
    detectionKeywords: ["timing", "follow-up", "scheduling", "engagement", "responses", "messaging"],
    alwaysInclude: false,
  },
  {
    id: "variation",
    name: "Variation Generator",
    description: "Thompson Sampling A/B testing for content approach optimization",
    tier: 3,
    category: "adaptive",
    files: ["core/variation-generator.ts"],
    dependencies: ["effectiveness"],
    tables: ["variation_arms"],
    enabledWhen: ["content optimization desired"],
    detectionKeywords: ["A/B", "testing", "optimization", "variations", "approaches"],
    alwaysInclude: false,
  },
  {
    id: "journey-patterns",
    name: "Journey Pattern Service",
    description: "Learns conversion patterns + anti-patterns from successful/failed subject journeys",
    tier: 3,
    category: "adaptive",
    files: ["core/journey-pattern-service.ts"],
    dependencies: ["temporal"],
    tables: ["conversion_patterns", "anti_patterns", "temporal_events"],
    enabledWhen: ["staged pipeline with outcome tracking exists"],
    detectionKeywords: ["pipeline", "funnel", "patterns", "conversion", "journey", "stages"],
    alwaysInclude: false,
  },
  {
    id: "weight-optimizer",
    name: "Weight Optimizer",
    description: "Dynamic signal weighting — learns which signals actually predict success",
    tier: 3,
    category: "adaptive",
    files: ["core/weight-optimizer.ts"],
    dependencies: ["scoring"],
    tables: ["temporal_events", "intelligence_configs"],
    enabledWhen: ["scoring with outcome tracking exists"],
    detectionKeywords: ["scoring", "signals", "weights", "optimization", "prediction"],
    alwaysInclude: false,
  },
  {
    id: "cohort-analyzer",
    name: "Cohort Analyzer",
    description: "Time-based cohort analysis — conversion rates, velocity, health scoring",
    tier: 3,
    category: "adaptive",
    files: ["core/cohort-analyzer.ts"],
    dependencies: ["temporal"],
    tables: ["subject_intelligence", "temporal_events"],
    enabledWhen: ["pipeline with time-based tracking exists"],
    detectionKeywords: ["analytics", "dashboard", "trends", "performance", "benchmarks", "cohorts"],
    alwaysInclude: false,
  },
  {
    id: "temporal-decay",
    name: "Temporal Decay Service",
    description: "Recency-weighted intelligence — recent patterns valued higher than old ones",
    tier: 3,
    category: "adaptive",
    files: ["core/temporal-decay-service.ts"],
    dependencies: ["effectiveness"],
    tables: ["content_effectiveness", "conversion_patterns"],
    enabledWhen: ["adaptive learning is enabled"],
    detectionKeywords: ["recency", "freshness", "decay", "trending", "aging"],
    alwaysInclude: false,
  },
  {
    id: "learning-context",
    name: "Learning Context Service",
    description: "Unified intelligence injection — aggregates all learned data into prompt blocks",
    tier: 3,
    category: "adaptive",
    files: ["core/learning-context.ts"],
    dependencies: ["effectiveness", "variation"],
    tables: ["subject_intelligence", "content_effectiveness", "variation_arms", "anti_patterns"],
    enabledWhen: ["content generation with adaptive learning exists"],
    detectionKeywords: ["learning", "intelligence", "adaptive", "personalized", "context"],
    alwaysInclude: false,
  },

  // ========================================================================
  // EVENT & PREDICTION LAYER
  // ========================================================================
  {
    id: "signal-recorder",
    name: "Signal Recorder",
    description: "THE INPUT LAYER — records events and triggers downstream intelligence services",
    tier: 2,
    category: "core",
    files: ["core/signal-recorder.ts"],
    dependencies: ["scoring", "journey-patterns", "weight-optimizer", "content-classifier", "effectiveness"],
    tables: ["temporal_events", "subject_intelligence", "intelligence_execution_logs"],
    enabledWhen: ["ANY pipeline with staged progression exists"],
    detectionKeywords: ["pipeline", "stages", "progression", "events", "signals", "tracking"],
    alwaysInclude: false,
  },
  {
    id: "conversion-predictor",
    name: "Conversion Predictor",
    description: "Pattern-based outcome prediction using journey patterns + temporal decay",
    tier: 3,
    category: "adaptive",
    files: ["core/conversion-predictor.ts"],
    dependencies: ["journey-patterns", "temporal-decay"],
    tables: ["conversion_patterns", "temporal_events"],
    enabledWhen: ["pipeline with outcome tracking + enough patterns (50+)"],
    detectionKeywords: ["predict", "forecast", "probability", "conversion", "outcome"],
    alwaysInclude: false,
  },
  {
    id: "content-classifier",
    name: "Content Classifier",
    description: "AI + rule-based content classification — feeds effectiveness tracker",
    tier: 2,
    category: "content",
    files: ["core/content-classifier.ts"],
    dependencies: ["effectiveness"],
    tables: ["content_effectiveness"],
    enabledWhen: ["content generation with effectiveness tracking exists"],
    detectionKeywords: ["classify", "categorize", "style", "tone", "content type"],
    alwaysInclude: false,
  },

  // ========================================================================
  // AI INFRASTRUCTURE (lives in lib/ai/, referenced here for agent routing)
  // ========================================================================
  {
    id: "ai-service",
    name: "AI Service (Provider Router)",
    description: "Multi-provider LLM router (Anthropic/OpenAI/Gemini) with fallback + retry",
    tier: 1,
    category: "infrastructure",
    files: ["../ai/ai-service.ts"],
    dependencies: [],
    tables: [],
    enabledWhen: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
  {
    id: "embeddings",
    name: "Embedding Service",
    description: "Vector embeddings + chunking + batch processing for semantic search",
    tier: 2,
    category: "infrastructure",
    files: ["../ai/embedding-service.ts"],
    dependencies: ["ai-service"],
    tables: ["embeddings"],
    enabledWhen: ["semantic search, RAG, or knowledge base exists"],
    detectionKeywords: ["search", "knowledge", "embeddings", "semantic", "RAG", "documents"],
    alwaysInclude: false,
  },
  {
    id: "rag",
    name: "RAG Service",
    description: "Retrieval-Augmented Generation — semantic context injection into prompts",
    tier: 2,
    category: "infrastructure",
    files: ["../ai/rag-service.ts"],
    dependencies: ["embeddings"],
    tables: ["embeddings"],
    enabledWhen: ["embeddings is enabled"],
    detectionKeywords: ["RAG", "retrieval", "knowledge", "context", "documents"],
    alwaysInclude: false,
  },

  // ========================================================================
  // DEMO LAYER (Phase 0 — works without database)
  // ========================================================================
  {
    id: "demo",
    name: "Demo Data Layer",
    description: "Full intelligence demo with realistic data — zero DB, zero API, zero cost",
    tier: 1,
    category: "infrastructure",
    files: [
      "demo/index.ts",
      "demo/demo-seed-data.ts",
      "demo/demo-data-provider.ts",
      "demo/demo-intelligence-wrapper.ts",
    ],
    dependencies: [],
    tables: [],
    enabledWhen: ["NEXT_PUBLIC_DEMO_MODE=true or ?demo=true in URL"],
    detectionKeywords: ["demo", "prototype", "preview", "showcase", "sales demo"],
    alwaysInclude: true,
  },

  // ========================================================================
  // INFRASTRUCTURE (Always included)
  // ========================================================================
  {
    id: "types",
    name: "Type System",
    description: "All TypeScript interfaces for the intelligence engine",
    tier: 1,
    category: "infrastructure",
    files: ["types/intelligence.types.ts"],
    dependencies: [],
    tables: [],
    enabledWhen: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
  {
    id: "config",
    name: "Configuration System",
    description: "IntelligenceConfig interface + preset loader + domain matcher",
    tier: 1,
    category: "infrastructure",
    files: [
      "config/intelligence.config.ts",
      "config/presets/index.ts",
      "config/presets/sales-pipeline.ts",
      "config/presets/coaching-diagnostic.ts",
    ],
    dependencies: [],
    tables: ["intelligence_configs"],
    enabledWhen: [],
    detectionKeywords: [],
    alwaysInclude: true,
  },
  {
    id: "ui",
    name: "UI Components",
    description: "ScoreCard, DNAPanel, InsightCards — config-driven display components",
    tier: 1,
    category: "infrastructure",
    files: [
      "ui/ScoreCard.tsx",
      "ui/DNAPanel.tsx",
      "ui/InsightCards.tsx",
      "ui/index.ts",
    ],
    dependencies: ["types", "config"],
    tables: [],
    enabledWhen: ["scoring OR dna-extraction is enabled"],
    detectionKeywords: [],
    alwaysInclude: false,
  },
];

// ============================================================================
// QUERY HELPERS (Used by agents and runtime code)
// ============================================================================

/** Get all modules that should be included for a build */
export function getEnabledModules(enabledIds: string[]): IntelligenceModule[] {
  const enabled = new Set(enabledIds);

  // Always include infrastructure + always-include modules
  const result = INTELLIGENCE_MODULES.filter(
    (m) => m.alwaysInclude || enabled.has(m.id)
  );

  // Resolve dependencies
  const resolved = new Set(result.map((m) => m.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const mod of result) {
      for (const dep of mod.dependencies) {
        if (!resolved.has(dep)) {
          const depModule = INTELLIGENCE_MODULES.find((m) => m.id === dep);
          if (depModule) {
            result.push(depModule);
            resolved.add(dep);
            changed = true;
          }
        }
      }
    }
  }

  return result;
}

/** Get all files needed for a set of enabled modules */
export function getRequiredFiles(enabledIds: string[]): string[] {
  const modules = getEnabledModules(enabledIds);
  const files = new Set<string>();
  for (const mod of modules) {
    for (const file of mod.files) {
      files.add(file);
    }
  }
  // Always include index files
  files.add("core/index.ts");
  files.add("index.ts");
  return Array.from(files).sort();
}

/** Get all database tables needed for a set of enabled modules */
export function getRequiredTables(enabledIds: string[]): string[] {
  const modules = getEnabledModules(enabledIds);
  const tables = new Set<string>();
  for (const mod of modules) {
    for (const table of mod.tables) {
      tables.add(table);
    }
  }
  // Always include core tables
  tables.add("intelligence_execution_logs");
  return Array.from(tables).sort();
}

/** Get files that should be REMOVED (not in enabled modules) */
export function getCleanupFiles(enabledIds: string[]): string[] {
  const requiredFiles = new Set(getRequiredFiles(enabledIds));
  const allFiles = new Set<string>();
  for (const mod of INTELLIGENCE_MODULES) {
    for (const file of mod.files) {
      allFiles.add(file);
    }
  }

  return Array.from(allFiles)
    .filter((f) => !requiredFiles.has(f))
    .sort();
}

/** Detect which modules are relevant based on client intake keywords */
export function detectModulesFromIntake(intakeText: string): string[] {
  const lower = intakeText.toLowerCase();
  const detected = new Set<string>();

  for (const mod of INTELLIGENCE_MODULES) {
    if (mod.alwaysInclude) {
      detected.add(mod.id);
      continue;
    }
    for (const keyword of mod.detectionKeywords) {
      if (lower.includes(keyword.toLowerCase())) {
        detected.add(mod.id);
        break;
      }
    }
  }

  return Array.from(detected);
}

/** Get module by ID */
export function getModule(id: string): IntelligenceModule | undefined {
  return INTELLIGENCE_MODULES.find((m) => m.id === id);
}

/** Get all modules grouped by tier */
export function getModulesByTier(): Record<number, IntelligenceModule[]> {
  const byTier: Record<number, IntelligenceModule[]> = { 1: [], 2: [], 3: [] };
  for (const mod of INTELLIGENCE_MODULES) {
    byTier[mod.tier]?.push(mod);
  }
  return byTier;
}

/** Get all modules grouped by category */
export function getModulesByCategory(): Record<string, IntelligenceModule[]> {
  const byCategory: Record<string, IntelligenceModule[]> = {};
  for (const mod of INTELLIGENCE_MODULES) {
    if (!byCategory[mod.category]) byCategory[mod.category] = [];
    byCategory[mod.category].push(mod);
  }
  return byCategory;
}
