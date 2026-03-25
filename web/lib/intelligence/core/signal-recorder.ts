/**
 * Universal Signal Recorder (Event Input Layer)
 *
 * Transplanted from Invisible Pipeline's signal-recorder.ts (~303 lines)
 *
 * THE INPUT LAYER for the entire intelligence engine.
 * When something happens (reply, engagement, conversion), this service:
 *   1. Records the event to the intelligence tables
 *   2. Triggers downstream intelligence services (pattern extraction, classification, etc.)
 *   3. Manages aggregate progress tracking
 *
 * Without signals flowing in, effectiveness tracking, pattern learning,
 * weight optimization, and cohort analysis have NO DATA.
 *
 * Original: IP's blueprint-specific signal recorder tied to leads/blueprints
 * Universal: Config-driven event recorder for ANY staged pipeline
 */

import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// TYPES
// ============================================================================

export type SignalType = string; // Config-driven: "contacted" | "replied" | "engaged" | "converted" etc.

export interface SignalEvent {
  orgId: string;
  subjectId: string;
  signalType: SignalType;
  /** Optional: content snapshot at time of signal (for classification) */
  contentSnapshot?: string;
  /** Optional: subject profile snapshot (for pattern learning) */
  subjectSnapshot?: Record<string, any>;
  /** Optional: metadata (channel, source, etc.) */
  metadata?: Record<string, any>;
}

export interface SignalResult {
  success: boolean;
  pointsAwarded: number;
  totalPoints: number;
  triggeredServices: string[];
}

/** Maps signal types to their point values */
export interface SignalWeights {
  [signalType: string]: number;
}

// Default signal weights (config overrides these)
const DEFAULT_WEIGHTS: SignalWeights = {
  contacted: 1,
  replied: 3,
  engaged: 5,
  qualified: 8,
  converted: 15,
};

// ============================================================================
// CORE: Record Signal
// ============================================================================

/**
 * Record a signal event and trigger downstream intelligence services.
 *
 * This is the MAIN entry point. When a subject progresses through stages,
 * call this to feed data into the intelligence engine.
 */
export async function recordSignal(
  supabase: any,
  event: SignalEvent,
  config: IntelligenceConfig
): Promise<SignalResult> {
  const triggered: string[] = [];

  try {
    // 1. Resolve signal weight
    const signalConfigs = config.scoring?.signals;
    let points = 1;
    if (signalConfigs) {
      const match = signalConfigs.find(s => s.name === event.signalType);
      points = match?.weight || 1;
    } else {
      points = DEFAULT_WEIGHTS[event.signalType] || 1;
    }

    // 2. Record temporal event (raw event log)
    const { error: eventError } = await supabase
      .from("temporal_events")
      .insert({
        org_id: event.orgId,
        subject_id: event.subjectId,
        event_type: event.signalType,
        metadata: {
          ...(event.metadata || {}),
          content_snapshot: event.contentSnapshot ? true : false,
        },
      });

    if (eventError) {
      console.error("[SignalRecorder] Failed to record event:", eventError);
    }
    triggered.push("temporal_events");

    // 3. Update subject intelligence score
    const { data: existing } = await supabase
      .from("subject_intelligence")
      .select("id, score_value, score_tier, score_breakdown")
      .eq("org_id", event.orgId)
      .eq("subject_id", event.subjectId)
      .maybeSingle();

    const newScore = (existing?.score_value || 0) + points;
    const newBreakdown = existing?.score_breakdown || {};
    newBreakdown[event.signalType] =
      (newBreakdown[event.signalType] || 0) + points;

    const tier = getScoreTier(newScore, config);

    if (existing) {
      await supabase
        .from("subject_intelligence")
        .update({
          score_value: newScore,
          score_tier: tier,
          score_breakdown: newBreakdown,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("subject_intelligence").insert({
        org_id: event.orgId,
        subject_id: event.subjectId,
        score_value: newScore,
        score_tier: tier,
        score_breakdown: newBreakdown,
      });
    }
    triggered.push("scoring");

    // 4. Trigger downstream services based on signal type and config

    // 4a. On conversion → extract journey pattern
    if (isConversionSignal(event.signalType, config)) {
      try {
        const { extractJourneyEvents, saveConversionPattern } = await import(
          "./journey-pattern-service"
        );
        const events = await extractJourneyEvents(
          supabase,
          event.orgId,
          event.subjectId
        );
        if (events && events.length > 0) {
          await saveConversionPattern(supabase, event.orgId, events);
          triggered.push("journey_patterns");
        }
      } catch (err) {
        console.error("[SignalRecorder] Pattern extraction failed:", err);
      }
    }

    // 4b. On conversion → trigger weight optimization check
    if (isConversionSignal(event.signalType, config)) {
      try {
        const { shouldOptimize, optimizeSignalWeights } = await import(
          "./weight-optimizer"
        );
        const needsOptimization = await shouldOptimize(
          supabase,
          event.orgId
        );
        if (needsOptimization) {
          optimizeSignalWeights(supabase, event.orgId, config).catch((err) =>
            console.error("[SignalRecorder] Weight optimization failed:", err)
          );
          triggered.push("weight_optimizer");
        }
      } catch (err) {
        console.error("[SignalRecorder] Weight optimization check failed:", err);
      }
    }

    // 4c. If content snapshot exists → classify content style
    if (event.contentSnapshot) {
      try {
        const { classifyContent } = await import("./content-classifier");
        const classification = await classifyContent(
          event.contentSnapshot,
          config
        );

        if (classification) {
          // Track effectiveness: style × subject type × outcome
          try {
            const { trackEffectiveness } = await import(
              "./effectiveness-tracker"
            );
            const subjectType =
              event.subjectSnapshot?.archetype || "general";
            await trackEffectiveness(supabase, {
              orgId: event.orgId,
              subjectType,
              contentStyle: classification.primaryStyle,
              signal: event.signalType as any,
            });
            triggered.push("effectiveness_tracking");
          } catch (err) {
            console.error(
              "[SignalRecorder] Effectiveness tracking failed:",
              err
            );
          }
        }
        triggered.push("content_classification");
      } catch (err) {
        console.error("[SignalRecorder] Content classification failed:", err);
      }
    }

    // 5. Record to execution log
    await supabase.from("intelligence_execution_logs").insert({
      org_id: event.orgId,
      subject_id: event.subjectId,
      operation: "signal_recorded",
      result: {
        signal_type: event.signalType,
        points_awarded: points,
        total_score: newScore,
        triggered_services: triggered,
      },
    });

    return {
      success: true,
      pointsAwarded: points,
      totalPoints: newScore,
      triggeredServices: triggered,
    };
  } catch (error) {
    console.error("[SignalRecorder] Error recording signal:", error);
    return {
      success: false,
      pointsAwarded: 0,
      totalPoints: 0,
      triggeredServices: triggered,
    };
  }
}

// ============================================================================
// BATCH: Record Multiple Signals
// ============================================================================

/**
 * Record multiple signals at once (e.g., bulk import, stage progression).
 */
export async function recordSignalBatch(
  supabase: any,
  events: SignalEvent[],
  config: IntelligenceConfig
): Promise<{ total: number; successful: number }> {
  let successful = 0;

  for (const event of events) {
    const result = await recordSignal(supabase, event, config);
    if (result.success) successful++;
  }

  return { total: events.length, successful };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determine if a signal type represents a "conversion" (final positive outcome).
 * Config-driven: checks scoring.conversion_signals or defaults to last stage.
 */
function isConversionSignal(
  signalType: string,
  config: IntelligenceConfig
): boolean {
  const conversionSignals = (config as any).scoring?.conversion_signals || [
    "converted",
    "closed_won",
    "completed",
  ];
  return conversionSignals.includes(signalType);
}

/**
 * Get score tier based on total points and config thresholds.
 */
function getScoreTier(
  score: number,
  config: IntelligenceConfig
): string {
  const tiers = config.scoring?.tiers || [
    { name: "cold", min: 0, max: 10 },
    { name: "warm", min: 11, max: 30 },
    { name: "hot", min: 31, max: 60 },
    { name: "on_fire", min: 61, max: Infinity },
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].min) return tiers[i].name;
  }

  return tiers[0]?.name || "unknown";
}

/**
 * Get total signals recorded for a subject.
 */
export async function getSignalCount(
  supabase: any,
  orgId: string,
  subjectId: string
): Promise<number> {
  const { count } = await supabase
    .from("temporal_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("subject_id", subjectId);

  return count || 0;
}

/**
 * Get signal history for a subject (most recent first).
 */
export async function getSignalHistory(
  supabase: any,
  orgId: string,
  subjectId: string,
  limit: number = 50
): Promise<
  Array<{ event_type: string; created_at: string; metadata: any }>
> {
  const { data } = await supabase
    .from("temporal_events")
    .select("event_type, created_at, metadata")
    .eq("org_id", orgId)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}
