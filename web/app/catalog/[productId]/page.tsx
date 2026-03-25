"use client"

/**
 * Product Detail Page — Public product view with configuration demo.
 *
 * Public-facing, no auth required. Minimal layout outside dashboard.
 * Uses demo data provider for product info.
 *
 * FB-111/112/113: Real quote request flow replaces "Start a Project" link.
 */

import { useState, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getDemoProductsList, getDemoProductsFull } from "@/lib/demo/demo-data-provider"
import type { ProductColor } from "@/lib/types/app"
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Minus,
  Plus,
  Layers,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react"

// Markup factor applied to blank_cost_min for public display pricing
const MARKUP_FACTOR = 1.54

// Available decoration methods for the configuration demo
const DECORATION_METHODS = [
  { id: "screen-print", label: "Screen Print" },
  { id: "embroidery", label: "Embroidery" },
  { id: "dtg", label: "DTG" },
  { id: "heat-transfer", label: "Heat Transfer" },
] as const

// FB-109: Synthetic colors for products without full data
const SYNTHETIC_COLORS: Record<string, ProductColor[]> = {
  'prod-3': [
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#654321' },
    { name: 'Carhartt Gold', hex: '#C5A253' },
  ],
  'prod-4': [
    { name: 'Black', hex: '#000000' },
    { name: 'Stainless', hex: '#C0C0C0' },
    { name: 'Navy', hex: '#1B2A4A' },
    { name: 'White', hex: '#FFFFFF' },
  ],
  'prod-5': [
    { name: 'Black', hex: '#000000' },
    { name: 'Sapphire Blue', hex: '#0F52BA' },
    { name: 'Scarlet Red', hex: '#DC143C' },
  ],
  'prod-6': [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1B2A4A' },
    { name: 'Red', hex: '#CC0000' },
  ],
  'prod-8': [
    { name: 'Black', hex: '#000000' },
    { name: 'Navy', hex: '#1B2A4A' },
    { name: 'Sport Grey', hex: '#9CA3AF' },
    { name: 'Red', hex: '#CC0000' },
  ],
  'prod-9': [
    { name: 'Black/White', hex: '#000000' },
    { name: 'Charcoal/White', hex: '#36454F' },
    { name: 'Navy/White', hex: '#1B2A4A' },
    { name: 'Red/White', hex: '#CC0000' },
  ],
  'prod-10': [
    { name: 'Pepper', hex: '#3D3D3D' },
    { name: 'Blue Jean', hex: '#5B8AA8' },
    { name: 'Butter', hex: '#FFFBCC' },
    { name: 'Seafoam', hex: '#93E9BE' },
    { name: 'Brick', hex: '#CB4154' },
  ],
}

// FB-109: Category gradients (static — Tailwind JIT Law 13)
const CATEGORY_GRADIENTS: Record<string, { from: string; to: string }> = {
  Apparel: { from: 'from-blue-100', to: 'to-indigo-50' },
  Drinkware: { from: 'from-amber-100', to: 'to-orange-50' },
  Office: { from: 'from-emerald-100', to: 'to-teal-50' },
}

// FB-111: Quote request form shape
interface QuoteForm {
  company_name: string
  contact_name: string
  email: string
  phone: string
  notes: string
  billing_is_shipping: boolean
}

const INITIAL_QUOTE_FORM: QuoteForm = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  notes: '',
  billing_is_shipping: true,
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.productId as string

  const products = getDemoProductsList()
  const product = products.find((p) => p.id === productId)
  const fullProducts = useMemo(() => getDemoProductsFull(), [])

  // Build color map
  const productColors = useMemo(() => {
    const fp = fullProducts.find(p => p.id === productId)
    if (fp) return fp.available_colors
    return SYNTHETIC_COLORS[productId] ?? []
  }, [fullProducts, productId])

  // ---------------------------------------------------------------------------
  // Configuration state (display/demo only)
  // ---------------------------------------------------------------------------
  const [quantity, setQuantity] = useState(100)
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    "screen-print",
  ])

  // FB-111: Quote request flow state
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteForm, setQuoteForm] = useState<QuoteForm>(INITIAL_QUOTE_FORM)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

  // Computed pricing
  const unitPrice = product
    ? +(product.blank_cost_min * MARKUP_FACTOR).toFixed(2)
    : 0
  const estimatedTotal = useMemo(
    () => +(unitPrice * quantity).toFixed(2),
    [unitPrice, quantity]
  )

  // Toggle a decoration method
  function toggleMethod(methodId: string) {
    setSelectedMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId]
    )
  }

  // Quantity helpers
  function incrementQuantity() {
    setQuantity((q) => q + 25)
  }
  function decrementQuantity() {
    setQuantity((q) => Math.max(1, q - 25))
  }

  // FB-112: Handle quote submission
  function handleQuoteSubmit() {
    if (!quoteForm.contact_name.trim() || !quoteForm.email.trim()) return
    setQuoteSubmitted(true)
  }

  // ---------------------------------------------------------------------------
  // Product not found
  // ---------------------------------------------------------------------------
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-heading text-slate-900 mb-2">
              Product not found
            </h1>
            <p className="text-slate-500 mb-6">
              The product you are looking for does not exist or has been
              removed.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Category badge styles (static map - Tailwind JIT Law 13)
  const categoryStyles: Record<string, { bg: string; text: string }> = {
    Apparel: { bg: "bg-blue-50", text: "text-blue-700" },
    Drinkware: { bg: "bg-amber-50", text: "text-amber-700" },
    Office: { bg: "bg-emerald-50", text: "text-emerald-700" },
  }
  const badge = categoryStyles[product.category] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
  }
  const gradient = CATEGORY_GRADIENTS[product.category] ?? { from: 'from-slate-100', to: 'to-slate-50' }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Back link */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ==============================================================
                LEFT: Product image placeholder + info
                ============================================================== */}
            <div className="space-y-6">
              {/* FB-109: Enhanced product image area */}
              <div className={`aspect-square bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center`}>
                <div className="w-24 h-24 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm mb-3">
                  <Package className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">{product.category}</p>
              </div>

              {/* FB-109: Color swatches */}
              {productColors.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Available Colors ({productColors.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {productColors.map((color) => (
                      <div key={color.name} className="flex items-center gap-1.5 group" title={color.name}>
                        <div
                          className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-primary-400 transition-colors flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product info card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h1 className="text-2xl lg:text-3xl font-bold font-heading text-slate-900 mb-3">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-sm text-slate-400">
                    {product.supplier}
                  </span>
                  <span className="text-slate-200">|</span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                  >
                    {product.category}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">
                    Starting at
                  </p>
                  <p className="text-3xl font-bold font-mono text-primary-600">
                    ${unitPrice.toFixed(2)}{" "}
                    <span className="text-base font-normal text-slate-400">
                      per unit
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ==============================================================
                RIGHT: Configuration section + Quote flow
                ============================================================== */}
            <div className="space-y-6">
              {/* Quantity selector */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-500" />
                  Configuration
                </h2>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number" onFocus={(e) => e.target.select()}
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val) && val >= 1) setQuantity(val)
                      }}
                      className="w-24 text-center py-2.5 px-3 border border-slate-200 rounded-lg font-mono text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Decoration methods */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Decoration Method
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DECORATION_METHODS.map((method) => {
                      const isSelected = selectedMethods.includes(method.id)
                      return (
                        <button
                          key={method.id}
                          onClick={() => toggleMethod(method.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            isSelected
                              ? "bg-primary-50 border-primary-300 text-primary-700"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {method.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-6" />

                {/* Live price calculation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Unit price</span>
                    <span className="font-mono font-semibold text-slate-700">
                      ${unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {quantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      Estimated Total
                    </span>
                    <span className="text-2xl font-bold font-mono text-primary-600">
                      ${estimatedTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Final pricing depends on decoration, color count, and order
                    details.
                  </p>
                </div>
              </div>

              {/* FB-111/112/113: CTA — Quote Request Flow */}
              {quoteSubmitted ? (
                /* ── Success state ── */
                <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Thank you!
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    We have received your project request for{" "}
                    <span className="font-semibold text-slate-700">{product.name}</span>.
                    Your account manager will be in touch shortly.
                  </p>
                  <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 space-y-1">
                    <p><span className="font-medium text-slate-500">Product:</span> {product.name}</p>
                    <p><span className="font-medium text-slate-500">Quantity:</span> {quantity.toLocaleString()}</p>
                    <p><span className="font-medium text-slate-500">Decoration:</span> {selectedMethods.map(m => DECORATION_METHODS.find(d => d.id === m)?.label).join(', ') || 'None'}</p>
                    <p><span className="font-medium text-slate-500">Estimated:</span> ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Browsing
                  </Link>
                </div>
              ) : showQuoteForm ? (
                /* ── Quote form ── */
                <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-500" />
                      Request a Quote
                    </h3>
                    <button
                      onClick={() => setShowQuoteForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={quoteForm.company_name}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, company_name: e.target.value }))}
                        placeholder="Acme Corp"
                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Contact Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={quoteForm.contact_name}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, contact_name: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="jane@acme.com"
                          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={quoteForm.phone}
                          onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={quoteForm.notes}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional details about your project..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    {/* Billing = Shipping checkbox */}
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quoteForm.billing_is_shipping}
                        onChange={(e) => setQuoteForm(prev => ({ ...prev, billing_is_shipping: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      Billing address is the same as shipping address
                    </label>

                    {/* Submit */}
                    <button
                      onClick={handleQuoteSubmit}
                      disabled={!quoteForm.contact_name.trim() || !quoteForm.email.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md mt-2"
                    >
                      <FileText className="w-4 h-4" />
                      Submit Quote Request
                    </button>

                    <p className="text-[10px] text-slate-400 text-center">
                      Lead source: Website Catalog
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Default CTA button ── */
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  Request Quote
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// =============================================================================
// Shared layout pieces
// =============================================================================

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/catalog" className="flex items-center gap-2 group">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
          <span className="text-lg font-bold font-heading text-slate-900 group-hover:text-primary-600 transition-colors">
            85 Supply
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 py-8 mt-auto">
      <p className="text-center text-sm text-slate-400">
        Powered by{" "}
        <span className="font-medium text-slate-500">BrandOps</span>
      </p>
    </footer>
  )
}
