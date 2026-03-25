/**
 * Discovery Analytics Engine
 *
 * Built-in conversion tracking for every Bloom build.
 * While competitors use Hotjar + GA, Bloom builds track funnel
 * conversion natively — agents read real data, cross-build
 * intelligence improves all builds.
 *
 * Usage:
 *   import { DiscoveryTracker, FunnelChart, MetricCard } from "@/lib/analytics"
 *
 * Architecture:
 *   - Config-driven: AnalyticsConfig controls all behavior
 *   - sendBeacon transport: Non-blocking, survives page unload
 *   - Demo mode: Works without database (same pattern as intelligence engine)
 *   - A/B testing: Deterministic hash assignment, no cookies
 *   - Cross-build: Aggregated patterns flow to SAAS platform
 */

// Core: Client Tracking (Phase 2)
export { DiscoveryTracker } from "./core";
export { BeaconTransport } from "./core";
export { SessionManager } from "./core";

// Core: Server-side (Phase 3)
export { computeFunnel, computeQuestionHeatmap } from "./core";
export { aggregateDay, upsertDailyAggregate, syncToSAAS } from "./core";

// Core: A/B Testing (Phase 4)
export {
  calculateSignificance,
  wilsonInterval,
  computeTestStats,
  shouldAutoPromote,
  updateTestStats,
} from "./core";

// Config
export { DEFAULT_ANALYTICS_CONFIG, loadAnalyticsConfig } from "./config/analytics.config";
export type { AnalyticsConfig } from "./config/analytics.config";
export {
  EVENT_TAXONOMY,
  FUNNEL_STAGE_ORDER,
  getEventDefinition,
  getFunnelEvents,
  validateEvent,
  inferFunnelStage,
} from "./config/events.config";

// Types
export type {
  AnalyticsEvent,
  SessionData,
  FunnelDailyRow,
  FunnelStageData,
  FunnelSummary,
  QuestionHeatmapRow,
  ABTest,
  ABTestVariant,
  ABVariantStats,
  ABTestDailyStats,
  ABSignificanceResult,
  MetricData,
  CrossBuildFunnelRow,
  TrackerConfig,
  FunnelAnomaly,
  AlertLevel,
} from "./types/analytics.types";

// Analytics Registry (Agent Backbone)
export {
  ANALYTICS_MODULES,
  getEnabledModules as getEnabledAnalyticsModules,
  getRequiredFiles as getAnalyticsRequiredFiles,
  getRequiredTables as getAnalyticsRequiredTables,
  detectModulesFromIntake as detectAnalyticsModulesFromIntake,
  getModule as getAnalyticsModule,
} from "./analytics-registry";
export type { AnalyticsModule } from "./analytics-registry";

// Demo Mode (Phase 0 — works without database)
export {
  isAnalyticsDemoMode,
  getAnalyticsOrDemo,
  getAnalyticsOrDemoSync,
  getFunnelSummaryOrDemo,
  getArchetypeDistributionOrDemo,
  getQuestionHeatmapOrDemo,
  getMetricsOrDemo,
  getABTestsOrDemo,
  getConversionTrendOrDemo,
} from "./demo";

// Demo Raw Data (for Agent 5 wiring)
export {
  getDemoFunnelStages,
  getDemoFunnelSummary,
  getDemoArchetypeDistribution,
  getDemoQuestionHeatmap,
  getDemoMetrics,
  getDemoABTests,
  getDemoConversionTrend,
  getDemoFunnelDaily,
} from "./demo";

// UI Components
export { MetricCard } from "./ui";
export { FunnelChart } from "./ui";
export { ArchetypeDistribution } from "./ui";
export { HeatMap } from "./ui";
export { ABTestCard } from "./ui";
export { ConversionTrend } from "./ui";
