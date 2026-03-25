import { NextRequest } from 'next/server';
import { authenticateRequest, getUserOrgId, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoOrders } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return jsonOk(getDemoOrders());
  }

  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('orders').select('*').eq('org_id', orgId).order('updated_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error: dbError } = await query;
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
    .from('orders')
    .insert({ ...body, org_id: orgId })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data, 201);
}
