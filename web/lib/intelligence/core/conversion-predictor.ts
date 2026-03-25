/**
 * Universal Conversion Predictor (Pattern-Based Outcome Prediction)
 *
 * Transplanted from Invisible Pipeline's conversion-predictor.ts (~244 lines)
 *
 * Predicts the probability that a subject will reach a desired outcome
 * based on their current signal sequence matching against known successful
 * patterns. Uses temporal decay so recent patterns are weighted higher.
 *
 * Builds on:
 *   - journey-pattern-service (pattern storage + matching)
 *   - temporal-decay-service (recency weighting)
 *
 * Original: IP's blueprint-specific lead conversion predictor
 * Universal: Config-driven outcome prediction for ANY staged pipeline
 */

import type { IntelligenceConfig } from "../config/intelligence.config";
import type { JourneyEvent } from "./journey-pattern-service";

// ============================================================================
// TYPES
// ============================================================================

export interface OutcomePrediction {
  subjectId: string;
  orgId: string;
  /** 0-100 probability of reaching target outcome */
  probability: number;
  /** Number of historical patterns that matched */
  matchingPatterns: number;
  confidence: "low" | "medium" | "high";
  /** Best matching historical pattern */
  topPattern?: { events: JourneyEvent[]; confidence: number };
  /** Predicted next likely signals */
  nextLikelySignals: string[];
}

// ============================================================================
// CORE: Predict Outcome
// ============================================================================

/**
 * Predict outcome probability for a subject based on current signal sequence.
 * Compares against known successful patterns with temporal decay weighting.
 */
export async function predictOutcome(
  supabase: any,
  orgId: string,
  subjectId: string,
  config: IntelligenceConfig
): Promise<OutcomePrediction | null> {
  try {
    const { extractJourneyEvents, getConversionPatterns, calculatePatternSimilarity } =
      await import("./journey-pattern-service");
    const { calculateDecayWeight } = await import("./temporal-decay-service");

    // 1. Get current signal sequence for this subject
    const currentEvents = await extractJourneyEvents(
      supabase,
      orgId,
      subjectId
    );
    if (!currentEvents || currentEvents.length === 0) {
      return {
        subjectId,
        orgId,
        probability: 0,
        matchingPatterns: 0,
        confidence: "low",
        nextLikelySignals: [],
      };
    }

    // 2. Get known successful patterns
    const knownPatterns = await getConversionPatterns(
      supabase,
      orgId,
      50 // min confidence
    );

    if (knownPatterns.length === 0) {
      return {
        subjectId,
        orgId,
        probability: 50, // Neutral — no training data
        matchingPatterns: 0,
        confidence: "low",
        nextLikelySignals: [],
      };
    }

    // 3. Match against known patterns with temporal decay
    const matches: Array<{
      pattern: any;
      similarity: number;
      weightedScore: number;
    }> = [];

    for (const pattern of knownPatterns) {
      const patternEvents = (pattern.event_sequence || []) as JourneyEvent[];
      const similarity = calculatePatternSimilarity(
        currentEvents,
        patternEvents
      );

      // Apply temporal decay to pattern confidence
      const decayWeight = calculateDecayWeight(
        pattern.updated_at || pattern.created_at || new Date().toISOString()
      );
      const decayedConfidence = pattern.confidence_score * decayWeight;
      const weightedScore = (similarity / 100) * decayedConfidence;

      if (similarity > 30) {
        matches.push({ pattern, similarity, weightedScore });
      }
    }

    if (matches.length === 0) {
      return {
        subjectId,
        orgId,
        probability: 25, // Low — no matches
        matchingPatterns: 0,
        confidence: "low",
        nextLikelySignals: [],
      };
    }

    // 4. Sort by weighted score
    matches.sort((a, b) => b.weightedScore - a.weightedScore);

    // 5. Average top 3 for probability
    const top = matches.slice(0, Math.min(3, matches.length));
    const avgScore =
      top.reduce((sum, m) => sum + m.weightedScore, 0) / top.length;
    const probability = Math.min(Math.max(Math.round(avgScore), 0), 100);

    // 6. Determine confidence
    let confidence: "low" | "medium" | "high" = "low";
    if (matches.length >= 5 && probability >= 70) confidence = "high";
    else if (matches.length >= 2 && probability >= 50) confidence = "medium";

    // 7. Predict next signals from best matching pattern
    const topPattern = matches[0].pattern;
    const topPatternEvents = (topPattern.signal_sequence ||
      []) as JourneyEvent[];
    const nextSignals = predictNextSignals(currentEvents, topPatternEvents);

    return {
      subjectId,
      orgId,
      probability,
      matchingPatterns: matches.length,
      confidence,
      topPattern: {
        events: topPatternEvents,
        confidence: topPattern.confidence_score,
      },
      nextLikelySignals: nextSignals,
    };
  } catch (error) {
    console.error("[ConversionPredictor] Error:", error);
    return null;
  }
}

// ============================================================================
// BATCH PREDICTION
// ============================================================================

/**
 * Predict outcomes for multiple subjects at once.
 */
export async function batchPredictOutcomes(
  supabase: any,
  orgId: string,
  subjectIds: string[],
  config: IntelligenceConfig
): Promise<Map<string, OutcomePrediction>> {
  const predictions = new Map<string, OutcomePrediction>();

  for (const subjectId of subjectIds) {
    const prediction = await predictOutcome(
      supabase,
      orgId,
      subjectId,
      config
    );
    if (prediction) {
      predictions.set(subjectId, prediction);
    }
  }

  return predictions;
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Get prediction stats for an org.
 */
export async function getOrgPredictionStats(
  supabase: any,
  orgId: string
): Promise<{
  totalPatterns: number;
  avgConfidence: number;
  highConfidencePatterns: number;
}> {
  try {
    const { data: patterns } = await supabase
      .from("conversion_patterns")
      .select("confidence_score")
      .eq("org_id", orgId);

    if (!patterns || patterns.length === 0) {
      return { totalPatterns: 0, avgConfidence: 0, highConfidencePatterns: 0 };
    }

    const avg =
      patterns.reduce((sum: number, p: any) => sum + p.confidence_score, 0) /
      patterns.length;
    const high = patterns.filter(
      (p: any) => p.confidence_score >= 75
    ).length;

    return {
      totalPatterns: patterns.length,
      avgConfidence: Math.round(avg),
      highConfidencePatterns: high,
    };
  } catch {
    return { totalPatterns: 0, avgConfidence: 0, highConfidencePatterns: 0 };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function predictNextSignals(
  currentEvents: JourneyEvent[],
  successfulPattern: JourneyEvent[]
): string[] {
  if (currentEvents.length >= successfulPattern.length) return [];

  return successfulPattern
    .slice(currentEvents.length, currentEvents.length + 3)
    .map((e) => e.type);
}
