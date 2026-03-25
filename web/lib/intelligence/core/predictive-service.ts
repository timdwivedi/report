/**
 * Universal Predictive Analytics Service
 *
 * Transplanted from Invisible Pipeline's predictive-service.ts
 * Predicts outcomes (conversion, enrollment, completion, hire) based on data signals.
 *
 * Original: Predicted sales conversion probability and time-to-close
 * Universal: Predicts ANY outcome based on config-defined factors
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig } from "../config/intelligence.config";
import type { PredictiveInsight, SubjectDNA, SubjectScore } from "../types/intelligence.types";

/**
 * Generate predictive insights for a subject.
 *
 * @param config - Intelligence config
 * @param contextData - All available data about the subject
 * @param subjectDNA - Optional pre-extracted DNA
 * @param subjectScore - Optional pre-computed score
 */
export async function generatePrediction(
  config: IntelligenceConfig,
  contextData: Record<string, any>,
  subjectDNA?: SubjectDNA | null,
  subjectScore?: SubjectScore | null
): Promise<PredictiveInsight | null> {
  if (!config.prediction.enabled) return null;

  const enrichedContext: Record<string, any> = { ...contextData };
  if (subjectDNA) enrichedContext._dna_summary = {
    archetype: subjectDNA.matched_archetype?.primary,
    confidence: subjectDNA.extraction_confidence,
    key_dimensions: Object.fromEntries(
      Object.entries(subjectDNA.dimensions).map(([k, v]) => [k, v.slice(0, 3)])
    ),
  };
  if (subjectScore) enrichedContext._score_summary = {
    total: subjectScore.total_score,
    tier: subjectScore.tier,
    verdict: subjectScore.verdict,
  };

  const systemPrompt = `You are a Predictive ${config.domain} Analyst.
Analyze the provided ${config.subject.singular} data, intelligence, and signals to predict the outcome.

Predict:
1. ${config.prediction.outcome_label} Probability: 0-100%
2. Estimated Time to Outcome: Number of days from now
3. Recommended Next Action: The single highest-leverage move
4. Risk Factors: List of potential blockers (categories: ${config.prediction.factor_categories.join(", ")})
5. Winning Factors: List of positive signals

Return Valid JSON:
{
  "outcome_probability": number,
  "time_to_outcome_days": number,
  "recommended_next_action": "string",
  "risk_factors": ["string"],
  "winning_factors": ["string"]
}`;

  try {
    const aiResponse = await callAI(
      `Analyze this ${config.subject.singular} for predictive insights:\n\n${JSON.stringify(enrichedContext, null, 2)}`,
      {
        systemPrompt,
        model: config.ai.extraction_model,
        maxTokens: 500,
      }
    );

    const content = aiResponse.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);

    return {
      outcome_probability: parsed.outcome_probability || parsed.conversion_probability || 0,
      time_to_outcome_days: parsed.time_to_outcome_days || parsed.time_to_close_days || 0,
      recommended_next_action: parsed.recommended_next_action || "",
      risk_factors: parsed.risk_factors || [],
      winning_factors: parsed.winning_factors || [],
      last_updated: new Date().toISOString(),
    };
  } catch {
    console.error("[Intelligence] Predictive analysis failed");
    return null;
  }
}
