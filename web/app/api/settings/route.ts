import { NextResponse } from 'next/server'
import { createHeaderAuthClient, createAdminClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const supabase = createHeaderAuthClient(authHeader)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return default settings if none exist
    return NextResponse.json({
      settings: settings || {
        theme: 'system',
        notifications_enabled: true,
        email_notifications: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const supabase = createHeaderAuthClient(authHeader)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { theme, notifications_enabled, email_notifications } = body

    // Build update object with only provided fields
    const updates: Record<string, any> = {}
    if (theme !== undefined) updates.theme = theme
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled
    if (email_notifications !== undefined) updates.email_notifications = email_notifications

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Upsert settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...updates,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
