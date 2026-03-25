/**
 * Universal Intelligence Engine - Configuration System
 *
 * This is THE core config that makes the intelligence layer domain-agnostic.
 * Each client deployment gets its own config generated from intake data.
 *
 * The Spec Agent (or Intelligence Mapper) generates this config,
 * and ALL intelligence services read from it.
 */

// ============================================================================
// MAIN CONFIG INTERFACE
// ============================================================================

export interface IntelligenceConfig {
  /** Human-readable name for this config */
  name: string;

  /** Domain identifier (used for preset selection) */
  domain: string; // "sales" | "coaching" | "recruitment" | "education" | "healthcare" | custom

  /** What we call the people being analyzed */
  subject: {
    singular: string; // "lead" | "participant" | "candidate" | "student" | "patient"
    plural: string;   // "leads" | "participants" | etc.
    table: string;    // Database table name
  };

  /** DNA Extraction config — what to extract from data sources */
  dna: {
    enabled: boolean;
    /** Named dimensions to extract (each returns string[]) */
    dimensions: DNADimensionConfig[];
    /** Scalar attributes to extract (each returns string | null) */
    attributes: DNAAttributeConfig[];
    /** Structured objects to extract */
    structured: DNAStructuredConfig[];
    /** Data source types this deployment uses */
    source_types: string[]; // "linkedin_profile" | "transcript" | "resume" | "intake_form" | "conversation"
    /** Archetype matching (optional) */
    archetypes?: ArchetypeConfig[];
  };

  /** Scoring Engine config */
  scoring: {
    enabled: boolean;
    /** Scoring method */
    method: 'signal_based' | 'dimension_weighted';
    /** For signal_based: Each signal is 0-10, total = sum */
    signals?: ScoringSignalConfig[];
    /** For dimension_weighted: Each dimension is 0-100, total = weighted average */
    dimensions?: ScoringDimensionConfig[];
    /** Tier definitions for bucketing scores */
    tiers: ScoringTierConfig[];
    /** Scoring strictness (affects prompt instructions) */
    strictness: 'lenient' | 'moderate' | 'harsh';
  };

  /** Profiling config */
  profiling: {
    enabled: boolean;
    /** Industry defaults for fallback profiles */
    industry_defaults?: Record<string, Partial<import('../types/intelligence.types').SubjectProfile>>;
  };

  /** Conversation Intelligence config */
  conversation: {
    enabled: boolean;
    /** Signal types to detect in conversations */
    signal_types: ConversationSignalConfig[];
    /** Emotional states to track */
    emotional_states: string[];
    /** Conversation stages (ordered) */
    stages: string[];
    /** Strategy focus areas for next actions */
    focus_areas: string[];
  };

  /** Predictive Analytics config */
  prediction: {
    enabled: boolean;
    /** What outcome we're predicting */
    outcome_label: string; // "conversion" | "completion" | "graduation" | "hire"
    /** Risk/winning factor categories */
    factor_categories: string[];
  };

  /** Simulation Engine config */
  simulation: {
    enabled: boolean;
    /** Default archetype prompts */
    default_archetypes: Record<string, string>;
  };

  /** AI Model preferences */
  ai: {
    primary_model: string;     // "gemini-2.5-flash" | "claude-sonnet-4-5" | etc.
    fallback_model: string;    // "claude-haiku-4-5-20251001" | etc.
    extraction_model: string;  // Model for DNA extraction (fast)
    analysis_model: string;    // Model for deep analysis (capable)
  };
}

// ============================================================================
// SUB-CONFIG TYPES
// ============================================================================

export interface DNADimensionConfig {
  name: string;          // e.g., "pain_signals", "limiting_beliefs", "skills"
  label: string;         // Human-readable: "Pain Signals", "Limiting Beliefs"
  description: string;   // Prompt hint: "Problems, frustrations, challenges they've shared"
  priority: number;      // Extraction priority (1 = highest)
}

export interface DNAAttributeConfig {
  name: string;          // e.g., "seniority_level", "ceiling_type", "experience_years"
  label: string;
  description: string;
  possible_values?: string[]; // Constrained enum values if applicable
}

export interface DNAStructuredConfig {
  name: string;          // e.g., "current_offer", "identity_pattern"
  label: string;
  fields: Array<{
    name: string;
    description: string;
  }>;
}

export interface ArchetypeConfig {
  name: string;          // e.g., "Ex-Mining Executive", "Control Ceiling"
  description?: string;
  identification_triggers: {
    keywords?: string[];
    indicators?: string[];
    language_patterns?: string[];
  };
}

export interface ScoringSignalConfig {
  name: string;          // e.g., "Proven offer", "Identity Alignment"
  description: string;   // What to evaluate
  weight?: number;       // Optional weight multiplier (default 1.0)
}

export interface ScoringDimensionConfig {
  name: string;          // e.g., "identity_alignment", "investment_capacity"
  label: string;
  description: string;
  weight: number;        // 0-1, all weights should sum to 1.0
}

export interface ScoringTierConfig {
  name: string;          // e.g., "hot", "premium_coaching", "qualified"
  label: string;         // Display label
  min: number;           // Minimum score for this tier
  color: string;         // Display color
  description?: string;  // What this tier means
  action?: string;       // Recommended action for this tier
}

export interface ConversationSignalConfig {
  type: string;          // e.g., "objection", "interest", "readiness", "concern"
  indicators: string[];  // Keywords/phrases that indicate this signal
  description: string;
}

// ============================================================================
// CONFIG LOADER
// ============================================================================

/**
 * Load intelligence config for a deployment.
 * In production, this reads from the database or a generated config file.
 * During build, the Spec Agent generates this from intake data.
 */
export function loadIntelligenceConfig(configPath?: string): IntelligenceConfig {
  // Default: try to load from the standard location
  try {
    // In Next.js, this would be imported at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(`@/intelligence.config`) as IntelligenceConfig;
    return config;
  } catch {
    console.warn("No intelligence.config found, using empty config");
    return getEmptyConfig();
  }
}

function getEmptyConfig(): IntelligenceConfig {
  return {
    name: "Unconfigured",
    domain: "generic",
    subject: { singular: "subject", plural: "subjects", table: "subjects" },
    dna: { enabled: false, dimensions: [], attributes: [], structured: [], source_types: [] },
    scoring: { enabled: false, method: 'signal_based', tiers: [], strictness: 'moderate' },
    profiling: { enabled: false },
    conversation: { enabled: false, signal_types: [], emotional_states: [], stages: [], focus_areas: [] },
    prediction: { enabled: false, outcome_label: "outcome", factor_categories: [] },
    simulation: { enabled: false, default_archetypes: {} },
    ai: {
      primary_model: "gemini-2.5-flash",
      fallback_model: "claude-haiku-4-5-20251001",
      extraction_model: "gemini-2.5-flash",
      analysis_model: "gemini-2.5-flash",
    },
  };
}
