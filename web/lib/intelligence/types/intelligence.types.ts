/**
 * Universal Intelligence Engine - Type System
 *
 * Domain-agnostic types for the intelligence layer.
 * These types work across ANY vertical: sales, coaching, recruitment, education, etc.
 *
 * Transplanted from Invisible Pipeline's months of AI engineering.
 * Abstracted to be config-driven and domain-independent.
 */

// ============================================================================
// SUBJECT DNA (formerly "Lead DNA")
// ============================================================================

/**
 * Universal DNA extraction output.
 * The "dimensions" are config-driven — each deployment defines what to extract.
 */
export interface SubjectDNA {
  /** Config-defined extraction dimensions (key = dimension name, value = extracted data) */
  dimensions: Record<string, string[]>;

  /** Scalar attributes (key-value pairs like "seniority_level": "C-Level") */
  attributes: Record<string, string | null>;

  /** Nested structured data (e.g., "current_offer", "identity_pattern") */
  structured: Record<string, Record<string, string | null> | null>;

  /** Verbatim quotes / unique phrases — gold for personalization */
  unique_phrases: string[];

  /** AI-matched archetype from config-defined archetypes */
  matched_archetype: {
    primary: string;
    confidence: number;
    secondary?: string | null;
    reasoning: string;
  } | null;

  /** Overall extraction quality */
  extraction_confidence: number; // 0-100
  source_char_count: number;
  extracted_at: string; // ISO timestamp
}

export const emptySubjectDNA: SubjectDNA = {
  dimensions: {},
  attributes: {},
  structured: {},
  unique_phrases: [],
  matched_archetype: null,
  extraction_confidence: 0,
  source_char_count: 0,
  extracted_at: new Date().toISOString(),
};

// ============================================================================
// SCORING ENGINE (formerly "Lead Scoring")
// ============================================================================

/**
 * Universal scoring result.
 * Dimensions and weights are config-driven.
 */
export interface SubjectScore {
  total_score: number; // 0-100
  verdict: string; // e.g., "Dream Client", "Premium Tier", "High Coachability"
  breakdown: ScoringBreakdownItem[];
  summary: string; // What they need / key insight
  tier: string; // Config-defined tier name
  scored_at: string; // ISO timestamp
  model_used: string;
}

export interface ScoringBreakdownItem {
  signal: string; // Signal name (from config)
  score: number; // 0-10 per signal, or 0-100 per dimension
  reasoning: string;
  evidence?: string | null;
}

// ============================================================================
// PROFILER (formerly "Psychographic Analyzer")
// ============================================================================

/**
 * Universal subject profile — communication style, decision patterns, personality.
 * Works for leads, coaching participants, candidates, students, etc.
 */
export interface SubjectProfile {
  communication_style: {
    directness: number;       // 0-1: low = diplomatic, high = blunt
    formality: number;        // 0-1: low = casual, high = formal
    data_orientation: number; // 0-1: low = story-driven, high = data-driven
    verbosity: number;        // 0-1: low = concise, high = detailed
  };
  decision_mode: 'analytical' | 'emotional' | 'social' | 'pragmatic';
  trigger_words: string[];    // Words that generate positive responses
  anti_patterns: string[];    // Words/phrases to avoid
  response_patterns: {
    preferred_message_length: 'short' | 'medium' | 'long';
    preferred_question_type: 'open' | 'closed' | 'rhetorical';
    optimal_engagement_times: string[]; // e.g., ["9-11am", "2-4pm"]
    emoji_receptiveness: number;
  };
  personality_markers: {
    assertiveness: number;
    enthusiasm: number;
    skepticism: number;
    humor_appreciation: number;
  };
}

// ============================================================================
// CONVERSATION INTELLIGENCE
// ============================================================================

/**
 * Universal conversation state analysis.
 * Works for sales conversations, diagnostic sessions, interviews, etc.
 */
export interface ConversationState {
  engagement_level: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  signal_detections: Array<{
    type: string; // Config-defined signal types (e.g., "objection", "interest", "concern")
    signal: string; // The actual detected text/pattern
    confidence: number; // 0-1
  }>;
  intent_score: number; // 0-1 (buying intent, coaching readiness, etc.)
  emotional_state: string; // Config-defined states
  next_action_strategy: {
    tone: 'maintain' | 'soften' | 'intensify';
    focus: string; // Config-defined focus areas
    timing: 'now' | 'wait' | 'not_ready';
  };
  conversation_stage: string; // Config-defined stages
  reply_velocity: number; // Average hours between replies
  message_count: number;
}

export interface ConversationMessage {
  role: 'user' | 'subject'; // "subject" replaces "lead" — the person being analyzed
  content: string;
  timestamp: string;
}

// ============================================================================
// EMOTIONAL INTELLIGENCE
// ============================================================================

export interface EmotionalState {
  primary_emotion: string;
  intensity: number; // 1-10
  confidence_score: number; // 0-100
  trigger_detected: string | null;
  suggested_adaptation: string | null;
}

// ============================================================================
// PREDICTIVE ANALYTICS
// ============================================================================

export interface PredictiveInsight {
  outcome_probability: number; // 0-100 (conversion, completion, success, etc.)
  time_to_outcome_days: number;
  recommended_next_action: string;
  risk_factors: string[];
  winning_factors: string[];
  last_updated: string;
}

// ============================================================================
// SIMULATION ENGINE (Digital Twin)
// ============================================================================

export interface PersonaModel {
  id: string;
  base_archetype: string;
  profile_data: Record<string, any>;
  simulation_prompt: string;
}

export interface SimulationResult {
  success_probability: number;
  internal_thought_process: string;
  predicted_response: string;
  risk_analysis: Record<string, any>;
  draft_message?: string;
}

// ============================================================================
// ADAPTIVE INTELLIGENCE (Aggregate)
// ============================================================================

export interface AdaptiveIntelligenceData {
  dna: SubjectDNA | null;
  score: SubjectScore | null;
  profile: SubjectProfile | null;
  conversation: ConversationState | null;
  prediction: PredictiveInsight | null;
  simulation: SimulationResult | null;
  emotional: EmotionalState | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Quality label based on confidence score */
export function getQualityLabel(confidence: number): string {
  if (confidence >= 90) return "Excellent";
  if (confidence >= 70) return "Good";
  if (confidence >= 50) return "Fair";
  if (confidence >= 30) return "Limited";
  return "Minimal";
}

/** Score tier based on score value */
export function getScoreTier(
  score: number,
  tiers: Array<{ name: string; min: number; color: string }>
): { name: string; color: string } {
  // Tiers should be sorted highest-first in config
  const sorted = [...tiers].sort((a, b) => b.min - a.min);
  for (const tier of sorted) {
    if (score >= tier.min) return { name: tier.name, color: tier.color };
  }
  return sorted[sorted.length - 1] || { name: "unscored", color: "gray" };
}
