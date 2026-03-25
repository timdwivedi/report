"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from '@/components/shared/Portal'
import { ArrowLeftRight, Search, X, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { getDemoProductsList } from '@/lib/demo/demo-data-provider'
import type { ProductDisplay } from '@/lib/types/app'

// ===== TYPES =====

interface SwapProductModalProps {
  currentProductName: string
  currentCategory?: string
  currentProductType?: 'contract' | 'all-in'
  onSwap: (product: ProductDisplay) => void
  onClose: () => void
}

// ===== COMPONENT =====

export default function SwapProductModal({
  currentProductName,
  currentCategory,
  currentProductType = 'contract',
  onSwap,
  onClose,
}: SwapProductModalProps) {
  const [search, setSearch] = useState('')
  const [filterSameCategory, setFilterSameCategory] = useState(true)
  const [filterSameType, setFilterSameType] = useState(true)

  const allProducts = useMemo(() => getDemoProductsList(), [])

  const filtered = useMemo(() => {
    let list = allProducts.filter(p => p.is_active)

    // Exclude current product
    if (currentProductName) {
      list = list.filter(p => !p.name.toLowerCase().includes(currentProductName.toLowerCase()))
    }

    // Filter by same category
    if (filterSameCategory && currentCategory) {
      list = list.filter(p => p.category === currentCategory)
    }

    // Filter by same product type
    if (filterSameType) {
      list = list.filter(p => p.product_type === currentProductType)
    }

    // Search filter
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.supplier.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      )
    }

    return list
  }, [allProducts, currentProductName, currentCategory, currentProductType, filterSameCategory, filterSameType, search])

  function getCostRange(product: ProductDisplay): string {
    if (product.product_type === 'all-in') {
      return `$${(product.vendor_cost_min ?? 0).toFixed(2)} – $${(product.vendor_cost_max ?? 0).toFixed(2)}`
    }
    return `$${product.blank_cost_min.toFixed(2)} – $${product.blank_cost_max.toFixed(2)}`
  }

  function getCostComparison(product: ProductDisplay): { direction: 'lower' | 'higher' | 'similar'; pctDiff: number } {
    // Simple comparison based on min blank cost
    const currentRef = 5.0 // Rough reference — in real app would use actual current product cost
    const newCost = product.product_type === 'all-in'
      ? (product.vendor_cost_min ?? 0)
      : product.blank_cost_min
    const diff = ((newCost - currentRef) / currentRef) * 100
    if (diff < -5) return { direction: 'lower', pctDiff: Math.abs(diff) }
    if (diff > 5) return { direction: 'higher', pctDiff: diff }
    return { direction: 'similar', pctDiff: Math.abs(diff) }
  }

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[10001] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-[540px] max-h-[80vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Swap Product</h3>
                  <p className="text-xs text-slate-500">Choose a similar product from catalog</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Product */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Replacing</p>
              <p className="text-sm font-medium text-slate-700">{currentProductName || 'Unknown Product'}</p>
              <div className="flex items-center gap-2 mt-1">
                {currentCategory && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 font-medium">{currentCategory}</span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 font-medium">{currentProductType}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-slate-100 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products, suppliers..."
                  className="w-full h-8 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-slate-300"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSameCategory}
                    onChange={e => setFilterSameCategory(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  Same category
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSameType}
                    onChange={e => setFilterSameType(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  Same pricing type
                </label>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-slate-400">No matching products found</p>
                  <p className="text-xs text-slate-300 mt-1">Try broadening your filters</p>
                </div>
              ) : (
                filtered.map(product => {
                  const comparison = getCostComparison(product)
                  return (
                    <button
                      key={product.id}
                      onClick={() => onSwap(product)}
                      className="w-full text-left px-5 py-3 hover:bg-primary-50/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">{product.supplier}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-xs font-mono font-medium text-slate-600">{getCostRange(product)}</p>
                          <div className={`flex items-center justify-end gap-1 mt-0.5 text-[10px] font-semibold ${
                            comparison.direction === 'lower' ? 'text-emerald-600' :
                            comparison.direction === 'higher' ? 'text-red-500' :
                            'text-slate-400'
                          }`}>
                            {comparison.direction === 'lower' && <TrendingDown size={10} />}
                            {comparison.direction === 'higher' && <TrendingUp size={10} />}
                            {comparison.direction === 'similar' && <Minus size={10} />}
                            {comparison.direction === 'lower' && `${comparison.pctDiff.toFixed(0)}% cheaper`}
                            {comparison.direction === 'higher' && `${comparison.pctDiff.toFixed(0)}% more`}
                            {comparison.direction === 'similar' && 'Similar cost'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  )
}
