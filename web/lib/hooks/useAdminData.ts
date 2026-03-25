"use client"

import { useMemo } from 'react'
import {
  getDemoAdminOrgs,
  getDemoAdminStats,
  getDemoAdminUsers,
  getDemoOrgHealth,
  getDemoAdminActivity,
  getDemoOrgProjects,
  getDemoOrgOrders,
  getDemoOrgTeam,
} from '@/lib/demo/admin-demo-data'
import type {
  AdminOrganization,
  PlatformStats,
  PlatformUser,
  OrgHealthMetric,
  Project,
  Order,
  TeamMember,
} from '@/lib/types/app'

interface AdminOrgData {
  projects: Project[]
  orders: Order[]
  team: TeamMember[]
}

interface AdminData {
  stats: PlatformStats
  orgs: AdminOrganization[]
  users: PlatformUser[]
  health: OrgHealthMetric[]
  activity: ReturnType<typeof getDemoAdminActivity>
  getOrgData: (orgId: string) => AdminOrgData
}

/**
 * Convenience hook wrapping admin demo data.
 * Demo mode: returns demo data directly.
 * Production mode (future): will call /api/admin/* routes.
 */
export function useAdminData(): AdminData {
  const stats = useMemo(() => getDemoAdminStats(), [])
  const orgs = useMemo(() => getDemoAdminOrgs(), [])
  const users = useMemo(() => getDemoAdminUsers(), [])
  const health = useMemo(() => getDemoOrgHealth(), [])
  const activity = useMemo(() => getDemoAdminActivity(), [])

  const getOrgData = useMemo(() => {
    return (orgId: string): AdminOrgData => ({
      projects: getDemoOrgProjects(orgId),
      orders: getDemoOrgOrders(orgId),
      team: getDemoOrgTeam(orgId),
    })
  }, [])

  return { stats, orgs, users, health, activity, getOrgData }
}
