/**
 * Intelligence Presets - Registry
 *
 * Add new presets here as Bloom builds more verticals.
 * The Spec Agent selects a preset based on client intake domain.
 */

export { salesPipelinePreset } from "./sales-pipeline";
export { coachingDiagnosticPreset } from "./coaching-diagnostic";
export { neoDiagnosticPreset } from "./neo-diagnostic";

import type { IntelligenceConfig } from "../intelligence.config";
import { salesPipelinePreset } from "./sales-pipeline";
import { coachingDiagnosticPreset } from "./coaching-diagnostic";
import { neoDiagnosticPreset } from "./neo-diagnostic";

/**
 * All available presets, keyed by domain.
 * The Spec Agent uses this to find the closest match.
 */
export const INTELLIGENCE_PRESETS: Record<string, IntelligenceConfig> = {
  sales: salesPipelinePreset,
  crm: salesPipelinePreset,
  outbound: salesPipelinePreset,
  coaching: coachingDiagnosticPreset,
  diagnostic: coachingDiagnosticPreset,
  assessment: coachingDiagnosticPreset,
  neo: neoDiagnosticPreset,
  "revenue-ceiling": neoDiagnosticPreset,
  "identity-diagnostic": neoDiagnosticPreset,
};

/**
 * Find the best preset for a given domain description.
 * Uses keyword matching against preset keys.
 */
export function findPresetForDomain(domainDescription: string): IntelligenceConfig | null {
  const lower = domainDescription.toLowerCase();

  for (const [key, preset] of Object.entries(INTELLIGENCE_PRESETS)) {
    if (lower.includes(key)) return preset;
  }

  // Extended keyword matching
  const domainKeywords: Record<string, string> = {
    "lead": "sales",
    "pipeline": "sales",
    "prospect": "sales",
    "close": "sales",
    "deal": "sales",
    "coach": "coaching",
    "therapy": "coaching",
    "counsel": "coaching",
    "mentor": "coaching",
    "identity": "identity-diagnostic",
    "ceiling": "revenue-ceiling",
    "diagnos": "coaching",
    "revenue ceiling": "neo",
    "neo": "neo",
    "quiz": "assessment",
    "test": "assessment",
    "survey": "assessment",
  };

  for (const [keyword, domain] of Object.entries(domainKeywords)) {
    if (lower.includes(keyword) && INTELLIGENCE_PRESETS[domain]) {
      return INTELLIGENCE_PRESETS[domain];
    }
  }

  return null;
}
