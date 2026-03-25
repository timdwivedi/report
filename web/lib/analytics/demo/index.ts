/**
 * Demo module barrel export
 */

export {
  getDemoFunnelStages,
  getDemoFunnelSummary,
  getDemoArchetypeDistribution,
  getDemoQuestionHeatmap,
  getDemoMetrics,
  getDemoABTests,
  getDemoConversionTrend,
  getDemoFunnelDaily,
} from "./analytics-demo-data";

export type { DemoArchetypeData, DemoTrendPoint } from "./analytics-demo-data";

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
} from "./analytics-demo-wrapper";
