/**
 * Demo Intelligence Wrapper — The Single Switch
 *
 * This file provides `getDemoOrReal()` — a simple wrapper that routes
 * intelligence service calls to either the demo data provider or the
 * real Supabase-backed services.
 *
 * ZERO conditional logic in components. Components just call the wrapper.
 *
 * Usage in components:
 *   const subjects = await getDemoOrReal(
 *     () => getDemoSubjects(),                    // demo path
 *     () => fetchRealSubjects(supabase, orgId)    // real path
 *   );
 *
 * HOW AGENTS USE THIS:
 *   Agent 5 wires components to use getDemoOrReal().
 *   In demo mode → app is fully functional without setup.
 *   Client sees it, loves it, signs. Then flip to production.
 */

import { isDemoMode } from "./demo-data-provider";

// ============================================================================
// THE WRAPPER — Routes demo vs real calls
// ============================================================================

/**
 * Route to demo or real data based on NEXT_PUBLIC_DEMO_MODE.
 *
 * @param demoFn  - Zero-cost function returning demo data (no API/DB calls)
 * @param realFn  - Real function hitting Supabase/AI (only called in production)
 * @returns The result from whichever path is active
 */
export async function getDemoOrReal<T>(
  demoFn: () => T | Promise<T>,
  realFn: () => T | Promise<T>,
): Promise<T> {
  if (isDemoMode()) {
    return demoFn();
  }
  return realFn();
}

/**
 * Sync version for cases where demo data is always synchronous.
 */
export function getDemoOrRealSync<T>(
  demoFn: () => T,
  realFn: () => T,
): T {
  if (isDemoMode()) {
    return demoFn();
  }
  return realFn();
}

// ============================================================================
// PRE-WIRED WRAPPERS — Common intelligence operations with demo fallbacks
// ============================================================================

import {
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

import type { DemoSubject } from "./demo-seed-data";

/**
 * Get all subjects (pipeline view).
 * Demo: returns 30 realistic subjects.
 * Real: hits subject_intelligence table.
 */
export async function getSubjectsOrDemo(
  realFn?: () => Promise<DemoSubject[]>,
): Promise<DemoSubject[]> {
  if (isDemoMode()) return getDemoSubjects();
  if (realFn) return realFn();
  return getDemoSubjects(); // fallback if no real fn provided
}

/**
 * Get single subject intelligence.
 * Demo: returns full intelligence record from seed data.
 * Real: hits subject_intelligence table by ID.
 */
export async function getSubjectIntelligenceOrDemo(
  subjectId: string,
  realFn?: () => Promise<any>,
): Promise<any> {
  if (isDemoMode()) return getDemoSubjectIntelligence(subjectId);
  if (realFn) return realFn();
  return getDemoSubjectIntelligence(subjectId);
}

/**
 * Get pipeline summary (tier distribution).
 * Demo: returns computed summary from 30 subjects.
 * Real: aggregates from subject_intelligence.
 */
export async function getPipelineSummaryOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoPipelineSummary>>,
): Promise<ReturnType<typeof getDemoPipelineSummary>> {
  if (isDemoMode()) return getDemoPipelineSummary();
  if (realFn) return realFn();
  return getDemoPipelineSummary();
}

/**
 * Get effectiveness matrix.
 * Demo: returns 10 style×type combinations.
 * Real: queries content_effectiveness table.
 */
export async function getEffectivenessOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoEffectiveness>>,
): Promise<ReturnType<typeof getDemoEffectiveness>> {
  if (isDemoMode()) return getDemoEffectiveness();
  if (realFn) return realFn();
  return getDemoEffectiveness();
}

/**
 * Get best style recommendation for a subject type.
 * Demo: picks highest conversion rate from seed data.
 * Real: queries content_effectiveness with sorting.
 */
export async function getBestStyleOrDemo(
  subjectType: string,
  realFn?: () => Promise<ReturnType<typeof getDemoBestStyle>>,
): Promise<ReturnType<typeof getDemoBestStyle>> {
  if (isDemoMode()) return getDemoBestStyle(subjectType);
  if (realFn) return realFn();
  return getDemoBestStyle(subjectType);
}

/**
 * Get variation arms (A/B testing).
 * Demo: returns 7 approaches with Thompson Sampling stats.
 * Real: queries variation_arms table.
 */
export async function getVariationArmsOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoVariationArms>>,
): Promise<ReturnType<typeof getDemoVariationArms>> {
  if (isDemoMode()) return getDemoVariationArms();
  if (realFn) return realFn();
  return getDemoVariationArms();
}

/**
 * Get voice DNA.
 * Demo: returns realistic voice metrics + signature phrases.
 * Real: reads voice_genomes table.
 */
export async function getVoiceDNAOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoVoiceDNA>>,
): Promise<ReturnType<typeof getDemoVoiceDNA>> {
  if (isDemoMode()) return getDemoVoiceDNA();
  if (realFn) return realFn();
  return getDemoVoiceDNA();
}

/**
 * Get org constitution.
 * Demo: returns brand values, voice, and rules.
 * Real: reads org_constitution table.
 */
export async function getConstitutionOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoConstitution>>,
): Promise<ReturnType<typeof getDemoConstitution>> {
  if (isDemoMode()) return getDemoConstitution();
  if (realFn) return realFn();
  return getDemoConstitution();
}

/**
 * Get temporal patterns for a subject.
 * Demo: returns deterministic timing patterns from score.
 * Real: reads temporal_patterns table.
 */
export async function getTemporalPatternOrDemo(
  subjectId: string,
  realFn?: () => Promise<ReturnType<typeof getDemoTemporalPattern>>,
): Promise<ReturnType<typeof getDemoTemporalPattern>> {
  if (isDemoMode()) return getDemoTemporalPattern(subjectId);
  if (realFn) return realFn();
  return getDemoTemporalPattern(subjectId);
}

/**
 * Get cohort data.
 * Demo: returns current vs last month comparison.
 * Real: aggregates from subject_intelligence + temporal_events.
 */
export async function getCohortDataOrDemo(
  realFn?: () => Promise<ReturnType<typeof getDemoCohortData>>,
): Promise<ReturnType<typeof getDemoCohortData>> {
  if (isDemoMode()) return getDemoCohortData();
  if (realFn) return realFn();
  return getDemoCohortData();
}
