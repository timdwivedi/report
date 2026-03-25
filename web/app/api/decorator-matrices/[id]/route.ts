import { NextRequest } from 'next/server';
import { authenticateRequest, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoDecoratorMatrices } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    const matrix = getDemoDecoratorMatrices().find(m => m.id === params.id);
    return matrix ? jsonOk(matrix) : jsonError('Not found', 404);
  }

  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error: dbError } = await supabase
    .from('decorator_matrices')
    .select('*')
    .eq('id', params.id)
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { data, error: dbError } = await supabase
    .from('decorator_matrices')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, supabase } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const { error: dbError } = await supabase
    .from('decorator_matrices')
    .delete()
    .eq('id', params.id);

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ success: true });
}
