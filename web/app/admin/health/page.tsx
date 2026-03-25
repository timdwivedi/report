"use client"

import { useState, useMemo } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import { getDemoOrgHealth } from '@/lib/demo/admin-demo-data'
import type { OrgHealthMetric } from '@/lib/types/app'
import { Activity, FolderOpen, ShoppingCart, DollarSign, Clock } from 'lucide-react'

// Law 13: Static Tailwind class maps for health status borders
const SECTION_BORDER_COLORS: Record<string, string> = {
  active: 'border-l-emerald-500',
  moderate: 'border-l-amber-500',
  stale: 'border-l-red-500',
}

const SECTION_LABELS: Record<string, string> = {
  active: 'Active',
  moderate: 'Moderate',
  stale: 'Stale',
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  active: 'Regular activity within the last 7 days',
  moderate: 'Some activity, but engagement is declining',
  stale: 'No meaningful activity in over 30 days',
}

// Law 13: Static badge colors for health status
const STATUS_BADGE_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  stale: 'bg-red-100 text-red-700',
}

// Activity bar colors
const BAR_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  stale: 'bg-red-500',
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${diffDays}d ago`
}

function formatRevenue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}k`
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminHealthPage() {
  const [healthData] = useState<OrgHealthMetric[]>(() => getDemoOrgHealth())

  // Group orgs by health status
  const grouped = useMemo(() => {
    const active = healthData.filter(o => o.health_status === 'active')
    const moderate = healthData.filter(o => o.health_status === 'moderate')
    const stale = healthData.filter(o => o.health_status === 'stale')
    return { active, moderate, stale }
  }, [healthData])

  // Calculate max activity for bar scaling (sum of projects + orders as activity proxy)
  const maxActivity = useMemo(() => {
    return Math.max(
      ...healthData.map(o => o.projects_last_30d + o.orders_last_30d),
      1 // prevent divide by zero
    )
  }, [healthData])

  // Summary totals
  const summary = useMemo(() => ({
    active: grouped.active.length,
    moderate: grouped.moderate.length,
    stale: grouped.stale.length,
    total: healthData.length,
  }), [grouped, healthData])

  const sections: Array<{ key: 'active' | 'moderate' | 'stale'; data: OrgHealthMetric[] }> = [
    { key: 'active', data: grouped.active },
    { key: 'moderate', data: grouped.moderate },
    { key: 'stale', data: grouped.stale },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account Health"
        subtitle="Monitor account activity and engagement"
      />

      {/* Health Sections */}
      {sections.map(section => {
        if (section.data.length === 0) return null

        return (
          <div key={section.key} className="space-y-4">
            {/* Section header */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${SECTION_BORDER_COLORS[section.key]} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-slate-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {SECTION_LABELS[section.key]}
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        ({section.data.length} {section.data.length === 1 ? 'account' : 'accounts'})
                      </span>
                    </h2>
                    <p className="text-sm text-slate-500">{SECTION_DESCRIPTIONS[section.key]}</p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_COLORS[section.key]}`}>
                  {SECTION_LABELS[section.key]}
                </span>
              </div>
            </div>

            {/* Org cards within section */}
            <div className="grid gap-4">
              {section.data.map(org => {
                const activityLevel = org.projects_last_30d + org.orders_last_30d
                const activityPercent = Math.round((activityLevel / maxActivity) * 100)

                return (
                  <div
                    key={org.org_id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Org header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{org.org_name}</h3>
                        <p className="text-sm text-slate-500 font-mono">{org.org_slug}</p>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_COLORS[org.health_status]}`}>
                        {SECTION_LABELS[org.health_status]}
                      </span>
                    </div>

                    {/* Mini-stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Projects (30d)</p>
                          <p className="text-sm font-bold text-slate-900">
                            <AnimatedCounter value={org.projects_last_30d} duration={1.2} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Orders (30d)</p>
                          <p className="text-sm font-bold text-slate-900">
                            <AnimatedCounter value={org.orders_last_30d} duration={1.2} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Revenue (30d)</p>
                          <p className="text-sm font-bold text-slate-900">
                            {formatRevenue(org.revenue_last_30d)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Last Activity</p>
                          <p className="text-sm font-bold text-slate-900">
                            {formatRelativeDate(org.last_activity_date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Activity Level</span>
                        <span className="text-xs font-medium text-slate-700">{activityPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[org.health_status]}`}
                          style={{ width: `${activityPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Summary card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              <AnimatedCounter value={summary.total} duration={1} />
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Accounts</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">
              <AnimatedCounter value={summary.active} duration={1} />
            </p>
            <p className="text-sm text-slate-500 mt-1">Active</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">
              <AnimatedCounter value={summary.moderate} duration={1} />
            </p>
            <p className="text-sm text-slate-500 mt-1">Moderate</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              <AnimatedCounter value={summary.stale} duration={1} />
            </p>
            <p className="text-sm text-slate-500 mt-1">Stale</p>
          </div>
        </div>
      </div>
    </div>
  )
}
