/**
 * Universal Weight Optimizer (Dynamic Signal Weighting)
 *
 * Transplanted from Invisible Pipeline's weight-optimizer.ts (~334 lines)
 *
 * Replaces static signal weights with data-driven weights based on
 * actual outcome correlations. Instead of guessing which signals matter most
 * (e.g., "REPLY=1, ENGAGED=3"), it analyzes real data to find what
 * ACTUALLY predicts success for each org.
 *
 * KEY INSIGHT: Different domains have different signal importance.
 * In sales, a "replied" signal might be weak. In coaching, it's gold.
 * The optimizer learns this automatically.
 *
 * Original: Blueprint-specific signal weight optimization in IP
 * Universal: Config-driven weight learning for ANY scoring domain
 */

import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// TYPES
// ============================================================================

export interface SignalWeightMap {
  [signalType: string]: number;
}

export interface WeightOptimizationResult {
  org_id: string;
  optimized_weights: SignalWeightMap;
  confidence_level: "low" | "medium" | "high";
  based_on_outcomes: number;
  conversion_rates: Record<string, number>;
  improvement_over_baseline?: number;
}

export interface WeightEvolutionEntry {
  timestamp: string;
  weights: SignalWeightMap;
  sample_size: number;
  confidence: "low" | "medium" | "high";
}

// ============================================================================
// OPTIMIZER
// ============================================================================

/**
 * Calculate optimal signal weights based on real outcome data.
 *
 * Algorithm:
 * 1. Get all subjects with their signal history
 * 2. Identify which subjects reached the success outcome
 * 3. Calculate per-signal conversion rate (what % of subjects with this signal succeeded)
 * 4. Normalize weights relative to the strongest signal
 *
 * @param supabase - Database client
 * @param orgId - Organization ID
 * @param config - Intelligence config (for signal definitions)
 */
export async function optimizeSignalWeights(
  supabase: any,
  orgId: string,
  config: IntelligenceConfig
): Promise<WeightOptimizationResult | null> {
  try {
    // 1. Get all temporal events (signals) for this org
    const { data: events, error: eventsError } = await supabase
      .from("temporal_events")
      .select("subject_id, event_type, occurred_at")
      .eq("org_id", orgId)
      .order("occurred_at", { ascending: true });

    if (eventsError || !events || events.length === 0) return null;

    // 2. Group events by subject
    const subjectEvents = new Map<string, { events: Set<string>; succeeded: boolean }>();

    for (const event of events) {
      if (!subjectEvents.has(event.subject_id)) {
        subjectEvents.set(event.subject_id, { events: new Set(), succeeded: false });
      }
      const entry = subjectEvents.get(event.subject_id)!;
      entry.events.add(event.event_type);

      // Check for success outcome (config-driven)
      const successSignal = (config.scoring as any)?.successSignal || "converted";
      if (event.event_type === successSignal) {
        entry.succeeded = true;
      }
    }

    // 3. Calculate per-signal conversion rate
    const signalStats: Record<string, { total: number; successes: number }> = {};

    for (const [, data] of subjectEvents) {
      for (const eventType of data.events) {
        if (!signalStats[eventType]) {
          signalStats[eventType] = { total: 0, successes: 0 };
        }
        signalStats[eventType].total++;
        if (data.succeeded) {
          signalStats[eventType].successes++;
        }
      }
    }

    // 4. Calculate conversion rates
    const conversionRates: Record<string, number> = {};
    let maxRate = 0;

    for (const [signal, stats] of Object.entries(signalStats)) {
      const rate = stats.total > 0 ? stats.successes / stats.total : 0;
      conversionRates[signal] = rate;
      if (rate > maxRate) maxRate = rate;
    }

    // 5. Normalize weights (strongest signal = max weight from config)
    const maxWeight = (config.scoring as any)?.maxSignalWeight || 15;
    const optimizedWeights: SignalWeightMap = {};

    for (const [signal, rate] of Object.entries(conversionRates)) {
      if (maxRate > 0) {
        optimizedWeights[signal] = Math.max(0.5, Math.round((rate / maxRate) * maxWeight * 10) / 10);
      } else {
        optimizedWeights[signal] = 1;
      }
    }

    // 6. Determine confidence
    const successCount = Array.from(subjectEvents.values()).filter((d) => d.succeeded).length;
    let confidenceLevel: "low" | "medium" | "high" = "low";
    if (successCount >= 10) confidenceLevel = "high";
    else if (successCount >= 5) confidenceLevel = "medium";

    // 7. Persist optimization result
    await persistOptimization(supabase, orgId, optimizedWeights, conversionRates, successCount, confidenceLevel);

    return {
      org_id: orgId,
      optimized_weights: optimizedWeights,
      confidence_level: confidenceLevel,
      based_on_outcomes: successCount,
      conversion_rates: conversionRates,
    };
  } catch (error) {
    console.error("[WeightOptimizer] Error optimizing weights:", error);
    return null;
  }
}

/**
 * Get current signal weights for an org.
 * Returns optimized weights if available and confident enough, otherwise defaults.
 */
export async function getOrgWeights(
  supabase: any,
  orgId: string,
  config: IntelligenceConfig
): Promise<SignalWeightMap> {
  try {
    const { data } = await supabase
      .from("intelligence_configs")
      .select("custom_overrides")
      .eq("org_id", orgId)
      .maybeSingle();

    const optimization = data?.custom_overrides?.weight_optimization;

    if (optimization?.optimized_weights && optimization?.confidence_level !== "low") {
      return optimization.optimized_weights as SignalWeightMap;
    }

    // Fall back to config defaults
    return getDefaultWeights(config);
  } catch {
    return getDefaultWeights(config);
  }
}

/**
 * Check if an org should trigger weight optimization.
 * Triggers after every N successful outcomes (configurable).
 */
export async function shouldOptimize(
  supabase: any,
  orgId: string,
  triggerEvery: number = 5
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("intelligence_configs")
      .select("custom_overrides")
      .eq("org_id", orgId)
      .maybeSingle();

    const lastSampleSize = data?.custom_overrides?.weight_optimization?.sample_size || 0;

    // Count current successful outcomes
    const { count } = await supabase
      .from("temporal_events")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("event_type", "converted");

    const currentCount = count || 0;

    return (
      (currentCount >= triggerEvery && lastSampleSize === 0) ||
      currentCount - lastSampleSize >= triggerEvery
    );
  } catch {
    return false;
  }
}

/**
 * Get weight optimization stats for display/analytics.
 */
export async function getOptimizationStats(
  supabase: any,
  orgId: string,
  config: IntelligenceConfig
): Promise<{
  using_optimized: boolean;
  current_weights: SignalWeightMap;
  confidence_level?: "low" | "medium" | "high";
  based_on_outcomes?: number;
  last_optimized?: string;
} | null> {
  try {
    const { data } = await supabase
      .from("intelligence_configs")
      .select("custom_overrides")
      .eq("org_id", orgId)
      .maybeSingle();

    const optimization = data?.custom_overrides?.weight_optimization;
    const hasOptimized = optimization?.optimized_weights && optimization?.confidence_level !== "low";

    return {
      using_optimized: !!hasOptimized,
      current_weights: hasOptimized
        ? (optimization.optimized_weights as SignalWeightMap)
        : getDefaultWeights(config),
      confidence_level: optimization?.confidence_level,
      based_on_outcomes: optimization?.sample_size,
      last_optimized: optimization?.last_optimized,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// PERSISTENCE
// ============================================================================

async function persistOptimization(
  supabase: any,
  orgId: string,
  weights: SignalWeightMap,
  conversionRates: Record<string, number>,
  sampleSize: number,
  confidence: "low" | "medium" | "high"
): Promise<void> {
  try {
    const optimization = {
      optimized_weights: weights,
      conversion_rates: conversionRates,
      sample_size: sampleSize,
      confidence_level: confidence,
      last_optimized: new Date().toISOString(),
    };

    // Upsert into intelligence_configs.custom_overrides
    const { data: existing } = await supabase
      .from("intelligence_configs")
      .select("id, custom_overrides")
      .eq("org_id", orgId)
      .maybeSingle();

    if (existing) {
      const overrides = existing.custom_overrides || {};
      overrides.weight_optimization = optimization;
      await supabase
        .from("intelligence_configs")
        .update({ custom_overrides: overrides })
        .eq("id", existing.id);
    } else {
      await supabase.from("intelligence_configs").insert({
        org_id: orgId,
        config: {},
        custom_overrides: { weight_optimization: optimization },
      });
    }
  } catch (err) {
    console.error("[WeightOptimizer] Persist failed:", err);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultWeights(config: IntelligenceConfig): SignalWeightMap {
  const weights: SignalWeightMap = {};

  // Build defaults from config signals
  if (config.scoring?.signals) {
    for (const signal of config.scoring.signals) {
      weights[signal.name] = signal.weight || 1;
    }
  }

  // If no config signals, provide sensible defaults
  if (Object.keys(weights).length === 0) {
    weights.contacted = 1;
    weights.replied = 3;
    weights.engaged = 5;
    weights.converted = 15;
  }

  return weights;
}
