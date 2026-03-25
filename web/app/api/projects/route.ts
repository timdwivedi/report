import { NextRequest } from 'next/server';
import { authenticateRequest, getUserOrgId, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoProjects } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return jsonOk(getDemoProjects());
  }

  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const { data, error: dbError } = await supabase
    .from('projects')
    .select('*, project_line_items(*)')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const orgId = await getUserOrgId(supabase, user.id);
  if (!orgId) return jsonError('No organization found', 403);

  const body = await request.json();

  // Auto-generate project_number if not provided
  if (!body.project_number) {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    const nextNumber = String((count || 0) + 1).padStart(4, '0');
    body.project_number = `PRJ-${year}-${nextNumber}`;
  }

  const { data, error: dbError } = await supabase
    .from('projects')
    .insert({ ...body, org_id: orgId })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data, 201);
}
