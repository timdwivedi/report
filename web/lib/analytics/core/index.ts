/**
 * Analytics Core — barrel export
 *
 * Phase 2+ modules: tracker, beacon transport, session manager,
 * funnel calculator, aggregator, A/B test engine.
 */

// Phase 2: Client Tracking
export { DiscoveryTracker } from "./tracker";
export { BeaconTransport } from "./beacon-transport";
export { SessionManager } from "./session-manager";

// Phase 3: Server-side
export { computeFunnel, computeQuestionHeatmap } from "./funnel-calculator";
export { aggregateDay, upsertDailyAggregate, syncToSAAS } from "./aggregator";

// Phase 4: A/B Testing
export {
  calculateSignificance,
  wilsonInterval,
  computeTestStats,
  shouldAutoPromote,
  updateTestStats,
} from "./ab-test-engine";
