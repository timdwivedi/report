"use client"

import Link from 'next/link'
import {
  Building2,
  Kanban,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Users,
  Package,
  UserPlus,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useToast } from '@/components/shared/DemoToastProvider'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import {
  getDemoAdminStats,
  getDemoAdminActivity,
  getDemoOrgHealth,
  type AdminActivity,
} from '@/lib/demo/admin-demo-data'

// Icon map for activity items
const ACTIVITY_ICONS: Record<AdminActivity['icon'], React.ComponentType<{ className?: string }>> = {
  project: Kanban,
  order: Package,
  team: UserPlus,
  payment: CreditCard,
  settings: SettingsIcon,
}

// Health status badge colors
const HEALTH_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700',
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AdminOverviewPage() {
  const { showToast } = useToast()
  const stats = getDemoAdminStats()
  const activity = getDemoAdminActivity()
  const orgHealth = getDemoOrgHealth()

  const statCards = [
    {
      label: 'Total Accounts',
      value: stats.total_orgs,
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      useCounter: false,
    },
    {
      label: 'Total Projects',
      value: stats.total_projects,
      icon: Kanban,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      useCounter: false,
    },
    {
      label: 'Platform Revenue',
      value: stats.total_revenue,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      useCounter: true,
      prefix: '$',
    },
    {
      label: 'Avg Deal Size',
      value: stats.avg_deal_size,
      icon: TrendingUp,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      useCounter: true,
      prefix: '$',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Overview</h2>
        <p className="text-sm text-slate-500 mt-1">{formatDate(new Date())}</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {card.useCounter ? (
                <AnimatedCounter
                  value={card.value}
                  prefix={card.prefix || ''}
                  duration={1.5}
                />
              ) : (
                <span>{card.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Activity + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity — 60% */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.icon]
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-slate-100 mt-0.5">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {item.org_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 truncate">{item.action}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Account Health — 40% */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Health</h3>
          <div className="space-y-3">
            {orgHealth.map((org) => (
              <div
                key={org.org_id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">{org.org_name}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      HEALTH_COLORS[org.health_status] || HEALTH_COLORS.inactive
                    }`}
                  >
                    {org.health_status.charAt(0).toUpperCase() + org.health_status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Projects</span>
                    <span className="font-medium text-slate-700">{org.projects_last_30d}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Orders</span>
                    <span className="font-medium text-slate-700">{org.orders_last_30d}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Revenue 30d</span>
                    <span className="font-medium text-slate-700">
                      ${org.revenue_last_30d.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/accounts"
          onClick={() => showToast('Navigating to account creation', 'action')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Create Account
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/users"
          onClick={() => showToast('Loading all platform users', 'action')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Users className="h-4 w-4" />
          View All Users
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
