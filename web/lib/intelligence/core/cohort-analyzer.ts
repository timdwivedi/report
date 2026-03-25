/**
 * Universal Cohort Analyzer (Time-Based Performance Intelligence)
 *
 * Transplanted from Invisible Pipeline's cohort-analyzer.ts (~904 lines)
 *
 * Analyzes subject cohorts to understand:
 * - Conversion rates by time period (are we getting better?)
 * - Subject velocity (how fast do subjects move through stages?)
 * - Time-to-outcome metrics (how long until conversion?)
 * - Performance trends and health scoring
 * - Comparative benchmarking between periods
 *
 * Original: Blueprint-specific lead cohort analysis in IP
 * Universal: Config-driven cohort intelligence for ANY staged pipeline
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CohortMetrics {
  /** Cohort identifier (e.g., "2024-01") */
  cohort_id: string;
  cohort_start: string;
  cohort_end: string;

  /** Volume */
  total_subjects: number;

  /** Stage funnel counts (config-driven stage names → counts) */
  stage_counts: Record<string, number>;

  /** Stage funnel rates (config-driven stage names → percentages) */
  stage_rates: Record<string, number>;

  /** Velocity — avg days to reach each stage */
  avg_time_to_stage: Record<string, number>;

  /** Quality — avg score of subjects in this cohort */
  avg_subject_score?: number;

  analyzed_at: string;
}

export interface CohortComparison {
  current_cohort: CohortMetrics;
  previous_cohort: CohortMetrics;

  /** Rate changes (stage → percentage point change) */
  rate_changes: Record<string, number>;

  /** Velocity changes (stage → days change) */
  velocity_changes: Record<string, number>;

  trend: "improving" | "declining" | "stable";
  insights: string[];
}

export interface SubjectVelocity {
  subject_id: string;
  stage_transitions: Array<{
    from_stage: string;
    to_stage: string;
    days_elapsed: number;
    transition_date: string;
  }>;
  total_days_in_pipeline: number;
  current_stage: string;
  is_successful: boolean;
  velocity_score: "fast" | "normal" | "slow" | "stalled";
  benchmark_comparison?: string;
}

export interface VelocityMetrics {
  avg_days_to_outcome: number;
  median_days_to_outcome: number;
  fastest_days: number;
  slowest_days: number;
  total_successful: number;
  velocity_distribution: {
    fast: number;
    normal: number;
    slow: number;
    stalled: number;
  };
}

export interface PerformanceBenchmark {
  current_month: CohortMetrics;
  previous_month: CohortMetrics;
  comparison: CohortComparison;
  velocity_metrics: VelocityMetrics | null;
  trend_direction: "up" | "down" | "stable";
  health_score: number; // 0-100
}

// ============================================================================
// COHORT ANALYSIS
// ============================================================================

/**
 * Analyze a cohort of subjects created within a date range.
 * Uses temporal_events to track stage progression.
 */
export async function analyzeCohort(
  supabase: any,
  orgId: string,
  cohortStart: Date,
  cohortEnd: Date,
  stages: string[] = ["contacted", "replied", "engaged", "converted"]
): Promise<CohortMetrics | null> {
  try {
    // Get subjects created in this period
    const { data: subjects, error: subjectsError } = await supabase
      .from("subject_intelligence")
      .select("subject_id, score, created_at")
      .eq("org_id", orgId)
      .gte("created_at", cohortStart.toISOString())
      .lte("created_at", cohortEnd.toISOString());

    if (subjectsError || !subjects || subjects.length === 0) return null;

    const subjectIds = subjects.map((s: any) => s.subject_id);

    // Get all events for these subjects
    const { data: events, error: eventsError } = await supabase
      .from("temporal_events")
      .select("subject_id, event_type, occurred_at")
      .eq("org_id", orgId)
      .in("subject_id", subjectIds);

    if (eventsError) return null;

    // Group events by subject
    const subjectEvents = new Map<string, Array<{ type: string; date: Date }>>();
    for (const event of events || []) {
      if (!subjectEvents.has(event.subject_id)) {
        subjectEvents.set(event.subject_id, []);
      }
      subjectEvents.get(event.subject_id)!.push({
        type: event.event_type,
        date: new Date(event.occurred_at),
      });
    }

    // Calculate stage counts and timing
    const stageCounts: Record<string, number> = {};
    const stageTotalTime: Record<string, number> = {};
    const stageTimeCount: Record<string, number> = {};

    for (const stage of stages) {
      stageCounts[stage] = 0;
      stageTotalTime[stage] = 0;
      stageTimeCount[stage] = 0;
    }

    for (const [subjectId, eventList] of subjectEvents) {
      const subject = subjects.find((s: any) => s.subject_id === subjectId);
      if (!subject) continue;

      const subjectCreated = new Date(subject.created_at);
      const eventTypes = new Set(eventList.map((e) => e.type));

      for (const stage of stages) {
        if (eventTypes.has(stage)) {
          stageCounts[stage]++;

          // Calculate time to reach this stage
          const stageEvent = eventList
            .filter((e) => e.type === stage)
            .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

          if (stageEvent) {
            const daysToStage = (stageEvent.date.getTime() - subjectCreated.getTime()) / (1000 * 60 * 60 * 24);
            stageTotalTime[stage] += daysToStage;
            stageTimeCount[stage]++;
          }
        }
      }
    }

    // Calculate rates and avg times
    const stageRates: Record<string, number> = {};
    const avgTimeToStage: Record<string, number> = {};

    for (const stage of stages) {
      stageRates[stage] = subjects.length > 0 ? (stageCounts[stage] / subjects.length) * 100 : 0;
      avgTimeToStage[stage] = stageTimeCount[stage] > 0 ? stageTotalTime[stage] / stageTimeCount[stage] : 0;
    }

    // Avg subject score
    const totalScore = subjects.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const avgScore = subjects.length > 0 ? totalScore / subjects.length : 0;

    const cohortId = `${cohortStart.getFullYear()}-${String(cohortStart.getMonth() + 1).padStart(2, "0")}`;

    return {
      cohort_id: cohortId,
      cohort_start: cohortStart.toISOString(),
      cohort_end: cohortEnd.toISOString(),
      total_subjects: subjects.length,
      stage_counts: stageCounts,
      stage_rates: stageRates,
      avg_time_to_stage: avgTimeToStage,
      avg_subject_score: avgScore,
      analyzed_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[CohortAnalyzer] Error analyzing cohort:", error);
    return null;
  }
}

/**
 * Compare two cohorts to identify trends.
 */
export async function compareCohorts(
  supabase: any,
  orgId: string,
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date,
  stages?: string[]
): Promise<CohortComparison | null> {
  try {
    const [current, previous] = await Promise.all([
      analyzeCohort(supabase, orgId, currentStart, currentEnd, stages),
      analyzeCohort(supabase, orgId, previousStart, previousEnd, stages),
    ]);

    if (!current || !previous) return null;

    // Calculate rate changes
    const rateChanges: Record<string, number> = {};
    const velocityChanges: Record<string, number> = {};

    for (const stage of Object.keys(current.stage_rates)) {
      rateChanges[stage] = (current.stage_rates[stage] || 0) - (previous.stage_rates[stage] || 0);
      velocityChanges[stage] = (current.avg_time_to_stage[stage] || 0) - (previous.avg_time_to_stage[stage] || 0);
    }

    // Determine trend (based on last stage = success)
    const stageNames = Object.keys(current.stage_rates);
    const successStage = stageNames[stageNames.length - 1];
    const successChange = rateChanges[successStage] || 0;

    let trend: "improving" | "declining" | "stable";
    if (Math.abs(successChange) < 2) trend = "stable";
    else if (successChange > 0) trend = "improving";
    else trend = "declining";

    // Generate insights
    const insights: string[] = [];

    for (const stage of stageNames) {
      const change = rateChanges[stage];
      if (Math.abs(change) >= 5) {
        insights.push(
          `${stage} rate ${change > 0 ? "improved" : "declined"} by ${Math.abs(change).toFixed(1)}%`
        );
      }
    }

    if (insights.length === 0) {
      insights.push("Performance is stable — no significant changes detected");
    }

    return {
      current_cohort: current,
      previous_cohort: previous,
      rate_changes: rateChanges,
      velocity_changes: velocityChanges,
      trend,
      insights,
    };
  } catch (error) {
    console.error("[CohortAnalyzer] Error comparing cohorts:", error);
    return null;
  }
}

/**
 * Get cohort metrics for the last N months.
 */
export async function getRecentCohorts(
  supabase: any,
  orgId: string,
  months: number = 6,
  stages?: string[]
): Promise<CohortMetrics[]> {
  const cohorts: CohortMetrics[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const cohort = await analyzeCohort(supabase, orgId, cohortStart, cohortEnd, stages);
    if (cohort) cohorts.push(cohort);
  }

  return cohorts.reverse(); // Oldest first
}

// ============================================================================
// VELOCITY ANALYSIS
// ============================================================================

/**
 * Get velocity metrics for successful outcomes.
 */
export async function getVelocityMetrics(
  supabase: any,
  orgId: string,
  successStage: string = "converted"
): Promise<VelocityMetrics | null> {
  try {
    // Get all subjects that reached success
    const { data: successEvents, error } = await supabase
      .from("temporal_events")
      .select("subject_id, occurred_at")
      .eq("org_id", orgId)
      .eq("event_type", successStage);

    if (error || !successEvents || successEvents.length === 0) return null;

    const subjectIds = successEvents.map((e: any) => e.subject_id);

    // Get creation dates for these subjects
    const { data: subjects } = await supabase
      .from("subject_intelligence")
      .select("subject_id, created_at")
      .eq("org_id", orgId)
      .in("subject_id", subjectIds);

    if (!subjects || subjects.length === 0) return null;

    // Calculate days to outcome for each
    const daysArray: number[] = [];

    for (const event of successEvents) {
      const subject = subjects.find((s: any) => s.subject_id === event.subject_id);
      if (subject) {
        const created = new Date(subject.created_at);
        const succeeded = new Date(event.occurred_at);
        const days = (succeeded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        daysArray.push(days);
      }
    }

    if (daysArray.length === 0) return null;

    const sorted = [...daysArray].sort((a, b) => a - b);
    const avg = daysArray.reduce((sum, d) => sum + d, 0) / daysArray.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    // Velocity distribution
    const distribution = { fast: 0, normal: 0, slow: 0, stalled: 0 };
    for (const days of daysArray) {
      if (days < avg * 0.7) distribution.fast++;
      else if (days < avg * 1.3) distribution.normal++;
      else if (days < avg * 2) distribution.slow++;
      else distribution.stalled++;
    }

    return {
      avg_days_to_outcome: avg,
      median_days_to_outcome: median,
      fastest_days: sorted[0],
      slowest_days: sorted[sorted.length - 1],
      total_successful: daysArray.length,
      velocity_distribution: distribution,
    };
  } catch (error) {
    console.error("[CohortAnalyzer] Error getting velocity metrics:", error);
    return null;
  }
}

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

/**
 * Get comprehensive performance benchmarks for dashboard display.
 * Combines cohort analysis, velocity, and health scoring.
 */
export async function getPerformanceBenchmarks(
  supabase: any,
  orgId: string,
  stages?: string[],
  successStage?: string
): Promise<PerformanceBenchmark | null> {
  try {
    const now = new Date();

    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [comparison, velocity] = await Promise.all([
      compareCohorts(supabase, orgId, currentStart, currentEnd, previousStart, previousEnd, stages),
      getVelocityMetrics(supabase, orgId, successStage),
    ]);

    if (!comparison) return null;

    const trendDirection =
      comparison.trend === "improving" ? "up" : comparison.trend === "declining" ? "down" : "stable";

    // Health score (0-100)
    // Weighted: success rate (40%), first-stage rate (20%), velocity (20%), trend (20%)
    const stageNames = Object.keys(comparison.current_cohort.stage_rates);
    const firstStage = stageNames[0];
    const lastStage = stageNames[stageNames.length - 1];

    const successRate = comparison.current_cohort.stage_rates[lastStage] || 0;
    const firstRate = comparison.current_cohort.stage_rates[firstStage] || 0;

    const successScore = Math.min(100, successRate * 4); // 25% = 100
    const firstStageScore = Math.min(100, firstRate * 2); // 50% = 100

    let velocityScore = 50;
    if (velocity) {
      const fastPct = (velocity.velocity_distribution.fast / velocity.total_successful) * 100;
      velocityScore = Math.min(100, fastPct * 2);
    }

    const trendScore = comparison.trend === "improving" ? 100 : comparison.trend === "stable" ? 50 : 0;

    const healthScore = Math.round(
      successScore * 0.4 + firstStageScore * 0.2 + velocityScore * 0.2 + trendScore * 0.2
    );

    return {
      current_month: comparison.current_cohort,
      previous_month: comparison.previous_cohort,
      comparison,
      velocity_metrics: velocity,
      trend_direction: trendDirection,
      health_score: healthScore,
    };
  } catch (error) {
    console.error("[CohortAnalyzer] Error getting benchmarks:", error);
    return null;
  }
}
