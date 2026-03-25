"use client"

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  getDemoProjects,
  getDemoOrders,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '@/lib/demo/demo-data-provider'
import type { Order } from '@/lib/types/app'
import {
  ArrowLeft,
  Package,
  Truck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

// ===== ANIMATION VARIANTS =====

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
} as const

// ===== STATUS ICON MAPPING =====

function StatusIcon({ status }: { status: Order['status'] }) {
  switch (status) {
    case 'shipped':
    case 'invoiced':
    case 'ready-for-invoicing':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'in-production':
    case 'partially-shipped':
      return <Clock className="w-4 h-4 text-cyan-500" />
    case 'order-entry-needed':
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-slate-400" />
    default:
      return <Package className="w-4 h-4 text-slate-400" />
  }
}

// ===== PAGE COMPONENT =====

export default function TrackingPage() {
  const params = useParams()
  const shareableLink = params.shareableLink as string

  const projects = getDemoProjects()
  const project = projects.find((p) => p.shareable_link === shareableLink)
  const allOrders = getDemoOrders()

  const orders = useMemo(() => {
    if (!project) return []
    return allOrders.filter((o) => o.project_id === project.id)
  }, [project, allOrders])

  // ===== NOT FOUND STATE =====
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-md w-full">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold font-heading text-slate-900">
            Project Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            This link may have expired or the project is no longer available.
            Please contact your account representative.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== TOP BANNER ===== */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 tracking-tight">
              85 Supply
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by BrandOps
            </p>
          </div>
          <Link
            href={`/portal/${shareableLink}`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quote
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Page Header */}
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold font-heading text-slate-900">
              Order Tracking
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {project.name} &middot;{' '}
              <span className="font-mono">{project.project_number}</span>
            </p>
          </motion.div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center"
            >
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-900">
                No orders yet
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Orders will appear here once the project is confirmed and in
                production.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusStyle = ORDER_STATUS_STYLES[order.status]
                return (
                  <motion.div
                    key={order.id}
                    variants={fadeUp}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex items-start gap-3">
                        <StatusIcon status={order.status} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-mono font-semibold text-slate-900">
                              {order.order_number}
                            </span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {order.product_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.quantity.toLocaleString()} units
                          </p>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      <div className="sm:text-right shrink-0 space-y-1">
                        {order.tracking_number ? (
                          <>
                            <div className="flex items-center gap-2 sm:justify-end">
                              <Truck className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {order.carrier}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono text-slate-600">
                                {order.tracking_number}
                              </span>
                              {order.tracking_url && (
                                <a
                                  href={order.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-primary-600 hover:text-primary-700"
                                  aria-label="Track shipment"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            {order.shipped_date && (
                              <p className="text-xs text-slate-400">
                                Shipped{' '}
                                {new Date(
                                  order.shipped_date
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">
                            Tracking not yet available
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <motion.div
            variants={fadeUp}
            className="text-center py-6 border-t border-slate-100"
          >
            <p className="text-xs text-slate-400">
              Questions about your order? Contact your 85 Supply account
              representative.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
