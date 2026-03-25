import { NextRequest } from 'next/server';
import { authenticateRequest, jsonOk, jsonError } from '@/lib/api-helpers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error: dbError } = await supabase
    .from('project_line_items')
    .select('*')
    .eq('project_id', params.id)
    .order('sort_order');

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { data, error: dbError } = await supabase
    .from('project_line_items')
    .insert({ ...body, project_id: params.id })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data, 201);
}
