/**
 * Universal Voice Genome Engine v2.0 (Incremental Voice Learning)
 *
 * Transplanted from Invisible Pipeline's voice-genome.ts (693 lines)
 * The "$1M Algorithm" — incrementally learns a user's voice from content samples
 * using Bayesian-style weighted blending. Gets BETTER with every sample.
 *
 * KEY INNOVATION: Instead of re-analyzing all samples on every update,
 * it blends new analysis into the existing genome with confidence weighting.
 * This means 100 samples don't cost 100x the compute.
 *
 * Original: Incremental voice cloning with source quality weighting in IP
 * Universal: Voice learning for ANY content type (posts, emails, transcripts, etc.)
 */

import type { VoiceDNA, VoiceMetrics } from "./voice-dna-service";
import { analyzeVoice, type VoiceFingerprint } from "./voice-analyzer";

// ============================================================================
// SOURCE QUALITY WEIGHTS
// ============================================================================

/** Different content sources have different voice signal quality */
export const SOURCE_WEIGHTS: Record<string, number> = {
  // Highest signal — user explicitly marked as "this is my voice"
  favorite: 10,
  curated: 8,

  // High signal — natural writing
  call_transcript: 5,
  voice_note: 5,
  podcast_transcript: 5,

  // Good signal — written content
  linkedin_post: 4,
  blog_post: 4,
  newsletter: 4,

  // Medium signal — conversational
  email: 3,
  dm: 3,
  message: 3,
  comment: 2,

  // Lower signal — may be edited/formal
  sales_page: 2,
  website_copy: 2,
  documentation: 1,

  // Default
  unknown: 2,
};

// ============================================================================
// TYPES
// ============================================================================

export interface GenomeMetric {
  value: number;
  confidence: number;  // 0-1, increases with more samples
  trend: "rising" | "falling" | "stable" | "unknown";
}

export interface GenomePattern {
  pattern: string;
  examples: string[];
  frequency: number;
  confidence: number;
}

export interface VoiceGenome {
  /** Quantitative voice metrics with confidence tracking */
  metrics: Record<string, GenomeMetric>;

  /** Clustered patterns ranked by frequency */
  patterns: GenomePattern[];

  /** Tone labels with confidence */
  tone_labels: Array<{ label: string; confidence: number }>;

  /** Signature phrases with usage count */
  signature_phrases: Array<{ phrase: string; count: number }>;

  /** Banned words (AI-isms unless natural) */
  banned_words: string[];

  /** Voice mode classification */
  voice_mode: "spoken" | "written" | "hybrid";

  /** Total samples analyzed */
  sample_count: number;

  /** Source type breakdown */
  source_breakdown: Record<string, number>;

  /** Compressed prompt block (~150 tokens) */
  prompt_block: string;

  /** When the genome was last refined */
  last_refined_at: string;
}

export interface RefinementInput {
  /** New writing sample */
  sample: string;

  /** Source type (for quality weighting) */
  sourceType: string;

  /** Optional user feedback: "this sounds like me" / "this doesn't" */
  feedback?: "positive" | "negative";
}

// ============================================================================
// VOICE GENOME ENGINE
// ============================================================================

/**
 * Get the current voice genome for a user/org.
 */
export async function getGenome(
  supabase: any,
  orgId: string,
  userId?: string
): Promise<VoiceGenome | null> {
  try {
    const { data } = await supabase
      .from("voice_genomes")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data?.genome_data) return null;
    return data.genome_data as VoiceGenome;
  } catch {
    return null;
  }
}

/**
 * Refine the voice genome with new samples.
 * Uses incremental Bayesian blending — doesn't re-analyze everything.
 *
 * @param supabase - Database client
 * @param orgId - Organization ID
 * @param inputs - New samples with source types
 * @param callAI - AI function for analysis
 */
export async function refineGenome(
  supabase: any,
  orgId: string,
  inputs: RefinementInput[],
  callAI: (prompt: string, options?: { systemPrompt?: string; maxTokens?: number }) => Promise<{ content: string }>
): Promise<VoiceGenome> {
  // 1. Get existing genome
  const existing = await getGenome(supabase, orgId);

  // 2. Analyze new samples (lightweight — just the new ones)
  const samples = inputs.map((i) => i.sample);
  const fingerprint = await analyzeVoice(samples, callAI);

  // 3. Calculate weighted quality of new samples
  const totalWeight = inputs.reduce(
    (sum, input) => sum + (SOURCE_WEIGHTS[input.sourceType] || SOURCE_WEIGHTS.unknown),
    0
  );

  // 4. Blend into existing genome (or create new)
  const genome = existing
    ? blendGenome(existing, fingerprint, totalWeight, inputs)
    : createGenomeFromFingerprint(fingerprint, inputs);

  // 5. Rebuild prompt block
  genome.prompt_block = buildGenomeBlock(genome);
  genome.last_refined_at = new Date().toISOString();

  // 6. Persist
  await persistGenome(supabase, orgId, genome, inputs.map((i) => i.sourceType));

  return genome;
}

// ============================================================================
// BLENDING (The "$1M Algorithm")
// ============================================================================

function blendGenome(
  existing: VoiceGenome,
  incoming: VoiceFingerprint,
  incomingWeight: number,
  inputs: RefinementInput[]
): VoiceGenome {
  const existingWeight = existing.sample_count * 2; // Existing has accumulated trust
  const totalWeight = existingWeight + incomingWeight;
  const existingRatio = existingWeight / totalWeight;
  const incomingRatio = incomingWeight / totalWeight;

  // Blend metrics
  const blendedMetrics: Record<string, GenomeMetric> = {};
  const metricKeys: Array<keyof VoiceMetrics> = [
    "avg_sentence_length", "vocabulary_complexity", "emoji_frequency",
    "informal_markers", "question_frequency", "exclamation_frequency",
    "first_person_usage", "storytelling_tendency", "data_usage",
  ];

  for (const key of metricKeys) {
    const existingMetric = existing.metrics[key];
    const incomingValue = incoming.metrics[key] as number;

    if (existingMetric) {
      const blendedValue = existingMetric.value * existingRatio + incomingValue * incomingRatio;
      const newConfidence = Math.min(existingMetric.confidence + 0.05, 1.0);
      const trend = detectTrend(existingMetric.value, blendedValue, existingMetric.trend);

      blendedMetrics[key] = {
        value: blendedValue,
        confidence: newConfidence,
        trend,
      };
    } else {
      blendedMetrics[key] = {
        value: incomingValue,
        confidence: 0.3,
        trend: "unknown",
      };
    }
  }

  // Blend patterns (deduplicate + rank by frequency)
  const blendedPatterns = blendPatterns(
    existing.patterns,
    incoming.generative_formulas.map((f) => ({
      pattern: f.pattern,
      examples: [f.example],
      frequency: f.frequency,
      confidence: 0.5,
    }))
  );

  // Blend tone labels
  const toneMap = new Map<string, number>();
  for (const t of existing.tone_labels) {
    toneMap.set(t.label.toLowerCase(), t.confidence);
  }
  for (const label of incoming.tone_labels) {
    const lower = label.toLowerCase();
    const existingConf = toneMap.get(lower) || 0;
    toneMap.set(lower, Math.min(existingConf + 0.2, 1.0));
  }
  const blendedTones = Array.from(toneMap.entries())
    .map(([label, confidence]) => ({ label, confidence }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  // Blend signature phrases
  const phraseMap = new Map<string, number>();
  for (const p of existing.signature_phrases) {
    phraseMap.set(p.phrase.toLowerCase(), p.count);
  }
  for (const phrase of incoming.signature_phrases) {
    const lower = phrase.toLowerCase();
    phraseMap.set(lower, (phraseMap.get(lower) || 0) + 1);
  }
  const blendedPhrases = Array.from(phraseMap.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Merge banned words
  const allBanned = new Set([...existing.banned_words, ...incoming.banned_words]);

  // Update source breakdown
  const sourceBreakdown = { ...existing.source_breakdown };
  for (const input of inputs) {
    sourceBreakdown[input.sourceType] = (sourceBreakdown[input.sourceType] || 0) + 1;
  }

  // Classify voice mode
  const voiceMode = classifyVoiceMode(sourceBreakdown);

  return {
    metrics: blendedMetrics,
    patterns: blendedPatterns,
    tone_labels: blendedTones,
    signature_phrases: blendedPhrases,
    banned_words: Array.from(allBanned),
    voice_mode: voiceMode,
    sample_count: existing.sample_count + inputs.length,
    source_breakdown: sourceBreakdown,
    prompt_block: "", // Rebuilt after blending
    last_refined_at: new Date().toISOString(),
  };
}

function createGenomeFromFingerprint(
  fp: VoiceFingerprint,
  inputs: RefinementInput[]
): VoiceGenome {
  const metrics: Record<string, GenomeMetric> = {};
  const metricKeys: Array<keyof VoiceMetrics> = [
    "avg_sentence_length", "vocabulary_complexity", "emoji_frequency",
    "informal_markers", "question_frequency", "exclamation_frequency",
    "first_person_usage", "storytelling_tendency", "data_usage",
  ];

  for (const key of metricKeys) {
    metrics[key] = {
      value: fp.metrics[key] as number,
      confidence: 0.3,
      trend: "unknown",
    };
  }

  const sourceBreakdown: Record<string, number> = {};
  for (const input of inputs) {
    sourceBreakdown[input.sourceType] = (sourceBreakdown[input.sourceType] || 0) + 1;
  }

  return {
    metrics,
    patterns: fp.generative_formulas.map((f) => ({
      pattern: f.pattern,
      examples: [f.example],
      frequency: f.frequency,
      confidence: 0.3,
    })),
    tone_labels: fp.tone_labels.map((l) => ({ label: l, confidence: 0.5 })),
    signature_phrases: fp.signature_phrases.map((p) => ({ phrase: p, count: 1 })),
    banned_words: fp.banned_words,
    voice_mode: classifyVoiceMode(sourceBreakdown),
    sample_count: inputs.length,
    source_breakdown: sourceBreakdown,
    prompt_block: "",
    last_refined_at: new Date().toISOString(),
  };
}

// ============================================================================
// PROMPT BLOCK BUILDERS
// ============================================================================

/**
 * Build a compressed prompt block (~150 tokens) from the genome.
 * This is what gets injected into AI prompts.
 */
export function buildGenomeBlock(genome: VoiceGenome): string {
  const parts: string[] = [];

  // Tone
  const topTones = genome.tone_labels.slice(0, 3).map((t) => t.label);
  if (topTones.length) {
    parts.push(`Voice: ${topTones.join(" + ")}`);
  }

  // Key metrics
  const sentenceLen = genome.metrics.avg_sentence_length;
  if (sentenceLen) {
    parts.push(`Sentences: ~${Math.round(sentenceLen.value)} words`);
  }

  const emoji = genome.metrics.emoji_frequency;
  if (emoji && emoji.value > 0.3) parts.push("Emojis: Yes");
  else if (emoji && emoji.value < 0.1) parts.push("Emojis: No");

  const storytelling = genome.metrics.storytelling_tendency;
  if (storytelling && storytelling.value > 0.6) parts.push("Style: Storyteller");

  const data = genome.metrics.data_usage;
  if (data && data.value > 0.6) parts.push("Style: Data-driven");

  // Top phrases
  const topPhrases = genome.signature_phrases.slice(0, 3).map((p) => `"${p.phrase}"`);
  if (topPhrases.length) {
    parts.push(`Phrases: ${topPhrases.join(", ")}`);
  }

  // Top pattern
  if (genome.patterns.length) {
    parts.push(`Pattern: "${genome.patterns[0].pattern}"`);
  }

  // Bans
  if (genome.banned_words.length) {
    parts.push(`Never: ${genome.banned_words.slice(0, 6).join(", ")}`);
  }

  return parts.join(". ");
}

/**
 * Build a minimal prompt block (~50 tokens) for DMs/quick interactions.
 */
export function buildMinimalGenomeBlock(genome: VoiceGenome): string {
  const parts: string[] = [];

  const topTones = genome.tone_labels.slice(0, 2).map((t) => t.label);
  if (topTones.length) parts.push(`Voice: ${topTones.join(", ")}`);

  if (genome.banned_words.length) {
    parts.push(`Never: ${genome.banned_words.slice(0, 3).join(", ")}`);
  }

  if (genome.signature_phrases.length) {
    parts.push(`Style: "${genome.signature_phrases[0].phrase}"`);
  }

  return parts.join(". ");
}

// ============================================================================
// PERSISTENCE
// ============================================================================

async function persistGenome(
  supabase: any,
  orgId: string,
  genome: VoiceGenome,
  sourceTypes: string[]
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("voice_genomes")
      .select("id, sample_count")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("voice_genomes")
        .update({
          genome_data: genome,
          sample_count: genome.sample_count,
          source_types: [...new Set(sourceTypes)],
          voice_mode: genome.voice_mode,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("voice_genomes").insert({
        org_id: orgId,
        genome_data: genome,
        sample_count: genome.sample_count,
        source_types: [...new Set(sourceTypes)],
        voice_mode: genome.voice_mode,
      });
    }
  } catch (err) {
    console.error("[VoiceGenome] Persist failed:", err);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function detectTrend(
  oldValue: number,
  newValue: number,
  currentTrend: string
): "rising" | "falling" | "stable" | "unknown" {
  const delta = newValue - oldValue;
  const threshold = oldValue * 0.05; // 5% change threshold

  if (Math.abs(delta) < threshold) return "stable";
  return delta > 0 ? "rising" : "falling";
}

function blendPatterns(
  existing: GenomePattern[],
  incoming: GenomePattern[]
): GenomePattern[] {
  const patternMap = new Map<string, GenomePattern>();

  for (const p of existing) {
    patternMap.set(p.pattern.toLowerCase(), p);
  }

  for (const p of incoming) {
    const key = p.pattern.toLowerCase();
    const existingPattern = patternMap.get(key);

    if (existingPattern) {
      // Merge: increase frequency and confidence
      patternMap.set(key, {
        ...existingPattern,
        examples: [...new Set([...existingPattern.examples, ...p.examples])].slice(0, 3),
        frequency: Math.min(existingPattern.frequency + 0.1, 1.0),
        confidence: Math.min(existingPattern.confidence + 0.1, 1.0),
      });
    } else {
      patternMap.set(key, p);
    }
  }

  return Array.from(patternMap.values())
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);
}

function classifyVoiceMode(
  sourceBreakdown: Record<string, number>
): "spoken" | "written" | "hybrid" {
  const spokenSources = ["call_transcript", "voice_note", "podcast_transcript"];
  const writtenSources = ["linkedin_post", "blog_post", "email", "newsletter", "dm"];

  let spoken = 0;
  let written = 0;

  for (const [source, count] of Object.entries(sourceBreakdown)) {
    if (spokenSources.includes(source)) spoken += count;
    if (writtenSources.includes(source)) written += count;
  }

  if (spoken > 0 && written > 0) return "hybrid";
  if (spoken > written) return "spoken";
  return "written";
}
