/**
 * Demo Layer — "Shut Up And Take My Money" Mode
 *
 * One env var makes the entire intelligence engine work without database:
 *   NEXT_PUBLIC_DEMO_MODE=true   → demo data (this layer)
 *   NEXT_PUBLIC_DEMO_MODE=false  → real Supabase + AI
 *
 * Or add ?demo=true to any page URL for instant demo mode.
 */

// Mode detection
export { isDemoMode } from "./demo-data-provider";

// Generic wrapper (use this for custom operations)
export {
  getDemoOrReal,
  getDemoOrRealSync,
} from "./demo-intelligence-wrapper";

// Pre-wired wrappers (use these for standard intelligence operations)
export {
  getSubjectsOrDemo,
  getSubjectIntelligenceOrDemo,
  getPipelineSummaryOrDemo,
  getEffectivenessOrDemo,
  getBestStyleOrDemo,
  getVariationArmsOrDemo,
  getVoiceDNAOrDemo,
  getConstitutionOrDemo,
  getTemporalPatternOrDemo,
  getCohortDataOrDemo,
} from "./demo-intelligence-wrapper";

// Raw demo data (for Agent 5 wiring & component previews)
export {
  getDemoSubjects,
  getDemoSubject,
  getDemoSubjectIntelligence,
  getDemoSubjectsByTier,
  getDemoPipelineSummary,
  getDemoEffectiveness,
  getDemoBestStyle,
  getDemoVariationArms,
  getDemoChampionApproach,
  getDemoVoiceDNA,
  getDemoConstitution,
  getDemoTemporalPattern,
  getDemoCohortData,
} from "./demo-data-provider";

// Seed data types
export type { DemoSubject } from "./demo-seed-data";
