"use client"

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import Portal from '@/components/shared/Portal'
import {
  Wand2,
  Globe,
  Image as ImageIcon,
  Palette,
  Star,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronDown,
  Package,
} from 'lucide-react'
import type {
  ScrapedProductData,
  Product,
  ProductCategory,
  ProductType,
  ProductColor,
  BlankCost,
} from '@/lib/types/app'
import { PRODUCT_CATEGORY_LABELS } from '@/lib/constants/app'

// ===== CONSTANTS =====

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = Object.entries(
  PRODUCT_CATEGORY_LABELS
).map(([value, label]) => ({ value: value as ProductCategory, label }))

const PRODUCT_TYPE_INFO: Record<ProductType, { label: string; description: string }> = {
  contract: { label: 'Contract', description: 'Blank + decoration pricing' },
  'all-in': { label: 'All-In', description: 'Single vendor cost per unit' },
}

// ===== HELPERS =====

function generateId(): string {
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Guess a category from the product name */
function guessCategory(name: string): ProductCategory {
  const lower = name.toLowerCase()
  if (lower.includes('tee') || lower.includes('t-shirt') || lower.includes('jersey')) return 'short-sleeve-tees'
  if (lower.includes('long sleeve')) return 'long-sleeve-tees'
  if (lower.includes('hoodie') || lower.includes('sweatshirt') || lower.includes('fleece')) return 'sweatshirts-hoodies'
  if (lower.includes('polo')) return 'polos'
  if (lower.includes('jacket') || lower.includes('vest') || lower.includes('windbreaker')) return 'jackets-outerwear'
  if (lower.includes('hat') || lower.includes('cap') || lower.includes('beanie')) return 'hats-caps'
  if (lower.includes('bag') || lower.includes('tote') || lower.includes('backpack')) return 'bags-totes'
  if (lower.includes('mug') || lower.includes('tumbler') || lower.includes('bottle') || lower.includes('cup')) return 'drinkware'
  if (lower.includes('sunglasses') || lower.includes('koozie') || lower.includes('cooler')) return 'koozies'
  if (lower.includes('lanyard') || lower.includes('badge')) return 'lanyards-badges'
  if (lower.includes('pen') || lower.includes('notepad') || lower.includes('notebook')) return 'office-supplies'
  if (lower.includes('charger') || lower.includes('usb') || lower.includes('earbuds')) return 'tech-accessories'
  if (lower.includes('sticker') || lower.includes('patch')) return 'stickers-patches'
  return 'other'
}

// ===== PROPS =====

interface ProductScrapeReviewProps {
  isOpen: boolean
  onClose: () => void
  scrapedData: ScrapedProductData
  onPublish: (product: Product) => void
}

// ===== COMPONENT =====

export default function ProductScrapeReview({
  isOpen,
  onClose,
  scrapedData,
  onPublish,
}: ProductScrapeReviewProps) {
  // ---- Form state ----
  const [productName, setProductName] = useState(scrapedData.product_name)
  const [description, setDescription] = useState(scrapedData.description)
  const [showOriginal, setShowOriginal] = useState(false)
  const [category, setCategory] = useState<ProductCategory>(() => guessCategory(scrapedData.product_name))
  const [productType, setProductType] = useState<ProductType>('contract')

  // Image inclusion/exclusion state: index -> included
  const [imageStates, setImageStates] = useState<Record<number, boolean>>(() => {
    const states: Record<number, boolean> = {}
    scrapedData.images.forEach((_, i) => { states[i] = true })
    return states
  })
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

  // Color inclusion state: index -> included
  const [colorStates, setColorStates] = useState<Record<number, boolean>>(() => {
    const states: Record<number, boolean> = {}
    scrapedData.colors.forEach((_, i) => { states[i] = true })
    return states
  })

  // Size inclusion state: index -> included
  const [sizeStates, setSizeStates] = useState<Record<number, boolean>>(() => {
    const states: Record<number, boolean> = {}
    scrapedData.sizes.forEach((_, i) => { states[i] = true })
    return states
  })

  // Pricing state
  const [vendorCost, setVendorCost] = useState(scrapedData.msrp ?? 0)
  const [costTiers, setCostTiers] = useState<BlankCost[]>([
    { min_quantity: 1, max_quantity: 49, cost_per_unit: 0 },
    { min_quantity: 50, max_quantity: 99, cost_per_unit: 0 },
    { min_quantity: 100, max_quantity: 499, cost_per_unit: 0 },
    { min_quantity: 500, max_quantity: 9999, cost_per_unit: 0 },
  ])

  // Lightbox for full-size image preview
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Toggles
  const [isActive, setIsActive] = useState(true)
  const [showOnWebsite, setShowOnWebsite] = useState(false)

  // ---- Image handlers ----
  const toggleImage = useCallback((index: number) => {
    setImageStates(prev => {
      const next = { ...prev, [index]: !prev[index] }
      // If we're excluding the primary, find next included image
      if (!next[index] && index === primaryImageIndex) {
        const nextPrimary = Object.entries(next).find(([, included]) => included)
        if (nextPrimary) setPrimaryImageIndex(Number(nextPrimary[0]))
      }
      return next
    })
  }, [primaryImageIndex])

  const setPrimary = useCallback((index: number) => {
    // Only set primary if image is included
    if (imageStates[index]) {
      setPrimaryImageIndex(index)
    }
  }, [imageStates])

  // ---- Color handlers ----
  const toggleColor = useCallback((index: number) => {
    setColorStates(prev => ({ ...prev, [index]: !prev[index] }))
  }, [])

  // ---- Size handlers ----
  const toggleSize = useCallback((index: number) => {
    setSizeStates(prev => ({ ...prev, [index]: !prev[index] }))
  }, [])

  // ---- Cost tier handlers ----
  const updateCostTier = useCallback((index: number, field: 'min_quantity' | 'max_quantity' | 'cost_per_unit', value: number) => {
    setCostTiers(prev => prev.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier
    ))
  }, [])

  // ---- Publish handler ----
  const handlePublish = useCallback(() => {
    const includedImages = scrapedData.images.filter((_, i) => imageStates[i])
    const primaryUrl = imageStates[primaryImageIndex]
      ? scrapedData.images[primaryImageIndex]
      : includedImages[0] || undefined

    const includedColors: ProductColor[] = scrapedData.colors
      .filter((_, i) => colorStates[i])
      .map(c => ({
        name: c.name,
        hex: c.hex || '#000000',
        swatch_url: c.swatch_url,
      }))

    const includedSizes = scrapedData.sizes.filter((_, i) => sizeStates[i])

    const product: Product = {
      id: generateId(),
      org_id: 'demo-org',
      name: productName,
      internal_sku: scrapedData.supplier_sku,
      product_type: productType,
      category,
      description,
      primary_image_url: primaryUrl,
      additional_images: includedImages.filter(img => img !== primaryUrl),
      available_colors: includedColors,
      available_sizes: includedSizes,
      blank_costs: productType === 'contract' ? costTiers : [],
      vendor_cost: productType === 'all-in' ? vendorCost : undefined,
      applicable_decorations: [],
      supplier_name: scrapedData.supplier_name,
      vendor_source: new URL(scrapedData.source_url).hostname,
      is_active: isActive,
      show_on_website: showOnWebsite,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onPublish(product)
  }, [
    scrapedData, productName, description, category, productType,
    imageStates, primaryImageIndex, colorStates, sizeStates,
    costTiers, vendorCost, isActive, showOnWebsite, onPublish,
  ])

  if (!isOpen) return null

  // Count included items for summary
  const includedImageCount = Object.values(imageStates).filter(Boolean).length
  const includedColorCount = Object.values(colorStates).filter(Boolean).length
  const includedSizeCount = Object.values(sizeStates).filter(Boolean).length

  return (
    <>
    <Portal>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto"
        >
          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">AI Product Import</h2>
                <p className="text-xs text-slate-500">Review extracted data before publishing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ===== BODY (scrollable) ===== */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Source URL + Supplier Info */}
            <div className="flex items-center gap-4 px-4 py-3 bg-violet-50 border border-violet-200 rounded-lg">
              <Globe className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <a
                href={scrapedData.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-700 hover:text-violet-900 underline underline-offset-2 truncate flex-1"
              >
                {scrapedData.source_url}
              </a>
              <span className="text-xs text-slate-500 flex-shrink-0">
                {scrapedData.supplier_name} &middot; {scrapedData.supplier_sku}
              </span>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* LEFT COLUMN (3/5) */}
              <div className="lg:col-span-3 space-y-5">

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow appearance-none pr-10"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Product Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Product Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProductType('contract')}
                      className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        productType === 'contract'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{PRODUCT_TYPE_INFO.contract.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{PRODUCT_TYPE_INFO.contract.description}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductType('all-in')}
                      className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        productType === 'all-in'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{PRODUCT_TYPE_INFO['all-in'].label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{PRODUCT_TYPE_INFO['all-in'].description}</p>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Description
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-violet-600">
                        <Wand2 className="w-3 h-3" /> AI-enhanced
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showOriginal ? 'Hide Original' : 'Show Original'}
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow resize-none"
                  />
                  {showOriginal && (
                    <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-400 font-medium mb-1">Original Description</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{scrapedData.original_description}</p>
                    </div>
                  )}
                </div>

                {/* Specs Table */}
                {Object.keys(scrapedData.specs).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Specifications
                    </label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      {Object.entries(scrapedData.specs).map(([key, value], i) => (
                        <div
                          key={key}
                          className={`flex items-center px-3 py-2 text-sm ${
                            i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          }`}
                        >
                          <span className="w-1/3 text-slate-500 font-medium">{key}</span>
                          <span className="w-2/3 text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (2/5) */}
              <div className="lg:col-span-2 space-y-5">

                {/* Images Grid */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <label className="text-sm font-medium text-slate-700">
                      Images
                      <span className="ml-1 text-xs text-slate-400">({includedImageCount}/{scrapedData.images.length})</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {scrapedData.images.map((img, i) => {
                      const isIncluded = imageStates[i]
                      const isPrimary = i === primaryImageIndex && isIncluded
                      return (
                        <div
                          key={i}
                          className={`relative group rounded-lg border-2 overflow-hidden transition-all ${
                            isPrimary
                              ? 'border-violet-400 ring-2 ring-violet-200'
                              : isIncluded
                                ? 'border-slate-200 hover:border-slate-300'
                                : 'border-slate-200 opacity-40'
                          }`}
                        >
                          {/* Image preview — click to expand */}
                          <div
                            className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden cursor-zoom-in"
                            onClick={() => setLightboxIndex(i)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`Product ${i + 1}`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                const placeholder = document.createElement('div')
                                placeholder.className = 'flex flex-col items-center justify-center gap-1 text-slate-300'
                                placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 16-4-4-3 3-4-4-6 6"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg><span class="text-[9px] text-slate-400">Failed</span>'
                                target.parentElement!.appendChild(placeholder)
                              }}
                            />
                          </div>

                          {/* Primary star badge */}
                          {isPrimary && (
                            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}

                          {/* Include/Exclude toggle */}
                          <button
                            type="button"
                            onClick={() => toggleImage(i)}
                            className="absolute top-1.5 right-1.5"
                          >
                            {isIncluded ? (
                              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center hover:bg-slate-500 transition-colors">
                                <X className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>

                          {/* Set as primary button (on hover, only if included) */}
                          {isIncluded && !isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(i)}
                              className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set Primary
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <label className="text-sm font-medium text-slate-700">
                      Colors
                      <span className="ml-1 text-xs text-slate-400">({includedColorCount}/{scrapedData.colors.length})</span>
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    {scrapedData.colors.map((color, i) => {
                      const isIncluded = colorStates[i]
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleColor(i)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            isIncluded
                              ? 'border-slate-200 bg-white hover:border-slate-300'
                              : 'border-slate-100 bg-slate-50 opacity-50 hover:opacity-70'
                          }`}
                        >
                          {/* Swatch */}
                          <div
                            className="w-6 h-6 rounded-full border border-slate-200 flex-shrink-0"
                            style={{ backgroundColor: color.hex || '#CCCCCC' }}
                          />
                          {/* Name */}
                          <span className="flex-1 text-left text-slate-700">{color.name}</span>
                          {/* Check indicator */}
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isIncluded
                              ? 'bg-violet-600 border-violet-600'
                              : 'bg-white border-slate-300'
                          }`}>
                            {isIncluded && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sizes
                    <span className="ml-1 text-xs text-slate-400">({includedSizeCount}/{scrapedData.sizes.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {scrapedData.sizes.map((size, i) => {
                      const isIncluded = sizeStates[i]
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleSize(i)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            isIncluded
                              ? 'bg-violet-50 border-violet-300 text-violet-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PRICING SECTION ===== */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {productType === 'contract' ? 'Blank Cost Tiers' : 'Vendor Cost'}
              </h3>

              {productType === 'all-in' ? (
                <div className="max-w-xs">
                  <label className="block text-xs text-slate-500 mb-1">Cost Per Unit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                    <input
                      type="number"
                      onFocus={(e) => e.target.select()}
                      min={0}
                      step={0.01}
                      value={vendorCost}
                      onChange={(e) => setVendorCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  {scrapedData.msrp && (
                    <p className="text-xs text-slate-400 mt-1">MSRP: ${scrapedData.msrp.toFixed(2)}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {costTiers.map((tier, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex gap-1.5">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Min Qty</label>
                          <input
                            type="number"
                            onFocus={(e) => e.target.select()}
                            min={1}
                            value={tier.min_quantity}
                            onChange={(e) => updateCostTier(i, 'min_quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Max Qty</label>
                          <input
                            type="number"
                            onFocus={(e) => e.target.select()}
                            min={1}
                            value={tier.max_quantity}
                            onChange={(e) => updateCostTier(i, 'max_quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Cost/Unit</label>
                        <span className="absolute left-2 bottom-2 text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          onFocus={(e) => e.target.select()}
                          min={0}
                          step={0.01}
                          value={tier.cost_per_unit}
                          onChange={(e) => updateCostTier(i, 'cost_per_unit', parseFloat(e.target.value) || 0)}
                          className="w-full pl-5 pr-2 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== TOGGLES ===== */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              {/* Active */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Active</p>
                  <p className="text-xs text-slate-500">Available for selection in projects</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isActive ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Show on Website */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Show on Website</p>
                  <p className="text-xs text-slate-500">Display in public product catalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnWebsite(!showOnWebsite)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showOnWebsite ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={showOnWebsite}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    showOnWebsite ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-xl">
            <div className="text-xs text-slate-400">
              {includedColorCount} colors &middot; {includedSizeCount} sizes &middot; {includedImageCount} images
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!productName.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Package className="w-4 h-4" />
                Publish to Catalog
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </Portal>

      {/* ===== IMAGE LIGHTBOX (separate Portal to render above modal) ===== */}
      {lightboxIndex !== null && scrapedData.images[lightboxIndex] && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scrapedData.images[lightboxIndex]}
                alt={`Product image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {/* Close button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
              {/* Nav arrows */}
              {lightboxIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(lightboxIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-slate-600 rotate-90" />
                </button>
              )}
              {lightboxIndex < scrapedData.images.length - 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(lightboxIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-slate-600 -rotate-90" />
                </button>
              )}
              {/* Image counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                {lightboxIndex + 1} / {scrapedData.images.length}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
