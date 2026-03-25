import { NextRequest } from 'next/server';
import { authenticateRequest, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoProjects } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    const project = getDemoProjects().find(p => p.id === params.id);
    return project ? jsonOk(project) : jsonError('Not found', 404);
  }

  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error: dbError } = await supabase
    .from('projects')
    .select('*, project_line_items(*)')
    .eq('id', params.id)
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { data, error: dbError } = await supabase
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  // Soft-delete: set status to 'cancelled' instead of removing the row
  const { data, error: dbError } = await supabase
    .from('projects')
    .update({ status: 'cancelled' })
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}
