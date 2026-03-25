/**
 * Universal Learning Context Service (Unified Intelligence Injection)
 *
 * Transplanted from Invisible Pipeline's learning-context.ts (~314 lines)
 *
 * THE SINGLE SOURCE OF TRUTH for all learned intelligence about a subject.
 * Combines outputs from multiple intelligence services into a unified
 * context block that can be injected into ANY prompt type.
 *
 * KEY INSIGHT: Intelligence shouldn't be siloed by service. When generating
 * content for a subject, you need EVERYTHING — style recommendations,
 * success patterns, anti-pattern warnings, effectiveness data, temporal
 * context — all in one coherent block.
 *
 * Original: Blueprint-specific lead intelligence aggregation in IP
 * Universal: Config-driven intelligence aggregation for ANY content generation
 */

import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// TYPES
// ============================================================================

export interface SubjectLearningContext {
  /** Style & Tone */
  recommendedStyle: string;
  styleConfidence: number;
  styleReason: string;

  /** Success Patterns */
  effectiveApproaches: string[];
  optimalLength: string;
  toneMarkers: string[];
  avoidPatterns: string[];

  /** Subject Classification */
  subjectType: string;
  subjectArchetype?: string;

  /** Training Maturity */
  dataPoints: number;
  maturityLevel: "cold_start" | "learning" | "confident" | "expert";

  /** Freshness */
  dataIsFresh: boolean;
  lastUpdated: string | null;
}

export type ContentType =
  | "message"
  | "followup"
  | "email"
  | "page"
  | "report"
  | "script"
  | "custom";

// ============================================================================
// INTELLIGENCE AGGREGATION
// ============================================================================

/**
 * Get comprehensive learning context for a subject.
 * Aggregates data from effectiveness tracker, variation generator,
 * and any other available intelligence sources.
 */
export async function getSubjectLearningContext(
  supabase: any,
  orgId: string,
  subjectId: string,
  config: IntelligenceConfig
): Promise<SubjectLearningContext | null> {
  try {
    // 1. Get subject intelligence (DNA + profile)
    const { data: intelligence } = await supabase
      .from("subject_intelligence")
      .select("dna, profile, score_tier, dna_extraction_confidence")
      .eq("org_id", orgId)
      .eq("subject_id", subjectId)
      .maybeSingle();

    // 2. Get effectiveness data for this subject type
    const subjectType = intelligence?.dna?.matched_archetype?.primary || "general";

    const { data: effectiveness } = await supabase
      .from("content_effectiveness")
      .select("content_style, positive_rate, engagement_rate, conversion_rate, sends_count")
      .eq("org_id", orgId)
      .eq("subject_type", subjectType)
      .gte("sends_count", 1)
      .order("conversion_rate", { ascending: false });

    // 3. Get anti-patterns (what to avoid)
    const { data: antiPatterns } = await supabase
      .from("anti_patterns")
      .select("description, failure_rate")
      .eq("org_id", orgId)
      .gte("failure_rate", 60)
      .order("failure_rate", { ascending: false })
      .limit(3);

    // 4. Get variation arms (what approaches exist)
    const { data: arms } = await supabase
      .from("variation_arms")
      .select("approach_name, successes, trials")
      .eq("org_id", orgId)
      .order("successes", { ascending: false });

    // 5. Aggregate

    // Best style
    const bestStyle = effectiveness?.[0];
    const recommendedStyle = bestStyle?.content_style || "balanced";
    const totalSends = effectiveness?.reduce((sum: number, e: any) => sum + e.sends_count, 0) || 0;

    // Confidence based on data points
    let styleConfidence = 20;
    if (totalSends >= 50) styleConfidence = 85;
    else if (totalSends >= 20) styleConfidence = 65;
    else if (totalSends >= 10) styleConfidence = 45;

    // Effective approaches
    const effectiveApproaches = (arms || [])
      .filter((a: any) => a.trials > 0 && a.successes / a.trials > 0.3)
      .map((a: any) => a.approach_name)
      .slice(0, 5);

    // Avoid patterns
    const avoidPatterns = (antiPatterns || []).map((ap: any) => ap.description);

    // Tone markers from profile
    const toneMarkers: string[] = [];
    const profile = intelligence?.profile;
    if (profile?.communication_style) {
      const d = profile.communication_style.directness;
      const f = profile.communication_style.formality;
      if (d > 0.7) toneMarkers.push("direct");
      else if (d < 0.3) toneMarkers.push("gentle");
      if (f > 0.7) toneMarkers.push("formal");
      else if (f < 0.3) toneMarkers.push("casual");
    }

    // Optimal length
    let optimalLength = "medium";
    if (profile?.response_patterns?.preferred_message_length) {
      optimalLength = profile.response_patterns.preferred_message_length;
    }

    // Maturity level
    let maturityLevel: SubjectLearningContext["maturityLevel"] = "cold_start";
    if (totalSends >= 50) maturityLevel = "expert";
    else if (totalSends >= 20) maturityLevel = "confident";
    else if (totalSends >= 5) maturityLevel = "learning";

    return {
      recommendedStyle,
      styleConfidence,
      styleReason: bestStyle
        ? `${bestStyle.content_style} has ${bestStyle.conversion_rate.toFixed(1)}% conversion rate from ${bestStyle.sends_count} interactions`
        : "No effectiveness data yet — using balanced approach",

      effectiveApproaches,
      optimalLength,
      toneMarkers,
      avoidPatterns,

      subjectType,
      subjectArchetype: intelligence?.dna?.matched_archetype?.primary,

      dataPoints: totalSends,
      maturityLevel,

      dataIsFresh: true, // Could be enhanced with temporal decay
      lastUpdated: bestStyle ? new Date().toISOString() : null,
    };
  } catch (error) {
    console.error("[LearningContext] Error aggregating:", error);
    return null;
  }
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

/**
 * Build a learning guidance block that can be injected into ANY prompt.
 * This ensures consistent application of learned patterns across all content types.
 */
export function buildLearningGuidance(
  context: SubjectLearningContext,
  contentType: ContentType,
  config: IntelligenceConfig
): string {
  const parts: string[] = [];
  const subjectLabel = config.subject?.singular || "subject";

  parts.push(`\n## LEARNED INTELLIGENCE`);
  parts.push(`${subjectLabel} type: ${context.subjectType}`);
  parts.push(`Data maturity: ${context.maturityLevel} (${context.dataPoints} data points)`);

  // Style recommendation
  const confidenceLabel =
    context.styleConfidence >= 70 ? "HIGH" :
    context.styleConfidence >= 40 ? "MEDIUM" : "LOW";

  parts.push(`\nRecommended approach: ${context.recommendedStyle} (${confidenceLabel} confidence)`);
  parts.push(`Reason: ${context.styleReason}`);

  // Effective approaches
  if (context.effectiveApproaches.length > 0) {
    parts.push(`\nProven approaches: ${context.effectiveApproaches.join(", ")}`);
  }

  // Tone + length
  if (context.toneMarkers.length > 0) {
    parts.push(`Tone: ${context.toneMarkers.join(", ")}`);
  }
  parts.push(`Optimal length: ${context.optimalLength}`);

  // Anti-patterns
  if (context.avoidPatterns.length > 0) {
    parts.push(`\nAvoid:`);
    for (const pattern of context.avoidPatterns) {
      parts.push(`  - ${pattern}`);
    }
  }

  // Content-type specific guidance
  const guidance = getContentTypeGuidance(contentType, context);
  if (guidance) {
    parts.push(`\n${guidance}`);
  }

  // Confidence caveat
  if (context.styleConfidence < 40) {
    parts.push(`\nNOTE: Limited data. Use this as a starting point, not a rigid rule. Personalize heavily.`);
  }

  return parts.join("\n");
}

/**
 * Get a lightweight style tag for contexts where full guidance is too heavy.
 */
export function getStyleTag(context: SubjectLearningContext): string {
  if (context.styleConfidence >= 70) {
    return `[LEARNED: Use ${context.recommendedStyle} — proven effective]`;
  } else if (context.styleConfidence >= 40) {
    return `[SUGGESTED: ${context.recommendedStyle} may work well]`;
  }
  return `[EXPLORING: Try ${context.recommendedStyle} as starting point]`;
}

/**
 * Check if learned intelligence is mature enough to apply.
 */
export function shouldApplyLearning(context: SubjectLearningContext | null): boolean {
  if (!context) return false;
  if (context.maturityLevel === "cold_start") return false;
  if (context.styleConfidence < 20) return false;
  return true;
}

// ============================================================================
// CONTENT-TYPE GUIDANCE
// ============================================================================

function getContentTypeGuidance(
  contentType: ContentType,
  context: SubjectLearningContext
): string | null {
  const isSenior = context.subjectType.toLowerCase().includes("senior") ||
                   context.subjectType.toLowerCase().includes("executive") ||
                   context.subjectType.toLowerCase().includes("c_level");

  switch (contentType) {
    case "message":
    case "followup":
      return [
        `For messages:`,
        `- Keep it scannable (5 seconds to understand)`,
        isSenior ? `- Senior subjects hate fluff. Be concise.` : `- Be friendly and conversational.`,
        `- Match the ${context.recommendedStyle} approach`,
      ].join("\n");

    case "email":
      return [
        `For emails:`,
        `- Maintain ${context.recommendedStyle} tone consistently`,
        isSenior ? `- Use bullet points and clear structure` : `- Be conversational but professional`,
        `- Keep paragraphs SHORT`,
      ].join("\n");

    case "page":
      return [
        `For pages:`,
        `- Mirror the messaging style that brought them here`,
        isSenior ? `- Show ROI and social proof immediately` : `- Focus on benefits and clear next steps`,
        `- Make the CTA crystal clear and low-friction`,
      ].join("\n");

    case "report":
      return [
        `For reports:`,
        `- Lead with key findings`,
        `- Use data visualization where possible`,
        `- Match ${context.toneMarkers.join(", ") || "balanced"} tone`,
      ].join("\n");

    case "script":
      return [
        `For scripts:`,
        `- This subject responded to ${context.recommendedStyle} — they're interested in that angle`,
        isSenior ? `- Expect tough, direct questions. Have data ready.` : `- Focus on rapport and discovery`,
        `- Prepare questions aligned with what got their interest`,
      ].join("\n");

    default:
      return null;
  }
}
