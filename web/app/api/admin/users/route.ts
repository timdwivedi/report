import { NextResponse } from 'next/server'
import { getDemoAdminUsers } from '@/lib/demo/admin-demo-data'

// GET /api/admin/users — List all platform users
// Demo: returns static demo data
// Production: join user_profiles + organization_members
export async function GET() {
  // TODO: Production — verify super_admin role, query Supabase
  const users = getDemoAdminUsers()
  return NextResponse.json(users)
}
