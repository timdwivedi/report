/**
 * A/B Test Engine — Variant assignment + statistical significance
 *
 * Features:
 * - Deterministic variant assignment via murmur3 hash (no cookies)
 * - Two-proportion z-test for significance (p < 0.05)
 * - Auto-promotion when significance + min sample reached
 * - Stats cache updates for fast dashboard reads
 *
 * Used by: tracker (client-side assignment), aggregate route (stats update)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ABTest,
  ABVariantStats,
  ABSignificanceResult,
} from "../types/analytics.types";

// ─── Significance Calculation ───────────────────────────────────────────────

/**
 * Two-proportion z-test.
 * Compares conversion rates of two variants.
 * Returns significance result with confidence level.
 */
export function calculateSignificance(
  control: { conversions: number; impressions: number },
  variant: { conversions: number; impressions: number }
): ABSignificanceResult {
  // Guard: need impressions in both groups
  if (control.impressions === 0 || variant.impressions === 0) {
    return { pValue: 1, significant: false, lift: 0, confidence: 0 };
  }

  const p1 = control.conversions / control.impressions;
  const p2 = variant.conversions / variant.impressions;

  // Pooled proportion
  const totalConversions = control.conversions + variant.conversions;
  const totalImpressions = control.impressions + variant.impressions;
  const pooledP = totalConversions / totalImpressions;

  // Standard error
  const se = Math.sqrt(
    pooledP * (1 - pooledP) * (1 / control.impressions + 1 / variant.impressions)
  );

  if (se === 0 || !isFinite(se)) {
    return { pValue: 1, significant: false, lift: 0, confidence: 0 };
  }

  // Z-score
  const z = Math.abs(p2 - p1) / se;

  // p-value from z-score (two-tailed approximation)
  const pValue = 2 * (1 - normalCDF(z));

  // Lift (relative improvement of variant over control)
  const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

  return {
    pValue,
    significant: pValue < 0.05,
    lift,
    confidence: (1 - pValue) * 100,
  };
}

/**
 * Compute Wilson score confidence interval for a proportion.
 * Better than normal approximation for small samples.
 */
export function wilsonInterval(
  conversions: number,
  impressions: number,
  zAlpha: number = 1.96 // 95% confidence
): { low: number; high: number } {
  if (impressions === 0) return { low: 0, high: 0 };

  const p = conversions / impressions;
  const denominator = 1 + zAlpha * zAlpha / impressions;
  const center = (p + zAlpha * zAlpha / (2 * impressions)) / denominator;
  const margin =
    (zAlpha * Math.sqrt(p * (1 - p) / impressions + zAlpha * zAlpha / (4 * impressions * impressions))) /
    denominator;

  return {
    low: Math.max(0, (center - margin) * 100),
    high: Math.min(100, (center + margin) * 100),
  };
}

// ─── Stats Update ──────────────────────────────────────────────────────────

/** Compute stats for all variants of a test from raw events */
export async function computeTestStats(
  supabase: SupabaseClient,
  test: ABTest
): Promise<{ stats: Record<string, ABVariantStats>; significance: ABSignificanceResult | null }> {
  const stats: Record<string, ABVariantStats> = {};

  for (const variant of test.variants) {
    // Count impressions (events with this ab_variant)
    const { count: impressions } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("ab_test_id", test.id)
      .eq("ab_variant", variant.id);

    // Count conversions (events matching target metric with this variant)
    const { count: conversions } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("ab_test_id", test.id)
      .eq("ab_variant", variant.id)
      .eq("event_type", test.target_metric);

    const imp = impressions || 0;
    const conv = conversions || 0;
    const rate = imp > 0 ? (conv / imp) * 100 : 0;
    const ci = wilsonInterval(conv, imp);

    stats[variant.id] = {
      impressions: imp,
      conversions: conv,
      rate,
      ci_low: ci.low,
      ci_high: ci.high,
    };
  }

  // Calculate significance between first two variants (control vs variant)
  let significance: ABSignificanceResult | null = null;
  if (test.variants.length >= 2) {
    const controlStats = stats[test.variants[0].id];
    const variantStats = stats[test.variants[1].id];

    if (controlStats && variantStats) {
      significance = calculateSignificance(
        { conversions: controlStats.conversions, impressions: controlStats.impressions },
        { conversions: variantStats.conversions, impressions: variantStats.impressions }
      );
    }
  }

  return { stats, significance };
}

/** Check if test should auto-promote a winner */
export function shouldAutoPromote(
  test: ABTest,
  stats: Record<string, ABVariantStats>,
  significance: ABSignificanceResult | null
): { promote: boolean; winnerId: string | null } {
  if (test.status !== "running" || !significance?.significant) {
    return { promote: false, winnerId: null };
  }

  // Check minimum sample size per variant
  for (const variant of test.variants) {
    const variantStats = stats[variant.id];
    if (!variantStats || variantStats.impressions < test.min_sample_size) {
      return { promote: false, winnerId: null };
    }
  }

  // Find the variant with highest conversion rate
  let bestId: string | null = null;
  let bestRate = -1;

  for (const variant of test.variants) {
    const variantStats = stats[variant.id];
    if (variantStats && variantStats.rate > bestRate) {
      bestRate = variantStats.rate;
      bestId = variant.id;
    }
  }

  return { promote: true, winnerId: bestId };
}

/** Update test stats_cache and potentially promote winner */
export async function updateTestStats(
  supabase: SupabaseClient,
  test: ABTest
): Promise<{ updated: boolean; promoted: boolean; winnerId?: string }> {
  const { stats, significance } = await computeTestStats(supabase, test);

  const updates: Record<string, unknown> = {
    stats_cache: stats,
    confidence_level: significance?.confidence ? significance.confidence / 100 : null,
  };

  // Check for auto-promotion
  const promotion = shouldAutoPromote(test, stats, significance);
  if (promotion.promote && promotion.winnerId) {
    updates.winner_variant = promotion.winnerId;
    updates.status = "completed";
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("ab_tests")
    .update(updates)
    .eq("id", test.id);

  if (error) {
    console.error("[ab-test-engine] update stats error:", error.message);
    return { updated: false, promoted: false };
  }

  return {
    updated: true,
    promoted: promotion.promote,
    winnerId: promotion.winnerId || undefined,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normal CDF approximation (Abramowitz and Stegun) */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327; // 1 / sqrt(2 * PI)
  const p =
    d *
    Math.exp(-0.5 * x * x) *
    (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));

  return x >= 0 ? 1 - p : p;
}
