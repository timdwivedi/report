"use client"

/**
 * Public Product Catalog — Browse the full 85 Supply product line.
 *
 * Public-facing, no auth required. Minimal layout outside dashboard.
 * Uses demo data provider for product listings.
 */

import { useState, useMemo } from "react"
import Link from "next/link"
import { getDemoProductsList, getDemoProductsFull } from "@/lib/demo/demo-data-provider"
import type { ProductDisplay, ProductColor } from "@/lib/types/app"
import { Package, Search, ShoppingBag } from "lucide-react"

// Markup factor applied to blank_cost_min for public display pricing
const MARKUP_FACTOR = 1.54

// FB-109: Product color map — merge full product colors with synthetic fallbacks
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

// FB-109: Category-based placeholder image gradients (static — Tailwind JIT Law 13)
const CATEGORY_GRADIENTS: Record<string, { from: string; to: string }> = {
  Apparel: { from: 'from-blue-100', to: 'to-indigo-50' },
  Drinkware: { from: 'from-amber-100', to: 'to-orange-50' },
  Office: { from: 'from-emerald-100', to: 'to-teal-50' },
}

export default function CatalogPage() {
  const products = getDemoProductsList()
  const fullProducts = useMemo(() => getDemoProductsFull(), [])

  // Build color map: full product colors + synthetic fallbacks
  const productColorMap = useMemo(() => {
    const map: Record<string, ProductColor[]> = {}
    for (const fp of fullProducts) {
      map[fp.id] = fp.available_colors
    }
    // Merge synthetic colors for products without full data
    for (const [id, colors] of Object.entries(SYNTHETIC_COLORS)) {
      if (!map[id]) map[id] = colors
    }
    return map
  }, [fullProducts])

  // ---------------------------------------------------------------------------
  // State — search, category filter, active-only toggle
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)))
    cats.sort()
    return ["All", ...cats]
  }, [products])

  // ---------------------------------------------------------------------------
  // Filtered products
  // ---------------------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Only show active products
      if (!p.is_active) return false

      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false

      // Text search (product name)
      if (
        searchQuery.trim() &&
        !p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false
      }

      return true
    })
  }, [products, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ================================================================
          HEADER
          ================================================================ */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-3">
              Product Catalog
            </h1>
            <p className="text-lg text-slate-500">
              Browse our full product line
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Curated by 85 Supply
            </p>
          </div>

          {/* ----------------------------------------------------------------
              SEARCH & FILTER BAR
              ---------------------------------------------------------------- */}
          <div className="mb-8 space-y-4">
            {/* Search input */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-slate-400 mb-6">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>

          {/* ----------------------------------------------------------------
              PRODUCT GRID
              ---------------------------------------------------------------- */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No products match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  colors={productColorMap[product.id] ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="border-t border-slate-100 py-8 mt-auto">
        <p className="text-center text-sm text-slate-400">
          Powered by <span className="font-medium text-slate-500">BrandOps</span>
        </p>
      </footer>
    </div>
  )
}

// =============================================================================
// ProductCard — individual grid card
// =============================================================================

function ProductCard({ product, colors }: { product: ProductDisplay; colors: ProductColor[] }) {
  const baseCost = product.product_type === 'all-in'
    ? (product.vendor_cost_min ?? 0)
    : product.blank_cost_min
  const displayPrice = (baseCost * MARKUP_FACTOR).toFixed(2)

  // Category badge color map (static classes to respect Tailwind JIT — Law 13)
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

  // FB-109: Category-specific icons
  const categoryIcons: Record<string, string> = {
    Apparel: 'T',
    Drinkware: 'D',
    Office: 'O',
  }

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all"
    >
      {/* FB-109: Enhanced product image area with gradient + product initial */}
      <div className={`aspect-[4/3] bg-gradient-to-br ${gradient.from} ${gradient.to} flex flex-col items-center justify-center relative`}>
        <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm mb-2">
          <span className="text-2xl font-bold text-slate-400 group-hover:text-primary-400 transition-colors">
            {categoryIcons[product.category] ?? product.name.charAt(0)}
          </span>
        </div>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{product.category}</p>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Product name */}
        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Supplier */}
        <p className="text-sm text-slate-400 mb-2">{product.supplier}</p>

        {/* FB-109: Color swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {colors.slice(0, 6).map((color) => (
              <div
                key={color.name}
                className="w-4 h-4 rounded-full border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {colors.length > 6 && (
              <span className="text-[10px] text-slate-400 ml-0.5">+{colors.length - 6}</span>
            )}
          </div>
        )}

        {/* Bottom row: badge + price */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
          >
            {product.category}
          </span>
          <span className="font-mono text-sm font-semibold text-slate-700">
            From ${displayPrice}
          </span>
        </div>
      </div>
    </Link>
  )
}
