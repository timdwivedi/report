/**
 * Universal Subject Scorer
 *
 * Transplanted from Invisible Pipeline's scoring.ts
 * Abstracted to support both signal-based (0-10 per signal, IP style)
 * and dimension-weighted (0-100 per dimension, weighted average) scoring.
 *
 * Original: Scored leads 0-100 based on 10 sales signals
 * Universal: Scores ANY subject based on config-defined dimensions/signals
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig, ScoringSignalConfig, ScoringDimensionConfig } from "../config/intelligence.config";
import type { SubjectScore, ScoringBreakdownItem, SubjectDNA } from "../types/intelligence.types";
import { getScoreTier } from "../types/intelligence.types";

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build scoring prompt for signal-based method (IP's original approach)
 * Each signal scored 0-10, total = sum
 */
function buildSignalBasedPrompt(
  config: IntelligenceConfig,
  contextData: Record<string, any>,
  subjectDNA?: SubjectDNA | null
): string {
  const signals = config.scoring.signals || [];
  const signalList = signals
    .map((s, i) => `${i + 1}. ${s.name}: ${s.description}`)
    .join("\n");

  const strictnessRules = getStrictnessRules(config.scoring.strictness);

  let dnaContext = "";
  if (subjectDNA && subjectDNA.extraction_confidence > 30) {
    dnaContext = `\n\nPRE-EXTRACTED ${config.subject.singular.toUpperCase()} DNA (use as additional context):\n${JSON.stringify({
      dimensions: subjectDNA.dimensions,
      attributes: subjectDNA.attributes,
      archetype: subjectDNA.matched_archetype,
    }, null, 2)}`;
  }

  return `You are a highly analytical ${config.domain} qualification engine. Score this ${config.subject.singular} (0-100) based on the following ${signals.length} strategic signals.

${config.subject.singular.toUpperCase()} DATA:
${JSON.stringify(contextData, null, 2)}
${dnaContext}

SCORING FRAMEWORK (${Math.floor(100 / signals.length)} points each):
${signalList}

OUTPUT FORMAT (JSON ONLY):
{
  "totalScore": 85,
  "verdict": "Verdict Label",
  "breakdown": [
    { "signal": "Signal Name Exactly from List", "score": ${Math.floor(100 / signals.length)}, "reasoning": "..." },
    ...
  ],
  "whatTheyNeed": "Key insight or recommendation..."
}

${strictnessRules}

CRITICAL: Output ONLY valid JSON. Keep 'reasoning' to max 15 words.
IMPORTANT: You MUST return exactly ${signals.length} items in the 'breakdown' array, matching the ${signals.length} signals above.`;
}

/**
 * Build scoring prompt for dimension-weighted method (coaching/assessment style)
 * Each dimension scored 0-100, total = weighted average
 */
function buildDimensionWeightedPrompt(
  config: IntelligenceConfig,
  contextData: Record<string, any>,
  subjectDNA?: SubjectDNA | null
): string {
  const dimensions = config.scoring.dimensions || [];
  const dimList = dimensions
    .map((d, i) => `${i + 1}. ${d.label} (weight: ${(d.weight * 100).toFixed(0)}%): ${d.description}`)
    .join("\n");

  const strictnessRules = getStrictnessRules(config.scoring.strictness);

  let dnaContext = "";
  if (subjectDNA && subjectDNA.extraction_confidence > 30) {
    dnaContext = `\n\nPRE-EXTRACTED ${config.subject.singular.toUpperCase()} DNA:\n${JSON.stringify({
      dimensions: subjectDNA.dimensions,
      attributes: subjectDNA.attributes,
      archetype: subjectDNA.matched_archetype,
      unique_phrases: subjectDNA.unique_phrases?.slice(0, 5),
    }, null, 2)}`;
  }

  return `You are an expert ${config.domain} assessment analyst. Evaluate this ${config.subject.singular} across ${dimensions.length} dimensions.

${config.subject.singular.toUpperCase()} DATA:
${JSON.stringify(contextData, null, 2)}
${dnaContext}

SCORING DIMENSIONS (score each 0-100):
${dimList}

For each dimension, provide:
- A score from 0-100
- A brief explanation citing specific evidence from the data
- Key quotes or data points that justify the score

OUTPUT FORMAT (JSON ONLY):
{
  "breakdown": [
    { "signal": "Dimension Label", "score": 85, "reasoning": "Evidence-based explanation..." },
    ...
  ],
  "verdict": "Overall Assessment Verdict",
  "whatTheyNeed": "Key insight or recommendation..."
}

${strictnessRules}

CRITICAL: Output ONLY valid JSON. Return exactly ${dimensions.length} items in 'breakdown'.`;
}

function getStrictnessRules(strictness: string): string {
  switch (strictness) {
    case "harsh":
      return `SCORING STANDARDS: You are a HARSH JUDGE. Do not be polite. Most subjects are "Average" (50-60 range). A score of 90+ requires IRREFUTABLE proof. Ambiguity = 3-4/10. Missing data = 0/10.`;
    case "lenient":
      return `SCORING STANDARDS: Be encouraging but honest. Give credit for partial signals. Focus on potential as much as current state.`;
    default:
      return `SCORING STANDARDS: Be accurate and fair. Score based on evidence. Give credit where due but don't inflate scores without proof.`;
  }
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Score a subject using the configured scoring method.
 *
 * @param config - Intelligence config for this deployment
 * @param contextData - Raw data about the subject
 * @param subjectDNA - Optional pre-extracted DNA for enriched scoring
 * @returns SubjectScore with breakdown
 */
export async function scoreSubject(
  config: IntelligenceConfig,
  contextData: Record<string, any>,
  subjectDNA?: SubjectDNA | null
): Promise<SubjectScore> {
  if (!config.scoring.enabled) {
    return getEmptyScore(config);
  }

  const isSignalBased = config.scoring.method === "signal_based";
  const fullPrompt = isSignalBased
    ? buildSignalBasedPrompt(config, contextData, subjectDNA)
    : buildDimensionWeightedPrompt(config, contextData, subjectDNA);

  const systemPrompt = `You are a highly analytical ${config.domain} qualification engine. Output ONLY raw JSON. Be concise.`;

  let aiResponse;
  try {
    aiResponse = await callAI(fullPrompt, {
      model: config.ai.primary_model,
      maxTokens: 8192,
      systemPrompt,
    });
  } catch (primaryError: any) {
    console.warn(`[Intelligence] Primary model failed: ${primaryError.message}. Trying fallback...`);
    try {
      aiResponse = await callAI(fullPrompt, {
        model: config.ai.fallback_model,
        maxTokens: 8192,
        systemPrompt,
      });
    } catch {
      console.error("[Intelligence] Both models failed for scoring");
      return getEmptyScore(config);
    }
  }

  // Parse the response
  try {
    const result = parseAIJsonResponse(aiResponse.content);

    // Validate and normalize breakdown
    const breakdown = normalizeBreakdown(result, config);
    const totalScore = isSignalBased
      ? calculateSignalTotal(breakdown)
      : calculateWeightedTotal(breakdown, config.scoring.dimensions || []);

    const tier = getScoreTier(totalScore, config.scoring.tiers);

    return {
      total_score: totalScore,
      verdict: result.verdict || tier.name,
      breakdown,
      summary: result.whatTheyNeed || "",
      tier: tier.name,
      scored_at: new Date().toISOString(),
      model_used: aiResponse.model,
    };
  } catch {
    console.error("[Intelligence] Failed to parse scoring response");
    return getEmptyScore(config);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function parseAIJsonResponse(content: string): any {
  let candidate = content.trim();
  const firstBrace = candidate.indexOf("{");
  if (firstBrace === -1) throw new Error("No JSON found");

  candidate = candidate.substring(firstBrace).replace(/```\s*$/, "");

  try {
    return JSON.parse(candidate);
  } catch {
    // Try auto-repair
    const suffixes = ["", "\"", "}", "\"]}", "}]}", "\"}]}", "]}", "}}", "]}"];
    for (const s of suffixes) {
      try {
        return JSON.parse(candidate + s);
      } catch { /* continue */ }
    }
    throw new Error("JSON repair exhausted");
  }
}

function normalizeBreakdown(result: any, config: IntelligenceConfig): ScoringBreakdownItem[] {
  const rawBreakdown = Array.isArray(result.breakdown) ? result.breakdown : [];
  const isSignalBased = config.scoring.method === "signal_based";

  const expected = isSignalBased
    ? (config.scoring.signals || []).map(s => s.name)
    : (config.scoring.dimensions || []).map(d => d.label);

  return expected.map(expectedName => {
    const found = rawBreakdown.find((r: any) =>
      r.signal?.toLowerCase().trim() === expectedName.toLowerCase().trim() ||
      r.signal?.toLowerCase().includes(expectedName.toLowerCase()) ||
      expectedName.toLowerCase().includes(r.signal?.toLowerCase())
    );

    if (found) {
      return { ...found, signal: expectedName };
    }
    return {
      signal: expectedName,
      score: 0,
      reasoning: "Not evaluated — insufficient data",
      evidence: null,
    };
  });
}

function calculateSignalTotal(breakdown: ScoringBreakdownItem[]): number {
  return breakdown.reduce((sum, item) => sum + (typeof item.score === "number" ? item.score : 0), 0);
}

function calculateWeightedTotal(
  breakdown: ScoringBreakdownItem[],
  dimensions: ScoringDimensionConfig[]
): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const item = breakdown.find(
      b => b.signal.toLowerCase() === dim.label.toLowerCase()
    );
    if (item) {
      totalWeightedScore += item.score * dim.weight;
      totalWeight += dim.weight;
    }
  }

  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
}

function getEmptyScore(config: IntelligenceConfig): SubjectScore {
  const lowestTier = config.scoring.tiers[config.scoring.tiers.length - 1];
  return {
    total_score: 0,
    verdict: "Unscored",
    breakdown: [],
    summary: "",
    tier: lowestTier?.name || "unscored",
    scored_at: new Date().toISOString(),
    model_used: "none",
  };
}
