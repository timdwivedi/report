import { NextRequest } from 'next/server';
import { authenticateRequest, jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { getDemoClients } from '@/lib/demo/demo-data-provider';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    const client = getDemoClients().find(c => c.id === params.id);
    return client ? jsonOk(client) : jsonError('Not found', 404);
  }

  const { user, supabase, error } = await authenticateRequest(request);
  if (!user) return jsonError('Unauthorized', 401);

  const { data, error: dbError } = await supabase
    .from('clients')
    .select('*, client_contacts(*)')
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
    .from('clients')
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

  const { error: dbError } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id);

  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ success: true });
}
