import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, getUserOrgId, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoClients } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return jsonOk(getDemoClients());
  }

  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const { data, error: dbError } = await supabase
    .from('clients')
    .select('*, client_contacts(*)')
    .eq('org_id', orgId)
    .order('company_name');

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const body = await request.json();
  const { data, error: dbError } = await supabase
    .from('clients')
    .insert({ ...body, org_id: orgId })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data, 201);
}
