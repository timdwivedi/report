/**
 * Analytics Demo Data — Realistic funnel data for demo mode.
 *
 * Provides realistic-looking analytics data that works without a database.
 * Used by the analytics-demo-wrapper for getOrDemo() pattern.
 */

import type {
  FunnelStageData,
  FunnelSummary,
  QuestionHeatmapRow,
  MetricData,
  ABTest,
  FunnelDailyRow,
} from "../types/analytics.types";

// ─── Funnel Stages ──────────────────────────────────────────────────────────

export function getDemoFunnelStages(): FunnelStageData[] {
  return [
    { stage: "landing", label: "Landing Page", count: 450, rate: null, dropoff: null },
    { stage: "quiz_start", label: "Quiz Start", count: 320, rate: 71.1, dropoff: 28.9 },
    { stage: "quiz_q1", label: "Question 1", count: 298, rate: 93.1, dropoff: 6.9 },
    { stage: "quiz_q2", label: "Question 2", count: 285, rate: 95.6, dropoff: 4.4 },
    { stage: "quiz_q3", label: "Question 3", count: 271, rate: 95.1, dropoff: 4.9 },
    { stage: "quiz_q4", label: "Question 4", count: 258, rate: 95.2, dropoff: 4.8 },
    { stage: "quiz_q5", label: "Question 5", count: 245, rate: 95.0, dropoff: 5.0 },
    { stage: "quiz_q6", label: "Question 6", count: 232, rate: 94.7, dropoff: 5.3 },
    { stage: "quiz_complete", label: "Quiz Complete", count: 218, rate: 94.0, dropoff: 6.0 },
    { stage: "bridge_view", label: "Bridge Page", count: 201, rate: 92.2, dropoff: 7.8 },
    { stage: "bridge_cta", label: "CTA Click", count: 42, rate: 20.9, dropoff: 79.1 },
    { stage: "application_start", label: "Application", count: 35, rate: 83.3, dropoff: 16.7 },
    { stage: "application_submit", label: "Submitted", count: 28, rate: 80.0, dropoff: 20.0 },
  ];
}

export function getDemoFunnelSummary(): FunnelSummary {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    stages: getDemoFunnelStages(),
    overall_conversion_rate: 6.2,
    total_visitors: 450,
    date_range: {
      start: thirtyDaysAgo.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
  };
}

// ─── Archetype Distribution ─────────────────────────────────────────────────

export interface DemoArchetypeData {
  archetype: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export function getDemoArchetypeDistribution(): DemoArchetypeData[] {
  return [
    { archetype: "type_1", label: "Type 1", count: 78, percentage: 35.8, color: "#e11d48" },
    { archetype: "type_2", label: "Type 2", count: 52, percentage: 23.9, color: "#7c3aed" },
    { archetype: "type_3", label: "Type 3", count: 41, percentage: 18.8, color: "#2563eb" },
    { archetype: "type_4", label: "Type 4", count: 31, percentage: 14.2, color: "#059669" },
    { archetype: "type_5", label: "Type 5", count: 16, percentage: 7.3, color: "#d97706" },
  ];
}

// ─── Question Heat Map ──────────────────────────────────────────────────────

export function getDemoQuestionHeatmap(): QuestionHeatmapRow[] {
  return [
    {
      question_index: 1, question_text: "How do you handle it when someone offers to help?",
      avg_duration_ms: 45200, dropoff_rate: 6.9, voice_percent: 28, text_percent: 68, mixed_percent: 4, avg_answer_length: 142, total_answers: 298,
    },
    {
      question_index: 2, question_text: "What happens when you take time for yourself?",
      avg_duration_ms: 52100, dropoff_rate: 4.4, voice_percent: 35, text_percent: 61, mixed_percent: 4, avg_answer_length: 168, total_answers: 285,
    },
    {
      question_index: 3, question_text: "How does your closest relationship handle conflict?",
      avg_duration_ms: 68400, dropoff_rate: 5.2, voice_percent: 41, text_percent: 54, mixed_percent: 5, avg_answer_length: 203, total_answers: 271,
    },
    {
      question_index: 4, question_text: "If you could change one thing about how people see you?",
      avg_duration_ms: 74800, dropoff_rate: 5.0, voice_percent: 38, text_percent: 57, mixed_percent: 5, avg_answer_length: 224, total_answers: 258,
    },
    {
      question_index: 5, question_text: "When was the last time you received something without earning it?",
      avg_duration_ms: 61200, dropoff_rate: 5.3, voice_percent: 44, text_percent: 51, mixed_percent: 5, avg_answer_length: 187, total_answers: 245,
    },
    {
      question_index: 6, question_text: "What would your friends say is your biggest blind spot?",
      avg_duration_ms: 55300, dropoff_rate: 5.6, voice_percent: 31, text_percent: 64, mixed_percent: 5, avg_answer_length: 156, total_answers: 232,
    },
  ];
}

// ─── Metric Cards ───────────────────────────────────────────────────────────

export function getDemoMetrics(): MetricData[] {
  return [
    {
      label: "Total Visitors",
      value: 450,
      trend: { direction: "up", percent: 12.3, period: "vs last 30d" },
    },
    {
      label: "Quiz Starts",
      value: 320,
      trend: { direction: "up", percent: 8.1, period: "vs last 30d" },
    },
    {
      label: "Applications",
      value: 28,
      trend: { direction: "up", percent: 16.7, period: "vs last 30d" },
    },
    {
      label: "Conversion Rate",
      value: 6.2,
      suffix: "%",
      trend: { direction: "up", percent: 0.4, period: "vs last 30d" },
    },
  ];
}

// ─── A/B Tests ──────────────────────────────────────────────────────────────

export function getDemoABTests(): ABTest[] {
  return [
    {
      id: "demo-test-1",
      org_id: "demo",
      name: "Bridge CTA Framing",
      description: "Testing application vs invitation vs urgency CTA framing",
      test_type: "bridge",
      variants: [
        { id: "apply", name: "Apply Frame", weight: 34 },
        { id: "invitation", name: "Invitation Frame", weight: 33 },
        { id: "urgency", name: "Urgency Frame", weight: 33 },
      ],
      target_metric: "bridge_cta_click",
      status: "running",
      winner_variant: null,
      stats_cache: {
        apply: { impressions: 68, conversions: 12, rate: 17.6, ci_low: 9.4, ci_high: 25.8 },
        invitation: { impressions: 65, conversions: 16, rate: 24.6, ci_low: 14.2, ci_high: 35.0 },
        urgency: { impressions: 68, conversions: 14, rate: 20.6, ci_low: 11.0, ci_high: 30.2 },
      },
      confidence_level: 0.72,
      min_sample_size: 100,
      started_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];
}

// ─── Conversion Trend (daily data points) ───────────────────────────────────

export interface DemoTrendPoint {
  date: string;
  visitors: number;
  quiz_starts: number;
  quiz_completes: number;
  applications: number;
  conversion_rate: number;
}

export function getDemoConversionTrend(days: number = 30): DemoTrendPoint[] {
  const points: DemoTrendPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate realistic daily variation
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0;
    const baseVisitors = Math.round((12 + Math.random() * 8) * weekendMultiplier);
    const quizStarts = Math.round(baseVisitors * (0.65 + Math.random() * 0.15));
    const quizCompletes = Math.round(quizStarts * (0.60 + Math.random() * 0.15));
    const applications = Math.round(quizCompletes * (0.10 + Math.random() * 0.08));
    const rate = baseVisitors > 0 ? (applications / baseVisitors) * 100 : 0;

    points.push({
      date: date.toISOString().split("T")[0],
      visitors: baseVisitors,
      quiz_starts: quizStarts,
      quiz_completes: quizCompletes,
      applications,
      conversion_rate: Math.round(rate * 10) / 10,
    });
  }

  return points;
}

// ─── Daily Funnel Row (for aggregation demo) ────────────────────────────────

export function getDemoFunnelDaily(): FunnelDailyRow {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: "demo-daily-1",
    org_id: "demo",
    date: today,
    landing_views: 15,
    quiz_starts: 11,
    quiz_completes: 7,
    bridge_views: 6,
    bridge_cta_clicks: 2,
    application_starts: 1,
    application_submits: 1,
    question_dropoffs: [1, 0, 1, 0, 1, 0],
    archetype_distribution: { type_1: 3, type_2: 2, type_3: 1, type_4: 1 },
    avg_quiz_time_seconds: 612,
    avg_bridge_time_seconds: 245,
    avg_bridge_scroll_depth: 78,
    voice_text_split: { voice: 2, text: 4, mixed: 1 },
    device_breakdown: { mobile: 4, desktop: 3 },
    source_breakdown: { linkedin: 5, direct: 2 },
    ab_test_results: {},
    unique_sessions: 15,
  };
}
