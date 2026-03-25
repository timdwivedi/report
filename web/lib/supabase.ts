import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Demo mode: use placeholders when env vars are not set (prevents crash on showcase builds)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY

// Browser client - for client components
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}

// Server client with service role - bypasses RLS (use carefully)
export function createAdminClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// API client with Bearer token - respects RLS
export function createHeaderAuthClient(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Return anon client if no auth header
    return createSupabaseClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  }

  const token = authHeader.replace('Bearer ', '')

  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )
}

// Alias for backwards compatibility
export const createServerClient = createAdminClient
export const createBrowserClientSupabase = createClient
