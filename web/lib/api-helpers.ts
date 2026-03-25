import { NextResponse } from 'next/server';
import { createHeaderAuthClient, createAdminClient } from '@/lib/supabase';

/**
 * Standard API response helpers for BrandOps CRUD routes.
 * Pattern: auth check → Supabase query → demo fallback.
 */

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Authenticate request and return user + supabase client.
 * Returns null user if auth fails (caller should return 401).
 */
export async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const supabase = createHeaderAuthClient(authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, error: 'Unauthorized' };
  }

  return { user, supabase, error: null };
}

/**
 * Get the user's org_id from organization_members.
 * Returns the first org the user belongs to.
 */
export async function getUserOrgId(supabase: ReturnType<typeof createHeaderAuthClient>, userId: string) {
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  return data?.organization_id || null;
}

/**
 * Check if Supabase is configured (not in pure demo mode).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url.includes('supabase.co') && !url.includes('your-project');
}
