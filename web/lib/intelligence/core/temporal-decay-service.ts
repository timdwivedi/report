/**
 * Universal Temporal Decay Service (Recency-Weighted Intelligence)
 *
 * Transplanted from Invisible Pipeline's temporal-decay.ts (~349 lines)
 *
 * Makes recent patterns more valuable than old ones.
 * Market conditions change, messaging trends shift, competitor moves evolve.
 * What worked 6 months ago may not work today.
 *
 * Uses exponential decay: Weight = max(minWeight, 2^(-age/halfLife))
 *
 * Three decay profiles:
 *   - Aggressive: 50% value after 30 days (fast-moving industries: tech, SaaS, crypto)
 *   - Standard: 50% value after 90 days (general business)
 *   - Conservative: 50% value after 180 days (stable industries: finance, healthcare)
 *
 * Original: Blueprint training data decay in IP
 * Universal: Config-driven temporal decay for ANY learning system
 */

// ============================================================================
// DECAY CONFIGURATIONS
// ============================================================================

export const DECAY_CONFIGS = {
  /** Fast-moving industries — 50% value after 30 days */
  aggressive: {
    halfLife: 30,
    minWeight: 0.1,
  },

  /** General business — 50% value after 90 days */
  standard: {
    halfLife: 90,
    minWeight: 0.2,
  },

  /** Stable industries — 50% value after 180 days */
  conservative: {
    halfLife: 180,
    minWeight: 0.3,
  },
} as const;

export type DecayProfile = keyof typeof DECAY_CONFIGS;

// ============================================================================
// TYPES
// ============================================================================

export interface DecayedItem<T> {
  item: T;
  original_score: number;
  decayed_score: number;
  decay_weight: number;
  age_days: number;
}

export interface FreshnessReport {
  freshness_score: number; // 0-100
  avg_age_days: number;
  oldest_age_days: number;
  newest_age_days: number;
  total_items: number;
  recommendation: string;
}

// ============================================================================
// CORE DECAY FUNCTIONS
// ============================================================================

/**
 * Calculate time-based decay weight using exponential decay.
 * Formula: Weight = max(minWeight, 2^(-age/halfLife))
 */
export function calculateDecayWeight(
  dateCreated: Date | string,
  decayProfile: DecayProfile = "standard"
): number {
  const config = DECAY_CONFIGS[decayProfile];
  const createdDate = typeof dateCreated === "string" ? new Date(dateCreated) : dateCreated;
  const ageInDays = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  const decayWeight = Math.pow(2, -ageInDays / config.halfLife);
  return Math.max(config.minWeight, decayWeight);
}

/**
 * Apply temporal decay to a score/confidence value.
 * Returns the decayed score.
 */
export function applyDecay(
  score: number,
  dateCreated: Date | string,
  decayProfile: DecayProfile = "standard"
): number {
  const weight = calculateDecayWeight(dateCreated, decayProfile);
  return score * weight;
}

/**
 * Apply temporal decay towards a neutral baseline.
 * Old values regress towards the mean rather than towards zero.
 * Useful for failure rates and effectiveness scores.
 */
export function applyDecayTowardsNeutral(
  score: number,
  dateCreated: Date | string,
  neutral: number = 50,
  decayProfile: DecayProfile = "standard"
): number {
  const weight = calculateDecayWeight(dateCreated, decayProfile);
  return neutral + (score - neutral) * weight;
}

// ============================================================================
// BATCH DECAY OPERATIONS
// ============================================================================

/**
 * Apply decay to a batch of items with scores/dates.
 * Returns items sorted by decayed score (highest first).
 */
export function decayBatch<T extends Record<string, any>>(
  items: T[],
  scoreField: string,
  dateField: string,
  decayProfile: DecayProfile = "standard",
  minDecayedScore: number = 0
): DecayedItem<T>[] {
  const now = Date.now();

  return items
    .map((item) => {
      const score = item[scoreField] as number;
      const date = item[dateField] as string;
      const weight = calculateDecayWeight(date, decayProfile);
      const ageInDays = (now - new Date(date).getTime()) / (1000 * 60 * 60 * 24);

      return {
        item,
        original_score: score,
        decayed_score: score * weight,
        decay_weight: weight,
        age_days: ageInDays,
      };
    })
    .filter((d) => d.decayed_score >= minDecayedScore)
    .sort((a, b) => b.decayed_score - a.decayed_score);
}

/**
 * Get recency-weighted patterns from database.
 * Queries conversion_patterns or anti_patterns and applies decay.
 */
export async function getDecayedPatterns(
  supabase: any,
  orgId: string,
  tableName: string = "conversion_patterns",
  scoreField: string = "confidence_score",
  minDecayedScore: number = 40,
  decayProfile: DecayProfile = "standard"
): Promise<DecayedItem<any>[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];

    return decayBatch(
      data,
      scoreField,
      "updated_at",
      decayProfile,
      minDecayedScore
    );
  } catch {
    return [];
  }
}

/**
 * Get recency-weighted effectiveness metrics.
 * Old performance data decays towards an industry baseline.
 */
export async function getDecayedEffectiveness(
  supabase: any,
  orgId: string,
  decayProfile: DecayProfile = "standard",
  industryBaseline: number = 20
): Promise<Array<{
  subject_type: string;
  content_style: string;
  original_rate: number;
  decayed_rate: number;
  recency_factor: number;
}>> {
  try {
    const { data, error } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .gte("sends_count", 3);

    if (error || !data) return [];

    return data.map((record: any) => {
      const weight = calculateDecayWeight(
        record.updated_at || record.created_at,
        decayProfile
      );

      const originalRate = record.conversion_rate || 0;
      const decayedRate = industryBaseline + (originalRate - industryBaseline) * weight;

      return {
        subject_type: record.subject_type,
        content_style: record.content_style,
        original_rate: originalRate,
        decayed_rate: decayedRate,
        recency_factor: weight,
      };
    });
  } catch {
    return [];
  }
}

// ============================================================================
// FRESHNESS ANALYSIS
// ============================================================================

/**
 * Calculate freshness score for an org's intelligence data.
 * Returns 0-100 indicating how recent/fresh the data is.
 */
export async function calculateFreshnessScore(
  supabase: any,
  orgId: string,
  tableName: string = "content_effectiveness"
): Promise<FreshnessReport> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("created_at, updated_at")
      .eq("org_id", orgId);

    if (error || !data || data.length === 0) {
      return {
        freshness_score: 0,
        avg_age_days: 0,
        oldest_age_days: 0,
        newest_age_days: 0,
        total_items: 0,
        recommendation: "No intelligence data yet. Start tracking outcomes to build learning.",
      };
    }

    const now = Date.now();
    const ages = data.map((item: any) => {
      const date = new Date(item.updated_at || item.created_at);
      return (now - date.getTime()) / (1000 * 60 * 60 * 24);
    });

    const avgAge = ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length;
    const oldestAge = Math.max(...ages);
    const newestAge = Math.min(...ages);

    // Linear freshness: 100 at 0 days, 0 at 180 days
    const freshnessScore = Math.max(0, Math.min(100, 100 - (avgAge / 180) * 100));

    let recommendation = "";
    if (freshnessScore >= 80) recommendation = "Excellent — intelligence data is very fresh and relevant";
    else if (freshnessScore >= 60) recommendation = "Good — recent data, patterns are reliable";
    else if (freshnessScore >= 40) recommendation = "Aging — consider generating new outcomes to refresh data";
    else if (freshnessScore >= 20) recommendation = "Stale — data is old. New outcomes highly recommended";
    else recommendation = "Very stale — patterns may not reflect current conditions. Refresh urgently";

    return {
      freshness_score: Math.round(freshnessScore),
      avg_age_days: Math.round(avgAge),
      oldest_age_days: Math.round(oldestAge),
      newest_age_days: Math.round(newestAge),
      total_items: data.length,
      recommendation,
    };
  } catch {
    return {
      freshness_score: 0,
      avg_age_days: 0,
      oldest_age_days: 0,
      newest_age_days: 0,
      total_items: 0,
      recommendation: "Error calculating freshness",
    };
  }
}

// ============================================================================
// DECAY PROFILE DETECTION
// ============================================================================

/**
 * Auto-detect optimal decay profile based on org/domain characteristics.
 */
export function detectOptimalDecayProfile(
  domain?: string,
  dataPointCount?: number
): { recommended_profile: DecayProfile; reason: string } {
  const lower = (domain || "").toLowerCase();

  // Low data = conservative (preserve what little we have)
  if (dataPointCount !== undefined && dataPointCount < 40) {
    return {
      recommended_profile: "conservative",
      reason: "Limited data — preserving older patterns for stability",
    };
  }

  // High-velocity domains
  const highVelocity = ["tech", "software", "saas", "crypto", "ai", "startup", "ecommerce"];
  if (highVelocity.some((v) => lower.includes(v))) {
    return {
      recommended_profile: "aggressive",
      reason: "Fast-moving domain — recent patterns are much more valuable",
    };
  }

  // Stable domains
  const stable = ["finance", "insurance", "healthcare", "legal", "government", "education"];
  if (stable.some((v) => lower.includes(v))) {
    return {
      recommended_profile: "conservative",
      reason: "Stable domain — older patterns remain relevant longer",
    };
  }

  return {
    recommended_profile: "standard",
    reason: "Balanced approach for general conditions",
  };
}
