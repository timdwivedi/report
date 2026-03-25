"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  getDemoProjects,
  getDemoProjectLineItems,
  getDemoArtworkUploads,
  getDemoOrders,
  getDemoProduct,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
} from '@/lib/demo/demo-data-provider'
import type { ProjectLineItem, ArtworkUpload, Address, SplitShipmentDestination, SplitShipmentAllocation, PaymentTerms, ProductDecorationLocation } from '@/lib/types/app'
import { Modal } from '@/components/shared'
import {
  Calendar,
  Package,
  Palette,
  Ruler,
  CheckCircle2,
  Clock,
  Truck,
  FileCheck,
  MessageSquare,
  Check,
  AlertCircle,
  Download,
  Upload,
  FileImage,
  MapPin,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Layers,
  CreditCard,
  Lock,
  Edit3,
  Link2,
  X,
  ThumbsUp,
  ThumbsDown,
  Undo2,
} from 'lucide-react'

// ===== TYPES =====

type OrderStatus = 'pending' | 'details-submitted' | 'approved' | 'changes-requested'

interface ProductQuantityEntry {
  line_item_id: string
  size: string
  quantity: number
}

interface InlineToast {
  id: string
  message: string
  type: 'success' | 'info'
}

// G4 + G16: File-product linking metadata
interface FileProductLink {
  product_id: string
  decoration_location_id?: string
  cross_linked_product_ids: string[]   // G16: additional products this artwork applies to
}

// G15: Per-product approval state
type ProductApprovalStatus = 'none' | 'approved' | 'declined'

// ===== CONSTANTS =====

const DECORATION_METHOD_LABELS: Record<string, string> = {
  'screen-print': 'Screen Print',
  'embroidery': 'Embroidery',
  'dtg': 'DTG (Direct to Garment)',
  'heat-transfer': 'Heat Transfer',
  'sublimation': 'Sublimation',
  'laser-engrave': 'Laser Engrave',
  'pad-print': 'Pad Print',
  'deboss': 'Deboss',
  'other': 'Other',
}

// Quick Reorder data removed (CC-8)

// FB-030: Common decoration locations for client selection
const PORTAL_DECORATION_LOCATIONS = [
  'Left Chest',
  'Right Chest',
  'Back',
  'Front',
  'Left Sleeve',
  'Right Sleeve',
  'Cap Front',
  'Cap Back',
  'Pocket',
  'Collar',
]

// ===== HELPERS =====

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ===== ANIMATION VARIANTS =====

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
} as const

// ===== INLINE TOAST COMPONENT =====
// Portal page is public and does not use DashboardLayout or DemoToastProvider.
// We render a self-contained toast stack instead.

function InlineToastContainer({ toasts }: { toasts: InlineToast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`pointer-events-auto max-w-sm bg-white border rounded-xl px-4 py-3 shadow-xl ${
              toast.type === 'success' ? 'border-emerald-500/30' : 'border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                )}
              </span>
              <p className="text-sm text-slate-700 leading-snug">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ===== PAGE COMPONENT =====

export default function ClientPortalPage() {
  const params = useParams()
  const shareableLink = params.shareableLink as string

  const projects = getDemoProjects()
  const project = projects.find((p) => p.shareable_link === shareableLink)

  const lineItems = useMemo(() => {
    if (!project) return []
    return project.line_items?.length
      ? project.line_items
      : getDemoProjectLineItems(project.id)
  }, [project])

  const totals = useMemo(() => {
    const totalQuantity = lineItems.reduce((sum, li) => sum + li.total_quantity, 0)
    const projectTotal = lineItems.reduce((sum, li) => sum + li.unit_price * li.total_quantity, 0)
    return { totalQuantity, projectTotal, itemCount: lineItems.length }
  }, [lineItems])

  // ===== STATE =====
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showChangesModal, setShowChangesModal] = useState(false)
  const [changesText, setChangesText] = useState('')
  const [toasts, setToasts] = useState<InlineToast[]>([])

  // FB-026: Editable quantities state (keyed by line item ID → size → quantity)
  const [editableQuantities, setEditableQuantities] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {}
    lineItems.forEach((item) => {
      if (item.total_quantity === 0 || item.selected_sizes.every((s) => s.quantity === 0)) {
        const sizes: Record<string, number> = {}
        item.selected_sizes.forEach((s) => { sizes[s.size] = s.quantity })
        init[item.id] = sizes
      }
    })
    return init
  })
  const [savedQuantities, setSavedQuantities] = useState<Record<string, boolean>>({})

  // FB-027: Per-product notes state
  const [productNotes, setProductNotes] = useState<Record<string, string>>({})
  const [savedNotes, setSavedNotes] = useState<Record<string, { text: string; timestamp: string }>>({})


  // Two-phase approval state
  const approvalPhase = project?.approval_phase ?? 'collecting'
  const [shippingStreet, setShippingStreet] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingZip, setShippingZip] = useState('')
  const [billingStreet, setBillingStreet] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingZip, setBillingZip] = useState('')
  const [showFinalApproveModal, setShowFinalApproveModal] = useState(false)
  const paymentTerms = 'net30' as PaymentTerms // demo default

  // Split shipment state
  const hasSplitShipments = !!(project?.split_shipments?.length)
  const [splitStep, setSplitStep] = useState<1 | 2 | 3>(1)
  const [splitDestinations, setSplitDestinations] = useState<SplitShipmentDestination[]>(project?.split_shipments ?? [])
  const [splitSubmitted, setSplitSubmitted] = useState(false)
  // New destination form
  const [newDestLabel, setNewDestLabel] = useState('')
  const [newDestStreet, setNewDestStreet] = useState('')
  const [newDestCity, setNewDestCity] = useState('')
  const [newDestState, setNewDestState] = useState('')
  const [newDestZip, setNewDestZip] = useState('')
  const [newDestContact, setNewDestContact] = useState('')
  const [newDestPhone, setNewDestPhone] = useState('')

  const showToast = useCallback((message: string, type: InlineToast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-2), { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // ===== ARTWORK UPLOAD STATE =====
  const [artworkFiles, setArtworkFiles] = useState<ArtworkUpload[]>(() => getDemoArtworkUploads())
  const [isDragging, setIsDragging] = useState(false)

  // ===== G4 + G16: FILE-PRODUCT LINKING STATE =====
  const [fileProductLinks, setFileProductLinks] = useState<Record<string, FileProductLink>>({})
  const [linkingFileId, setLinkingFileId] = useState<string | null>(null)
  const [linkProductId, setLinkProductId] = useState('')
  const [linkDecoLocationId, setLinkDecoLocationId] = useState('')
  const [showCrossLink, setShowCrossLink] = useState(false)                // G16
  const [crossLinkSelections, setCrossLinkSelections] = useState<string[]>([]) // G16

  // ===== G15: PER-PRODUCT APPROVAL STATE =====
  const [productApprovals, setProductApprovals] = useState<Record<string, ProductApprovalStatus>>({})
  const [declineConfirmItemId, setDeclineConfirmItemId] = useState<string | null>(null)

  // ===== FB-030: PER-PRODUCT DECORATION LOCATION =====
  const [selectedDecoLocations, setSelectedDecoLocations] = useState<Record<string, string>>({})

  // Helper: get decoration locations for a product
  const getDecoLocations = useCallback((productId: string): ProductDecorationLocation[] => {
    const product = getDemoProduct(productId)
    return product?.decoration_locations ?? []
  }, [])

  // ===== HANDLERS =====

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    addFiles(Array.from(e.target.files))
  }

  function addFiles(files: File[]) {
    const newUploads: ArtworkUpload[] = files.map((f, i) => ({
      id: `art-new-${Date.now()}-${i}`,
      filename: f.name,
      file_size: f.size,
      file_type: f.type,
      status: 'pending-review' as const,
      uploaded_at: new Date().toISOString().split('T')[0],
    }))
    setArtworkFiles(prev => [...prev, ...newUploads])
    showToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded — pending review`, 'success')
    // G4: prompt product linking for the first uploaded file
    if (newUploads.length > 0 && lineItems.length > 0) {
      setLinkingFileId(newUploads[0].id)
      setLinkProductId('')
      setLinkDecoLocationId('')
      setShowCrossLink(false)
      setCrossLinkSelections([])
    }
  }

  // G4: Confirm product link for a file
  function handleConfirmProductLink() {
    if (!linkingFileId || !linkProductId) return
    setFileProductLinks(prev => ({
      ...prev,
      [linkingFileId]: {
        product_id: linkProductId,
        decoration_location_id: linkDecoLocationId || undefined,
        cross_linked_product_ids: crossLinkSelections,
      },
    }))
    const product = lineItems.find(li => li.id === linkProductId)
    const crossCount = crossLinkSelections.length
    const msg = crossCount > 0
      ? `Artwork linked to ${product?.product_name ?? 'product'} + ${crossCount} other product${crossCount > 1 ? 's' : ''}`
      : `Artwork linked to ${product?.product_name ?? 'product'}`
    showToast(msg, 'success')
    setLinkingFileId(null)
    setLinkProductId('')
    setLinkDecoLocationId('')
    setShowCrossLink(false)
    setCrossLinkSelections([])
  }

  // G4: Skip product linking
  function handleSkipProductLink() {
    setLinkingFileId(null)
    setLinkProductId('')
    setLinkDecoLocationId('')
    setShowCrossLink(false)
    setCrossLinkSelections([])
  }

  // G15: Approve a product
  function handleApproveProduct(itemId: string) {
    setProductApprovals(prev => ({ ...prev, [itemId]: 'approved' }))
    const item = lineItems.find(li => li.id === itemId)
    showToast(`${item?.product_name ?? 'Product'} approved`, 'success')
  }

  // G15: Decline a product (show confirmation first)
  function handleDeclineProduct(itemId: string) {
    setDeclineConfirmItemId(itemId)
  }

  // G15: Confirm decline
  function handleConfirmDecline() {
    if (!declineConfirmItemId) return
    setProductApprovals(prev => ({ ...prev, [declineConfirmItemId]: 'declined' }))
    const item = lineItems.find(li => li.id === declineConfirmItemId)
    showToast(`${item?.product_name ?? 'Product'} removed from project`, 'info')
    setDeclineConfirmItemId(null)
  }

  // G15: Un-decline (re-add)
  function handleUndeclineProduct(itemId: string) {
    setProductApprovals(prev => ({ ...prev, [itemId]: 'none' }))
    const item = lineItems.find(li => li.id === itemId)
    showToast(`${item?.product_name ?? 'Product'} re-added`, 'success')
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  // FB-026: Update editable quantity for a size
  const handleQuantityChange = useCallback((lineItemId: string, size: string, quantity: number) => {
    setEditableQuantities((prev) => ({
      ...prev,
      [lineItemId]: { ...(prev[lineItemId] ?? {}), [size]: Math.max(0, quantity) },
    }))
    setSavedQuantities((prev) => ({ ...prev, [lineItemId]: false }))
  }, [])

  // FB-026: Save quantities for a line item
  const handleSaveQuantities = useCallback((lineItemId: string) => {
    setSavedQuantities((prev) => ({ ...prev, [lineItemId]: true }))
    const item = lineItems.find((li) => li.id === lineItemId)
    showToast(`Quantities saved for ${item?.product_name ?? 'product'}`, 'success')
  }, [lineItems, showToast])

  // FB-027: Save note for a product
  const handleSaveProductNote = useCallback((lineItemId: string) => {
    const noteText = productNotes[lineItemId]?.trim()
    if (!noteText) return
    setSavedNotes((prev) => ({
      ...prev,
      [lineItemId]: {
        text: noteText,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      },
    }))
    showToast('Note saved', 'success')
  }, [productNotes, showToast])

  const handleSubmitDetails = useCallback(() => {
    setOrderStatus('details-submitted')
    showToast('Thank you, we\'ve got everything. We\'re reviewing it. If we need anything else, we\'ll let you know.', 'success')
  }, [showToast])

  const handleApproveConfirm = useCallback(() => {
    setOrderStatus('approved')
    setShowApproveModal(false)
    setShowFinalApproveModal(false)
    showToast('Order approved successfully', 'success')
  }, [showToast])

  const handleChangesSubmit = useCallback(() => {
    if (!changesText.trim()) return
    setOrderStatus('changes-requested')
    setShowChangesModal(false)
    setChangesText('')
    showToast('Changes requested — your representative will follow up', 'info')
  }, [changesText, showToast])

  const NET_TERMS_DAYS: Record<string, number> = { net15: 15, net30: 30, net45: 45, net60: 60 }

  // ===== NOT FOUND STATE =====
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-md w-full">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold font-heading text-slate-900">
            Project Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            This link may have expired or the project is no longer available.
            Please contact your account representative.
          </p>
        </div>
      </div>
    )
  }

  const statusStyle = PROJECT_STATUS_STYLES[project.status]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== TOP BANNER ===== */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 tracking-tight">
              85 Supply
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by BrandOps
            </p>
          </div>
          <div className="flex items-center gap-2" data-print-hide>
            <button
              onClick={() => {
                showToast('Opening print dialog — save as PDF from your browser', 'info')
                setTimeout(() => window.print(), 600)
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {getDemoOrders().filter(o => o.project_id === project.id).length > 0 && (
              <Link
                href={`/portal/${shareableLink}/tracking`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Truck className="w-4 h-4" />
                Track Orders
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ===== PROJECT HEADER CARD ===== */}
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold font-heading text-slate-900">
                  {project.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="font-mono text-slate-400">
                    {project.project_number}
                  </span>
                  <span className="w-px h-4 bg-slate-200" />
                  <span>{project.client_name}</span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>
              </div>

              {(project.project_deadline || project.in_hands_date) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">
                      Project Deadline
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDate(project.project_deadline || project.in_hands_date!)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ===== FB-035: ADMIN INTRO / CLIENT-FACING NOTES ===== */}
          {project.client_facing_notes && (
            <motion.div variants={fadeUp}>
              <div className="bg-primary-50/40 border border-primary-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1.5">
                      From your account manager
                    </p>
                    <blockquote className="text-sm text-slate-700 leading-relaxed border-l-2 border-primary-300 pl-3">
                      {project.client_facing_notes}
                    </blockquote>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== LINE ITEMS ===== */}
          {lineItems.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center"
            >
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-900">
                No items yet
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Line items will appear here once the quote is ready.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.h2
                variants={fadeUp}
                className="text-lg font-bold font-heading text-slate-900"
              >
                Products
              </motion.h2>

              {lineItems.map((item, idx) => {
                const approval = productApprovals[item.id] ?? 'none'
                return (
                  <motion.div key={item.id} variants={fadeUp}>
                    {/* G15: Declined state — greyed out with strikethrough */}
                    {approval === 'declined' ? (
                      <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-50">
                        <div className="px-6 py-4 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-sm font-bold text-slate-400">
                                {idx + 1}
                              </span>
                              <p className="text-sm font-semibold text-slate-400 line-through">
                                {item.product_name}
                              </p>
                            </div>
                            <button
                              onClick={() => handleUndeclineProduct(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Re-add
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <LineItemCard
                          item={item}
                          index={idx}
                          editableQuantities={editableQuantities[item.id]}
                          quantitiesSaved={savedQuantities[item.id] ?? false}
                          onQuantityChange={(size, qty) => handleQuantityChange(item.id, size, qty)}
                          onSaveQuantities={() => handleSaveQuantities(item.id)}
                          selectedDecoLocation={selectedDecoLocations[item.id] ?? ''}
                          onDecoLocationChange={(loc) => {
                            setSelectedDecoLocations(prev => ({ ...prev, [item.id]: loc }))
                            if (loc) {
                              const li = lineItems.find(l => l.id === item.id)
                              showToast(`Decoration location set to "${loc}" for ${li?.product_name ?? 'product'}`, 'success')
                            }
                          }}
                        />

                        {/* FB-027: Per-product notes */}
                        <div className="mt-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                          <textarea
                            value={productNotes[item.id] ?? ''}
                            onChange={(e) => setProductNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Add a note about this product..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <button
                              onClick={() => handleSaveProductNote(item.id)}
                              disabled={!productNotes[item.id]?.trim()}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                productNotes[item.id]?.trim()
                                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              Save Note
                            </button>
                            {savedNotes[item.id] && (
                              <span className="text-[10px] text-slate-400">
                                Saved {savedNotes[item.id].timestamp}
                              </span>
                            )}
                          </div>
                          {savedNotes[item.id] && (
                            <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                              <p className="text-sm text-slate-600">{savedNotes[item.id].text}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{savedNotes[item.id].timestamp}</p>
                            </div>
                          )}
                        </div>

                        {/* G15: Approve / Decline buttons */}
                        {approval === 'approved' ? (
                          <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700">Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2" data-print-hide>
                            <button
                              onClick={() => handleApproveProduct(item.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeclineProduct(item.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ===== QUOTE SUMMARY ===== */}
          {lineItems.length > 0 && (
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                Quote Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Items</span>
                  <span className="text-sm font-mono text-slate-700">
                    {totals.itemCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Quantity</span>
                  <span className="text-sm font-mono text-slate-700">
                    {totals.totalQuantity.toLocaleString()} units
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-semibold text-slate-900">
                    Project Total
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {formatCurrency(totals.projectTotal)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== SPLIT SHIPMENTS (Client Wizard) ===== */}
          {(hasSplitShipments || splitDestinations.length > 0) && !splitSubmitted && (
            <motion.div variants={fadeUp}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-600" />
                  Split Shipment
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  Tell us where to ship each quantity
                </p>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        splitStep === step
                          ? 'bg-primary-600 text-white'
                          : splitStep > step
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {splitStep > step ? <Check className="w-4 h-4" /> : step}
                      </div>
                      <span className={`text-xs font-medium ${splitStep === step ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step === 1 ? 'Addresses' : step === 2 ? 'Quantities' : 'Review'}
                      </span>
                      {step < 3 && <div className="w-8 h-px bg-slate-200" />}
                    </div>
                  ))}
                </div>

                {/* Step 1: Add Destinations */}
                {splitStep === 1 && (
                  <div className="space-y-4">
                    {splitDestinations.map((dest) => (
                      <div key={dest.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{dest.label}</p>
                            <p className="text-xs text-slate-400">{dest.address.street}, {dest.address.city}, {dest.address.state} {dest.address.zip}</p>
                            {dest.contact_name && <p className="text-xs text-slate-400 mt-0.5">{dest.contact_name}{dest.contact_phone ? ` - ${dest.contact_phone}` : ''}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => setSplitDestinations((prev) => prev.filter((d) => d.id !== dest.id))}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add form */}
                    <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add Destination</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input type="text" value={newDestLabel} onChange={(e) => setNewDestLabel(e.target.value)} placeholder="Location label (e.g., Nashville HQ)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <div className="col-span-2">
                          <input type="text" value={newDestStreet} onChange={(e) => setNewDestStreet(e.target.value)} placeholder="Street address" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <input type="text" value={newDestCity} onChange={(e) => setNewDestCity(e.target.value)} placeholder="City" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={newDestState} onChange={(e) => setNewDestState(e.target.value)} placeholder="State" maxLength={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                          <input type="text" value={newDestZip} onChange={(e) => setNewDestZip(e.target.value)} placeholder="ZIP" maxLength={5} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        </div>
                        <input type="text" value={newDestContact} onChange={(e) => setNewDestContact(e.target.value)} placeholder="Contact name (optional)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                        <input type="text" value={newDestPhone} onChange={(e) => setNewDestPhone(e.target.value)} placeholder="Contact phone (optional)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      </div>
                      <button
                        onClick={() => {
                          if (!newDestLabel.trim() || !newDestStreet.trim()) return
                          const newDest: SplitShipmentDestination = {
                            id: `cd-${Date.now()}`,
                            label: newDestLabel.trim(),
                            address: { street: newDestStreet.trim(), city: newDestCity.trim(), state: newDestState.trim().toUpperCase(), zip: newDestZip.trim(), country: 'US' },
                            contact_name: newDestContact.trim() || undefined,
                            contact_phone: newDestPhone.trim() || undefined,
                            allocations: lineItems.map((li) => ({ line_item_id: li.id, product_name: li.product_name, quantity: 0 })),
                          }
                          setSplitDestinations((prev) => [...prev, newDest])
                          setNewDestLabel(''); setNewDestStreet(''); setNewDestCity(''); setNewDestState(''); setNewDestZip(''); setNewDestContact(''); setNewDestPhone('')
                          showToast(`Added "${newDest.label}"`)
                        }}
                        disabled={!newDestLabel.trim() || !newDestStreet.trim()}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newDestLabel.trim() && newDestStreet.trim()
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Add Address
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setSplitStep(2)}
                        disabled={splitDestinations.length === 0}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          splitDestinations.length > 0
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Next: Allocate Quantities
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Allocate Quantities */}
                {splitStep === 2 && (
                  <div className="space-y-4">
                    {lineItems.map((item) => {
                      const allocated = splitDestinations.reduce((sum, d) => {
                        const a = d.allocations.find((al) => al.line_item_id === item.id)
                        return sum + (a?.quantity ?? 0)
                      }, 0)
                      const remaining = item.total_quantity - allocated
                      return (
                        <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-slate-800">{item.product_name}</h4>
                            <span className={`text-xs font-mono font-bold ${remaining === 0 ? 'text-emerald-600' : remaining < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                              {allocated}/{item.total_quantity} allocated
                            </span>
                          </div>
                          <div className="space-y-2">
                            {splitDestinations.map((dest) => {
                              const alloc = dest.allocations.find((a) => a.line_item_id === item.id)
                              return (
                                <div key={dest.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                                  <span className="text-sm text-slate-600 truncate flex-1">{dest.label}</span>
                                  <input
                                    type="number"
                                    value={alloc?.quantity ?? 0}
                                    onChange={(e) => {
                                      const qty = Math.max(0, parseInt(e.target.value) || 0)
                                      setSplitDestinations((prev) =>
                                        prev.map((d) =>
                                          d.id === dest.id
                                            ? { ...d, allocations: d.allocations.map((a) => a.line_item_id === item.id ? { ...a, quantity: qty } : a) }
                                            : d
                                        )
                                      )
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    min={0}
                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              )
                            })}
                          </div>
                          {remaining !== 0 && (
                            <p className={`text-xs mt-2 ${remaining < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                              {remaining < 0 ? `${Math.abs(remaining)} over-allocated` : `${remaining} remaining`}
                            </p>
                          )}
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSplitStep(1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={() => setSplitStep(3)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                      >
                        Next: Review
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Submit */}
                {splitStep === 3 && (
                  <div className="space-y-4">
                    {splitDestinations.map((dest) => (
                      <div key={dest.id} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <h4 className="text-sm font-semibold text-slate-800">{dest.label}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{dest.address.street}, {dest.address.city}, {dest.address.state} {dest.address.zip}</p>
                        {dest.contact_name && <p className="text-xs text-slate-400 mb-2">{dest.contact_name}{dest.contact_phone ? ` - ${dest.contact_phone}` : ''}</p>}
                        <div className="space-y-1">
                          {dest.allocations.filter((a) => a.quantity > 0).map((alloc) => (
                            <div key={alloc.line_item_id} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-50 rounded">
                              <span className="text-slate-600">{alloc.product_name}</span>
                              <span className="font-mono font-bold text-slate-700">{alloc.quantity.toLocaleString()} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSplitStep(2)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setSplitSubmitted(true)
                          showToast('Split shipment submitted successfully')
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Submit Split Shipment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Split Shipment Submitted Confirmation */}
          {splitSubmitted && (
            <motion.div
              variants={fadeUp}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-3">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-2">
                Split Shipment Submitted
              </span>
              <p className="text-sm text-emerald-700 mt-2">
                Your split shipment details have been submitted. Your representative will confirm the shipping schedule.
              </p>
            </motion.div>
          )}

          {/* ===== UPLOAD ARTWORK ===== */}
          <motion.div variants={fadeUp}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary-600" />
                Upload Artwork
              </h3>

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('portal-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Drop files here or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">Supports AI, EPS, PDF, SVG, PNG, JPG</p>
                <input
                  id="portal-file-input"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".ai,.eps,.pdf,.svg,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                />
              </div>

              {/* G4: Product linking prompt (appears after upload) */}
              <AnimatePresence>
                {linkingFileId && lineItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border border-primary-200 bg-primary-50/50 rounded-xl p-4 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-primary-600" />
                        <p className="text-sm font-semibold text-slate-800">
                          Does this artwork relate to a product?
                        </p>
                      </div>
                      <button
                        onClick={handleSkipProductLink}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Skip linking"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500">
                      Linking artwork to a product helps your rep match files to the right items.
                    </p>

                    {/* Product dropdown */}
                    <select
                      value={linkProductId}
                      onChange={(e) => {
                        setLinkProductId(e.target.value)
                        setLinkDecoLocationId('')
                        setShowCrossLink(false)
                        setCrossLinkSelections([])
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a product...</option>
                      {lineItems.map((li) => (
                        <option key={li.id} value={li.id}>{li.product_name}</option>
                      ))}
                    </select>

                    {/* Decoration location dropdown (optional, shown when product selected) */}
                    {linkProductId && (() => {
                      const selectedItem = lineItems.find(li => li.id === linkProductId)
                      const decoLocations = selectedItem ? getDecoLocations(selectedItem.product_id) : []
                      return decoLocations.length > 0 ? (
                        <select
                          value={linkDecoLocationId}
                          onChange={(e) => setLinkDecoLocationId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Decoration location (optional)</option>
                          {decoLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                          ))}
                        </select>
                      ) : null
                    })()}

                    {/* G16: Cross-product linking (shown after primary product selected) */}
                    {linkProductId && lineItems.length > 1 && (
                      <div className="space-y-2">
                        {!showCrossLink ? (
                          <button
                            onClick={() => setShowCrossLink(true)}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            + Link to additional products
                          </button>
                        ) : (
                          <div className="space-y-2 pt-1 border-t border-primary-100">
                            <p className="text-xs font-medium text-slate-600">
                              Does this artwork relate to any other products?
                            </p>
                            {lineItems
                              .filter((li) => li.id !== linkProductId)
                              .map((li) => (
                                <label key={li.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={crossLinkSelections.includes(li.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setCrossLinkSelections(prev => [...prev, li.id])
                                      } else {
                                        setCrossLinkSelections(prev => prev.filter(id => id !== li.id))
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-sm text-slate-700">{li.product_name}</span>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleConfirmProductLink}
                        disabled={!linkProductId}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          linkProductId
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Link
                      </button>
                      <button
                        onClick={handleSkipProductLink}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File list */}
              {artworkFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {artworkFiles.map((file) => {
                    const link = fileProductLinks[file.id]
                    const linkedProduct = link ? lineItems.find(li => li.id === link.product_id) : null
                    const crossLinkedNames = link?.cross_linked_product_ids
                      .map(id => lineItems.find(li => li.id === id)?.product_name)
                      .filter(Boolean) ?? []
                    return (
                      <div key={file.id} className="p-3 bg-slate-50 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileImage className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{file.filename}</p>
                              <p className="text-xs text-slate-500">{formatFileSize(file.file_size)}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                            file.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            file.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {file.status === 'pending-review' ? 'Pending Review' : file.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        {/* G4: Show linked product info */}
                        {linkedProduct && (
                          <div className="flex items-center gap-1.5 pl-7">
                            <Link2 className="w-3 h-3 text-primary-500" />
                            <span className="text-xs text-primary-600 font-medium">
                              {linkedProduct.product_name}
                              {link?.decoration_location_id && (() => {
                                const decoLocs = getDecoLocations(linkedProduct.product_id)
                                const loc = decoLocs.find(l => l.id === link.decoration_location_id)
                                return loc ? ` — ${loc.location_name}` : ''
                              })()}
                            </span>
                            {/* G16: Show cross-linked products */}
                            {crossLinkedNames.length > 0 && (
                              <span className="text-xs text-slate-400">
                                + {crossLinkedNames.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ===== ACTION SECTION (Two-Phase Approval) ===== */}
          {lineItems.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-3" data-print-hide>
              {orderStatus === 'approved' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-2">
                    Order Approved
                  </span>
                  <p className="text-sm text-emerald-700 mt-2">
                    Order confirmed — you&apos;ll receive a confirmation email shortly.
                  </p>
                </motion.div>
              ) : orderStatus === 'changes-requested' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-2">
                    Changes Requested
                  </span>
                  <p className="text-sm text-amber-700 mt-2">
                    Your changes have been submitted. Your representative will follow up shortly.
                  </p>
                </motion.div>
              ) : orderStatus === 'details-submitted' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                    Details Submitted
                  </span>
                  <p className="text-sm text-blue-700 mt-2">
                    Thank you, we&apos;ve got everything. We&apos;re reviewing it. If we need anything else, we&apos;ll let you know.
                  </p>
                </motion.div>
              ) : approvalPhase === 'collecting' ? (
                /* Phase 1: Submit Final Details */
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Submit Final Details</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    Please confirm quantities and provide your shipping and billing addresses.
                  </p>

                  {/* Per-product quantity (read-only summary from line items) */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quantities</h4>
                    <div className="space-y-2">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-700">{item.product_name}</span>
                          <span className="text-sm font-mono font-semibold text-slate-900">
                            {item.total_quantity.toLocaleString()} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={shippingStreet}
                        onChange={(e) => setShippingStreet(e.target.value)}
                        placeholder="Street address"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="City"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="State"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          placeholder="ZIP"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing Address</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={billingStreet}
                        onChange={(e) => setBillingStreet(e.target.value)}
                        placeholder="Street address"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          placeholder="City"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                          placeholder="State"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          placeholder="ZIP"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estimated shipping cost */}
                  {project.estimated_shipping_cost != null && project.estimated_shipping_cost > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm text-slate-600">Estimated Shipping</span>
                      <span className="text-sm font-mono font-semibold text-slate-900">
                        {formatCurrency(project.estimated_shipping_cost)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitDetails}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <FileCheck className="w-5 h-5" />
                    Submit Final Details
                  </button>
                  <button
                    onClick={() => setShowChangesModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Changes
                  </button>
                </div>
              ) : approvalPhase === 'final-approval' ? (
                /* Phase 2: Final Approval */
                <div className="space-y-3">
                  {paymentTerms === 'prepay' ? (
                    /* Prepay: Approve and Pay (mock payment form) */
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Approve &amp; Pay</h3>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Project Total</span>
                          <span className="font-bold font-mono text-slate-900">{formatCurrency(totals.projectTotal)}</span>
                        </div>
                      </div>

                      {/* Mock payment form */}
                      <div className="space-y-3 pointer-events-none">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Expiry</label>
                            <input
                              type="text"
                              placeholder="MM / YY"
                              disabled
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">CVC</label>
                            <input
                              type="text"
                              placeholder="123"
                              disabled
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        Online payment will be available soon. Contact your account manager to proceed.
                      </div>

                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-200 text-slate-400 rounded-xl text-base font-semibold cursor-not-allowed shadow-sm"
                      >
                        <CreditCard className="w-5 h-5" />
                        Approve &amp; Pay
                      </button>
                    </div>
                  ) : (
                    /* Net terms: Approve button with confirmation dialog */
                    <>
                      <button
                        onClick={() => setShowFinalApproveModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        <FileCheck className="w-5 h-5" />
                        Approve
                      </button>
                      <p className="text-xs text-slate-400 text-center pt-1">
                        By approving, your project moves to production. Invoice terms: {paymentTerms.replace('net', 'Net ')}.
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setShowChangesModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Changes
                  </button>
                </div>
              ) : (
                /* Phase: approved (from project data) — same as order approved */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-2">
                    Order Approved
                  </span>
                  <p className="text-sm text-emerald-700 mt-2">
                    Order confirmed — you&apos;ll receive a confirmation email shortly.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Quick Reorder removed (CC-8) */}

          {/* ===== FOOTER ===== */}
          <motion.div
            variants={fadeUp}
            className="text-center py-6 border-t border-slate-100"
            data-print-hide
          >
            <p className="text-xs text-slate-400">
              Questions? Contact your 85 Supply account representative.
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* ===== FINAL APPROVAL CONFIRMATION MODAL (Net Terms) ===== */}
      <Modal
        isOpen={showFinalApproveModal}
        onClose={() => setShowFinalApproveModal(false)}
        title="Confirm Final Approval"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowFinalApproveModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Approve
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-full mx-auto">
            <FileCheck className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            Are you sure? Your project will be moved to production, and you will receive an invoice due within{' '}
            <span className="font-semibold">{NET_TERMS_DAYS[paymentTerms] ?? 30} days</span> after it is shipped.
          </p>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Project Total</span>
              <span className="font-bold font-mono text-slate-900">
                {formatCurrency(totals.projectTotal)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ===== REQUEST CHANGES MODAL ===== */}
      <Modal
        isOpen={showChangesModal}
        onClose={() => { setShowChangesModal(false); setChangesText('') }}
        title="Request Changes"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setShowChangesModal(false); setChangesText('') }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleChangesSubmit}
              disabled={!changesText.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label htmlFor="changes-textarea" className="block text-sm font-medium text-slate-700">
            Describe the changes you&apos;d like to make
          </label>
          <textarea
            id="changes-textarea"
            value={changesText}
            onChange={(e) => setChangesText(e.target.value)}
            placeholder="e.g., Change polo color from Navy to Black, increase Medium qty to 150..."
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
          />
        </div>
      </Modal>

      {/* ===== G15: DECLINE CONFIRMATION MODAL ===== */}
      <Modal
        isOpen={declineConfirmItemId !== null}
        onClose={() => setDeclineConfirmItemId(null)}
        title="Remove Product"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeclineConfirmItemId(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDecline}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto">
            <ThumbsDown className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove{' '}
            <span className="font-semibold">
              {lineItems.find(li => li.id === declineConfirmItemId)?.product_name ?? 'this product'}
            </span>{' '}
            from this project?
          </p>
          <p className="text-xs text-slate-400">
            You can re-add it later if you change your mind.
          </p>
        </div>
      </Modal>

      {/* ===== INLINE TOAST STACK ===== */}
      <InlineToastContainer toasts={toasts} />

      {/* ===== PRINT STYLES ===== */}
      <style>{`
        @media print {
          [data-print-hide] { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-slate-50 { background: white !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          .min-h-screen { min-height: auto !important; }
        }
      `}</style>
    </div>
  )
}

// ===== LINE ITEM CARD COMPONENT =====

function LineItemCard({
  item,
  index,
  editableQuantities,
  quantitiesSaved,
  onQuantityChange,
  onSaveQuantities,
  selectedDecoLocation,
  onDecoLocationChange,
}: {
  item: ProjectLineItem
  index: number
  editableQuantities?: Record<string, number>  // FB-026
  quantitiesSaved: boolean                      // FB-026
  onQuantityChange: (size: string, quantity: number) => void  // FB-026
  onSaveQuantities: () => void                  // FB-026
  selectedDecoLocation: string                  // FB-030
  onDecoLocationChange: (location: string) => void  // FB-030
}) {
  // FB-026: Use editable quantities if available, otherwise use item's quantities
  const isEditable = !!editableQuantities
  const effectiveSizes = item.selected_sizes.map((s) => ({
    size: s.size,
    quantity: editableQuantities?.[s.size] ?? s.quantity,
  }))
  const effectiveTotal = effectiveSizes.reduce((sum, s) => sum + s.quantity, 0)
  const lineTotal = item.unit_price * (isEditable ? effectiveTotal : item.total_quantity)
  const maxQuantity = Math.max(...effectiveSizes.map((s) => s.quantity), 1)
  // FB-034: Check if all quantities are zero
  const allQuantitiesZero = effectiveSizes.every((s) => s.quantity === 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 bg-primary-50 rounded-lg text-sm font-bold text-primary-600">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {item.product_name}
              </p>
              {item.selected_color && (
                <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Palette className="w-3 h-3" /> {item.selected_color}
                </span>
              )}
              {/* FB-030: Selected decoration location badge */}
              {selectedDecoLocation && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-semibold rounded-full border border-primary-200">
                  <MapPin className="w-2.5 h-2.5" />
                  {selectedDecoLocation}
                </span>
              )}
            </div>
          </div>

          {/* Art Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {item.art_received ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400" />
            )}
            <span
              className={`text-xs font-medium ${
                item.art_received ? 'text-emerald-600' : 'text-amber-500'
              }`}
            >
              {item.art_received ? 'Artwork Received' : 'Awaiting Artwork'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Size Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Size Breakdown
            </h4>
            <div className="space-y-2">
              {effectiveSizes.map((sq) => (
                <div key={sq.size} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-10">
                    {sq.size}
                  </span>
                  {/* FB-034: Hide graph bars when all quantities are zero */}
                  {!allQuantitiesZero && (
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${(sq.quantity / maxQuantity) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  {/* FB-026: Editable input when quantities are zero */}
                  {isEditable ? (
                    <input
                      type="number"
                      value={sq.quantity || ''}
                      onChange={(e) => onQuantityChange(sq.size, parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      min={0}
                      placeholder="0"
                      className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    <span className="text-xs font-mono text-slate-700 w-10 text-right">
                      {sq.quantity}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  Total
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {(isEditable ? effectiveTotal : item.total_quantity).toLocaleString()}
                </span>
              </div>
              {/* FB-026: Save Quantities button */}
              {isEditable && (
                <div className="pt-2">
                  {quantitiesSaved ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-medium">Quantities saved</span>
                    </div>
                  ) : (
                    <button
                      onClick={onSaveQuantities}
                      disabled={effectiveTotal === 0}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        effectiveTotal > 0
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      Save Quantities
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Decoration Details */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Decoration
            </h4>
            {item.product_type === 'all-in' ? (
              <div className="px-3 py-2 bg-violet-50 rounded-lg border border-violet-100">
                <p className="text-sm font-medium text-violet-800">Vendor-Decorated</p>
                <p className="text-xs text-violet-600 mt-0.5">Decoration included in unit price</p>
              </div>
            ) : item.decorations.length === 0 ? (
              <p className="text-sm text-slate-400">No decoration</p>
            ) : (
              <div className="space-y-2">
                {item.decorations.map((dec) => (
                  <div
                    key={dec.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {dec.position_label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {DECORATION_METHOD_LABELS[dec.method] ?? dec.method}
                        {dec.color_count > 0 && (
                          <span>
                            {' '}
                            &middot; {dec.color_count} color
                            {dec.color_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FB-030: Decoration Location Selector */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Decoration Location
              </label>
              <select
                value={selectedDecoLocation}
                onChange={(e) => onDecoLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow"
              >
                <option value="">Select location...</option>
                {PORTAL_DECORATION_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Pricing */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-slate-400">Unit Price</span>
            <p className="text-sm font-mono font-semibold text-slate-700">
              {formatCurrency(item.unit_price)}
            </p>
          </div>
          <span className="text-slate-200">|</span>
          <div>
            <span className="text-xs text-slate-400">Qty</span>
            <p className="text-sm font-mono font-semibold text-slate-700">
              {(isEditable ? effectiveTotal : item.total_quantity).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Line Total</span>
          <p className="text-base font-bold font-mono text-slate-900">
            {formatCurrency(lineTotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
