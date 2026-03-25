"use client"

import { useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared/DemoToastProvider'
import QuotePreviewModal from '@/components/projects/QuotePreviewModal'
import ProductDetailPanel from '@/components/projects/ProductDetailPanel'
import CreativeRequestDetailPanel from '@/components/projects/CreativeRequestDetailPanel'
import SlidePanel from '@/components/shared/SlidePanel'
import { getDemoProjects, getDemoProjectLineItems, getDemoProductsList, getDemoProduct, getDemoCreativeRequests, getDemoProjectFiles, getDemoVendors, getDemoClients, PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import { calculateProjectTotal, calculateLineItem, getDecorationCost } from '@/lib/utils/quoting'
import type { Project, ProjectLineItem, ProjectStatus, LineItemDecoration, LineItemAddOn, ProductDisplay, CreativeRequest, ProjectFile, ProjectFileCategory } from '@/lib/types/app'
import {
  ArrowLeft, Calendar, AlertTriangle, Link2, Copy, Check,
  FileText, Package, Palette, Ruler, DollarSign, Percent,
  ChevronDown, ChevronUp, Image, Plus, Send, ShoppingCart,
  Building2, Truck, Wand2, Upload, FileDown, Timer, Trash2, Search,
} from 'lucide-react'

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

const DECORATION_POSITION_LABELS: Record<string, string> = {
  'front': 'Front',
  'back': 'Back',
  'left-chest': 'Left Chest',
  'left-sleeve': 'Left Sleeve',
  'right-sleeve': 'Right Sleeve',
  'collar': 'Collar',
  'neckline': 'Neckline',
  'pocket': 'Pocket',
  'other': 'Other',
}

function smartSizeSplit(totalQty: number, availableSizes: string[]): Record<string, number> {
  const n = availableSizes.length
  if (n === 0) return {}
  const weights = availableSizes.map((_, i) => {
    const center = (n - 1) / 2
    const x = (i - center) / Math.max(1, center)
    return Math.exp(-2 * x * x)
  })
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const sizes: Record<string, number> = {}
  let allocated = 0
  availableSizes.forEach((size, i) => {
    sizes[size] = Math.floor(totalQty * (weights[i] / totalWeight))
    allocated += sizes[size]
  })
  const midIndex = Math.floor(n / 2)
  sizes[availableSizes[midIndex]] += totalQty - allocated
  return sizes
}

const DEMO_CSV_ROWS = [
  { product: 'Gildan 5000 Heavy Cotton Tee', color: 'Black', s: 50, m: 125, l: 150, xl: 100, xxl: 50, method: 'Screen Print', position: 'Front', colors: 3, margin: 35 },
  { product: 'Richardson 112 Trucker Cap', color: 'Navy/White', s: 0, m: 0, l: 0, xl: 0, xxl: 0, method: 'Embroidery', position: 'Front', colors: 2, margin: 40 },
  { product: 'Bella+Canvas 3001 Unisex Tee', color: 'Heather Gray', s: 30, m: 75, l: 100, xl: 60, xxl: 25, method: 'DTG', position: 'Full Front', colors: 1, margin: 38 },
]
const CSV_TEMPLATE_HEADER = 'Product Name,Color,S,M,L,XL,2XL,Decoration Method,Position,Color Count,Margin %'

// Production timeline phases
const PRODUCTION_PHASES = [
  { id: 'order-placed', label: 'Order Placed', color: 'bg-blue-500' },
  { id: 'blank-sourcing', label: 'Blanks', color: 'bg-indigo-500' },
  { id: 'art-approval', label: 'Art Approval', color: 'bg-violet-500' },
  { id: 'decoration', label: 'Decoration', color: 'bg-purple-500' },
  { id: 'qc', label: 'QC', color: 'bg-amber-500' },
  { id: 'ship', label: 'Ship', color: 'bg-emerald-500' },
] as const

const STATUS_TO_PHASE: Record<string, number> = {
  'opportunity': -1, 'qualifying': -1, 'curating': -1, 'in-design': -1,
  'client-review': -1, 'confirmed': 0, 'order-entry': 1,
  'in-production': 3, 'shipped': 5, 'cancelled': -1,
}

interface AddLineItemForm {
  productId: string
  color: string
  sizes: Record<string, number>
  decorationMethod: string
  decorationLocation: string
  colorCount: number
  marginPercent: number
  vendorCost: number
  decoratorVendorId: string
}

const INITIAL_FORM: AddLineItemForm = {
  productId: '',
  color: '',
  sizes: { S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
  decorationMethod: 'screen-print',
  decorationLocation: 'front',
  colorCount: 1,
  marginPercent: 40,
  vendorCost: 0,
  decoratorVendorId: '',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const projectId = params.id as string

  const [projects] = useState(() => getDemoProjects())
  const project = projects.find(p => p.id === projectId)

  const [lineItems, setLineItems] = useState<ProjectLineItem[]>(() => {
    if (project?.line_items?.length) return [...project.line_items]
    return getDemoProjectLineItems(projectId)
  })

  const [copiedLink, setCopiedLink] = useState(false)
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null)
  const [selectedCreativeRequestId, setSelectedCreativeRequestId] = useState<string | null>(null)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [form, setForm] = useState<AddLineItemForm>({ ...INITIAL_FORM })
  const [totalQtyInput, setTotalQtyInput] = useState('')
  const [timelineCollapsed, setTimelineCollapsed] = useState(false)
  const [addMode, setAddMode] = useState<'catalog' | 'quick'>('catalog')
  const [catalogSearch, setCatalogSearch] = useState('')

  const productsList = useMemo(() => getDemoProductsList(), [])
  const creativeRequests = useMemo(() => getDemoCreativeRequests(projectId), [projectId])
  const projectFiles = useMemo(() => getDemoProjectFiles(projectId), [projectId])
  const decoratorVendors = useMemo(() => getDemoVendors().filter(v => v.type === 'decorator' || v.type === 'both'), [])
  const client = useMemo(() => {
    if (!project) return null
    return getDemoClients().find(c => c.id === project.client_id) ?? null
  }, [project])

  const filteredProducts = useMemo(() => {
    if (!catalogSearch) return productsList
    const lower = catalogSearch.toLowerCase()
    return productsList.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.supplier.toLowerCase().includes(lower)
    )
  }, [productsList, catalogSearch])

  const totals = useMemo(() => calculateProjectTotal(lineItems), [lineItems])

  const selectedLineItem = useMemo(() => {
    if (!selectedLineItemId) return null
    return lineItems.find(li => li.id === selectedLineItemId) ?? null
  }, [selectedLineItemId, lineItems])

  const selectedCreativeRequest = useMemo(() => {
    if (!selectedCreativeRequestId) return null
    return creativeRequests.find(r => r.id === selectedCreativeRequestId) ?? null
  }, [selectedCreativeRequestId, creativeRequests])

  function handleSaveProduct(updatedItem: ProjectLineItem) {
    setLineItems(prev => prev.map(li => li.id === updatedItem.id ? updatedItem : li))
    setSelectedLineItemId(null)
    showToast('Product saved successfully', 'action')
  }

  function handleDuplicateLineItem(itemId: string) {
    const original = lineItems.find(li => li.id === itemId)
    if (!original) return
    const clone: ProjectLineItem = {
      ...original,
      id: `li-${Date.now()}`,
      product_name: `${original.product_name} (Copy)`,
      sort_order: lineItems.length,
    }
    setLineItems(prev => [...prev, clone])
    showToast('Product duplicated', 'action')
  }

  function handleDeleteLineItem(itemId: string) {
    setLineItems(prev => prev.filter(li => li.id !== itemId))
    if (selectedLineItemId === itemId) setSelectedLineItemId(null)
    showToast('Product removed', 'alert')
  }

  const copyShareLink = () => {
    if (project?.shareable_link) {
      navigator.clipboard.writeText(`https://app.brandops.io/portal/${project.shareable_link}`)
      setCopiedLink(true)
      showToast('Portal link copied to clipboard', 'action')
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleSendToClient = () => {
    const fakeUrl = `https://app.brandops.io/portal/${project?.shareable_link || project?.id || 'demo'}`
    navigator.clipboard.writeText(fakeUrl)
    showToast('Portal link copied to clipboard', 'action')
  }

  const handleExportPDF = () => {
    setShowPdfPreview(true)
  }

  const handleConfirmOrders = () => {
    showToast('Orders generated — check Orders page', 'sync')
    setShowConfirmModal(false)
  }

  const updateForm = useCallback(<K extends keyof AddLineItemForm>(key: K, value: AddLineItemForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateSize = useCallback((size: string, qty: number) => {
    setForm(prev => ({ ...prev, sizes: { ...prev.sizes, [size]: Math.max(0, qty) } }))
  }, [])

  function selectCatalogProduct(productId: string) {
    updateForm('productId', productId)
    const product = getDemoProduct(productId)
    if (product?.available_sizes) {
      const newSizes = product.available_sizes.reduce<Record<string, number>>(
        (acc, s) => ({ ...acc, [s]: 0 }), {}
      )
      setForm(prev => ({ ...prev, sizes: newSizes }))
    }
  }

  const handleAddLineItem = () => {
    const selectedProduct = productsList.find(p => p.id === form.productId)
    if (!selectedProduct) {
      showToast('Please select a product', 'alert')
      return
    }

    const totalQty = Object.values(form.sizes).reduce((sum, q) => sum + q, 0)
    if (totalQty === 0) {
      showToast('Please enter at least one size quantity', 'alert')
      return
    }

    // Build selected sizes array (filter out zero-quantity)
    const selectedSizes = Object.entries(form.sizes)
      .filter(([, qty]) => qty > 0)
      .map(([size, quantity]) => ({ size, quantity }))

    const productType = selectedProduct.product_type || 'contract'
    const isAllIn = productType === 'all-in'

    let decorations: LineItemDecoration[] = []
    let vendorCostValue: number | undefined

    if (isAllIn) {
      // All-in: no decorations, use vendor cost
      vendorCostValue = form.vendorCost || selectedProduct.vendor_cost_min || 0
    } else {
      // Contract: build decoration from form
      const decCost = getDecorationCost(
        form.decorationMethod as Parameters<typeof getDecorationCost>[0],
        totalQty,
        form.colorCount
      )
      const selectedVendor = form.decoratorVendorId ? decoratorVendors.find(v => v.id === form.decoratorVendorId) : undefined
      decorations = [{
        id: `dec-${Date.now()}`,
        position: form.decorationLocation as LineItemDecoration['position'],
        position_label: DECORATION_POSITION_LABELS[form.decorationLocation] || form.decorationLocation,
        method: form.decorationMethod as LineItemDecoration['method'],
        color_count: form.colorCount,
        decoration_cost: decCost,
        vendor_id: selectedVendor?.id,
        vendor_name: selectedVendor?.name,
        setup_charges: [],
        run_charges: [],
      }]
    }

    // Calculate pricing using the quoting engine
    const calc = calculateLineItem(
      totalQty,
      form.marginPercent,
      productType,
      undefined,
      decorations,
      [],
      vendorCostValue
    )

    const newItem: ProjectLineItem = {
      id: `li-${Date.now()}`,
      project_id: projectId,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      product_type: productType,
      selected_color: form.color || undefined,
      selected_sizes: selectedSizes,
      total_quantity: totalQty,
      decorations,
      add_ons: [],
      vendor_cost: vendorCostValue,
      unit_cost: Math.round(calc.unitCost * 100) / 100,
      margin_percent: form.marginPercent,
      unit_price: calc.unitPrice,
      subtotal: calc.subtotal,
      art_received: false,
      quantities_received: false,
      artwork_files: [],
      sort_order: lineItems.length,
    }

    setLineItems(prev => [...prev, newItem])
    showToast('Line item added', 'action')
    setShowAddModal(false)
    setForm({ ...INITIAL_FORM })
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.push('/dashboard/projects')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <p className="text-lg font-medium text-slate-900">Project not found</p>
          <p className="text-sm text-slate-500 mt-1">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const statusStyle = PROJECT_STATUS_STYLES[project.status]
  const daysUntilDeadline = project.in_hands_date
    ? Math.ceil((new Date(project.in_hands_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/dashboard/projects')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex items-center gap-3">
          {project.shareable_link && (
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied!' : 'Copy Portal Link'}
            </button>
          )}
          <button
            onClick={handleSendToClient}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send to Client
          </button>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-slate-900">{project.name}</h1>
              {project.is_critical && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" /> Critical
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-mono">{project.project_number}</span>
              <span>{project.client_name}</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              <span className="capitalize">{project.source}</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            {(project.project_deadline || project.in_hands_date) && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <span className="text-slate-600">
                    {new Date(project.project_deadline || project.in_hands_date!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">Project Deadline</span>
                </div>
                {daysUntilDeadline !== null && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    daysUntilDeadline < 7 ? 'bg-red-100 text-red-700'
                    : daysUntilDeadline < 21 ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Overdue'}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              {project.production_time && (
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                  <Truck className="w-3 h-3 inline mr-1" />{project.production_time}
                </span>
              )}
              {project.budget && (
                <span className="text-xs text-slate-400">Budget: ${project.budget.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        {project.internal_notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Internal Notes</p>
            <p className="text-sm text-slate-700">{project.internal_notes}</p>
          </div>
        )}
      </div>

      {/* Production Timeline */}
      {['confirmed', 'order-entry', 'in-production', 'shipped'].includes(project.status) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => setTimelineCollapsed(!timelineCollapsed)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Production Timeline</h2>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${timelineCollapsed ? '' : 'rotate-180'}`} />
          </button>

          {!timelineCollapsed && (
            <div className="px-6 pb-6 space-y-4">
              {/* Overall Phase Bar */}
              <div className="flex items-center gap-1">
                {PRODUCTION_PHASES.map((phase, idx) => {
                  const currentPhase = STATUS_TO_PHASE[project.status] ?? -1
                  const isCompleted = idx < currentPhase
                  const isCurrent = idx === currentPhase

                  return (
                    <div key={phase.id} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full h-3 rounded-full relative overflow-hidden ${
                        isCompleted ? 'bg-slate-300'
                        : isCurrent ? phase.color
                        : 'bg-slate-100'
                      }`}>
                        {isCurrent && (
                          <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                        )}
                      </div>
                      <span className={`text-[9px] font-medium whitespace-nowrap ${
                        isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {phase.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Per-Line-Item Gantt bars */}
              {lineItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">By Line Item</h4>
                  {lineItems.map((item, idx) => {
                    const basePhase = STATUS_TO_PHASE[project.status] ?? -1
                    const itemPhase = Math.max(0, basePhase + (idx % 2 === 0 ? 0 : -1))

                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-40 shrink-0 text-right">
                          <p className="text-xs font-medium text-slate-700 truncate">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400">{item.total_quantity.toLocaleString()} units</p>
                        </div>
                        <div className="flex-1 flex items-center gap-0.5">
                          {PRODUCTION_PHASES.map((phase, phaseIdx) => {
                            const isCompleted = phaseIdx < itemPhase
                            const isCurrent = phaseIdx === itemPhase

                            return (
                              <div
                                key={phase.id}
                                className={`flex-1 h-6 rounded relative overflow-hidden ${
                                  isCompleted ? 'bg-slate-300'
                                  : isCurrent ? phase.color
                                  : 'bg-slate-100'
                                }`}
                                title={`${item.product_name} — ${phase.label}: ${isCurrent ? 'In Progress' : isCompleted ? 'Complete' : 'Pending'}`}
                              >
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Line Items</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{lineItems.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Quantity</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {lineItems.reduce((sum, li) => sum + li.total_quantity, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Avg Margin</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{totals.avgMarginPercent}%</p>
        </div>
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-4 text-white">
          <p className="text-xs text-primary-200">Project Total</p>
          <AnimatedCounter
            value={totals.totalPrice}
            prefix="$"
            duration={1}
            className="text-2xl font-bold font-mono text-white mt-1 block"
          />
        </div>
      </div>

      {/* Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-slate-900">Products</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {lineItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-slate-900">No line items yet</p>
            <p className="text-sm text-slate-500 mt-1">Add products to start building the quote.</p>
          </div>
        ) : (
          lineItems.map((item) => (
            <LineItemCard
              key={item.id}
              item={item}
              onEdit={() => setSelectedLineItemId(item.id)}
              onDuplicate={() => handleDuplicateLineItem(item.id)}
              onDelete={() => handleDeleteLineItem(item.id)}
            />
          ))
        )}
      </div>

      {/* Creative Requests + Production Files */}
      {lineItems.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Creative Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Creative Requests</h3>
              <button
                onClick={() => showToast('New creative request form coming soon (demo mode)', 'alert')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                + New Request
              </button>
            </div>
            <div className="space-y-3">
              {creativeRequests.length > 0 ? (
                creativeRequests.map(cr => {
                  const statusStyles: Record<string, { bg: string; text: string }> = {
                    'pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
                    'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700' },
                    'review': { bg: 'bg-purple-50', text: 'text-purple-700' },
                    'approved': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
                    'cancelled': { bg: 'bg-slate-50', text: 'text-slate-500' },
                  }
                  const typeStyles: Record<string, { bg: string; text: string }> = {
                    're-vector': { bg: 'bg-orange-50', text: 'text-orange-700' },
                    'mockup': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
                    'full-deck': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
                    'color-separation': { bg: 'bg-pink-50', text: 'text-pink-700' },
                    'other': { bg: 'bg-slate-50', text: 'text-slate-600' },
                  }
                  const ss = statusStyles[cr.status] ?? statusStyles['pending']
                  const ts = typeStyles[cr.type] ?? typeStyles['other']
                  return (
                    <button
                      key={cr.id}
                      onClick={() => setSelectedCreativeRequestId(cr.id)}
                      className="w-full text-left p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ts.bg} ${ts.text}`}>
                            {cr.type.replace('-', ' ')}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ss.bg} ${ss.text}`}>
                            {cr.status.replace('-', ' ')}
                          </span>
                        </div>
                        {cr.assigned_to && (
                          <span className="text-[10px] text-slate-400">{cr.assigned_to}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{cr.description}</p>
                      {cr.due_date && (
                        <p className="text-[10px] text-slate-400 mt-1">Due: {new Date(cr.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      )}
                    </button>
                  )
                })
              ) : lineItems.some(li => !li.art_received) ? (
                <div className="text-center py-4">
                  <Wand2 className="w-8 h-8 text-amber-300 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">No creative requests yet — art still pending</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">All art received — no pending requests</p>
                </div>
              )}
            </div>
          </div>

          {/* Production Files (Categorized) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Production Files</h3>
              <button
                onClick={() => showToast('File upload coming soon (demo mode)', 'alert')}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Upload
              </button>
            </div>
            {(() => {
              const categoryLabels: Record<ProjectFileCategory, string> = {
                'product-files': 'Product Files',
                'project-files': 'Project Files',
                'decks': 'Decks',
                'client-art': 'Client Art',
                'client-submitted': 'Client Submitted',
                'production-files': 'Production Files',
                'miscellaneous': 'Miscellaneous',
              }
              const categoryColors: Record<ProjectFileCategory, { bg: string; text: string }> = {
                'product-files': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
                'project-files': { bg: 'bg-blue-50', text: 'text-blue-700' },
                'decks': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
                'client-art': { bg: 'bg-orange-50', text: 'text-orange-700' },
                'client-submitted': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
                'production-files': { bg: 'bg-purple-50', text: 'text-purple-700' },
                'miscellaneous': { bg: 'bg-slate-50', text: 'text-slate-600' },
              }
              const grouped = projectFiles.reduce<Record<string, typeof projectFiles>>((acc, f) => {
                if (!acc[f.category]) acc[f.category] = []
                acc[f.category].push(f)
                return acc
              }, {})
              const categories = Object.keys(grouped) as ProjectFileCategory[]

              if (categories.length === 0) {
                return (
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-sm text-slate-500">No files uploaded yet</p>
                  </div>
                )
              }
              return (
                <div className="space-y-3">
                  {categories.map(cat => (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{categoryLabels[cat]}</p>
                      <div className="space-y-1.5">
                        {grouped[cat].map(f => {
                          const cc = categoryColors[f.category]
                          return (
                            <div key={f.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                                  {f.uploaded_by && <p className="text-[10px] text-slate-400">by {f.uploaded_by}</p>}
                                </div>
                              </div>
                              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${cc.bg} ${cc.text}`}>
                                {categoryLabels[f.category]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Project Totals Summary */}
      {lineItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Quote Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Cost (your cost)</span>
              <span className="text-sm font-mono text-slate-700">${totals.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Margin</span>
              <span className="text-sm font-mono text-emerald-600">${totals.totalMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totals.avgMarginPercent}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <span className="text-base font-semibold text-slate-900">Quote Total (client price)</span>
              <span className="text-xl font-bold font-mono text-slate-900">${totals.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {project.budget && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">vs Budget (${project.budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                <span className={`font-medium ${totals.totalPrice > project.budget ? 'text-red-600' : 'text-emerald-600'}`}>
                  {totals.totalPrice > project.budget ? 'Over budget' : 'Under budget'} by ${Math.abs(project.budget - totals.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Confirm &amp; Generate Orders
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      )}

      {/* ===== ADD LINE ITEM SLIDE PANEL ===== */}
      <SlidePanel
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setForm({ ...INITIAL_FORM }); setTotalQtyInput(''); setAddMode('catalog'); setCatalogSearch('') }}
        title="Add Line Item"
        subtitle={project?.name}
        width="lg"
        headerActions={
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setAddMode('catalog')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${addMode === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              From Catalog
            </button>
            <button
              onClick={() => setAddMode('quick')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${addMode === 'quick' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Quick Entry
            </button>
          </div>
        }
      >
        {(() => {
          const selectedProduct = productsList.find(p => p.id === form.productId)
          const isAllIn = selectedProduct?.product_type === 'all-in'
          const sizeKeys = Object.keys(form.sizes)
          return (
            <div className="space-y-5 pb-24">
              {/* ── Catalog Mode: search + product cards ── */}
              {addMode === 'catalog' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={e => setCatalogSearch(e.target.value)}
                      placeholder="Search products or suppliers..."
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectCatalogProduct(p.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          form.productId === p.id
                            ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.supplier}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.product_type === 'all-in' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {p.product_type === 'all-in' ? 'All-In' : 'Contract'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {p.product_type === 'all-in'
                              ? `$${(p.vendor_cost_min ?? 0).toFixed(2)}`
                              : `$${p.blank_cost_min.toFixed(2)}-${p.blank_cost_max.toFixed(2)}`}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No products match your search</p>
                      </div>
                    )}
                  </div>
                  {selectedProduct && (
                    <p className={`text-xs font-medium ${isAllIn ? 'text-violet-600' : 'text-blue-600'}`}>
                      {isAllIn ? 'All-In product — vendor handles blank + decoration' : 'Contract product — blank + decoration priced separately'}
                    </p>
                  )}
                </>
              )}

              {/* ── Quick Entry Mode: manual fields ── */}
              {addMode === 'quick' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product</label>
                    <select
                      value={form.productId}
                      onChange={e => {
                        const pid = e.target.value
                        selectCatalogProduct(pid)
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a product...</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.supplier}) — {p.product_type === 'all-in'
                            ? `$${(p.vendor_cost_min ?? 0).toFixed(2)} all-in`
                            : `$${p.blank_cost_min.toFixed(2)}-${p.blank_cost_max.toFixed(2)} blank`}
                        </option>
                      ))}
                    </select>
                    {selectedProduct && (
                      <p className={`mt-1 text-xs font-medium ${isAllIn ? 'text-violet-600' : 'text-blue-600'}`}>
                        {isAllIn ? 'All-In product — vendor handles blank + decoration' : 'Contract product — blank + decoration priced separately'}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ── Shared Fields (shown when product selected, both modes) ── */}
              {form.productId && (
                <>
                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={e => updateForm('color', e.target.value)}
                      placeholder="e.g. Black, Navy, Red"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {isAllIn ? 'Quantity' : 'Size Quantities'}
                    </label>
                    {/* Smart Split row — contract products only */}
                    {!isAllIn && (
                      <div className="flex items-end gap-3 mb-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Qty</label>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            min={0}
                            value={totalQtyInput}
                            onChange={e => setTotalQtyInput(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const qty = parseInt(totalQtyInput) || 0
                            if (qty <= 0) return
                            const split = smartSizeSplit(qty, sizeKeys)
                            setForm(prev => ({ ...prev, sizes: split }))
                            showToast(`Smart split: ${qty} units across ${sizeKeys.length} sizes (bell curve)`, 'action')
                          }}
                          disabled={!totalQtyInput || parseInt(totalQtyInput) <= 0}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Smart Split
                        </button>
                      </div>
                    )}
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${isAllIn ? 2 : sizeKeys.length}, minmax(0, 1fr))` }}>
                      {isAllIn ? (
                        <div className="col-span-2 text-center">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            min={0}
                            value={form.sizes[sizeKeys[0]] || ''}
                            onChange={e => updateSize(sizeKeys[0] || 'S', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm text-center font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        sizeKeys.map(size => (
                          <div key={size} className="text-center">
                            <label className="block text-xs font-medium text-slate-500 mb-1">{size}</label>
                            <input
                              type="number" onFocus={(e) => e.target.select()}
                              min={0}
                              value={form.sizes[size] || ''}
                              onChange={e => updateSize(size, parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm text-center font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Total: {Object.values(form.sizes).reduce((s, q) => s + q, 0)} units
                    </p>
                  </div>

                  {/* All-In: Vendor Cost */}
                  {isAllIn && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor Cost per Unit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                        <input
                          type="number" onFocus={(e) => e.target.select()}
                          min={0}
                          step={0.01}
                          value={form.vendorCost || ''}
                          onChange={e => updateForm('vendorCost', parseFloat(e.target.value) || 0)}
                          placeholder={selectedProduct?.vendor_cost_min?.toFixed(2) ?? '0.00'}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        All-in price from vendor (includes blank + decoration)
                      </p>
                    </div>
                  )}

                  {/* Contract: Decoration Method + Location */}
                  {!isAllIn && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Decoration Method</label>
                        <select
                          value={form.decorationMethod}
                          onChange={e => updateForm('decorationMethod', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="screen-print">Screen Print</option>
                          <option value="embroidery">Embroidery</option>
                          <option value="dtg">DTG (Direct to Garment)</option>
                          <option value="heat-transfer">Heat Transfer</option>
                          <option value="sublimation">Sublimation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
                        <select
                          value={form.decorationLocation}
                          onChange={e => updateForm('decorationLocation', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="front">Front</option>
                          <option value="back">Back</option>
                          <option value="left-chest">Left Chest</option>
                          <option value="left-sleeve">Left Sleeve</option>
                          <option value="right-sleeve">Right Sleeve</option>
                          <option value="collar">Collar</option>
                          <option value="neckline">Neckline</option>
                          <option value="pocket">Pocket</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Decorator</label>
                        <select
                          value={form.decoratorVendorId}
                          onChange={e => updateForm('decoratorVendorId', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Auto-assign (best available)</option>
                          {decoratorVendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Contract: Color Count + Margin / All-In: just Margin */}
                  <div className={`grid gap-4 ${isAllIn ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {!isAllIn && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of Colors</label>
                        <input
                          type="number" onFocus={(e) => e.target.select()}
                          min={1}
                          max={6}
                          value={form.colorCount}
                          onChange={e => updateForm('colorCount', Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Margin %</label>
                      <input
                        type="number" onFocus={(e) => e.target.select()}
                        min={0}
                        max={99}
                        value={form.marginPercent}
                        onChange={e => updateForm('marginPercent', Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Sticky Footer ── */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 -mx-6 -mb-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setForm({ ...INITIAL_FORM }); setTotalQtyInput(''); setAddMode('catalog'); setCatalogSearch('') }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLineItem}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  Add to Quote
                </button>
              </div>
            </div>
          )
        })()}
      </SlidePanel>

      {/* ===== CONFIRM ORDERS MODAL ===== */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm & Generate Orders"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmOrders}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Yes, Generate Orders
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure? This will generate purchase orders for all {lineItems.length} line item{lineItems.length !== 1 ? 's' : ''} totaling <span className="font-semibold font-mono">${totals.totalPrice.toLocaleString()}</span>.
          </p>
        </div>
      </Modal>

      {/* ===== CSV IMPORT MODAL ===== */}
      <Modal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        title="Import Line Items from CSV"
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(CSV_TEMPLATE_HEADER)
                showToast('CSV template header copied to clipboard', 'action')
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Template
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCsvModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  showToast(`${DEMO_CSV_ROWS.length} line items imported from CSV`, 'sync')
                  setShowCsvModal(false)
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Import {DEMO_CSV_ROWS.length} Items
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Drag & Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Drop CSV file here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Expected columns: Product, Color, S, M, L, XL, 2XL, Method, Position, Colors, Margin</p>
          </div>

          {/* Preview Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview (Demo Data)</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Product', 'Color', 'S', 'M', 'L', 'XL', '2XL', 'Method', 'Pos', 'Colors', 'Margin'].map(h => (
                      <th key={h} className="px-2 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_CSV_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-2 font-medium text-slate-900 whitespace-nowrap">{row.product}</td>
                      <td className="px-2 py-2 text-slate-600">{row.color}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.s || '--'}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.m || '--'}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.l || '--'}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.xl || '--'}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.xxl || '--'}</td>
                      <td className="px-2 py-2 text-slate-600">{row.method}</td>
                      <td className="px-2 py-2 text-slate-600">{row.position}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.colors}</td>
                      <td className="px-2 py-2 font-mono text-slate-700">{row.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-emerald-600 mt-2 font-medium">
              {DEMO_CSV_ROWS.length} rows detected — ready to import
            </p>
          </div>
        </div>
      </Modal>

      {/* PDF Quote Preview */}
      {showPdfPreview && project && (
        <QuotePreviewModal
          project={project}
          lineItems={lineItems}
          client={null}
          onClose={() => setShowPdfPreview(false)}
        />
      )}

      {/* Product Detail Panel */}
      {selectedLineItem && project && (
        <ProductDetailPanel
          lineItem={selectedLineItem}
          project={project}
          onSave={handleSaveProduct}
          onClose={() => setSelectedLineItemId(null)}
        />
      )}

      {/* Creative Request Detail Panel */}
      {selectedCreativeRequest && project && (
        <CreativeRequestDetailPanel
          request={selectedCreativeRequest}
          project={project}
          onClose={() => setSelectedCreativeRequestId(null)}
        />
      )}
    </div>
  )
}

// ===== PRODUCT CARD COMPONENT (matches old app pattern) =====

function LineItemCard({
  item,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  item: ProjectLineItem
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}) {
  const isReady = item.art_received && item.quantities_received
  const effectiveType = item.pricing_override ?? item.product_type

  // Build decoration summary line like: "Front Chest: Screen Printing (3 colors) · + Puff Inks"
  const decorationParts: string[] = []
  if (effectiveType === 'all-in') {
    decorationParts.push('Vendor-decorated')
  } else {
    item.decorations.forEach(d => {
      const method = DECORATION_METHOD_LABELS[d.method] ?? d.method
      decorationParts.push(`${d.position_label}: ${method} (${d.color_count} color${d.color_count > 1 ? 's' : ''})`)
    })
  }
  const addOnNames = item.add_ons.map(a => a.name)
  const summaryLine = [
    item.selected_color,
    ...decorationParts,
    addOnNames.length > 0 ? `+ ${addOnNames.join(', ')}` : '',
  ].filter(Boolean).join(' \u00B7 ')

  return (
    <div
      onClick={onEdit}
      className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group"
    >
      {/* Product Image Placeholder */}
      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.product_image_url ? (
          <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-8 h-8 text-slate-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{item.product_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            effectiveType === 'all-in'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-primary-100 text-primary-700'
          }`}>
            {effectiveType === 'all-in' ? 'All-In' : 'Contract'}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {isReady ? 'Ready' : 'Draft'}
          </span>
        </div>
        {summaryLine && (
          <p className="text-xs text-slate-500 mt-1.5 truncate">{summaryLine}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={onDuplicate}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Duplicate product"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Remove product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
