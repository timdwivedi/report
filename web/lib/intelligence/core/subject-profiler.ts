/**
 * Universal Subject Profiler
 *
 * Transplanted from Invisible Pipeline's psychographic-analyzer.ts
 * Extracts communication style, decision-making patterns, and personality markers.
 *
 * Original: Profiled leads for adaptive personality mirroring in DMs
 * Universal: Profiles ANY subject for personalized engagement
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig } from "../config/intelligence.config";
import type { SubjectProfile, SubjectDNA } from "../types/intelligence.types";

// ============================================================================
// MAIN PROFILING FUNCTION
// ============================================================================

/**
 * Profile a subject's communication style and personality.
 *
 * @param config - Intelligence config
 * @param inputData - Raw data (profile, transcript, activity)
 * @param subjectDNA - Optional pre-extracted DNA for enrichment
 */
export async function profileSubject(
  config: IntelligenceConfig,
  inputData: {
    fullPageText?: string;
    featuredPosts?: Array<{ title: string; description?: string }>;
    recentActivity?: Array<{ text: string; date?: string }>;
    about?: string;
    title?: string;
    industry?: string;
    transcript?: string;
  },
  subjectDNA?: SubjectDNA | null
): Promise<SubjectProfile> {
  if (!config.profiling.enabled) {
    return getContextualDefaults(inputData, subjectDNA, config);
  }

  const enrichedInput = {
    ...inputData,
    dna: subjectDNA ? {
      communication_style: subjectDNA.dimensions.communication_style,
      vocabulary: subjectDNA.dimensions.vocabulary,
      unique_phrases: subjectDNA.unique_phrases,
      attributes: subjectDNA.attributes,
    } : null,
  };

  const prompt = buildProfilingPrompt(enrichedInput, subjectDNA);
  const systemPrompt = buildSystemPrompt(subjectDNA);

  try {
    const result = await callAI(prompt, {
      model: config.ai.extraction_model,
      systemPrompt,
      temperature: 0.5,
      maxTokens: 1500,
    });

    let jsonContent = result.content.trim();
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const profile: SubjectProfile = JSON.parse(jsonContent);

    if (!profile.communication_style || !profile.decision_mode) {
      throw new Error("Invalid profile structure");
    }

    // Enrich with DNA if available
    if (subjectDNA) {
      profile.trigger_words = enrichTriggerWords(profile.trigger_words, subjectDNA);
      profile.anti_patterns = enrichAntiPatterns(profile.anti_patterns, subjectDNA);
    }

    return profile;
  } catch {
    console.error("[Intelligence] Profiling failed, using contextual defaults");
    return getContextualDefaults(inputData, subjectDNA, config);
  }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildSystemPrompt(subjectDNA?: SubjectDNA | null): string {
  const base = `You are a psychographic profiling expert. Analyze the provided data and extract communication patterns, decision-making style, and personality markers.

CRITICAL RULES:
1. Return ONLY valid JSON matching the SubjectProfile interface
2. Be SPECIFIC - don't default to 0.5 unless truly neutral
3. Look for ACTUAL patterns in their writing, not assumptions
4. Extract trigger_words from THEIR vocabulary
5. Extract anti_patterns from their objections or criticisms`;

  if (subjectDNA) {
    return base + `

IMPORTANT: Subject DNA has been pre-extracted. Use it to inform your analysis:
- Their vocabulary and unique phrases are GOLD - prioritize these
- Their communication style markers are pre-extracted
- Trust the DNA but add nuance from raw data`;
  }

  return base;
}

function buildProfilingPrompt(
  enrichedData: Record<string, any>,
  subjectDNA?: SubjectDNA | null
): string {
  const { dna, ...scrapedData } = enrichedData;

  let prompt = `Analyze this profile and extract psychographic traits.

DATA:
${JSON.stringify(scrapedData, null, 2)}`;

  if (dna) {
    prompt += `

PRE-EXTRACTED DNA (Use as primary source):
- Communication Style: ${JSON.stringify(dna.communication_style)}
- Vocabulary: ${JSON.stringify(dna.vocabulary)}
- Unique Phrases: ${JSON.stringify(dna.unique_phrases)}`;
  }

  prompt += `

Return a JSON object with:

1. **communication_style** (object):
   - directness (0-1): Low = diplomatic, High = blunt
   - formality (0-1): Low = casual, High = corporate
   - data_orientation (0-1): Low = story-driven, High = data-driven
   - verbosity (0-1): Low = concise, High = detailed

2. **decision_mode** (string: analytical|emotional|social|pragmatic)

3. **trigger_words** (array of 6-10 strings): Words they respond positively to

4. **anti_patterns** (array of 6-10 phrases): Words/phrases to avoid

5. **response_patterns** (object):
   - preferred_message_length: "short" | "medium" | "long"
   - preferred_question_type: "open" | "closed" | "rhetorical"
   - optimal_engagement_times: ["9-11am", "2-4pm"]
   - emoji_receptiveness (0-1)

6. **personality_markers** (object, all 0-1):
   - assertiveness, enthusiasm, skepticism, humor_appreciation

RULES: Be BOLD with scores. Avoid clustering around 0.5.
Return ONLY valid JSON.`;

  return prompt;
}

// ============================================================================
// ENRICHMENT (from DNA)
// ============================================================================

function enrichTriggerWords(aiWords: string[], dna: SubjectDNA): string[] {
  const enriched = new Set<string>();

  // Priority 1: Unique phrases
  if (dna.unique_phrases?.length) {
    dna.unique_phrases.slice(0, 3).forEach(phrase => {
      enriched.add(phrase.split(" ").slice(0, 3).join(" "));
    });
  }

  // Priority 2: Vocabulary
  const vocab = dna.dimensions.vocabulary || [];
  if (vocab.length) {
    vocab.slice(0, 4).forEach(term => enriched.add(term));
  }

  // Priority 3: AI-generated
  if (aiWords?.length) {
    aiWords.slice(0, 6 - enriched.size).forEach(w => enriched.add(w));
  }

  const result = Array.from(enriched).slice(0, 8);
  if (result.length < 4) {
    ["results", "growth", "practical", "efficient"].forEach(fb => {
      if (result.length < 5) result.push(fb);
    });
  }
  return result;
}

function enrichAntiPatterns(aiPatterns: string[], dna: SubjectDNA): string[] {
  const enriched = new Set<string>();

  // Priority 1: Likely objections from DNA
  const objections = dna.dimensions.likely_objections || [];
  if (objections.length) {
    objections.slice(0, 3).forEach(obj => {
      if (obj.length < 30) enriched.add(obj);
    });
  }

  // Priority 2: AI-generated
  if (aiPatterns?.length) {
    aiPatterns.slice(0, 6 - enriched.size).forEach(p => enriched.add(p));
  }

  const result = Array.from(enriched).slice(0, 8);
  if (result.length < 4) {
    ["synergy", "leverage", "circle back", "touch base"].forEach(fb => {
      if (result.length < 5) result.push(fb);
    });
  }
  return result;
}

// ============================================================================
// CONTEXTUAL DEFAULTS
// ============================================================================

function getContextualDefaults(
  data: { title?: string; industry?: string },
  dna: SubjectDNA | null | undefined,
  config: IntelligenceConfig
): SubjectProfile {
  const industry = dna?.attributes?.industry || data.industry || "unknown";

  // Find matching industry default from config
  const defaults = config.profiling.industry_defaults || {};
  let baseProfile: Partial<SubjectProfile> | undefined;
  for (const [key, profile] of Object.entries(defaults)) {
    if (industry.toLowerCase().includes(key)) {
      baseProfile = profile;
      break;
    }
  }

  const commStyle = baseProfile?.communication_style || {
    directness: 0.5, formality: 0.5, data_orientation: 0.5, verbosity: 0.5,
  };

  // Trigger words from DNA or generic
  let triggerWords = ["results", "growth", "practical", "efficient"];
  const vocab = dna?.dimensions?.vocabulary;
  if (vocab?.length) triggerWords = vocab.slice(0, 4);

  let antiPatterns = ["synergy", "leverage", "circle back", "moving the needle"];
  const objections = dna?.dimensions?.likely_objections;
  if (objections?.length) antiPatterns = objections.slice(0, 4);

  return {
    communication_style: {
      directness: commStyle.directness,
      formality: commStyle.formality,
      data_orientation: commStyle.data_orientation,
      verbosity: commStyle.verbosity,
    },
    decision_mode: baseProfile?.decision_mode || "pragmatic",
    trigger_words: triggerWords,
    anti_patterns: antiPatterns,
    response_patterns: {
      preferred_message_length: "medium",
      preferred_question_type: "open",
      optimal_engagement_times: ["9-11am", "2-4pm"],
      emoji_receptiveness: commStyle.formality > 0.6 ? 0.2 : 0.4,
    },
    personality_markers: {
      assertiveness: commStyle.directness,
      enthusiasm: 0.5,
      skepticism: commStyle.data_orientation > 0.7 ? 0.6 : 0.4,
      humor_appreciation: commStyle.formality > 0.7 ? 0.3 : 0.5,
    },
  };
}

/**
 * Calculate profile confidence based on available data
 */
export function calculateProfileConfidence(
  data: { fullPageText?: string; featuredPosts?: any[]; recentActivity?: any[]; about?: string; transcript?: string },
  hasDNA: boolean = false
): number {
  let confidence = 0;

  if (data.fullPageText && data.fullPageText.length > 500) confidence += 0.2;
  if (data.featuredPosts && data.featuredPosts.length > 0) confidence += 0.15;
  if (data.recentActivity && data.recentActivity.length > 3) confidence += 0.15;
  if (data.about && data.about.length > 100) confidence += 0.1;
  if (data.transcript && data.transcript.length > 500) confidence += 0.25;
  if (hasDNA) confidence += 0.2;

  return Math.min(confidence, 1.0);
}
