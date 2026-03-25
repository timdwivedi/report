"use client"

import { useState, useCallback, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'motion/react'
import PageHeader from '@/components/shared/PageHeader'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import {
  getDemoTeamMembers,
} from '@/lib/demo/demo-data-provider'
import type { DemoTeamMember } from '@/lib/demo/demo-data-provider'
import {
  Building2,
  Users,
  Plug,
  UserPlus,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react'

// ─── Tabs ──────────────────────────────────────────
type TabId = 'company' | 'team' | 'integrations'

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Plug },
]

// ─── Role Color Map (Static - Tailwind JIT Law) ───
const ROLE_BADGE_STYLES: Record<string, string> = {
  Owner: 'bg-indigo-100 text-indigo-700',
  Admin: 'bg-purple-100 text-purple-700',
  Sales: 'bg-emerald-100 text-emerald-700',
  Production: 'bg-amber-100 text-amber-700',
  Viewer: 'bg-slate-100 text-slate-600',
}

const ROLE_AVATAR_STYLES: Record<string, string> = {
  Owner: 'bg-indigo-100 text-indigo-700',
  Admin: 'bg-purple-100 text-purple-700',
  Sales: 'bg-emerald-100 text-emerald-700',
  Production: 'bg-amber-100 text-amber-700',
  Viewer: 'bg-slate-100 text-slate-600',
}

// ─── Integration Data ──────────────────────────────
const INTEGRATIONS = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect your Salesforce instance for order sync',
    connected: true,
    color: 'bg-blue-100 text-blue-600',
    iconLetter: 'SF',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage invoicing',
    connected: false,
    color: 'bg-purple-100 text-purple-600',
    iconLetter: 'ST',
  },
  {
    id: 'promostandards',
    name: 'PromoStandards',
    description: 'Access supplier inventory in real-time',
    connected: false,
    color: 'bg-emerald-100 text-emerald-600',
    iconLetter: 'PS',
  },
]

// ─── Invite Role Options ───────────────────────────
const INVITE_ROLES = ['Owner', 'Admin', 'Sales', 'Production', 'Viewer'] as const

// ─── Main Page ─────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, team, and configuration"
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all
                ${isActive
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'company' && <CompanyProfileTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Tab 1: Company Profile ────────────────────────
function CompanyProfileTab() {
  const { showToast } = useToast()

  // Editable company fields
  const [companyName, setCompanyName] = useState('85 Supply')
  const [website, setWebsite] = useState('85supply.com')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [defaultMargin, setDefaultMargin] = useState('35')
  const [currency, setCurrency] = useState('USD')
  const [paymentTerms, setPaymentTerms] = useState('net30')

  // Snapshot of saved values for dirty tracking
  const [saved, setSaved] = useState({
    companyName: '85 Supply',
    website: '85supply.com',
    primaryColor: '#6366f1',
    defaultMargin: '35',
    currency: 'USD',
    paymentTerms: 'net30',
  })

  const isDirty =
    companyName !== saved.companyName ||
    website !== saved.website ||
    primaryColor !== saved.primaryColor ||
    defaultMargin !== saved.defaultMargin ||
    currency !== saved.currency ||
    paymentTerms !== saved.paymentTerms

  const handleSave = useCallback(() => {
    const newSaved = {
      companyName,
      website,
      primaryColor,
      defaultMargin,
      currency,
      paymentTerms,
    }
    setSaved(newSaved)
    showToast('Company settings saved', 'action')
  }, [companyName, website, primaryColor, defaultMargin, currency, paymentTerms, showToast])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold font-heading text-slate-900 mb-6">Company Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Primary Color</label>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-slate-200 flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Default Margin */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Default Margin</label>
          <div className="relative">
            <input
              type="number" onFocus={(e) => e.target.select()}
              value={defaultMargin}
              onChange={(e) => setDefaultMargin(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">%</span>
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>

        {/* Payment Terms Default */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Payment Terms Default</label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="prepay">Prepay</option>
            <option value="net15">Net 15</option>
            <option value="net30">Net 30</option>
            <option value="net45">Net 45</option>
            <option value="net60">Net 60</option>
          </select>
        </div>
      </div>

      {/* Appearance */}
      <AppearanceSection />

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          disabled={!isDirty}
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold transition-all ${
            isDirty
              ? 'hover:bg-primary-700 cursor-pointer opacity-100'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

// ─── Appearance Section ──────────────────────────────
function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ] as const

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Appearance</h3>
      <p className="text-xs text-slate-500 mb-3">Choose your preferred theme</p>
      <div className="flex items-center gap-3">
        {options.map((opt) => {
          const Icon = opt.icon
          const isActive = theme === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tab 2: Team ───────────────────────────────────
function TeamTab() {
  const { showToast } = useToast()
  const [team, setTeam] = useState<DemoTeamMember[]>(() => getDemoTeamMembers())
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('Viewer')

  const handleInviteSubmit = useCallback(() => {
    if (!inviteEmail.trim()) return

    const newMember: DemoTeamMember = {
      id: `team-${Date.now()}`,
      name: inviteEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'active',
    }

    setTeam((prev) => [...prev, newMember])
    showToast(`Invitation sent to ${inviteEmail.trim()}`, 'action')
    setInviteEmail('')
    setInviteRole('Viewer')
    setShowInviteModal(false)
  }, [inviteEmail, inviteRole, showToast])

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">Team Members</h2>
          <p className="text-sm text-slate-500 mt-0.5">{team.length} members on your team</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
          const isActive = member.status === 'active'
          const avatarStyle = ROLE_AVATAR_STYLES[member.role] || 'bg-slate-100 text-slate-600'
          const badgeStyle = ROLE_BADGE_STYLES[member.role] || 'bg-slate-100 text-slate-600'

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyle}`}
                >
                  <span className="text-sm font-bold">{initials}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                    {/* Active indicator */}
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{member.email}</p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-2 ${badgeStyle}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Invite Team Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false)
          setInviteEmail('')
          setInviteRole('Viewer')
        }}
        title="Invite Team Member"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowInviteModal(false)
                setInviteEmail('')
                setInviteRole('Viewer')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteSubmit}
              disabled={!inviteEmail.trim()}
              className={`px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg transition-all ${
                inviteEmail.trim()
                  ? 'hover:bg-primary-700 cursor-pointer opacity-100'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Send Invitation
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Tab 3: Integrations ───────────────────────────
function IntegrationsTab() {
  const { showToast } = useToast()

  const handleIntegrationAction = useCallback(
    (name: string, connected: boolean) => {
      if (connected) {
        showToast(`${name} configuration will be available in production`, 'sync')
      } else {
        showToast(`${name} will be connected in production setup`, 'sync')
      }
    },
    [showToast]
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold font-heading text-slate-900">Integrations</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Connect third-party services to your BrandOps workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col"
          >
            {/* Icon + Name */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${integration.color}`}
              >
                <span className="text-sm font-bold">{integration.iconLetter}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{integration.name}</p>
                <p className="text-xs text-slate-500 mt-1">{integration.description}</p>
              </div>
            </div>

            {/* Status + Action */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">Connected</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Not Connected</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleIntegrationAction(integration.name, integration.connected)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                  integration.connected
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {integration.connected ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
