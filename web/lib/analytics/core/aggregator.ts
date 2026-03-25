/**
 * Aggregator — Daily aggregate computation from raw events
 *
 * Reads analytics_events for a given date, computes daily aggregates,
 * and upserts into discovery_funnel_daily.
 *
 * Also handles SAAS platform sync (push aggregated data to
 * bloom_discovery_analytics for cross-build intelligence).
 *
 * Used by: /api/analytics/aggregate (cron or manual trigger)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FunnelDailyRow } from "../types/analytics.types";

interface AggregationResult {
  date: string;
  row: Partial<FunnelDailyRow>;
  eventCount: number;
  sessionCount: number;
}

/** Compute daily aggregates for a given date */
export async function aggregateDay(
  supabase: SupabaseClient,
  orgId: string,
  date: string
): Promise<AggregationResult> {
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  // Fetch all events for this day
  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("event_type, session_id, funnel_stage, properties, duration_ms, created_at")
    .eq("org_id", orgId)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: true });

  if (error || !events) {
    return { date, row: {}, eventCount: 0, sessionCount: 0 };
  }

  // Unique sessions
  const sessionIds = new Set(events.map((e) => e.session_id));

  // Count events by type (unique sessions)
  const countUnique = (eventType: string) => {
    const sessions = new Set<string>();
    for (const e of events) {
      if (e.event_type === eventType) sessions.add(e.session_id);
    }
    return sessions.size;
  };

  // Count landing views (page_view on / or /landing)
  const landingViews = (() => {
    const sessions = new Set<string>();
    for (const e of events) {
      if (e.event_type === "page_view") {
        const path = (e.properties?.path as string) || "";
        if (path === "/" || path.includes("/landing")) {
          sessions.add(e.session_id);
        }
      }
    }
    return sessions.size || sessionIds.size; // Fallback to total sessions
  })();

  // Archetype distribution
  const archetypes: Record<string, number> = {};
  for (const e of events) {
    if (e.event_type === "quiz_complete" && e.properties?.archetype_primary) {
      const arch = e.properties.archetype_primary as string;
      archetypes[arch] = (archetypes[arch] || 0) + 1;
    }
  }

  // Quiz time average
  const quizTimes: number[] = [];
  for (const e of events) {
    if (e.event_type === "quiz_complete" && e.properties?.total_time_ms) {
      quizTimes.push((e.properties.total_time_ms as number) / 1000);
    }
  }

  // Bridge time average
  const bridgeTimes: number[] = [];
  for (const e of events) {
    if (e.event_type === "bridge_view" && e.duration_ms) {
      bridgeTimes.push(e.duration_ms / 1000);
    }
  }

  // Bridge scroll depth average
  const scrollDepths: number[] = [];
  for (const e of events) {
    if (e.event_type === "bridge_scroll_depth" && e.properties?.depth_percent) {
      scrollDepths.push(e.properties.depth_percent as number);
    }
  }

  // Voice/text split
  let voiceCount = 0;
  let textCount = 0;
  let mixedCount = 0;
  for (const e of events) {
    if (e.event_type === "quiz_question_answer") {
      const method = e.properties?.input_method as string;
      if (method === "voice") voiceCount++;
      else if (method === "text") textCount++;
      else mixedCount++;
    }
  }

  // Device + Source breakdown (from sessions table)
  const deviceSessions = new Map<string, Set<string>>();
  const sourceSessions = new Map<string, Set<string>>();

  if (sessionIds.size > 0) {
    const { data: sessions } = await supabase
      .from("analytics_sessions")
      .select("session_id, device_type, utm_source")
      .in("session_id", [...sessionIds]);

    if (sessions) {
      for (const s of sessions) {
        // Device
        const dt = s.device_type || "unknown";
        if (!deviceSessions.has(dt)) deviceSessions.set(dt, new Set());
        deviceSessions.get(dt)!.add(s.session_id);

        // Source
        const src = s.utm_source || "direct";
        if (!sourceSessions.has(src)) sourceSessions.set(src, new Set());
        sourceSessions.get(src)!.add(s.session_id);
      }
    }
  }

  const deviceBreakdown: Record<string, number> = {};
  for (const [device, set] of deviceSessions) {
    deviceBreakdown[device] = set.size;
  }

  const sourceBreakdown: Record<string, number> = {};
  for (const [source, set] of sourceSessions) {
    sourceBreakdown[source] = set.size;
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const row: Partial<FunnelDailyRow> = {
    org_id: orgId,
    date,
    landing_views: landingViews,
    quiz_starts: countUnique("quiz_start"),
    quiz_completes: countUnique("quiz_complete"),
    bridge_views: countUnique("bridge_view"),
    bridge_cta_clicks: countUnique("bridge_cta_click"),
    application_starts: countUnique("application_start"),
    application_submits: countUnique("application_submit"),
    archetype_distribution: archetypes,
    avg_quiz_time_seconds: avg(quizTimes),
    avg_bridge_time_seconds: avg(bridgeTimes),
    avg_bridge_scroll_depth: avg(scrollDepths),
    voice_text_split: { voice: voiceCount, text: textCount, mixed: mixedCount },
    device_breakdown: deviceBreakdown,
    source_breakdown: sourceBreakdown,
    unique_sessions: sessionIds.size,
  };

  return { date, row, eventCount: events.length, sessionCount: sessionIds.size };
}

/** Upsert daily aggregate into discovery_funnel_daily */
export async function upsertDailyAggregate(
  supabase: SupabaseClient,
  row: Partial<FunnelDailyRow>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("discovery_funnel_daily")
    .upsert(row, { onConflict: "org_id,date" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Sync daily aggregate to SAAS platform (cross-build intelligence) */
export async function syncToSAAS(
  saasSupabase: SupabaseClient,
  slug: string,
  row: Partial<FunnelDailyRow>,
  vertical?: string
): Promise<{ success: boolean; error?: string }> {
  const landingViews = row.landing_views || 0;
  const quizStarts = row.quiz_starts || 0;
  const quizCompletes = row.quiz_completes || 0;
  const bridgeViews = row.bridge_views || 0;
  const bridgeCtaClicks = row.bridge_cta_clicks || 0;
  const applicationStarts = row.application_starts || 0;
  const applicationSubmits = row.application_submits || 0;

  const syncRow = {
    slug,
    date: row.date,
    vertical: vertical || null,
    landing_views: landingViews,
    quiz_starts: quizStarts,
    quiz_completes: quizCompletes,
    bridge_views: bridgeViews,
    bridge_cta_clicks: bridgeCtaClicks,
    application_starts: applicationStarts,
    application_submits: applicationSubmits,
    landing_to_quiz_rate: landingViews > 0 ? (quizStarts / landingViews) * 100 : null,
    quiz_completion_rate: quizStarts > 0 ? (quizCompletes / quizStarts) * 100 : null,
    bridge_to_cta_rate: bridgeViews > 0 ? (bridgeCtaClicks / bridgeViews) * 100 : null,
    application_completion_rate: applicationStarts > 0 ? (applicationSubmits / applicationStarts) * 100 : null,
    overall_conversion_rate: landingViews > 0 ? (applicationSubmits / landingViews) * 100 : null,
    avg_quiz_time_seconds: row.avg_quiz_time_seconds,
    avg_bridge_time_seconds: row.avg_bridge_time_seconds,
    synced_at: new Date().toISOString(),
  };

  const { error } = await saasSupabase
    .from("bloom_discovery_analytics")
    .upsert(syncRow, { onConflict: "slug,date" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
