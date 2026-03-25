"use client"

import Portal from '@/components/shared/Portal'
import { motion, AnimatePresence } from 'motion/react'
import { X, Package } from 'lucide-react'
import type { Product } from '@/lib/types/app'

// ===== TYPES =====

interface ProductCompareModalProps {
  products: Product[]
  onClose: () => void
}

// ===== HELPERS =====

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function costRange(product: Product): string {
  if (product.product_type === 'all-in') {
    return product.vendor_cost != null ? fmtCurrency(product.vendor_cost) : '--'
  }
  const costs = (product.blank_costs || []).map(bc => bc.cost_per_unit)
  if (costs.length === 0) return '--'
  const min = Math.min(...costs)
  const max = Math.max(...costs)
  return min === max ? fmtCurrency(min) : `${fmtCurrency(min)} – ${fmtCurrency(max)}`
}

function categoryLabel(cat: string): string {
  return cat
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ===== COMPONENT =====

export default function ProductCompareModal({ products, onClose }: ProductCompareModalProps) {
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
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden mx-4"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Compare Products</h3>
                <p className="text-xs text-slate-500">{products.length} products selected</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — side-by-side columns */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-6">
                {products.map((product) => (
                  <div key={product.id} className="flex-1 min-w-[280px] space-y-5">
                    {/* Product image placeholder */}
                    <div className="w-full h-[100px] bg-slate-100 rounded-xl flex items-center justify-center">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-slate-300" />
                      )}
                    </div>

                    {/* Product name */}
                    <h4 className="text-lg font-bold text-slate-900">{product.name}</h4>

                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {categoryLabel(product.category)}
                      </span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.product_type === 'contract'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.product_type === 'contract' ? 'Contract' : 'All-In'}
                      </span>
                    </div>

                    {/* Fields */}
                    <div className="space-y-3 text-sm">
                      {/* Price */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">
                          {product.product_type === 'contract' ? 'Blank Cost' : 'Vendor Cost'}
                        </span>
                        <span className="font-mono font-medium text-primary-600">
                          {costRange(product)}
                        </span>
                      </div>

                      {/* Supplier */}
                      {product.supplier_name && (
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Supplier</span>
                          <span className="font-medium text-slate-700">{product.supplier_name}</span>
                        </div>
                      )}

                      {/* Colors */}
                      {product.available_colors.length > 0 && (
                        <div className="py-2 border-b border-slate-100">
                          <span className="text-slate-500 block mb-2">Colors</span>
                          <div className="flex flex-wrap gap-1.5">
                            {product.available_colors.map((color) => (
                              <div
                                key={color.name}
                                className="w-4 h-4 rounded-full border border-slate-200"
                                style={{ backgroundColor: color.hex || '#ccc' }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {product.available_sizes.length > 0 && (
                        <div className="py-2 border-b border-slate-100">
                          <span className="text-slate-500 block mb-2">Sizes</span>
                          <div className="flex flex-wrap gap-1">
                            {product.available_sizes.map((size) => (
                              <span
                                key={size}
                                className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decoration Locations */}
                      {product.decoration_locations && product.decoration_locations.length > 0 && (
                        <div className="py-2 border-b border-slate-100">
                          <span className="text-slate-500 block mb-2">Decoration Locations</span>
                          <ul className="space-y-1">
                            {product.decoration_locations.map((loc) => (
                              <li key={loc.id} className="text-xs text-slate-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                                {loc.location_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  )
}
