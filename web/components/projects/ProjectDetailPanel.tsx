"use client"

import { useState, useMemo, useRef } from 'react'
import type {
  Project,
  ProjectStatus,
  ProjectSource,
  ProjectLineItem,
  CreativeRequest,
  ProjectFile,
  ProjectFileCategory,
  Client,
  ClientContact,
  ContactRole,
  AddressBook,
  AddressBookEntry,
  PaymentTerms,
  ProductionTime,
  SplitShipmentDestination,
  Ticket,
} from '@/lib/types/app'
import {
  getDemoProjectLineItems,
  getDemoCreativeRequests,
  getDemoProjectFiles,
  getDemoClients,
  getDemoAddressBooks,
  getDemoProductsFull,
  getDemoTickets,
} from '@/lib/demo/demo-data-provider'
import SlidePanel from '@/components/shared/SlidePanel'
import SplitShipmentBuilder from '@/components/dashboard/SplitShipmentBuilder'
import Portal from '@/components/shared/Portal'
import { calculateProjectTotal } from '@/lib/utils/quoting'
import { DECORATION_METHOD_LABELS, PRODUCT_TYPE_LABELS } from '@/lib/constants/app'
import ProjectStatusStepper from '@/components/shared/ProjectStatusStepper'
import { useToast } from '@/components/shared'
import CollabPresenceBar from './CollabPresenceBar'
import {
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Upload,
  Palette,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Truck,
  StickyNote,
  ToggleLeft,
  ToggleRight,
  ArrowLeftRight,
  Shield,
  ExternalLink,
  Bookmark,
  ClipboardList,
  Search,
  Image as ImageIcon,
  MessageCircle,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Ticket as TicketIcon,
} from 'lucide-react'
import POPreviewModal from './POPreviewModal'

// ===== PROPS =====

interface ProjectDetailPanelProps {
  project: Project
  onClose: () => void
  onSelectProduct?: (lineItem: ProjectLineItem) => void
  onSelectCreativeRequest?: (requestId: string) => void
  onStatusChange?: (projectId: string, status: ProjectStatus) => void
}

// ===== LABEL MAPS =====

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  prepay: 'Prepay',
  net15: 'Net 15',
  net30: 'Net 30',
  net45: 'Net 45',
  net60: 'Net 60',
}

const PRODUCTION_TIME_OPTIONS: { value: ProductionTime; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'rush', label: 'Rush' },
]

const CONTACT_ROLE_LABELS: Record<string, string> = {
  primary: 'Primary',
  billing: 'Billing',
  shipping: 'Shipping',
  finance: 'Finance',
  all: 'All',
  other: 'Other',
}

const CONTACT_ROLE_STYLES: Record<string, string> = {
  primary: 'bg-indigo-100 text-indigo-700',
  billing: 'bg-emerald-100 text-emerald-700',
  shipping: 'bg-sky-100 text-sky-700',
  finance: 'bg-amber-100 text-amber-700',
  all: 'bg-slate-100 text-slate-600',
  other: 'bg-gray-100 text-gray-500',
}

const PROJECT_SOURCE_OPTIONS: { value: ProjectSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'direct', label: 'Direct' },
  { value: 'referral', label: 'Referral' },
  { value: 'program', label: 'Program' },
]

const SOURCE_BADGE_STYLES: Record<ProjectSource, string> = {
  website: 'bg-emerald-100 text-emerald-700',
  referral: 'bg-purple-100 text-purple-700',
  program: 'bg-blue-100 text-blue-700',
  direct: 'bg-slate-100 text-slate-600',
}

const CREATIVE_REQUEST_TYPE_LABELS: Record<string, string> = {
  're-vector': 'Re-Vector',
  'mockup': 'Mockup',
  'full-deck': 'Full Deck',
  'color-separation': 'Color Separation',
  'other': 'Other',
}

const CREATIVE_REQUEST_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  review: { bg: 'bg-orange-100', text: 'text-orange-700' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

const CREATIVE_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  review: 'Review',
  approved: 'Approved',
  cancelled: 'Cancelled',
}

const FILE_CATEGORY_TABS: { key: ProjectFileCategory; label: string }[] = [
  { key: 'product-files', label: 'Product Files' },
  { key: 'client-art', label: 'Client Art' },
  { key: 'client-submitted', label: 'Client Submitted' },
  { key: 'decks', label: 'Decks' },
  { key: 'production-files', label: 'Production Files' },
  { key: 'miscellaneous', label: 'Misc' },
]

// ===== HELPERS =====

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAddress(entry: AddressBookEntry): string {
  const a = entry.address
  return `${a.street}, ${a.city}, ${a.state} ${a.zip}`
}

function buildDecorationSummary(item: ProjectLineItem): string {
  if (!item.decorations || item.decorations.length === 0) return 'No decoration'
  return item.decorations
    .map((dec) => {
      const method = DECORATION_METHOD_LABELS[dec.method] ?? dec.method
      const position = dec.position_label
      const colorInfo = dec.color_count > 0 ? ` (${dec.color_count} color${dec.color_count > 1 ? 's' : ''})` : ''
      const runChargeNames = (dec.run_charges ?? []).map((rc) => rc.name).filter(Boolean)
      const extras = runChargeNames.length > 0 ? ` + ${runChargeNames.join(', ')}` : ''
      return `${position}: ${method}${colorInfo}${extras}`
    })
    .join(' | ')
}

// ===== COMPONENT =====

export default function ProjectDetailPanel({
  project,
  onClose,
  onSelectProduct,
  onSelectCreativeRequest,
  onStatusChange,
}: ProjectDetailPanelProps) {
  // --- Data fetching ---
  const lineItems = useMemo(() => getDemoProjectLineItems(project.id), [project.id])
  const creativeRequests = useMemo(() => getDemoCreativeRequests(project.id), [project.id])
  const projectFiles = useMemo(() => getDemoProjectFiles(project.id), [project.id])
  const client = useMemo(() => {
    const clients = getDemoClients()
    return clients.find((c) => c.id === project.client_id) ?? null
  }, [project.client_id])
  const addressBook = useMemo(
    () => getDemoAddressBooks(project.client_id),
    [project.client_id]
  )
  const projectTotals = useMemo(() => calculateProjectTotal(lineItems), [lineItems])
  const projectTickets = useMemo(() => getDemoTickets().filter(t => t.project_id === project.id), [project.id])

  // --- Local state ---
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [activeFileTab, setActiveFileTab] = useState<ProjectFileCategory>('product-files')
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const allEntries = flattenAddressEntries(addressBook)
    const defaultEntry = allEntries.find((e) => e.is_default)
    return defaultEntry?.id ?? allEntries[0]?.id ?? ''
  })
  const [splitShip, setSplitShip] = useState(!!project.split_shipments?.length)
  const [showSplitBuilder, setShowSplitBuilder] = useState(false)
  const [localSplitShipments, setLocalSplitShipments] = useState<SplitShipmentDestination[]>(project.split_shipments ?? [])
  const [taxExempt, setTaxExempt] = useState(client?.tax_exempt ?? false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPO, setShowPO] = useState(false)
  const [changeRequestDismissed, setChangeRequestDismissed] = useState(false)

  // --- Interactive state (demo) ---
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inHandsDate, setInHandsDate] = useState(project.in_hands_date ?? '')
  const [deadlineDate, setDeadlineDate] = useState(project.project_deadline ?? '')
  const [shipDate, setShipDate] = useState(project.ship_date ?? '')
  const [budgetValue, setBudgetValue] = useState(project.budget ?? 0)
  const [productionTimeValue, setProductionTimeValue] = useState<ProductionTime>(project.production_time ?? 'standard')
  const [paymentTermsValue, setPaymentTermsValue] = useState<PaymentTerms>(client?.payment_terms ?? 'net30')
  const [internalNotesValue, setInternalNotesValue] = useState(project.internal_notes ?? '')
  const [estShippingCost, setEstShippingCost] = useState(project.estimated_shipping_cost ?? 0)
  const [clientFacingNotesValue, setClientFacingNotesValue] = useState(project.client_facing_notes ?? '')
  const [notesTab, setNotesTab] = useState<'client-facing' | 'internal'>('internal')
  const [commentInput, setCommentInput] = useState('')
  const [localComments, setLocalComments] = useState(project.comments ?? [
    { id: 'cmt-1', author: 'Trevor', message: 'Confirmed quantities with Raisin Canes HQ. Need final sizing by Friday.', created_at: '2026-02-28T14:30:00' },
    { id: 'cmt-2', author: 'Jeremy', message: 'Art files received. Sending to Culture Studio for proofs.', created_at: '2026-03-01T09:15:00' },
  ])
  const [filesViewMode, setFilesViewMode] = useState<'list' | 'grid'>('list')
  const [localFileStatuses, setLocalFileStatuses] = useState<Record<string, 'ok' | 'problem'>>(() => {
    const init: Record<string, 'ok' | 'problem'> = {}
    projectFiles.forEach((f) => { if (f.file_status) init[f.id] = f.file_status })
    return init
  })
  const [localFileProductLinks, setLocalFileProductLinks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    projectFiles.forEach((f) => { if (f.linked_product_id) init[f.id] = f.linked_product_id })
    // Pre-seed client-submitted files with product links for demo (FB-055)
    projectFiles.forEach((f) => {
      if (f.category === 'client-submitted' && !init[f.id]) {
        const items = getDemoProjectLineItems(f.project_id)
        if (items.length > 0) init[f.id] = items[0].id
      }
    })
    return init
  })
  const [sourceValue, setSourceValue] = useState<ProjectSource>(project.source)

  // Deck version notes (G23)
  const [deckVersionNotes, setDeckVersionNotes] = useState<Record<string, string>>({})

  // Payment state (G17)
  const [localPaymentStatus, setLocalPaymentStatus] = useState<'unpaid' | 'paid' | 'partial'>(project.payment_status ?? 'unpaid')
  const [localPaymentDetails, setLocalPaymentDetails] = useState<{ amount: number; method: string; date: string; reference?: string } | undefined>(project.payment_details)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('check')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  // --- Inline form states ---
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactRole, setNewContactRole] = useState<ContactRole>('other')
  const [localContacts, setLocalContacts] = useState<ClientContact[]>(client?.contacts ?? [])

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [addProductMode, setAddProductMode] = useState<'catalog' | 'quick'>('catalog')
  const [catalogSearch, setCatalogSearch] = useState('')
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState<string | null>(null)
  const [newProductName, setNewProductName] = useState('')
  const [newProductQty, setNewProductQty] = useState('')
  const [newProductBrand, setNewProductBrand] = useState('')
  const [newProductStyle, setNewProductStyle] = useState('')
  const [newProductPricingMode, setNewProductPricingMode] = useState<'contract' | 'all-in'>('contract')
  const [localLineItems, setLocalLineItems] = useState(lineItems)

  // Catalog products for the add-product panel
  const catalogProducts = useMemo(() => getDemoProductsFull(), [])

  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequestTitle, setNewRequestTitle] = useState('')
  const [newRequestType, setNewRequestType] = useState<CreativeRequest['type']>('single-mock')
  const [localCreativeRequests, setLocalCreativeRequests] = useState(creativeRequests)

  // Inline address form
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddrLabel, setNewAddrLabel] = useState('')
  const [newAddrStreet, setNewAddrStreet] = useState('')
  const [newAddrCity, setNewAddrCity] = useState('')
  const [newAddrState, setNewAddrState] = useState('')
  const [newAddrZip, setNewAddrZip] = useState('')
  const [localAddressEntries, setLocalAddressEntries] = useState<AddressBookEntry[]>(() => flattenAddressEntries(addressBook))

  // --- Derived ---
  const allAddressEntries = localAddressEntries
  const selectedAddress = allAddressEntries.find((e) => e.id === selectedAddressId)
  const filteredFiles = projectFiles.filter((f) => f.category === activeFileTab)
  const problemFileCount = projectFiles.filter(
    (f) => f.category === 'client-submitted' && localFileStatuses[f.id] === 'problem'
  ).length

  // --- Decoration location lookups (FB-019, FB-055, FB-057) ---
  // Build a map: decoration_id → { position_label, product_name, product_id }
  const decorationLookup = useMemo(() => {
    const map: Record<string, { position_label: string; product_name: string; product_id: string }> = {}
    localLineItems.forEach((li) => {
      li.decorations?.forEach((dec) => {
        map[dec.id] = {
          position_label: dec.position_label,
          product_name: li.product_name,
          product_id: li.id,
        }
      })
    })
    return map
  }, [localLineItems])

  // Enrich files with decoration locations for demo display.
  // Files that already have decoration_location_id use the lookup.
  // For files linked to a product but missing decoration_location_id,
  // infer the first decoration from that product's line item.
  const fileDecorationInfo = useMemo(() => {
    const map: Record<string, { decoration_label: string; product_name: string } | null> = {}
    projectFiles.forEach((f) => {
      // Direct decoration_location_id mapping
      if (f.decoration_location_id && decorationLookup[f.decoration_location_id]) {
        const info = decorationLookup[f.decoration_location_id]
        map[f.id] = { decoration_label: info.position_label, product_name: info.product_name }
        return
      }
      // Infer from linked product
      const productId = localFileProductLinks[f.id] || f.linked_product_id
      if (productId) {
        const li = localLineItems.find((item) => item.id === productId)
        if (li && li.decorations && li.decorations.length > 0) {
          map[f.id] = { decoration_label: li.decorations[0].position_label, product_name: li.product_name }
          return
        }
        if (li) {
          map[f.id] = { decoration_label: '', product_name: li.product_name }
          return
        }
      }
      map[f.id] = null
    })
    return map
  }, [projectFiles, decorationLookup, localFileProductLinks, localLineItems])

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Top Section: Status Stepper ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {project.project_number}
              <select
                value={sourceValue}
                onChange={(e) => {
                  setSourceValue(e.target.value as ProjectSource)
                  showToast(`Lead source updated to "${e.target.value}"`, 'action')
                }}
                className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide cursor-pointer border-0 outline-none appearance-none ${SOURCE_BADGE_STYLES[sourceValue]}`}
              >
                {PROJECT_SOURCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </span>
            <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
            {localContacts.length > 0 && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <User size={10} className="text-slate-400" />
                {localContacts[0].name}
              </p>
            )}
            {selectedAddress && (
              <div className="flex items-center gap-3 mt-0.5">
                {client && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CreditCard size={9} />
                    Bill: {client.company_name}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Truck size={9} />
                  Ship: {selectedAddress.address.city}, {selectedAddress.address.state}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast(`"${project.project_number}" saved as reusable template`, 'action')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Save as Template
            </button>
            <div className="text-right">
              <p className="text-xs text-slate-400">Estimated Total</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(projectTotals.totalPrice)}</p>
              <p className="text-xs text-emerald-600 font-medium">
                {projectTotals.avgMarginPercent}% margin
              </p>
            </div>
          </div>
        </div>
        <ProjectStatusStepper
          currentStatus={project.status}
          onStatusChange={
            onStatusChange
              ? (status) => onStatusChange(project.id, status)
              : undefined
          }
        />
      </div>

      {/* ── Collab Presence ── */}
      <CollabPresenceBar projectId={project.id} />

      {/* ── Change Request Banner ── */}
      {project.change_request_pending && !changeRequestDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-800">Client has requested changes</span>
          </div>
          <button
            onClick={() => {
              setChangeRequestDismissed(true)
              showToast('Change request dismissed', 'action')
            }}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-md transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {/* ── Comments Section ── */}
        <div className="px-6 pt-6 pb-4">
          <Card>
            <CardHeader icon={<MessageCircle size={16} />} title="Comments" />
            <div className="space-y-3">
              {/* Comment list */}
              {localComments.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {localComments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600">{comment.author.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800">{comment.author}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Comment input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentInput.trim()) {
                      setLocalComments(prev => [...prev, {
                        id: `cmt-${Date.now()}`,
                        author: 'You',
                        message: commentInput.trim(),
                        created_at: new Date().toISOString(),
                      }])
                      setCommentInput('')
                      showToast('Comment posted', 'action')
                    }
                  }}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                />
                <button
                  onClick={() => {
                    if (!commentInput.trim()) return
                    setLocalComments(prev => [...prev, {
                      id: `cmt-${Date.now()}`,
                      author: 'You',
                      message: commentInput.trim(),
                      created_at: new Date().toISOString(),
                    }])
                    setCommentInput('')
                    showToast('Comment posted', 'action')
                  }}
                  className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Notes Section (Client-Facing + Internal) ── */}
        <div className="px-6 pb-4">
          <Card>
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <StickyNote size={16} className="text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700">Notes</h4>
              </div>
              {notesExpanded ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </button>
            {notesExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setNotesTab('client-facing')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      notesTab === 'client-facing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Client-Facing
                  </button>
                  <button
                    onClick={() => setNotesTab('internal')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      notesTab === 'internal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Internal
                  </button>
                </div>
                {notesTab === 'client-facing' ? (
                  <textarea
                    value={clientFacingNotesValue}
                    onChange={(e) => setClientFacingNotesValue(e.target.value)}
                    onBlur={() => showToast('Client-facing notes saved', 'action')}
                    placeholder="Notes visible to the client on the portal..."
                    rows={3}
                    className="w-full text-sm text-slate-600 leading-relaxed border border-slate-200 rounded-lg px-3 py-2 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white"
                  />
                ) : (
                  <textarea
                    value={internalNotesValue}
                    onChange={(e) => setInternalNotesValue(e.target.value)}
                    onBlur={() => showToast('Internal notes saved', 'action')}
                    placeholder="Internal notes (not visible to client)..."
                    rows={3}
                    className="w-full text-sm text-slate-600 leading-relaxed border border-slate-200 rounded-lg px-3 py-2 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white"
                  />
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-5 gap-4 p-6">
          {/* Left Column (2/5 = 40%) */}
          <div className="col-span-2 space-y-4">
            {/* Client Card */}
            <Card>
              <CardHeader icon={<Building2 size={16} />} title="Client" />
              {client ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">{client.company_name}</p>
                  {client.industry && (
                    <p className="text-xs text-slate-500">{client.industry}</p>
                  )}
                  <div className="space-y-2">
                    {localContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-50"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User size={13} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {contact.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                                CONTACT_ROLE_STYLES[contact.role] ?? 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {CONTACT_ROLE_LABELS[contact.role] ?? contact.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail size={10} />
                              {contact.email}
                            </span>
                            {contact.phone && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Phone size={10} />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showAddContact ? (
                    <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 space-y-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Contact Type</label>
                        <select
                          value={newContactRole}
                          onChange={(e) => setNewContactRole(e.target.value as ContactRole)}
                          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                        >
                          {Object.entries(CONTACT_ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!newContactName.trim() || !newContactEmail.trim()) return
                            const newContact: ClientContact = {
                              id: `contact-${Date.now()}`,
                              client_id: client.id,
                              name: newContactName.trim(),
                              email: newContactEmail.trim(),
                              phone: newContactPhone.trim() || undefined,
                              role: newContactRole,
                              is_primary: false,
                            }
                            setLocalContacts((prev) => [...prev, newContact])
                            setNewContactName('')
                            setNewContactEmail('')
                            setNewContactPhone('')
                            setNewContactRole('other')
                            setShowAddContact(false)
                            showToast(`${newContact.name} added as ${CONTACT_ROLE_LABELS[newContactRole] ?? newContactRole} contact`, 'action')
                          }}
                          className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddContact(false)
                            setNewContactName('')
                            setNewContactEmail('')
                            setNewContactPhone('')
                            setNewContactRole('other')
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
                    >
                      <Plus size={13} />
                      Add Contact
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No client linked</p>
              )}
            </Card>

            {/* Shipping Address Card */}
            <Card>
              <CardHeader icon={<MapPin size={16} />} title="Shipping Address" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {addressBook.folders.map((folder) => (
                      <optgroup key={folder.id} label={folder.name}>
                        {folder.entries.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.label}
                            {entry.is_default ? ' (Default)' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    {/* Show locally-added addresses */}
                    {localAddressEntries
                      .filter((e) => !addressBook.folders.some((f) => f.entries.some((fe) => fe.id === e.id)))
                      .map((entry) => (
                        <option key={entry.id} value={entry.id}>{entry.label}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => setShowNewAddress(!showNewAddress)}
                    className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                  >
                    <Plus size={13} />
                    New
                  </button>
                </div>

                {/* Inline New Address Form */}
                {showNewAddress && (
                  <div className="p-3 bg-indigo-50 rounded-lg space-y-2.5 border border-indigo-100">
                    <div>
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Label</label>
                      <input
                        type="text"
                        value={newAddrLabel}
                        onChange={(e) => setNewAddrLabel(e.target.value)}
                        placeholder="e.g. Main Warehouse"
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Street Address</label>
                      <input
                        type="text"
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        placeholder="123 Main St"
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">City</label>
                        <input
                          type="text"
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          placeholder="Nashville"
                          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">State</label>
                        <input
                          type="text"
                          value={newAddrState}
                          onChange={(e) => setNewAddrState(e.target.value)}
                          placeholder="TN"
                          maxLength={2}
                          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Zip</label>
                        <input
                          type="text"
                          value={newAddrZip}
                          onChange={(e) => setNewAddrZip(e.target.value)}
                          placeholder="37201"
                          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (!newAddrLabel.trim() || !newAddrStreet.trim()) return
                          const newEntry: AddressBookEntry = {
                            id: `abe-new-${Date.now()}`,
                            label: newAddrLabel.trim(),
                            address: {
                              street: newAddrStreet.trim(),
                              city: newAddrCity.trim(),
                              state: newAddrState.trim().toUpperCase(),
                              zip: newAddrZip.trim(),
                              country: 'US',
                            },
                            is_default: false,
                          }
                          setLocalAddressEntries((prev) => [...prev, newEntry])
                          setSelectedAddressId(newEntry.id)
                          setShowNewAddress(false)
                          setNewAddrLabel('')
                          setNewAddrStreet('')
                          setNewAddrCity('')
                          setNewAddrState('')
                          setNewAddrZip('')
                          showToast(`Address "${newEntry.label}" saved`, 'action')
                        }}
                        className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowNewAddress(false)
                          setNewAddrLabel('')
                          setNewAddrStreet('')
                          setNewAddrCity('')
                          setNewAddrState('')
                          setNewAddrZip('')
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedAddress && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-800">{selectedAddress.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatAddress(selectedAddress)}</p>
                    {selectedAddress.contact_name && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <User size={10} />
                        {selectedAddress.contact_name}
                        {selectedAddress.contact_phone && ` - ${selectedAddress.contact_phone}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (3/5 = 60%) */}
          <div className="col-span-3 space-y-4">
            {/* Timeline & Production Card */}
            <Card>
              <CardHeader icon={<Calendar size={16} />} title="Timeline & Production" />
              <div className="grid grid-cols-2 gap-4">
                {/* In Hands Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    In Hands Date
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <Calendar size={14} className="text-slate-400" />
                    <input
                      type="date"
                      value={inHandsDate}
                      onChange={(e) => {
                        setInHandsDate(e.target.value)
                        showToast('In Hands Date updated', 'action')
                      }}
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Project Deadline */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Project Deadline
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <Clock size={14} className="text-slate-400" />
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => {
                        setDeadlineDate(e.target.value)
                        showToast('Project Deadline updated', 'action')
                      }}
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Ship Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Ship Date
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <Truck size={14} className="text-slate-400" />
                    <input
                      type="date"
                      value={shipDate}
                      onChange={(e) => {
                        setShipDate(e.target.value)
                        showToast('Ship Date updated', 'action')
                      }}
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Production Time */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Production Time
                  </label>
                  <select
                    value={productionTimeValue}
                    onChange={(e) => {
                      setProductionTimeValue(e.target.value as ProductionTime)
                      showToast(`Production time set to ${e.target.value}`, 'action')
                    }}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {PRODUCTION_TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Split Ship */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Split Ship
                  </label>
                  <button
                    onClick={() => setSplitShip(!splitShip)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 w-full hover:bg-slate-100 transition-colors"
                  >
                    {splitShip ? (
                      <ToggleRight size={20} className="text-indigo-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-400" />
                    )}
                    <span className="text-sm text-slate-700">{splitShip ? 'Yes' : 'No'}</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Financial Card */}
            <Card>
              <CardHeader icon={<DollarSign size={16} />} title="Financial" />
              <div className="grid grid-cols-2 gap-4">
                {/* Budget */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Budget</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <DollarSign size={14} className="text-slate-400" />
                    <input
                      type="number" onFocus={(e) => e.target.select()}
                      value={budgetValue || ''}
                      onChange={(e) => setBudgetValue(parseFloat(e.target.value) || 0)}
                      onBlur={() => showToast(`Budget updated to ${formatCurrency(budgetValue)}`, 'action')}
                      placeholder="0.00"
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Tax Exempt */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Tax Exempt
                  </label>
                  <button
                    onClick={() => setTaxExempt(!taxExempt)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 w-full hover:bg-slate-100 transition-colors"
                  >
                    {taxExempt ? (
                      <ToggleRight size={20} className="text-indigo-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-400" />
                    )}
                    <span className="text-sm text-slate-700">{taxExempt ? 'Yes' : 'No'}</span>
                  </button>
                </div>

                {/* Payment Terms */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTermsValue}
                    onChange={(e) => {
                      setPaymentTermsValue(e.target.value as PaymentTerms)
                      showToast(`Payment terms set to ${PAYMENT_TERMS_LABELS[e.target.value as PaymentTerms]}`, 'action')
                    }}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {(Object.entries(PAYMENT_TERMS_LABELS) as [PaymentTerms, string][]).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Est. Shipping */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Est. Shipping</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 max-w-[200px]">
                  <DollarSign size={14} className="text-slate-400" />
                  <input
                    type="number" onFocus={(e) => e.target.select()}
                    min={0}
                    step={0.01}
                    value={estShippingCost || ''}
                    onChange={(e) => setEstShippingCost(parseFloat(e.target.value) || 0)}
                    onBlur={() => showToast(`Est. shipping updated to ${formatCurrency(estShippingCost)}`, 'action')}
                    placeholder="0.00"
                    className="flex-1 text-sm text-slate-700 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Summary row */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3">
                <SummaryCell label="Cost" value={formatCurrency(projectTotals.totalCost)} />
                <SummaryCell label="Revenue" value={formatCurrency(projectTotals.totalPrice)} accent />
                <SummaryCell label="Margin" value={formatCurrency(projectTotals.totalMargin)} accent />
              </div>
            </Card>
          </div>
        </div>

        {/* ── Split Shipments Section ── */}
        {splitShip && (
          <div className="px-6 pb-2">
            <Card>
              <CardHeader icon={<Layers size={16} />} title="Split Shipments" />
              {localSplitShipments.length > 0 ? (
                <div className="space-y-2">
                  {localSplitShipments.map((dest) => (
                    <div key={dest.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary-500" />
                        <div>
                          <span className="text-sm font-medium text-slate-700">{dest.label}</span>
                          <p className="text-xs text-slate-400">
                            {dest.allocations.reduce((s, a) => s + a.quantity, 0).toLocaleString()} units
                            &middot; {dest.address.city}, {dest.address.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowSplitBuilder(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
                  >
                    Edit Split Shipments
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSplitBuilder(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Plus size={14} />
                  Configure Split Shipments
                </button>
              )}
            </Card>
          </div>
        )}

        {/* Split Shipment Builder Modal */}
        {showSplitBuilder && (
          <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowSplitBuilder(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto mx-4 p-6">
                <SplitShipmentBuilder
                  lineItems={localLineItems.map((li) => ({
                    id: li.id,
                    productName: li.product_name,
                    totalQuantity: li.total_quantity,
                  }))}
                  clientId={project.client_id}
                  addressBook={addressBook.folders}
                  existingDestinations={localSplitShipments}
                  onSave={(destinations) => {
                    setLocalSplitShipments(destinations)
                    setShowSplitBuilder(false)
                    showToast(`Split shipment saved — ${destinations.length} destination${destinations.length !== 1 ? 's' : ''}`, 'action')
                  }}
                  onClose={() => setShowSplitBuilder(false)}
                />
              </div>
            </div>
          </Portal>
        )}

        {/* ── Tickets Section ── */}
        <div className="px-6 pb-4">
          <Card>
            <CardHeader icon={<TicketIcon size={16} />} title="Tickets" />
            <div className="space-y-2">
              {projectTickets.length > 0 ? (
                projectTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-700 truncate">{ticket.name ?? ticket.reason}</span>
                      {ticket.priority && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                          ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {ticket.priority}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'in-progress' ? 'bg-cyan-100 text-cyan-700' :
                        ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No tickets for this project</p>
              )}
              <button
                onClick={() => showToast('Create ticket from Tickets page', 'action')}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
              >
                <Plus size={13} />
                Create Ticket
              </button>
            </div>
          </Card>
        </div>

        {/* ── Products Section ── */}
        <div className="px-6 pb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700">Products</h4>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {localLineItems.length}
                </span>
              </div>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={13} />
                Add Product
              </button>
            </div>

            {/* Add Product SlidePanel is rendered outside this section */}

            {/* Product List */}
            <div className="divide-y divide-slate-100">
              {localLineItems.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No products added yet</p>
                </div>
              ) : (
                localLineItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectProduct?.(item)}
                    className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-slate-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                          {item.product_name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                            item.product_type === 'contract'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {PRODUCT_TYPE_LABELS[item.product_type] ?? item.product_type}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                            item.art_received
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.art_received ? 'Approved' : 'Draft'}
                        </span>
                      </div>

                      {/* Color info */}
                      {item.selected_color && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Palette size={11} className="text-slate-400" />
                          <span className="text-xs text-slate-500">{item.selected_color}</span>
                        </div>
                      )}

                      {/* Decoration summary */}
                      <p className="text-xs text-slate-500 truncate">
                        {buildDecorationSummary(item)}
                      </p>
                    </div>

                    {/* Right side: quantity + price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.total_quantity} units @ {formatCurrency(item.unit_price)}/ea
                      </p>
                      <p className="text-xs text-slate-400">{item.margin_percent}% margin</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Creative Requests Section ── */}
        <div className="px-6 pb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700">Creative Requests</h4>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {localCreativeRequests.length}
                </span>
              </div>
              <button
                onClick={() => setShowNewRequest(!showNewRequest)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={13} />
                New Request
              </button>
            </div>

            {/* New Request Inline Form */}
            {showNewRequest && (
              <div className="px-5 py-3 border-b border-slate-100 bg-indigo-50">
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Homepage Banner Design"
                        value={newRequestTitle}
                        onChange={(e) => setNewRequestTitle(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                      />
                    </div>
                    <div className="w-36">
                      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Type</label>
                      <select
                        value={newRequestType}
                        onChange={(e) => setNewRequestType(e.target.value as CreativeRequest['type'])}
                        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5"
                      >
                        {Object.entries(CREATIVE_REQUEST_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!newRequestTitle.trim()) return
                        const newReq: CreativeRequest = {
                          id: `cr-${Date.now()}`,
                          project_id: project.id,
                          type: newRequestType,
                          description: newRequestTitle.trim(),
                          status: 'pending',
                          files: [],
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        }
                        setLocalCreativeRequests((prev) => [...prev, newReq])
                        setNewRequestTitle('')
                        setNewRequestType('single-mock')
                        setShowNewRequest(false)
                        showToast(`Creative request "${newReq.description}" created`, 'action')
                      }}
                      className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setShowNewRequest(false); setNewRequestTitle('') }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Request List */}
            <div className="divide-y divide-slate-100">
              {localCreativeRequests.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Palette size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No creative requests yet</p>
                </div>
              ) : (
                localCreativeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelectCreativeRequest?.(req.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-2">{req.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {/* Type badge */}
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {CREATIVE_REQUEST_TYPE_LABELS[req.type] ?? req.type}
                          </span>
                          {/* Status badge */}
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                              CREATIVE_REQUEST_STATUS_STYLES[req.status]?.bg ?? 'bg-gray-100'
                            } ${
                              CREATIVE_REQUEST_STATUS_STYLES[req.status]?.text ?? 'text-gray-500'
                            }`}
                          >
                            {CREATIVE_REQUEST_STATUS_LABELS[req.status] ?? req.status}
                          </span>
                          {/* Assignee */}
                          {req.assigned_to && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <User size={10} />
                              {req.assigned_to}
                            </span>
                          )}
                          {/* Due date */}
                          {req.due_date && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(req.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Payments Section (G17) ── */}
        <div className="px-6 pb-4">
          <Card>
            <CardHeader icon={<CreditCard size={16} />} title="Payments" />
            <div className="space-y-3">
              {/* Payment status badge */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  localPaymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : localPaymentStatus === 'partial'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {localPaymentStatus === 'paid' ? 'Paid' : localPaymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                </span>
                {paymentTermsValue === 'prepay' && localPaymentStatus !== 'paid' && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                    <AlertTriangle size={11} />
                    Payment Required
                  </span>
                )}
              </div>

              {/* Paid details */}
              {localPaymentStatus !== 'unpaid' && localPaymentDetails && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Amount</span>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(localPaymentDetails.amount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Method</span>
                    <p className="text-sm text-slate-700">{localPaymentDetails.method}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Date</span>
                    <p className="text-sm text-slate-700">{formatDate(localPaymentDetails.date)}</p>
                  </div>
                  {localPaymentDetails.reference && (
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Reference #</span>
                      <p className="text-sm text-slate-700 font-mono">{localPaymentDetails.reference}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mark as Paid inline form (admin) */}
              {localPaymentStatus !== 'paid' && (
                <div className="space-y-2">
                  {!showPaymentForm ? (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CreditCard size={13} />
                      Record Payment
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Amount</label>
                          <div className="flex items-center h-8 px-2.5 border border-slate-200 rounded-md bg-white mt-0.5">
                            <DollarSign size={12} className="text-slate-400 mr-1" />
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="flex-1 text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full h-8 px-2.5 text-sm border border-slate-200 rounded-md bg-white mt-0.5 outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="check">Check</option>
                            <option value="wire">Wire Transfer</option>
                            <option value="ach">ACH</option>
                            <option value="credit-card">Credit Card</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Date</label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full h-8 px-2.5 text-sm border border-slate-200 rounded-md bg-white mt-0.5 outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Reference #</label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="CHK-1234"
                            className="w-full h-8 px-2.5 text-sm border border-slate-200 rounded-md bg-white mt-0.5 outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (paymentAmount <= 0) return
                            const details = {
                              amount: paymentAmount,
                              method: paymentMethod,
                              date: paymentDate || new Date().toISOString().split('T')[0],
                              reference: paymentReference || undefined,
                            }
                            setLocalPaymentDetails(details)
                            setLocalPaymentStatus(paymentAmount >= projectTotals.totalPrice ? 'paid' : 'partial')
                            setShowPaymentForm(false)
                            showToast(`Payment of ${formatCurrency(paymentAmount)} recorded`, 'action')
                          }}
                          className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Save Payment
                        </button>
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Files Section ── */}
        <div className="px-6 pb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700">Files</h4>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {projectFiles.length}
                </span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Upload size={13} />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) showToast(`"${file.name}" uploaded successfully`, 'action')
                  e.target.value = ''
                }}
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0.5 px-3 pt-2 pb-0 overflow-x-auto border-b border-slate-100">
              {FILE_CATEGORY_TABS.map((tab) => {
                const count = projectFiles.filter((f) => f.category === tab.key).length
                const isActive = activeFileTab === tab.key
                const showWarning = tab.key === 'client-submitted' && problemFileCount > 0
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFileTab(tab.key)}
                    className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    {showWarning && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-0.5">
                        <AlertTriangle size={8} />
                        {problemFileCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* File list */}
            <div className="min-h-[80px]">
              {filteredFiles.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <FileText size={24} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400">No files yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredFiles.map((file) => {
                    const decInfo = fileDecorationInfo[file.id]
                    return (
                    <div key={file.id}>
                      <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors">
                        <FileIcon filename={file.name} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm text-slate-700 truncate">{file.name}</p>
                            {/* Decoration location badge — shown on ALL file categories (FB-057) */}
                            {decInfo?.decoration_label && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 uppercase tracking-wide whitespace-nowrap flex-shrink-0">
                                {decInfo.decoration_label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                            {file.uploaded_by && <span>by {file.uploaded_by}</span>}
                            <span>{formatDate(file.created_at)}</span>
                            {/* Product-files: show linked product name + decoration (FB-019) */}
                            {activeFileTab === 'product-files' && localFileProductLinks[file.id] && (
                              <span className="text-indigo-500 font-medium">
                                {localLineItems.find(li => li.id === localFileProductLinks[file.id])?.product_name ?? 'Product'}
                              </span>
                            )}
                            {/* Client-submitted: show product + decoration context (FB-055) */}
                            {activeFileTab === 'client-submitted' && decInfo && (
                              <span className="flex items-center gap-1.5">
                                {decInfo.product_name && (
                                  <span className="text-indigo-500 font-medium">{decInfo.product_name}</span>
                                )}
                                {decInfo.decoration_label && decInfo.product_name && (
                                  <span className="text-slate-300">/</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product-files: Link to Product dropdown */}
                        {activeFileTab === 'product-files' && (
                          <select
                            value={localFileProductLinks[file.id] ?? ''}
                            onChange={(e) => {
                              setLocalFileProductLinks(prev => ({ ...prev, [file.id]: e.target.value }))
                              showToast('File linked to product', 'action')
                            }}
                            className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none max-w-[120px]"
                          >
                            <option value="">Link to Product</option>
                            {localLineItems.map(li => (
                              <option key={li.id} value={li.id}>{li.product_name}</option>
                            ))}
                          </select>
                        )}

                        {/* Client-submitted: Link to Product dropdown (FB-055) */}
                        {activeFileTab === 'client-submitted' && (
                          <select
                            value={localFileProductLinks[file.id] ?? ''}
                            onChange={(e) => {
                              setLocalFileProductLinks(prev => ({ ...prev, [file.id]: e.target.value }))
                              showToast('File linked to product', 'action')
                            }}
                            className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none max-w-[120px]"
                          >
                            <option value="">Link to Product</option>
                            {localLineItems.map(li => (
                              <option key={li.id} value={li.id}>{li.product_name}</option>
                            ))}
                          </select>
                        )}

                        {/* Client-submitted: OK/Problem toggle */}
                        {activeFileTab === 'client-submitted' && (
                          <button
                            onClick={() => {
                              const current = localFileStatuses[file.id]
                              const next = current === 'problem' ? 'ok' : current === 'ok' ? 'problem' : 'ok'
                              setLocalFileStatuses(prev => ({ ...prev, [file.id]: next }))
                              showToast(next === 'ok' ? 'File marked OK' : 'File flagged as problem', 'action')
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors flex-shrink-0 ${
                              localFileStatuses[file.id] === 'problem'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : localFileStatuses[file.id] === 'ok'
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {localFileStatuses[file.id] === 'problem' ? (
                              <><Flag size={10} /> Problem</>
                            ) : localFileStatuses[file.id] === 'ok' ? (
                              <><CheckCircle2 size={10} /> OK</>
                            ) : (
                              <>Review</>
                            )}
                          </button>
                        )}

                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      {/* Decks: Version Notes (G23) */}
                      {activeFileTab === 'decks' && (
                        <div className="px-5 pb-2.5 pl-14">
                          <input
                            type="text"
                            value={deckVersionNotes[file.id] ?? ''}
                            onChange={(e) => setDeckVersionNotes(prev => ({ ...prev, [file.id]: e.target.value }))}
                            placeholder="Version notes (e.g. v2 - added back print)"
                            className="w-full text-xs text-slate-500 border border-slate-100 rounded-md px-2.5 py-1.5 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 placeholder-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer for bottom bar */}
        <div className="h-16" />
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAdmin
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Shield size={13} />
              Admin {isAdmin ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPO(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Generate PO
            </button>
            <button
              onClick={() => {
                const next = filesViewMode === 'list' ? 'grid' : 'list'
                setFilesViewMode(next)
                showToast(`Switched to ${next} view`, 'action')
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeftRight size={14} />
              {filesViewMode === 'list' ? 'Grid View' : 'List View'}
            </button>
          </div>
        </div>
      </div>

      {/* ── PO Preview Modal ── */}
      {showPO && (
        <POPreviewModal
          project={project}
          lineItems={localLineItems}
          client={client}
          onClose={() => setShowPO(false)}
        />
      )}

      {/* ── Add Product SlidePanel (E5) ── */}
      <SlidePanel
        isOpen={showAddProduct}
        onClose={() => {
          setShowAddProduct(false)
          setCatalogSearch('')
          setSelectedCatalogProductId(null)
          setNewProductName('')
          setNewProductQty('')
          setNewProductBrand('')
          setNewProductStyle('')
        }}
        title="Add Product"
        subtitle={addProductMode === 'catalog' ? 'Select from product catalog' : 'Manual entry'}
        width="xl"
      >
        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => { setAddProductMode('catalog'); setSelectedCatalogProductId(null) }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                addProductMode === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              From Catalog
            </button>
            <button
              onClick={() => { setAddProductMode('quick'); setSelectedCatalogProductId(null) }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                addProductMode === 'quick' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quick Entry
            </button>
          </div>

          {addProductMode === 'catalog' ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search products by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {catalogProducts
                  .filter(p => {
                    if (!catalogSearch) return true
                    return p.name.toLowerCase().includes(catalogSearch.toLowerCase())
                  })
                  .map((product) => {
                    const isSelected = selectedCatalogProductId === product.id
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedCatalogProductId(isSelected ? null : product.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {product.primary_image_url ? (
                              <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category?.replace(/-/g, ' ')}</p>
                            <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-1 ${
                              product.product_type === 'contract'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}>
                              {product.product_type}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </div>

              {/* Selected Product Details + Qty */}
              {selectedCatalogProductId && (() => {
                const selectedProd = catalogProducts.find(p => p.id === selectedCatalogProductId)
                if (!selectedProd) return null
                return (
                  <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Selected: {selectedProd.name}</h4>
                    {selectedProd.available_colors.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">Colors:</span>
                        {selectedProd.available_colors.slice(0, 8).map(c => (
                          <span key={c.name} className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5">
                            <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: c.hex }} />
                            {c.name}
                          </span>
                        ))}
                        {selectedProd.available_colors.length > 8 && (
                          <span className="text-xs text-slate-400">+{selectedProd.available_colors.length - 8} more</span>
                        )}
                      </div>
                    )}
                    {selectedProd.available_sizes.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">Sizes:</span>
                        {selectedProd.available_sizes.map(s => (
                          <span key={s} className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-3">
                      <div className="w-28">
                        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Quantity</label>
                        <input
                          type="number"
                          value={newProductQty}
                          onChange={(e) => setNewProductQty(e.target.value)}
                          placeholder="100"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const qty = parseInt(newProductQty) || 1
                          const sizes = selectedProd.available_sizes.length > 0
                            ? selectedProd.available_sizes.map(s => ({ size: s, quantity: 0 }))
                            : [{ size: 'OS', quantity: qty }]
                          const newItem: ProjectLineItem = {
                            id: `li-${Date.now()}`,
                            project_id: project.id,
                            product_id: selectedProd.id,
                            product_name: selectedProd.name,
                            product_type: selectedProd.product_type,
                            selected_sizes: sizes,
                            total_quantity: qty,
                            decorations: [],
                            add_ons: [],
                            unit_cost: selectedProd.blank_costs?.[0]?.cost_per_unit ?? selectedProd.vendor_cost ?? 0,
                            margin_percent: 40,
                            unit_price: 0,
                            subtotal: 0,
                            art_received: false,
                            quantities_received: false,
                            artwork_files: [],
                            sort_order: localLineItems.length,
                          }
                          setLocalLineItems((prev) => [...prev, newItem])
                          setShowAddProduct(false)
                          setSelectedCatalogProductId(null)
                          setCatalogSearch('')
                          setNewProductQty('')
                          showToast(`${selectedProd.name} (x${qty}) added to project`, 'action')
                        }}
                        className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        Add to Project
                      </button>
                    </div>
                  </div>
                )
              })()}
            </>
          ) : (
            /* Quick Entry Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Custom Polo"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    value={newProductQty}
                    onChange={(e) => setNewProductQty(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Brand</label>
                  <input
                    type="text"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    placeholder="e.g. Nike"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Style #</label>
                  <input
                    type="text"
                    value={newProductStyle}
                    onChange={(e) => setNewProductStyle(e.target.value)}
                    placeholder="e.g. DRI-FIT"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Pricing Mode</label>
                <select
                  value={newProductPricingMode}
                  onChange={(e) => setNewProductPricingMode(e.target.value as 'contract' | 'all-in')}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="contract">Contract (Blank + Decoration)</option>
                  <option value="all-in">All-In (Vendor Price)</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (!newProductName.trim()) {
                    showToast('Please enter a product name', 'alert')
                    return
                  }
                  const qty = parseInt(newProductQty) || 1
                  const newItem: ProjectLineItem = {
                    id: `li-${Date.now()}`,
                    project_id: project.id,
                    product_id: `prod-${Date.now()}`,
                    product_name: newProductName.trim(),
                    product_type: newProductPricingMode,
                    selected_sizes: [{ size: 'OS', quantity: qty }],
                    total_quantity: qty,
                    decorations: [],
                    add_ons: [],
                    unit_cost: 0,
                    margin_percent: 40,
                    unit_price: 0,
                    subtotal: 0,
                    art_received: false,
                    quantities_received: false,
                    artwork_files: [],
                    sort_order: localLineItems.length,
                  }
                  setLocalLineItems((prev) => [...prev, newItem])
                  setShowAddProduct(false)
                  setNewProductName('')
                  setNewProductQty('')
                  setNewProductBrand('')
                  setNewProductStyle('')
                  showToast(`${newItem.product_name} (x${qty}) added`, 'action')
                }}
                className="w-full px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Add to Project
              </button>
            </div>
          )}
        </div>
      </SlidePanel>
    </div>
  )
}

// ===== SUB-COMPONENTS =====

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">{children}</div>
  )
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 border-l-2 border-indigo-500 pl-3 -ml-1">
      <span className="text-indigo-500">{icon}</span>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
    </div>
  )
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${accent ? 'text-indigo-700' : 'text-slate-700'}`}>
        {value}
      </p>
    </div>
  )
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const colorMap: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600',
    ai: 'bg-orange-100 text-orange-600',
    psd: 'bg-blue-100 text-blue-600',
    docx: 'bg-sky-100 text-sky-600',
    doc: 'bg-sky-100 text-sky-600',
    png: 'bg-emerald-100 text-emerald-600',
    jpg: 'bg-emerald-100 text-emerald-600',
    jpeg: 'bg-emerald-100 text-emerald-600',
    svg: 'bg-violet-100 text-violet-600',
    zip: 'bg-amber-100 text-amber-600',
  }
  const style = colorMap[ext] ?? 'bg-slate-100 text-slate-500'

  return (
    <div
      className={`w-8 h-8 rounded-lg ${style} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-[9px] font-bold uppercase">{ext || '?'}</span>
    </div>
  )
}

// ===== UTILITIES =====

function flattenAddressEntries(book: AddressBook): AddressBookEntry[] {
  return book.folders.flatMap((f) => f.entries)
}
