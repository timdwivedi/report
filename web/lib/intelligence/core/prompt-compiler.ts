/**
 * Universal DOE Prompt Compiler (Context Tier System)
 *
 * Transplanted from Invisible Pipeline's compiler.ts (1,547 lines)
 * THE orchestration layer that assembles all intelligence into prompts.
 *
 * Context Tiers:
 *   MINIMAL (~500 tokens): DMs, quick interactions — speed over depth
 *   MODERATE (~1,200 tokens): Emails, follow-ups — balanced
 *   FULL (~5,000+ tokens): Long-form content, reports — maximum intelligence
 *
 * This is what makes the intelligence layer USEFUL — without the compiler,
 * you have extracted data but no way to use it for generation.
 *
 * Original: DOE-based prompt assembly with 7 intelligence layers in IP
 * Universal: Config-driven prompt assembly for ANY content generation
 */

import type { IntelligenceConfig } from "../config/intelligence.config";
import type { SubjectDNA, SubjectProfile, ConversationState } from "../types/intelligence.types";
import type { VoiceDNA } from "./voice-dna-service";
import type { Constitution } from "./constitution-service";
import {
  buildFullVoiceBlock,
  buildModerateVoiceBlock,
  buildMinimalVoiceBlock,
} from "./voice-dna-service";
import {
  buildConstitutionBlock,
  buildMinimalConstitutionBlock,
} from "./constitution-service";

// ============================================================================
// TYPES
// ============================================================================

export type ContextTier = "minimal" | "moderate" | "full";

export interface CompilationContext {
  /** Intelligence config for this deployment */
  config: IntelligenceConfig;

  /** Context tier (determines how much intelligence to inject) */
  tier: ContextTier;

  /** The base prompt/template to compile */
  basePrompt: string;

  /** Subject intelligence (optional per tier) */
  subjectDNA?: SubjectDNA | null;
  subjectProfile?: SubjectProfile | null;
  conversationState?: ConversationState | null;

  /** Voice & Brand (optional) */
  voiceDNA?: VoiceDNA | null;
  constitution?: Constitution | null;

  /** Custom context sections to inject */
  customSections?: Record<string, string>;

  /** Template variables to replace (e.g., {{subject.name}}) */
  variables?: Record<string, string>;
}

export interface CompiledPrompt {
  /** The fully compiled prompt ready for AI */
  prompt: string;

  /** System prompt (if applicable) */
  systemPrompt?: string;

  /** Estimated token count */
  estimatedTokens: number;

  /** What was injected */
  injectedLayers: string[];

  /** Context tier used */
  tier: ContextTier;
}

// ============================================================================
// MAIN COMPILER
// ============================================================================

/**
 * Compile a prompt with intelligence context injected.
 *
 * This is the CORE function that turns raw intelligence into usable prompts.
 * The tier system ensures we don't dump 8,000 tokens for a 50-word DM.
 */
export function compilePrompt(context: CompilationContext): CompiledPrompt {
  const { config, tier, basePrompt } = context;
  const sections: string[] = [];
  const injectedLayers: string[] = [];

  // ========================================================================
  // 1. CONSTITUTION (Top of hierarchy — always injected if available)
  // ========================================================================
  if (context.constitution) {
    if (tier === "minimal") {
      sections.push(buildMinimalConstitutionBlock(context.constitution));
    } else {
      sections.push(buildConstitutionBlock(context.constitution));
    }
    injectedLayers.push("constitution");
  }

  // ========================================================================
  // 2. VOICE DNA (How to write — tiered injection)
  // ========================================================================
  if (context.voiceDNA) {
    switch (tier) {
      case "full":
        sections.push(buildFullVoiceBlock(context.voiceDNA));
        break;
      case "moderate":
        sections.push(buildModerateVoiceBlock(context.voiceDNA));
        break;
      case "minimal":
        sections.push(buildMinimalVoiceBlock(context.voiceDNA));
        break;
    }
    injectedLayers.push("voice_dna");
  }

  // ========================================================================
  // 3. SUBJECT DNA (Who we're talking to/about)
  // ========================================================================
  if (context.subjectDNA && context.subjectDNA.extraction_confidence > 20) {
    sections.push(buildSubjectDNABlock(context.subjectDNA, config, tier));
    injectedLayers.push("subject_dna");
  }

  // ========================================================================
  // 4. SUBJECT PROFILE (Communication style — moderate+ only)
  // ========================================================================
  if (tier !== "minimal" && context.subjectProfile) {
    sections.push(buildProfileBlock(context.subjectProfile, config));
    injectedLayers.push("subject_profile");
  }

  // ========================================================================
  // 5. CONVERSATION STATE (Thread context — moderate+ only)
  // ========================================================================
  if (tier !== "minimal" && context.conversationState && context.conversationState.message_count > 0) {
    sections.push(buildConversationBlock(context.conversationState));
    injectedLayers.push("conversation_state");
  }

  // ========================================================================
  // 6. CUSTOM SECTIONS (Domain-specific context)
  // ========================================================================
  if (context.customSections) {
    for (const [name, content] of Object.entries(context.customSections)) {
      sections.push(`\n## ${name.toUpperCase()}\n${content}`);
      injectedLayers.push(`custom:${name}`);
    }
  }

  // ========================================================================
  // ASSEMBLE
  // ========================================================================
  let compiledPrompt = basePrompt;

  // Replace template variables
  if (context.variables) {
    for (const [key, value] of Object.entries(context.variables)) {
      compiledPrompt = compiledPrompt.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
  }

  // Inject intelligence context
  const contextBlock = sections.join("\n\n");
  if (contextBlock.trim()) {
    compiledPrompt = `${contextBlock}\n\n---\n\n${compiledPrompt}`;
  }

  const estimatedTokens = Math.ceil(compiledPrompt.length / 4);

  return {
    prompt: compiledPrompt,
    estimatedTokens,
    injectedLayers,
    tier,
  };
}

// ============================================================================
// BLOCK BUILDERS
// ============================================================================

function buildSubjectDNABlock(
  dna: SubjectDNA,
  config: IntelligenceConfig,
  tier: ContextTier
): string {
  const parts: string[] = [];
  const label = config.subject.singular.toUpperCase();

  parts.push(`\n## ${label} INTELLIGENCE`);

  // Archetype (always include if available)
  if (dna.matched_archetype) {
    parts.push(`Type: ${dna.matched_archetype.primary} (${dna.matched_archetype.confidence}% confidence)`);
    if (tier !== "minimal" && dna.matched_archetype.reasoning) {
      parts.push(`Why: ${dna.matched_archetype.reasoning}`);
    }
  }

  // Attributes
  const attrs = Object.entries(dna.attributes).filter(([, v]) => v);
  if (attrs.length) {
    parts.push(`Profile: ${attrs.map(([k, v]) => `${k}: ${v}`).join(", ")}`);
  }

  // Key dimensions (tier-dependent depth)
  const maxDimensions = tier === "minimal" ? 3 : tier === "moderate" ? 5 : 999;
  const priorityDims = config.dna.dimensions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxDimensions);

  for (const dimConfig of priorityDims) {
    const items = dna.dimensions[dimConfig.name] || [];
    if (items.length > 0) {
      const maxItems = tier === "minimal" ? 2 : tier === "moderate" ? 4 : 8;
      parts.push(`${dimConfig.label}: ${items.slice(0, maxItems).join(", ")}`);
    }
  }

  // Unique phrases (gold for personalization — always include top ones)
  if (dna.unique_phrases?.length) {
    const maxPhrases = tier === "minimal" ? 1 : tier === "moderate" ? 3 : 5;
    parts.push(`Verbatim: ${dna.unique_phrases.slice(0, maxPhrases).map(p => `"${p}"`).join(", ")}`);
  }

  return parts.join("\n");
}

function buildProfileBlock(profile: SubjectProfile, config: IntelligenceConfig): string {
  const parts: string[] = [];

  parts.push(`\n## ${config.subject.singular.toUpperCase()} PROFILE`);
  parts.push(`Decision mode: ${profile.decision_mode}`);
  parts.push(`Style: directness ${(profile.communication_style.directness * 100).toFixed(0)}%, formality ${(profile.communication_style.formality * 100).toFixed(0)}%`);

  if (profile.trigger_words?.length) {
    parts.push(`Use these words: ${profile.trigger_words.slice(0, 5).join(", ")}`);
  }
  if (profile.anti_patterns?.length) {
    parts.push(`Avoid: ${profile.anti_patterns.slice(0, 4).join(", ")}`);
  }

  parts.push(`Message length: ${profile.response_patterns.preferred_message_length}`);

  return parts.join("\n");
}

function buildConversationBlock(state: ConversationState): string {
  const parts: string[] = [];

  parts.push(`\n## CONVERSATION CONTEXT`);
  parts.push(`Stage: ${state.conversation_stage}, Engagement: ${state.engagement_level}`);
  parts.push(`Intent: ${(state.intent_score * 100).toFixed(0)}%, Emotion: ${state.emotional_state}`);

  if (state.signal_detections.length > 0) {
    parts.push(`Signals: ${state.signal_detections.map(s => s.type).join(", ")}`);
  }

  parts.push(`Strategy: ${state.next_action_strategy.tone} tone, focus on ${state.next_action_strategy.focus}`);

  return parts.join("\n");
}

// ============================================================================
// AUTO TIER SELECTION
// ============================================================================

/**
 * Auto-select context tier based on content type.
 * Use this when the caller doesn't specify a tier.
 */
export function autoSelectTier(contentType: string): ContextTier {
  const minimalTypes = ["dm", "message", "reply", "comment", "chat"];
  const moderateTypes = ["email", "followup", "follow_up", "outreach", "intro"];
  // Everything else = full

  const lower = contentType.toLowerCase();

  if (minimalTypes.some(t => lower.includes(t))) return "minimal";
  if (moderateTypes.some(t => lower.includes(t))) return "moderate";
  return "full";
}
