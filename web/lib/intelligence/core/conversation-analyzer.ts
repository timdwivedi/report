/**
 * Universal Conversation Analyzer
 *
 * Transplanted from Invisible Pipeline's conversation-analyzer.ts + emotion-service.ts
 * Combined into a single service that handles conversation state + emotional intelligence.
 *
 * Original: Analyzed sales DM threads for engagement, objections, buying intent
 * Universal: Analyzes ANY conversation (sales, diagnostic, interview, support)
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig } from "../config/intelligence.config";
import type { ConversationState, ConversationMessage, EmotionalState, SubjectProfile } from "../types/intelligence.types";

// ============================================================================
// CONVERSATION STATE ANALYSIS
// ============================================================================

/**
 * Analyze a conversation thread to determine current state and next action.
 */
export async function analyzeConversation(
  config: IntelligenceConfig,
  messages: ConversationMessage[],
  subjectProfile?: SubjectProfile | null
): Promise<ConversationState> {
  if (!config.conversation.enabled || !messages || messages.length === 0) {
    return getDefaultState(config);
  }

  const prompt = buildConversationPrompt(config, messages, subjectProfile);

  try {
    const result = await callAI(prompt, {
      model: config.ai.analysis_model,
      systemPrompt: `You are a conversation analysis expert for ${config.domain} contexts. Analyze the conversation and determine current state. Return ONLY valid JSON.`,
      temperature: 0.3,
      maxTokens: 2000,
    });

    let content = result.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const state = JSON.parse(content) as ConversationState;
    state.reply_velocity = calculateReplyVelocity(messages);
    state.message_count = messages.length;

    return state;
  } catch {
    console.error("[Intelligence] Conversation analysis failed");
    return getDefaultState(config);
  }
}

function buildConversationPrompt(
  config: IntelligenceConfig,
  messages: ConversationMessage[],
  profile?: SubjectProfile | null
): string {
  const { conversation } = config;

  // Build signal detection instructions from config
  const signalInstructions = conversation.signal_types
    .map(s => `   - **${s.type}**: ${s.indicators.map(i => `"${i}"`).join(", ")} — ${s.description}`)
    .join("\n");

  const stageDescriptions = conversation.stages
    .map((s, i) => `   - **${s}**: Stage ${i + 1} of ${conversation.stages.length}`)
    .join("\n");

  return `Analyze this conversation to determine current state and next move.

CONVERSATION HISTORY:
${messages.map(m => `[${m.role.toUpperCase()}] (${m.timestamp}): ${m.content}`).join("\n\n")}

${profile ? `SUBJECT PROFILE:
- Decision Mode: ${profile.decision_mode}
- Directness: ${profile.communication_style.directness.toFixed(2)}
- Formality: ${profile.communication_style.formality.toFixed(2)}
` : ""}

Return a JSON object:

1. **engagement_level** (string: none|low|medium|high|very_high)

2. **signal_detections** (array of objects):
   Signal types to detect:
${signalInstructions}
   Each: { "type": "signal_type", "signal": "exact text", "confidence": 0-1 }

3. **intent_score** (number 0-1): How ready are they for the desired outcome?

4. **emotional_state** (string): One of: ${conversation.emotional_states.map(s => `"${s}"`).join(", ")}

5. **next_action_strategy** (object):
   - tone: maintain|soften|intensify
   - focus: One of: ${conversation.focus_areas.map(f => `"${f}"`).join(", ")}
   - timing: now|wait|not_ready

6. **conversation_stage** (string): One of:
${stageDescriptions}

Be precise with numeric scores. Return ONLY valid JSON.`;
}

// ============================================================================
// EMOTIONAL STATE ANALYSIS
// ============================================================================

/**
 * Analyze emotional state from a conversation.
 * Lighter-weight than full conversation analysis — focused on emotion detection.
 */
export async function analyzeEmotionalState(
  config: IntelligenceConfig,
  conversationText: string
): Promise<EmotionalState | null> {
  if (!conversationText || conversationText.length < 50) return null;

  try {
    const result = await callAI(
      `Analyze this conversation for emotional state:\n\n${conversationText}`,
      {
        model: config.ai.extraction_model,
        systemPrompt: `You are an Emotional Intelligence Analyst. Analyze the conversation to determine the ${config.subject.singular}'s emotional state.

Return JSON:
{
  "primary_emotion": "string",
  "intensity": number (1-10),
  "confidence_score": number (0-100),
  "trigger_detected": "what caused this emotion",
  "suggested_adaptation": "how to adapt approach"
}`,
        maxTokens: 500,
      }
    );

    const content = result.content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(content) as EmotionalState;
  } catch {
    return null;
  }
}

// ============================================================================
// CONVERSATION UTILITIES
// ============================================================================

function calculateReplyVelocity(messages: ConversationMessage[]): number {
  if (messages.length < 2) return 0;

  const subjectMessages = messages.filter(m => m.role === "subject");
  if (subjectMessages.length < 2) return 0;

  const timeDiffs: number[] = [];
  for (let i = 1; i < subjectMessages.length; i++) {
    const prev = new Date(subjectMessages[i - 1].timestamp).getTime();
    const curr = new Date(subjectMessages[i].timestamp).getTime();
    const diffHours = (curr - prev) / (1000 * 60 * 60);
    timeDiffs.push(diffHours);
  }

  return Math.round((timeDiffs.reduce((s, d) => s + d, 0) / timeDiffs.length) * 10) / 10;
}

function getDefaultState(config: IntelligenceConfig): ConversationState {
  return {
    engagement_level: "none",
    signal_detections: [],
    intent_score: 0.3,
    emotional_state: config.conversation.emotional_states[0] || "neutral",
    next_action_strategy: {
      tone: "maintain",
      focus: config.conversation.focus_areas[0] || "introduction",
      timing: "wait",
    },
    conversation_stage: config.conversation.stages[0] || "initial",
    reply_velocity: 0,
    message_count: 0,
  };
}

/**
 * Check if it's time to push for the desired outcome (close, offer, etc.)
 */
export function shouldPushForOutcome(state: ConversationState): boolean {
  return (
    state.intent_score >= 0.7 &&
    state.engagement_level === "very_high" &&
    state.message_count >= 2
  );
}

/**
 * Check if we should back off and give space
 */
export function shouldBackOff(state: ConversationState): boolean {
  return (
    state.engagement_level === "low" && state.message_count >= 3 ||
    state.signal_detections.filter(s => s.type.includes("objection") || s.type.includes("resistance")).length >= 2
  );
}

/**
 * Get human-readable conversation summary
 */
export function getConversationSummary(state: ConversationState): string {
  const parts: string[] = [];
  parts.push(`Stage: ${state.conversation_stage.toUpperCase()}`);
  parts.push(`Engagement: ${state.engagement_level.toUpperCase()}`);
  parts.push(`Intent: ${(state.intent_score * 100).toFixed(0)}%`);
  parts.push(`Emotion: ${state.emotional_state}`);

  if (state.signal_detections.length > 0) {
    parts.push(`Signals: ${state.signal_detections.map(s => s.type).join(", ")}`);
  }

  return parts.join(" | ");
}
