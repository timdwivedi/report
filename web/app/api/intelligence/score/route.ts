/**
 * Universal Intelligence API: Score Subject
 *
 * POST /api/intelligence/score
 *
 * Scores a subject using config-defined dimensions/signals.
 * Supports both signal-based and dimension-weighted scoring methods.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreSubject } from "@/lib/intelligence/core";
import type { IntelligenceConfig } from "@/lib/intelligence/config/intelligence.config";
import type { SubjectDNA } from "@/lib/intelligence/types/intelligence.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject_id, context_data, org_id } = body;

    if (!subject_id || !context_data) {
      return NextResponse.json(
        { error: "subject_id and context_data are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Load config
    const config = await loadOrgConfig(supabase, org_id);
    if (!config) {
      return NextResponse.json(
        { error: "No intelligence config found" },
        { status: 404 }
      );
    }

    // Load existing DNA if available (enriches scoring)
    const { data: existing } = await supabase
      .from("subject_intelligence")
      .select("dna")
      .eq("subject_id", subject_id)
      .single();

    const subjectDNA: SubjectDNA | null = existing?.dna || null;

    // Score
    const score = await scoreSubject(config, context_data, subjectDNA);

    // Persist
    const { error: upsertError } = await supabase
      .from("subject_intelligence")
      .upsert(
        {
          subject_id,
          subject_type: config.subject.singular,
          org_id,
          score: score.total_score,
          score_verdict: score.verdict,
          score_breakdown: score.breakdown,
          score_summary: score.summary,
          score_tier: score.tier,
          score_scored_at: score.scored_at,
          score_model_used: score.model_used,
        },
        { onConflict: "subject_id" }
      );

    if (upsertError) {
      console.error("[Intelligence API] Failed to persist score:", upsertError);
    }

    // Log
    await supabase.from("intelligence_execution_logs").insert({
      org_id,
      subject_id,
      operation: "scoring",
      model_used: score.model_used,
      success: true,
      output_summary: `Score: ${score.total_score}, Tier: ${score.tier}, Verdict: ${score.verdict}`,
    });

    return NextResponse.json({
      success: true,
      score,
    });
  } catch (error: any) {
    console.error("[Intelligence API] Scoring failed:", error);
    return NextResponse.json(
      { error: error.message || "Scoring failed" },
      { status: 500 }
    );
  }
}

async function loadOrgConfig(supabase: any, orgId: string): Promise<IntelligenceConfig | null> {
  if (!orgId) return null;
  const { data } = await supabase
    .from("intelligence_configs")
    .select("config")
    .eq("org_id", orgId)
    .single();
  return data?.config || null;
}
