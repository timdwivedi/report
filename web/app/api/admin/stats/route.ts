import { NextResponse } from 'next/server'
import { getDemoAdminStats } from '@/lib/demo/admin-demo-data'

// GET /api/admin/stats — Platform-wide statistics
// Demo: returns static demo data
// Production: aggregate queries across all organizations
export async function GET() {
  // TODO: Production — verify super_admin role, query Supabase
  const stats = getDemoAdminStats()
  return NextResponse.json(stats)
}
