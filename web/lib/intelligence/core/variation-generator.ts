/**
 * Universal Variation Generator (Multi-Armed Bandit A/B Testing)
 *
 * Transplanted from Invisible Pipeline's variation-generator.ts
 * Uses Thompson Sampling to automatically explore different content
 * approaches and exploit what works best.
 *
 * The bandit balances exploration (trying new things) vs exploitation
 * (using what works), converging on the best strategy over time.
 *
 * Original: 5 hook types for DM variations (curiosity/pain/social_proof/mechanism/controversy)
 * Universal: Config-driven content variation for ANY content type
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentVariation {
  id: string;
  approach_name: string;
  variation_text: string;
  style_description: string;
  hook_type: string;
  created_at: string;
}

export interface VariationArm {
  org_id: string;
  approach_name: string;
  hook_type: string;
  successes: number;       // Positive outcomes
  trials: number;          // Total attempts
  beta_alpha: number;      // Beta distribution alpha
  beta_beta: number;       // Beta distribution beta
  last_updated: string;
}

/** Default content approaches (can be overridden via config) */
export const DEFAULT_APPROACHES = [
  {
    name: "curiosity_gap",
    hook: "curiosity",
    instruction:
      "Create content that opens a curiosity gap. Tease valuable insight without revealing it. Make them want to respond to learn more.",
  },
  {
    name: "pain_agitate",
    hook: "pain",
    instruction:
      "Lead with their pain point. Agitate it slightly. Show deep understanding of their struggle.",
  },
  {
    name: "social_proof",
    hook: "social_proof",
    instruction:
      "Lead with social proof. Mention specific results from similar people. Use names and numbers if possible.",
  },
  {
    name: "mechanism_reveal",
    hook: "mechanism",
    instruction:
      "Reveal a specific mechanism or tactic. Give away real value. Be tactical and concrete.",
  },
  {
    name: "contrarian_take",
    hook: "controversy",
    instruction:
      "Take a contrarian position. Challenge common wisdom in their space. Be bold and provocative.",
  },
];

// ============================================================================
// THOMPSON SAMPLING (Core Algorithm)
// ============================================================================

/**
 * Select which variation arm to use via Thompson Sampling.
 * Samples from Beta(alpha, beta) for each arm and picks the highest.
 */
export function selectVariationArm(arms: VariationArm[]): VariationArm {
  if (arms.length === 0) {
    throw new Error("No arms available for selection");
  }

  let bestArm = arms[0];
  let bestSample = -1;

  for (const arm of arms) {
    const sample = sampleBeta(arm.beta_alpha, arm.beta_beta);
    if (sample > bestSample) {
      bestSample = sample;
      bestArm = arm;
    }
  }

  return bestArm;
}

/**
 * Update arm statistics after observing an outcome.
 */
export function updateArmStats(arm: VariationArm, success: boolean): VariationArm {
  return {
    ...arm,
    successes: arm.successes + (success ? 1 : 0),
    trials: arm.trials + 1,
    beta_alpha: arm.beta_alpha + (success ? 1 : 0),
    beta_beta: arm.beta_beta + (success ? 0 : 1),
    last_updated: new Date().toISOString(),
  };
}

/**
 * Create a new arm with optimistic prior Beta(2, 2).
 * Encourages exploration early on.
 */
export function createNewArm(orgId: string, approachName: string, hookType: string): VariationArm {
  return {
    org_id: orgId,
    approach_name: approachName,
    hook_type: hookType,
    successes: 0,
    trials: 0,
    beta_alpha: 2,
    beta_beta: 2,
    last_updated: new Date().toISOString(),
  };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Fetch all variation arms for an organization.
 */
export async function getOrgArms(supabase: any, orgId: string): Promise<VariationArm[]> {
  const { data, error } = await supabase
    .from("variation_arms")
    .select("*")
    .eq("org_id", orgId);

  if (error) {
    console.error("[Variation] Error fetching arms:", error);
    return [];
  }

  return data as VariationArm[];
}

/**
 * Initialize default arms for an org if they don't exist.
 * Uses DEFAULT_APPROACHES or custom approaches from config.
 */
export async function ensureOrgArms(
  supabase: any,
  orgId: string,
  customApproaches?: Array<{ name: string; hook: string }>
): Promise<VariationArm[]> {
  const existing = await getOrgArms(supabase, orgId);

  const approaches = customApproaches || DEFAULT_APPROACHES.map((a) => ({ name: a.name, hook: a.hook }));

  if (existing.length >= approaches.length) return existing;

  const newArms = approaches
    .filter((a) => !existing.find((e) => e.approach_name === a.name))
    .map((a) => ({
      org_id: orgId,
      approach_name: a.name,
      hook_type: a.hook,
      beta_alpha: 2,
      beta_beta: 2,
      successes: 0,
      trials: 0,
      last_updated: new Date().toISOString(),
    }));

  if (newArms.length > 0) {
    const { data, error } = await supabase.from("variation_arms").insert(newArms).select();

    if (error) {
      console.error("[Variation] Error creating arms:", error);
    } else {
      return [...existing, ...(data as VariationArm[])];
    }
  }

  return existing;
}

/**
 * Persist arm update to database.
 */
export async function persistArmUpdate(supabase: any, arm: VariationArm): Promise<void> {
  const { error } = await supabase
    .from("variation_arms")
    .update({
      successes: arm.successes,
      trials: arm.trials,
      beta_alpha: arm.beta_alpha,
      beta_beta: arm.beta_beta,
      last_updated: arm.last_updated,
    })
    .eq("org_id", arm.org_id)
    .eq("approach_name", arm.approach_name);

  if (error) {
    console.error("[Variation] Error persisting arm update:", error);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Calculate win rate with confidence interval for an arm.
 */
export function getArmWinRate(arm: VariationArm): {
  winRate: number;
  confidenceInterval: [number, number];
} {
  if (arm.trials === 0) {
    return { winRate: 0.5, confidenceInterval: [0, 1] };
  }

  const winRate = arm.successes / arm.trials;
  const stdErr = Math.sqrt((winRate * (1 - winRate)) / arm.trials);
  const lower = Math.max(0, winRate - 1.96 * stdErr);
  const upper = Math.min(1, winRate + 1.96 * stdErr);

  return { winRate, confidenceInterval: [lower, upper] };
}

/**
 * Check if we still need to explore (any arm under minimum trials).
 */
export function shouldExplore(arms: VariationArm[], minTrials: number = 10): boolean {
  return arms.some((arm) => arm.trials < minTrials);
}

/**
 * Get performance summary across all arms.
 */
export function getPerformanceSummary(arms: VariationArm[]): {
  bestArm: VariationArm | null;
  totalTrials: number;
  averageWinRate: number;
} {
  if (arms.length === 0) {
    return { bestArm: null, totalTrials: 0, averageWinRate: 0 };
  }

  const totalTrials = arms.reduce((sum, arm) => sum + arm.trials, 0);
  const totalSuccesses = arms.reduce((sum, arm) => sum + arm.successes, 0);
  const averageWinRate = totalTrials > 0 ? totalSuccesses / totalTrials : 0;

  let bestArm = arms[0];
  let bestRate = getArmWinRate(arms[0]).winRate;

  for (const arm of arms) {
    const rate = getArmWinRate(arm).winRate;
    if (rate > bestRate && arm.trials >= 5) {
      bestRate = rate;
      bestArm = arm;
    }
  }

  return { bestArm, totalTrials, averageWinRate };
}

/**
 * Check if a champion arm should be promoted (auto-promote winners).
 * Returns the champion arm if promotion criteria are met.
 */
export async function checkAndPromoteChampion(
  supabase: any,
  orgId: string,
  promotionCallback?: (champion: VariationArm, winRate: number) => Promise<void>
): Promise<VariationArm | null> {
  const arms = await getOrgArms(supabase, orgId);
  const summary = getPerformanceSummary(arms);

  if (!summary.bestArm) return null;

  const { winRate } = getArmWinRate(summary.bestArm);

  // Promotion criteria: 20+ trials and 25%+ win rate
  if (summary.bestArm.trials >= 20 && winRate >= 0.25) {
    if (promotionCallback) {
      await promotionCallback(summary.bestArm, winRate);
    }
    return summary.bestArm;
  }

  return null;
}

// ============================================================================
// MATH HELPERS (Beta/Gamma Sampling)
// ============================================================================

/** Sample from Beta(alpha, beta) distribution using Gamma sampling */
function sampleBeta(alpha: number, beta: number): number {
  const x = sampleGamma(alpha, 1);
  const y = sampleGamma(beta, 1);
  return x / (x + y);
}

/** Sample from Gamma(alpha, beta) using Marsaglia and Tsang's method */
function sampleGamma(alpha: number, beta: number): number {
  if (alpha < 1) {
    return sampleGamma(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
  }

  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    let x: number, v: number;
    do {
      x = randomNormal();
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = Math.random();

    if (u < 1 - 0.0331 * x * x * x * x) {
      return (d * v) / beta;
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return (d * v) / beta;
    }
  }
}

/** Box-Muller transform for normal distribution */
function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
