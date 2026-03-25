"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase'
import XRayModeProvider from './XRayModeProvider'
import XRayOverlay from './XRayOverlay'
import FeedbackPanel from './FeedbackPanel'
import XRayFloatingToggle from './XRayFloatingToggle'
import XRayKeyboardShortcut from './XRayKeyboardShortcut'

const XRAY_ALLOWED_ROLES = ['super_admin', 'operator']

function isDemoMode(): boolean {
  return typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === '')
}

/**
 * Global X-Ray Mode wrapper — add once in root layout.
 *
 * Auth-gated: only renders X-Ray components for super_admin and operator roles.
 * In demo mode (no Supabase), always allowed.
 */
export default function XRayGlobal({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    // Demo mode: no real auth, always allow X-Ray
    if (isDemoMode()) { setAllowed(true); return }

    if (loading) return
    if (!user) { setAllowed(false); return }

    const supabase = createClient()
    supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.role) {
          // No role column or no profile yet — allow any authenticated user
          // (fresh builds before role infrastructure is set up)
          setAllowed(true)
        } else {
          setAllowed(XRAY_ALLOWED_ROLES.includes(data.role))
        }
      })
  }, [user, loading])

  // Always provide XRayModeProvider so useXRayMode() never crashes
  // (admin layout uses XRayToggle which needs the context during SSG).
  // Only render the visible X-Ray components when allowed.
  return (
    <XRayModeProvider>
      {children}
      {allowed && (
        <>
          <XRayOverlay />
          <FeedbackPanel />
          <XRayFloatingToggle />
          <XRayKeyboardShortcut />
        </>
      )}
    </XRayModeProvider>
  )
}
