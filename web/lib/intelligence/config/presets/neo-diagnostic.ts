/**
 * Intelligence Preset: Neo Revenue Ceiling Diagnostic
 *
 * Built from real battle-test mapping Bloom → Neo (Limitless Rewired).
 * Neo is an AI diagnostic that identifies the unconscious "revenue ceiling"
 * capping agency founders' income via a 12-minute conversational mirror.
 *
 * Key differences from generic coaching-diagnostic:
 * - 10 specific revenue ceiling archetypes (not 5 generic)
 * - 2-bucket routing only: premium_coaching vs skool_community
 * - Stage names: surface → drill → pattern_lock → close → completed
 * - Revenue gap is the primary metric (annualized cost of staying stuck)
 * - Source: diagnostic_transcript (<neo_internal> JSON blocks)
 *
 * Use for: Revenue ceiling diagnostics, identity-based sales funnels,
 *          diagnostic-to-offer conversion tools
 */

import type { IntelligenceConfig } from '../intelligence.config';

export const neoDiagnosticPreset: IntelligenceConfig = {
  name: "Neo Revenue Ceiling Diagnostic",
  domain: "identity-diagnostic",

  subject: {
    singular: "founder",
    plural: "founders",
    table: "diagnostic_sessions",
  },

  dna: {
    enabled: true,
    dimensions: [
      { name: "ceiling_patterns", label: "Ceiling Patterns", description: "Unconscious patterns keeping them stuck — perfectionism, avoidance, control, imposter behavior", priority: 1 },
      { name: "identity_rules", label: "Identity Rules", description: "Core rules they live by that limit growth: 'I must be perfect', 'I can't be seen', 'I have to do everything myself'", priority: 1 },
      { name: "revenue_signals", label: "Revenue Signals", description: "Current revenue, believed potential, time at plateau, financial context", priority: 2 },
      { name: "behavior_markers", label: "Behavior Markers", description: "Observable behaviors: over-preparing, hiding behind busy-work, delegating nothing, avoiding visibility", priority: 3 },
      { name: "readiness_indicators", label: "Readiness Indicators", description: "Signs of investment readiness: self-responsibility language, urgency, openness to coaching", priority: 3 },
      { name: "verbatim_quotes", label: "Verbatim Quotes", description: "Their exact words revealing deep patterns — preserve word-for-word", priority: 1 },
    ],
    attributes: [
      { name: "primary_ceiling", label: "Primary Ceiling", description: "Dominant revenue ceiling type", possible_values: ["perfection", "visibility", "comfort", "chaos", "imposter", "control", "responsibility", "performance_failure", "pressure", "loyalty"] },
      { name: "secondary_ceilings", label: "Secondary Ceilings", description: "Additional ceiling patterns detected (0-2)" },
      { name: "classification_confidence", label: "Classification Confidence", description: "How confident the classification is (0-100%)" },
      { name: "current_revenue", label: "Current Monthly Revenue", description: "Self-reported monthly revenue" },
      { name: "believed_potential", label: "Believed Potential", description: "What they believe they could earn" },
      { name: "time_at_plateau", label: "Time at Plateau", description: "How long they've been stuck at this level" },
    ],
    structured: [
      {
        name: "ceiling_diagnosis",
        label: "Ceiling Diagnosis",
        fields: [
          { name: "primary_ceiling_type", description: "The dominant ceiling (one of 10 types)" },
          { name: "core_identity_rule", description: "The #1 unconscious rule keeping them stuck" },
          { name: "annualized_cost", description: "Yearly cost of staying stuck: (potential - current) * 12" },
          { name: "routing_recommendation", description: "premium_coaching or skool_community" },
        ],
      },
    ],
    source_types: ["diagnostic_transcript"],
    archetypes: [
      {
        name: "Perfection",
        description: "Won't launch until it's 'perfect'. Revenue plateaus because execution stalls while they endlessly refine.",
        identification_triggers: {
          keywords: ["perfect", "not ready", "refining", "tweaking", "polishing", "one more thing", "almost there"],
          indicators: ["Has product but won't launch", "Revenue stuck despite good offer", "Over-preparing for months"],
          language_patterns: ["I just need to...", "It's almost there", "I want to make sure it's right first"],
        },
      },
      {
        name: "Visibility",
        description: "Hides behind backend work. Afraid to be seen, judged, or put themselves out there. Revenue limited by reach.",
        identification_triggers: {
          keywords: ["seen", "judged", "putting myself out there", "content", "posting", "stage", "camera"],
          indicators: ["Great 1:1 but avoids content", "Small audience despite expertise", "Hides behind brand name"],
          language_patterns: ["Who am I to...", "People will think...", "I'm not ready to be visible yet"],
        },
      },
      {
        name: "Comfort",
        description: "Settled into a 'good enough' plateau. Knows they could grow but won't push past comfort zone.",
        identification_triggers: {
          keywords: ["comfortable", "good enough", "fine", "stable", "safe", "risk"],
          indicators: ["Revenue steady but flat for 12+ months", "Avoids new strategies", "Content with current level"],
          language_patterns: ["It's fine as it is", "I don't want to rock the boat", "Why fix what's not broken"],
        },
      },
      {
        name: "Chaos",
        description: "Business is a mess. No systems, no processes, constantly firefighting. Revenue leaks everywhere.",
        identification_triggers: {
          keywords: ["overwhelmed", "chaos", "firefighting", "no systems", "everything breaks", "wearing all hats"],
          indicators: ["No SOPs", "Constantly putting out fires", "Team turnover", "Missed deadlines"],
          language_patterns: ["I'm putting out fires all day", "There's always something breaking", "I can't keep up"],
        },
      },
      {
        name: "Imposter",
        description: "Doubts their authority. Feels like a fraud despite evidence of competence. Undercharges and over-delivers.",
        identification_triggers: {
          keywords: ["imposter", "fraud", "don't deserve", "luck", "found out", "not an expert"],
          indicators: ["Undercharges significantly", "Over-delivers compulsively", "Avoids authority positioning"],
          language_patterns: ["I'm not really an expert", "They'll figure out I don't know", "I just got lucky"],
        },
      },
      {
        name: "Control",
        description: "Can't delegate. Bottleneck of the business. Revenue limited by personal bandwidth.",
        identification_triggers: {
          keywords: ["do it myself", "nobody does it like me", "can't trust", "delegate", "micromanage"],
          indicators: ["Solo operator at scale", "Burned by bad hires", "Working 60+ hours", "Does everything"],
          language_patterns: ["If you want it done right...", "I tried hiring but...", "I'm the bottleneck, I know"],
        },
      },
      {
        name: "Responsibility",
        description: "Over-responsible for everyone. Takes on others' problems. Revenue stalls because they can't say no.",
        identification_triggers: {
          keywords: ["responsible", "can't say no", "let them down", "need me", "everyone depends on me"],
          indicators: ["Over-services clients", "Can't fire underperformers", "Takes on team's emotional labor"],
          language_patterns: ["They need me", "I can't just leave them", "What if they fail without me"],
        },
      },
      {
        name: "Performance/Failure",
        description: "Terrified of failing publicly. Won't attempt big moves. Revenue capped by fear of visible failure.",
        identification_triggers: {
          keywords: ["fail", "embarrass", "what if it doesn't work", "waste", "public failure", "reputation"],
          indicators: ["Avoids launches", "Won't invest in ads", "Plays small despite capability"],
          language_patterns: ["What if it doesn't work?", "I can't afford to fail", "My reputation is on the line"],
        },
      },
      {
        name: "Pressure",
        description: "Crumbles under pressure. Revenue spikes then crashes because they can't handle sustained growth.",
        identification_triggers: {
          keywords: ["pressure", "stress", "burnout", "too much", "can't handle", "breaking point"],
          indicators: ["Revenue yo-yos", "Sabotages at new highs", "Health issues from overwork"],
          language_patterns: ["I hit $X and then everything fell apart", "I can't handle that pace", "More money = more problems"],
        },
      },
      {
        name: "Loyalty",
        description: "Loyal to outdated agreements, relationships, or identities that no longer serve growth.",
        identification_triggers: {
          keywords: ["loyalty", "can't leave", "owe them", "promise", "been there from the start", "family"],
          indicators: ["Keeps bad partnerships out of loyalty", "Won't outgrow peer group", "Guilty about success"],
          language_patterns: ["They were there from the start", "I can't just abandon...", "It feels like betrayal"],
        },
      },
    ],
  },

  scoring: {
    enabled: true,
    method: 'dimension_weighted',
    dimensions: [
      { name: "ceiling_clarity", label: "Ceiling Clarity", description: "How clearly identified the primary ceiling is — distinct pattern vs vague signals", weight: 0.25 },
      { name: "self_awareness", label: "Self-Awareness", description: "Do they recognize their own pattern? Awareness is the first step to breaking through", weight: 0.25 },
      { name: "investment_readiness", label: "Investment Readiness", description: "Revenue level, previous coaching investment, willingness to invest in transformation", weight: 0.25 },
      { name: "urgency", label: "Urgency Level", description: "Internal pressure to change: time stuck, pain level, emotional momentum", weight: 0.25 },
    ],
    tiers: [
      { name: "premium_coaching", label: "Premium Coaching", min: 70, color: "emerald", description: "High self-awareness + investment capacity + urgency. Route to premium 1:1 coaching.", action: "Route to premium coaching offer page" },
      { name: "skool_community", label: "Skool Community", min: 0, color: "indigo", description: "Needs more nurture or lower investment capacity. Route to free Skool community.", action: "Send Skool community invite link" },
    ],
    strictness: 'moderate',
  },

  profiling: {
    enabled: true,
    industry_defaults: {
      agency: { communication_style: { directness: 0.5, formality: 0.4, data_orientation: 0.5, verbosity: 0.6 }, decision_mode: 'social' },
      coaching: { communication_style: { directness: 0.4, formality: 0.3, data_orientation: 0.3, verbosity: 0.7 }, decision_mode: 'emotional' },
      consulting: { communication_style: { directness: 0.6, formality: 0.6, data_orientation: 0.7, verbosity: 0.5 }, decision_mode: 'analytical' },
      saas: { communication_style: { directness: 0.7, formality: 0.4, data_orientation: 0.8, verbosity: 0.4 }, decision_mode: 'pragmatic' },
      ecommerce: { communication_style: { directness: 0.6, formality: 0.3, data_orientation: 0.6, verbosity: 0.5 }, decision_mode: 'pragmatic' },
    },
  },

  conversation: {
    enabled: true,
    signal_types: [
      { type: "pattern_recognition", indicators: ["I just realized", "oh wow", "that's me", "I never saw it that way", "you're right"], description: "Founder recognizes their own ceiling pattern" },
      { type: "resistance", indicators: ["but my situation is different", "that won't work for me", "I've tried everything", "you don't understand"], description: "Resistance to the mirror — deflecting the diagnosis" },
      { type: "vulnerability", indicators: ["honestly", "I haven't told anyone", "this is hard to admit", "I feel", "it scares me"], description: "Founder drops the mask and reveals the real pattern" },
      { type: "investment_signal", indicators: ["what would it look like to work together", "how much", "I've invested before", "whatever it takes"], description: "Ready to invest in breaking through" },
      { type: "revenue_disclosure", indicators: ["I make", "my revenue is", "I'm at about", "per month"], description: "Sharing financial context for gap calculation" },
      { type: "deflection", indicators: ["I'm fine", "it's not that bad", "I don't really need", "maybe someday"], description: "Deflecting away from the real issue" },
    ],
    emotional_states: ["curious", "defensive", "vulnerable", "breakthrough", "resistant", "hopeful", "overwhelmed", "relieved"],
    stages: ["surface", "drill", "pattern_lock", "close", "completed"],
    focus_areas: ["ceiling_identification", "pattern_mirroring", "revenue_gap_calculation", "identity_reveal", "routing_decision"],
  },

  prediction: {
    enabled: true,
    outcome_label: "premium_conversion",
    factor_categories: ["ceiling_clarity", "self_awareness", "investment_readiness", "urgency", "revenue_level"],
  },

  simulation: {
    enabled: false,
    default_archetypes: {},
  },

  ai: {
    primary_model: "claude-sonnet-4-5-20250929",
    fallback_model: "claude-haiku-4-5-20251001",
    extraction_model: "claude-haiku-4-5-20251001",
    analysis_model: "claude-sonnet-4-5-20250929",
  },
};
