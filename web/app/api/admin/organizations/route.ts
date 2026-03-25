import { NextRequest, NextResponse } from 'next/server'
import { getDemoAdminOrgs } from '@/lib/demo/admin-demo-data'

// GET /api/admin/organizations — List all organizations
// Demo: returns static demo data
// Production: query organizations table with super_admin check
export async function GET() {
  // TODO: Production — verify super_admin role, query Supabase
  const orgs = getDemoAdminOrgs()
  return NextResponse.json(orgs)
}

// POST /api/admin/organizations — Create a new organization
// Demo: returns the submitted data as confirmation
// Production: insert into organizations + organization_members
export async function POST(request: NextRequest) {
  // TODO: Production — verify super_admin role, insert into Supabase
  const body = await request.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
