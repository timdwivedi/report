/**
 * Universal Prompt Builder (Full DOE Framework)
 *
 * Transplanted from Invisible Pipeline's prompt-builder.ts (1,932 lines)
 * THE master prompt assembly function that weaves ALL intelligence layers
 * into a single, powerful prompt. This is the FULL version — the prompt-compiler
 * handles context tiers, this handles the complete DOE injection stack.
 *
 * Intelligence Layers (injected in order):
 *   1. Constitution (brand governance)
 *   2. Voice DNA (writing style)
 *   3. Subject DNA (who we're talking to/about)
 *   4. Psychographic Adaptation (communication style matching)
 *   5. Conversation Adaptation (thread context)
 *   6. Emotional Adaptation (emotional intelligence)
 *   7. Temporal Guidance (timing intelligence)
 *   8. Effectiveness Guidance (what's working)
 *   9. Predictive Guidance (outcome prediction)
 *   10. Simulation Feedback (wargame results)
 *
 * Original: buildAdaptivePrompt() with 13 injection functions in IP
 * Universal: Config-driven DOE assembly for ANY content generation
 */

import type { IntelligenceConfig } from "../config/intelligence.config";
import type { SubjectDNA, SubjectProfile, ConversationState, EmotionalState, PredictiveInsight } from "../types/intelligence.types";
import type { VoiceDNA } from "./voice-dna-service";
import type { Constitution } from "./constitution-service";
import type { TemporalPattern } from "./temporal-service";

// ============================================================================
// TYPES
// ============================================================================

export interface AdaptivePromptContext {
  /** Intelligence config for this deployment */
  config: IntelligenceConfig;

  /** The base prompt/task to execute */
  basePrompt: string;

  /** System-level instructions */
  systemPrompt?: string;

  /** Content type (for tier selection) */
  contentType?: string;

  /** Subject intelligence */
  subjectDNA?: SubjectDNA | null;
  subjectProfile?: SubjectProfile | null;
  conversationState?: ConversationState | null;
  emotionalState?: EmotionalState | null;
  predictiveInsight?: PredictiveInsight | null;

  /** Voice & Brand */
  voiceDNA?: VoiceDNA | null;
  constitution?: Constitution | null;

  /** Temporal intelligence */
  temporalPattern?: TemporalPattern | null;

  /** Effectiveness data */
  effectivenessGuidance?: {
    recommendedStyle?: string;
    confidence?: string;
    reason?: string;
    avoidStyles?: string[];
  } | null;

  /** Simulation feedback */
  simulationFeedback?: {
    predicted_response?: string;
    risk_level?: string;
    adjustments?: string[];
  } | null;

  /** Custom sections to inject */
  customSections?: Record<string, string>;

  /** Template variables */
  variables?: Record<string, string>;

  /** Dynamic examples (proven winners) */
  examples?: Array<{
    input: string;
    output: string;
    label?: string;
  }>;
}

export interface AdaptivePromptResult {
  /** The fully assembled system prompt */
  systemPrompt: string;

  /** The user prompt with variables injected */
  userPrompt: string;

  /** Which intelligence layers were injected */
  injectedLayers: string[];

  /** Estimated total token count */
  estimatedTokens: number;
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

/**
 * Build an adaptive prompt with ALL available intelligence layers injected.
 * This is the MASTER function — call this when you want maximum intelligence.
 *
 * Each injection is conditional: only included if data is available.
 * The result is a fully assembled system prompt + user prompt pair.
 */
export function buildAdaptivePrompt(ctx: AdaptivePromptContext): AdaptivePromptResult {
  const sections: string[] = [];
  const injectedLayers: string[] = [];

  // ========================================================================
  // LAYER 1: CONSTITUTION (Top of hierarchy — brand governance)
  // ========================================================================
  if (ctx.constitution) {
    sections.push(injectConstitution(ctx.constitution));
    injectedLayers.push("constitution");
  }

  // ========================================================================
  // LAYER 2: VOICE DNA (How to write — authenticity)
  // ========================================================================
  if (ctx.voiceDNA) {
    sections.push(injectVoiceDNA(ctx.voiceDNA));
    injectedLayers.push("voice_dna");
  }

  // ========================================================================
  // LAYER 3: SUBJECT DNA (Who we're engaging with)
  // ========================================================================
  if (ctx.subjectDNA && ctx.subjectDNA.extraction_confidence > 20) {
    sections.push(injectSubjectDNA(ctx.subjectDNA, ctx.config));
    injectedLayers.push("subject_dna");
  }

  // ========================================================================
  // LAYER 4: PSYCHOGRAPHIC ADAPTATION (Communication style matching)
  // ========================================================================
  if (ctx.subjectProfile) {
    sections.push(injectPsychographicAdaptation(ctx.subjectProfile, ctx.config));
    injectedLayers.push("psychographic");
  }

  // ========================================================================
  // LAYER 5: CONVERSATION ADAPTATION (Thread context)
  // ========================================================================
  if (ctx.conversationState && ctx.conversationState.message_count > 0) {
    sections.push(injectConversationAdaptation(ctx.conversationState));
    injectedLayers.push("conversation");
  }

  // ========================================================================
  // LAYER 6: EMOTIONAL ADAPTATION (Emotional intelligence)
  // ========================================================================
  if (ctx.emotionalState) {
    sections.push(injectEmotionalAdaptation(ctx.emotionalState));
    injectedLayers.push("emotional");
  }

  // ========================================================================
  // LAYER 7: TEMPORAL GUIDANCE (Timing intelligence)
  // ========================================================================
  if (ctx.temporalPattern) {
    sections.push(injectTemporalGuidance(ctx.temporalPattern));
    injectedLayers.push("temporal");
  }

  // ========================================================================
  // LAYER 8: EFFECTIVENESS GUIDANCE (What's working)
  // ========================================================================
  if (ctx.effectivenessGuidance) {
    sections.push(injectEffectivenessGuidance(ctx.effectivenessGuidance));
    injectedLayers.push("effectiveness");
  }

  // ========================================================================
  // LAYER 9: PREDICTIVE GUIDANCE (Outcome prediction)
  // ========================================================================
  if (ctx.predictiveInsight) {
    sections.push(injectPredictiveGuidance(ctx.predictiveInsight));
    injectedLayers.push("predictive");
  }

  // ========================================================================
  // LAYER 10: SIMULATION FEEDBACK (Wargame results)
  // ========================================================================
  if (ctx.simulationFeedback) {
    sections.push(injectSimulationFeedback(ctx.simulationFeedback));
    injectedLayers.push("simulation");
  }

  // ========================================================================
  // LAYER 11: DYNAMIC EXAMPLES (Proven winners)
  // ========================================================================
  if (ctx.examples?.length) {
    sections.push(injectDynamicExamples(ctx.examples));
    injectedLayers.push("examples");
  }

  // ========================================================================
  // LAYER 12: CUSTOM SECTIONS (Domain-specific)
  // ========================================================================
  if (ctx.customSections) {
    for (const [name, content] of Object.entries(ctx.customSections)) {
      sections.push(`\n## ${name.toUpperCase()}\n${content}`);
      injectedLayers.push(`custom:${name}`);
    }
  }

  // ========================================================================
  // ASSEMBLE
  // ========================================================================
  const systemPrompt = [
    ctx.systemPrompt || "",
    ...sections,
  ].filter(Boolean).join("\n\n");

  // User prompt with variable injection
  let userPrompt = ctx.basePrompt;
  if (ctx.variables) {
    for (const [key, value] of Object.entries(ctx.variables)) {
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
  }

  const estimatedTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);

  return {
    systemPrompt,
    userPrompt,
    injectedLayers,
    estimatedTokens,
  };
}

// ============================================================================
// INJECTION FUNCTIONS
// ============================================================================

function injectConstitution(constitution: Constitution): string {
  const { values, rules, brand_voice } = constitution;
  const parts: string[] = [];

  parts.push(`\n## BRAND CONSTITUTION`);

  if (values.length > 0) {
    parts.push(`Values: ${values.map((v) => v.name).join(", ")}`);
  }

  if (brand_voice.personality?.length) {
    parts.push(`Personality: ${brand_voice.personality.join(" + ")}`);
  }

  if (brand_voice.formality < 0.3) parts.push(`Tone: Casual`);
  else if (brand_voice.formality > 0.7) parts.push(`Tone: Formal`);
  else parts.push(`Tone: Balanced`);

  if (rules.length > 0) {
    parts.push(`Rules: ${rules.slice(0, 5).join("; ")}`);
  }

  return parts.join("\n");
}

function injectVoiceDNA(voice: VoiceDNA): string {
  const parts: string[] = [];
  parts.push(`\n## VOICE DNA`);

  if (voice.tone_labels?.length) parts.push(`Tone: ${voice.tone_labels.join(", ")}`);

  if (voice.signature_phrases?.length) {
    parts.push(`Phrases: ${voice.signature_phrases.slice(0, 4).map((p) => `"${p}"`).join(", ")}`);
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
    parts.push(`Banned: ${voice.banned_words.slice(0, 6).join(", ")}`);
  }

  parts.push(`Style: ~${voice.metrics.avg_sentence_length} words/sentence`);

  return parts.join("\n");
}

function injectSubjectDNA(dna: SubjectDNA, config: IntelligenceConfig): string {
  const parts: string[] = [];
  const label = config.subject.singular.toUpperCase();

  parts.push(`\n## ${label} INTELLIGENCE`);

  if (dna.matched_archetype) {
    parts.push(`Type: ${dna.matched_archetype.primary} (${dna.matched_archetype.confidence}%)`);
  }

  // Top attributes
  const attrs = Object.entries(dna.attributes).filter(([, v]) => v);
  if (attrs.length) {
    parts.push(`Profile: ${attrs.map(([k, v]) => `${k}: ${v}`).join(", ")}`);
  }

  // Key dimensions (top 5 by config priority)
  const topDims = config.dna.dimensions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  for (const dimConfig of topDims) {
    const items = dna.dimensions[dimConfig.name] || [];
    if (items.length > 0) {
      parts.push(`${dimConfig.label}: ${items.slice(0, 4).join(", ")}`);
    }
  }

  // Unique phrases (gold for personalization)
  if (dna.unique_phrases?.length) {
    parts.push(`Verbatim: ${dna.unique_phrases.slice(0, 3).map((p) => `"${p}"`).join(", ")}`);
  }

  return parts.join("\n");
}

function injectPsychographicAdaptation(profile: SubjectProfile, config: IntelligenceConfig): string {
  const parts: string[] = [];

  parts.push(`\n## COMMUNICATION ADAPTATION`);
  parts.push(`Decision mode: ${profile.decision_mode}`);

  const d = profile.communication_style.directness;
  const f = profile.communication_style.formality;

  if (d > 0.7) parts.push(`Adapt: Be direct. No fluff. Get to the point.`);
  else if (d < 0.3) parts.push(`Adapt: Be gentle. Build context. Tell a story first.`);

  if (f > 0.7) parts.push(`Register: Formal. No slang. Professional language.`);
  else if (f < 0.3) parts.push(`Register: Casual. Contractions OK. Friendly tone.`);

  if (profile.trigger_words?.length) {
    parts.push(`Use words: ${profile.trigger_words.slice(0, 5).join(", ")}`);
  }

  if (profile.anti_patterns?.length) {
    parts.push(`Avoid: ${profile.anti_patterns.slice(0, 4).join(", ")}`);
  }

  parts.push(`Message length: ${profile.response_patterns.preferred_message_length}`);

  return parts.join("\n");
}

function injectConversationAdaptation(state: ConversationState): string {
  const parts: string[] = [];

  parts.push(`\n## CONVERSATION CONTEXT`);
  parts.push(`Stage: ${state.conversation_stage}, Engagement: ${state.engagement_level}`);
  parts.push(`Intent: ${(state.intent_score * 100).toFixed(0)}%, Emotion: ${state.emotional_state}`);

  if (state.signal_detections.length > 0) {
    parts.push(`Signals: ${state.signal_detections.map((s) => s.type).join(", ")}`);
  }

  const strategy = state.next_action_strategy;
  parts.push(`Strategy: ${strategy.tone} tone, focus on ${strategy.focus}`);

  if (state.message_count > 5) {
    parts.push(`History: ${state.message_count} messages exchanged`);
  }

  return parts.join("\n");
}

function injectEmotionalAdaptation(emotional: EmotionalState): string {
  const parts: string[] = [];

  parts.push(`\n## EMOTIONAL INTELLIGENCE`);
  parts.push(`Current: ${emotional.primary_emotion} (${(emotional.intensity * 100).toFixed(0)}% intensity)`);

  if (emotional.trigger_detected) {
    parts.push(`Trigger: "${emotional.trigger_detected}"`);
  }

  parts.push(`Adapt: ${emotional.suggested_adaptation}`);

  return parts.join("\n");
}

function injectTemporalGuidance(pattern: TemporalPattern): string {
  const parts: string[] = [];

  parts.push(`\n## TIMING CONTEXT`);

  if (pattern.avg_response_time_minutes) {
    parts.push(`Avg response: ${pattern.avg_response_time_minutes} min`);
  }

  if (pattern.response_time_trend !== "unknown") {
    parts.push(`Trend: ${pattern.response_time_trend}`);
  }

  if (pattern.current_fatigue_score > 0.5) {
    parts.push(`WARNING: High contact fatigue (${Math.round(pattern.current_fatigue_score * 100)}%). Keep it brief.`);
  }

  if (pattern.urgency_signals.deadline_mentioned) {
    parts.push(`URGENCY: Deadline mentioned. Act with appropriate urgency.`);
  }

  return parts.join("\n");
}

function injectEffectivenessGuidance(guidance: NonNullable<AdaptivePromptContext["effectivenessGuidance"]>): string {
  const parts: string[] = [];

  parts.push(`\n## WHAT'S WORKING`);

  if (guidance.recommendedStyle) {
    parts.push(`Best approach: "${guidance.recommendedStyle}" (${guidance.confidence} confidence)`);
  }

  if (guidance.reason) {
    parts.push(`Why: ${guidance.reason}`);
  }

  if (guidance.avoidStyles?.length) {
    parts.push(`Avoid: ${guidance.avoidStyles.join(", ")} (underperforming)`);
  }

  return parts.join("\n");
}

function injectPredictiveGuidance(prediction: PredictiveInsight): string {
  const parts: string[] = [];

  parts.push(`\n## PREDICTION`);
  parts.push(`Probability: ${(prediction.outcome_probability).toFixed(0)}%`);

  if (prediction.risk_factors?.length) {
    parts.push(`Risks: ${prediction.risk_factors.slice(0, 3).join(", ")}`);
  }

  if (prediction.winning_factors?.length) {
    parts.push(`Leverage: ${prediction.winning_factors.slice(0, 3).join(", ")}`);
  }

  if (prediction.recommended_next_action) {
    parts.push(`Action: ${prediction.recommended_next_action}`);
  }

  return parts.join("\n");
}

function injectSimulationFeedback(sim: NonNullable<AdaptivePromptContext["simulationFeedback"]>): string {
  const parts: string[] = [];

  parts.push(`\n## SIMULATION RESULTS`);

  if (sim.predicted_response) {
    parts.push(`Expected reaction: "${sim.predicted_response}"`);
  }

  if (sim.risk_level) {
    parts.push(`Risk: ${sim.risk_level}`);
  }

  if (sim.adjustments?.length) {
    parts.push(`Adjustments:`);
    sim.adjustments.forEach((a) => parts.push(`  - ${a}`));
  }

  return parts.join("\n");
}

function injectDynamicExamples(examples: NonNullable<AdaptivePromptContext["examples"]>): string {
  const parts: string[] = [];

  parts.push(`\n## PROVEN EXAMPLES`);
  parts.push(`These are real examples that worked well. Use them as style guides, not templates.\n`);

  for (const ex of examples.slice(0, 3)) {
    if (ex.label) parts.push(`### ${ex.label}`);
    parts.push(`Context: ${ex.input}`);
    parts.push(`Output: ${ex.output}\n`);
  }

  return parts.join("\n");
}
