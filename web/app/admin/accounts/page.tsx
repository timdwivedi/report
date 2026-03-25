"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import { DetailPanel } from '@/components/shared/ClickReveal'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { useOrgContext } from '@/components/providers/OrgContextProvider'
import { getDemoAdminOrgs } from '@/lib/demo/admin-demo-data'
import type { AdminOrganization } from '@/lib/types/app'
import { Plus, Search, ExternalLink, Building2, Mail, Users, FolderOpen, DollarSign } from 'lucide-react'

// ── Health badge styling ──

const HEALTH_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
  stale: { bg: 'bg-red-100', text: 'text-red-700', label: 'Stale' },
}

// ── Relative date helper ──

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

// ── Slug generator ──

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Create Account Form ──

interface NewAccountForm {
  name: string
  slug: string
  owner_email: string
  primary_color: string
  default_margin_percent: string
}

const INITIAL_FORM: NewAccountForm = {
  name: '',
  slug: '',
  owner_email: '',
  primary_color: '#2563eb',
  default_margin_percent: '35',
}

export default function AccountsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { startViewAs } = useOrgContext()
  const [orgs, setOrgs] = useState<AdminOrganization[]>(() => getDemoAdminOrgs())
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState<NewAccountForm>(INITIAL_FORM)
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null)

  // Filtered orgs
  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return orgs
    const q = search.toLowerCase()
    return orgs.filter(o => o.name.toLowerCase().includes(q))
  }, [orgs, search])

  // ── Create handler ──

  const handleCreate = () => {
    if (!form.name.trim() || !form.owner_email.trim()) return

    const newOrg: AdminOrganization = {
      id: `org-${Date.now()}`,
      name: form.name.trim(),
      slug: form.slug || toSlug(form.name),
      primary_color: form.primary_color || '#2563eb',
      default_margin_percent: parseInt(form.default_margin_percent) || 35,
      margin_safety_percent: 20,
      currency: 'USD',
      salesforce_enabled: false,
      payment_terms_default: 'net30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_name: form.owner_email.split('@')[0],
      owner_email: form.owner_email.trim(),
      member_count: 1,
      project_count: 0,
      order_count: 0,
      total_revenue: 0,
      last_activity: new Date().toISOString(),
      health_status: 'active',
    }

    setOrgs(prev => [...prev, newOrg])
    setShowCreateModal(false)
    setForm(INITIAL_FORM)
    showToast('Account created', 'action')
  }

  // ── View As handler ──

  const handleViewAs = (org: AdminOrganization) => {
    startViewAs({
      id: org.id,
      name: org.name,
      slug: org.slug,
      primary_color: org.primary_color,
      created_at: org.created_at,
    })
    router.push('/dashboard')
  }

  // ── Table columns ──

  const columns: Column<AdminOrganization>[] = [
    {
      key: 'account',
      header: 'Account',
      width: '22%',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.primary_color }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{row.name}</p>
            <p className="text-xs text-slate-500 truncate">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '20%',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{row.owner_name}</p>
          <p className="text-xs text-slate-500 truncate">{row.owner_email}</p>
        </div>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      width: '10%',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-6 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
          {row.member_count}
        </span>
      ),
    },
    {
      key: 'projects',
      header: 'Projects',
      width: '10%',
      align: 'center',
      render: (row) => (
        <span className="text-sm text-slate-700 font-medium">{row.project_count}</span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      width: '14%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono font-semibold text-slate-900">
          ${row.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'health',
      header: 'Health',
      width: '12%',
      align: 'center',
      render: (row) => {
        const style = HEALTH_STYLES[row.health_status]
        return (
          <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        )
      },
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      width: '12%',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.last_activity ? relativeDate(row.last_activity) : '--'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Accounts"
        subtitle={`${orgs.length} accounts on the platform`}
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Account
          </button>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={filteredOrgs}
          onRowClick={(row) => setSelectedOrg(row)}
          rowKey={(row) => row.id}
          emptyMessage="No accounts found"
        />
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title="Account Details"
      >
        {selectedOrg && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedOrg.primary_color }}
              />
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedOrg.name}</h4>
                <p className="text-sm text-slate-500">{selectedOrg.slug}</p>
              </div>
              {(() => {
                const hs = HEALTH_STYLES[selectedOrg.health_status]
                return (
                  <span className={`ml-auto px-2.5 py-0.5 text-xs font-semibold rounded-full ${hs.bg} ${hs.text}`}>
                    {hs.label}
                  </span>
                )
              })()}
            </div>

            {/* Info grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Owner</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrg.owner_name}</p>
                  <p className="text-xs text-slate-500">{selectedOrg.owner_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Members</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrg.member_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Projects / Orders</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrg.project_count} projects / {selectedOrg.order_count} orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-sm font-mono font-semibold text-slate-900">${selectedOrg.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Margin / Payment Terms</p>
                  <p className="text-sm font-medium text-slate-900">{selectedOrg.default_margin_percent}% / {selectedOrg.payment_terms_default}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  handleViewAs(selectedOrg)
                  setSelectedOrg(null)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View As
              </button>
              <button
                onClick={() => {
                  setSelectedOrg(null)
                  router.push(`/admin/accounts/${selectedOrg.id}`)
                }}
                className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Full Details
              </button>
            </div>
          </div>
        )}
      </DetailPanel>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setForm(INITIAL_FORM) }}
        title="Create Account"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowCreateModal(false); setForm(INITIAL_FORM) }}
              className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.name.trim() || !form.owner_email.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                setForm(prev => ({ ...prev, name, slug: toSlug(name) }))
              }}
              placeholder="e.g. Nashville Promo Co"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="auto-generated"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Owner Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Owner Email</label>
            <input
              type="email"
              value={form.owner_email}
              onChange={(e) => setForm(prev => ({ ...prev, owner_email: e.target.value }))}
              placeholder="owner@company.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={form.primary_color}
                onChange={(e) => setForm(prev => ({ ...prev, primary_color: e.target.value }))}
                placeholder="#2563eb"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <span
                className="w-8 h-8 rounded-lg border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: form.primary_color || '#2563eb' }}
              />
            </div>
          </div>

          {/* Default Margin % */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Margin %</label>
            <input
              type="number" onFocus={(e) => e.target.select()}
              value={form.default_margin_percent}
              onChange={(e) => setForm(prev => ({ ...prev, default_margin_percent: e.target.value }))}
              placeholder="35"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
