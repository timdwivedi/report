import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/view-as — Start or stop impersonation
// Demo: no-op (handled client-side via OrgContextProvider)
// Production: set/clear app_metadata.impersonating_user_id via Supabase Admin API
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { orgId, action } = body // action: 'start' | 'stop'

  if (action === 'start' && !orgId) {
    return NextResponse.json({ error: 'orgId required for start' }, { status: 400 })
  }

  // TODO: Production — verify super_admin role, then:
  // if action === 'start':
  //   await supabaseAdmin.auth.admin.updateUserById(userId, {
  //     app_metadata: { impersonating_org_id: orgId }
  //   })
  // if action === 'stop':
  //   await supabaseAdmin.auth.admin.updateUserById(userId, {
  //     app_metadata: { impersonating_org_id: null }
  //   })

  return NextResponse.json({
    success: true,
    action,
    orgId: action === 'start' ? orgId : null,
  })
}
