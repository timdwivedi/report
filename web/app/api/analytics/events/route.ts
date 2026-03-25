/**
 * POST /api/analytics/events — Event Ingestion
 *
 * Receives beacon payloads from DiscoveryTracker.
 * Auth: NONE (anonymous quiz takers must track).
 * Uses service role for inserts (anon RLS allows INSERT).
 * Returns: 204 No Content (sendBeacon expects no response body).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Guard: if service key is missing, all inserts will fail — bail early in handler

// ─── Rate Limiter (in-memory, per-session) ──────────────────────────────────
// Allows 100 events per minute per session_id.
// Uses a simple sliding window — resets after 60 seconds.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodic cleanup of expired rate limit entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 300_000);
}

// PII patterns to strip from properties
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // phone numbers
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
];

function sanitizeProperties(props: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string") {
      let sanitized = value;
      for (const pattern of PII_PATTERNS) {
        sanitized = sanitized.replace(pattern, "[REDACTED]");
      }
      clean[key] = sanitized;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Payload format: { session: SessionData, events: AnalyticsEvent[] }
    const { session, events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(null, { status: 204 });
    }

    // Guard: no service key = can't write to DB
    if (!SUPABASE_SERVICE_KEY) {
      console.error("[analytics] SUPABASE_SERVICE_ROLE_KEY not set");
      return new Response(null, { status: 204 });
    }

    // Rate limit: max 50 events per request
    if (events.length > 50) {
      return NextResponse.json({ error: "Too many events" }, { status: 413 });
    }

    // Rate limit: 100 events/min per session_id
    const sessionId = session?.session_id || events[0]?.session_id;
    if (sessionId && !checkRateLimit(sessionId)) {
      return new Response(null, { status: 429 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Upsert session if provided
    if (session?.session_id) {
      const { error: sessionError } = await supabase
        .from("analytics_sessions")
        .upsert(
          {
            session_id: session.session_id,
            org_id: session.org_id || events[0]?.org_id,
            device_type: session.device_type,
            browser: session.browser,
            os: session.os,
            referrer: session.referrer,
            utm_source: session.utm_source,
            utm_medium: session.utm_medium,
            utm_campaign: session.utm_campaign,
            utm_content: session.utm_content,
            landing_page: session.landing_page,
            ab_assignments: session.ab_assignments || {},
            country: request.headers.get("x-vercel-ip-country") || null,
          },
          { onConflict: "session_id" }
        );

      if (sessionError) {
        console.error("[analytics] session upsert error:", sessionError.message);
      }
    }

    // Prepare events for batch insert
    const rows = events.map((event: Record<string, unknown>) => ({
      org_id: event.org_id,
      session_id: event.session_id,
      event_type: event.event_type,
      event_category: event.event_category || "funnel",
      properties: sanitizeProperties((event.properties as Record<string, unknown>) || {}),
      page_path: event.page_path,
      funnel_stage: event.funnel_stage,
      quiz_submission_id: event.quiz_submission_id ?? null,
      ab_test_id: event.ab_test_id ?? null,
      ab_variant: event.ab_variant ?? null,
      duration_ms: event.duration_ms ?? null,
      created_at: event.created_at || new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("analytics_events")
      .insert(rows);

    if (insertError) {
      console.error("[analytics] event insert error:", insertError.message);
    }

    return new Response(null, { status: 204 });
  } catch {
    // Analytics should never break the app — fail silently
    return new Response(null, { status: 204 });
  }
}
