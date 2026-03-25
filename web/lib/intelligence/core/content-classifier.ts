/**
 * Universal Content Classifier (AI + Rule-Based Classification)
 *
 * Transplanted from Invisible Pipeline's message-classifier.ts (~230 lines)
 *
 * Classifies content by style, tone, and characteristics.
 * Feeds the effectiveness tracker — you can't optimize what you don't measure.
 *
 * Two-tier approach:
 *   1. AI classification (Claude Haiku for speed + cost)
 *   2. Rule-based fallback (zero-cost, instant)
 *
 * Original: IP's DM-specific message classifier with hardcoded sales styles
 * Universal: Config-driven style definitions for ANY content domain
 */

import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// TYPES
// ============================================================================

export interface ContentStyle {
  id: string;
  label: string;
  description: string;
  /** Keywords that indicate this style (for rule-based fallback) */
  keywords?: string[];
}

export interface ContentClassification {
  primaryStyle: string;
  secondaryStyle?: string;
  tone: "casual" | "professional" | "mixed";
  lengthCategory: "short" | "medium" | "long";
  hasCTA: boolean;
  ctaType?: "meeting" | "question" | "resource" | "value_offer";
  personalizationLevel: "none" | "basic" | "deep";
  confidence: number; // 0-100
}

// Default styles (config overrides these for domain-specific classification)
const DEFAULT_STYLES: ContentStyle[] = [
  {
    id: "direct",
    label: "Direct",
    description: "Explicitly states what you do/offer",
    keywords: ["offer", "service", "help you", "we provide"],
  },
  {
    id: "value_first",
    label: "Value First",
    description: "Leads with value/problem, not pitch",
    keywords: ["noticed", "insight", "thought you"],
  },
  {
    id: "contrarian",
    label: "Contrarian",
    description: "Challenges conventional thinking",
    keywords: ["most people", "contrary", "actually", "myth"],
  },
  {
    id: "social_proof",
    label: "Social Proof",
    description: "References other results",
    keywords: ["helped", "worked with", "achieved", "results"],
  },
  {
    id: "question",
    label: "Question Opener",
    description: "Starts with a question",
    keywords: [],
  },
  {
    id: "compliment",
    label: "Compliment Bridge",
    description: "Genuine compliment + transition",
    keywords: ["congrat", "impressed", "love", "amazing"],
  },
  {
    id: "pain_focused",
    label: "Pain Focused",
    description: "Highlights pain/problem",
    keywords: ["problem", "struggle", "challenge", "frustrated"],
  },
  {
    id: "storytelling",
    label: "Storytelling",
    description: "Narrative approach",
    keywords: ["story", "remember", "one time", "imagine"],
  },
  {
    id: "data_driven",
    label: "Data Driven",
    description: "Stats/numbers focused",
    keywords: [],
  },
  {
    id: "casual",
    label: "Casual",
    description: "Conversational, friendly tone",
    keywords: ["hey", "btw", "just wanted"],
  },
  {
    id: "formal",
    label: "Formal",
    description: "Professional, business tone",
    keywords: ["dear", "regards", "sincerely", "respectfully"],
  },
];

// ============================================================================
// AI CLASSIFICATION
// ============================================================================

/**
 * Classify content using AI (fast model for cost efficiency).
 */
async function classifyWithAI(
  content: string,
  styles: ContentStyle[]
): Promise<ContentClassification | null> {
  try {
    const { callAIJSON } = await import("../../ai/ai-service");

    const styleList = styles
      .map((s) => `- ${s.id}: ${s.description}`)
      .join("\n");

    const prompt = `Analyze this content and classify it.

CONTENT:
"""
${content.slice(0, 2000)}
"""

AVAILABLE STYLES:
${styleList}

Return JSON:
{
  "primaryStyle": "<style id from list>",
  "secondaryStyle": "<optional second style id or null>",
  "tone": "<casual, professional, or mixed>",
  "lengthCategory": "<short (< 50 words), medium (50-150 words), or long (> 150 words)>",
  "hasCTA": <true or false>,
  "ctaType": "<meeting, question, resource, value_offer, or null>",
  "personalizationLevel": "<none, basic, or deep>",
  "confidence": <0-100>
}`;

    const { data } = await callAIJSON<ContentClassification>(prompt, {
      model: "claude-haiku-4-5-20251001",
      maxTokens: 500,
    });

    return data;
  } catch (error) {
    console.error("[ContentClassifier] AI classification failed:", error);
    return null;
  }
}

// ============================================================================
// RULE-BASED FALLBACK
// ============================================================================

function classifyWithRules(
  content: string,
  styles: ContentStyle[]
): ContentClassification {
  const lower = content.toLowerCase();
  const wordCount = content.split(/\s+/).length;

  // Match style by keywords
  let bestStyle = styles[0]?.id || "direct";
  let bestScore = 0;

  for (const style of styles) {
    if (!style.keywords?.length) continue;
    const score = style.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestStyle = style.id;
    }
  }

  // Question detection
  if (lower.match(/^\s*(what|how|why|when|do you|have you|are you)/)) {
    bestStyle = styles.find((s) => s.id === "question")?.id || bestStyle;
  }

  // Data detection
  if (lower.match(/\d+%|\d+x|\$\d+/)) {
    bestStyle = styles.find((s) => s.id === "data_driven")?.id || bestStyle;
  }

  // Tone
  const hasCasual = lower.includes("hey") || lower.includes("btw") || lower.includes("!");
  const hasFormal = lower.includes("dear") || lower.includes("regards") || lower.includes("sincerely");
  const tone: ContentClassification["tone"] = hasCasual
    ? "casual"
    : hasFormal
      ? "professional"
      : "mixed";

  // Length
  const lengthCategory: ContentClassification["lengthCategory"] =
    wordCount < 50 ? "short" : wordCount > 150 ? "long" : "medium";

  // CTA
  const hasCTA =
    lower.includes("meeting") ||
    lower.includes("call") ||
    lower.includes("chat") ||
    lower.includes("?");
  let ctaType: ContentClassification["ctaType"];
  if (hasCTA) {
    if (lower.includes("meeting") || lower.includes("call")) ctaType = "meeting";
    else if (lower.includes("?")) ctaType = "question";
    else ctaType = "value_offer";
  }

  // Personalization
  const personalizationLevel: ContentClassification["personalizationLevel"] =
    lower.includes("{{") || content.match(/\b[A-Z][a-z]+\b.*\b[A-Z][a-z]+\b/)
      ? "basic"
      : "none";

  return {
    primaryStyle: bestStyle,
    tone,
    lengthCategory,
    hasCTA,
    ctaType,
    personalizationLevel,
    confidence: 40, // Low confidence for rule-based
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Classify content with AI fallback to rules.
 */
export async function classifyContent(
  content: string,
  config: IntelligenceConfig
): Promise<ContentClassification> {
  const styles = (config as any).content?.styles || DEFAULT_STYLES;

  // Try AI first
  const aiResult = await classifyWithAI(content, styles);
  if (aiResult) return aiResult;

  // Fallback to rules
  return classifyWithRules(content, styles);
}

/**
 * Classify content using only rules (zero AI cost).
 */
export function classifyContentRulesOnly(
  content: string,
  config: IntelligenceConfig
): ContentClassification {
  const styles = (config as any).content?.styles || DEFAULT_STYLES;
  return classifyWithRules(content, styles);
}

/**
 * Get style descriptions for UI display.
 */
export function getStyleDefinitions(
  config: IntelligenceConfig
): ContentStyle[] {
  return (config as any).content?.styles || DEFAULT_STYLES;
}

/**
 * Batch classify multiple content items.
 */
export async function batchClassify(
  items: Array<{ id: string; content: string }>,
  config: IntelligenceConfig
): Promise<Map<string, ContentClassification>> {
  const results = new Map<string, ContentClassification>();

  for (const item of items) {
    const classification = await classifyContent(item.content, config);
    results.set(item.id, classification);
    // Rate limit for AI calls
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
