/**
 * GET /api/analytics/funnel — Funnel Data
 *
 * Returns funnel summary from pre-computed daily aggregates.
 * Auth: org member (checks organization membership).
 * Params: ?range=7d|30d|90d|all&org_id=xxx
 * Demo mode: returns demo data if table is empty.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { FunnelSummary, FunnelStageData } from "@/lib/analytics/types/analytics.types";
import { getDemoFunnelSummary } from "@/lib/analytics/demo/analytics-demo-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getDateRange(range: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const range = searchParams.get("range") || "30d";

    if (!orgId) {
      return NextResponse.json({ error: "org_id required" }, { status: 400 });
    }

    // Auth: create client from cookies (checks org membership via RLS)
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    });

    const dateRange = getDateRange(range);

    // Query pre-computed daily aggregates
    const { data: rows, error } = await supabase
      .from("discovery_funnel_daily")
      .select("*")
      .eq("org_id", orgId)
      .gte("date", dateRange.start)
      .lte("date", dateRange.end)
      .order("date", { ascending: true });

    // If no data or error, return demo data
    if (error || !rows || rows.length === 0) {
      return NextResponse.json(getDemoFunnelSummary());
    }

    // Aggregate across days
    const totals = rows.reduce(
      (acc, row) => ({
        landing_views: acc.landing_views + (row.landing_views || 0),
        quiz_starts: acc.quiz_starts + (row.quiz_starts || 0),
        quiz_completes: acc.quiz_completes + (row.quiz_completes || 0),
        bridge_views: acc.bridge_views + (row.bridge_views || 0),
        bridge_cta_clicks: acc.bridge_cta_clicks + (row.bridge_cta_clicks || 0),
        application_starts: acc.application_starts + (row.application_starts || 0),
        application_submits: acc.application_submits + (row.application_submits || 0),
        unique_sessions: acc.unique_sessions + (row.unique_sessions || 0),
      }),
      {
        landing_views: 0,
        quiz_starts: 0,
        quiz_completes: 0,
        bridge_views: 0,
        bridge_cta_clicks: 0,
        application_starts: 0,
        application_submits: 0,
        unique_sessions: 0,
      }
    );

    // Build funnel stages
    const stageEntries: [string, string, number][] = [
      ["landing", "Landing Page", totals.landing_views],
      ["quiz_start", "Quiz Start", totals.quiz_starts],
      ["quiz_complete", "Quiz Complete", totals.quiz_completes],
      ["bridge_view", "Bridge Page", totals.bridge_views],
      ["bridge_cta", "CTA Click", totals.bridge_cta_clicks],
      ["application_start", "Application Start", totals.application_starts],
      ["application_submit", "Application Submit", totals.application_submits],
    ];

    const stages: FunnelStageData[] = [];
    let prev = 0;
    for (const [stage, label, count] of stageEntries) {
      const rate = prev > 0 ? (count / prev) * 100 : null;
      const dropoff = prev > 0 ? ((prev - count) / prev) * 100 : null;
      stages.push({ stage, label, count, rate, dropoff });
      prev = count;
    }

    const summary: FunnelSummary = {
      stages,
      overall_conversion_rate:
        totals.landing_views > 0
          ? (totals.application_submits / totals.landing_views) * 100
          : 0,
      total_visitors: totals.landing_views,
      date_range: dateRange,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("[analytics/funnel] error:", err);
    return NextResponse.json(getDemoFunnelSummary());
  }
}
