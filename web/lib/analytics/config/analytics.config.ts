/**
 * Analytics Configuration
 *
 * Config-driven analytics setup per build.
 * Loaded from environment or build-time config.
 */

import type { TrackerConfig } from "../types/analytics.types";

export interface AnalyticsConfig {
  /** Whether analytics tracking is enabled */
  enabled: boolean;

  /** Organization ID for this build */
  orgId: string;

  /** API endpoint for event ingestion */
  endpoint: string;

  /** Number of events to batch before flushing */
  batchSize: number;

  /** Max time (ms) between flushes */
  flushInterval: number;

  /** Number of quiz questions in this build's discovery flow */
  questionCount: number;

  /** Result type labels (archetype names) */
  resultTypeLabels: Record<string, string>;

  /** Bridge page section names (for section_view tracking) */
  bridgeSections: string[];

  /** Whether A/B testing is enabled */
  abTestingEnabled: boolean;

  /** Whether to log events to console in development */
  debug: boolean;
}

/** Default config — works for any build without customization */
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  orgId: "",
  endpoint: "/api/analytics/events",
  batchSize: 5,
  flushInterval: 3000,
  questionCount: 6,
  resultTypeLabels: {},
  bridgeSections: ["hero", "mirror", "strengths", "blindspot", "tools", "cta"],
  abTestingEnabled: false,
  debug: false,
};

/** Load analytics config from environment */
export function loadAnalyticsConfig(
  overrides?: Partial<AnalyticsConfig>
): AnalyticsConfig {
  const envOrgId =
    typeof window !== "undefined"
      ? ((window as unknown as Record<string, unknown>).__NEXT_DATA__ as Record<string, Record<string, Record<string, string>>> | undefined)?.props?.pageProps?.orgId
      : undefined;

  return {
    ...DEFAULT_ANALYTICS_CONFIG,
    orgId: process.env.NEXT_PUBLIC_ORG_ID || (envOrgId as string) || "",
    debug: process.env.NODE_ENV === "development",
    ...overrides,
  };
}

/** Convert AnalyticsConfig to TrackerConfig */
export function toTrackerConfig(config: AnalyticsConfig): TrackerConfig {
  return {
    orgId: config.orgId,
    endpoint: config.endpoint,
    batchSize: config.batchSize,
    flushInterval: config.flushInterval,
    debug: config.debug,
  };
}
