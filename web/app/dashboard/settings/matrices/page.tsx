"use client"

import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

export default function MatricesPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Matrices Moved
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Decorator pricing matrices are now managed directly within each product&apos;s Decorations tab.
          Open a product and configure decoration pricing there.
        </p>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Go to Products
        </Link>
      </div>
    </div>
  )
}
