/**
 * Demo Data Provider — The "Shut Up And Take My Money" Switch
 *
 * When NEXT_PUBLIC_DEMO_MODE=true, this provider intercepts all intelligence
 * service calls and returns realistic, domain-appropriate fake data.
 *
 * ZERO database. ZERO API calls. ZERO cost. Full "feeling."
 *
 * The client sees:
 *   - 30 scored subjects with real-looking breakdowns
 *   - DNA profiles with psychographic analysis
 *   - Effectiveness analytics showing what works
 *   - Voice DNA showing their "writing style"
 *   - Predictions, temporal patterns, A/B test results
 *
 * One env var flips between demo and production:
 *   NEXT_PUBLIC_DEMO_MODE=true  → this file serves everything
 *   NEXT_PUBLIC_DEMO_MODE=false → real Supabase + real AI
 *
 * HOW AGENTS USE THIS:
 *   Agent 5 wires components to use `getDemoOrReal()` wrapper.
 *   In demo mode, the app is fully functional without setup.
 *   Client sees it, loves it, signs. Then flip to production.
 */

import type {
  SubjectDNA,
  SubjectScore,
  SubjectProfile,
  ConversationState,
  EmotionalState,
  PredictiveInsight,
} from "../types/intelligence.types";

import {
  SALES_SUBJECTS,
  SALES_EFFECTIVENESS,
  SALES_VARIATION_ARMS,
  DEMO_VOICE_DNA,
  DEMO_CONSTITUTION,
  type DemoSubject,
} from "./demo-seed-data";

// ============================================================================
// DEMO MODE CHECK
// ============================================================================

export function isDemoMode(): boolean {
  if (typeof window !== "undefined") {
    return window?.location?.search?.includes("demo=true") ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

// ============================================================================
// SUBJECT INTELLIGENCE (DNA + Score + Profile)
// ============================================================================

/**
 * Get all demo subjects (the "pipeline" view).
 */
export function getDemoSubjects(): DemoSubject[] {
  return SALES_SUBJECTS;
}

/**
 * Get a single subject by ID.
 */
export function getDemoSubject(subjectId: string): DemoSubject | null {
  return SALES_SUBJECTS.find((s) => s.id === subjectId) || null;
}

/**
 * Get full intelligence record for a subject (mirrors subject_intelligence table).
 */
export function getDemoSubjectIntelligence(subjectId: string): {
  id: string;
  subject_id: string;
  org_id: string;
  dna: SubjectDNA;
  score: number;
  score_tier: string;
  score_breakdown: any[];
  profile: SubjectProfile;
  conversation_state: ConversationState;
  emotional_state: EmotionalState;
  predictive_insights: PredictiveInsight;
  dna_extraction_confidence: number;
} | null {
  const subject = getDemoSubject(subjectId);
  if (!subject) return null;

  return {
    id: subject.id,
    subject_id: subject.id,
    org_id: "demo-org-0000",
    dna: buildDemoDNA(subject),
    score: subject.score,
    score_tier: subject.scoreTier,
    score_breakdown: buildDemoScoreBreakdown(subject),
    profile: buildDemoProfile(subject),
    conversation_state: buildDemoConversationState(subject),
    emotional_state: buildDemoEmotionalState(subject),
    predictive_insights: buildDemoPrediction(subject),
    dna_extraction_confidence: subject.dnaConfidence,
  };
}

/**
 * Get subjects filtered by tier.
 */
export function getDemoSubjectsByTier(tier: string): DemoSubject[] {
  return SALES_SUBJECTS.filter((s) => s.scoreTier === tier);
}

/**
 * Get pipeline summary (tier distribution).
 */
export function getDemoPipelineSummary(): {
  total: number;
  byTier: Record<string, number>;
  avgScore: number;
  topArchetypes: Array<{ name: string; count: number }>;
} {
  const subjects = SALES_SUBJECTS;
  const byTier: Record<string, number> = {};
  const archetypes: Record<string, number> = {};

  for (const s of subjects) {
    byTier[s.scoreTier] = (byTier[s.scoreTier] || 0) + 1;
    if (s.archetype !== "unknown") {
      archetypes[s.archetype] = (archetypes[s.archetype] || 0) + 1;
    }
  }

  const avgScore =
    subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length;

  const topArchetypes = Object.entries(archetypes)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { total: subjects.length, byTier, avgScore: Math.round(avgScore), topArchetypes };
}

// ============================================================================
// EFFECTIVENESS DATA
// ============================================================================

/**
 * Get effectiveness matrix (style × subject type).
 */
export function getDemoEffectiveness(): typeof SALES_EFFECTIVENESS {
  return SALES_EFFECTIVENESS;
}

/**
 * Get best style recommendation for a subject type.
 */
export function getDemoBestStyle(subjectType: string): {
  style: string;
  conversionRate: number;
  confidence: string;
} {
  const matches = SALES_EFFECTIVENESS.filter(
    (e) => e.subjectType === subjectType
  ).sort((a, b) => b.conversionRate - a.conversionRate);

  if (matches.length === 0) {
    return { style: "value_first", conversionRate: 10, confidence: "low" };
  }

  const best = matches[0];
  return {
    style: best.style,
    conversionRate: best.conversionRate,
    confidence: best.sends > 30 ? "high" : best.sends > 15 ? "medium" : "low",
  };
}

// ============================================================================
// VARIATION ARMS (A/B Testing)
// ============================================================================

export function getDemoVariationArms(): typeof SALES_VARIATION_ARMS {
  return SALES_VARIATION_ARMS;
}

export function getDemoChampionApproach(): {
  approach: string;
  winRate: number;
  trials: number;
} {
  const sorted = [...SALES_VARIATION_ARMS].sort(
    (a, b) => b.successes / b.trials - a.successes / a.trials
  );
  const champ = sorted[0];
  return {
    approach: champ.approach,
    winRate: Math.round((champ.successes / champ.trials) * 100),
    trials: champ.trials,
  };
}

// ============================================================================
// VOICE DNA
// ============================================================================

export function getDemoVoiceDNA(): typeof DEMO_VOICE_DNA {
  return DEMO_VOICE_DNA;
}

// ============================================================================
// CONSTITUTION
// ============================================================================

export function getDemoConstitution(): typeof DEMO_CONSTITUTION {
  return DEMO_CONSTITUTION;
}

// ============================================================================
// TEMPORAL PATTERNS
// ============================================================================

export function getDemoTemporalPattern(subjectId: string): {
  avgResponseMinutes: number;
  mostActiveHours: number[];
  mostActiveDays: string[];
  fatigueScore: number;
  bestSendTime: string;
} | null {
  const subject = getDemoSubject(subjectId);
  if (!subject || subject.scoreTier === "cold") return null;

  // Deterministic based on score
  const seed = subject.score;
  return {
    avgResponseMinutes: 30 + (seed % 180),
    mostActiveHours: [9 + (seed % 3), 14 + (seed % 2)],
    mostActiveDays: seed > 50 ? ["Tuesday", "Thursday"] : ["Monday", "Wednesday"],
    fatigueScore: Math.max(0, 100 - subject.score * 1.5),
    bestSendTime:
      seed > 60 ? "Tuesday 10:00 AM" : seed > 30 ? "Wednesday 2:00 PM" : "Monday 9:00 AM",
  };
}

// ============================================================================
// COHORT DATA
// ============================================================================

export function getDemoCohortData(): {
  currentMonth: { total: number; converted: number; rate: number; health: number };
  lastMonth: { total: number; converted: number; rate: number; health: number };
  trend: "improving" | "stable" | "declining";
  avgVelocityDays: number;
} {
  return {
    currentMonth: { total: 12, converted: 3, rate: 25, health: 72 },
    lastMonth: { total: 15, converted: 3, rate: 20, health: 65 },
    trend: "improving",
    avgVelocityDays: 18,
  };
}

// ============================================================================
// BUILDERS (Private — construct realistic objects from seed data)
// ============================================================================

function buildDemoDNA(subject: DemoSubject): SubjectDNA {
  return {
    raw_data: {
      name: subject.name,
      title: subject.title,
      company: subject.company,
      about: subject.about,
    },
    extracted_insights: {
      seniority_level: subject.title.includes("VP") || subject.title.includes("Chief") || subject.title.includes("Director")
        ? "senior"
        : subject.title.includes("Head")
          ? "mid-senior"
          : "mid",
      industry: subject.company,
      decision_authority: subject.archetype === "Decision Maker" ? "high" : "medium",
      personality_indicators: Object.entries(subject.profileTraits)
        .filter(([, v]) => v > 0.7)
        .map(([k]) => k),
    },
    matched_archetype: {
      primary: subject.archetype,
      confidence: subject.dnaConfidence,
    },
    quality_score: subject.dnaConfidence,
  } as any;
}

function buildDemoScoreBreakdown(subject: DemoSubject): any[] {
  if (subject.score === 0) return [];
  const items = [];
  if (subject.stage !== "cold") items.push({ dimension: "Engagement", score: Math.min(100, subject.score * 1.2), weight: 0.3 });
  if (subject.dnaConfidence > 30) items.push({ dimension: "Profile Fit", score: subject.dnaConfidence, weight: 0.25 });
  if (subject.conversionProbability > 0) items.push({ dimension: "Intent Signals", score: subject.conversionProbability, weight: 0.25 });
  items.push({ dimension: "Recency", score: subject.daysInPipeline < 14 ? 90 : subject.daysInPipeline < 30 ? 60 : 30, weight: 0.2 });
  return items;
}

function buildDemoProfile(subject: DemoSubject): SubjectProfile {
  return {
    communication_style: {
      directness: subject.profileTraits.directness,
      formality: subject.profileTraits.formality,
      analytical_vs_emotional: subject.profileTraits.analyticalVsEmotional,
      risk_tolerance: subject.profileTraits.riskTolerance,
    },
    summary: subject.communicationStyle,
    preferred_channel: "email",
    response_patterns: {
      preferred_message_length: subject.profileTraits.directness > 0.7 ? "short" : "medium",
    },
  } as any;
}

function buildDemoConversationState(subject: DemoSubject): ConversationState {
  return {
    stage: subject.stage,
    engagement_level: subject.engagementLevel,
    emotional_state: subject.emotionalState,
    messages_exchanged: subject.scoreTier === "on_fire" ? 8 : subject.scoreTier === "hot" ? 4 : subject.scoreTier === "warm" ? 1 : 0,
    last_interaction: subject.lastActivity,
  } as any;
}

function buildDemoEmotionalState(subject: DemoSubject): EmotionalState {
  return {
    current: subject.emotionalState,
    confidence: subject.dnaConfidence / 100,
    trend: subject.score > 50 ? "positive" : subject.score > 20 ? "neutral" : "unknown",
  } as any;
}

function buildDemoPrediction(subject: DemoSubject): PredictiveInsight {
  return {
    conversion_probability: subject.conversionProbability,
    confidence: subject.conversionProbability > 60 ? "high" : subject.conversionProbability > 30 ? "medium" : "low",
    next_best_action: subject.scoreTier === "on_fire"
      ? "Schedule demo call this week"
      : subject.scoreTier === "hot"
        ? "Send personalized follow-up"
        : subject.scoreTier === "warm"
          ? "Re-engage with value content"
          : "Needs initial outreach",
    risk_factors: subject.daysInPipeline > 30 ? ["Stale — no activity in 2+ weeks"] : [],
    winning_factors: subject.conversionProbability > 50
      ? ["Strong engagement pattern", `Matches ${subject.archetype} archetype`]
      : [],
  } as any;
}
