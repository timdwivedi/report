/**
 * Universal Simulation Engine (Digital Twin)
 *
 * Transplanted from Invisible Pipeline's simulation-engine.ts
 * Creates "Digital Twin" personas and simulates interactions before taking action.
 *
 * Original: Simulated how leads would respond to sales messages
 * Universal: Simulates how ANY subject would respond to ANY action/message
 */

import { callAI } from "@/lib/ai/ai-service";
import type { IntelligenceConfig } from "../config/intelligence.config";
import type { PersonaModel, SimulationResult, SubjectProfile, SubjectDNA } from "../types/intelligence.types";

/**
 * Generate a persona model for simulation from available data.
 */
export function generatePersona(
  config: IntelligenceConfig,
  subjectData: Record<string, any>,
  subjectDNA?: SubjectDNA | null,
  subjectProfile?: SubjectProfile | null
): PersonaModel {
  // If we have a profile, use it for rich persona generation
  if (subjectProfile) {
    const modeDescriptions: Record<string, string> = {
      analytical: "data-driven, wants evidence and ROI",
      emotional: "values connection, responds to stories and vision",
      social: "influenced by community, values consensus",
      pragmatic: "wants practical solutions, no fluff, immediate value",
    };

    return {
      id: subjectData.id || "generated",
      base_archetype: subjectDNA?.matched_archetype?.primary || subjectProfile.decision_mode,
      profile_data: subjectData,
      simulation_prompt: `You are a ${config.subject.singular} who is ${modeDescriptions[subjectProfile.decision_mode] || "evaluating options"}. Directness: ${subjectProfile.communication_style.directness.toFixed(1)}/1. Formality: ${subjectProfile.communication_style.formality.toFixed(1)}/1. You respond ${subjectProfile.response_patterns.preferred_message_length === "short" ? "briefly" : "with detail"}.${subjectProfile.personality_markers.skepticism > 0.6 ? " You are skeptical of claims without proof." : ""}`,
    };
  }

  // Fallback: use archetype from config or title-based heuristics
  const title = (subjectData.title || "").toLowerCase();
  const archetypes = config.simulation.default_archetypes;

  let archetype = "neutral_professional";
  let prompt = `You are a busy professional evaluating a ${config.domain} proposal.`;

  for (const [key, archetypePrompt] of Object.entries(archetypes)) {
    // Simple keyword matching against title
    const keywords = key.split("_");
    if (keywords.some(kw => title.includes(kw))) {
      archetype = key;
      prompt = archetypePrompt;
      break;
    }
  }

  return {
    id: subjectData.id || "generated",
    base_archetype: archetype,
    profile_data: subjectData,
    simulation_prompt: prompt,
  };
}

/**
 * Run a simulation: Persona vs Draft Message/Action.
 * Returns predicted outcome.
 */
export async function runSimulation(
  config: IntelligenceConfig,
  persona: PersonaModel,
  draftMessage: string
): Promise<SimulationResult> {
  if (!config.simulation.enabled) {
    return getHeuristicResult(draftMessage);
  }

  try {
    const result = await callAI(
      `You are role-playing as this persona:\n${persona.simulation_prompt}\n\nYou received this message:\n"${draftMessage}"\n\nRespond with JSON:\n{\n  "success_probability": number (0-100),\n  "internal_thought_process": "What you're thinking when reading this",\n  "predicted_response": "How you'd actually respond",\n  "risk_analysis": { "tone": "positive|negative|neutral", "key_risk": "main concern" }\n}`,
      {
        model: config.ai.analysis_model,
        maxTokens: 800,
        systemPrompt: "You are simulating a persona's reaction. Be realistic and critical. Return ONLY JSON.",
      }
    );

    const content = result.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);

    return {
      success_probability: parsed.success_probability || 50,
      internal_thought_process: parsed.internal_thought_process || "",
      predicted_response: parsed.predicted_response || "",
      risk_analysis: parsed.risk_analysis || {},
      draft_message: draftMessage,
    };
  } catch {
    return getHeuristicResult(draftMessage);
  }
}

/**
 * Heuristic-based simulation fallback (no AI needed)
 */
function getHeuristicResult(message: string): SimulationResult {
  const lower = message.toLowerCase();
  const negativeWords = ["synergy", "optimize", "check in", "follow up", "chat", "touch base"];
  const positiveWords = ["revenue", "growth", "scale", "problem", "fix", "results", "specific"];

  let score = 50;
  const thoughts: string[] = [];

  if (negativeWords.some(w => lower.includes(w))) {
    score -= 20;
    thoughts.push("Feels like a generic template.");
  }
  if (positiveWords.some(w => lower.includes(w))) {
    score += 20;
    thoughts.push("This is relevant to my situation.");
  }
  if (message.length > 300) {
    score -= 15;
    thoughts.push("Too long.");
  }
  if (message.length < 50) {
    score -= 10;
    thoughts.push("Too vague, not enough context.");
  }

  score = Math.max(10, Math.min(95, score));

  return {
    success_probability: score,
    internal_thought_process: thoughts.join(" ") || "Evaluating...",
    predicted_response: score > 70 ? "I'm interested, tell me more." : "Thanks, not right now.",
    risk_analysis: { tone: score > 60 ? "positive" : "negative" },
    draft_message: message,
  };
}
