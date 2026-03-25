/**
 * Universal Journey Pattern Service (Pattern Matcher + Anti-Pattern Detector)
 *
 * Transplanted from Invisible Pipeline's pattern-matcher.ts (~500 lines)
 * + negative-pattern-detector.ts (~290 lines)
 *
 * Learns from successful AND failed subject journeys through configurable stages.
 * Identifies conversion patterns (what works) and anti-patterns (what fails).
 *
 * KEY INSIGHT: By tracking both positive and negative patterns, the system
 * builds a dual-sided intelligence map — it knows what TO DO and what NOT to do.
 *
 * Original: Blueprint-specific signal pattern extraction + failure analysis in IP
 * Universal: Config-driven journey learning for ANY domain with stages
 */

// ============================================================================
// TYPES
// ============================================================================

export interface JourneyEvent {
  /** Config-driven event type (e.g., "first_contact", "replied", "engaged", "converted") */
  type: string;

  /** Timing relative to journey start */
  timing: "immediate" | "within_24h" | "within_week" | "after_week";

  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface ConversionPattern {
  id?: string;
  org_id: string;

  /** The successful event sequence */
  event_sequence: JourneyEvent[];

  /** How many times this pattern led to success */
  success_count: number;

  /** Total times this pattern was observed */
  total_occurrences: number;

  /** Success rate (success_count / total_occurrences * 100) */
  confidence_score: number;

  /** Human-readable description */
  description?: string;

  created_at?: string;
  updated_at?: string;
}

export interface AntiPattern {
  id?: string;
  org_id: string;

  /** The event sequence that leads to failure */
  event_sequence: JourneyEvent[];

  /** Number of failures */
  failure_count: number;

  /** Total occurrences */
  total_occurrences: number;

  /** Failure rate (failure_count / total_occurrences * 100) */
  failure_rate: number;

  /** Human-readable description */
  description?: string;

  /** What kind of failure */
  failure_type?: string;

  created_at?: string;
  updated_at?: string;
}

export type FailureType =
  | "disengaged"
  | "ghosted"
  | "objection_unresolved"
  | "no_show"
  | "churned"
  | "low_engagement"
  | "negative_response";

export interface PatternMatch {
  pattern: ConversionPattern | AntiPattern;
  similarity: number; // 0-100
  is_positive: boolean;
}

export interface RedFlagResult {
  warningLevel: null | "yellow" | "red";
  antiPattern?: AntiPattern;
  recommendation?: string;
}

// ============================================================================
// JOURNEY EVENT EXTRACTION
// ============================================================================

/**
 * Extract the journey event sequence for a subject.
 * Reads from the intelligence execution logs or a dedicated events table.
 */
export async function extractJourneyEvents(
  supabase: any,
  subjectId: string,
  orgId: string
): Promise<JourneyEvent[] | null> {
  try {
    const { data: events, error } = await supabase
      .from("temporal_events")
      .select("event_type, occurred_at, metadata")
      .eq("subject_id", subjectId)
      .eq("org_id", orgId)
      .order("occurred_at", { ascending: true });

    if (error || !events || events.length === 0) return null;

    const firstEventTime = new Date(events[0].occurred_at).getTime();

    return events.map((event: any) => {
      const eventTime = new Date(event.occurred_at).getTime();
      const hoursDiff = (eventTime - firstEventTime) / (1000 * 60 * 60);

      let timing: JourneyEvent["timing"] = "immediate";
      if (hoursDiff > 168) timing = "after_week";
      else if (hoursDiff > 24) timing = "within_week";
      else if (hoursDiff > 1) timing = "within_24h";

      return {
        type: event.event_type,
        timing,
        metadata: event.metadata,
      };
    });
  } catch (error) {
    console.error("[JourneyPattern] Error extracting events:", error);
    return null;
  }
}

// ============================================================================
// CONVERSION PATTERNS (What works)
// ============================================================================

/**
 * Save a successful conversion pattern.
 * Called when a subject reaches a successful outcome.
 */
export async function saveConversionPattern(
  supabase: any,
  orgId: string,
  events: JourneyEvent[],
  description?: string
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(events);

    // Check for existing pattern
    const { data: existing } = await supabase
      .from("conversion_patterns")
      .select("id, success_count, total_occurrences")
      .eq("org_id", orgId)
      .eq("event_sequence", serialized)
      .maybeSingle();

    if (existing) {
      const newSuccess = existing.success_count + 1;
      const newTotal = existing.total_occurrences + 1;
      await supabase
        .from("conversion_patterns")
        .update({
          success_count: newSuccess,
          total_occurrences: newTotal,
          confidence_score: (newSuccess / newTotal) * 100,
          description,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("conversion_patterns").insert({
        org_id: orgId,
        event_sequence: events,
        success_count: 1,
        total_occurrences: 1,
        confidence_score: 100.0,
        description: description || generatePatternDescription(events, "success"),
      });
    }

    return true;
  } catch (error) {
    console.error("[JourneyPattern] Error saving conversion pattern:", error);
    return false;
  }
}

/**
 * Record a pattern occurrence (success or not).
 * Updates confidence scores based on actual outcomes.
 */
export async function recordPatternOutcome(
  supabase: any,
  orgId: string,
  events: JourneyEvent[],
  succeeded: boolean
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(events);

    const { data: existing } = await supabase
      .from("conversion_patterns")
      .select("id, success_count, total_occurrences")
      .eq("org_id", orgId)
      .eq("event_sequence", serialized)
      .maybeSingle();

    if (existing) {
      const newSuccess = succeeded ? existing.success_count + 1 : existing.success_count;
      const newTotal = existing.total_occurrences + 1;
      await supabase
        .from("conversion_patterns")
        .update({
          success_count: newSuccess,
          total_occurrences: newTotal,
          confidence_score: (newSuccess / newTotal) * 100,
        })
        .eq("id", existing.id);
    } else if (succeeded) {
      await supabase.from("conversion_patterns").insert({
        org_id: orgId,
        event_sequence: events,
        success_count: 1,
        total_occurrences: 1,
        confidence_score: 100.0,
        description: generatePatternDescription(events, "success"),
      });
    }

    return true;
  } catch (error) {
    console.error("[JourneyPattern] Error recording outcome:", error);
    return false;
  }
}

/**
 * Get all conversion patterns for an org, sorted by confidence.
 */
export async function getConversionPatterns(
  supabase: any,
  orgId: string,
  minConfidence: number = 50
): Promise<ConversionPattern[]> {
  try {
    const { data, error } = await supabase
      .from("conversion_patterns")
      .select("*")
      .eq("org_id", orgId)
      .gte("confidence_score", minConfidence)
      .order("confidence_score", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ============================================================================
// ANTI-PATTERNS (What fails)
// ============================================================================

/**
 * Record a failure pattern.
 * Called when a subject fails to convert.
 */
export async function recordFailurePattern(
  supabase: any,
  orgId: string,
  events: JourneyEvent[],
  failureType: FailureType,
  description?: string
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(events);
    const desc = description || generatePatternDescription(events, failureType);

    const { data: existing } = await supabase
      .from("anti_patterns")
      .select("id, failure_count, total_occurrences")
      .eq("org_id", orgId)
      .eq("event_sequence", serialized)
      .maybeSingle();

    if (existing) {
      const newFailures = existing.failure_count + 1;
      const newTotal = existing.total_occurrences + 1;
      await supabase
        .from("anti_patterns")
        .update({
          failure_count: newFailures,
          total_occurrences: newTotal,
          failure_rate: (newFailures / newTotal) * 100,
          description: desc,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("anti_patterns").insert({
        org_id: orgId,
        event_sequence: events,
        failure_count: 1,
        total_occurrences: 1,
        failure_rate: 100.0,
        failure_type: failureType,
        description: desc,
      });
    }

    return true;
  } catch (error) {
    console.error("[JourneyPattern] Error recording failure:", error);
    return false;
  }
}

/**
 * Record that a known anti-pattern was successfully avoided.
 * Reduces the failure rate over time.
 */
export async function recordAntiPatternSuccess(
  supabase: any,
  orgId: string,
  events: JourneyEvent[]
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(events);

    const { data: existing } = await supabase
      .from("anti_patterns")
      .select("id, failure_count, total_occurrences")
      .eq("org_id", orgId)
      .eq("event_sequence", serialized)
      .maybeSingle();

    if (existing) {
      const newTotal = existing.total_occurrences + 1;
      await supabase
        .from("anti_patterns")
        .update({
          total_occurrences: newTotal,
          failure_rate: (existing.failure_count / newTotal) * 100,
        })
        .eq("id", existing.id);
    }

    return true;
  } catch (error) {
    console.error("[JourneyPattern] Error recording anti-pattern success:", error);
    return false;
  }
}

/**
 * Get all anti-patterns for an org.
 */
export async function getAntiPatterns(
  supabase: any,
  orgId: string,
  minFailureRate: number = 60
): Promise<AntiPattern[]> {
  try {
    const { data, error } = await supabase
      .from("anti_patterns")
      .select("*")
      .eq("org_id", orgId)
      .gte("failure_rate", minFailureRate)
      .order("failure_rate", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ============================================================================
// PATTERN MATCHING & RED FLAGS
// ============================================================================

/**
 * Detect if a subject is exhibiting a known anti-pattern.
 */
export async function detectAntiPattern(
  supabase: any,
  subjectId: string,
  orgId: string
): Promise<AntiPattern | null> {
  try {
    const currentEvents = await extractJourneyEvents(supabase, subjectId, orgId);
    if (!currentEvents || currentEvents.length === 0) return null;

    const antiPatterns = await getAntiPatterns(supabase, orgId);
    if (antiPatterns.length === 0) return null;

    for (const ap of antiPatterns) {
      const similarity = calculatePatternSimilarity(
        currentEvents,
        ap.event_sequence as JourneyEvent[]
      );

      if (similarity >= 70) {
        return ap;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a subject is exhibiting red flags.
 * Returns warning level: null, 'yellow', or 'red'.
 */
export async function checkRedFlags(
  supabase: any,
  subjectId: string,
  orgId: string
): Promise<RedFlagResult> {
  const antiPattern = await detectAntiPattern(supabase, subjectId, orgId);

  if (!antiPattern) {
    return { warningLevel: null };
  }

  const warningLevel: "yellow" | "red" = antiPattern.failure_rate >= 80 ? "red" : "yellow";

  const recommendations: Record<string, string> = {
    red: "High risk of failure. Consider changing approach or deprioritizing.",
    yellow: "Warning: This pattern has led to failures before. Proceed with caution.",
  };

  return {
    warningLevel,
    antiPattern,
    recommendation: recommendations[warningLevel],
  };
}

/**
 * Match a subject's current journey against all known patterns.
 * Returns both positive and negative matches ranked by similarity.
 */
export async function matchJourneyPatterns(
  supabase: any,
  subjectId: string,
  orgId: string
): Promise<PatternMatch[]> {
  try {
    const currentEvents = await extractJourneyEvents(supabase, subjectId, orgId);
    if (!currentEvents || currentEvents.length === 0) return [];

    const [conversions, antiPatterns] = await Promise.all([
      getConversionPatterns(supabase, orgId, 40),
      getAntiPatterns(supabase, orgId, 40),
    ]);

    const matches: PatternMatch[] = [];

    for (const cp of conversions) {
      const similarity = calculatePatternSimilarity(
        currentEvents,
        cp.event_sequence as JourneyEvent[]
      );
      if (similarity >= 40) {
        matches.push({ pattern: cp, similarity, is_positive: true });
      }
    }

    for (const ap of antiPatterns) {
      const similarity = calculatePatternSimilarity(
        currentEvents,
        ap.event_sequence as JourneyEvent[]
      );
      if (similarity >= 40) {
        matches.push({ pattern: ap, similarity, is_positive: false });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  } catch {
    return [];
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate similarity between two event sequences.
 */
export function calculatePatternSimilarity(
  pattern1: JourneyEvent[],
  pattern2: JourneyEvent[]
): number {
  if (pattern1.length === 0 || pattern2.length === 0) return 0;

  let matchCount = 0;
  const maxLength = Math.max(pattern1.length, pattern2.length);

  for (let i = 0; i < Math.min(pattern1.length, pattern2.length); i++) {
    if (pattern1[i].type === pattern2[i].type) {
      matchCount++;
      // Bonus for timing match
      if (pattern1[i].timing === pattern2[i].timing) {
        matchCount += 0.5;
      }
    }
  }

  const maxPossible = Math.min(pattern1.length, pattern2.length) * 1.5;
  return (matchCount / maxPossible) * 100;
}

function generatePatternDescription(
  events: JourneyEvent[],
  outcomeType: string
): string {
  const eventTypes = events.map((e) => e.type).join(" → ");
  return `${outcomeType === "success" ? "Success" : outcomeType} pattern: ${eventTypes}`;
}
