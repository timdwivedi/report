"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from '@/components/shared/Portal'
import {
  Package,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  Image as ImageIcon,
  X,
  Sparkles,
  FileCheck,
} from 'lucide-react'
import type {
  Product,
  ProductColor,
  BlankCost,
  SupplierPricing,
  DecorationMethod,
  DecorationPosition,
  ProductDecorationLocation,
  AllInPriceBreak,
  PriceCode,
} from '@/lib/types/app'
import { DECORATION_LOCATION_PRESETS, PRICE_CODE_DISCOUNTS, PRICE_CODE_LABELS } from '@/lib/constants/app'

// ===== CONSTANTS =====

const TABS = ['Basics', 'Sizes / Pricing', 'Variants', 'Price Breaks'] as const
type TabName = (typeof TABS)[number]

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

/** Size-based blank cost labels — the first entry covers S through XL as a single tier */
const SIZE_COST_TIERS = [
  { label: 'S-XL', sizes: ['S', 'M', 'L', 'XL'] },
  { label: '2XL', sizes: ['2XL'] },
  { label: '3XL', sizes: ['3XL'] },
  { label: '4XL', sizes: ['4XL'] },
]

const DECORATION_METHOD_LABELS: Record<DecorationMethod, string> = {
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

const DECORATION_POSITION_LABELS: Record<DecorationPosition, string> = {
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

// FB-092: Demo contract matrix options
const CONTRACT_MATRIX_OPTIONS = [
  'GSA Schedule',
  'State Contract A',
  'Volume Tier 1',
  'Volume Tier 2',
  'Custom Agreement',
]

const PRODUCT_TYPE_LABELS: Record<string, { title: string; subtitle: string }> = {
  contract: {
    title: 'Contract',
    subtitle: 'Blank + decoration pricing model',
  },
  'all-in': {
    title: 'All-In',
    subtitle: 'Single vendor cost per unit',
  },
}

/** AI Color Detection — common color name to hex lookup */
const COLOR_NAME_HEX_MAP: Record<string, string> = {
  red: '#DC2626', blue: '#2563EB', black: '#1F2937', white: '#F9FAFB',
  navy: '#1E3A5A', green: '#16A34A', yellow: '#EAB308', orange: '#EA580C',
  purple: '#9333EA', pink: '#EC4899', gray: '#6B7280', grey: '#6B7280',
  brown: '#92400E', teal: '#0D9488', cyan: '#06B6D4', lime: '#84CC16',
  indigo: '#4F46E5', maroon: '#7F1D1D', olive: '#4D7C0F', coral: '#F97316',
  salmon: '#FB923C', tan: '#D4A574', charcoal: '#374151', silver: '#9CA3AF',
  gold: '#CA8A04', burgundy: '#881337', slate: '#475569', forest: '#166534',
  royal: '#1D4ED8', scarlet: '#DC2626', khaki: '#A3956B', sage: '#6B8F71',
  mint: '#34D399', lavender: '#A78BFA', peach: '#FBBF7E', cream: '#FEF3C7',
  ivory: '#FFFFF0', sand: '#C2B280', stone: '#78716C', heather: '#9CA3AF',
}

function detectHexFromColorName(name: string): string {
  const normalized = name.toLowerCase().trim()
  // Direct match
  if (COLOR_NAME_HEX_MAP[normalized]) return COLOR_NAME_HEX_MAP[normalized]
  // Partial match — check if any known color name appears in the input
  for (const [key, hex] of Object.entries(COLOR_NAME_HEX_MAP)) {
    if (normalized.includes(key)) return hex
  }
  // Random fallback from a curated palette
  const palette = ['#DC2626', '#2563EB', '#16A34A', '#EAB308', '#9333EA', '#EC4899', '#0D9488', '#EA580C']
  return palette[Math.floor(Math.random() * palette.length)]
}

// ===== HELPERS =====

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function deepCloneProduct(product: Product): Product {
  return JSON.parse(JSON.stringify(product))
}

function createEmptyProduct(): Product {
  return {
    id: generateId(),
    org_id: '',
    name: '',
    internal_sku: '',
    product_type: 'contract',
    category: 'short-sleeve-tees',
    description: '',
    primary_image_url: '',
    additional_images: [],
    available_colors: [],
    available_sizes: ['S', 'M', 'L', 'XL'],
    blank_costs: [
      { min_quantity: 1, max_quantity: 9999, cost_per_unit: 3.0 },
    ],
    vendor_cost: undefined,
    applicable_decorations: [],
    supplier_name: '',
    is_active: true,
    show_on_website: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Extract size-tier cost from blank_costs array or a flat mapping */
interface SizeTierCosts {
  'S-XL': number
  '2XL': number
  '3XL': number
  '4XL': number
}

function extractSizeTierCosts(blankCosts: BlankCost[]): SizeTierCosts {
  // If the product uses a simple array (min_quantity tiers), map sensibly:
  // Tier 0 = S-XL, Tier 1 = 2XL upcharge, etc.
  return {
    'S-XL': blankCosts[0]?.cost_per_unit ?? 3,
    '2XL': blankCosts[1]?.cost_per_unit ?? 4,
    '3XL': blankCosts[2]?.cost_per_unit ?? 5,
    '4XL': blankCosts[3]?.cost_per_unit ?? 6,
  }
}

function sizeTierCostsToBlankCosts(costs: SizeTierCosts): BlankCost[] {
  return [
    { min_quantity: 1, max_quantity: 9999, cost_per_unit: costs['S-XL'] },
    { min_quantity: 1, max_quantity: 9999, cost_per_unit: costs['2XL'] },
    { min_quantity: 1, max_quantity: 9999, cost_per_unit: costs['3XL'] },
    { min_quantity: 1, max_quantity: 9999, cost_per_unit: costs['4XL'] },
  ]
}

// ===== LOCAL DECORATION LOCATION TYPE (legacy, for applicable_decorations) =====

interface DecorationLocation {
  id: string
  position: DecorationPosition
  method: DecorationMethod
}

// Template decoration locations use ProductDecorationLocation from types

// ===== PROPS =====

interface ProductEditModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (product: Product) => void
}

// ===== COMPONENT =====

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductEditModalProps) {
  // ---- Tab State ----
  const [activeTab, setActiveTab] = useState<TabName>('Basics')

  // ---- Form State ----
  const [formData, setFormData] = useState<Product>(createEmptyProduct)
  const [sizeTierCosts, setSizeTierCosts] = useState<SizeTierCosts>({
    'S-XL': 3, '2XL': 4, '3XL': 5, '4XL': 6,
  })
  const [decorationLocations, setDecorationLocations] = useState<DecorationLocation[]>([])
  const [templateLocations, setTemplateLocations] = useState<ProductDecorationLocation[]>([])
  const [priceBreaks, setPriceBreaks] = useState<AllInPriceBreak[]>([])
  const [suppliers, setSuppliers] = useState<SupplierPricing[]>([])
  const [setupCostPerColor, setSetupCostPerColor] = useState(0)
  const [setupSalePerColor, setSetupSalePerColor] = useState(0)

  // ---- Initialize form when modal opens or product changes ----
  useEffect(() => {
    if (isOpen) {
      setActiveTab('Basics')
      if (product) {
        setFormData(deepCloneProduct(product))
        setSizeTierCosts(extractSizeTierCosts(product.blank_costs))
        // Build decoration locations from applicable_decorations (simplified)
        setDecorationLocations([])
        setTemplateLocations(product.decoration_locations ? [...product.decoration_locations] : [])
        setPriceBreaks(product.all_in_price_breaks ? [...product.all_in_price_breaks] : [])
        setSuppliers(product.suppliers ? product.suppliers.map(s => ({ ...s, blank_costs: [...s.blank_costs] })) : [])
        setSetupCostPerColor(product.setup_cost_per_color ?? 0)
        setSetupSalePerColor(product.setup_sale_per_color ?? 0)
      } else {
        setFormData(createEmptyProduct())
        setSizeTierCosts({ 'S-XL': 3, '2XL': 4, '3XL': 5, '4XL': 6 })
        setDecorationLocations([])
        setTemplateLocations([])
        setPriceBreaks([])
        setSuppliers([])
        setSetupCostPerColor(0)
        setSetupSalePerColor(0)
      }
    }
  }, [isOpen, product])

  // ---- Close on Escape ----
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ---- Prevent body scroll ----
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ---- Field updaters ----
  const updateField = useCallback(<K extends keyof Product>(key: K, value: Product[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // ---- Color handlers ----
  function addColor() {
    const newColor: ProductColor = { name: '', hex: '#000000' }
    setFormData(prev => ({
      ...prev,
      available_colors: [...prev.available_colors, newColor],
    }))
  }

  function updateColor(index: number, updates: Partial<ProductColor>) {
    setFormData(prev => ({
      ...prev,
      available_colors: prev.available_colors.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    }))
  }

  function removeColor(index: number) {
    setFormData(prev => ({
      ...prev,
      available_colors: prev.available_colors.filter((_, i) => i !== index),
    }))
  }

  // ---- Size checkbox toggle ----
  function toggleSize(size: string) {
    setFormData(prev => {
      const current = new Set(prev.available_sizes)
      if (current.has(size)) {
        current.delete(size)
      } else {
        current.add(size)
      }
      return { ...prev, available_sizes: ALL_SIZES.filter(s => current.has(s)) }
    })
  }

  // ---- Decoration location handlers ----
  function addDecorationLocation() {
    setDecorationLocations(prev => [
      ...prev,
      { id: generateId(), position: 'front', method: 'screen-print' },
    ])
  }

  function updateDecorationLocation(id: string, updates: Partial<DecorationLocation>) {
    setDecorationLocations(prev =>
      prev.map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    )
  }

  function removeDecorationLocation(id: string) {
    setDecorationLocations(prev => prev.filter(loc => loc.id !== id))
  }

  // ---- Template decoration location handlers ----

  function addTemplateLocation() {
    setTemplateLocations(prev => [
      ...prev,
      { id: `dloc-${generateId()}`, location_name: 'Front Chest' },
    ])
  }

  function updateTemplateLocation(id: string, updates: Partial<ProductDecorationLocation>) {
    setTemplateLocations(prev =>
      prev.map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    )
  }

  function removeTemplateLocation(id: string) {
    setTemplateLocations(prev => prev.filter(loc => loc.id !== id))
  }

  // ---- Save ----
  const handleSave = useCallback(() => {
    const updatedProduct: Product = {
      ...formData,
      blank_costs: sizeTierCostsToBlankCosts(sizeTierCosts),
      decoration_locations: templateLocations.length > 0 ? templateLocations : undefined,
      all_in_price_breaks: priceBreaks.length > 0 ? priceBreaks : undefined,
      suppliers: suppliers.length > 0 ? suppliers : undefined,
      setup_cost_per_color: setupCostPerColor || undefined,
      setup_sale_per_color: setupSalePerColor || undefined,
      updated_at: new Date().toISOString(),
    }
    onSave(updatedProduct)
  }, [formData, sizeTierCosts, templateLocations, priceBreaks, suppliers, setupCostPerColor, setupSalePerColor, onSave])

  // ---- Determine button label ----
  const isNewProduct = !product
  const saveButtonLabel = isNewProduct ? 'Create Product' : 'Update Product'

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
            />

            {/* Modal centering wrapper */}
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto"
              >
                {/* ===== HEADER: Tabs + Close ===== */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    {TABS.filter(tab => {
                      if (tab === 'Price Breaks' && formData.product_type !== 'all-in') return false
                      if (tab === 'Sizes / Pricing' && formData.product_type === 'all-in') return false
                      return true
                    }).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ===== BODY (scrollable) ===== */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {activeTab === 'Basics' && (
                    <BasicsTab
                      formData={formData}
                      updateField={updateField}
                      saveButtonLabel={saveButtonLabel}
                      onSave={handleSave}
                    />
                  )}

                  {activeTab === 'Sizes / Pricing' && (
                    <SizesPricingTab
                      formData={formData}
                      sizeTierCosts={sizeTierCosts}
                      onSizeTierCostChange={(tier, value) =>
                        setSizeTierCosts(prev => ({ ...prev, [tier]: value }))
                      }
                      onVendorCostChange={(value) => updateField('vendor_cost', value)}
                      toggleSize={toggleSize}
                      saveButtonLabel={saveButtonLabel}
                      onSave={handleSave}
                    />
                  )}

                  {activeTab === 'Variants' && (
                    <VariantsTab
                      formData={formData}
                      toggleSize={toggleSize}
                      addColor={addColor}
                      updateColor={updateColor}
                      removeColor={removeColor}
                      suppliers={suppliers}
                      onSuppliersChange={setSuppliers}
                      saveButtonLabel={saveButtonLabel}
                      onSave={handleSave}
                    />
                  )}

                  {activeTab === 'Price Breaks' && formData.product_type === 'all-in' && (
                    <PriceBreaksTab
                      priceBreaks={priceBreaks}
                      onPriceBreaksChange={setPriceBreaks}
                      setupCostPerColor={setupCostPerColor}
                      onSetupCostChange={setSetupCostPerColor}
                      setupSalePerColor={setupSalePerColor}
                      onSetupSaleChange={setSetupSalePerColor}
                      defaultMarginPercent={35}
                      saveButtonLabel={saveButtonLabel}
                      onSave={handleSave}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}

// ===================================================================
// TAB 1: BASICS
// ===================================================================

function BasicsTab({
  formData,
  updateField,
  saveButtonLabel,
  onSave,
}: {
  formData: Product
  updateField: <K extends keyof Product>(key: K, value: Product[K]) => void
  saveButtonLabel: string
  onSave: () => void
}) {
  const typeInfo = PRODUCT_TYPE_LABELS[formData.product_type] ?? PRODUCT_TYPE_LABELS.contract
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    updateField('primary_image_url', objectUrl)
  }, [updateField])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const objectUrl = URL.createObjectURL(file)
    updateField('primary_image_url', objectUrl)
  }, [updateField])

  return (
    <div className="space-y-6">
      {/* Primary Image — Drag-and-Drop Zone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Primary Image
        </label>
        <div className="flex items-start gap-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors group ${
              isDragging
                ? 'border-primary-400 bg-primary-50'
                : 'border-slate-200 bg-slate-50 hover:border-primary-400 hover:bg-primary-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {formData.primary_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={formData.primary_image_url}
                alt={formData.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-primary-500 transition-colors">
                <ImageIcon className="h-8 w-8" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {isDragging ? 'Drop image' : 'Drop or click'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            {formData.primary_image_url && (
              <button
                type="button"
                onClick={() => updateField('primary_image_url', '')}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showUrlInput ? 'Hide' : 'Paste URL'}
            </button>
          </div>
        </div>
        {showUrlInput && (
          <input
            type="text"
            placeholder="https://cdn.example.com/image.jpg"
            value={formData.primary_image_url || ''}
            onChange={(e) => updateField('primary_image_url', e.target.value)}
            className="mt-2 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. Gildan 5000 Heavy Cotton Tee"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Internal SKU */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Internal SKU
        </label>
        <input
          type="text"
          value={formData.internal_sku ?? ''}
          onChange={(e) => updateField('internal_sku', e.target.value)}
          placeholder="e.g. 5000"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Product Type (display only) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Product Type
        </label>
        <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Package className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{typeInfo.title}</p>
            <p className="text-xs text-slate-500">{typeInfo.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Active Status Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Active Status</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Inactive products won&apos;t appear in project selections
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateField('is_active', !formData.is_active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              formData.is_active ? 'bg-primary-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={formData.is_active}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                formData.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Show on Website Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Show on Website</p>
            <p className="text-xs text-slate-500 mt-0.5">
              When enabled, this product appears in the public catalog
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateField('show_on_website', !formData.show_on_website)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              formData.show_on_website ? 'bg-primary-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={formData.show_on_website}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                formData.show_on_website ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* FB-092: Contract / Price Matrix Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Contract / Price Matrix
        </label>
        <select
          value={formData.contract_matrix ?? ''}
          onChange={(e) => updateField('contract_matrix', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        >
          <option value="">None</option>
          {CONTRACT_MATRIX_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {formData.contract_matrix && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">{formData.contract_matrix}</span>
          </div>
        )}
      </div>

      {/* ASI Price Code (all-in products only) */}
      {formData.product_type === 'all-in' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ASI Price Code
            </label>
            <input
              type="text"
              maxLength={1}
              placeholder="C"
              value={formData.price_code ?? ''}
              onChange={(e) => updateField('price_code', e.target.value.toUpperCase())}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">C = 40%, G = 20% margin</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vendor Source
            </label>
            <input
              type="text"
              placeholder="Hit Promo"
              value={formData.vendor_source ?? ''}
              onChange={(e) => updateField('vendor_source', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  )
}

// ===================================================================
// TAB 2: SIZES / PRICING (FB-083: unified sizes + blank costs)
// ===================================================================

/** Map a size to its cost tier label */
function sizeToCostTier(size: string): keyof SizeTierCosts {
  for (const tier of SIZE_COST_TIERS) {
    if (tier.sizes.includes(size)) return tier.label as keyof SizeTierCosts
  }
  return 'S-XL'
}

function SizesPricingTab({
  formData,
  sizeTierCosts,
  onSizeTierCostChange,
  onVendorCostChange,
  toggleSize,
  saveButtonLabel,
  onSave,
}: {
  formData: Product
  sizeTierCosts: SizeTierCosts
  onSizeTierCostChange: (tier: keyof SizeTierCosts, value: number) => void
  onVendorCostChange: (value: number) => void
  toggleSize: (size: string) => void
  saveButtonLabel: string
  onSave: () => void
}) {
  const isAllIn = formData.product_type === 'all-in'
  const selectedSizes = new Set(formData.available_sizes)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-base font-semibold text-slate-900">Sizes &amp; Pricing</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Select available sizes and set blank costs in one view
        </p>
      </div>

      {/* Info Callout */}
      <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
        <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Toggle sizes on/off. Blank costs are grouped by tier and can be overridden at the project level.
        </p>
      </div>

      {isAllIn ? (
        /* All-In: vendor cost + size toggles */
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Vendor Cost Per Unit
            </label>
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number" onFocus={(e) => e.target.select()}
                min={0}
                step={0.01}
                value={formData.vendor_cost ?? 0}
                onChange={(e) => onVendorCostChange(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    selectedSizes.has(size)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Contract: unified table — Size | Active | Blank Cost */
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_120px] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Size</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">Active</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">Blank Cost</span>
          </div>

          {/* Rows */}
          {ALL_SIZES.map(size => {
            const isActive = selectedSizes.has(size)
            const tier = sizeToCostTier(size)
            const cost = sizeTierCosts[tier] ?? 0

            return (
              <div
                key={size}
                className={`grid grid-cols-[1fr_80px_120px] gap-2 items-center px-4 py-2 border-b border-slate-100 last:border-b-0 transition-colors ${
                  isActive ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                {/* Size label */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {size}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({tier})
                  </span>
                </div>

                {/* Toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      isActive ? 'bg-primary-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={isActive}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Blank cost */}
                <div className="flex justify-end">
                  <div className="relative w-full max-w-[100px]">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                    <input
                      type="number"
                      onFocus={(e) => e.target.select()}
                      min={0}
                      step={0.01}
                      value={cost}
                      onChange={(e) => onSizeTierCostChange(tier, parseFloat(e.target.value) || 0)}
                      className={`w-full pl-5 pr-2 py-1.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow ${
                        isActive ? '' : 'opacity-40'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  )
}

// ===================================================================
// TAB 3: VARIANTS
// ===================================================================

function VariantsTab({
  formData,
  toggleSize,
  addColor,
  updateColor,
  removeColor,
  suppliers,
  onSuppliersChange,
  saveButtonLabel,
  onSave,
}: {
  formData: Product
  toggleSize: (size: string) => void
  addColor: () => void
  updateColor: (index: number, updates: Partial<ProductColor>) => void
  removeColor: (index: number) => void
  suppliers: SupplierPricing[]
  onSuppliersChange: (suppliers: SupplierPricing[]) => void
  saveButtonLabel: string
  onSave: () => void
}) {
  const selectedSizes = new Set(formData.available_sizes)

  return (
    <div className="space-y-8">
      {/* Available Sizes */}
      <div>
        <h3 className="text-base font-semibold text-slate-900">Available Sizes</h3>
        <p className="text-sm text-slate-500 mt-0.5 mb-4">
          Select which sizes this product is available in
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(size => {
            const isSelected = selectedSizes.has(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {size}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Colors</h3>
          <button
            type="button"
            onClick={addColor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Color
          </button>
        </div>

        {formData.available_colors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-200 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <ImageIcon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 mb-1">No colors added yet</p>
            <button
              type="button"
              onClick={addColor}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              + Add your first color
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.available_colors.map((color, index) => {
              const images = color.images ?? []
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors group"
                >
                  {/* Color header row */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Color Swatch (click to open native picker) */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-inner"
                        style={{ backgroundColor: color.hex || '#000000' }}
                      />
                      <input
                        type="color"
                        value={color.hex || '#000000'}
                        onChange={(e) => updateColor(index, { hex: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Pick a color"
                      />
                    </div>

                    {/* Color Name */}
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColor(index, { name: e.target.value })}
                      placeholder="Color name"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    />

                    {/* Hex Input + AI Detect */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={color.hex || ''}
                        onChange={(e) => updateColor(index, { hex: e.target.value })}
                        placeholder="#000000"
                        className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const hex = detectHexFromColorName(color.name)
                          updateColor(index, { hex })
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="AI Detect Color"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove color"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Images section — Drag-and-Drop */}
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Images ({images.length}/5)
                      </span>
                    </div>

                    <div className="flex items-start gap-2 flex-wrap">
                      {/* Existing images as thumbnails */}
                      {images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group/img">
                          <div
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden cursor-pointer ${
                              img.is_primary ? 'border-primary-400 ring-1 ring-primary-200' : 'border-slate-200'
                            }`}
                            onClick={() => {
                              const newImages = images.map((im, i) => ({
                                ...im,
                                is_primary: i === imgIdx,
                              }))
                              updateColor(index, { images: newImages })
                            }}
                            title={img.is_primary ? 'Primary image' : 'Click to set as primary'}
                          >
                            {img.url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={img.url}
                                alt={`${color.name} ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                          {img.is_primary && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">P</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = images.filter((_, i) => i !== imgIdx)
                              if (newImages.length > 0 && !newImages.some(im => im.is_primary)) {
                                newImages[0] = { ...newImages[0], is_primary: true }
                              }
                              updateColor(index, { images: newImages })
                            }}
                            className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}

                      {/* Drop zone for adding new images */}
                      {images.length < 5 && (
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-400', 'bg-primary-50') }}
                          onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50') }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50')
                            const file = e.dataTransfer.files?.[0]
                            if (!file || !file.type.startsWith('image/')) return
                            const objectUrl = URL.createObjectURL(file)
                            const newImages = [...images, { url: objectUrl, is_primary: images.length === 0 }]
                            updateColor(index, { images: newImages })
                          }}
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (ev) => {
                              const file = (ev.target as HTMLInputElement).files?.[0]
                              if (!file) return
                              const objectUrl = URL.createObjectURL(file)
                              const newImages = [...images, { url: objectUrl, is_primary: images.length === 0 }]
                              updateColor(index, { images: newImages })
                            }
                            input.click()
                          }}
                          className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                          title="Drop image or click to upload"
                        >
                          <Plus className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {images.length === 0 && (
                      <p className="text-[10px] text-slate-400 mt-1">Drop images or click + to upload</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Suppliers (G18 — Multi-Supplier Pricing) ── */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Suppliers</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Add alternate supplier pricing for this product
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSuppliersChange([
                ...suppliers,
                { supplier_name: '', blank_costs: [{ min_quantity: 1, max_quantity: 9999, cost_per_unit: 0 }] },
              ])
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Supplier
          </button>
        </div>

        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 rounded-lg">
            <Package className="h-5 w-5 text-slate-300 mb-1.5" />
            <p className="text-sm text-slate-400">No alternate suppliers yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier, sIdx) => (
              <div
                key={sIdx}
                className="border border-slate-200 rounded-lg bg-white p-4 group"
              >
                {/* Supplier header */}
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={supplier.supplier_name}
                    onChange={(e) => {
                      const updated = suppliers.map((s, i) =>
                        i === sIdx ? { ...s, supplier_name: e.target.value } : s
                      )
                      onSuppliersChange(updated)
                    }}
                    placeholder="Supplier name"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => onSuppliersChange(suppliers.filter((_, i) => i !== sIdx))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove supplier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Blank costs for this supplier */}
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 px-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Min Qty</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Max Qty</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cost/Unit</span>
                    <span />
                  </div>
                  {supplier.blank_costs.map((bc, bcIdx) => (
                    <div key={bcIdx} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-center">
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        min={0}
                        value={bc.min_quantity}
                        onChange={(e) => {
                          const updated = suppliers.map((s, si) => {
                            if (si !== sIdx) return s
                            const costs = s.blank_costs.map((c, ci) =>
                              ci === bcIdx ? { ...c, min_quantity: Number(e.target.value) } : c
                            )
                            return { ...s, blank_costs: costs }
                          })
                          onSuppliersChange(updated)
                        }}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        min={0}
                        value={bc.max_quantity}
                        onChange={(e) => {
                          const updated = suppliers.map((s, si) => {
                            if (si !== sIdx) return s
                            const costs = s.blank_costs.map((c, ci) =>
                              ci === bcIdx ? { ...c, max_quantity: Number(e.target.value) } : c
                            )
                            return { ...s, blank_costs: costs }
                          })
                          onSuppliersChange(updated)
                        }}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                        <input
                          type="number"
                          onFocus={(e) => e.target.select()}
                          min={0}
                          step={0.01}
                          value={bc.cost_per_unit}
                          onChange={(e) => {
                            const updated = suppliers.map((s, si) => {
                              if (si !== sIdx) return s
                              const costs = s.blank_costs.map((c, ci) =>
                                ci === bcIdx ? { ...c, cost_per_unit: parseFloat(e.target.value) || 0 } : c
                              )
                              return { ...s, blank_costs: costs }
                            })
                            onSuppliersChange(updated)
                          }}
                          className="w-full pl-5 pr-2 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (supplier.blank_costs.length <= 1) return
                          const updated = suppliers.map((s, si) => {
                            if (si !== sIdx) return s
                            return { ...s, blank_costs: s.blank_costs.filter((_, ci) => ci !== bcIdx) }
                          })
                          onSuppliersChange(updated)
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove cost tier"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = suppliers.map((s, si) => {
                        if (si !== sIdx) return s
                        return {
                          ...s,
                          blank_costs: [...s.blank_costs, { min_quantity: 1, max_quantity: 9999, cost_per_unit: 0 }],
                        }
                      })
                      onSuppliersChange(updated)
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add cost tier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  )
}

// ===================================================================
// TAB 4: DECORATIONS
// ===================================================================

function DecorationsTab({
  locations,
  addLocation,
  updateLocation,
  removeLocation,
  templateLocations,
  addTemplateLocation,
  updateTemplateLocation,
  removeTemplateLocation,
  saveButtonLabel,
  onSave,
}: {
  locations: DecorationLocation[]
  addLocation: () => void
  updateLocation: (id: string, updates: Partial<DecorationLocation>) => void
  removeLocation: (id: string) => void
  templateLocations: ProductDecorationLocation[]
  addTemplateLocation: () => void
  updateTemplateLocation: (id: string, updates: Partial<ProductDecorationLocation>) => void
  removeTemplateLocation: (id: string) => void
  saveButtonLabel: string
  onSave: () => void
}) {
  return (
    <div className="space-y-6">
      {/* ── Template Decoration Locations ── */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Template Decoration Locations</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Pre-defined locations with placeholder charges. Applied when this product is added to a project.
            </p>
          </div>
          <button
            type="button"
            onClick={addTemplateLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Location
          </button>
        </div>
      </div>

      {/* Warning Callout */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Placeholder Values Only</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            These pricing values are temporary placeholders. Real decoration pricing will be configured separately once decoration types are implemented.
          </p>
        </div>
      </div>

      {templateLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-200 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">No template locations defined</p>
          <p className="text-xs text-slate-400">
            Add locations like &quot;Front Chest&quot;, &quot;Full Back&quot;, or &quot;Left Sleeve&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_100px_32px] gap-3 px-4 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Run Charge</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Setup Charge</span>
            <span />
          </div>

          {templateLocations.map(loc => (
            <div
              key={loc.id}
              className="grid grid-cols-[1fr_100px_100px_32px] gap-3 items-center px-4 py-2.5 border border-slate-200 rounded-lg bg-white group"
            >
              {/* Location Name — dropdown with presets + custom */}
              <select
                value={DECORATION_LOCATION_PRESETS.includes(loc.location_name as typeof DECORATION_LOCATION_PRESETS[number]) ? loc.location_name : '__custom__'}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    updateTemplateLocation(loc.id, { location_name: '' })
                  } else {
                    updateTemplateLocation(loc.id, { location_name: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              >
                {DECORATION_LOCATION_PRESETS.map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>

              {/* Run Charge */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                <input
                  type="number"
                  onFocus={(e) => e.target.select()}
                  min={0}
                  step={0.01}
                  value={loc.placeholder_run_charge ?? 0}
                  onChange={(e) => updateTemplateLocation(loc.id, { placeholder_run_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-5 pr-2 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Setup Charge */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                <input
                  type="number"
                  onFocus={(e) => e.target.select()}
                  min={0}
                  step={0.01}
                  value={loc.placeholder_setup_charge ?? 0}
                  onChange={(e) => updateTemplateLocation(loc.id, { placeholder_setup_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-5 pr-2 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeTemplateLocation(loc.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove location"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Legacy Decoration Locations (Position + Method) ── */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Applicable Decorations</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Define position + method pairs for this product
            </p>
          </div>
          <button
            type="button"
            onClick={addLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">No decoration pairs defined</p>
          <p className="text-xs text-slate-400">
            Add position + method pairs
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map(loc => (
            <div
              key={loc.id}
              className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg bg-white group"
            >
              {/* Position Dropdown */}
              <div className="flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Position
                </label>
                <select
                  value={loc.position}
                  onChange={(e) => updateLocation(loc.id, { position: e.target.value as DecorationPosition })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                >
                  {DECORATION_POSITIONS.map(pos => (
                    <option key={pos} value={pos}>
                      {DECORATION_POSITION_LABELS[pos]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Method Dropdown */}
              <div className="flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Method
                </label>
                <select
                  value={loc.method}
                  onChange={(e) => updateLocation(loc.id, { method: e.target.value as DecorationMethod })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                >
                  {DECORATION_METHODS.map(method => (
                    <option key={method} value={method}>
                      {DECORATION_METHOD_LABELS[method]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeLocation(loc.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors self-end mb-0.5 opacity-0 group-hover:opacity-100"
                title="Remove location"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  )
}

// ===================================================================
// TAB 5: PRICE BREAKS (All-In Products Only)
// ===================================================================

const PRICE_CODES: PriceCode[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'P', 'R']

function PriceBreaksTab({
  priceBreaks,
  onPriceBreaksChange,
  setupCostPerColor,
  onSetupCostChange,
  setupSalePerColor,
  onSetupSaleChange,
  defaultMarginPercent,
  saveButtonLabel,
  onSave,
}: {
  priceBreaks: AllInPriceBreak[]
  onPriceBreaksChange: (breaks: AllInPriceBreak[]) => void
  setupCostPerColor: number
  onSetupCostChange: (v: number) => void
  setupSalePerColor: number
  onSetupSaleChange: (v: number) => void
  defaultMarginPercent: number
  saveButtonLabel: string
  onSave: () => void
}) {
  function addColumn() {
    const lastBreak = priceBreaks[priceBreaks.length - 1]
    const newMin = lastBreak ? lastBreak.max_quantity + 1 : 1
    const newBreak: AllInPriceBreak = {
      min_quantity: newMin,
      max_quantity: newMin + 99,
      list_price: 0,
      price_code: 'C' as PriceCode,
      net_cost: 0,
    }
    onPriceBreaksChange([...priceBreaks, newBreak])
  }

  function removeColumn(index: number) {
    if (priceBreaks.length <= 1) return
    onPriceBreaksChange(priceBreaks.filter((_, i) => i !== index))
  }

  function updateBreak(index: number, field: keyof AllInPriceBreak, value: number | string) {
    const updated = priceBreaks.map((brk, i) => {
      if (i !== index) return brk
      const next = { ...brk, [field]: value }
      // Recompute net_cost whenever list_price or price_code changes
      if (field === 'list_price' || field === 'price_code') {
        const discount = PRICE_CODE_DISCOUNTS[next.price_code] ?? 0
        next.net_cost = +(next.list_price * (1 - discount)).toFixed(4)
      }
      return next
    })
    onPriceBreaksChange(updated)
  }

  // Determine margin health: green if >= defaultMarginPercent, red if below
  function getMarginColor(netCost: number, listPrice: number): string {
    if (listPrice <= 0) return 'text-slate-400'
    const margin = ((listPrice - netCost) / listPrice) * 100
    return margin >= defaultMarginPercent ? 'text-emerald-600' : 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Price Break Tiers</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Define quantity-based pricing with ASI/PPAI price codes
          </p>
        </div>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Column
        </button>
      </div>

      {priceBreaks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-lg">
          <Package className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 mb-1">No price breaks defined</p>
          <p className="text-xs text-slate-400 mb-3">Add quantity tiers with price codes for this all-in product</p>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Tier
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5 w-24 sticky left-0 bg-slate-50 z-10">
                  &nbsp;
                </th>
                {priceBreaks.map((_, i) => (
                  <th key={i} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5 min-w-[110px]">
                    <div className="flex items-center justify-center gap-1">
                      Tier {i + 1}
                      {priceBreaks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(i)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove tier"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Min Qty Row */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-3 py-2 sticky left-0 bg-white z-10">Min Qty</td>
                {priceBreaks.map((brk, i) => (
                  <td key={i} className="text-center px-2 py-1.5">
                    <input
                      type="number" onFocus={(e) => e.target.select()}
                      min={0}
                      value={brk.min_quantity}
                      onChange={(e) => updateBreak(i, 'min_quantity', Number(e.target.value))}
                      className="w-full h-7 px-2 text-xs font-mono text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </td>
                ))}
              </tr>

              {/* Max Qty Row */}
              <tr className="border-t border-slate-50 bg-slate-50/30">
                <td className="text-xs font-medium text-slate-600 px-3 py-2 sticky left-0 bg-slate-50/30 z-10">Max Qty</td>
                {priceBreaks.map((brk, i) => (
                  <td key={i} className="text-center px-2 py-1.5">
                    <input
                      type="number" onFocus={(e) => e.target.select()}
                      min={0}
                      value={brk.max_quantity}
                      onChange={(e) => updateBreak(i, 'max_quantity', Number(e.target.value))}
                      className="w-full h-7 px-2 text-xs font-mono text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </td>
                ))}
              </tr>

              {/* List Price Row */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-3 py-2 sticky left-0 bg-white z-10">List Price</td>
                {priceBreaks.map((brk, i) => (
                  <td key={i} className="text-center px-2 py-1.5">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
                      <input
                        type="number" onFocus={(e) => e.target.select()}
                        min={0}
                        step={0.01}
                        value={brk.list_price}
                        onChange={(e) => updateBreak(i, 'list_price', Number(e.target.value))}
                        className="w-full h-7 pl-5 pr-2 text-xs font-mono text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Code Row */}
              <tr className="border-t border-slate-50 bg-slate-50/30">
                <td className="text-xs font-medium text-slate-600 px-3 py-2 sticky left-0 bg-slate-50/30 z-10">Price Code</td>
                {priceBreaks.map((brk, i) => (
                  <td key={i} className="text-center px-2 py-1.5">
                    <select
                      value={brk.price_code}
                      onChange={(e) => updateBreak(i, 'price_code', e.target.value)}
                      className="w-full h-7 px-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {PRICE_CODES.map(code => (
                        <option key={code} value={code}>{PRICE_CODE_LABELS[code]}</option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>

              {/* Net Cost Row (read-only, computed) */}
              <tr className="border-t border-slate-200 bg-slate-100/60">
                <td className="text-xs font-bold text-slate-700 px-3 py-2.5 sticky left-0 bg-slate-100/60 z-10">Net Cost</td>
                {priceBreaks.map((brk, i) => (
                  <td
                    key={i}
                    className={`text-center font-mono text-xs font-bold px-3 py-2.5 ${getMarginColor(brk.net_cost, brk.list_price)}`}
                  >
                    ${brk.net_cost.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Setup Charges */}
      <div className="border-t border-slate-200 pt-5">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Setup Charges</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Setup Cost / Color
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number" onFocus={(e) => e.target.select()}
                min={0}
                step={0.01}
                value={setupCostPerColor}
                onChange={(e) => onSetupCostChange(Number(e.target.value))}
                className="w-full h-9 pl-7 pr-3 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Your cost per color for setup</p>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Setup Sale / Color
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number" onFocus={(e) => e.target.select()}
                min={0}
                step={0.01}
                value={setupSalePerColor}
                onChange={(e) => onSetupSaleChange(Number(e.target.value))}
                className="w-full h-9 pl-7 pr-3 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">What you charge the client per color</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  )
}
