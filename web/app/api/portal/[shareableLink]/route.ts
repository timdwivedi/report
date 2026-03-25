import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseConfigured } from '@/lib/api-helpers';
import { createAdminClient } from '@/lib/supabase';
import { getDemoProjects } from '@/lib/demo/demo-data-provider';

/**
 * Public portal route — NO authentication required.
 * Fetches a project by its shareable_link and returns client-safe data
 * (strips cost/margin fields, only exposes unit_price, quantity, subtotal).
 */
export async function GET(request: NextRequest, { params }: { params: { shareableLink: string } }) {
  const { shareableLink } = params;

  if (!isSupabaseConfigured()) {
    const project = getDemoProjects().find(p => p.shareable_link === shareableLink);
    if (!project) return jsonError('Project not found', 404);

    // Strip internal fields for demo
    const { internal_notes, ...publicProject } = project;
    return jsonOk(publicProject);
  }

  // Use admin client since this is a public (unauthenticated) route
  const supabase = createAdminClient();

  const { data: project, error: dbError } = await supabase
    .from('projects')
    .select('*, line_items(*)')
    .eq('shareable_link', shareableLink)
    .single();

  if (dbError || !project) return jsonError('Project not found', 404);

  // Strip cost/margin data from line items — only expose client-facing fields
  const safeLineItems = (project.line_items || []).map((item: Record<string, unknown>) => ({
    id: item.id,
    product_name: item.product_name,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
    decoration_method: item.decoration_method,
    color: item.color,
    size_breakdown: item.size_breakdown,
    image_url: item.image_url,
  }));

  // Strip internal/cost fields from project
  const {
    internal_notes: _internalNotes,
    line_items: _rawLineItems,
    ...publicProject
  } = project;

  return jsonOk({
    ...publicProject,
    line_items: safeLineItems,
  });
}
