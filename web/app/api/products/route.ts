import { NextRequest } from 'next/server';
import { authenticateRequest, getUserOrgId, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoProductsList } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return jsonOk(getDemoProductsList());
  }

  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const { data, error: dbError } = await supabase
    .from('products')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function POST(request: NextRequest) {
  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const body = await request.json();
  const { data, error: dbError } = await supabase
    .from('products')
    .insert({ ...body, org_id: orgId })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data, 201);
}
