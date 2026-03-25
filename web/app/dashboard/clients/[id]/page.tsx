"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import DataTable, { Column } from '@/components/shared/DataTable'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import {
  getDemoClients,
  getDemoProjects,
  getDemoOrders,
  getDemoProjectLineItems,
  getDemoAddressBooks,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '@/lib/demo/demo-data-provider'
import { CONTACT_TYPE_LABELS, US_STATES } from '@/lib/constants/app'
import type { Project, ProjectLineItem, Order, ClientContact, ContactRole, ContactType, AddressBook, AddressBookFolder } from '@/lib/types/app'
import {
  ArrowLeft,
  Building2,
  Users,
  Zap,
  FolderPlus,
  ShoppingCart,
  Mail,
  Phone,
  Star,
  Plus,
  CreditCard,
  DollarSign,
  BarChart3,
  RotateCcw,
  MapPin,
  ChevronDown,
  Upload,
  FileImage,
  Palette,
  Pencil,
  Trash2,
  Globe,
  Image,
  MessageSquare,
  Paperclip,
  FileText,
  Download,
  AlertCircle,
  Send,
} from 'lucide-react'

// ===== ADD CONTACT FORM =====

interface AddContactForm {
  name: string
  email: string
  phone: string
  role: ContactRole
  contact_type: ContactType
}

const INITIAL_CONTACT_FORM: AddContactForm = {
  name: '',
  email: '',
  phone: '',
  role: 'other',
  contact_type: 'general',
}

const CONTACT_TYPE_STYLES: Record<ContactType, string> = {
  order: 'bg-blue-100 text-blue-700',
  finance: 'bg-emerald-100 text-emerald-700',
  shipping: 'bg-violet-100 text-violet-700',
  billing: 'bg-orange-100 text-orange-700',
  general: 'bg-slate-100 text-slate-600',
  other: 'bg-gray-100 text-gray-600',
}

const ROLE_LABELS: Record<ContactRole, string> = {
  primary: 'Primary',
  billing: 'Billing',
  shipping: 'Shipping',
  finance: 'Finance',
  all: 'All',
  other: 'Other',
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const clientId = params.id as string

  // Load demo data
  const clients = useMemo(() => getDemoClients(), [])
  const allProjects = useMemo(() => getDemoProjects(), [])
  const allOrders = useMemo(() => getDemoOrders(), [])

  const client = clients.find(c => c.id === clientId)

  // Mutable contacts state (initialized from demo client)
  const [contacts, setContacts] = useState<ClientContact[]>(() =>
    client ? [...client.contacts] : []
  )

  // Tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'orders' | 'addresses' | 'art-library' | 'crm'>('projects')

  // Address book data
  const addressBook = useMemo(() => getDemoAddressBooks(clientId), [clientId])
  const totalAddresses = addressBook.folders.reduce((sum, f) => sum + f.entries.length, 0)

  // Folder accordion state
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set(addressBook.folders.map(f => f.id)))

  // ===== ADDRESS BOOK MANAGEMENT STATE (F5) =====
  const [addressFolders, setAddressFolders] = useState(() => [...addressBook.folders])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(addressBook.folders[0]?.id || null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renameFolderValue, setRenameFolderValue] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [internationalMode, setInternationalMode] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: '', street: '', street2: '', city: '', state: '', zip: '', country: 'USA',
    contact_name: '', contact_phone: '',
  })
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvPreview, setCsvPreview] = useState<{ label: string; street: string; city: string; state: string; zip: string }[]>([])

  const totalAddressesMutable = addressFolders.reduce((sum, f) => sum + f.entries.length, 0)

  // ===== ART LIBRARY STATE (F6) =====
  interface ArtFile { id: string; name: string; folder_id: string; uploaded_at: string }
  interface ArtFolder { id: string; name: string; files: ArtFile[] }
  const [artFolders, setArtFolders] = useState<ArtFolder[]>([
    { id: 'art-branding', name: 'Branding', files: [
      { id: 'af-1', name: 'brand-guidelines-v3.pdf', folder_id: 'art-branding', uploaded_at: '2026-02-10' },
      { id: 'af-2', name: 'color-palette.ai', folder_id: 'art-branding', uploaded_at: '2026-02-08' },
    ]},
    { id: 'art-logos', name: 'Logos', files: [
      { id: 'af-3', name: 'logo-primary.svg', folder_id: 'art-logos', uploaded_at: '2026-01-25' },
      { id: 'af-4', name: 'logo-white.png', folder_id: 'art-logos', uploaded_at: '2026-01-25' },
      { id: 'af-5', name: 'logo-icon-only.svg', folder_id: 'art-logos', uploaded_at: '2026-01-20' },
    ]},
  ])
  const [selectedArtFolderId, setSelectedArtFolderId] = useState('art-branding')
  const [showCreateArtFolder, setShowCreateArtFolder] = useState(false)
  const [newArtFolderName, setNewArtFolderName] = useState('')

  // ===== CRM STATE (G12) =====
  interface CrmNote { id: string; author: string; content: string; created_at: string }
  interface CrmAttachment { id: string; name: string; uploaded_at: string }
  const [crmNotes, setCrmNotes] = useState<CrmNote[]>([
    { id: 'crm-n1', author: 'Trevor Sarver', content: 'Initial onboarding call completed. Client prefers email communication over phone.', created_at: '2026-01-15T10:00:00Z' },
    { id: 'crm-n2', author: 'Sarah Chen', content: 'Discussed Q2 uniform rollout timeline. They need 43 locations covered. Shipping is the main concern.', created_at: '2026-02-02T14:30:00Z' },
  ])
  const [crmAttachments, setCrmAttachments] = useState<CrmAttachment[]>([
    { id: 'crm-a1', name: 'brand-guidelines-2026.pdf', uploaded_at: '2026-01-15' },
    { id: 'crm-a2', name: 'approved-logo-pack.zip', uploaded_at: '2026-01-20' },
  ])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteAuthor] = useState('Trevor Sarver')

  // ===== TAX EXEMPT DOC STATE (G13) =====
  interface TaxExemptDoc { id: string; name: string; uploaded_at: string }
  const [taxExemptDocs, setTaxExemptDocs] = useState<TaxExemptDoc[]>(() =>
    client?.tax_exempt ? [{ id: 'ted-1', name: 'tax-exempt-certificate.pdf', uploaded_at: '2025-12-01' }] : []
  )
  const [isDraggingTaxDoc, setIsDraggingTaxDoc] = useState(false)

  // ===== BILLING ADDRESS INTERNATIONAL MODE (G14) =====
  const [billingInternational, setBillingInternational] = useState(false)

  // Modal state
  const [showAddContact, setShowAddContact] = useState(false)
  const [contactForm, setContactForm] = useState<AddContactForm>({ ...INITIAL_CONTACT_FORM })

  // Reorder state
  const [reorderProject, setReorderProject] = useState<Project | null>(null)
  const [reorderItems, setReorderItems] = useState<ProjectLineItem[]>([])
  const [reorderQtyOverrides, setReorderQtyOverrides] = useState<Record<string, number>>({})

  // Filter projects and orders for this client
  const clientProjects = useMemo(
    () => allProjects.filter(p => p.client_id === clientId),
    [allProjects, clientId]
  )

  // Orders are linked to clients via projects — get all project IDs for this client,
  // then filter orders by those project IDs
  const clientProjectIds = useMemo(
    () => new Set(clientProjects.map(p => p.id)),
    [clientProjects]
  )
  const clientOrders = useMemo(
    () => allOrders.filter(o => clientProjectIds.has(o.project_id)),
    [allOrders, clientProjectIds]
  )

  // Compute stats
  const totalProjects = clientProjects.length
  const totalRevenue = clientProjects.reduce((sum, p) => sum + (p.estimated_total || 0), 0)
  const avgDealSize = totalProjects > 0 ? Math.round(totalRevenue / totalProjects) : 0

  // Handle add contact
  const handleAddContact = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      showToast('Name and email are required', 'alert')
      return
    }

    const newContact: ClientContact = {
      id: `contact-${Date.now()}`,
      client_id: clientId,
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim() || undefined,
      role: contactForm.role,
      contact_type: contactForm.contact_type,
      is_primary: false,
    }

    setContacts(prev => [...prev, newContact])
    showToast(`Contact "${newContact.name}" added`, 'action')
    setShowAddContact(false)
    setContactForm({ ...INITIAL_CONTACT_FORM })
  }

  // ===== ADDRESS BOOK HANDLERS (F5) =====
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const folder: AddressBookFolder = { id: `folder-${Date.now()}`, name: newFolderName.trim(), entries: [] }
    setAddressFolders(prev => [...prev, folder])
    setSelectedFolderId(folder.id)
    setNewFolderName('')
    setShowCreateFolder(false)
    showToast(`Folder "${folder.name}" created`, 'action')
  }

  const handleRenameFolder = (folderId: string) => {
    if (!renameFolderValue.trim()) return
    setAddressFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: renameFolderValue.trim() } : f))
    setRenamingFolderId(null)
    setRenameFolderValue('')
    showToast('Folder renamed', 'action')
  }

  const handleAddAddress = () => {
    if (!selectedFolderId || !addressForm.label.trim() || !addressForm.street.trim()) {
      showToast('Label and street are required', 'alert')
      return
    }
    const entry: AddressBookFolder['entries'][number] = {
      id: `addr-${Date.now()}`,
      label: addressForm.label.trim(),
      address: {
        street: addressForm.street.trim(),
        street2: addressForm.street2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zip: addressForm.zip.trim(),
        country: internationalMode ? addressForm.country.trim() : 'USA',
      },
      contact_name: addressForm.contact_name.trim() || undefined,
      contact_phone: addressForm.contact_phone.trim() || undefined,
      is_default: false,
    }
    setAddressFolders(prev => prev.map(f =>
      f.id === selectedFolderId ? { ...f, entries: [...f.entries, entry] } : f
    ))
    setAddressForm({ label: '', street: '', street2: '', city: '', state: '', zip: '', country: 'USA', contact_name: '', contact_phone: '' })
    setShowAddAddress(false)
    showToast(`Address "${entry.label}" added`, 'action')
  }

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { showToast('CSV needs at least a header and one row', 'alert'); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const labelIdx = headers.findIndex(h => h === 'label' || h === 'name' || h === 'location')
      const streetIdx = headers.findIndex(h => h === 'street' || h === 'address')
      const cityIdx = headers.findIndex(h => h === 'city')
      const stateIdx = headers.findIndex(h => h === 'state')
      const zipIdx = headers.findIndex(h => h === 'zip' || h === 'zipcode' || h === 'postal')
      const rows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim())
        return {
          label: labelIdx >= 0 ? cols[labelIdx] || '' : '',
          street: streetIdx >= 0 ? cols[streetIdx] || '' : '',
          city: cityIdx >= 0 ? cols[cityIdx] || '' : '',
          state: stateIdx >= 0 ? cols[stateIdx] || '' : '',
          zip: zipIdx >= 0 ? cols[zipIdx] || '' : '',
        }
      }).filter(r => r.label || r.street)
      setCsvPreview(rows)
      setShowCsvImport(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmCsvImport = () => {
    if (!selectedFolderId || csvPreview.length === 0) return
    const newEntries = csvPreview.map((row, i) => ({
      id: `csv-addr-${Date.now()}-${i}`,
      label: row.label || `Address ${i + 1}`,
      address: { street: row.street, city: row.city, state: row.state, zip: row.zip, country: 'USA' },
      is_default: false,
    }))
    setAddressFolders(prev => prev.map(f =>
      f.id === selectedFolderId ? { ...f, entries: [...f.entries, ...newEntries] } : f
    ))
    setCsvPreview([])
    setShowCsvImport(false)
    showToast(`Imported ${newEntries.length} addresses`, 'action')
  }

  // ===== ART LIBRARY HANDLERS (F6) =====
  const handleCreateArtFolder = () => {
    if (!newArtFolderName.trim()) return
    const folder: ArtFolder = { id: `art-${Date.now()}`, name: newArtFolderName.trim(), files: [] }
    setArtFolders(prev => [...prev, folder])
    setSelectedArtFolderId(folder.id)
    setNewArtFolderName('')
    setShowCreateArtFolder(false)
    showToast(`Art folder "${folder.name}" created`, 'action')
  }

  const selectedArtFolder = artFolders.find(f => f.id === selectedArtFolderId)

  // Handle reorder
  const handleOpenReorder = (project: Project) => {
    const items = project.line_items?.length
      ? project.line_items
      : getDemoProjectLineItems(project.id)
    setReorderItems(items)
    const overrides: Record<string, number> = {}
    items.forEach(li => { overrides[li.id] = li.total_quantity })
    setReorderQtyOverrides(overrides)
    setReorderProject(project)
  }

  // ===== PROJECT TABLE COLUMNS =====
  const projectColumns: Column<Project>[] = useMemo(() => [
    {
      key: 'project_number',
      header: 'Project #',
      width: '15%',
      render: (row) => (
        <span className="font-mono text-sm text-slate-700">{row.project_number}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '30%',
      render: (row) => (
        <span className="text-sm font-medium text-slate-900">{row.name}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      render: (row) => {
        const style = PROJECT_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {PROJECT_STATUS_LABELS[row.status]}
          </span>
        )
      },
    },
    {
      key: 'estimated_total',
      header: 'Est. Total',
      width: '17%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono text-slate-700">
          ${(row.estimated_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'in_hands_date',
      header: 'Project Deadline',
      width: '15%',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {row.in_hands_date
            ? new Date(row.in_hands_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '--'}
        </span>
      ),
    },
    {
      key: 'reorder',
      header: '',
      width: '10%',
      align: 'center',
      render: (row) => {
        const reorderableStatuses = ['confirmed', 'order-entry', 'in-production', 'shipped']
        if (!reorderableStatuses.includes(row.status)) return null
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenReorder(row) }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reorder
          </button>
        )
      },
    },
  ], [])

  // ===== ORDER TABLE COLUMNS =====
  const orderColumns: Column<Order>[] = useMemo(() => [
    {
      key: 'order_number',
      header: 'Order #',
      width: '15%',
      render: (row) => (
        <span className="font-mono text-sm text-slate-700">{row.order_number}</span>
      ),
    },
    {
      key: 'product_name',
      header: 'Product',
      width: '28%',
      render: (row) => (
        <span className="text-sm font-medium text-slate-900">{row.product_name}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      render: (row) => {
        const style = ORDER_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {ORDER_STATUS_LABELS[row.status]}
          </span>
        )
      },
    },
    {
      key: 'total',
      header: 'Total',
      width: '17%',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-mono text-slate-700">
          ${row.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'ship_date',
      header: 'Ship Date',
      width: '22%',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {row.shipped_date
            ? new Date(row.shipped_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : row.in_hands_date
              ? new Date(row.in_hands_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '--'}
        </span>
      ),
    },
  ], [])

  // ===== NOT FOUND STATE =====
  if (!client) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard/clients')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <p className="text-lg font-medium text-slate-900">Client not found</p>
          <p className="text-sm text-slate-500 mt-1">The client you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  // ===== PAYMENT TERMS LABEL =====
  const paymentTermsLabel: Record<string, string> = {
    prepay: 'Prepay',
    net15: 'Net 15',
    net30: 'Net 30',
    net45: 'Net 45',
    net60: 'Net 60',
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/clients')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Page Header with industry badge */}
      <PageHeader
        title={client.company_name}
        subtitle={client.industry || 'No industry specified'}
        action={
          client.industry ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              <Building2 className="w-3.5 h-3.5" />
              {client.industry}
            </span>
          ) : undefined
        }
      />

      {/* ===== TOP SECTION: 3 STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Projects</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{totalProjects}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <AnimatedCounter
                value={totalRevenue}
                prefix="$"
                duration={1}
                className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block"
              />
            </div>
          </div>
        </div>

        {/* Average Deal Size */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-primary-200 font-medium">Avg Deal Size</p>
              <AnimatedCounter
                value={avgDealSize}
                prefix="$"
                duration={1}
                className="text-2xl font-bold font-mono text-white mt-0.5 block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== 3-COLUMN LAYOUT: Company Info | Contacts | Quick Actions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Company Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Company Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">Industry</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">{client.industry || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Payment Terms</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {paymentTermsLabel[client.payment_terms] || client.payment_terms}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Credit Limit</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {client.credit_limit ? `$${client.credit_limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tax Exempt</p>
              <p className="text-sm font-medium mt-0.5">
                {client.tax_exempt ? (
                  <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Yes</span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">No</span>
                )}
              </p>
            </div>
            {/* ===== G13: Tax Exempt Document Upload ===== */}
            {client.tax_exempt && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Tax Exempt Documentation</p>
                {taxExemptDocs.length === 0 && (
                  <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-[10px] text-amber-700 font-medium">No certificate uploaded. Tax exempt status requires documentation.</p>
                  </div>
                )}
                {taxExemptDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => showToast('Download available in production', 'alert')} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDraggingTaxDoc(true) }}
                  onDragLeave={() => setIsDraggingTaxDoc(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setIsDraggingTaxDoc(false)
                    const newDoc: TaxExemptDoc = {
                      id: `ted-${Date.now()}`,
                      name: 'tax-exempt-certificate.pdf',
                      uploaded_at: new Date().toISOString().slice(0, 10),
                    }
                    setTaxExemptDocs(prev => [...prev, newDoc])
                    showToast('Certificate uploaded (mock)', 'action')
                  }}
                  onClick={() => {
                    const newDoc: TaxExemptDoc = {
                      id: `ted-${Date.now()}`,
                      name: `certificate-${new Date().toISOString().slice(0, 10)}.pdf`,
                      uploaded_at: new Date().toISOString().slice(0, 10),
                    }
                    setTaxExemptDocs(prev => [...prev, newDoc])
                    showToast('Certificate uploaded (mock)', 'action')
                  }}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    isDraggingTaxDoc
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/20'
                  }`}
                >
                  <Upload className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Drop certificate here or click to upload</p>
                </div>
              </div>
            )}
            {/* ===== G14: Billing Address with International Toggle ===== */}
            {client.billing_address && (
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs text-slate-400">Billing Address</p>
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingInternational}
                      onChange={e => setBillingInternational(e.target.checked)}
                      className="w-3 h-3 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Globe className="w-2.5 h-2.5" /> Intl
                  </label>
                </div>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                  {client.billing_address.street}
                  {client.billing_address.street2 && <><br />{client.billing_address.street2}</>}
                  <br />
                  {client.billing_address.city}, {client.billing_address.state} {client.billing_address.zip}
                  {(billingInternational || client.billing_address.country !== 'USA') && (
                    <><br />{client.billing_address.country}</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Contacts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Contacts</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>
          {contacts.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No contacts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{contact.name}</span>
                      {contact.contact_type && (
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CONTACT_TYPE_STYLES[contact.contact_type]}`}>
                          {CONTACT_TYPE_LABELS[contact.contact_type]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {contact.is_primary && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          <Star className="w-3 h-3" /> Primary
                        </span>
                      )}
                      <span className="inline-flex px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-medium capitalize">
                        {ROLE_LABELS[contact.role]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-semibold">New Project</p>
                <p className="text-xs text-primary-200">Start a new project for this client</p>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('orders')
                showToast(`Showing ${clientOrders.length} orders for ${client.company_name}`, 'action')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-slate-500" />
              <div className="text-left">
                <p className="text-sm font-semibold">View Orders</p>
                <p className="text-xs text-slate-500">{clientOrders.length} order{clientOrders.length !== 1 ? 's' : ''} on file</p>
              </div>
            </button>
          </div>

          {/* Additional info summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            {client.annual_volume && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Annual Volume</span>
                <span className="font-mono font-medium text-slate-900">${client.annual_volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-700">
                {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS: Projects | Orders | Addresses | Art Library ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200">
          {([
            { key: 'projects' as const, label: `Projects (${clientProjects.length})` },
            { key: 'orders' as const, label: `Orders (${clientOrders.length})` },
            { key: 'addresses' as const, label: `Addresses (${totalAddressesMutable})`, icon: <MapPin className="w-3.5 h-3.5" /> },
            { key: 'art-library' as const, label: 'Art Library', icon: <Palette className="w-3.5 h-3.5" /> },
            { key: 'crm' as const, label: 'CRM', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab.key ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon ? (
                <span className="inline-flex items-center gap-1.5">{tab.icon}{tab.label}</span>
              ) : tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === 'projects' && (
            <DataTable
              columns={projectColumns}
              data={clientProjects}
              onRowClick={(row) => router.push(`/dashboard/projects/${row.id}`)}
              rowKey={(row) => row.id}
              emptyMessage="No projects for this client yet"
            />
          )}
          {activeTab === 'orders' && (
            <DataTable
              columns={orderColumns}
              data={clientOrders}
              rowKey={(row) => row.id}
              emptyMessage="No orders for this client yet"
            />
          )}

          {/* ===== ADDRESSES TAB (F5) ===== */}
          {activeTab === 'addresses' && (
            <div className="flex min-h-[400px]">
              {/* Folder sidebar */}
              <div className="w-56 border-r border-slate-200 bg-slate-50/50 p-3 space-y-1">
                {addressFolders.map(folder => (
                  <div key={folder.id}>
                    {renamingFolderId === folder.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={renameFolderValue}
                          onChange={e => setRenameFolderValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id); if (e.key === 'Escape') setRenamingFolderId(null) }}
                          className="flex-1 px-2 py-1 text-xs border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button onClick={() => handleRenameFolder(folder.id)} className="text-primary-600 hover:text-primary-700">
                          <Plus className="w-3.5 h-3.5 rotate-45" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        onDoubleClick={() => { setRenamingFolderId(folder.id); setRenameFolderValue(folder.name) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                          selectedFolderId === folder.id
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{folder.name}</span>
                        <span className="text-xs text-slate-400 ml-1">{folder.entries.length}</span>
                      </button>
                    )}
                  </div>
                ))}
                {showCreateFolder ? (
                  <div className="flex items-center gap-1 mt-2">
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowCreateFolder(false) }}
                      placeholder="Folder name..."
                      className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button onClick={handleCreateFolder} className="text-primary-600 hover:text-primary-700"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-primary-600 transition-colors mt-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New Folder
                  </button>
                )}
              </div>

              {/* Address content area */}
              <div className="flex-1 p-5">
                {/* Action bar */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {addressFolders.find(f => f.id === selectedFolderId)?.name || 'Select a folder'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Import CSV
                      <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" />
                    </label>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>
                </div>

                {/* Address entries */}
                {(() => {
                  const folder = addressFolders.find(f => f.id === selectedFolderId)
                  if (!folder || folder.entries.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No addresses in this folder</p>
                        <p className="text-xs text-slate-400 mt-1">Add an address or import from CSV</p>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-2">
                      {folder.entries.map(entry => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{entry.label}</span>
                              {entry.is_default && (
                                <span className="inline-flex px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {entry.address.street}{entry.address.street2 && `, ${entry.address.street2}`}, {entry.address.city}, {entry.address.state} {entry.address.zip}
                              {entry.address.country !== 'USA' && `, ${entry.address.country}`}
                            </p>
                            {(entry.contact_name || entry.contact_phone) && (
                              <p className="text-xs text-slate-400 mt-1">
                                {entry.contact_name}{entry.contact_name && entry.contact_phone && ' \u2014 '}{entry.contact_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Add Address Inline Form */}
                {showAddAddress && (
                  <div className="mt-4 p-4 border border-primary-200 rounded-lg bg-primary-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-700">New Address</h4>
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={internationalMode}
                          onChange={e => setInternationalMode(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Globe className="w-3 h-3" /> International
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          value={addressForm.label}
                          onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))}
                          placeholder="Label (e.g. Nashville HQ)"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={addressForm.street}
                          onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))}
                          placeholder="Street address"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={addressForm.street2}
                          onChange={e => setAddressForm(p => ({ ...p, street2: e.target.value }))}
                          placeholder="Street Line 2 (Suite, Unit, etc.)"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        value={addressForm.city}
                        onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {internationalMode ? (
                        <input
                          value={addressForm.state}
                          onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                          placeholder="State / Province"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <select
                          value={addressForm.state}
                          onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select state...</option>
                          {US_STATES.map(s => (
                            <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                          ))}
                        </select>
                      )}
                      <input
                        value={addressForm.zip}
                        onChange={e => setAddressForm(p => ({ ...p, zip: e.target.value }))}
                        placeholder="ZIP / Postal"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {internationalMode && (
                        <input
                          value={addressForm.country}
                          onChange={e => setAddressForm(p => ({ ...p, country: e.target.value }))}
                          placeholder="Country"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                      <input
                        value={addressForm.contact_name}
                        onChange={e => setAddressForm(p => ({ ...p, contact_name: e.target.value }))}
                        placeholder="Contact name (optional)"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        value={addressForm.contact_phone}
                        onChange={e => setAddressForm(p => ({ ...p, contact_phone: e.target.value }))}
                        placeholder="Contact phone (optional)"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button onClick={() => setShowAddAddress(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                      <button onClick={handleAddAddress} className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors">Save Address</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== ART LIBRARY TAB (F6) ===== */}
          {activeTab === 'art-library' && (
            <div className="flex min-h-[400px]">
              {/* Folder sidebar */}
              <div className="w-56 border-r border-slate-200 bg-slate-50/50 p-3 space-y-1">
                {artFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedArtFolderId(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedArtFolderId === folder.id
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{folder.name}</span>
                    <span className="text-xs text-slate-400 ml-1">{folder.files.length}</span>
                  </button>
                ))}
                {showCreateArtFolder ? (
                  <div className="flex items-center gap-1 mt-2">
                    <input
                      autoFocus
                      value={newArtFolderName}
                      onChange={e => setNewArtFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCreateArtFolder(); if (e.key === 'Escape') setShowCreateArtFolder(false) }}
                      placeholder="Folder name..."
                      className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button onClick={handleCreateArtFolder} className="text-primary-600 hover:text-primary-700"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateArtFolder(true)}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-primary-600 transition-colors mt-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New Folder
                  </button>
                )}
              </div>

              {/* Art content area */}
              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">{selectedArtFolder?.name || 'Select a folder'}</h3>
                  <button
                    onClick={() => showToast('File upload available in production', 'alert')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:border-primary-300 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Files
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center mb-4 hover:border-primary-300 hover:bg-primary-50/20 transition-colors cursor-pointer"
                  onClick={() => showToast('Drag-and-drop upload available in production', 'alert')}
                >
                  <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Drag and drop files here, or click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, SVG, AI, PSD, PDF up to 50MB</p>
                </div>

                {/* File grid */}
                {selectedArtFolder && selectedArtFolder.files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedArtFolder.files.map(file => (
                      <div key={file.id} className="group border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-slate-100 flex items-center justify-center">
                          {file.name.match(/\.(svg|png|jpg|jpeg)$/i)
                            ? <Image className="w-10 h-10 text-slate-300" />
                            : <FileImage className="w-10 h-10 text-slate-300" />
                          }
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No files in this folder</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== CRM TAB (G12) ===== */}
          {activeTab === 'crm' && (
            <div className="p-6 space-y-6">
              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
                    <span className="text-xs text-slate-400">({crmNotes.length})</span>
                  </div>
                </div>

                {/* Existing Notes */}
                {crmNotes.length > 0 ? (
                  <div className="space-y-2">
                    {crmNotes.map(note => (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-700">{note.author}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No notes yet.</p>
                )}

                {/* Add Note Form */}
                <div className="border border-primary-200 rounded-lg bg-primary-50/20 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-primary-600" />
                    <span className="text-xs font-semibold text-slate-700">Add Note</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Author:</span>
                    <span className="font-medium text-slate-700">{newNoteAuthor}</span>
                  </div>
                  <textarea
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Write a note about this client..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (!newNoteContent.trim()) return
                        const note: CrmNote = {
                          id: `crm-n-${Date.now()}`,
                          author: newNoteAuthor,
                          content: newNoteContent.trim(),
                          created_at: new Date().toISOString(),
                        }
                        setCrmNotes(prev => [...prev, note])
                        setNewNoteContent('')
                        showToast('Note added', 'action')
                      }}
                      disabled={!newNoteContent.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Save Note
                    </button>
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-700">Attachments</h3>
                    <span className="text-xs text-slate-400">({crmAttachments.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      const newFile: CrmAttachment = {
                        id: `crm-a-${Date.now()}`,
                        name: `document-${new Date().toISOString().slice(0, 10)}.pdf`,
                        uploaded_at: new Date().toISOString().slice(0, 10),
                      }
                      setCrmAttachments(prev => [...prev, newFile])
                      showToast('File uploaded (mock)', 'action')
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:border-primary-300 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                </div>
                {crmAttachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {crmAttachments.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:shadow-sm transition-shadow">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Uploaded {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => showToast('Download available in production', 'alert')}
                          className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No attachments yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== CSV IMPORT PREVIEW MODAL ===== */}
      <Modal
        isOpen={showCsvImport}
        onClose={() => { setShowCsvImport(false); setCsvPreview([]) }}
        title="CSV Import Preview"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => { setShowCsvImport(false); setCsvPreview([]) }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
            <button
              onClick={handleConfirmCsvImport}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Import {csvPreview.length} Address{csvPreview.length !== 1 ? 'es' : ''}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Importing into folder: <span className="font-semibold text-slate-700">{addressFolders.find(f => f.id === selectedFolderId)?.name}</span>
          </p>
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">Label</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">Street</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">City</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">State</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">ZIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csvPreview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-700">{row.label || '--'}</td>
                    <td className="px-3 py-2 text-slate-700">{row.street || '--'}</td>
                    <td className="px-3 py-2 text-slate-700">{row.city || '--'}</td>
                    <td className="px-3 py-2 text-slate-700">{row.state || '--'}</td>
                    <td className="px-3 py-2 text-slate-700">{row.zip || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* ===== ADD CONTACT MODAL ===== */}
      <Modal
        isOpen={showAddContact}
        onClose={() => { setShowAddContact(false); setContactForm({ ...INITIAL_CONTACT_FORM }) }}
        title="Add Contact"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setShowAddContact(false); setContactForm({ ...INITIAL_CONTACT_FORM }) }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddContact}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Add Contact
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={contactForm.name}
              onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jane Smith"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="e.g. jane@company.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={contactForm.phone}
              onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 615-555-1234"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={contactForm.role}
              onChange={e => setContactForm(prev => ({ ...prev, role: e.target.value as ContactRole }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="primary">Primary</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="finance">Finance</option>
              <option value="all">All</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Type</label>
            <select
              value={contactForm.contact_type}
              onChange={e => setContactForm(prev => ({ ...prev, contact_type: e.target.value as ContactType }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {(Object.entries(CONTACT_TYPE_LABELS) as [ContactType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* ===== REORDER FROM HISTORY MODAL ===== */}
      <Modal
        isOpen={!!reorderProject}
        onClose={() => { setReorderProject(null); setReorderItems([]) }}
        title={`Reorder: ${reorderProject?.name ?? ''}`}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setReorderProject(null); setReorderItems([]) }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const totalNewQty = Object.values(reorderQtyOverrides).reduce((s, q) => s + q, 0)
                showToast(`New project created from "${reorderProject?.name}" — ${totalNewQty.toLocaleString()} units`, 'action')
                setReorderProject(null)
                setReorderItems([])
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Create New Project
              </span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Adjust quantities below and create a new project based on this previous order.
          </p>
          {reorderItems.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No line items found for this project.</p>
          ) : (
            <div className="space-y-3">
              {reorderItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-500">
                      {item.selected_color} &middot; Original qty: {item.total_quantity.toLocaleString()}
                      {item.decorations.length > 0 && (
                        <span> &middot; {item.decorations.length} decoration{item.decorations.length > 1 ? 's' : ''}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <label className="text-[10px] text-slate-400 font-medium">New Qty</label>
                    <input
                      type="number" onFocus={(e) => e.target.select()}
                      min={0}
                      value={reorderQtyOverrides[item.id] ?? item.total_quantity}
                      onChange={e => setReorderQtyOverrides(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                      className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  New total: <span className="font-semibold font-mono text-slate-700">{Object.values(reorderQtyOverrides).reduce((s, q) => s + q, 0).toLocaleString()} units</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
