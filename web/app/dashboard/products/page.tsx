"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import DataTable, { Column } from '@/components/shared/DataTable'
import { DetailPanel } from '@/components/shared/ClickReveal'
import ProductEditModal from '@/components/products/ProductEditModal'
import ProductScrapeReview from '@/components/products/ProductScrapeReview'
import ProductCompareModal from '@/components/products/ProductCompareModal'
import { useToast } from '@/components/shared/DemoToastProvider'
import { getDemoProductsList, getDemoProduct } from '@/lib/demo/demo-data-provider'
import type { Product, ProductDisplay, ProductCategory, ScrapedProductData } from '@/lib/types/app'
import { Plus, Search, Package, ToggleLeft, ToggleRight, Pencil, Copy, ExternalLink, Wand2, Loader2, AlertCircle, Columns2, Bookmark } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

// ── Bookmarklet (bypass React's javascript: URL sanitization) ──

const BOOKMARKLET_CODE = `javascript:void(function(){var d=document.documentElement.cloneNode(true);var r=['script','style','noscript','svg','iframe','link','nav','header','footer'];r.forEach(function(t){var e=d.querySelectorAll(t);for(var i=e.length-1;i>=0;i--)e[i].remove()});d.querySelectorAll('[id^=\"onetrust\"]').forEach(function(e){e.remove()});d.querySelectorAll('[id^=\"pi-\"]').forEach(function(e){e.remove()});var s=d.outerHTML.replace(/\\s{2,}/g,' ');var ta=document.createElement('textarea');ta.value=s;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);var t=document.title;document.title='\\u2705 '+(s.length/1024|0)+'KB copied!';setTimeout(function(){document.title=t},2000)}())`

function BookmarkletLink() {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    // Set href directly on DOM to bypass React's javascript: URL sanitization
    if (ref.current) ref.current.setAttribute('href', BOOKMARKLET_CODE)
  }, [])

  return (
    <a
      ref={ref}
      href="#"
      draggable
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[11px] font-medium hover:bg-violet-200 cursor-grab active:cursor-grabbing select-none"
      title="Drag to bookmarks bar — click on any product page to auto-copy source"
    >
      <Bookmark className="w-3 h-3" />
      ⚡ Grab Source
    </a>
  )
}

// ── Constants ──

const CATEGORY_FILTERS = ['All', 'Apparel', 'Drinkware', 'Office'] as const

function generateId(): string {
  return 'prod-' + Math.random().toString(36).slice(2, 10)
}

/** Convert a ProductDisplay (slim list type) to a full Product for the modal */
function displayToProduct(pd: ProductDisplay): Product {
  return {
    id: pd.id,
    org_id: 'demo-org',
    name: pd.name,
    internal_sku: '',
    product_type: pd.product_type,
    category: pd.category.toLowerCase().replace(/\s+/g, '-') as ProductCategory,
    description: '',
    primary_image_url: undefined,
    additional_images: [],
    available_colors: [],
    available_sizes: ['S', 'M', 'L', 'XL', '2XL'],
    blank_costs: pd.product_type === 'contract' ? [
      { min_quantity: 1, max_quantity: 99, cost_per_unit: pd.blank_cost_min },
      { min_quantity: 100, max_quantity: 9999, cost_per_unit: pd.blank_cost_max },
    ] : [],
    vendor_cost: pd.product_type === 'all-in' ? (pd.vendor_cost_min ?? 0) : undefined,
    applicable_decorations: [],
    supplier_name: pd.supplier,
    is_active: pd.is_active,
    show_on_website: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Convert a full Product back to ProductDisplay for the list */
function productToDisplay(p: Product): ProductDisplay {
  const blankCosts = p.blank_costs || []
  const costs = blankCosts.map(bc => bc.cost_per_unit)
  const minCost = costs.length > 0 ? Math.min(...costs) : 0
  const maxCost = costs.length > 0 ? Math.max(...costs) : 0

  // Pretty category label
  const categoryLabel = p.category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    id: p.id,
    name: p.name,
    product_type: p.product_type,
    category: categoryLabel,
    supplier: p.supplier_name || '',
    blank_cost_min: minCost,
    blank_cost_max: maxCost,
    vendor_cost_min: p.vendor_cost,
    vendor_cost_max: p.vendor_cost,
    is_active: p.is_active,
  }
}

// ── Page ──

export default function ProductsPage() {
  const { showToast } = useToast()

  // Data state
  const [products, setProducts] = useState<ProductDisplay[]>(() => getDemoProductsList())

  // UI state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [selected, setSelected] = useState<ProductDisplay | null>(null)

  // Compare state
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())
  const [showCompare, setShowCompare] = useState(false)

  // Modal state — uses full Product type for the 4-tab editor
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // AI Import state
  const [addMode, setAddMode] = useState<'quick' | 'ai' | null>(null)
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedProductData | null>(null)
  const [scrapeReviewOpen, setScrapeReviewOpen] = useState(false)
  const [pastedHtml, setPastedHtml] = useState('')

  // ── Filtering ──

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category, products])

  // ── Modal helpers ──

  const openAddModal = useCallback(() => {
    setEditingProduct(null)
    setModalOpen(true)
    setAddMode(null)
  }, [])

  const handleQuickEntry = useCallback(() => {
    setAddMode(null)
    setEditingProduct(null)
    setModalOpen(true)
  }, [])

  const handleAiEntry = useCallback(() => {
    setAddMode('ai')
    setScrapeError(null)
    setPastedHtml('')
  }, [])

  const handleScrape = useCallback(async () => {
    if (pastedHtml.trim().length < 100) return
    setScraping(true)
    setScrapeError(null)

    try {
      // Pre-clean client-side to reduce payload (bookmarklet captures full DOM including extensions)
      let html = pastedHtml.trim()
      html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
      html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
      html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      html = html.replace(/<!--[\s\S]*?-->/g, '')
      html = html.replace(/<svg[\s\S]*?<\/svg>/gi, '')
      html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')

      const res = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Request failed (${res.status})`)
      }

      const data: ScrapedProductData = await res.json()
      setScrapedData(data)
      setScrapeReviewOpen(true)
      setAddMode(null)
      setPastedHtml('')
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Could not extract product data.')
    } finally {
      setScraping(false)
    }
  }, [pastedHtml])

  const handleScrapePublish = useCallback((product: Product) => {
    const display = productToDisplay(product)
    setProducts(prev => [...prev, display])
    showToast('Product imported from AI', 'action')
    setScrapeReviewOpen(false)
    setScrapedData(null)
  }, [showToast])

  const openEditModal = useCallback((product: ProductDisplay) => {
    setEditingProduct(displayToProduct(product))
    setSelected(null)
    setModalOpen(true)
  }, [])

  const handleModalSave = useCallback((product: Product) => {
    const display = productToDisplay(product)

    if (editingProduct) {
      // Update existing
      setProducts(prev =>
        prev.map(p => p.id === product.id ? display : p)
      )
      showToast('Product updated', 'action')
    } else {
      // Add new — give it a fresh ID
      const newDisplay = { ...display, id: product.id || generateId() }
      setProducts(prev => [...prev, newDisplay])
      showToast('Product added', 'action')
    }

    setModalOpen(false)
    setEditingProduct(null)
  }, [editingProduct, showToast])

  const handleDuplicate = useCallback((product: ProductDisplay) => {
    const clone: ProductDisplay = {
      ...product,
      id: generateId(),
      name: product.name + ' (Copy)',
    }
    setProducts(prev => [...prev, clone])
    showToast('Product duplicated', 'action')
    setSelected(null)
  }, [showToast])

  const handleViewCatalog = useCallback((product: ProductDisplay) => {
    window.open('/catalog/' + product.id, '_blank')
  }, [])

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const getCompareProducts = useCallback((): Product[] => {
    const results: Product[] = []
    compareIds.forEach(id => {
      const product = getDemoProduct(id)
      if (product) results.push(product)
    })
    return results
  }, [compareIds])

  // ── Table columns ──

  const columns: Column<ProductDisplay>[] = [
    {
      key: 'compare',
      header: '',
      width: '5%',
      render: (row) => (
        <input
          type="checkbox"
          checked={compareIds.has(row.id)}
          onChange={() => toggleCompare(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'name',
      header: 'Product',
      width: '25%',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.supplier}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '15%',
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {row.category}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      width: '15%',
      render: (row) => <span className="text-sm text-slate-600">{row.supplier}</span>,
    },
    {
      key: 'product_type',
      header: 'Type',
      width: '10%',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.product_type === 'all-in'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {row.product_type === 'all-in' ? 'All-In' : 'Contract'}
        </span>
      ),
    },
    {
      key: 'cost_range',
      header: 'Cost Range',
      width: '15%',
      align: 'right',
      render: (row) => {
        const isAllIn = row.product_type === 'all-in'
        const min = isAllIn ? (row.vendor_cost_min ?? 0) : row.blank_cost_min
        const max = isAllIn ? (row.vendor_cost_max ?? 0) : row.blank_cost_max
        return (
          <div>
            <span className="text-sm font-mono text-slate-700">
              ${min.toFixed(2)} – ${max.toFixed(2)}
            </span>
            <span className="block text-[10px] text-slate-400">
              {isAllIn ? 'vendor cost' : 'blank cost'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'active',
      header: 'Active',
      width: '10%',
      align: 'center',
      render: (row) => (
        row.is_active ? (
          <div className="flex items-center justify-center gap-1">
            <ToggleRight className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-emerald-600">Active</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <ToggleLeft className="w-5 h-5 text-slate-300" />
            <span className="text-xs text-slate-400">Inactive</span>
          </div>
        )
      ),
    },
    {
      key: 'markup',
      header: 'Sell Price (35%)',
      width: '10%',
      align: 'right',
      render: (row) => {
        const baseCost = row.product_type === 'all-in'
          ? (row.vendor_cost_min ?? 0)
          : row.blank_cost_min
        return (
          <span className="text-sm font-mono font-medium text-slate-900">
            ${(baseCost / (1 - 0.35)).toFixed(2)}+
          </span>
        )
      },
    },
  ]

  // ── Render ──

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products.length} products configured`}
        action={
          <div className="relative">
            {addMode === null ? (
              <button
                onClick={() => setAddMode('quick')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={handleQuickEntry}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    addMode === 'quick'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Quick Entry
                  </span>
                </button>
                <button
                  onClick={handleAiEntry}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    addMode === 'ai'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Import
                  </span>
                </button>
                <button
                  onClick={() => setAddMode(null)}
                  className="px-1.5 py-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Cancel"
                >
                  <span className="text-xs">&times;</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Import */}
      {addMode === 'ai' && (
        <div className="bg-white rounded-xl shadow-sm border border-violet-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">AI Product Import</h3>
                <p className="text-xs text-slate-500">Paste page source from any supplier site</p>
              </div>
            </div>
            <BookmarkletLink />
          </div>

          {/* Page Source */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Page Source</label>
              <span className="text-[10px] text-slate-400 font-mono">
                {pastedHtml.length > 0 ? `${(pastedHtml.length / 1024).toFixed(0)}KB` : ''}
              </span>
            </div>
            <textarea
              placeholder="Open any product page → click ⚡ Grab Source bookmark → Cmd+V here"
              value={pastedHtml}
              onChange={(e) => { setPastedHtml(e.target.value); setScrapeError(null) }}
              disabled={scraping}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50/50 placeholder:text-slate-400 resize-y"
            />
          </div>

          {/* Extract Button */}
          <button
            onClick={handleScrape}
            disabled={scraping || pastedHtml.trim().length < 100}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {scraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting product data...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Extract Product
              </>
            )}
          </button>

          {scrapeError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{scrapeError}</p>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
          emptyMessage="No products match your search."
        />
      </div>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {compareIds.size >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() => setShowCompare(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Columns2 className="h-4 w-4" />
              Compare ({compareIds.size})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || 'Product Details'}
      >
        {selected && (
          <div className="space-y-6">
            {/* Fields */}
            <div className="space-y-4">
              {[
                { label: 'Product Name', value: selected.name },
                { label: 'Type', value: selected.product_type === 'all-in' ? 'All-In' : 'Contract' },
                { label: 'Category', value: selected.category },
                { label: 'Supplier', value: selected.supplier },
                ...(selected.product_type === 'all-in' ? [
                  { label: 'Vendor Cost (Low)', value: `$${(selected.vendor_cost_min ?? 0).toFixed(2)}`, highlight: true },
                  { label: 'Vendor Cost (High)', value: `$${(selected.vendor_cost_max ?? 0).toFixed(2)}`, highlight: true },
                  { label: 'Sell Price (35% margin)', value: `$${((selected.vendor_cost_min ?? 0) / 0.65).toFixed(2)} – $${((selected.vendor_cost_max ?? 0) / 0.65).toFixed(2)}` },
                ] : [
                  { label: 'Blank Cost (Low)', value: `$${selected.blank_cost_min.toFixed(2)}`, highlight: true },
                  { label: 'Blank Cost (High)', value: `$${selected.blank_cost_max.toFixed(2)}`, highlight: true },
                  { label: 'Sell Price (35% margin)', value: `$${(selected.blank_cost_min / 0.65).toFixed(2)} – $${(selected.blank_cost_max / 0.65).toFixed(2)}` },
                ]),
                { label: 'Status', value: selected.is_active ? 'Active' : 'Inactive' },
              ].map((field, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{field.label}</span>
                  <span className={`text-sm font-medium ${field.highlight ? 'text-primary-600' : 'text-slate-900'}`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => openEditModal(selected)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Product
              </button>
              <button
                onClick={() => handleDuplicate(selected)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => handleViewCatalog(selected)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Catalog
              </button>
            </div>
          </div>
        )}
      </DetailPanel>

      {/* 4-Tab Product Edit Modal */}
      <ProductEditModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null) }}
        product={editingProduct}
        onSave={handleModalSave}
      />

      {/* AI Scrape Review Modal */}
      {scrapedData && (
        <ProductScrapeReview
          isOpen={scrapeReviewOpen}
          onClose={() => { setScrapeReviewOpen(false); setScrapedData(null) }}
          scrapedData={scrapedData}
          onPublish={handleScrapePublish}
        />
      )}

      {/* Product Compare Modal */}
      {showCompare && (
        <ProductCompareModal
          products={getCompareProducts()}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  )
}
