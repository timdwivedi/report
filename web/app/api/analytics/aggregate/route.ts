/**
 * POST /api/analytics/aggregate — Daily Aggregation + SAAS Sync
 *
 * Computes discovery_funnel_daily from raw analytics_events.
 * Optionally syncs to SAAS platform bloom_discovery_analytics.
 * Auth: service role (operator or cron).
 * Params: ?date=2026-03-01 (defaults to yesterday)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { aggregateDay, upsertDailyAggregate, syncToSAAS } from "@/lib/analytics/core/aggregator";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Optional: SAAS platform credentials for cross-build sync
const SAAS_SUPABASE_URL = process.env.SAAS_SUPABASE_URL;
const SAAS_SUPABASE_KEY = process.env.SAAS_SUPABASE_SERVICE_KEY;
const BUILD_SLUG = process.env.NEXT_PUBLIC_BUILD_SLUG;
const BUILD_VERTICAL = process.env.NEXT_PUBLIC_BUILD_VERTICAL;

export async function POST(request: NextRequest) {
  try {
    // Guard: service key must be configured
    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
    }

    // Auth: check for service role key in Authorization header
    const authHeader = request.headers.get("authorization");
    const expectedKey = `Bearer ${SUPABASE_SERVICE_KEY}`;
    if (authHeader !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized — service role required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");

    if (!orgId) {
      return NextResponse.json({ error: "org_id required" }, { status: 400 });
    }

    // Default to yesterday
    const dateParam = searchParams.get("date");
    const date = dateParam || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    })();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Step 1: Aggregate raw events into daily row
    const result = await aggregateDay(supabase, orgId, date);

    if (result.eventCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No events for ${date}`,
        eventCount: 0,
      });
    }

    // Step 2: Upsert into discovery_funnel_daily
    const upsertResult = await upsertDailyAggregate(supabase, result.row);

    if (!upsertResult.success) {
      return NextResponse.json(
        { error: `Upsert failed: ${upsertResult.error}` },
        { status: 500 }
      );
    }

    // Step 3: Sync to SAAS platform (optional)
    let saasSync = null;
    if (SAAS_SUPABASE_URL && SAAS_SUPABASE_KEY && BUILD_SLUG) {
      const saasClient = createClient(SAAS_SUPABASE_URL, SAAS_SUPABASE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      saasSync = await syncToSAAS(saasClient, BUILD_SLUG, result.row, BUILD_VERTICAL);
    }

    return NextResponse.json({
      success: true,
      date,
      eventCount: result.eventCount,
      sessionCount: result.sessionCount,
      saasSync: saasSync || "not configured",
    });
  } catch (err) {
    console.error("[analytics/aggregate] error:", err);
    return NextResponse.json(
      { error: "Aggregation failed" },
      { status: 500 }
    );
  }
}
