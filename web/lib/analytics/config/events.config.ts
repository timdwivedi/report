/**
 * Event Taxonomy — Standard discovery funnel events.
 *
 * 14 events covering: landing → quiz → bridge → application.
 * Each event has a type, category, funnel stage, and required properties.
 */

import type { EventCategory, FunnelStage } from "../types/analytics.types";

export interface EventDefinition {
  type: string;
  category: EventCategory;
  funnelStage: FunnelStage | string | null;
  description: string;
  requiredProperties: string[];
  optionalProperties: string[];
}

export const EVENT_TAXONOMY: EventDefinition[] = [
  // ─── Landing ────────────────────────────────────────────────
  {
    type: "page_view",
    category: "engagement",
    funnelStage: null,
    description: "Any page view (funnel stage inferred from path)",
    requiredProperties: ["path"],
    optionalProperties: ["title", "referrer"],
  },
  {
    type: "landing_cta_click",
    category: "conversion",
    funnelStage: "landing",
    description: "CTA click on landing page",
    requiredProperties: ["cta_text"],
    optionalProperties: ["section"],
  },

  // ─── Quiz ───────────────────────────────────────────────────
  {
    type: "quiz_start",
    category: "funnel",
    funnelStage: "quiz_start",
    description: "User begins the quiz",
    requiredProperties: [],
    optionalProperties: ["quiz_version"],
  },
  {
    type: "quiz_question_view",
    category: "funnel",
    funnelStage: null, // Dynamically set to quiz_q{N}
    description: "Question rendered on screen",
    requiredProperties: ["question_index"],
    optionalProperties: ["question_text"],
  },
  {
    type: "quiz_question_answer",
    category: "funnel",
    funnelStage: null, // Dynamically set to quiz_q{N}
    description: "User submits an answer",
    requiredProperties: ["question_index"],
    optionalProperties: ["input_method", "duration_ms", "answer_length"],
  },
  {
    type: "quiz_question_skip",
    category: "funnel",
    funnelStage: null,
    description: "User skips a question",
    requiredProperties: ["question_index"],
    optionalProperties: [],
  },
  {
    type: "quiz_complete",
    category: "funnel",
    funnelStage: "quiz_complete",
    description: "Quiz fully completed",
    requiredProperties: [],
    optionalProperties: ["total_time_ms", "input_method", "archetype_primary"],
  },

  // ─── Bridge Page ────────────────────────────────────────────
  {
    type: "bridge_view",
    category: "funnel",
    funnelStage: "bridge_view",
    description: "Bridge/results page loaded",
    requiredProperties: [],
    optionalProperties: ["archetype_primary", "submission_id"],
  },
  {
    type: "bridge_section_view",
    category: "engagement",
    funnelStage: "bridge_view",
    description: "Section enters viewport (via IntersectionObserver)",
    requiredProperties: ["section"],
    optionalProperties: ["time_ms", "scroll_depth"],
  },
  {
    type: "bridge_video_play",
    category: "engagement",
    funnelStage: "bridge_view",
    description: "Video started or progress milestone",
    requiredProperties: [],
    optionalProperties: ["watch_percent", "duration_ms"],
  },
  {
    type: "bridge_scroll_depth",
    category: "engagement",
    funnelStage: "bridge_view",
    description: "Scroll depth milestone (25%, 50%, 75%, 100%)",
    requiredProperties: ["depth_percent"],
    optionalProperties: [],
  },
  {
    type: "bridge_text_select",
    category: "engagement",
    funnelStage: "bridge_view",
    description: "User selected text on bridge page",
    requiredProperties: ["section"],
    optionalProperties: ["selected_text_length"],
  },
  {
    type: "bridge_cta_click",
    category: "conversion",
    funnelStage: "bridge_cta",
    description: "CTA button clicked on bridge page",
    requiredProperties: ["cta_text"],
    optionalProperties: ["cta_position"],
  },

  // ─── Application ────────────────────────────────────────────
  {
    type: "application_start",
    category: "funnel",
    funnelStage: "application_start",
    description: "Application form opened",
    requiredProperties: [],
    optionalProperties: ["submission_id"],
  },
  {
    type: "application_submit",
    category: "conversion",
    funnelStage: "application_submit",
    description: "Application form submitted",
    requiredProperties: [],
    optionalProperties: ["submission_id"],
  },
];

/** Lookup event definition by type */
export function getEventDefinition(eventType: string): EventDefinition | undefined {
  return EVENT_TAXONOMY.find((e) => e.type === eventType);
}

/** Get all funnel events (ordered by stage) */
export function getFunnelEvents(): EventDefinition[] {
  return EVENT_TAXONOMY.filter((e) => e.category === "funnel");
}

/** Validate event properties */
export function validateEvent(
  eventType: string,
  properties: Record<string, unknown>
): { valid: boolean; missing: string[] } {
  const def = getEventDefinition(eventType);
  if (!def) return { valid: true, missing: [] }; // Unknown events pass through

  const missing = def.requiredProperties.filter((p) => !(p in properties));
  return { valid: missing.length === 0, missing };
}

/** Infer funnel stage from event type and properties */
export function inferFunnelStage(
  eventType: string,
  properties: Record<string, unknown>
): string | null {
  const def = getEventDefinition(eventType);
  if (!def) return null;

  // Dynamic stage for quiz questions
  if (
    eventType === "quiz_question_view" ||
    eventType === "quiz_question_answer" ||
    eventType === "quiz_question_skip"
  ) {
    const idx = properties.question_index;
    return typeof idx === "number" ? `quiz_q${idx}` : null;
  }

  return def.funnelStage;
}

/** Standard funnel stages in order (for chart rendering) */
export const FUNNEL_STAGE_ORDER: { stage: string; label: string }[] = [
  { stage: "landing", label: "Landing Page" },
  { stage: "quiz_start", label: "Quiz Start" },
  { stage: "quiz_q1", label: "Question 1" },
  { stage: "quiz_q2", label: "Question 2" },
  { stage: "quiz_q3", label: "Question 3" },
  { stage: "quiz_q4", label: "Question 4" },
  { stage: "quiz_q5", label: "Question 5" },
  { stage: "quiz_q6", label: "Question 6" },
  { stage: "quiz_complete", label: "Quiz Complete" },
  { stage: "bridge_view", label: "Bridge Page" },
  { stage: "bridge_cta", label: "CTA Click" },
  { stage: "application_start", label: "Application Start" },
  { stage: "application_submit", label: "Application Submit" },
];
