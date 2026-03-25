import { NextRequest } from 'next/server';
import { authenticateRequest, getUserOrgId, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoCommissionRecords } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const records = getDemoCommissionRecords();
    return jsonOk(period ? records.filter(r => r.period === period) : records);
  }

  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');

  let query = supabase
    .from('commission_records')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (period) {
    query = query.eq('period', period);
  }

  const { data, error: dbError } = await query;
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}
