/**
 * Universal Effectiveness Tracker (Adaptive Learning Loop)
 *
 * Transplanted from Invisible Pipeline's effectiveness-tracker.ts
 * Tracks which content styles work for which subject types.
 * Powers data-driven content optimization across ANY domain.
 *
 * Matrix Structure: Content Style × Subject Type → Outcome Metrics
 *
 * Original: Blueprint-specific message effectiveness (DM styles × lead roles)
 * Universal: Config-driven content effectiveness for ANY content generation
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EffectivenessMetrics {
  sends_count: number;
  positive_count: number;   // Replies, engagements, completions, etc.
  engaged_count: number;    // Deeper engagement (booked, enrolled, etc.)
  converted_count: number;  // Final conversion (closed, graduated, hired, etc.)
  bounced_count: number;    // Negative signals (unsubscribe, complaint, etc.)
  positive_rate: number;    // positive / sends
  engagement_rate: number;  // engaged / sends
  conversion_rate: number;  // converted / sends
}

export interface EffectivenessRecord {
  id?: string;
  org_id: string;
  subject_type: string;     // Config-driven: "VP Engineering", "Ceiling: Control", etc.
  content_style: string;    // Config-driven: "curiosity", "pain_agitate", "empathetic", etc.
  metrics: EffectivenessMetrics;
  last_updated?: string;
}

/** Outcome signals are config-driven — the tracker just counts them */
export type OutcomeSignal =
  | "sent"
  | "positive_response"
  | "engagement"
  | "conversion"
  | "bounce";

// ============================================================================
// TRACKING
// ============================================================================

/**
 * Record content effectiveness when an outcome signal fires.
 * Domain-agnostic: the signal types come from config, we just count them.
 */
export async function trackEffectiveness(
  supabase: any,
  params: {
    orgId: string;
    subjectType: string;
    contentStyle: string;
    signal: OutcomeSignal;
  }
): Promise<boolean> {
  const { orgId, subjectType, contentStyle, signal } = params;

  try {
    // Get existing record for this org × subject type × style combo
    const { data: existing, error: fetchError } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .eq("subject_type", subjectType)
      .eq("content_style", contentStyle)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // Build increment map
    const incrementField: Record<OutcomeSignal, string> = {
      sent: "sends_count",
      positive_response: "positive_count",
      engagement: "engaged_count",
      conversion: "converted_count",
      bounce: "bounced_count",
    };

    const field = incrementField[signal];

    if (existing) {
      // Increment the appropriate counter
      const updates: Record<string, number> = {
        [field]: (existing[field] || 0) + 1,
      };

      const { error: updateError } = await supabase
        .from("content_effectiveness")
        .update(updates)
        .eq("id", existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const insertData: Record<string, any> = {
        org_id: orgId,
        subject_type: subjectType,
        content_style: contentStyle,
        sends_count: signal === "sent" ? 1 : 0,
        positive_count: signal === "positive_response" ? 1 : 0,
        engaged_count: signal === "engagement" ? 1 : 0,
        converted_count: signal === "conversion" ? 1 : 0,
        bounced_count: signal === "bounce" ? 1 : 0,
      };

      const { error: insertError } = await supabase
        .from("content_effectiveness")
        .insert(insertData);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error("[Effectiveness] Error tracking:", error);
    return false;
  }
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the best-performing content style for a subject type.
 */
export async function getBestStyleForSubjectType(
  supabase: any,
  orgId: string,
  subjectType: string,
  metric: "positive_rate" | "engagement_rate" | "conversion_rate" = "conversion_rate",
  minSampleSize: number = 3
): Promise<{
  style: string;
  rate: number;
  sampleSize: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .eq("subject_type", subjectType)
      .gte("sends_count", minSampleSize)
      .order(metric, { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      style: data.content_style,
      rate: data[metric] || 0,
      sampleSize: data.sends_count,
    };
  } catch {
    return null;
  }
}

/**
 * Get all effectiveness data for an organization.
 */
export async function getOrgEffectiveness(
  supabase: any,
  orgId: string
): Promise<EffectivenessRecord[]> {
  try {
    const { data, error } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .order("conversion_rate", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get effectiveness summary for dashboard display.
 */
export async function getEffectivenessSummary(
  supabase: any,
  orgId: string
): Promise<{
  totalCombinationsTested: number;
  bestOverallStyle?: string;
  bestOverallRate?: number;
  topSubjectTypes: Array<{
    subjectType: string;
    bestStyle: string;
    conversionRate: number;
  }>;
} | null> {
  try {
    const { data: records, error } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .gte("sends_count", 3);

    if (error) throw error;
    if (!records || records.length === 0) return null;

    // Find best overall style across all subject types
    const styleTotals = new Map<string, { sends: number; conversions: number }>();

    for (const record of records) {
      const existing = styleTotals.get(record.content_style) || { sends: 0, conversions: 0 };
      styleTotals.set(record.content_style, {
        sends: existing.sends + record.sends_count,
        conversions: existing.conversions + record.converted_count,
      });
    }

    let bestStyle: string | undefined;
    let bestRate = 0;

    for (const [style, totals] of styleTotals.entries()) {
      const rate = totals.sends > 0 ? (totals.conversions / totals.sends) * 100 : 0;
      if (rate > bestRate) {
        bestStyle = style;
        bestRate = rate;
      }
    }

    // Group by subject type, find best style per type
    const subjectTypeMap = new Map<string, typeof records>();
    for (const record of records) {
      const arr = subjectTypeMap.get(record.subject_type) || [];
      arr.push(record);
      subjectTypeMap.set(record.subject_type, arr);
    }

    const topSubjectTypes: Array<{
      subjectType: string;
      bestStyle: string;
      conversionRate: number;
    }> = [];

    for (const [subjectType, typeRecords] of subjectTypeMap.entries()) {
      let bestStyleForType = "";
      let bestRateForType = 0;

      for (const record of typeRecords) {
        if ((record.conversion_rate || 0) > bestRateForType) {
          bestStyleForType = record.content_style;
          bestRateForType = record.conversion_rate || 0;
        }
      }

      if (bestStyleForType) {
        topSubjectTypes.push({
          subjectType,
          bestStyle: bestStyleForType,
          conversionRate: bestRateForType,
        });
      }
    }

    topSubjectTypes.sort((a, b) => b.conversionRate - a.conversionRate);

    return {
      totalCombinationsTested: records.length,
      bestOverallStyle: bestStyle,
      bestOverallRate: bestRate,
      topSubjectTypes: topSubjectTypes.slice(0, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Get a personalized style recommendation for a new subject.
 * Tries: exact match → fuzzy match → org-wide best.
 */
export async function getRecommendedStyle(
  supabase: any,
  orgId: string,
  subjectType: string
): Promise<{
  recommendedStyle: string;
  confidence: "low" | "medium" | "high";
  expectedConversionRate?: number;
  reason: string;
} | null> {
  try {
    // 1. Try exact match
    const exactMatch = await getBestStyleForSubjectType(supabase, orgId, subjectType, "conversion_rate", 5);

    if (exactMatch && exactMatch.sampleSize >= 5) {
      return {
        recommendedStyle: exactMatch.style,
        confidence: "high",
        expectedConversionRate: exactMatch.rate,
        reason: `Based on ${exactMatch.sampleSize} interactions with ${subjectType}s, "${exactMatch.style}" has ${exactMatch.rate.toFixed(1)}% conversion rate`,
      };
    }

    // 2. Try fuzzy match (first word of subject type)
    const firstWord = subjectType.split(" ")[0];
    const { data: fuzzyMatches } = await supabase
      .from("content_effectiveness")
      .select("*")
      .eq("org_id", orgId)
      .ilike("subject_type", `%${firstWord}%`)
      .gte("sends_count", 3)
      .order("conversion_rate", { ascending: false })
      .limit(1);

    if (fuzzyMatches?.length > 0) {
      const match = fuzzyMatches[0];
      return {
        recommendedStyle: match.content_style,
        confidence: "medium",
        expectedConversionRate: match.conversion_rate,
        reason: `Based on similar type (${match.subject_type}), "${match.content_style}" performs best`,
      };
    }

    // 3. Fall back to org-wide best
    const summary = await getEffectivenessSummary(supabase, orgId);
    if (summary?.bestOverallStyle) {
      return {
        recommendedStyle: summary.bestOverallStyle,
        confidence: "low",
        expectedConversionRate: summary.bestOverallRate,
        reason: "No data for this subject type. Using best overall style for this org.",
      };
    }

    return null;
  } catch {
    return null;
  }
}
