/**
 * Analytics Demo Wrapper — getOrDemo() pattern.
 *
 * Follows the same pattern as intelligence's demo-intelligence-wrapper.ts.
 * Returns demo data when no database is available, real data when it is.
 */

import type {
  FunnelSummary,
  QuestionHeatmapRow,
  MetricData,
  ABTest,
} from "../types/analytics.types";
import type { DemoArchetypeData, DemoTrendPoint } from "./analytics-demo-data";
import {
  getDemoFunnelSummary,
  getDemoArchetypeDistribution,
  getDemoQuestionHeatmap,
  getDemoMetrics,
  getDemoABTests,
  getDemoConversionTrend,
} from "./analytics-demo-data";

/** Check if we're in demo mode */
export function isAnalyticsDemoMode(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  }
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("demo") === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

/** Generic wrapper: try fetcher, fall back to demo data */
export async function getAnalyticsOrDemo<T>(
  fetcher: () => Promise<T>,
  demoFallback: () => T
): Promise<T> {
  if (isAnalyticsDemoMode()) {
    return demoFallback();
  }

  try {
    return await fetcher();
  } catch {
    return demoFallback();
  }
}

/** Sync wrapper for components that can't be async */
export function getAnalyticsOrDemoSync<T>(
  realData: T | null | undefined,
  demoFallback: () => T
): T {
  if (realData != null) return realData;
  return demoFallback();
}

// ─── Typed Wrappers ─────────────────────────────────────────────────────────

export function getFunnelSummaryOrDemo(
  realData?: FunnelSummary | null
): FunnelSummary {
  return getAnalyticsOrDemoSync(realData, getDemoFunnelSummary);
}

export function getArchetypeDistributionOrDemo(
  realData?: DemoArchetypeData[] | null
): DemoArchetypeData[] {
  return getAnalyticsOrDemoSync(realData, getDemoArchetypeDistribution);
}

export function getQuestionHeatmapOrDemo(
  realData?: QuestionHeatmapRow[] | null
): QuestionHeatmapRow[] {
  return getAnalyticsOrDemoSync(realData, getDemoQuestionHeatmap);
}

export function getMetricsOrDemo(
  realData?: MetricData[] | null
): MetricData[] {
  return getAnalyticsOrDemoSync(realData, getDemoMetrics);
}

export function getABTestsOrDemo(
  realData?: ABTest[] | null
): ABTest[] {
  return getAnalyticsOrDemoSync(realData, getDemoABTests);
}

export function getConversionTrendOrDemo(
  realData?: DemoTrendPoint[] | null,
  days?: number
): DemoTrendPoint[] {
  return getAnalyticsOrDemoSync(realData, () => getDemoConversionTrend(days));
}
