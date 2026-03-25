/**
 * Intelligence Preset: Sales Pipeline
 *
 * This is the EXACT intelligence config from Invisible Pipeline,
 * extracted and parameterized. This is the proven, battle-tested config
 * that took months to build.
 *
 * Use for: CRMs, sales tools, outbound platforms, lead management
 */

import type { IntelligenceConfig } from '../intelligence.config';

export const salesPipelinePreset: IntelligenceConfig = {
  name: "Sales Pipeline Intelligence",
  domain: "sales",

  subject: {
    singular: "lead",
    plural: "leads",
    table: "leads",
  },

  dna: {
    enabled: true,
    dimensions: [
      { name: "role_identity", label: "Role Identity", description: "Role descriptors - WHO are they professionally?", priority: 6 },
      { name: "stated_goals", label: "Goals", description: "Goals and ambitions they've mentioned", priority: 5 },
      { name: "pain_signals", label: "Pain Signals", description: "Problems, frustrations, challenges they've shared", priority: 2 },
      { name: "achievements", label: "Achievements", description: "Wins and accomplishments they're proud of", priority: 4 },
      { name: "current_challenges", label: "Current Challenges", description: "Active problems they're working on", priority: 7 },
      { name: "communication_style", label: "Communication Style", description: "Style markers like casual, formal, emoji-heavy, data-driven", priority: 8 },
      { name: "vocabulary", label: "Vocabulary", description: "Industry terms, buzzwords, unique phrases they use", priority: 9 },
      { name: "content_themes", label: "Content Themes", description: "Topics they post/talk about", priority: 10 },
      { name: "recent_wins", label: "Recent Wins", description: "Recent accomplishments to congratulate them on", priority: 3 },
      { name: "hot_takes", label: "Hot Takes", description: "Controversial opinions or strong stances", priority: 4 },
      { name: "likely_objections", label: "Likely Objections", description: "Reasons they might resist outreach", priority: 7 },
    ],
    attributes: [
      { name: "seniority_level", label: "Seniority", description: "C-Level, VP, Director, Manager, or IC", possible_values: ["C-Level", "VP", "Director", "Manager", "IC"] },
      { name: "company_stage", label: "Company Stage", description: "Startup, Scale-up, Enterprise, or Solo", possible_values: ["Startup", "Scale-up", "Enterprise", "Solo"] },
      { name: "industry", label: "Industry", description: "Their primary industry" },
    ],
    structured: [
      {
        name: "current_offer",
        label: "Offer Intelligence",
        fields: [
          { name: "product_type", description: "What they sell (Course, Agency, SaaS, Coaching)" },
          { name: "price_signals", description: "Premium, mid-market, or volume pricing" },
          { name: "target_market", description: "Who they sell to" },
        ],
      },
    ],
    source_types: ["linkedin_profile", "dm_conversations", "email_threads", "website"],
    archetypes: [], // Populated per-client from Blueprint
  },

  scoring: {
    enabled: true,
    method: 'signal_based',
    signals: [
      { name: "Proven offer", description: "Do they sell a validated product or service?" },
      { name: "High-ticket deal size", description: "Is their average deal value significant?" },
      { name: "Already doing outbound", description: "Are they actively prospecting?" },
      { name: "Has setters or ready to hire", description: "Do they have sales capacity?" },
      { name: "Has closers or is the closer", description: "Can they close deals themselves?" },
      { name: "LinkedIn-reachable prospects", description: "Is their ICP active on LinkedIn?" },
      { name: "Has money / established", description: "Can they afford your solution?" },
      { name: "Ready to scale", description: "Are they growth-minded?" },
      { name: "Coachable / open to advice", description: "Will they take direction?" },
      { name: "Matches your niche", description: "Do they fit your ideal client profile?" },
    ],
    tiers: [
      { name: "dream_client", label: "Dream Client", min: 80, color: "emerald", description: "Perfect fit — prioritize immediately", action: "Fast-track to sales call" },
      { name: "strong_fit", label: "Strong Fit", min: 60, color: "blue", description: "Good potential — nurture actively", action: "Personalized outreach sequence" },
      { name: "average", label: "Average", min: 40, color: "yellow", description: "Needs more qualification", action: "Standard nurture sequence" },
      { name: "low_fit", label: "Low Fit", min: 0, color: "gray", description: "Poor fit — low priority", action: "Passive monitoring" },
    ],
    strictness: 'harsh',
  },

  profiling: {
    enabled: true,
    industry_defaults: {
      finance: { communication_style: { directness: 0.7, formality: 0.8, data_orientation: 0.9, verbosity: 0.4 }, decision_mode: 'analytical' },
      tech: { communication_style: { directness: 0.6, formality: 0.4, data_orientation: 0.7, verbosity: 0.5 }, decision_mode: 'pragmatic' },
      saas: { communication_style: { directness: 0.7, formality: 0.4, data_orientation: 0.8, verbosity: 0.5 }, decision_mode: 'pragmatic' },
      agency: { communication_style: { directness: 0.5, formality: 0.5, data_orientation: 0.5, verbosity: 0.6 }, decision_mode: 'social' },
      coaching: { communication_style: { directness: 0.4, formality: 0.3, data_orientation: 0.3, verbosity: 0.7 }, decision_mode: 'emotional' },
      consulting: { communication_style: { directness: 0.6, formality: 0.7, data_orientation: 0.8, verbosity: 0.6 }, decision_mode: 'analytical' },
    },
  },

  conversation: {
    enabled: true,
    signal_types: [
      { type: "price_objection", indicators: ["expensive", "budget", "cost", "afford", "price"], description: "Price/budget concern" },
      { type: "timing_objection", indicators: ["busy", "later", "not right now", "in a few months"], description: "Timing pushback" },
      { type: "authority_objection", indicators: ["need to check with", "not my decision", "run this by"], description: "Not the decision maker" },
      { type: "skepticism", indicators: ["not sure", "tried before", "doesn't work", "prove it"], description: "Doubts about solution" },
      { type: "competitor", indicators: ["using", "already have", "alternative", "current provider"], description: "Competitor mention" },
      { type: "buying_signal", indicators: ["how does this work", "next step", "schedule", "interested", "pricing"], description: "Purchase interest" },
    ],
    emotional_states: ["curious", "skeptical", "excited", "defensive", "neutral"],
    stages: ["cold", "warming", "hot", "negotiation"],
    focus_areas: ["mechanism_reveal", "social_proof", "objection_handle", "close"],
  },

  prediction: {
    enabled: true,
    outcome_label: "conversion",
    factor_categories: ["engagement", "budget", "timing", "authority", "need"],
  },

  simulation: {
    enabled: true,
    default_archetypes: {
      skeptical_technical_leader: "You are a skeptical CTO. You receive hundreds of cold emails. You hate fluff, jargon, and salesy tones. You care about scalability, security, and developer experience.",
      results_driven_sales_leader: "You are an aggressive Sales Leader. You only care about revenue and ROI. You are impatient. You respond well to bold claims backed by numbers.",
      visionary_founder: "You are a busy Founder. You are time-constrained. You look for strategic partnerships and immediate value. You ignore anything that looks like a template.",
    },
  },

  ai: {
    primary_model: "gemini-2.5-flash",
    fallback_model: "claude-haiku-4-5-20251001",
    extraction_model: "gemini-2.5-flash",
    analysis_model: "gemini-2.5-flash",
  },
};
