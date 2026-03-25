/**
 * Intelligence Preset: Coaching Diagnostic
 *
 * Adapted from Invisible Pipeline's intelligence layer for coaching/diagnostic use cases.
 * Designed for apps like NEO where participants go through diagnostic conversations
 * and get classified into identity/ceiling types with program fit scoring.
 *
 * Use for: Coaching platforms, diagnostic tools, assessment apps, personality profiling
 */

import type { IntelligenceConfig } from '../intelligence.config';

export const coachingDiagnosticPreset: IntelligenceConfig = {
  name: "Coaching Diagnostic Intelligence",
  domain: "coaching",

  subject: {
    singular: "participant",
    plural: "participants",
    table: "diagnostic_sessions",
  },

  dna: {
    enabled: true,
    dimensions: [
      { name: "identity_patterns", label: "Identity Patterns", description: "Core identity rules, self-concepts, and belief systems expressed", priority: 1 },
      { name: "limiting_beliefs", label: "Limiting Beliefs", description: "Self-limiting beliefs, fear patterns, and mental blocks identified", priority: 2 },
      { name: "behavior_markers", label: "Behavior Markers", description: "Recurring behaviors like perfectionism, avoidance, over-preparation", priority: 3 },
      { name: "strengths_expressed", label: "Strengths", description: "Self-awareness signals, wins, capabilities they demonstrate", priority: 5 },
      { name: "readiness_indicators", label: "Readiness Indicators", description: "Signs of readiness for change: self-responsibility language, openness", priority: 4 },
      { name: "revenue_signals", label: "Revenue Signals", description: "Revenue mentions, business size, investment history, financial context", priority: 6 },
      { name: "time_stuck_signals", label: "Time Stuck", description: "How long they've been at this plateau, urgency signals", priority: 7 },
      { name: "unique_phrases", label: "Verbatim Quotes", description: "Their exact words that reveal deep patterns — preserve verbatim", priority: 1 },
    ],
    attributes: [
      { name: "ceiling_type", label: "Ceiling Type", description: "Primary ceiling classification", possible_values: ["Perfection Ceiling", "Control Ceiling", "Visibility Ceiling", "Capacity Ceiling", "Identity Ceiling"] },
      { name: "ceiling_confidence", label: "Classification Confidence", description: "How confident is the classification (high/medium/low)" },
      { name: "revenue_level", label: "Revenue Level", description: "Approximate revenue range mentioned" },
      { name: "time_at_plateau", label: "Time at Plateau", description: "How long they've been stuck" },
    ],
    structured: [
      {
        name: "identity_dna",
        label: "Identity DNA",
        fields: [
          { name: "core_identity_rule", description: "Their primary identity rule (e.g., 'I must be perfect before launching')" },
          { name: "secondary_pattern", description: "Secondary behavioral pattern" },
          { name: "transformation_leverage", description: "The key leverage point for breakthrough" },
        ],
      },
    ],
    source_types: ["diagnostic_transcript", "intake_form", "voice_recording"],
    archetypes: [
      {
        name: "Perfection Ceiling",
        description: "Stuck refining endlessly. Won't launch until it's 'perfect'. Revenue plateaus because execution stalls.",
        identification_triggers: {
          keywords: ["perfect", "not ready", "refining", "tweaking", "polishing", "one more thing"],
          indicators: ["Has product but won't launch", "Revenue stuck despite good offer", "Over-preparing"],
          language_patterns: ["I just need to...", "It's almost there", "I want to make sure"],
        },
      },
      {
        name: "Control Ceiling",
        description: "Can't delegate. Bottleneck of the business. Revenue limited by their personal bandwidth.",
        identification_triggers: {
          keywords: ["do it myself", "nobody does it like me", "can't trust", "delegating", "hiring"],
          indicators: ["Solo operator at scale", "Burned by bad hires", "Working 60+ hours"],
          language_patterns: ["If you want it done right...", "I tried hiring but...", "I'm the bottleneck"],
        },
      },
      {
        name: "Visibility Ceiling",
        description: "Afraid to be seen. Avoids putting themselves out there. Revenue limited by reach.",
        identification_triggers: {
          keywords: ["imposter", "judged", "not an expert", "visibility", "putting myself out there"],
          indicators: ["Great at 1:1 but avoids content", "Small audience despite expertise", "Hides behind brand"],
          language_patterns: ["Who am I to...", "People will think...", "I'm not ready to be seen"],
        },
      },
      {
        name: "Capacity Ceiling",
        description: "Maxed out. Can't take more clients. Revenue flat because delivery consumes all time.",
        identification_triggers: {
          keywords: ["overwhelmed", "maxed out", "no time", "burning out", "too many clients"],
          indicators: ["Full client roster", "No systems", "Trading time for money"],
          language_patterns: ["I can't take on more", "There aren't enough hours", "I'm exhausted"],
        },
      },
      {
        name: "Identity Ceiling",
        description: "Doesn't see themselves as the person who has the next-level business. Self-concept caps growth.",
        identification_triggers: {
          keywords: ["not that kind of person", "luck", "who am I", "don't deserve", "comfortable"],
          indicators: ["Self-sabotage patterns", "Hits same revenue and retreats", "Comfort zone attachment"],
          language_patterns: ["I'm not a...", "People like me don't...", "Maybe I'm just meant to..."],
        },
      },
    ],
  },

  scoring: {
    enabled: true,
    method: 'dimension_weighted',
    dimensions: [
      { name: "identity_alignment", label: "Identity Alignment", description: "Self-awareness level, pattern recognition, readiness for transformation", weight: 0.3 },
      { name: "coachability", label: "Coachability Score", description: "Openness to feedback, self-responsibility language, zero defensiveness", weight: 0.3 },
      { name: "investment_capacity", label: "Investment Capacity", description: "Revenue level, previous investment history, budget signals", weight: 0.2 },
      { name: "urgency", label: "Urgency Level", description: "How long stuck, internal/external pressure, timing signals", weight: 0.2 },
    ],
    tiers: [
      { name: "premium_coaching", label: "Premium Coaching", min: 85, color: "amber", description: "High self-awareness, high investment capacity, ready now", action: "Direct to premium 1:1 coaching offer" },
      { name: "group_program", label: "Group Program", min: 60, color: "blue", description: "Good fit but needs community support", action: "Invite to group coaching program" },
      { name: "community", label: "Community/Free", min: 30, color: "slate", description: "Not ready for paid program yet", action: "Invite to free community (Skool, etc.)" },
      { name: "not_ready", label: "Not Ready", min: 0, color: "gray", description: "Low readiness signals", action: "Nurture with free content" },
    ],
    strictness: 'moderate',
  },

  profiling: {
    enabled: true,
    industry_defaults: {
      coaching: { communication_style: { directness: 0.4, formality: 0.3, data_orientation: 0.3, verbosity: 0.7 }, decision_mode: 'emotional' },
      consulting: { communication_style: { directness: 0.6, formality: 0.6, data_orientation: 0.7, verbosity: 0.6 }, decision_mode: 'analytical' },
      saas: { communication_style: { directness: 0.7, formality: 0.4, data_orientation: 0.8, verbosity: 0.5 }, decision_mode: 'pragmatic' },
      agency: { communication_style: { directness: 0.5, formality: 0.5, data_orientation: 0.5, verbosity: 0.6 }, decision_mode: 'social' },
      ecommerce: { communication_style: { directness: 0.6, formality: 0.4, data_orientation: 0.6, verbosity: 0.5 }, decision_mode: 'pragmatic' },
    },
  },

  conversation: {
    enabled: true,
    signal_types: [
      { type: "breakthrough_moment", indicators: ["I just realized", "oh wow", "I never thought of it", "that's exactly it"], description: "Moment of self-discovery" },
      { type: "resistance", indicators: ["but", "I've tried", "that won't work", "my situation is different"], description: "Resistance to insight" },
      { type: "vulnerability", indicators: ["honestly", "I haven't told anyone", "it scares me", "I feel"], description: "Opening up / vulnerability" },
      { type: "readiness_signal", indicators: ["what do I do next", "how do I start", "I'm ready", "sign me up"], description: "Ready to take action" },
      { type: "investment_signal", indicators: ["how much", "what's the cost", "I've invested before", "worth it"], description: "Investment/pricing interest" },
      { type: "deflection", indicators: ["I'm fine", "it's not that bad", "I don't need", "maybe later"], description: "Avoiding the real issue" },
    ],
    emotional_states: ["curious", "vulnerable", "resistant", "breakthrough", "defensive", "hopeful", "overwhelmed"],
    stages: ["rapport", "exploration", "deepening", "classification", "reveal", "offer"],
    focus_areas: ["identity_mirror", "pattern_recognition", "ceiling_reveal", "transformation_bridge", "offer_alignment"],
  },

  prediction: {
    enabled: true,
    outcome_label: "program_enrollment",
    factor_categories: ["readiness", "investment_capacity", "urgency", "self_awareness", "coaching_history"],
  },

  simulation: {
    enabled: false, // Not typically needed for coaching diagnostics
    default_archetypes: {},
  },

  ai: {
    primary_model: "gemini-2.5-flash",
    fallback_model: "claude-haiku-4-5-20251001",
    extraction_model: "gemini-2.5-flash",
    analysis_model: "claude-sonnet-4-5-20250929", // Deeper analysis for identity work
  },
};
