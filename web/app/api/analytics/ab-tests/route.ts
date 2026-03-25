/**
 * /api/analytics/ab-tests — A/B Test CRUD
 *
 * GET: List tests with current stats.
 * POST: Create test with variants + weights + target metric.
 * PATCH: Update status (pause/resume/complete), promote winner.
 * Auth: org member (RLS checks membership).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { ABTest } from "@/lib/analytics/types/analytics.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
    },
  });
}

/** GET — List all A/B tests for org */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");

    if (!orgId) {
      return NextResponse.json({ error: "org_id required" }, { status: 400 });
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("ab_tests")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("[analytics/ab-tests] GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

/** POST — Create a new A/B test */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, name, description, test_type, variants, target_metric, min_sample_size } = body;

    if (!org_id || !name || !variants || !Array.isArray(variants)) {
      return NextResponse.json({ error: "org_id, name, and variants required" }, { status: 400 });
    }

    // Validate variant weights sum to ~100
    const totalWeight = variants.reduce(
      (sum: number, v: { weight: number }) => sum + v.weight,
      0
    );
    if (totalWeight < 95 || totalWeight > 105) {
      return NextResponse.json(
        { error: `Variant weights must sum to ~100 (got ${totalWeight})` },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();

    const newTest: Partial<ABTest> = {
      org_id,
      name,
      description: description || null,
      test_type: test_type || "bridge",
      variants,
      target_metric: target_metric || "bridge_cta_click",
      status: "draft",
      stats_cache: {},
      min_sample_size: min_sample_size || 100,
    };

    const { data, error } = await supabase
      .from("ab_tests")
      .insert(newTest)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[analytics/ab-tests] POST error:", err);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}

/** PATCH — Update test status or promote winner */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, winner_variant } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = await getSupabase();

    const updates: Record<string, unknown> = {};

    if (status) {
      const VALID_STATUSES = ["draft", "running", "paused", "completed"];
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updates.status = status;
      if (status === "running" && !body.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (winner_variant) {
      updates.winner_variant = winner_variant;
      updates.status = "completed";
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("ab_tests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics/ab-tests] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}
