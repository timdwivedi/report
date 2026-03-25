"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import { DetailPanel } from '@/components/shared/ClickReveal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { useOrgContext } from '@/components/providers/OrgContextProvider'
import { getDemoAdminUsers } from '@/lib/demo/admin-demo-data'
import type { PlatformUser, PlatformRole } from '@/lib/types/app'
import { Search, ChevronDown } from 'lucide-react'

// Law 13: Static Tailwind class maps — never dynamic interpolation
const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  owner: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-purple-100 text-purple-700',
  sales: 'bg-emerald-100 text-emerald-700',
  production: 'bg-amber-100 text-amber-700',
  viewer: 'bg-slate-100 text-slate-600',
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner: 'Owner',
  admin: 'Admin',
  sales: 'Sales',
  production: 'Production',
  viewer: 'Viewer',
}

const ROLE_FILTER_OPTIONS: { value: PlatformRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'production', label: 'Production' },
  { value: 'viewer', label: 'Viewer' },
]

// Avatar initials background colors — static map per Law 13
const AVATAR_COLORS: Record<number, string> = {
  0: 'bg-blue-600',
  1: 'bg-emerald-600',
  2: 'bg-purple-600',
  3: 'bg-amber-600',
  4: 'bg-rose-600',
  5: 'bg-cyan-600',
  6: 'bg-indigo-600',
  7: 'bg-teal-600',
  8: 'bg-orange-600',
  9: 'bg-pink-600',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (parts[0]?.[0] || '?').toUpperCase()
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % 10] || 'bg-slate-600'
}

function formatRelativeDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Never'
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { startViewAs, organizations } = useOrgContext()

  const [users, setUsers] = useState<PlatformUser[]>(() => getDemoAdminUsers())
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<PlatformRole | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null)

  // Filter users by search + role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        !search ||
        user.display_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  // Handle role change in detail panel
  const handleRoleChange = (userId: string, newRole: PlatformRole) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    )
    // Keep detail panel in sync
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : null)
    }
    showToast(`Role updated to ${ROLE_LABELS[newRole]}`, 'action')
  }

  // Handle View As
  const handleViewAs = (user: PlatformUser) => {
    const firstOrg = user.org_memberships[0]
    if (!firstOrg) return

    const org = organizations.find(o => o.id === firstOrg.org_id)
    if (org) {
      startViewAs(org)
      router.push('/dashboard')
    } else {
      // Fallback: construct a minimal org from membership data
      startViewAs({
        id: firstOrg.org_id,
        name: firstOrg.org_name,
        slug: firstOrg.org_slug,
        created_at: new Date().toISOString(),
      })
      router.push('/dashboard')
    }
  }

  // Table columns
  const columns: Column<PlatformUser>[] = [
    {
      key: 'user',
      header: 'User',
      width: '30%',
      render: (row, index) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${getAvatarColor(index)}`}>
            {getInitials(row.display_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{row.display_name}</p>
            <p className="text-xs text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: '15%',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[row.role] || ROLE_COLORS.viewer}`}>
          {ROLE_LABELS[row.role] || row.role}
        </span>
      ),
    },
    {
      key: 'organizations',
      header: 'Organizations',
      width: '25%',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.org_memberships.map(m => (
            <span
              key={m.org_id}
              className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md font-medium"
            >
              {m.org_name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'last_login',
      header: 'Last Login',
      width: '15%',
      render: (row) => (
        <span className="text-sm text-slate-500">{formatRelativeDate(row.last_login)}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      width: '15%',
      render: (row) => (
        <span className="text-sm text-slate-500">{formatDate(row.created_at)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Users"
        subtitle={`${users.length} users across all accounts`}
      />

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Role filter dropdown */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as PlatformRole | 'all')}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
          >
            {ROLE_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelectedUser(row)}
          emptyMessage="No users found."
        />
      </div>

      {/* Results count */}
      {(search || roleFilter !== 'all') && (
        <p className="text-sm text-slate-500">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(users.findIndex(u => u.id === selectedUser.id))}`}>
                {getInitials(selectedUser.display_name)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{selectedUser.display_name}</h4>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[selectedUser.role] || ROLE_COLORS.viewer}`}>
                  {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                </span>
              </div>
            </div>

            {/* Org Memberships */}
            <div>
              <h5 className="text-sm font-semibold text-slate-700 mb-3">Org Memberships</h5>
              <div className="space-y-2">
                {selectedUser.org_memberships.map(m => (
                  <div
                    key={m.org_id}
                    className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.org_name}</p>
                      <p className="text-xs text-slate-500">{m.org_slug}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta info */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Login</span>
                <span className="text-slate-900 font-medium">{formatRelativeDate(selectedUser.last_login)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Joined</span>
                <span className="text-slate-900 font-medium">{formatDate(selectedUser.created_at)}</span>
              </div>
            </div>

            {/* Change Role */}
            <div className="border-t border-slate-100 pt-4">
              <label htmlFor="change-role" className="block text-sm font-semibold text-slate-700 mb-2">
                Change Role
              </label>
              <select
                id="change-role"
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as PlatformRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ROLE_FILTER_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* View As button */}
            {selectedUser.org_memberships.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleViewAs(selectedUser)}
                  className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  View As {selectedUser.display_name.split(' ')[0]} ({selectedUser.org_memberships[0].org_name})
                </button>
              </div>
            )}
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
