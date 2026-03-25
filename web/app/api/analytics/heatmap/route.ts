/**
 * GET /api/analytics/heatmap — Per-Question Analytics
 *
 * Returns per-question metrics: avg time, drop-off, input method splits.
 * Auth: org member (RLS checks membership).
 * Params: ?org_id=xxx&range=30d
 * Demo mode: returns demo data if no events found.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { computeQuestionHeatmap } from "@/lib/analytics/core/funnel-calculator";
import { getDemoQuestionHeatmap } from "@/lib/analytics/demo/analytics-demo-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const range = searchParams.get("range") || "30d";
    const questionCount = parseInt(searchParams.get("questions") || "6", 10);

    if (!orgId) {
      return NextResponse.json({ error: "org_id required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    });

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    startDate.setDate(endDate.getDate() - days);

    // Fetch question-related events
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("event_type, session_id, funnel_stage, properties, duration_ms, created_at")
      .eq("org_id", orgId)
      .in("event_type", ["quiz_question_view", "quiz_question_answer", "quiz_question_skip"])
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error || !events || events.length === 0) {
      return NextResponse.json(getDemoQuestionHeatmap());
    }

    const heatmap = computeQuestionHeatmap(events, questionCount);
    return NextResponse.json(heatmap);
  } catch (err) {
    console.error("[analytics/heatmap] error:", err);
    return NextResponse.json(getDemoQuestionHeatmap());
  }
}
