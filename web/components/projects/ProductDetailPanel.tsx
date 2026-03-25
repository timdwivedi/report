"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from '@/components/shared/Portal'
import PricingGrid from '@/components/shared/PricingGrid'
import { calculateLineItem, calculateAllInLineItem, getDecorationCost } from '@/lib/utils/quoting'
import { getDemoProduct } from '@/lib/demo/demo-data-provider'
import { PRICE_CODE_DISCOUNTS, PRICE_CODE_LABELS } from '@/lib/constants/app'
import type {
  Project,
  ProjectLineItem,
  LineItemDecoration,
  LineItemAddOn,
  DecorationMethod,
  DecorationPosition,
  ProductType,
  SizeQuantity,
  RunCharge,
  FixedCharge,
  AddOnLevel,
  AllInPriceBreak,
  ProductFixedCharge,
} from '@/lib/types/app'
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Save,
  Paintbrush,
  StickyNote,
  MapPin,
  Layers,
  Package,
  Truck,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  ArrowLeftRight,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import SwapProductModal from './SwapProductModal'
import DecorationRecommender from './DecorationRecommender'

// ===== CONSTANTS =====

const DECORATION_METHOD_LABELS: Record<string, string> = {
  'screen-print': 'Screen Printing',
  'embroidery': 'Embroidery',
  'dtg': 'DTG (Direct to Garment)',
  'heat-transfer': 'Heat Transfer',
  'sublimation': 'Sublimation',
  'laser-engrave': 'Laser Engrave',
  'pad-print': 'Pad Print',
  'deboss': 'Deboss',
  'other': 'Other',
}

const DECORATION_METHODS: DecorationMethod[] = [
  'screen-print', 'embroidery', 'dtg', 'heat-transfer',
  'sublimation', 'laser-engrave', 'pad-print', 'deboss', 'other',
]

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

const DECORATION_POSITIONS: DecorationPosition[] = [
  'front', 'back', 'left-chest', 'left-sleeve',
  'right-sleeve', 'collar', 'neckline', 'pocket', 'other',
]

const PRINT_COLOR_OPTIONS = [1, 2, 3, 4, 5, 6]

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

// Demo product catalog for the searchable dropdown
const CATALOG_PRODUCTS = [
  { id: 'gildan-5000', name: 'Gildan 5000', label: 'Gildan 5000 Heavy Cotton Tee' },
  { id: 'gildan-18000', name: 'Gildan 18000', label: 'Gildan 18000 Heavy Blend Crewneck' },
  { id: 'bella-3001', name: 'Bella+Canvas 3001', label: 'Bella+Canvas 3001 Unisex Jersey Tee' },
  { id: 'bella-3719', name: 'Bella+Canvas 3719', label: 'Bella+Canvas 3719 Sponge Fleece Hoodie' },
  { id: 'next-level-3600', name: 'Next Level 3600', label: 'Next Level 3600 Cotton Crew' },
  { id: 'comfort-colors-1717', name: 'Comfort Colors 1717', label: 'Comfort Colors 1717 Garment-Dyed Tee' },
  { id: 'richardson-112', name: 'Richardson 112', label: 'Richardson 112 Trucker Cap' },
  { id: 'carhartt-ct100', name: 'Carhartt CT100', label: 'Carhartt CT100 Beanie' },
]

// ===== HELPERS =====

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

// ===== SECTION HEADER =====

function SectionHeader({
  icon: Icon,
  title,
  action,
  collapsed,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  collapsed?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-y border-slate-200">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 transition-colors"
      >
        <Icon className="h-4 w-4" />
        {title}
        {onToggle && (
          collapsed
            ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            : <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {action}
    </div>
  )
}

// ===== BLANK COST INPUT ROW =====

interface BlankCostInputsProps {
  sizes: string[]
  blankCosts: Record<string, number>
  onChange: (size: string, value: number) => void
}

function BlankCostInputs({ sizes, blankCosts, onChange }: BlankCostInputsProps) {
  return (
    <div className="flex items-center gap-1">
      {sizes.map(size => (
        <div key={size} className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase">{size}</span>
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
            <input
              type="number" onFocus={(e) => e.target.select()}
              min={0}
              step={0.01}
              value={blankCosts[size] ?? 0}
              onChange={(e) => onChange(size, parseFloat(e.target.value) || 0)}
              className="w-12 h-6 pl-3 pr-1 text-[11px] font-mono text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ===== PRODUCT SEARCH DROPDOWN =====

function ProductSearchDropdown({
  value,
  onChange,
}: {
  value: string
  onChange: (productName: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return CATALOG_PRODUCTS
    const lower = search.toLowerCase()
    return CATALOG_PRODUCTS.filter(
      p => p.name.toLowerCase().includes(lower) || p.label.toLowerCase().includes(lower)
    )
  }, [search])

  const displayValue = CATALOG_PRODUCTS.find(p => p.name === value)?.label ?? value

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors text-left"
      >
        <span className="truncate text-slate-700">{displayValue || 'Select product...'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full h-8 pl-8 pr-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">No products found</div>
            )}
            {filtered.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onChange(product.name)
                  setOpen(false)
                  setSearch('')
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors ${
                  product.name === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700'
                }`}
              >
                {product.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== MAIN COMPONENT =====

interface ProductDetailPanelProps {
  lineItem: ProjectLineItem
  project: Project
  onSave: (updatedLineItem: ProjectLineItem) => void
  onClose: () => void
}

export default function ProductDetailPanel({
  lineItem,
  project,
  onSave,
  onClose,
}: ProductDetailPanelProps) {
  // ---- Local State (mirrors lineItem, edited in-place) ----

  const [displayName, setDisplayName] = useState(lineItem.display_name ?? lineItem.product_name)
  const [catalogProduct, setCatalogProduct] = useState(lineItem.product_name)
  const [selectedColor, setSelectedColor] = useState(lineItem.selected_color ?? '')
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    // Initialize from selected_color (may be comma-separated for multi-color)
    const c = lineItem.selected_color ?? ''
    return c ? c.split(',').map(s => s.trim()).filter(Boolean) : []
  })
  const [artReceived, setArtReceived] = useState(lineItem.art_received)
  const [quantitiesReceived, setQuantitiesReceived] = useState(lineItem.quantities_received ?? false)
  const [marginPercent, setMarginPercent] = useState(lineItem.margin_percent)
  const [vendorCost, setVendorCost] = useState(lineItem.vendor_cost ?? 0)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [pricingOverride, setPricingOverride] = useState<'contract' | 'all-in' | null>(
    lineItem.pricing_override ?? null
  )
  const effectivePricingType: ProductType = pricingOverride ?? lineItem.product_type

  // Blank costs per size (for display in header)
  const [blankCostsBySize, setBlankCostsBySize] = useState<Record<string, number>>(() => {
    // Initialize from a sensible default
    return {
      'S': 3, 'M': 3, 'L': 3, 'XL': 3,
      '2XL': 4, '3XL': 5, '4XL': 6,
    }
  })

  // Notes
  const [clientNotes, setClientNotes] = useState(lineItem.artwork_files?.[0] ?? '') // Using artwork_files[0] as a stand-in; in real app this would be a dedicated field
  const [internalNotes, setInternalNotes] = useState('')
  const [notesCollapsed, setNotesCollapsed] = useState(false)

  // Decoration locations
  const [decorations, setDecorations] = useState<LineItemDecoration[]>(
    lineItem.decorations?.length ? lineItem.decorations : []
  )

  // Per-unit add-ons
  const [addOns, setAddOns] = useState<LineItemAddOn[]>(
    lineItem.add_ons?.length ? lineItem.add_ons : []
  )

  // Shipping notes
  const [shippingNotes, setShippingNotes] = useState('')

  // Product fixed charges
  const [productFixedCharges, setProductFixedCharges] = useState<ProductFixedCharge[]>(
    lineItem.product_fixed_charges ?? []
  )
  const [showAddCharge, setShowAddCharge] = useState(false)
  const [newChargeName, setNewChargeName] = useState('')
  const [newChargeAmount, setNewChargeAmount] = useState(0)
  const [newChargeSaleAmount, setNewChargeSaleAmount] = useState(0)

  // Per-product deadline and ship date overrides (F8)
  const [productDeadline, setProductDeadline] = useState(lineItem.project_deadline ?? '')
  const [productShipDate, setProductShipDate] = useState(lineItem.ship_date ?? '')

  // Estimated shipping cost (F9)
  const [estimatedShipping, setEstimatedShipping] = useState(lineItem.estimated_shipping_cost ?? 0)

  // Decoration art file URLs (F12 - local state for mock uploads)
  const [artFileUrls, setArtFileUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const dec of lineItem.decorations ?? []) {
      if (dec.art_file_url) map[dec.id] = dec.art_file_url
    }
    return map
  })

  // Quantities matrix
  const [quantitiesToggle, setQuantitiesToggle] = useState(false)

  // Derive sizes from the product
  const sizes = useMemo(() => DEFAULT_SIZES, [])

  // Colors for quantities matrix (use selectedColors array or fall back to single)
  const colors = useMemo(() => {
    if (selectedColors.length > 0) return selectedColors
    if (selectedColor) return [selectedColor]
    return ['Black'] // fallback
  }, [selectedColors, selectedColor])

  // Catalog colors for hex lookup
  const catalogColors = useMemo(() => {
    return getDemoProduct(lineItem.product_id)?.available_colors ?? []
  }, [lineItem.product_id])

  // Quantities matrix: color -> size -> qty
  const [quantityMatrix, setQuantityMatrix] = useState<Record<string, Record<string, number>>>(() => {
    const matrix: Record<string, Record<string, number>> = {}
    for (const color of colors) {
      matrix[color] = {}
      for (const size of sizes) {
        // Pre-populate from lineItem.selected_sizes if matching
        const existing = lineItem.selected_sizes?.find(sq => sq.size === size)
        matrix[color][size] = existing?.quantity ?? 0
      }
    }
    return matrix
  })

  // Recompute matrix when colors change
  useEffect(() => {
    setQuantityMatrix(prev => {
      const next: Record<string, Record<string, number>> = {}
      for (const color of colors) {
        next[color] = prev[color] ?? {}
        for (const size of sizes) {
          if (next[color][size] === undefined) {
            next[color][size] = 0
          }
        }
      }
      return next
    })
  }, [colors, sizes])

  // ---- Computed pricing ----

  const totalQuantity = useMemo(() => {
    if (quantitiesToggle) {
      let total = 0
      for (const color of colors) {
        for (const size of sizes) {
          total += quantityMatrix[color]?.[size] ?? 0
        }
      }
      return total
    }
    return lineItem.total_quantity
  }, [quantitiesToggle, quantityMatrix, colors, sizes, lineItem.total_quantity])

  // Aggregate run charges for PricingGrid
  const allRunCharges = useMemo<RunCharge[]>(() => {
    const charges: RunCharge[] = []
    for (const dec of decorations) {
      for (const rc of (dec.run_charges ?? [])) {
        charges.push(rc)
      }
    }
    return charges
  }, [decorations])

  // Primary decoration for PricingGrid (first one, or default)
  const primaryDecoration = decorations[0]
  const primaryMethod: DecorationMethod = primaryDecoration?.method ?? 'screen-print'
  const primaryColorCount = primaryDecoration?.color_count ?? 1

  const calculation = useMemo(() => {
    return calculateLineItem(
      totalQuantity || 100, // default to 100 if no quantity yet
      marginPercent,
      effectivePricingType,
      undefined,
      decorations,
      addOns,
      vendorCost
    )
  }, [totalQuantity, marginPercent, effectivePricingType, decorations, addOns, vendorCost])

  // ---- Quantity matrix helpers ----

  function updateQuantityCell(color: string, size: string, value: number) {
    setQuantityMatrix(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        [size]: Math.max(0, value),
      },
    }))
  }

  function getRowTotal(color: string): number {
    return sizes.reduce((sum, size) => sum + (quantityMatrix[color]?.[size] ?? 0), 0)
  }

  function getColumnTotal(size: string): number {
    return colors.reduce((sum, color) => sum + (quantityMatrix[color]?.[size] ?? 0), 0)
  }

  const grandTotal = useMemo(() => {
    let total = 0
    for (const color of colors) {
      for (const size of sizes) {
        total += quantityMatrix[color]?.[size] ?? 0
      }
    }
    return total
  }, [quantityMatrix, colors, sizes])

  // ---- Decoration handlers ----

  function addDecoration() {
    const newDec: LineItemDecoration = {
      id: generateId(),
      position: 'front',
      position_label: 'Front',
      method: 'screen-print',
      color_count: 1,
      decoration_cost: getDecorationCost('screen-print', totalQuantity || 100, 1),
      setup_charges: [],
      run_charges: [],
    }
    setDecorations(prev => [...prev, newDec])
  }

  function updateDecoration(id: string, updates: Partial<LineItemDecoration>) {
    setDecorations(prev => prev.map(dec => {
      if (dec.id !== id) return dec
      const updated = { ...dec, ...updates }
      // Recalculate decoration cost when method or colors change
      if (updates.method !== undefined || updates.color_count !== undefined) {
        updated.decoration_cost = getDecorationCost(
          updated.method,
          totalQuantity || 100,
          updated.color_count
        )
      }
      // Update position_label when position changes
      if (updates.position !== undefined) {
        updated.position_label = DECORATION_POSITION_LABELS[updates.position] ?? updates.position
      }
      return updated
    }))
  }

  function removeDecoration(id: string) {
    setDecorations(prev => prev.filter(dec => dec.id !== id))
  }

  // ---- Add-on handlers ----

  function addAddOn(level: AddOnLevel = 'product') {
    setAddOns(prev => [...prev, { id: `ao-${Date.now()}`, name: '', cost_per_unit: 0, sale_price_per_unit: 0, level, decoration_id: undefined }])
  }

  function updateAddOn(index: number, updates: Partial<LineItemAddOn>) {
    setAddOns(prev => prev.map((ao, i) => i === index ? { ...ao, ...updates } : ao))
  }

  function removeAddOn(index: number) {
    setAddOns(prev => prev.filter((_, i) => i !== index))
  }

  // ---- Product fixed charge handlers ----

  function addProductFixedCharge() {
    if (!newChargeName.trim()) return
    const charge: ProductFixedCharge = {
      id: generateId(),
      name: newChargeName.trim(),
      amount: newChargeAmount,
      sale_amount: newChargeSaleAmount,
    }
    setProductFixedCharges(prev => [...prev, charge])
    setNewChargeName('')
    setNewChargeAmount(0)
    setNewChargeSaleAmount(0)
    setShowAddCharge(false)
  }

  function removeProductFixedCharge(id: string) {
    setProductFixedCharges(prev => prev.filter(c => c.id !== id))
  }

  // ---- Save handler ----

  const handleSave = useCallback(() => {
    // Build selected_sizes from quantity matrix if quantities are received
    let selectedSizes: SizeQuantity[] = lineItem.selected_sizes
    if (quantitiesToggle) {
      selectedSizes = sizes.map(size => ({
        size,
        quantity: getColumnTotal(size),
      })).filter(sq => sq.quantity > 0)
    }

    const finalCalc = calculateLineItem(
      totalQuantity || lineItem.total_quantity,
      marginPercent,
      effectivePricingType,
      undefined,
      decorations,
      addOns,
      vendorCost
    )

    const updatedLineItem: ProjectLineItem = {
      ...lineItem,
      product_name: catalogProduct,
      display_name: displayName !== catalogProduct ? displayName : undefined,
      pricing_override: pricingOverride,
      selected_color: selectedColor || undefined,
      selected_sizes: selectedSizes,
      total_quantity: totalQuantity || lineItem.total_quantity,
      decorations: decorations.map(dec => ({
        ...dec,
        art_file_url: artFileUrls[dec.id] ?? dec.art_file_url,
      })),
      add_ons: addOns,
      vendor_cost: effectivePricingType === 'all-in' ? vendorCost : undefined,
      unit_cost: finalCalc.unitCost,
      margin_percent: marginPercent,
      unit_price: finalCalc.unitPrice,
      subtotal: finalCalc.subtotal,
      art_received: artReceived,
      quantities_received: quantitiesReceived,
      project_deadline: productDeadline || undefined,
      ship_date: productShipDate || undefined,
      estimated_shipping_cost: estimatedShipping || undefined,
      product_fixed_charges: productFixedCharges,
    }

    onSave(updatedLineItem)
  }, [
    lineItem, displayName, catalogProduct, selectedColor, totalQuantity, marginPercent,
    effectivePricingType, pricingOverride, decorations, addOns, vendorCost, artReceived,
    quantitiesReceived, quantitiesToggle, sizes, colors, quantityMatrix, onSave,
    productDeadline, productShipDate, estimatedShipping, artFileUrls, productFixedCharges,
  ])

  // ---- Close on Escape ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ---- Render ----

  return (
    <Portal>
      <AnimatePresence>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999]"
        />

        {/* Nested Slide Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          className="fixed inset-y-0 right-0 z-[9999] w-full max-w-[60vw] flex flex-col bg-white shadow-2xl"
        >
          {/* ===== PANEL HEADER ===== */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 flex-shrink-0 bg-white">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
              aria-label="Close product detail"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">Product Details</h2>
              <p className="text-xs text-slate-500 truncate">{project.name} &mdash; {project.project_number}</p>
            </div>
          </div>

          {/* ===== SCROLLABLE BODY ===== */}
          <div className="flex-1 overflow-y-auto">

            {/* ===== TOP HEADER: Product Info + Thumbnail ===== */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex gap-5">
                {/* Thumbnail + Upload */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => lineItem.product_image_url && setImagePreviewOpen(true)}
                      className={`w-28 h-28 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden ${lineItem.product_image_url ? 'cursor-pointer hover:border-primary-400 hover:shadow-md transition-all' : ''}`}
                    >
                      {lineItem.product_image_url ? (
                        <img
                          src={lineItem.product_image_url}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-slate-300" />
                      )}
                    </button>
                    <span className="absolute -top-1.5 -left-1.5 bg-primary-600 text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md shadow-sm">
                      Primary
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </button>
                </div>

                {/* Product Fields */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Row 1: Display Name */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-9 px-3 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow"
                      placeholder="e.g. Company Branded Tee"
                    />
                  </div>

                  {/* Row 2: Product Catalog + Swap + Colors */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Product
                      </label>
                      <ProductSearchDropdown
                        value={catalogProduct}
                        onChange={setCatalogProduct}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSwapModal(true)}
                      className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                      title="Swap to similar product"
                    >
                      <ArrowLeftRight size={13} />
                      Swap
                    </button>
                    <div className="w-56">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Colors
                      </label>
                      {(() => {
                        const catColors = getDemoProduct(lineItem.product_id)?.available_colors
                        if (catColors && catColors.length > 0) {
                          // Catalog product: multi-select color chips
                          const toggleColor = (colorName: string) => {
                            setSelectedColors(prev => {
                              const next = prev.includes(colorName)
                                ? prev.filter(c => c !== colorName)
                                : [...prev, colorName]
                              // Sync single selectedColor for backward compat
                              setSelectedColor(next.join(', '))
                              return next
                            })
                          }
                          return (
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap gap-1">
                                {catColors.map((c) => {
                                  const isSelected = selectedColors.includes(c.name)
                                  return (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => toggleColor(c.name)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all border ${
                                        isSelected
                                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      {c.hex && (
                                        <span
                                          className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"
                                          style={{ backgroundColor: c.hex }}
                                        />
                                      )}
                                      {c.name}
                                    </button>
                                  )
                                })}
                              </div>
                              {selectedColors.length > 0 && (
                                <span className="text-[10px] font-semibold text-primary-600">
                                  {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} selected
                                </span>
                              )}
                            </div>
                          )
                        }
                        // Quick entry: text input (comma-separated)
                        return (
                          <div className="flex items-center h-8 px-3 border border-slate-200 rounded-lg bg-white">
                            <Paintbrush className="h-3.5 w-3.5 text-slate-400 mr-2" />
                            <input
                              type="text"
                              value={selectedColor || ''}
                              onChange={(e) => {
                                setSelectedColor(e.target.value)
                                const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                setSelectedColors(parsed)
                              }}
                              className="flex-1 text-sm bg-transparent focus:outline-none"
                              placeholder="Black, Navy"
                            />
                            {selectedColors.length > 0 && (
                              <span className="ml-1 bg-primary-100 text-primary-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                {selectedColors.length} selected
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Row 2b: Pricing Mode Override */}
                  <div className="flex items-end gap-3">
                    <div className="w-56">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Pricing Mode
                      </label>
                      <select
                        value={effectivePricingType}
                        onChange={(e) => setPricingOverride(e.target.value as 'contract' | 'all-in')}
                        className="w-full h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                      >
                        <option value="contract">Contract (Blank + Deco)</option>
                        <option value="all-in">All-In (Vendor Price)</option>
                      </select>
                    </div>
                    {pricingOverride && pricingOverride !== lineItem.product_type && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wide mb-1.5">
                        Override
                      </span>
                    )}
                  </div>

                  {/* Row 3: Blank costs by size (contract) OR vendor cost (all-in) */}
                  {effectivePricingType === 'contract' ? (
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Blank Cost by Size
                      </label>
                      <BlankCostInputs
                        sizes={['S-XL', '2XL', '3XL', '4XL']}
                        blankCosts={blankCostsBySize}
                        onChange={(size, value) => setBlankCostsBySize(prev => ({ ...prev, [size]: value }))}
                      />
                    </div>
                  ) : (() => {
                    const catalogProd = getDemoProduct(lineItem.product_id)
                    const breaks = catalogProd?.all_in_price_breaks
                    if (breaks && breaks.length > 0) {
                      const allInCalc = calculateAllInLineItem(
                        breaks,
                        totalQuantity || 100,
                        catalogProd?.setup_cost_per_color,
                        catalogProd?.setup_sale_per_color,
                        1
                      )
                      const activeTier = allInCalc.tierIndex >= 0 ? breaks[allInCalc.tierIndex] : null
                      return (
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            All-In Pricing (Price Code)
                          </label>
                          <div className="flex items-stretch gap-3">
                            {/* Vendor cost input (editable fallback) */}
                            <div className="w-32">
                              <span className="block text-[10px] text-slate-400 mb-0.5">Vendor Cost</span>
                              <div className="flex items-center h-8 px-3 border border-slate-200 rounded-lg bg-white">
                                <span className="text-xs text-slate-400 mr-1">$</span>
                                <input
                                  type="number" onFocus={(e) => e.target.select()}
                                  min={0}
                                  step={0.01}
                                  value={vendorCost}
                                  onChange={(e) => setVendorCost(Number(e.target.value))}
                                  className="flex-1 text-sm font-mono bg-transparent focus:outline-none"
                                />
                              </div>
                            </div>
                            {/* Active tier summary */}
                            {activeTier && (
                              <>
                                <div>
                                  <span className="block text-[10px] text-slate-400 mb-0.5">List Price</span>
                                  <div className="h-8 px-3 flex items-center rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-sm font-mono text-slate-700">${activeTier.list_price.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-slate-400 mb-0.5">Code</span>
                                  <div className="h-8 px-3 flex items-center rounded-lg bg-primary-50 border border-primary-200">
                                    <span className="text-sm font-bold text-primary-700">{activeTier.price_code}</span>
                                    <span className="text-[10px] text-primary-500 ml-1">({((PRICE_CODE_DISCOUNTS[activeTier.price_code] ?? 0) * 100).toFixed(0)}% off)</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-slate-400 mb-0.5">Net Cost</span>
                                  <div className="h-8 px-3 flex items-center rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-sm font-mono text-slate-700">${allInCalc.netCostPerUnit.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-slate-400 mb-0.5">Margin</span>
                                  <div className={`h-8 px-3 flex items-center rounded-lg border ${
                                    allInCalc.marginPercent >= 25 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                                  }`}>
                                    <span className={`text-sm font-bold ${
                                      allInCalc.marginPercent >= 25 ? 'text-emerald-700' : 'text-red-700'
                                    }`}>{allInCalc.marginPercent.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Setup cost line */}
                          {(catalogProd?.setup_cost_per_color ?? 0) > 0 && (
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                              <span>Setup: <span className="font-mono">${catalogProd!.setup_cost_per_color!.toFixed(2)}</span>/color (cost)</span>
                              {(catalogProd?.setup_sale_per_color ?? 0) > 0 && (
                                <span>Sale: <span className="font-mono">${catalogProd!.setup_sale_per_color!.toFixed(2)}</span>/color</span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }
                    // Fallback: no price breaks — simple vendor cost input
                    return (
                      <div className="w-40">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Vendor Cost / Unit
                        </label>
                        <div className="flex items-center h-8 px-3 border border-slate-200 rounded-lg bg-white">
                          <span className="text-xs text-slate-400 mr-1">$</span>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            min={0}
                            step={0.01}
                            value={vendorCost}
                            onChange={(e) => setVendorCost(Number(e.target.value))}
                            className="flex-1 text-sm font-mono bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Readiness badges (compact) - gates are in section below */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                      artReceived && quantitiesReceived
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {artReceived && quantitiesReceived ? 'Ready' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* ===== READINESS GATES ===== */}
            <SectionHeader icon={Shield} title="Readiness Gates" />
            <div className="px-6 py-4">
              <div className="flex items-center gap-6">
                {/* Art Received toggle */}
                <button
                  type="button"
                  onClick={() => setArtReceived(!artReceived)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    artReceived
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    artReceived ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-semibold ${artReceived ? 'text-emerald-700' : 'text-slate-600'}`}>
                    Art Received
                  </span>
                </button>

                {/* Quantities Received toggle */}
                <button
                  type="button"
                  onClick={() => setQuantitiesReceived(!quantitiesReceived)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    quantitiesReceived
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    quantitiesReceived ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-semibold ${quantitiesReceived ? 'text-emerald-700' : 'text-slate-600'}`}>
                    Quantities Received
                  </span>
                </button>

                {/* Ready / Draft badge */}
                <span
                  className={`ml-auto text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                    artReceived && quantitiesReceived
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {artReceived && quantitiesReceived ? 'Ready' : 'Draft'}
                </span>
              </div>
              {!(artReceived && quantitiesReceived) && (
                <p className="text-xs text-slate-400 mt-2 italic">
                  Financial calculations are suppressed until both gates are checked.
                </p>
              )}
            </div>

            {/* ===== NOTES SECTION (COLLAPSIBLE) ===== */}
            <SectionHeader
              icon={StickyNote}
              title="Notes"
              collapsed={notesCollapsed}
              onToggle={() => setNotesCollapsed(!notesCollapsed)}
            />
            {!notesCollapsed && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Client-Facing Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Client-Facing Notes
                    </label>
                    <textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Shown to the client for this product"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none transition-shadow"
                    />
                  </div>

                  {/* Internal Notes (Admin Only) */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-1.5">
                      Internal Notes (Admin Only)
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Only visible to your team — never shown to the client"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none transition-shadow placeholder:text-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===== TIMELINE (per-product deadline + ship date) ===== */}
            <SectionHeader icon={Calendar} title="Timeline" />
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Project Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={productDeadline}
                      onChange={(e) => setProductDeadline(e.target.value)}
                      className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow"
                    />
                    {project.project_deadline && productDeadline && productDeadline !== project.project_deadline && (
                      <span className="absolute -top-2 -right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Override
                      </span>
                    )}
                  </div>
                  {project.project_deadline && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Project: {new Date(project.project_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Ship Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={productShipDate}
                      onChange={(e) => setProductShipDate(e.target.value)}
                      className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow"
                    />
                    {project.ship_date && productShipDate && productShipDate !== project.ship_date && (
                      <span className="absolute -top-2 -right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Override
                      </span>
                    )}
                  </div>
                  {project.ship_date && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Project: {new Date(project.ship_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== ESTIMATED SHIPPING COST ===== */}
            <SectionHeader icon={DollarSign} title="Est. Shipping" />
            <div className="px-6 py-4">
              <div className="max-w-xs">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Estimated Shipping Cost
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400">
                  <DollarSign size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={estimatedShipping || ''}
                    onChange={(e) => setEstimatedShipping(parseFloat(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className="flex-1 text-sm text-slate-700 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* ===== DECORATION LOCATIONS (contract only) ===== */}
            {effectivePricingType === 'contract' && (<>
            <SectionHeader
              icon={MapPin}
              title="Decoration Locations"
              action={
                <button
                  onClick={addDecoration}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Location
                </button>
              }
            />
            <div className="px-6 py-3">
              <div className="mb-3">
                <DecorationRecommender
                  quantity={totalQuantity}
                  category={lineItem.product_name.toLowerCase()}
                  productType={effectivePricingType}
                />
              </div>
              {decorations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MapPin className="h-8 w-8 text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No decoration locations added</p>
                  <button
                    onClick={addDecoration}
                    className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Add your first location
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr_120px_40px] gap-3 px-2">
                    <div />
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Decoration</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Print Colors</div>
                    <div />
                  </div>

                  {decorations.map(dec => (
                    <div key={dec.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      {/* Row */}
                      <div className="grid grid-cols-[40px_1fr_1fr_120px_40px] gap-3 items-center px-3 py-2.5">
                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary-500" />
                        </div>

                        {/* Location Dropdown */}
                        <select
                          value={dec.position}
                          onChange={(e) => updateDecoration(dec.id, { position: e.target.value as DecorationPosition })}
                          className="h-8 px-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {DECORATION_POSITIONS.map(pos => (
                            <option key={pos} value={pos}>
                              {DECORATION_POSITION_LABELS[pos]}
                            </option>
                          ))}
                        </select>

                        {/* Decoration Method Dropdown */}
                        <select
                          value={dec.method}
                          onChange={(e) => updateDecoration(dec.id, { method: e.target.value as DecorationMethod })}
                          className="h-8 px-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {DECORATION_METHODS.map(method => (
                            <option key={method} value={method}>
                              {DECORATION_METHOD_LABELS[method]}
                            </option>
                          ))}
                        </select>

                        {/* Print Colors */}
                        <select
                          value={dec.color_count}
                          onChange={(e) => updateDecoration(dec.id, { color_count: Number(e.target.value) })}
                          className="h-8 px-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {PRINT_COLOR_OPTIONS.map(c => (
                            <option key={c} value={c}>
                              {c} Color{c > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>

                        {/* Delete */}
                        <button
                          onClick={() => removeDecoration(dec.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove location"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Include in Unit Price toggle */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-slate-100">
                        <button
                          type="button"
                          className="text-primary-500"
                          aria-label="Toggle include in unit price"
                        >
                          <ToggleRight className="h-5 w-5" />
                        </button>
                        <span className="text-xs text-slate-600 font-medium">
                          Include in unit price
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                          {formatCurrency(dec.decoration_cost)}/unit
                        </span>
                      </div>

                      {/* Art File Upload */}
                      <div className="px-3 py-2 border-t border-slate-100">
                        {artFileUrls[dec.id] ? (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                              <img
                                src={artFileUrls[dec.id]}
                                alt="Art file"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-slate-500 truncate flex-1">Art file uploaded</span>
                            <button
                              type="button"
                              onClick={() => setArtFileUrls(prev => {
                                const next = { ...prev }
                                delete next[dec.id]
                                return next
                              })}
                              className="text-xs text-red-500 hover:text-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-md cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                            <Upload className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-400">Drop art file</span>
                            <input
                              type="file"
                              accept="image/*,.ai,.eps,.pdf,.svg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const url = URL.createObjectURL(file)
                                  setArtFileUrls(prev => ({ ...prev, [dec.id]: url }))
                                }
                                e.target.value = ''
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>)}

            {/* ===== PRICING GRID ===== */}
            <SectionHeader icon={Layers} title="Pricing Grid" />
            <div className="px-6 py-4">
              <PricingGrid
                productType={effectivePricingType}
                decorationMethod={primaryMethod}
                colorCount={primaryColorCount}
                marginPercent={marginPercent}
                onMarginChange={setMarginPercent}
                addOns={addOns}
                runCharges={allRunCharges}
                currentQuantity={totalQuantity || undefined}
                allInPriceBreaks={effectivePricingType === 'all-in' ? getDemoProduct(lineItem.product_id)?.all_in_price_breaks : undefined}
                className=""
              />
            </div>

            {/* ===== RUN CHARGES ===== */}
            <SectionHeader
              icon={Package}
              title="Run Charges"
              action={
                <button
                  onClick={() => addAddOn('product')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Run Charge
                </button>
              }
            />
            <div className="px-6 py-3">
              <p className="text-xs text-slate-400 mb-3">
                Folding, polybag, gift box, etc. -- per-unit surcharges applied to the whole item
              </p>

              {addOns.filter(ao => ao.level === 'product' || !ao.level).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">No run charges yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_90px_90px_32px] gap-3 px-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Name</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cost/unit</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sale/unit</span>
                    <span />
                  </div>

                  {addOns.map((addon, index) => {
                    if (addon.level === 'location') return null
                    return (
                      <div
                        key={addon.id}
                        className="grid grid-cols-[1fr_90px_90px_32px] gap-3 items-center px-2 py-1.5 border-b border-slate-100 last:border-b-0"
                      >
                        {/* Name */}
                        <input
                          type="text"
                          value={addon.name}
                          onChange={(e) => updateAddOn(index, { name: e.target.value })}
                          className="h-7 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          placeholder="Folding & Polybag"
                        />

                        {/* Cost */}
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            min={0}
                            step={0.01}
                            value={addon.cost_per_unit}
                            onChange={(e) => updateAddOn(index, { cost_per_unit: parseFloat(e.target.value) || 0 })}
                            className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </div>

                        {/* Sale (computed from margin) */}
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            readOnly
                            value={(marginPercent < 100 ? addon.cost_per_unit / (1 - marginPercent / 100) : addon.cost_per_unit).toFixed(2)}
                            className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-100 rounded-md bg-slate-50 text-slate-600 cursor-default"
                          />
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeAddOn(index)}
                          className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ===== FIXED CHARGES ===== */}
            <SectionHeader
              icon={MapPin}
              title="Fixed Charges"
              action={
                <button
                  onClick={() => addAddOn('location')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Fixed Charge
                </button>
              }
            />
            <div className="px-6 py-3">
              <p className="text-xs text-slate-400 mb-3">
                Puff ink, metallic ink, etc. -- per-location flat fees tied to a specific decoration location
              </p>

              {addOns.filter(ao => ao.level === 'location').length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">No fixed charges yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_1fr_90px_90px_32px] gap-3 px-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Name</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cost/unit</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sale/unit</span>
                    <span />
                  </div>

                  {addOns.map((addon, index) => {
                    if (addon.level !== 'location') return null
                    return (
                      <div
                        key={addon.id}
                        className="grid grid-cols-[1fr_1fr_90px_90px_32px] gap-3 items-center px-2 py-1.5 border-b border-slate-100 last:border-b-0"
                      >
                        {/* Location dropdown */}
                        <select
                          value={addon.decoration_id ?? ''}
                          onChange={(e) => updateAddOn(index, { decoration_id: e.target.value || undefined })}
                          className="h-7 px-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          <option value="">Select location...</option>
                          {decorations.map(d => (
                            <option key={d.id} value={d.id}>{d.position_label}</option>
                          ))}
                        </select>

                        {/* Name */}
                        <input
                          type="text"
                          value={addon.name}
                          onChange={(e) => updateAddOn(index, { name: e.target.value })}
                          className="h-7 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          placeholder="Puff Ink"
                        />

                        {/* Cost */}
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            min={0}
                            step={0.01}
                            value={addon.cost_per_unit}
                            onChange={(e) => updateAddOn(index, { cost_per_unit: parseFloat(e.target.value) || 0 })}
                            className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </div>

                        {/* Sale (computed from margin) */}
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                          <input
                            type="number" onFocus={(e) => e.target.select()}
                            readOnly
                            value={(marginPercent < 100 ? addon.cost_per_unit / (1 - marginPercent / 100) : addon.cost_per_unit).toFixed(2)}
                            className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-100 rounded-md bg-slate-50 text-slate-600 cursor-default"
                          />
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeAddOn(index)}
                          className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ===== PRODUCT FIXED CHARGES ===== */}
            <SectionHeader
              icon={DollarSign}
              title="Product Fixed Charges"
              action={
                <button
                  onClick={() => setShowAddCharge(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Charge
                </button>
              }
            />
            <div className="px-6 py-3">
              {productFixedCharges.length === 0 && !showAddCharge ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">No product fixed charges yet</p>
                  <button
                    onClick={() => setShowAddCharge(true)}
                    className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Add your first charge
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Header */}
                  {productFixedCharges.length > 0 && (
                    <div className="grid grid-cols-[1fr_90px_90px_32px] gap-3 px-2 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Name</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cost</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sale Price</span>
                      <span />
                    </div>
                  )}

                  {productFixedCharges.map(charge => (
                    <div
                      key={charge.id}
                      className="grid grid-cols-[1fr_90px_90px_32px] gap-3 items-center px-2 py-1.5 border-b border-slate-100 last:border-b-0"
                    >
                      {/* Name */}
                      <span className="text-xs font-medium text-slate-700 truncate">{charge.name}</span>

                      {/* Cost */}
                      <span className="text-xs font-mono text-slate-600">{formatCurrency(charge.amount)}</span>

                      {/* Sale Price */}
                      <span className="text-xs font-mono text-slate-700 font-semibold">{formatCurrency(charge.sale_amount)}</span>

                      {/* Delete */}
                      <button
                        onClick={() => removeProductFixedCharge(charge.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove charge"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Charge Inline Form */}
                  {showAddCharge && (
                    <div className="grid grid-cols-[1fr_90px_90px_32px] gap-3 items-center px-2 py-2 border-t border-slate-200 bg-slate-50 rounded-b-lg mt-1">
                      {/* Name input */}
                      <input
                        type="text"
                        value={newChargeName}
                        onChange={(e) => setNewChargeName(e.target.value)}
                        className="h-7 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                        placeholder="Rush Fee, Setup, etc."
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') addProductFixedCharge() }}
                      />

                      {/* Cost input */}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                        <input
                          type="number"
                          onFocus={(e) => e.target.select()}
                          min={0}
                          step={0.01}
                          value={newChargeAmount || ''}
                          onChange={(e) => setNewChargeAmount(parseFloat(e.target.value) || 0)}
                          className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          placeholder="0.00"
                          onKeyDown={(e) => { if (e.key === 'Enter') addProductFixedCharge() }}
                        />
                      </div>

                      {/* Sale Price input */}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                        <input
                          type="number"
                          onFocus={(e) => e.target.select()}
                          min={0}
                          step={0.01}
                          value={newChargeSaleAmount || ''}
                          onChange={(e) => setNewChargeSaleAmount(parseFloat(e.target.value) || 0)}
                          className="w-full h-7 pl-5 pr-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                          placeholder="0.00"
                          onKeyDown={(e) => { if (e.key === 'Enter') addProductFixedCharge() }}
                        />
                      </div>

                      {/* Add / Cancel */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={addProductFixedCharge}
                          disabled={!newChargeName.trim()}
                          className="w-7 h-3.5 rounded flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Add charge"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCharge(false)
                            setNewChargeName('')
                            setNewChargeAmount(0)
                            setNewChargeSaleAmount(0)
                          }}
                          className="w-7 h-3.5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===== SHIPPING & SETUP NOTES ===== */}
            <SectionHeader icon={Truck} title="Shipping & Setup Notes" />
            <div className="px-6 py-4">
              <textarea
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="Shipping & tax is calculated based on final order quantities"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none transition-shadow"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Visible to clients. Clarify shipping, tax, or setup cost expectations.
              </p>
            </div>

            {/* ===== QUANTITIES RECEIVED ===== */}
            <div className="border-y border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantitiesToggle(!quantitiesToggle)}
                    className="text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {quantitiesToggle ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-300" />
                    )}
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Quantities Received
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    Toggle on when client provides quantities
                  </span>
                </div>
              </div>
            </div>

            {quantitiesToggle && (
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2 w-28">
                          Color
                        </th>
                        {sizes.map(size => (
                          <th
                            key={size}
                            className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-2 min-w-[56px]"
                          >
                            {size}
                          </th>
                        ))}
                        <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2 w-16">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(color => {
                        const colorMeta = catalogColors.find(c => c.name === color)
                        return (
                        <tr key={color} className="border-t border-slate-100">
                          <td className="text-xs font-medium text-slate-700 px-3 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                                style={{ backgroundColor: colorMeta?.hex ?? '#334155' }}
                              />
                              <span className="truncate">{color}</span>
                            </div>
                          </td>
                          {sizes.map(size => (
                            <td key={size} className="text-center px-1 py-1.5">
                              <input
                                type="number" onFocus={(e) => e.target.select()}
                                min={0}
                                value={quantityMatrix[color]?.[size] ?? 0}
                                onChange={(e) => updateQuantityCell(color, size, parseInt(e.target.value) || 0)}
                                className="w-12 h-7 text-xs font-mono text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400"
                              />
                            </td>
                          ))}
                          <td className="text-center text-xs font-bold text-slate-700 px-3 py-1.5">
                            {getRowTotal(color)}
                          </td>
                        </tr>
                        )
                      })}

                      {/* Totals Row */}
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td className="text-xs font-bold text-slate-600 px-3 py-2">Total</td>
                        {sizes.map(size => (
                          <td key={size} className="text-center text-xs font-bold text-slate-600 px-2 py-2">
                            {getColumnTotal(size)}
                          </td>
                        ))}
                        <td className="text-center text-xs font-bold text-primary-700 px-3 py-2">
                          {grandTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-3">
                  <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                    Grand Total: {grandTotal} units
                  </div>
                </div>
              </div>
            )}

            {/* Bottom spacer for save button */}
            <div className="h-4" />
          </div>

          {/* ===== STICKY SAVE BUTTON ===== */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
            {(() => {
              const calcMarginPercent = calculation.unitPrice > 0
                ? ((calculation.unitPrice - calculation.unitCost) / calculation.unitPrice) * 100
                : 0
              const totalCost = calculation.unitCost * (totalQuantity || 100) + calculation.setupChargesTotal
              return (
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {/* Margin % pill - color coded */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    calcMarginPercent > 35 ? 'bg-emerald-100 text-emerald-700' :
                    calcMarginPercent >= 25 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className="h-3.5 w-3.5" />
                    {calcMarginPercent.toFixed(1)}% margin
                  </div>
                  {/* Margin $ */}
                  <div className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {formatCurrency(calculation.marginAmount)} profit
                  </div>
                  {/* Revenue */}
                  <div className="px-3 py-1.5 rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                    {formatCurrency(calculation.subtotal)} revenue
                  </div>
                  {/* Cost */}
                  <div className="px-3 py-1.5 rounded-full bg-slate-50 text-xs font-mono text-slate-500">
                    {formatCurrency(totalCost)} cost
                  </div>
                </div>
              )
            })()}
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 h-11 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save Product
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swap Product Modal */}
      {showSwapModal && (
        <SwapProductModal
          currentProductName={catalogProduct}
          currentCategory={lineItem.product_type === 'contract' ? 'Apparel' : 'Drinkware'}
          currentProductType={effectivePricingType === 'all-in' ? 'all-in' : 'contract'}
          onSwap={(product) => {
            setCatalogProduct(product.name)
            setDisplayName(product.name)
            setShowSwapModal(false)
          }}
          onClose={() => setShowSwapModal(false)}
        />
      )}

      {/* Image Preview Lightbox */}
      <AnimatePresence>
        {imagePreviewOpen && lineItem.product_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 cursor-pointer"
            onClick={() => setImagePreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-[80vw] max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lineItem.product_image_url}
                alt={displayName}
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain"
              />
              <button
                onClick={() => setImagePreviewOpen(false)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
