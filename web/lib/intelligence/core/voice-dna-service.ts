/**
 * Universal Voice DNA Service (Quantum Mirror)
 *
 * Transplanted from Invisible Pipeline's voice-dna-service.ts (830 lines)
 * THE service that makes AI-generated content sound AUTHENTIC — not generic AI.
 *
 * Learns the user's writing voice from samples and injects it into prompts.
 * Supports tiered injection (minimal for DMs, full for long-form content).
 *
 * Original: Bridges Quantum Mirror training → content generation in IP
 * Universal: Voice learning for ANY content generation (posts, emails, messages, reports)
 */

import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceMetrics {
  avg_sentence_length: number;
  vocabulary_complexity: number; // 0-1
  emoji_frequency: number;      // 0-1
  informal_markers: number;     // 0-1
  question_frequency: number;   // 0-1
  exclamation_frequency: number; // 0-1
  first_person_usage: number;    // 0-1
  storytelling_tendency: number; // 0-1
  data_usage: number;            // 0-1
  call_to_action_style: "soft" | "hard" | "none";
}

export interface RhythmSignature {
  pattern: number[];      // Sentence length sequence
  description: string;    // "Short-long-short" etc.
  punctuation_style: string; // "heavy_commas" | "dash_lover" | "clean"
}

export interface GenerativeFormula {
  pattern: string;    // "If X, then Y" | "The truth is..."
  example: string;    // Actual example from their content
  frequency: number;  // How often they use this pattern
}

export interface VoiceExemplars {
  high_energy?: string;
  analytical?: string;
  empathetic?: string;
  direct?: string;
  signature?: string; // Their most characteristic style
}

export interface ContrastiveAnalysis {
  does: string[];               // Things they DO in writing
  never: string[];              // Things they NEVER do
  vocabulary_favored: string[]; // Words they love
  vocabulary_banned: string[];  // Words they'd never use
}

export interface LinguisticFingerprint {
  slang_terms: string[];
  power_words: string[];
  filler_patterns: string[];
  opener_phrases: string[];
  bridge_phrases: string[];
  emphasis_style: "ALL_CAPS" | "repetition" | "punctuation" | "italics" | "none";
  contraction_level: number; // 0-1
  metaphor_sources: string[];
}

export interface VoiceDNA {
  id: string;
  metrics: VoiceMetrics;
  signature_phrases: string[];
  hook_patterns: string[];
  closing_patterns: string[];
  tone_labels: string[];
  banned_words: string[];
  sample_count: number;
  last_analyzed_at: string;

  // Enhanced fields
  rhythm_signature?: RhythmSignature;
  generative_formulas?: GenerativeFormula[];
  voice_exemplars?: VoiceExemplars;
  contrastive_analysis?: ContrastiveAnalysis;
  linguistic_fingerprint?: LinguisticFingerprint;
  voice_mode?: "spoken" | "written" | "hybrid";
}

// ============================================================================
// CACHE
// ============================================================================

interface CacheEntry {
  data: VoiceDNA | null;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const voiceCache = new Map<string, CacheEntry>();

// ============================================================================
// FETCH SERVICE
// ============================================================================

/**
 * Fetch Voice DNA for a user/org from the database with caching.
 *
 * @param supabase - Supabase client
 * @param orgId - Organization ID
 * @param userId - Optional user-specific voice
 */
export async function getVoiceDNA(
  supabase: any,
  orgId: string,
  userId?: string
): Promise<VoiceDNA | null> {
  const cacheKey = `${orgId}:${userId || "org"}`;
  const cached = voiceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // Try voice_genomes table first (v2.0 - incremental learning)
    const { data: genome } = await supabase
      .from("voice_genomes")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (genome?.genome_data) {
      const voiceDNA = normalizeGenomeToVoiceDNA(genome);
      voiceCache.set(cacheKey, { data: voiceDNA, timestamp: Date.now() });
      return voiceDNA;
    }

    // Fallback: legacy voice fingerprints
    const { data: fingerprint } = await supabase
      .from("content_voice_fingerprints")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fingerprint) {
      const voiceDNA = normalizeFingerprintToVoiceDNA(fingerprint);
      voiceCache.set(cacheKey, { data: voiceDNA, timestamp: Date.now() });
      return voiceDNA;
    }

    voiceCache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  } catch {
    return null;
  }
}

export function invalidateVoiceCache(orgId: string): void {
  for (const key of voiceCache.keys()) {
    if (key.startsWith(orgId)) voiceCache.delete(key);
  }
}

// ============================================================================
// PROMPT BLOCK BUILDERS (Tiered)
// ============================================================================

/**
 * Full voice block for long-form content (posts, emails, reports)
 * ~500-800 tokens — maximum voice fidelity
 */
export function buildFullVoiceBlock(voice: VoiceDNA): string {
  const parts: string[] = [];

  parts.push(`\n## VOICE DNA (Write EXACTLY like this person)\n`);

  // Signature phrases
  if (voice.signature_phrases?.length) {
    parts.push(`SIGNATURE PHRASES (Use naturally):`);
    voice.signature_phrases.slice(0, 5).forEach(p => parts.push(`  - "${p}"`));
  }

  // Tone
  if (voice.tone_labels?.length) {
    parts.push(`\nTONE: ${voice.tone_labels.join(" + ")}`);
  }

  // Rhythm
  if (voice.rhythm_signature) {
    parts.push(`\nRHYTHM: ${voice.rhythm_signature.description}`);
    parts.push(`Punctuation: ${voice.rhythm_signature.punctuation_style}`);
  }

  // Generative formulas
  if (voice.generative_formulas?.length) {
    parts.push(`\nPATTERNS THEY USE:`);
    voice.generative_formulas.slice(0, 3).forEach(f => {
      parts.push(`  - Pattern: "${f.pattern}" (e.g., "${f.example}")`);
    });
  }

  // Voice exemplars
  if (voice.voice_exemplars) {
    parts.push(`\nVOICE EXAMPLES:`);
    if (voice.voice_exemplars.signature) {
      parts.push(`  Signature: "${voice.voice_exemplars.signature}"`);
    }
    if (voice.voice_exemplars.high_energy) {
      parts.push(`  High Energy: "${voice.voice_exemplars.high_energy}"`);
    }
    if (voice.voice_exemplars.direct) {
      parts.push(`  Direct: "${voice.voice_exemplars.direct}"`);
    }
  }

  // Contrastive
  if (voice.contrastive_analysis) {
    const ca = voice.contrastive_analysis;
    if (ca.does?.length) parts.push(`\nTHIS VOICE DOES: ${ca.does.slice(0, 4).join(", ")}`);
    if (ca.never?.length) parts.push(`THIS VOICE NEVER: ${ca.never.slice(0, 4).join(", ")}`);
    if (ca.vocabulary_favored?.length) parts.push(`FAVORED WORDS: ${ca.vocabulary_favored.slice(0, 6).join(", ")}`);
    if (ca.vocabulary_banned?.length) parts.push(`BANNED WORDS: ${ca.vocabulary_banned.slice(0, 6).join(", ")}`);
  }

  // Linguistic fingerprint
  if (voice.linguistic_fingerprint) {
    const lf = voice.linguistic_fingerprint;
    if (lf.opener_phrases?.length) parts.push(`\nOPENER PHRASES: ${lf.opener_phrases.slice(0, 3).join(", ")}`);
    if (lf.emphasis_style && lf.emphasis_style !== "none") parts.push(`EMPHASIS: Uses ${lf.emphasis_style}`);
    if (lf.contraction_level > 0.6) parts.push(`CONTRACTIONS: Heavy (casual voice)`);
    else if (lf.contraction_level < 0.3) parts.push(`CONTRACTIONS: Rare (formal voice)`);
  }

  // Banned words
  if (voice.banned_words?.length) {
    parts.push(`\nNEVER USE: ${voice.banned_words.slice(0, 8).join(", ")}`);
  }

  // Metrics-based guidance
  parts.push(`\nSTYLE METRICS:`);
  parts.push(`  Sentence length: ~${voice.metrics.avg_sentence_length} words`);
  if (voice.metrics.emoji_frequency > 0.3) parts.push(`  Emojis: Yes, they use them`);
  else if (voice.metrics.emoji_frequency < 0.1) parts.push(`  Emojis: No, avoid them`);
  if (voice.metrics.storytelling_tendency > 0.5) parts.push(`  Style: Storyteller (narrative-heavy)`);
  if (voice.metrics.data_usage > 0.5) parts.push(`  Style: Data-driven (use numbers)`);

  return parts.join("\n");
}

/**
 * Moderate voice block for emails/follow-ups (~200-300 tokens)
 */
export function buildModerateVoiceBlock(voice: VoiceDNA): string {
  const parts: string[] = [];

  parts.push(`## Voice DNA`);

  if (voice.tone_labels?.length) {
    parts.push(`Tone: ${voice.tone_labels.join(", ")}`);
  }

  if (voice.signature_phrases?.length) {
    parts.push(`Signature phrases: ${voice.signature_phrases.slice(0, 3).map(p => `"${p}"`).join(", ")}`);
  }

  if (voice.contrastive_analysis) {
    if (voice.contrastive_analysis.does?.length) {
      parts.push(`Does: ${voice.contrastive_analysis.does.slice(0, 3).join(", ")}`);
    }
    if (voice.contrastive_analysis.never?.length) {
      parts.push(`Never: ${voice.contrastive_analysis.never.slice(0, 3).join(", ")}`);
    }
  }

  if (voice.banned_words?.length) {
    parts.push(`Banned: ${voice.banned_words.slice(0, 5).join(", ")}`);
  }

  parts.push(`Avg sentence: ~${voice.metrics.avg_sentence_length} words`);

  return parts.join("\n");
}

/**
 * Minimal voice block for DMs (~50-80 tokens)
 */
export function buildMinimalVoiceBlock(voice: VoiceDNA): string {
  const parts: string[] = [];

  if (voice.tone_labels?.length) {
    parts.push(`Voice: ${voice.tone_labels.slice(0, 2).join(", ")}`);
  }
  if (voice.banned_words?.length) {
    parts.push(`Never: ${voice.banned_words.slice(0, 3).join(", ")}`);
  }
  if (voice.signature_phrases?.[0]) {
    parts.push(`Style: "${voice.signature_phrases[0]}"`);
  }

  return parts.join(". ");
}

// ============================================================================
// NORMALIZERS
// ============================================================================

function normalizeGenomeToVoiceDNA(genome: any): VoiceDNA {
  const g = genome.genome_data || {};
  return {
    id: genome.id,
    metrics: g.metrics || defaultMetrics(),
    signature_phrases: g.signature_phrases || [],
    hook_patterns: g.hook_patterns || [],
    closing_patterns: g.closing_patterns || [],
    tone_labels: g.tone_labels || [],
    banned_words: g.banned_words || [],
    sample_count: genome.sample_count || 0,
    last_analyzed_at: genome.updated_at || genome.created_at,
    rhythm_signature: g.rhythm_signature,
    generative_formulas: g.generative_formulas,
    voice_exemplars: g.voice_exemplars,
    contrastive_analysis: g.contrastive_analysis,
    linguistic_fingerprint: g.linguistic_fingerprint,
    voice_mode: g.voice_mode,
  };
}

function normalizeFingerprintToVoiceDNA(fp: any): VoiceDNA {
  return {
    id: fp.id,
    metrics: fp.metrics || defaultMetrics(),
    signature_phrases: fp.signature_phrases || [],
    hook_patterns: fp.hook_patterns || [],
    closing_patterns: fp.closing_patterns || [],
    tone_labels: fp.tone_labels || [],
    banned_words: fp.banned_words || [],
    sample_count: fp.sample_count || 1,
    last_analyzed_at: fp.created_at,
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
