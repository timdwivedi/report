/**
 * Discovery Analytics Engine — Type Definitions
 *
 * All TypeScript interfaces for the analytics module.
 * Used by: tracker, API routes, UI components, aggregator, A/B engine.
 */

// ─── Event Types ────────────────────────────────────────────────────────────

export type EventCategory = "funnel" | "engagement" | "conversion" | "system";

export type FunnelStage =
  | "landing"
  | "quiz_start"
  | `quiz_q${number}`
  | "quiz_complete"
  | "bridge_view"
  | "bridge_cta"
  | "application_start"
  | "application_submit";

export interface AnalyticsEvent {
  event_type: string;
  session_id: string;
  org_id: string;
  event_category: EventCategory;
  properties: Record<string, unknown>;
  page_path: string;
  funnel_stage: FunnelStage | string | null;
  quiz_submission_id: string | null;
  ab_test_id: string | null;
  ab_variant: string | null;
  duration_ms: number | null;
  created_at: string;
}

// ─── Session Types ──────────────────────────────────────────────────────────

export interface SessionData {
  session_id: string;
  device_type: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  landing_page: string;
  ab_assignments: Record<string, string>;
  created_at: string;
}

// ─── Funnel Types ───────────────────────────────────────────────────────────

export interface FunnelDailyRow {
  id: string;
  org_id: string;
  date: string;
  landing_views: number;
  quiz_starts: number;
  quiz_completes: number;
  bridge_views: number;
  bridge_cta_clicks: number;
  application_starts: number;
  application_submits: number;
  question_dropoffs: number[];
  archetype_distribution: Record<string, number>;
  avg_quiz_time_seconds: number | null;
  avg_bridge_time_seconds: number | null;
  avg_bridge_scroll_depth: number | null;
  voice_text_split: { voice: number; text: number; mixed: number };
  device_breakdown: Record<string, number>;
  source_breakdown: Record<string, number>;
  ab_test_results: Record<string, ABTestDailyStats>;
  unique_sessions: number;
}

export interface FunnelStageData {
  stage: string;
  label: string;
  count: number;
  rate: number | null;
  dropoff: number | null;
}

export interface FunnelSummary {
  stages: FunnelStageData[];
  overall_conversion_rate: number;
  total_visitors: number;
  date_range: { start: string; end: string };
}

// ─── Heatmap Types ──────────────────────────────────────────────────────────

export interface QuestionHeatmapRow {
  question_index: number;
  question_text: string;
  avg_duration_ms: number;
  dropoff_rate: number;
  voice_percent: number;
  text_percent: number;
  mixed_percent: number;
  avg_answer_length: number;
  total_answers: number;
}

// ─── A/B Test Types ─────────────────────────────────────────────────────────

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
}

export interface ABTest {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  test_type: "bridge" | "quiz" | "landing" | "application";
  variants: ABTestVariant[];
  target_metric: string;
  status: "draft" | "running" | "paused" | "completed";
  winner_variant: string | null;
  stats_cache: Record<string, ABVariantStats>;
  confidence_level: number | null;
  min_sample_size: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ABVariantStats {
  impressions: number;
  conversions: number;
  rate: number;
  ci_low: number;
  ci_high: number;
}

export interface ABTestDailyStats {
  [variantId: string]: { views: number; converts: number };
}

export interface ABSignificanceResult {
  pValue: number;
  significant: boolean;
  lift: number;
  confidence: number;
}

// ─── Metric Types ───────────────────────────────────────────────────────────

export interface MetricData {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: {
    direction: "up" | "down" | "flat";
    percent: number;
    period: string;
  };
}

// ─── Cross-Build Types ──────────────────────────────────────────────────────

export interface CrossBuildFunnelRow {
  slug: string;
  date: string;
  vertical: string | null;
  landing_views: number;
  quiz_starts: number;
  quiz_completes: number;
  bridge_views: number;
  bridge_cta_clicks: number;
  application_starts: number;
  application_submits: number;
  landing_to_quiz_rate: number | null;
  quiz_completion_rate: number | null;
  bridge_to_cta_rate: number | null;
  application_completion_rate: number | null;
  overall_conversion_rate: number | null;
  avg_quiz_time_seconds: number | null;
  avg_bridge_time_seconds: number | null;
  active_ab_tests: number;
  synced_at: string;
}

// ─── Tracker Config ─────────────────────────────────────────────────────────

export interface TrackerConfig {
  orgId: string;
  endpoint: string;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

// ─── Anomaly Detection ──────────────────────────────────────────────────────

export type AlertLevel = "info" | "warning" | "critical";

export interface FunnelAnomaly {
  slug: string;
  metric: string;
  current: number;
  average: number;
  change_percent: number;
  level: AlertLevel;
  message: string;
}
