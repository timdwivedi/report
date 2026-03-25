/**
 * Universal Voice Analyzer (Fingerprint Extraction)
 *
 * Transplanted from Invisible Pipeline's voice-analyzer.ts (903 lines)
 * Extracts a comprehensive "Voice Fingerprint" from writing samples.
 * This is the INPUT to the Voice Genome Engine — it analyzes raw text
 * and produces quantified linguistic patterns.
 *
 * Includes AI-ism detection: automatically bans AI-sounding words
 * UNLESS they appear naturally in the user's writing.
 *
 * Original: Extracts voice fingerprints from content for Quantum Mirror
 * Universal: Linguistic analysis for ANY content source
 */

import type {
  VoiceDNA,
  VoiceMetrics,
  RhythmSignature,
  GenerativeFormula,
  VoiceExemplars,
  ContrastiveAnalysis,
  LinguisticFingerprint,
} from "./voice-dna-service";

// ============================================================================
// DEFAULT AI-ISMS (Words that scream "AI wrote this")
// ============================================================================

export const DEFAULT_AI_ISMS: string[] = [
  "delve", "leverage", "utilize", "embark", "foster", "harness",
  "streamline", "synergy", "holistic", "paradigm", "robust",
  "seamless", "transformative", "elevate", "empower", "optimize",
  "innovative", "cutting-edge", "game-changer", "pivotal",
  "navigate", "landscape", "tapestry", "forefront", "ever-evolving",
  "multifaceted", "nuanced", "comprehensive", "meticulous",
  "intricate", "resonate", "underscore", "cornerstone",
  "testament", "paramount", "endeavor", "culmination",
  "spearhead", "bolster", "augment", "facilitate",
  "catalyze", "orchestrate", "amplify", "cultivate",
  "reimagine", "groundbreaking", "trailblazing", "unparalleled",
  "unprecedented", "bespoke", "curate", "disruptive",
  "ecosystem", "framework", "methodology", "blueprint",
  "roadmap", "deep dive", "drill down", "circle back",
  "move the needle", "low-hanging fruit", "bleeding edge",
  "north star", "thought leader", "synergize",
  "mission-critical", "best-in-class", "world-class",
  "state-of-the-art", "next-generation",
];

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceFingerprint {
  metrics: VoiceMetrics;
  rhythm_signature: RhythmSignature;
  generative_formulas: GenerativeFormula[];
  voice_exemplars: VoiceExemplars;
  contrastive_analysis: ContrastiveAnalysis;
  linguistic_fingerprint: LinguisticFingerprint;
  emotional_arc?: {
    typical_structure: string;
    intensity_curve: string;
    resolution_style: string;
  };
  banned_words: string[];
  tone_labels: string[];
  signature_phrases: string[];
  hook_patterns: string[];
  closing_patterns: string[];
  sample_count: number;
}

// ============================================================================
// VOICE ANALYZER SERVICE
// ============================================================================

/**
 * Analyze writing samples and extract a comprehensive voice fingerprint.
 *
 * Uses AI (callAI) for deep linguistic analysis with a 7-phase extraction
 * protocol: metrics → rhythm → formulas → exemplars → fingerprint →
 * contrastive → emotional arc.
 *
 * @param samples - Array of writing samples to analyze
 * @param callAI - AI function (injected for universality)
 * @param existingFingerprint - Optional existing fingerprint to merge with
 */
export async function analyzeVoice(
  samples: string[],
  callAI: (prompt: string, options?: { systemPrompt?: string; maxTokens?: number }) => Promise<{ content: string }>,
  existingFingerprint?: Partial<VoiceFingerprint> | null
): Promise<VoiceFingerprint> {
  if (!samples.length) {
    return createEmptyFingerprint();
  }

  // Combine samples with separators
  const combinedText = samples
    .map((s, i) => `--- SAMPLE ${i + 1} ---\n${s}`)
    .join("\n\n");

  const systemPrompt = `You are an elite linguistic analyst specializing in voice DNA extraction.
Analyze the writing samples and extract a comprehensive voice fingerprint.
Return ONLY valid JSON — no markdown, no explanation.`;

  const analysisPrompt = `Analyze these writing samples and extract the voice fingerprint.

${combinedText}

Return JSON with this EXACT structure:
{
  "metrics": {
    "avg_sentence_length": <number>,
    "vocabulary_complexity": <0-1>,
    "emoji_frequency": <0-1>,
    "informal_markers": <0-1>,
    "question_frequency": <0-1>,
    "exclamation_frequency": <0-1>,
    "first_person_usage": <0-1>,
    "storytelling_tendency": <0-1>,
    "data_usage": <0-1>,
    "call_to_action_style": "<soft|hard|none>"
  },
  "rhythm_signature": {
    "pattern": [<sentence length sequence>],
    "description": "<short-long-short etc>",
    "punctuation_style": "<heavy_commas|dash_lover|clean|minimal>"
  },
  "generative_formulas": [
    {"pattern": "<abstract pattern>", "example": "<actual example>", "frequency": <0-1>}
  ],
  "voice_exemplars": {
    "high_energy": "<example of their high energy writing>",
    "analytical": "<example of their analytical writing>",
    "empathetic": "<example of their empathetic writing>",
    "direct": "<example of their direct writing>",
    "signature": "<their most characteristic style>"
  },
  "contrastive_analysis": {
    "does": ["<thing they DO in writing>"],
    "never": ["<thing they NEVER do>"],
    "vocabulary_favored": ["<words they love>"],
    "vocabulary_banned": ["<words they'd never use>"]
  },
  "linguistic_fingerprint": {
    "slang_terms": ["<slang they use>"],
    "power_words": ["<words they emphasize>"],
    "filler_patterns": ["<their filler patterns>"],
    "opener_phrases": ["<how they start>"],
    "bridge_phrases": ["<how they transition>"],
    "emphasis_style": "<ALL_CAPS|repetition|punctuation|italics|none>",
    "contraction_level": <0-1>,
    "metaphor_sources": ["<where they draw metaphors from>"]
  },
  "emotional_arc": {
    "typical_structure": "<how they structure emotional content>",
    "intensity_curve": "<gradual|sudden|steady>",
    "resolution_style": "<how they wrap up>"
  },
  "tone_labels": ["<2-4 tone descriptors>"],
  "signature_phrases": ["<their catchphrases or recurring phrases>"],
  "hook_patterns": ["<how they open/hook attention>"],
  "closing_patterns": ["<how they close/end>"]
}`;

  try {
    const result = await callAI(analysisPrompt, {
      systemPrompt,
      maxTokens: 4096,
    });

    const parsed = parseJSON(result.content);
    if (!parsed) {
      return createEmptyFingerprint();
    }

    // Build fingerprint from AI analysis
    const fingerprint: VoiceFingerprint = {
      metrics: parsed.metrics || defaultMetrics(),
      rhythm_signature: parsed.rhythm_signature || { pattern: [], description: "unknown", punctuation_style: "clean" },
      generative_formulas: parsed.generative_formulas || [],
      voice_exemplars: parsed.voice_exemplars || {},
      contrastive_analysis: parsed.contrastive_analysis || { does: [], never: [], vocabulary_favored: [], vocabulary_banned: [] },
      linguistic_fingerprint: parsed.linguistic_fingerprint || defaultLinguisticFingerprint(),
      emotional_arc: parsed.emotional_arc,
      banned_words: [],
      tone_labels: parsed.tone_labels || [],
      signature_phrases: parsed.signature_phrases || [],
      hook_patterns: parsed.hook_patterns || [],
      closing_patterns: parsed.closing_patterns || [],
      sample_count: samples.length,
    };

    // Inject AI-ism bans (only words NOT found in their natural vocabulary)
    fingerprint.banned_words = buildBannedWordList(
      combinedText,
      fingerprint.contrastive_analysis.vocabulary_favored || [],
      fingerprint.linguistic_fingerprint.slang_terms || []
    );

    // Merge with existing if provided
    if (existingFingerprint) {
      return mergeFingerprints(fingerprint, existingFingerprint, samples.length);
    }

    return fingerprint;
  } catch (error) {
    console.error("[VoiceAnalyzer] Analysis failed:", error);
    return createEmptyFingerprint();
  }
}

// ============================================================================
// SAVE / PERSIST
// ============================================================================

/**
 * Save a voice fingerprint to the database.
 * Merges with existing data instead of overwriting.
 */
export async function saveFingerprint(
  supabase: any,
  orgId: string,
  userId: string,
  fingerprint: VoiceFingerprint
): Promise<boolean> {
  try {
    // Check for existing
    const { data: existing } = await supabase
      .from("content_voice_fingerprints")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Merge with existing
      const merged = mergeFingerprints(
        fingerprint,
        {
          metrics: existing.metrics,
          tone_labels: existing.tone_labels,
          signature_phrases: existing.signature_phrases,
          hook_patterns: existing.hook_patterns,
          closing_patterns: existing.closing_patterns,
          banned_words: existing.banned_words,
        },
        existing.sample_count || 1
      );

      const { error } = await supabase
        .from("content_voice_fingerprints")
        .update({
          metrics: merged.metrics,
          signature_phrases: merged.signature_phrases,
          hook_patterns: merged.hook_patterns,
          closing_patterns: merged.closing_patterns,
          tone_labels: merged.tone_labels,
          banned_words: merged.banned_words,
          sample_count: (existing.sample_count || 1) + fingerprint.sample_count,
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("content_voice_fingerprints")
        .insert({
          org_id: orgId,
          metrics: fingerprint.metrics,
          signature_phrases: fingerprint.signature_phrases,
          hook_patterns: fingerprint.hook_patterns,
          closing_patterns: fingerprint.closing_patterns,
          tone_labels: fingerprint.tone_labels,
          banned_words: fingerprint.banned_words,
          sample_count: fingerprint.sample_count,
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("[VoiceAnalyzer] Save failed:", error);
    return false;
  }
}

/**
 * Convert a voice fingerprint into an AI prompt block.
 */
export function fingerprintToPromptBlock(fp: VoiceFingerprint): string {
  const parts: string[] = [];

  parts.push("## VOICE FINGERPRINT (Write EXACTLY like this person)\n");

  if (fp.tone_labels?.length) {
    parts.push(`TONE: ${fp.tone_labels.join(" + ")}`);
  }

  if (fp.signature_phrases?.length) {
    parts.push(`SIGNATURE PHRASES: ${fp.signature_phrases.slice(0, 5).map((p) => `"${p}"`).join(", ")}`);
  }

  if (fp.rhythm_signature) {
    parts.push(`RHYTHM: ${fp.rhythm_signature.description}`);
  }

  if (fp.contrastive_analysis) {
    if (fp.contrastive_analysis.does?.length) {
      parts.push(`DOES: ${fp.contrastive_analysis.does.slice(0, 4).join(", ")}`);
    }
    if (fp.contrastive_analysis.never?.length) {
      parts.push(`NEVER: ${fp.contrastive_analysis.never.slice(0, 4).join(", ")}`);
    }
  }

  if (fp.linguistic_fingerprint) {
    if (fp.linguistic_fingerprint.emphasis_style && fp.linguistic_fingerprint.emphasis_style !== "none") {
      parts.push(`EMPHASIS: ${fp.linguistic_fingerprint.emphasis_style}`);
    }
    if (fp.linguistic_fingerprint.opener_phrases?.length) {
      parts.push(`OPENERS: ${fp.linguistic_fingerprint.opener_phrases.slice(0, 3).join(", ")}`);
    }
  }

  if (fp.banned_words?.length) {
    parts.push(`NEVER USE: ${fp.banned_words.slice(0, 10).join(", ")}`);
  }

  parts.push(`\nSTYLE: ~${fp.metrics.avg_sentence_length} words/sentence`);
  if (fp.metrics.emoji_frequency > 0.3) parts.push("Emojis: Yes");
  else if (fp.metrics.emoji_frequency < 0.1) parts.push("Emojis: No");

  return parts.join("\n");
}

// ============================================================================
// MERGE LOGIC
// ============================================================================

function mergeFingerprints(
  newFp: VoiceFingerprint,
  existing: Partial<VoiceFingerprint>,
  existingSampleCount: number
): VoiceFingerprint {
  const totalSamples = existingSampleCount + newFp.sample_count;
  const existingWeight = existingSampleCount / totalSamples;
  const newWeight = newFp.sample_count / totalSamples;

  // Weighted average for metrics
  const mergedMetrics = existing.metrics
    ? blendMetrics(existing.metrics, newFp.metrics, existingWeight, newWeight)
    : newFp.metrics;

  return {
    ...newFp,
    metrics: mergedMetrics,
    tone_labels: deduplicateArrays(existing.tone_labels || [], newFp.tone_labels),
    signature_phrases: deduplicateArrays(existing.signature_phrases || [], newFp.signature_phrases).slice(0, 10),
    hook_patterns: deduplicateArrays(existing.hook_patterns || [], newFp.hook_patterns).slice(0, 5),
    closing_patterns: deduplicateArrays(existing.closing_patterns || [], newFp.closing_patterns).slice(0, 5),
    banned_words: deduplicateArrays(existing.banned_words || [], newFp.banned_words),
    sample_count: totalSamples,
  };
}

function blendMetrics(
  existing: VoiceMetrics,
  incoming: VoiceMetrics,
  existingWeight: number,
  newWeight: number
): VoiceMetrics {
  return {
    avg_sentence_length: Math.round(
      existing.avg_sentence_length * existingWeight + incoming.avg_sentence_length * newWeight
    ),
    vocabulary_complexity:
      existing.vocabulary_complexity * existingWeight + incoming.vocabulary_complexity * newWeight,
    emoji_frequency:
      existing.emoji_frequency * existingWeight + incoming.emoji_frequency * newWeight,
    informal_markers:
      existing.informal_markers * existingWeight + incoming.informal_markers * newWeight,
    question_frequency:
      existing.question_frequency * existingWeight + incoming.question_frequency * newWeight,
    exclamation_frequency:
      existing.exclamation_frequency * existingWeight + incoming.exclamation_frequency * newWeight,
    first_person_usage:
      existing.first_person_usage * existingWeight + incoming.first_person_usage * newWeight,
    storytelling_tendency:
      existing.storytelling_tendency * existingWeight + incoming.storytelling_tendency * newWeight,
    data_usage: existing.data_usage * existingWeight + incoming.data_usage * newWeight,
    call_to_action_style: newWeight > 0.5 ? incoming.call_to_action_style : existing.call_to_action_style,
  };
}

// ============================================================================
// AI-ISM FILTERING
// ============================================================================

/**
 * Build banned word list: DEFAULT_AI_ISMS minus words the user naturally uses.
 */
function buildBannedWordList(
  naturalText: string,
  favoredWords: string[],
  slangTerms: string[]
): string[] {
  const lower = naturalText.toLowerCase();
  const naturalVocab = new Set([
    ...favoredWords.map((w) => w.toLowerCase()),
    ...slangTerms.map((w) => w.toLowerCase()),
  ]);

  return DEFAULT_AI_ISMS.filter((word) => {
    const wordLower = word.toLowerCase();
    // Don't ban if the user naturally uses this word
    if (naturalVocab.has(wordLower)) return false;
    // Don't ban if it appears frequently in their natural writing (3+ times)
    const regex = new RegExp(`\\b${wordLower}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length >= 3) return false;
    return true;
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function createEmptyFingerprint(): VoiceFingerprint {
  return {
    metrics: defaultMetrics(),
    rhythm_signature: { pattern: [], description: "unknown", punctuation_style: "clean" },
    generative_formulas: [],
    voice_exemplars: {},
    contrastive_analysis: { does: [], never: [], vocabulary_favored: [], vocabulary_banned: [] },
    linguistic_fingerprint: defaultLinguisticFingerprint(),
    banned_words: [...DEFAULT_AI_ISMS],
    tone_labels: [],
    signature_phrases: [],
    hook_patterns: [],
    closing_patterns: [],
    sample_count: 0,
  };
}

function defaultMetrics(): VoiceMetrics {
  return {
    avg_sentence_length: 15,
    vocabulary_complexity: 0.5,
    emoji_frequency: 0.1,
    informal_markers: 0.5,
    question_frequency: 0.2,
    exclamation_frequency: 0.1,
    first_person_usage: 0.3,
    storytelling_tendency: 0.4,
    data_usage: 0.3,
    call_to_action_style: "soft",
  };
}

function defaultLinguisticFingerprint(): LinguisticFingerprint {
  return {
    slang_terms: [],
    power_words: [],
    filler_patterns: [],
    opener_phrases: [],
    bridge_phrases: [],
    emphasis_style: "none",
    contraction_level: 0.5,
    metaphor_sources: [],
  };
}

function deduplicateArrays(a: string[], b: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of [...a, ...b]) {
    const lower = item.toLowerCase().trim();
    if (!seen.has(lower) && lower.length > 0) {
      seen.add(lower);
      result.push(item.trim());
    }
  }
  return result;
}

function parseJSON(text: string): any {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Fall through
      }
    }
    // Try finding first { to last }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
