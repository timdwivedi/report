"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoClients } from '@/lib/demo/demo-data-provider'
import { CLIENT_PRIORITY_LABELS, CLIENT_PRIORITY_COLORS } from '@/lib/constants/app'
import type { Client, PaymentTerms, ClientContact } from '@/lib/types/app'
import { Search, Plus, ArrowUpDown, AlertTriangle, Filter } from 'lucide-react'

// ===== FORM STATE TYPE =====

interface ClientFormState {
  company_name: string
  industry: string
  contact_name: string
  contact_email: string
  contact_phone: string
  street: string
  street2: string
  city: string
  state: string
  zip: string
  payment_terms: PaymentTerms
  credit_limit: string
  tax_exempt: boolean
}

const EMPTY_FORM: ClientFormState = {
  company_name: '',
  industry: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  street: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  payment_terms: 'net30',
  credit_limit: '',
  tax_exempt: false,
}

const INDUSTRIES = [
  'Restaurants',
  'Insurance',
  'Sports',
  'Beverage',
  'Technology',
  'Healthcare',
  'Retail',
  'Manufacturing',
]

const PAYMENT_TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: 'prepay', label: 'Prepay' },
  { value: 'net15', label: 'NET 15' },
  { value: 'net30', label: 'NET 30' },
  { value: 'net45', label: 'NET 45' },
  { value: 'net60', label: 'NET 60' },
]

// ===== HELPER: Build Client from form =====

function buildClientFromForm(form: ClientFormState, existingId?: string): Client {
  const id = existingId || `client-${Date.now()}`
  const now = new Date().toISOString()

  const contact: ClientContact = {
    id: existingId ? `${id}-contact` : `contact-${Date.now()}`,
    client_id: id,
    name: form.contact_name || 'Primary Contact',
    email: form.contact_email || '',
    phone: form.contact_phone || undefined,
    role: 'primary',
    is_primary: true,
  }

  return {
    id,
    org_id: 'demo-org',
    company_name: form.company_name,
    industry: form.industry || undefined,
    billing_address: {
      street: form.street,
      street2: form.street2 || undefined,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: 'USA',
    },
    payment_terms: form.payment_terms,
    credit_limit: form.credit_limit ? Number(form.credit_limit) : undefined,
    tax_exempt: form.tax_exempt,
    annual_volume: undefined,
    status: 'active',
    contacts: [contact],
    created_at: now,
    updated_at: now,
  }
}

// ===== HELPER: Build form from existing Client =====

function buildFormFromClient(client: Client): ClientFormState {
  const primaryContact = client.contacts.find(c => c.is_primary) || client.contacts[0]
  return {
    company_name: client.company_name,
    industry: client.industry || '',
    contact_name: primaryContact?.name || '',
    contact_email: primaryContact?.email || '',
    contact_phone: primaryContact?.phone || '',
    street: client.billing_address?.street || '',
    street2: client.billing_address?.street2 || '',
    city: client.billing_address?.city || '',
    state: client.billing_address?.state || '',
    zip: client.billing_address?.zip || '',
    payment_terms: client.payment_terms,
    credit_limit: client.credit_limit ? String(client.credit_limit) : '',
    tax_exempt: client.tax_exempt,
  }
}

// ===== MAIN PAGE COMPONENT =====

export default function ClientsPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [clients, setClients] = useState<Client[]>(() => getDemoClients())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'annual_spend' | 'last_activity' | 'last_ordered' | 'company_name' | 'confirmed_spend'>('company_name')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'vip' | 'standard' | 'at-risk'>('all')
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM)

  // ===== Aging check (>60 days since last order) =====
  const isAging = (client: Client): boolean => {
    if (!client.last_ordered_date) return true
    const daysSince = Math.floor((Date.now() - new Date(client.last_ordered_date).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 60
  }

  // ===== Confirmed spend lookup (mock: derived from annual_volume) =====
  const getConfirmedSpend = (client: Client): number => {
    // Simulate confirmed spend as ~60-85% of annual volume for demo
    const base = client.annual_volume || 0
    const hash = client.id.charCodeAt(0) % 4
    const pct = [0.62, 0.71, 0.78, 0.85][hash]
    return Math.round(base * pct)
  }

  // ===== Filtered + sorted data =====
  const filtered = clients
    .filter(c => {
      const matchesSearch =
        c.company_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
        c.contacts[0]?.name.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter
      return matchesSearch && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'annual_spend':
          return (b.annual_volume || 0) - (a.annual_volume || 0)
        case 'confirmed_spend':
          return getConfirmedSpend(b) - getConfirmedSpend(a)
        case 'last_activity':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'last_ordered':
          return new Date(b.last_ordered_date || '2000-01-01').getTime() - new Date(a.last_ordered_date || '2000-01-01').getTime()
        case 'company_name':
        default:
          return a.company_name.localeCompare(b.company_name)
      }
    })

  // ===== Form helpers =====
  const updateField = useCallback(<K extends keyof ClientFormState>(key: K, value: ClientFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const openAddModal = useCallback(() => {
    setEditingClient(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((client: Client) => {
    setEditingClient(client)
    setForm(buildFormFromClient(client))
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingClient(null)
    setForm(EMPTY_FORM)
  }, [])

  const handleSave = useCallback(() => {
    if (!form.company_name.trim()) return

    if (editingClient) {
      // Update existing client
      const updated = buildClientFromForm(form, editingClient.id)
      // Preserve original created_at, annual_volume, and contacts beyond primary
      updated.created_at = editingClient.created_at
      updated.annual_volume = editingClient.annual_volume
      // Keep non-primary contacts from original
      const otherContacts = editingClient.contacts.filter(c => !c.is_primary)
      updated.contacts = [...updated.contacts, ...otherContacts]

      setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c))
      showToast('Client updated', 'action')
    } else {
      // Add new client
      const newClient = buildClientFromForm(form)
      setClients(prev => [...prev, newClient])
      showToast('Client added successfully', 'action')
    }

    closeModal()
  }, [form, editingClient, closeModal, showToast])

  // ===== Table columns =====
  const columns: Column<Client>[] = [
    {
      key: 'company',
      header: 'Company',
      width: '25%',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{row.company_name}</p>
            {row.priority && (
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CLIENT_PRIORITY_COLORS[row.priority] || ''}`}>
                {CLIENT_PRIORITY_LABELS[row.priority] || row.priority}
              </span>
            )}
            {isAging(row) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                <AlertTriangle className="w-3 h-3" /> Aging
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{row.industry}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Primary Contact',
      width: '22%',
      render: (row) => {
        const contact = row.contacts.find(c => c.is_primary) || row.contacts[0]
        return contact ? (
          <div>
            <p className="text-sm text-slate-900">{contact.name}</p>
            <p className="text-xs text-slate-500">{contact.email}</p>
          </div>
        ) : <span className="text-slate-400">&mdash;</span>
      },
    },
    {
      key: 'volume',
      header: 'Annual Volume',
      width: '12%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono text-slate-900">
          {row.annual_volume ? `$${row.annual_volume.toLocaleString()}` : '\u2014'}
        </span>
      ),
    },
    {
      key: 'confirmed_spend',
      header: 'Confirmed Spend',
      width: '12%',
      align: 'right',
      render: (row) => {
        const spend = getConfirmedSpend(row)
        return (
          <span className="text-sm font-mono text-slate-900">
            {spend > 0 ? `$${spend.toLocaleString()}` : '\u2014'}
          </span>
        )
      },
    },
    {
      key: 'terms',
      header: 'Terms',
      width: '12%',
      render: (row) => {
        const termsStyles: Record<string, string> = {
          prepay: 'bg-emerald-100 text-emerald-700',
          net15: 'bg-blue-100 text-blue-700',
          net30: 'bg-blue-100 text-blue-700',
          net45: 'bg-amber-100 text-amber-700',
          net60: 'bg-red-100 text-red-700',
        }
        const label = row.payment_terms.replace('net', 'NET ')
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${termsStyles[row.payment_terms] || 'bg-slate-100 text-slate-600'}`}>
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </span>
        )
      },
    },
    {
      key: 'tax',
      header: 'Tax Exempt',
      width: '10%',
      align: 'center',
      render: (row) => (
        <span className={`text-xs font-medium ${row.tax_exempt ? 'text-emerald-600' : 'text-slate-400'}`}>
          {row.tax_exempt ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'updated',
      header: 'Last Updated',
      width: '16%',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ]

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} client accounts`}
        action={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        }
      />

      {/* Search + Sort + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name, industry, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="vip">VIP</option>
            <option value="standard">Standard</option>
            <option value="at-risk">At Risk</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="company_name">Company Name (A-Z)</option>
            <option value="annual_spend">Annual Spend (High-Low)</option>
            <option value="confirmed_spend">Confirmed Spend (High-Low)</option>
            <option value="last_activity">Last Activity (Recent)</option>
            <option value="last_ordered">Last Ordered (Recent)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push('/dashboard/clients/' + row.id)}
          emptyMessage="No clients found matching your search."
        />
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingClient ? 'Edit Client' : 'Add Client'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.company_name.trim()}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingClient ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Primary Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Primary Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  placeholder="jane@acme.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  placeholder="615-555-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Billing Address</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Street</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => updateField('street', e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Street Line 2</label>
                <input
                  type="text"
                  value={form.street2}
                  onChange={(e) => updateField('street2', e.target.value)}
                  placeholder="Suite 200, Building B, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Nashville"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="TN"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => updateField('zip', e.target.value)}
                    placeholder="37203"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Billing */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment & Billing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Terms</label>
                <select
                  value={form.payment_terms}
                  onChange={(e) => updateField('payment_terms', e.target.value as PaymentTerms)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  {PAYMENT_TERMS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Credit Limit ($)</label>
                <input
                  type="number" onFocus={(e) => e.target.select()}
                  value={form.credit_limit}
                  onChange={(e) => updateField('credit_limit', e.target.value)}
                  placeholder="100000"
                  min={0}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.tax_exempt}
                    onChange={(e) => updateField('tax_exempt', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">Tax Exempt</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
