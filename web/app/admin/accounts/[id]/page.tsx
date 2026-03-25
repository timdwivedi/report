"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/shared/DataTable'
import Modal from '@/components/shared/Modal'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import { useToast } from '@/components/shared/DemoToastProvider'
import { useOrgContext } from '@/components/providers/OrgContextProvider'
import { getDemoAdminOrgs, getDemoOrgProjects, getDemoOrgOrders, getDemoOrgTeam } from '@/lib/demo/admin-demo-data'
import { getDemoProjects, getDemoOrders } from '@/lib/demo/demo-data-provider'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import type { AdminOrganization, Project, Order, TeamMember, TeamRole } from '@/lib/types/app'
import {
  ArrowLeft,
  ExternalLink,
  FolderOpen,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Save,
} from 'lucide-react'

// ── Health badge styling ──

const HEALTH_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
  stale: { bg: 'bg-red-100', text: 'text-red-700', label: 'Stale' },
}

// ── Tab definitions ──

type TabKey = 'projects' | 'orders' | 'team' | 'settings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'orders', label: 'Orders' },
  { key: 'team', label: 'Team' },
  { key: 'settings', label: 'Settings' },
]

// ── Invite form ──

interface InviteForm {
  email: string
  role: TeamRole
}

const INITIAL_INVITE: InviteForm = { email: '', role: 'viewer' }

// ── Settings form ──

interface SettingsForm {
  name: string
  primary_color: string
  default_margin_percent: string
  payment_terms_default: string
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { startViewAs } = useOrgContext()
  const orgId = params.id as string

  // Find the org from demo data
  const org = useMemo<AdminOrganization | null>(() => {
    return getDemoAdminOrgs().find(o => o.id === orgId) || null
  }, [orgId])

  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>('projects')

  // Memoized data — Projects
  const projects = useMemo<Project[]>(() => {
    if (orgId === 'org-85-supply') return getDemoProjects()
    return getDemoOrgProjects(orgId)
  }, [orgId])

  // Memoized data — Orders
  const orders = useMemo<Order[]>(() => {
    if (orgId === 'org-85-supply') return getDemoOrders()
    return getDemoOrgOrders(orgId)
  }, [orgId])

  // Mutable team state
  const [team, setTeam] = useState<TeamMember[]>(() => {
    if (orgId === 'org-85-supply') {
      // Build team from admin demo data users for 85 Supply
      return getDemoOrgTeam(orgId).length > 0
        ? getDemoOrgTeam(orgId)
        : [
            {
              id: 'team-85-001', org_id: orgId, user_id: 'auth-trevor-001',
              name: 'Trevor Mitchell', email: 'trevor@85supply.com', role: 'owner' as TeamRole,
              avatar_initials: 'TM', is_active: true, projects_assigned: 15, deals_closed: 8,
              created_at: '2025-06-15T00:00:00Z',
            },
            {
              id: 'team-85-002', org_id: orgId, user_id: 'auth-ashley-002',
              name: 'Ashley Rodriguez', email: 'ashley@85supply.com', role: 'admin' as TeamRole,
              avatar_initials: 'AR', is_active: true, projects_assigned: 10, deals_closed: 5,
              created_at: '2025-07-01T00:00:00Z',
            },
            {
              id: 'team-85-003', org_id: orgId, user_id: 'auth-marcus-003',
              name: 'Marcus Johnson', email: 'marcus@85supply.com', role: 'sales' as TeamRole,
              avatar_initials: 'MJ', is_active: true, projects_assigned: 8, deals_closed: 3,
              created_at: '2025-08-15T00:00:00Z',
            },
            {
              id: 'team-85-004', org_id: orgId, user_id: 'auth-rachel-004',
              name: 'Rachel Kim', email: 'rachel@85supply.com', role: 'production' as TeamRole,
              avatar_initials: 'RK', is_active: true, projects_assigned: 12, deals_closed: 0,
              created_at: '2025-09-01T00:00:00Z',
            },
            {
              id: 'team-85-005', org_id: orgId, user_id: 'auth-devon-005',
              name: 'Devon Park', email: 'devon@85supply.com', role: 'viewer' as TeamRole,
              avatar_initials: 'DP', is_active: true, projects_assigned: 0, deals_closed: 0,
              created_at: '2025-10-01T00:00:00Z',
            },
          ]
    }
    return getDemoOrgTeam(orgId)
  })

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteForm>(INITIAL_INVITE)

  // Settings form
  const [settings, setSettings] = useState<SettingsForm>(() => ({
    name: org?.name || '',
    primary_color: org?.primary_color || '#2563eb',
    default_margin_percent: String(org?.default_margin_percent || 35),
    payment_terms_default: org?.payment_terms_default || 'net30',
  }))

  // ── Revenue calc ──

  const totalRevenue = useMemo(() => {
    return org?.total_revenue || orders.reduce((sum, o) => sum + o.total, 0)
  }, [org, orders])

  // ── Handlers ──

  const handleViewAs = () => {
    if (!org) return
    startViewAs({
      id: org.id,
      name: org.name,
      slug: org.slug,
      primary_color: org.primary_color,
      created_at: org.created_at,
    })
    router.push('/dashboard')
  }

  const handleInvite = () => {
    if (!inviteForm.email.trim()) return
    const initials = inviteForm.email.split('@')[0]
      .split(/[.\-_]/)
      .map(s => s.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')

    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      org_id: orgId,
      user_id: `auth-${Date.now()}`,
      name: inviteForm.email.split('@')[0],
      email: inviteForm.email.trim(),
      role: inviteForm.role,
      avatar_initials: initials || 'XX',
      is_active: true,
      projects_assigned: 0,
      deals_closed: 0,
      created_at: new Date().toISOString(),
    }
    setTeam(prev => [...prev, newMember])
    setShowInviteModal(false)
    setInviteForm(INITIAL_INVITE)
    showToast(`Invitation sent to ${newMember.email}`, 'action')
  }

  const handleSaveSettings = () => {
    showToast('Settings saved', 'action')
  }

  // ── 404 guard ──

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-500 text-lg mb-4">Account not found</p>
        <button
          onClick={() => router.push('/admin/accounts')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Back to Accounts
        </button>
      </div>
    )
  }

  const health = HEALTH_STYLES[org.health_status]

  // ── Project columns ──

  const projectColumns: Column<Project>[] = [
    {
      key: 'project',
      header: 'Project',
      width: '28%',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{row.name}</p>
          <p className="text-xs text-slate-500 truncate">{row.client_name}</p>
        </div>
      ),
    },
    {
      key: 'number',
      header: 'Number',
      width: '16%',
      render: (row) => (
        <span className="text-sm font-mono text-slate-600">{row.project_number}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '16%',
      align: 'center',
      render: (row) => {
        const style = PROJECT_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${style?.bg || 'bg-slate-100'} ${style?.text || 'text-slate-600'}`}>
            {PROJECT_STATUS_LABELS[row.status] || row.status}
          </span>
        )
      },
    },
    {
      key: 'value',
      header: 'Value',
      width: '16%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono font-medium text-slate-900">
          ${(row.estimated_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'inHands',
      header: 'In-Hands',
      width: '14%',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.in_hands_date || '--'}
        </span>
      ),
    },
    {
      key: 'critical',
      header: '',
      width: '10%',
      align: 'center',
      render: (row) => row.is_critical ? (
        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          Critical
        </span>
      ) : null,
    },
  ]

  // ── Order columns ──

  const orderColumns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      width: '20%',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{row.order_number}</p>
          <p className="text-xs text-slate-500 truncate">{row.project_name}</p>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      width: '24%',
      render: (row) => (
        <span className="text-sm text-slate-700 truncate">{row.product_name}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '16%',
      align: 'center',
      render: (row) => {
        const style = ORDER_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${style?.bg || 'bg-slate-100'} ${style?.text || 'text-slate-600'}`}>
            {ORDER_STATUS_LABELS[row.status] || row.status}
          </span>
        )
      },
    },
    {
      key: 'qty',
      header: 'Qty',
      width: '10%',
      align: 'center',
      render: (row) => (
        <span className="text-sm text-slate-700">{row.quantity}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      width: '15%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono font-medium text-slate-900">
          ${row.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'inHands',
      header: 'In-Hands',
      width: '15%',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.in_hands_date || '--'}
        </span>
      ),
    },
  ]

  // ── Role label map ──

  const ROLE_LABELS: Record<string, { bg: string; text: string }> = {
    owner: { bg: 'bg-purple-100', text: 'text-purple-700' },
    admin: { bg: 'bg-blue-100', text: 'text-blue-700' },
    sales: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    production: { bg: 'bg-amber-100', text: 'text-amber-700' },
    viewer: { bg: 'bg-slate-100', text: 'text-slate-600' },
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push('/admin/accounts')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: org.primary_color }}
            />
            <h1 className="text-2xl font-bold font-heading text-slate-900">{org.name}</h1>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${health.bg} ${health.text}`}>
              {health.label}
            </span>
          </div>
          <button
            onClick={handleViewAs}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View As
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-500">Projects</p>
          </div>
          <AnimatedCounter
            value={projects.length}
            duration={1}
            className="text-3xl font-bold font-mono text-slate-900"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-500">Orders</p>
          </div>
          <AnimatedCounter
            value={orders.length}
            duration={1}
            className="text-3xl font-bold font-mono text-slate-900"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-slate-500">Revenue</p>
          </div>
          <AnimatedCounter
            value={totalRevenue}
            prefix="$"
            duration={1.5}
            className="text-3xl font-bold font-mono text-slate-900"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}

      {/* ── Projects Tab ── */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <DataTable
            columns={projectColumns}
            data={projects}
            rowKey={(row) => row.id}
            emptyMessage="No projects yet"
          />
        </div>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <DataTable
            columns={orderColumns}
            data={orders}
            rowKey={(row) => row.id}
            emptyMessage="No orders yet"
          />
        </div>
      )}

      {/* ── Team Tab ── */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Invite button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>

          {/* Member cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map(member => {
              const roleStyle = ROLE_LABELS[member.role] || ROLE_LABELS.viewer
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-700">{member.avatar_initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-slate-400">{member.projects_assigned} projects</span>
                      <span className="text-xs text-slate-400">{member.deals_closed} deals closed</span>
                    </div>
                  </div>

                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${member.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              )
            })}

            {team.length === 0 && (
              <p className="text-sm text-slate-500 col-span-2 text-center py-8">No team members yet</p>
            )}
          </div>
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">Account Settings</h3>
          <div className="space-y-5">
            {/* Org Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span
                  className="w-8 h-8 rounded-lg border border-slate-200 flex-shrink-0"
                  style={{ backgroundColor: settings.primary_color || '#2563eb' }}
                />
              </div>
            </div>

            {/* Default Margin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Margin %</label>
              <input
                type="number" onFocus={(e) => e.target.select()}
                value={settings.default_margin_percent}
                onChange={(e) => setSettings(prev => ({ ...prev, default_margin_percent: e.target.value }))}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
              <select
                value={settings.payment_terms_default}
                onChange={(e) => setSettings(prev => ({ ...prev, payment_terms_default: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="prepay">Prepay</option>
                <option value="net15">Net 15</option>
                <option value="net30">Net 30</option>
                <option value="net45">Net 45</option>
                <option value="net60">Net 60</option>
              </select>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => { setShowInviteModal(false); setInviteForm(INITIAL_INVITE) }}
        title="Invite Member"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowInviteModal(false); setInviteForm(INITIAL_INVITE) }}
              className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={!inviteForm.email.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Invite
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="team@company.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as TeamRole }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="sales">Sales</option>
              <option value="production">Production</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
