import { NextRequest, NextResponse } from 'next/server'
import { getDemoOrgTeam } from '@/lib/demo/admin-demo-data'

// GET /api/admin/org-members?orgId=xxx — List team members for an org
// Demo: returns static demo data
// Production: query organization_members + user_profiles
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('orgId')
  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }
  // TODO: Production — verify super_admin role, query Supabase
  const team = getDemoOrgTeam(orgId)
  return NextResponse.json(team)
}

// POST /api/admin/org-members — Add a member to an organization
// Demo: returns confirmation
// Production: insert into organization_members + send invite email
export async function POST(request: NextRequest) {
  // TODO: Production — verify super_admin role, insert into Supabase, send invite
  const body = await request.json()
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
