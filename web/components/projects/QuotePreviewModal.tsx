"use client"

import { useRef } from 'react'
import Portal from '@/components/shared/Portal'
import { motion, AnimatePresence } from 'motion/react'
import { X, Printer, Download, Package } from 'lucide-react'
import type { Project, ProjectLineItem, Client } from '@/lib/types/app'

// ===== TYPES =====

interface QuotePreviewModalProps {
  project: Project
  lineItems: ProjectLineItem[]
  client: Client | null
  onClose: () => void
}

// ===== HELPERS =====

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtDate(d?: string): string {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ===== COMPONENT =====

export default function QuotePreviewModal({
  project,
  lineItems,
  client,
  onClose,
}: QuotePreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const subtotal = lineItems.reduce((sum, li) => {
    const qty = li.total_quantity ?? 0
    return sum + (li.unit_price ?? 0) * qty
  }, 0)
  const taxRate = 0.0 // Demo: no tax
  const total = subtotal * (1 + taxRate)

  function handlePrint() {
    if (!printRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quote - ${project.project_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #2563eb; }
          .company-name { font-size: 24px; font-weight: 700; color: #2563eb; }
          .company-tagline { font-size: 11px; color: #94a3b8; margin-top: 4px; }
          .quote-title { text-align: right; }
          .quote-title h2 { font-size: 18px; font-weight: 600; color: #1e293b; }
          .quote-title p { font-size: 12px; color: #64748b; margin-top: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .info-box h4 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
          .info-box p { font-size: 13px; color: #334155; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 10px 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .product-cell { display: flex; align-items: center; gap: 12px; }
          .product-img { width: 48px; height: 48px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
          .product-img img { width: 100%; height: 100%; object-fit: cover; }
          .product-info .name { font-weight: 600; color: #1e293b; }
          .product-info .desc { font-size: 11px; color: #94a3b8; margin-top: 2px; }
          .text-right { text-align: right; }
          .font-mono { font-family: 'SF Mono', 'Menlo', monospace; }
          .totals { margin-left: auto; width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
          .totals-row.total { border-top: 2px solid #1e293b; padding-top: 12px; margin-top: 4px; font-weight: 700; font-size: 16px; }
          .deco-badge { display: inline-block; background: #f0f9ff; color: #0369a1; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 500; margin-top: 4px; }
          .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printRef.current.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
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
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quote Preview</h3>
                <p className="text-xs text-slate-500">{project.project_number} — {project.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                >
                  <Printer size={13} />
                  Print / Save PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white transition-colors"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
              <div
                ref={printRef}
                className="bg-white shadow-lg rounded-lg mx-auto max-w-[700px] p-10"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: '2px solid #2563eb' }}>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>85 Supply</div>
                    <div className="text-xs text-slate-400 mt-1">Premium Branded Merchandise</div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold text-slate-800">Quote</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {project.project_number} &bull; {fmtDate(project.created_at)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Valid for 30 days
                    </p>
                  </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Prepared For</h4>
                    <p className="text-sm font-semibold text-slate-800">{client?.company_name ?? project.client_name}</p>
                    {client?.contacts?.[0] && (
                      <>
                        <p className="text-xs text-slate-500 mt-1">
                          {client.contacts[0].name}
                        </p>
                        <p className="text-xs text-slate-500">{client.contacts[0].email}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Project Details</h4>
                    <p className="text-sm text-slate-700">{project.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: {project.status}</p>
                    <p className="text-xs text-slate-500">In-hands: {fmtDate(project.in_hands_date)}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5" style={{ borderBottom: '2px solid #e2e8f0' }}>
                        Product
                      </th>
                      <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5" style={{ borderBottom: '2px solid #e2e8f0' }}>
                        Qty
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5" style={{ borderBottom: '2px solid #e2e8f0' }}>
                        Unit Price
                      </th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2.5" style={{ borderBottom: '2px solid #e2e8f0' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li) => {
                      const qty = li.total_quantity ?? 0
                      const unitPrice = li.unit_price ?? 0
                      const lineTotal = unitPrice * qty
                      const decoSummary = li.decorations?.map(d => d.method).join(', ') ?? ''

                      return (
                        <tr key={li.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {li.product_image_url ? (
                                  <img src={li.product_image_url} alt={li.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="h-5 w-5 text-slate-300" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{li.product_name}</p>
                                {li.selected_color && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">Color: {li.selected_color}</p>
                                )}
                                {decoSummary && (
                                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                                    {decoSummary}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center text-sm font-mono text-slate-600 px-3 py-3">
                            {qty.toLocaleString()}
                          </td>
                          <td className="text-right text-sm font-mono text-slate-600 px-3 py-3">
                            {fmtCurrency(unitPrice)}
                          </td>
                          <td className="text-right text-sm font-mono font-semibold text-slate-800 px-3 py-3">
                            {fmtCurrency(lineTotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="ml-auto w-72">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-mono text-slate-700">{fmtCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-mono text-slate-400">--</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-1 text-base font-bold" style={{ borderTop: '2px solid #1e293b' }}>
                    <span className="text-slate-800">Total</span>
                    <span className="font-mono text-slate-900">{fmtCurrency(total)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 text-center text-xs text-slate-400" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <p>85 Supply &mdash; Premium Branded Merchandise</p>
                  <p className="mt-1">trevor@85supply.com &bull; (615) 555-0185</p>
                  <p className="mt-1 text-slate-300">Generated by BrandOps</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  )
}
