/**
 * Universal Intelligence API: Extract Subject DNA
 *
 * POST /api/intelligence/extract-dna
 *
 * Extracts structured DNA from raw data using AI.
 * Config-driven: reads extraction dimensions from intelligence config.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractSubjectDNA } from "@/lib/intelligence/core";
import type { IntelligenceConfig } from "@/lib/intelligence/config/intelligence.config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject_id, raw_data, org_id } = body;

    if (!subject_id || !raw_data) {
      return NextResponse.json(
        { error: "subject_id and raw_data are required" },
        { status: 400 }
      );
    }

    // Load intelligence config for this org
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const config = await loadOrgConfig(supabase, org_id);
    if (!config) {
      return NextResponse.json(
        { error: "No intelligence config found for this organization" },
        { status: 404 }
      );
    }

    // Extract DNA
    const { dna, meta } = await extractSubjectDNA(config, raw_data);

    // Persist to database
    const { error: upsertError } = await supabase
      .from("subject_intelligence")
      .upsert(
        {
          subject_id,
          subject_type: config.subject.singular,
          org_id,
          dna,
          dna_extraction_confidence: dna.extraction_confidence,
          dna_extracted_at: dna.extracted_at,
          dna_model_used: meta.model,
        },
        { onConflict: "subject_id" }
      );

    if (upsertError) {
      console.error("[Intelligence API] Failed to persist DNA:", upsertError);
    }

    // Log execution
    await supabase.from("intelligence_execution_logs").insert({
      org_id,
      subject_id,
      operation: "dna_extraction",
      model_used: meta.model,
      success: true,
      output_summary: `Confidence: ${dna.extraction_confidence}%, Archetype: ${dna.matched_archetype?.primary || "none"}`,
    });

    return NextResponse.json({
      success: true,
      dna,
      meta,
    });
  } catch (error: any) {
    console.error("[Intelligence API] DNA extraction failed:", error);
    return NextResponse.json(
      { error: error.message || "DNA extraction failed" },
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
