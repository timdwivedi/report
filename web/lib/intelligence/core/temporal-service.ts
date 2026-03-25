/**
 * Universal Temporal Intelligence Service (Timing Optimization)
 *
 * Transplanted from Invisible Pipeline's temporal-service.ts
 * Analyzes engagement timing patterns to optimize WHEN to interact.
 *
 * Tracks: Response times, active hours/days, fatigue scoring,
 * urgency signals, optimal follow-up timing.
 *
 * Original: Lead response time analysis for optimal DM timing in IP
 * Universal: Timing intelligence for ANY engagement (messages, emails, sessions)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TemporalPattern {
  subject_id: string;
  avg_response_time_minutes: number | null;
  fastest_response_minutes: number | null;
  slowest_response_minutes: number | null;
  response_time_trend: "getting_faster" | "getting_slower" | "stable" | "unknown";
  most_active_days: string[];
  most_active_hours: number[];
  timezone_detected: string | null;
  best_performing_send_times: Array<{ hour: number; day: string; engagement_rate: number }>;
  optimal_followup_delay_hours: number | null;
  current_fatigue_score: number;       // 0 = fresh, 1 = over-contacted
  urgency_signals: {
    deadline_mentioned?: boolean;
    timeline?: string;
    window?: string;
  };
  urgency_score: number;               // 0 = no urgency, 1 = critical
  analysis_confidence: number;         // 0-1
  last_analyzed_at?: string;
}

export interface TemporalEvent {
  subject_id: string;
  event_type: "message_sent" | "message_received" | "session_start" | "session_end" | "action_taken";
  occurred_at: string;
  hour_of_day?: number;
  day_of_week?: string;
  metadata?: Record<string, any>;
}

export interface TimingRecommendation {
  shouldWait: boolean;
  recommendedDelay: string;
  reason: string;
  score: number;           // 0 (bad timing) to 1 (perfect timing)
}

// ============================================================================
// ANALYSIS
// ============================================================================

/**
 * Analyze temporal events for a subject and calculate aggregated patterns.
 * Domain-agnostic: works with any event type stored in temporal_events.
 */
export async function analyzeTemporalPattern(
  supabase: any,
  subjectId: string
): Promise<TemporalPattern | null> {
  try {
    // 1. Fetch temporal events
    const { data: events, error } = await supabase
      .from("temporal_events")
      .select("*")
      .eq("subject_id", subjectId)
      .order("occurred_at", { ascending: true });

    if (error || !events || events.length < 2) {
      // Return existing pattern if we have one
      const { data: existing } = await supabase
        .from("temporal_patterns")
        .select("*")
        .eq("subject_id", subjectId)
        .maybeSingle();

      return existing as TemporalPattern || null;
    }

    // 2. Calculate response time patterns
    const responseTimes: number[] = [];
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];

      if (current.event_type === "message_sent" && next.event_type === "message_received") {
        const diff =
          (new Date(next.occurred_at).getTime() - new Date(current.occurred_at).getTime()) /
          (1000 * 60);
        if (diff > 0) responseTimes.push(diff);
      }
    }

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null;

    // 3. Detect active hours & days (from received/response events)
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<string, number> = {};

    events.forEach((e: TemporalEvent) => {
      if (e.event_type === "message_received" || e.event_type === "action_taken") {
        if (e.hour_of_day !== undefined && e.hour_of_day !== null) {
          hourCounts[e.hour_of_day] = (hourCounts[e.hour_of_day] || 0) + 1;
        }
        if (e.day_of_week) {
          const day = e.day_of_week.trim().toLowerCase();
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
      }
    });

    const mostActiveHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const mostActiveDays = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([day]) => day);

    // 4. Calculate response time trend (last 5 vs first 5)
    let trend: TemporalPattern["response_time_trend"] = "unknown";
    if (responseTimes.length >= 6) {
      const firstHalf = responseTimes.slice(0, Math.floor(responseTimes.length / 2));
      const secondHalf = responseTimes.slice(Math.floor(responseTimes.length / 2));
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (avgSecond < avgFirst * 0.8) trend = "getting_faster";
      else if (avgSecond > avgFirst * 1.2) trend = "getting_slower";
      else trend = "stable";
    }

    // 5. Calculate fatigue score
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSent = events.filter(
      (e: TemporalEvent) =>
        e.event_type === "message_sent" && new Date(e.occurred_at) > oneWeekAgo
    );

    // Benchmark: 5/week starts fatigue (0.5), 10/week is max (1.0)
    const fatigueScore = Math.min(recentSent.length / 10, 1.0);

    // 6. Build pattern
    const pattern: TemporalPattern = {
      subject_id: subjectId,
      avg_response_time_minutes: avgResponseTime ? Math.round(avgResponseTime) : null,
      fastest_response_minutes:
        responseTimes.length > 0 ? Math.round(Math.min(...responseTimes)) : null,
      slowest_response_minutes:
        responseTimes.length > 0 ? Math.round(Math.max(...responseTimes)) : null,
      response_time_trend: trend,
      most_active_days: mostActiveDays,
      most_active_hours: mostActiveHours,
      timezone_detected: null,
      best_performing_send_times: [],
      optimal_followup_delay_hours: avgResponseTime ? Math.round(avgResponseTime / 60) : null,
      current_fatigue_score: fatigueScore,
      urgency_signals: {},
      urgency_score: 0.0,
      analysis_confidence: Math.min(events.length / 10, 1.0),
      last_analyzed_at: new Date().toISOString(),
    };

    // 7. Persist results
    await supabase
      .from("temporal_patterns")
      .upsert(pattern, { onConflict: "subject_id" });

    return pattern;
  } catch (err) {
    console.error("[Temporal] Error analyzing pattern:", err);
    return null;
  }
}

// ============================================================================
// TIMING RECOMMENDATIONS
// ============================================================================

/**
 * Get timing recommendation for the next engagement.
 * Returns whether to wait, how long, and why.
 */
export async function getTimingRecommendation(
  supabase: any,
  subjectId: string
): Promise<TimingRecommendation> {
  const pattern = await analyzeTemporalPattern(supabase, subjectId);

  if (!pattern || pattern.analysis_confidence < 0.2) {
    return {
      shouldWait: false,
      recommendedDelay: "Send now",
      reason: "Insufficient data for timing optimization",
      score: 0.5,
    };
  }

  // Fatigue check (strongest negative signal)
  if (pattern.current_fatigue_score > 0.8) {
    return {
      shouldWait: true,
      recommendedDelay: "3-5 days",
      reason: `High contact fatigue (${Math.round(pattern.current_fatigue_score * 100)}%). Over-indexed on outreach.`,
      score: 0.1,
    };
  }

  if (pattern.current_fatigue_score > 0.5) {
    return {
      shouldWait: true,
      recommendedDelay: "1-2 days",
      reason: `Moderate fatigue (${Math.round(pattern.current_fatigue_score * 100)}%). Space out touchpoints.`,
      score: 0.3,
    };
  }

  // Active window check
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentDay = now
    .toLocaleString("en-US", { weekday: "long", timeZone: "UTC" })
    .toLowerCase();

  const isGoodHour = pattern.most_active_hours.includes(currentHour);
  const isGoodDay = pattern.most_active_days.includes(currentDay);

  if (isGoodHour && isGoodDay) {
    return {
      shouldWait: false,
      recommendedDelay: "Send now",
      reason: "Peak engagement window (matches historical activity patterns).",
      score: 0.95,
    };
  }

  if (isGoodHour) {
    return {
      shouldWait: false,
      recommendedDelay: "Proceed",
      reason: `Active hour (${currentHour}:00) detected, though not peak day.`,
      score: 0.8,
    };
  }

  if (isGoodDay) {
    return {
      shouldWait: false,
      recommendedDelay: "Proceed",
      reason: `Active day detected, though not peak hour.`,
      score: 0.7,
    };
  }

  // Default
  return {
    shouldWait: false,
    recommendedDelay: "Proceed",
    reason: "No negative signals. Not a peak window, but acceptable timing.",
    score: 0.6,
  };
}

/**
 * Record a temporal event for a subject.
 * Call this from API routes when interactions happen.
 */
export async function recordTemporalEvent(
  supabase: any,
  event: TemporalEvent
): Promise<boolean> {
  try {
    const now = new Date(event.occurred_at);
    const enrichedEvent = {
      ...event,
      hour_of_day: event.hour_of_day ?? now.getUTCHours(),
      day_of_week:
        event.day_of_week ??
        now.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase(),
    };

    const { error } = await supabase.from("temporal_events").insert(enrichedEvent);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[Temporal] Error recording event:", err);
    return false;
  }
}
