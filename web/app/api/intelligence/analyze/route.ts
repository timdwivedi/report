/**
 * Universal Intelligence API: Full Analysis
 *
 * POST /api/intelligence/analyze
 *
 * Runs the complete intelligence pipeline on a subject:
 * 1. Extract DNA
 * 2. Score
 * 3. Profile
 * 4. Predict
 *
 * Use this for comprehensive analysis. For individual operations, use specific endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  extractSubjectDNA,
  scoreSubject,
  profileSubject,
  generatePrediction,
} from "@/lib/intelligence/core";
import type { IntelligenceConfig } from "@/lib/intelligence/config/intelligence.config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject_id, raw_data, org_id, operations } = body;

    if (!subject_id || !raw_data) {
      return NextResponse.json(
        { error: "subject_id and raw_data are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const config = await loadOrgConfig(supabase, org_id);
    if (!config) {
      return NextResponse.json({ error: "No intelligence config" }, { status: 404 });
    }

    // Determine which operations to run
    const ops = operations || ["dna", "score", "profile", "predict"];
    const results: Record<string, any> = {};

    // 1. DNA Extraction (foundation for everything else)
    let dna = null;
    if (ops.includes("dna") && config.dna.enabled) {
      const dnaResult = await extractSubjectDNA(config, raw_data);
      dna = dnaResult.dna;
      results.dna = dna;
    }

    // 2. Scoring
    if (ops.includes("score") && config.scoring.enabled) {
      const score = await scoreSubject(config, raw_data, dna);
      results.score = score;
    }

    // 3. Profiling
    if (ops.includes("profile") && config.profiling.enabled) {
      const profile = await profileSubject(config, raw_data, dna);
      results.profile = profile;
    }

    // 4. Prediction
    if (ops.includes("predict") && config.prediction.enabled) {
      const prediction = await generatePrediction(config, raw_data, dna, results.score);
      results.prediction = prediction;
    }

    // Persist all results
    const updatePayload: Record<string, any> = {
      subject_id,
      subject_type: config.subject.singular,
      org_id,
    };

    if (results.dna) {
      updatePayload.dna = results.dna;
      updatePayload.dna_extraction_confidence = results.dna.extraction_confidence;
      updatePayload.dna_extracted_at = results.dna.extracted_at;
    }
    if (results.score) {
      updatePayload.score = results.score.total_score;
      updatePayload.score_verdict = results.score.verdict;
      updatePayload.score_breakdown = results.score.breakdown;
      updatePayload.score_summary = results.score.summary;
      updatePayload.score_tier = results.score.tier;
      updatePayload.score_scored_at = results.score.scored_at;
    }
    if (results.profile) {
      updatePayload.profile = results.profile;
    }
    if (results.prediction) {
      updatePayload.predictive_insights = results.prediction;
    }

    await supabase
      .from("subject_intelligence")
      .upsert(updatePayload, { onConflict: "subject_id" });

    return NextResponse.json({
      success: true,
      results,
      operations_run: Object.keys(results),
    });
  } catch (error: any) {
    console.error("[Intelligence API] Full analysis failed:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
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
