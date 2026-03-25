/**
 * Funnel Calculator — Server-side funnel stage computation
 *
 * Reads raw analytics_events and computes:
 * - Stage-by-stage counts and rates
 * - Per-question drop-off rates
 * - Input method splits (voice/text/mixed)
 * - Device and source breakdowns
 *
 * Used by: /api/analytics/funnel, /api/analytics/aggregate
 */

import type {
  FunnelStageData,
  FunnelSummary,
  QuestionHeatmapRow,
} from "../types/analytics.types";
import { FUNNEL_STAGE_ORDER } from "../config/events.config";

interface EventRow {
  event_type: string;
  session_id: string;
  funnel_stage: string | null;
  properties: Record<string, unknown>;
  duration_ms: number | null;
  created_at: string;
}

/** Compute funnel summary from raw events */
export function computeFunnel(events: EventRow[], dateRange: { start: string; end: string }): FunnelSummary {
  // Count unique sessions per funnel stage
  const stageSessions = new Map<string, Set<string>>();

  for (const event of events) {
    const stage = event.funnel_stage;
    if (!stage) continue;

    if (!stageSessions.has(stage)) {
      stageSessions.set(stage, new Set());
    }
    stageSessions.get(stage)!.add(event.session_id);
  }

  // Count page_view events for landing stage (only actual landing pages)
  for (const event of events) {
    if (event.event_type === "page_view") {
      const path = (event.properties?.path as string) || "";
      if (path === "/" || path.includes("/landing")) {
        if (!stageSessions.has("landing")) {
          stageSessions.set("landing", new Set());
        }
        stageSessions.get("landing")!.add(event.session_id);
      }
    }
  }

  // Build stages in order
  const stages: FunnelStageData[] = [];
  let prevCount = 0;

  for (const { stage, label } of FUNNEL_STAGE_ORDER) {
    const count = stageSessions.get(stage)?.size || 0;

    // Skip individual question stages for high-level funnel
    if (stage.startsWith("quiz_q")) continue;

    const rate = prevCount > 0 ? (count / prevCount) * 100 : null;
    const dropoff = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : null;

    stages.push({ stage, label, count, rate, dropoff });
    prevCount = count;
  }

  const totalVisitors = stageSessions.get("landing")?.size || stageSessions.get("quiz_start")?.size || 0;
  const totalConversions = stageSessions.get("application_submit")?.size || 0;

  return {
    stages,
    overall_conversion_rate: totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0,
    total_visitors: totalVisitors,
    date_range: dateRange,
  };
}

/** Compute per-question heatmap from raw events */
export function computeQuestionHeatmap(events: EventRow[], questionCount: number): QuestionHeatmapRow[] {
  const questionMap = new Map<number, {
    durations: number[];
    viewSessions: Set<string>;
    answerSessions: Set<string>;
    voiceCount: number;
    textCount: number;
    mixedCount: number;
    answerLengths: number[];
    questionText: string;
  }>();

  // Initialize for each question
  for (let i = 1; i <= questionCount; i++) {
    questionMap.set(i, {
      durations: [],
      viewSessions: new Set(),
      answerSessions: new Set(),
      voiceCount: 0,
      textCount: 0,
      mixedCount: 0,
      answerLengths: [],
      questionText: `Question ${i}`,
    });
  }

  for (const event of events) {
    const qIdx = event.properties?.question_index as number;
    if (typeof qIdx !== "number" || !questionMap.has(qIdx)) continue;

    const q = questionMap.get(qIdx)!;

    if (event.event_type === "quiz_question_view") {
      q.viewSessions.add(event.session_id);
      if (event.properties?.question_text) {
        q.questionText = event.properties.question_text as string;
      }
    }

    if (event.event_type === "quiz_question_answer") {
      q.answerSessions.add(event.session_id);
      if (event.duration_ms) q.durations.push(event.duration_ms);
      if (event.properties?.answer_length) {
        q.answerLengths.push(event.properties.answer_length as number);
      }

      const method = event.properties?.input_method as string;
      if (method === "voice") q.voiceCount++;
      else if (method === "text") q.textCount++;
      else q.mixedCount++;
    }
  }

  const rows: QuestionHeatmapRow[] = [];

  for (let i = 1; i <= questionCount; i++) {
    const q = questionMap.get(i)!;
    const totalAnswers = q.answerSessions.size;
    const totalViews = q.viewSessions.size;
    const totalInputs = q.voiceCount + q.textCount + q.mixedCount;

    const dropoffRate = totalViews > 0
      ? ((totalViews - totalAnswers) / totalViews) * 100
      : 0;

    rows.push({
      question_index: i,
      question_text: q.questionText,
      avg_duration_ms: q.durations.length > 0
        ? q.durations.reduce((a, b) => a + b, 0) / q.durations.length
        : 0,
      dropoff_rate: Math.round(dropoffRate * 10) / 10,
      voice_percent: totalInputs > 0 ? Math.round((q.voiceCount / totalInputs) * 100) : 0,
      text_percent: totalInputs > 0 ? Math.round((q.textCount / totalInputs) * 100) : 0,
      mixed_percent: totalInputs > 0 ? Math.round((q.mixedCount / totalInputs) * 100) : 0,
      avg_answer_length: q.answerLengths.length > 0
        ? Math.round(q.answerLengths.reduce((a, b) => a + b, 0) / q.answerLengths.length)
        : 0,
      total_answers: totalAnswers,
    });
  }

  return rows;
}

