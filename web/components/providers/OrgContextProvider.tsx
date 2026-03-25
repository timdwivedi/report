"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { getDemoAdminOrgs } from '@/lib/demo/admin-demo-data'

function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url.includes('supabase.co') || url.includes('your-project')
}

export interface Organization {
  id: string
  name: string
  slug: string
  primary_color?: string
  created_at: string
  settings?: Record<string, any>
}

interface OrgContextType {
  organizations: Organization[]
  activeOrg: Organization | null
  setActiveOrg: (org: Organization | null) => void
  loading: boolean
  refreshOrgs: () => Promise<void>
  // View As
  isViewingAs: boolean
  viewAsOrg: Organization | null
  startViewAs: (org: Organization) => void
  stopViewAs: () => void
}

const OrgContext = createContext<OrgContextType>({
  organizations: [],
  activeOrg: null,
  setActiveOrg: () => {},
  loading: true,
  refreshOrgs: async () => {},
  isViewingAs: false,
  viewAsOrg: null,
  startViewAs: () => {},
  stopViewAs: () => {},
})

export function OrgContextProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  const [viewAsOrg, setViewAsOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const demo = isDemoMode()

  // In demo mode, load orgs from admin demo data
  useEffect(() => {
    if (!demo) return
    const adminOrgs = getDemoAdminOrgs().map(o => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      primary_color: o.primary_color,
      created_at: o.created_at,
    }))
    setOrganizations(adminOrgs)
    // Restore active org from localStorage or default to first
    const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('activeOrgId') : null
    const savedOrg = savedOrgId ? adminOrgs.find(o => o.id === savedOrgId) : null
    setActiveOrg(savedOrg || adminOrgs[0] || null)
    // Restore View As state
    const viewAsId = typeof window !== 'undefined' ? localStorage.getItem('viewAsOrgId') : null
    if (viewAsId) {
      const vaOrg = adminOrgs.find(o => o.id === viewAsId) || null
      setViewAsOrg(vaOrg)
    }
    setLoading(false)
  }, [demo])

  const fetchOrganizations = useCallback(async () => {
    if (demo) return // Already loaded above

    if (!user) {
      setOrganizations([])
      setActiveOrg(null)
      setLoading(false)
      return
    }

    try {
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            slug,
            created_at,
            settings
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const orgs = memberships
        ?.map((m: any) => m.organizations)
        .filter(Boolean) as Organization[]

      setOrganizations(orgs || [])

      if (!activeOrg && orgs?.length > 0) {
        const savedOrgId = localStorage.getItem('activeOrgId')
        const savedOrg = savedOrgId ? orgs.find(o => o.id === savedOrgId) : null
        setActiveOrg(savedOrg || orgs[0])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }, [user, activeOrg, demo])

  useEffect(() => {
    if (!demo) fetchOrganizations()
  }, [fetchOrganizations, demo])

  const handleSetActiveOrg = (org: Organization | null) => {
    setActiveOrg(org)
    if (org) {
      localStorage.setItem('activeOrgId', org.id)
    } else {
      localStorage.removeItem('activeOrgId')
    }
  }

  // View As
  const startViewAs = useCallback((org: Organization) => {
    setViewAsOrg(org)
    localStorage.setItem('viewAsOrgId', org.id)
  }, [])

  const stopViewAs = useCallback(() => {
    setViewAsOrg(null)
    localStorage.removeItem('viewAsOrgId')
  }, [])

  const effectiveOrg = viewAsOrg || activeOrg

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg: effectiveOrg,
        setActiveOrg: handleSetActiveOrg,
        loading,
        refreshOrgs: fetchOrganizations,
        isViewingAs: !!viewAsOrg,
        viewAsOrg,
        startViewAs,
        stopViewAs,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export const useOrgContext = () => useContext(OrgContext)
