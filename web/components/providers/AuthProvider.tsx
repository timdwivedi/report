"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import type { PlatformRole } from '@/lib/types/app'

function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url.includes('supabase.co') || url.includes('your-project')
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  effectiveRole: PlatformRole | null
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  effectiveRole: null,
  isSuperAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const demo = isDemoMode()

  useEffect(() => {
    if (demo) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  // In demo mode, always super_admin. In production, fetch from user_profiles (future).
  const effectiveRole: PlatformRole | null = demo ? 'super_admin' : null
  const isSuperAdmin = effectiveRole === 'super_admin'

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, effectiveRole, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
