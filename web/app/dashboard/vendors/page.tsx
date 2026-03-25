"use client"

import { useState, useCallback } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import { DetailPanel } from '@/components/shared/ClickReveal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoVendors, getDemoDecoratorMatrices, getDemoProjects, getDemoProjectLineItems, getDemoTickets } from '@/lib/demo/demo-data-provider'
import type { Vendor, VendorContact, Project, Ticket as TicketData, TicketType, TicketFault, TicketStatus } from '@/lib/types/app'
import { VENDOR_TYPE_LABELS } from '@/lib/constants/app'
import {
  Building2,
  Truck,
  Palette,
  MapPin,
  Phone,
  Mail,
  Globe,
  Grid3x3,
  Star,
  ExternalLink,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  User,
  FolderOpen,
  Ticket,
} from 'lucide-react'

// ===== TICKET DISPLAY CONSTANTS =====

const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  'reprint': 'Reprint',
  'credit': 'Credit',
  'spoilage': 'Spoilage',
  'refund': 'Refund',
}

const TICKET_FAULT_STYLES: Record<TicketFault, { bg: string; text: string }> = {
  'vendor': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'our-fault': { bg: 'bg-orange-50', text: 'text-orange-700' },
}

const TICKET_FAULT_LABELS: Record<TicketFault, string> = {
  'vendor': 'Vendor',
  'our-fault': 'Our Fault',
}

const TICKET_STATUS_STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  'open': { bg: 'bg-red-50', text: 'text-red-700' },
  'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'closed': { bg: 'bg-slate-50', text: 'text-slate-500' },
}

const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
}

const PROJECT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'opportunity': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'qualifying': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'curating': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'in-design': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'client-review': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'order-entry': { bg: 'bg-red-100', text: 'text-red-700' },
  'in-production': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'shipped': { bg: 'bg-green-100', text: 'text-green-700' },
  'cancelled': { bg: 'bg-gray-100', text: 'text-gray-500' },
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  'opportunity': 'Opportunity',
  'qualifying': 'Qualifying',
  'curating': 'Curating',
  'in-design': 'In Design',
  'client-review': 'Client Review',
  'confirmed': 'Confirmed',
  'order-entry': 'Order Entry',
  'in-production': 'In Production',
  'shipped': 'Shipped',
  'cancelled': 'Cancelled',
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  'supplier': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'decorator': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'both': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(() => getDemoVendors())
  const [selected, setSelected] = useState<Vendor | null>(null)
  const matrices = getDemoDecoratorMatrices()
  const { showToast } = useToast()

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<Vendor['type']>('supplier')
  const [editContactName, setEditContactName] = useState('')
  const [editContactEmail, setEditContactEmail] = useState('')
  const [editContactPhone, setEditContactPhone] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editState, setEditState] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editContacts, setEditContacts] = useState<VendorContact[]>([])

  const startEditing = useCallback((vendor: Vendor) => {
    setIsEditing(true)
    setEditName(vendor.name)
    setEditType(vendor.type)
    setEditContactName(vendor.contact_name ?? '')
    setEditContactEmail(vendor.contact_email ?? '')
    setEditContactPhone(vendor.contact_phone ?? '')
    setEditCity(vendor.city ?? '')
    setEditState(vendor.state ?? '')
    setEditWebsite(vendor.website_url ?? '')
    setEditNotes(vendor.notes ?? '')
    setEditContacts(JSON.parse(JSON.stringify(vendor.contacts ?? [])))
  }, [])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const saveEditing = useCallback(() => {
    if (!selected) return
    const updated: Vendor = {
      ...selected,
      name: editName,
      type: editType,
      contact_name: editContactName || undefined,
      contact_email: editContactEmail || undefined,
      contact_phone: editContactPhone || undefined,
      city: editCity || undefined,
      state: editState || undefined,
      website_url: editWebsite || undefined,
      notes: editNotes || undefined,
      contacts: editContacts,
    }
    setVendors(prev => prev.map(v => v.id === updated.id ? updated : v))
    setSelected(updated)
    setIsEditing(false)
    showToast('Vendor updated successfully.', 'action')
  }, [selected, editName, editType, editContactName, editContactEmail, editContactPhone, editCity, editState, editWebsite, editNotes, editContacts, showToast])

  const addContact = useCallback(() => {
    setEditContacts(prev => [...prev, {
      id: `vc-new-${Date.now()}`,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      title: '',
    }])
  }, [])

  const updateContact = useCallback((id: string, field: keyof VendorContact, value: string) => {
    setEditContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }, [])

  const removeContact = useCallback((id: string) => {
    setEditContacts(prev => prev.filter(c => c.id !== id))
  }, [])

  const columns: Column<Vendor>[] = [
    {
      key: 'name',
      header: 'Vendor',
      width: '30%',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            row.type === 'supplier' ? 'bg-blue-100' : row.type === 'decorator' ? 'bg-purple-100' : 'bg-emerald-100'
          }`}>
            {row.type === 'supplier' ? (
              <Truck className="w-4.5 h-4.5 text-blue-600" />
            ) : row.type === 'decorator' ? (
              <Palette className="w-4.5 h-4.5 text-purple-600" />
            ) : (
              <Building2 className="w-4.5 h-4.5 text-emerald-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{row.name}</p>
            {row.city && row.state && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {row.city}, {row.state}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '15%',
      render: (row) => {
        const style = TYPE_STYLES[row.type] ?? TYPE_STYLES['supplier']
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {VENDOR_TYPE_LABELS[row.type] ?? row.type}
          </span>
        )
      },
    },
    {
      key: 'contact',
      header: 'Contact',
      width: '25%',
      render: (row) => (
        <div>
          <p className="text-sm text-slate-900">{row.contact_name ?? '—'}</p>
          <p className="text-xs text-slate-500">{row.contact_email ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'matrices',
      header: 'Pricing Matrices',
      width: '20%',
      align: 'center',
      render: (row) => {
        // Count matrices that belong to this vendor (by name match since we don't have vendor_id on display matrices)
        const vendorMatrices = matrices.filter(m => m.name.toLowerCase().includes(row.name.toLowerCase().split(' ')[0]))
        return vendorMatrices.length > 0 ? (
          <div className="flex items-center justify-center gap-1">
            <Grid3x3 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{vendorMatrices.length}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      align: 'center',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          row.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors & Decorators"
        subtitle={`${vendors.length} vendors configured`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Suppliers',
            count: vendors.filter(v => v.type === 'supplier').length,
            icon: Truck,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            desc: 'Blank product providers',
          },
          {
            label: 'Decorators',
            count: vendors.filter(v => v.type === 'decorator').length,
            icon: Palette,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            desc: 'Print shops & embroiderers',
          },
          {
            label: 'Pricing Matrices',
            count: matrices.length,
            icon: Grid3x3,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            desc: 'Vendor-specific pricing grids',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.count}</p>
              <p className="text-sm font-medium text-slate-700">{card.label}</p>
              <p className="text-xs text-slate-500">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={vendors}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          emptyMessage="No vendors configured."
        />
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => { setSelected(null); setIsEditing(false) }}
        title={selected?.name || 'Vendor Details'}
      >
        {selected && (
          <div className="space-y-6">
            {/* Header: Type + Status + Edit button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  TYPE_STYLES[selected.type]?.bg ?? 'bg-slate-50'
                } ${TYPE_STYLES[selected.type]?.text ?? 'text-slate-600'}`}>
                  {VENDOR_TYPE_LABELS[selected.type] ?? selected.type}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  selected.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selected.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {!isEditing && (
                <button
                  onClick={() => startEditing(selected)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            {/* ===== EDIT MODE ===== */}
            {isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Vendor Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                    <select value={editType} onChange={e => setEditType(e.target.value as Vendor['type'])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="supplier">Supplier</option>
                      <option value="decorator">Decorator</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Primary Contact</label>
                    <input type="text" value={editContactName} onChange={e => setEditContactName(e.target.value)}
                      placeholder="Name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                    <input type="tel" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                    <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                    <input type="text" value={editState} onChange={e => setEditState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Website</label>
                    <input type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)}
                      placeholder="https://" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                    <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                  </div>
                </div>

                {/* Contacts Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacts</h4>
                    <button onClick={addContact} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <Plus className="w-3 h-3" /> Add Contact
                    </button>
                  </div>
                  {editContacts.length === 0 ? (
                    <p className="text-xs text-slate-400">No additional contacts.</p>
                  ) : (
                    <div className="space-y-3">
                      {editContacts.map(contact => (
                        <div key={contact.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-medium text-slate-600">Contact</span>
                            </div>
                            <button onClick={() => removeContact(contact.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={contact.first_name} onChange={e => updateContact(contact.id, 'first_name', e.target.value)}
                              placeholder="First Name" className="px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                            <input type="text" value={contact.last_name} onChange={e => updateContact(contact.id, 'last_name', e.target.value)}
                              placeholder="Last Name" className="px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                            <input type="email" value={contact.email ?? ''} onChange={e => updateContact(contact.id, 'email', e.target.value)}
                              placeholder="Email" className="px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                            <input type="tel" value={contact.phone ?? ''} onChange={e => updateContact(contact.id, 'phone', e.target.value)}
                              placeholder="Phone" className="px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                            <input type="text" value={contact.title ?? ''} onChange={e => updateContact(contact.id, 'title', e.target.value)}
                              placeholder="Title" className="col-span-2 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save / Cancel */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <button onClick={saveEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={cancelEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ===== READ MODE ===== */
              <>
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</h4>
                  {[
                    { icon: Star, label: selected.contact_name },
                    { icon: Mail, label: selected.contact_email },
                    { icon: Phone, label: selected.contact_phone },
                    { icon: MapPin, label: selected.city && selected.state ? `${selected.city}, ${selected.state}` : null },
                    { icon: Globe, label: selected.website_url },
                  ].filter(item => item.label).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {item.label?.startsWith('http') ? (
                        <a href={item.label} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          {item.label.replace('https://', '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-700">{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Additional Contacts */}
                {(selected.contacts?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Team Contacts</h4>
                    <div className="space-y-2">
                      {selected.contacts!.map(c => (
                        <div key={c.id} className="flex items-start gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">{c.first_name[0]}{c.last_name[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700">{c.first_name} {c.last_name}</p>
                            {c.title && <p className="text-xs text-slate-500">{c.title}</p>}
                            <div className="flex items-center gap-3 mt-0.5">
                              {c.email && <span className="text-xs text-slate-500">{c.email}</span>}
                              {c.phone && <span className="text-xs text-slate-500">{c.phone}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selected.notes && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{selected.notes}</p>
                  </div>
                )}

                {/* Linked Matrices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing Matrices</h4>
                  {(() => {
                    const vendorMatrices = matrices.filter(m =>
                      m.name.toLowerCase().includes(selected.name.toLowerCase().split(' ')[0])
                    )
                    return vendorMatrices.length > 0 ? (
                      <div className="space-y-2">
                        {vendorMatrices.map(m => (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                              <Grid3x3 className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">{m.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{m.method} · {m.tier_count} tiers</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No pricing matrices linked.</p>
                    )
                  })()}
                </div>

                {/* ===== G9: Related Projects ===== */}
                {(() => {
                  const allProjects = getDemoProjects()
                  const relatedProjects = allProjects.filter(p => {
                    const lineItems = p.line_items?.length ? p.line_items : getDemoProjectLineItems(p.id)
                    return lineItems.some(li =>
                      li.decorations.some(d =>
                        d.vendor_id === selected.id ||
                        (d.vendor_name && d.vendor_name.toLowerCase() === selected.name.toLowerCase())
                      )
                    )
                  })
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Related Projects</h4>
                      </div>
                      {relatedProjects.length > 0 ? (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Project</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Client</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Status</th>
                                <th className="text-right px-3 py-2 text-slate-500 font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {relatedProjects.map(p => {
                                const ss = PROJECT_STATUS_STYLES[p.status] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }
                                return (
                                  <tr key={p.id} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="px-3 py-2 font-medium text-slate-700">{p.name}</td>
                                    <td className="px-3 py-2 text-slate-600">{p.client_name}</td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ss.bg} ${ss.text}`}>
                                        {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-700">
                                      ${(p.estimated_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No projects linked to this vendor.</p>
                      )}
                    </div>
                  )
                })()}

                {/* ===== G10: Related Tickets (decorators only) ===== */}
                {(selected.type === 'decorator' || selected.type === 'both') && (() => {
                  const allTickets = getDemoTickets()
                  const vendorTickets = allTickets.filter(t => t.linked_vendor_id === selected.id)
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-slate-400" />
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tickets</h4>
                        {vendorTickets.length > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
                            {vendorTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length} active
                          </span>
                        )}
                      </div>
                      {vendorTickets.length > 0 ? (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Ticket</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Type</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Fault</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Status</th>
                                <th className="text-left px-3 py-2 text-slate-500 font-medium">Project</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {vendorTickets.map(t => {
                                const ts = TICKET_STATUS_STYLES[t.status]
                                const fs = TICKET_FAULT_STYLES[t.fault]
                                return (
                                  <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 font-medium text-slate-700">{t.name || t.id}</td>
                                    <td className="px-3 py-2">
                                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                        {TICKET_TYPE_LABELS[t.type]}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${fs.bg} ${fs.text}`}>
                                        {TICKET_FAULT_LABELS[t.fault]}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ts.bg} ${ts.text}`}>
                                        {TICKET_STATUS_LABELS[t.status]}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600">{t.project_name}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No tickets linked to this vendor.</p>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
