"use client"

import { useState, useMemo } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import KanbanBoard from '@/components/shared/KanbanBoard'
import DataTable, { Column } from '@/components/shared/DataTable'
import SlidePanel from '@/components/shared/SlidePanel'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared'
import { getDemoOrders, getDemoShipments, getDemoProjectLineItems, getDemoTickets } from '@/lib/demo/demo-data-provider'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/demo/demo-data-provider'
import { DECORATION_METHOD_LABELS } from '@/lib/constants/app'
import type { Order, OrderStatus, Shipment, LineItemDecoration, Ticket } from '@/lib/types/app'
import {
  Kanban, List, Package, Truck, Calendar, ChevronDown, FileText,
  Upload, Sparkles, Send, CheckCircle2, AlertTriangle, Ban,
  ExternalLink, DollarSign, Image as ImageIcon, Download,
  Palette, Plus, Ticket as TicketIcon,
} from 'lucide-react'

// ===== STATUS ARRAYS =====

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'order-entry-needed', 'in-production', 'partially-shipped',
  'shipped', 'ready-for-invoicing', 'invoiced', 'cancelled',
]

const ORDER_KANBAN_STATUSES: OrderStatus[] = [
  'order-entry-needed', 'in-production', 'partially-shipped',
  'shipped', 'ready-for-invoicing', 'invoiced',
]

const STATUS_COLORS: Record<OrderStatus, string> = {
  'order-entry-needed': 'bg-red-500',
  'in-production': 'bg-cyan-500',
  'partially-shipped': 'bg-amber-500',
  'shipped': 'bg-green-500',
  'ready-for-invoicing': 'bg-lime-500',
  'invoiced': 'bg-slate-400',
  'cancelled': 'bg-gray-400',
}

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'] as const

const CARRIER_COLORS: Record<string, { bg: string; text: string }> = {
  'UPS': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'FedEx': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'USPS': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'DHL': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Other': { bg: 'bg-slate-100', text: 'text-slate-600' },
}

const SHIPMENT_STATUS_STYLES: Record<string, string> = {
  'pending': 'bg-slate-100 text-slate-600',
  'in-transit': 'bg-blue-100 text-blue-700',
  'delivered': 'bg-emerald-100 text-emerald-700',
  'exception': 'bg-red-100 text-red-700',
}

// ===== HELPERS =====

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getDecorationsForOrder(order: Order): LineItemDecoration[] {
  const lineItems = getDemoProjectLineItems(order.project_id)
  const li = lineItems.find(l => l.id === order.line_item_id)
  return li?.decorations ?? []
}

function getSizesForOrder(order: Order): { size: string; quantity: number }[] {
  const lineItems = getDemoProjectLineItems(order.project_id)
  const li = lineItems.find(l => l.id === order.line_item_id)
  return li?.selected_sizes ?? []
}

// ===== PAGE =====

export default function OrdersPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [orders, setOrders] = useState<Order[]>(() => getDemoOrders())
  const [selected, setSelected] = useState<Order | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const { showToast } = useToast()

  // Shipment management state
  const [localShipments, setLocalShipments] = useState<Record<string, Shipment[]>>({})
  const [showAddShipment, setShowAddShipment] = useState(false)
  const [shipmentForm, setShipmentForm] = useState({
    carrier: 'UPS' as string,
    tracking_number: '',
    ship_date: '',
    items_shipped: '',
  })

  // Tickets data
  const allTickets = useMemo(() => getDemoTickets(), [])

  // PDF upload state (demo)
  const [salesOrderPdfs, setSalesOrderPdfs] = useState<Record<string, string>>({})
  const [invoicePdfs, setInvoicePdfs] = useState<Record<string, string>>({})

  // Get shipments for an order
  function getShipments(orderId: string): Shipment[] {
    if (localShipments[orderId]) return localShipments[orderId]
    const demo = getDemoShipments(orderId)
    return demo
  }

  function getTotalItemsShipped(orderId: string): number {
    return getShipments(orderId).reduce((sum, s) => sum + (s.items_shipped ?? 0), 0)
  }

  // --- Helpers ---

  function updateOrder(orderId: string, updates: Partial<Order>) {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
    )
    setSelected(prev =>
      prev && prev.id === orderId ? { ...prev, ...updates } : prev
    )
  }

  function handleKanbanMove(itemId: string, toColumnId: string) {
    const newStatus = toColumnId as OrderStatus
    updateOrder(itemId, { status: newStatus })
    showToast(`Order moved to ${ORDER_STATUS_LABELS[newStatus]}`, 'action')
  }

  function handleAddShipment() {
    if (!selected) return
    if (!shipmentForm.tracking_number.trim()) {
      showToast('Please enter a tracking number', 'alert')
      return
    }
    const shipDate = shipmentForm.ship_date || new Date().toISOString().split('T')[0]
    const estArrival = new Date(new Date(shipDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const itemsShipped = parseInt(shipmentForm.items_shipped) || 0

    const newShipment: Shipment = {
      id: `shp-${generateId()}`,
      order_id: selected.id,
      tracking_number: shipmentForm.tracking_number.trim(),
      carrier: shipmentForm.carrier,
      ship_date: shipDate,
      estimated_arrival: estArrival,
      status: 'in-transit',
      items_shipped: itemsShipped,
    }

    const existingShipments = getShipments(selected.id)
    const updatedShipments = [...existingShipments, newShipment]
    setLocalShipments(prev => ({ ...prev, [selected.id]: updatedShipments }))

    // Auto-transition to partially-shipped if in-production
    const totalShipped = updatedShipments.reduce((sum, s) => sum + (s.items_shipped ?? 0), 0)
    if (selected.status === 'in-production') {
      if (totalShipped >= selected.quantity) {
        updateOrder(selected.id, { status: 'shipped', shipments: updatedShipments })
        showToast('All items shipped — order marked as Shipped', 'action')
      } else {
        updateOrder(selected.id, { status: 'partially-shipped', shipments: updatedShipments })
        showToast('Shipment added — order partially shipped', 'action')
      }
    } else if (selected.status === 'partially-shipped') {
      if (totalShipped >= selected.quantity) {
        updateOrder(selected.id, { status: 'shipped', shipments: updatedShipments })
        showToast('All items shipped — order marked as Shipped', 'action')
      } else {
        updateOrder(selected.id, { shipments: updatedShipments })
        showToast('Shipment added', 'action')
      }
    } else {
      updateOrder(selected.id, { shipments: updatedShipments })
      showToast('Shipment added', 'action')
    }

    setShowAddShipment(false)
    setShipmentForm({ carrier: 'UPS', tracking_number: '', ship_date: '', items_shipped: '' })
  }

  function handlePdfUpload(orderId: string, type: 'sales_order' | 'invoice') {
    if (type === 'sales_order') {
      const url = `/uploads/demo/sales-order-${orderId}.pdf`
      setSalesOrderPdfs(prev => ({ ...prev, [orderId]: url }))
      updateOrder(orderId, { sales_order_pdf_url: url })
      showToast('Sales order PDF uploaded', 'action')
    } else {
      const url = `/uploads/demo/invoice-${orderId}.pdf`
      setInvoicePdfs(prev => ({ ...prev, [orderId]: url }))
      updateOrder(orderId, { invoice_pdf_url: url })
      showToast('Invoice PDF uploaded', 'action')
    }
  }

  // Status transitions
  function handleMarkEntered() {
    if (!selected) return
    const hasPdf = selected.sales_order_pdf_url || salesOrderPdfs[selected.id]
    if (!hasPdf) {
      showToast('Please upload Sales Order PDF before marking as entered', 'alert')
      return
    }
    updateOrder(selected.id, { status: 'in-production' })
    showToast('Order entered, client notified', 'action')
  }

  function handleMarkShipped() {
    if (!selected) return
    updateOrder(selected.id, { status: 'shipped' })
    showToast('Order marked as fully shipped', 'action')
  }

  function handleReadyForInvoicing() {
    if (!selected) return
    updateOrder(selected.id, { status: 'ready-for-invoicing' })
    showToast('Order marked as ready for invoicing', 'action')
  }

  function handleSendInvoice() {
    if (!selected) return
    const hasPdf = selected.invoice_pdf_url || invoicePdfs[selected.id]
    if (!hasPdf) {
      showToast('Please upload Invoice PDF before sending invoice', 'alert')
      return
    }
    updateOrder(selected.id, { status: 'invoiced', payment_received: false })
    showToast('Invoice sent to client', 'action')
  }

  function handleCancel() {
    if (!selected) return
    updateOrder(selected.id, { status: 'cancelled' })
    setShowCancelConfirm(false)
    showToast('Order cancelled', 'action')
  }

  function handleSendShipmentNotification(shipmentId: string) {
    showToast('Shipment notification sent to client', 'action')
  }

  function handleEmailSalesOrder() {
    showToast('Sales order emailed to client', 'action')
  }

  function handleEmailInvoice() {
    showToast('Invoice sent to client', 'action')
  }

  // Derived values for selected order
  const selectedShipments = selected ? getShipments(selected.id) : []
  const selectedTotalShipped = selected ? getTotalItemsShipped(selected.id) : 0
  const selectedCostPerUnit = selected ? (selected.total / selected.quantity) : 0
  const selectedProfit = selected ? (selected.unit_price - selectedCostPerUnit) * selected.quantity : 0
  const selectedMarginPct = selected && selected.unit_price > 0
    ? ((selected.unit_price - selectedCostPerUnit) / selected.unit_price * 100)
    : 0
  const hasSalesOrderPdf = selected ? !!(selected.sales_order_pdf_url || salesOrderPdfs[selected?.id ?? '']) : false
  const hasInvoicePdf = selected ? !!(selected.invoice_pdf_url || invoicePdfs[selected?.id ?? '']) : false
  const selectedDecorations = selected ? getDecorationsForOrder(selected) : []
  const selectedSizes = selected ? getSizesForOrder(selected) : []
  const shipmentProgressPct = selected && selected.quantity > 0
    ? Math.min(100, Math.round((selectedTotalShipped / selected.quantity) * 100))
    : 0
  const selectedOrderTickets = selected ? allTickets.filter(t => t.order_id === selected.id) : []

  // --- Kanban ---

  const kanbanColumns = ORDER_KANBAN_STATUSES.map(status => ({
    id: status,
    title: ORDER_STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    count: orders.filter(o => o.status === status).length,
  }))

  const kanbanItems = orders.filter(o => ORDER_KANBAN_STATUSES.includes(o.status)).map(order => ({
    id: order.id,
    columnId: order.status,
    content: (
      <div className="space-y-2" onClick={() => setSelected(order)}>
        <div>
          <p className="text-xs font-mono text-slate-500">{order.order_number}</p>
          <p className="text-sm font-semibold text-slate-900 leading-tight mt-0.5">{order.product_name}</p>
        </div>
        <p className="text-xs text-slate-500">{order.project_name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-medium text-slate-700">
            {order.quantity} units &middot; ${order.total.toLocaleString()}
          </span>
        </div>
        {order.in_hands_date && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {new Date(order.in_hands_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
        {order.tracking_number && (
          <div className="flex items-center gap-1 text-xs text-primary-600">
            <Truck className="w-3 h-3" />
            {order.tracking_number.slice(-8)}
          </div>
        )}
      </div>
    ),
  }))

  // --- Table ---

  const tableColumns: Column<Order>[] = [
    {
      key: 'number',
      header: 'Order #',
      width: '12%',
      render: (row) => <span className="text-xs font-mono text-slate-600">{row.order_number}</span>,
    },
    {
      key: 'product',
      header: 'Product',
      width: '22%',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.product_name}</p>
          <p className="text-xs text-slate-500">{row.project_name}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      render: (row) => {
        const style = ORDER_STATUS_STYLES[row.status]
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            {ORDER_STATUS_LABELS[row.status]}
          </span>
        )
      },
    },
    {
      key: 'qty',
      header: 'Qty',
      width: '8%',
      align: 'right',
      render: (row) => <span className="text-sm font-mono text-slate-700">{row.quantity}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      width: '12%',
      align: 'right',
      render: (row) => <span className="text-sm font-mono text-slate-900">${row.total.toLocaleString()}</span>,
    },
    {
      key: 'date',
      header: 'Deadline',
      width: '12%',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {row.in_hands_date
            ? new Date(row.in_hands_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '--'}
        </span>
      ),
    },
    {
      key: 'tracking',
      header: 'Tracking',
      width: '20%',
      render: (row) => row.tracking_number ? (
        <div className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-600">{row.tracking_number.slice(-12)}</span>
        </div>
      ) : <span className="text-xs text-slate-400">--</span>,
    },
  ]

  // --- Stats ---

  const needsEntry = orders.filter(o => o.status === 'order-entry-needed').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders`}
        action={
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
          </div>
        }
      />

      {needsEntry > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <Package className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{needsEntry} orders</span> need entry
          </p>
        </div>
      )}

      {view === 'kanban' ? (
        <KanbanBoard
          columns={kanbanColumns}
          items={kanbanItems}
          onMove={handleKanbanMove}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <DataTable
            columns={tableColumns}
            data={orders}
            rowKey={(row) => row.id}
            onRowClick={(row) => setSelected(row)}
            emptyMessage="No orders found."
          />
        </div>
      )}

      {/* ===== ORDER DETAIL SLIDE PANEL (B1) ===== */}
      <SlidePanel
        isOpen={!!selected}
        onClose={() => { setSelected(null); setShowAddShipment(false) }}
        title={selected ? `Order ${selected.order_number}` : 'Order Details'}
        subtitle={selected?.product_name}
        width="xl"
      >
        {selected && (
          <div className="p-6 space-y-6">
            {/* --- Header: Status + Product Image --- */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900">{selected.product_name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selected.project_name}</p>
                <div className="mt-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_STYLES[selected.status].bg} ${ORDER_STATUS_STYLES[selected.status].text}`}>
                    {ORDER_STATUS_LABELS[selected.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* --- Key Details Card --- */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Details</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Sale</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(selected.total)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Cost</p>
                  <p className="text-lg font-bold text-slate-600">{formatCurrency(selectedCostPerUnit * selected.quantity)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Profit</p>
                  <p className={`text-lg font-bold ${selectedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedProfit > 0 ? selectedProfit : selected.total * 0.35)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Margin</p>
                  <p className={`text-sm font-semibold ${selectedMarginPct >= 30 ? 'text-emerald-600' : selectedMarginPct >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedMarginPct > 0 ? `${selectedMarginPct.toFixed(1)}%` : '35.0%'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Ship Date</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selected.shipped_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Project Deadline</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selected.in_hands_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Quantity</p>
                  <p className="text-sm font-medium text-slate-700">{selected.quantity} units</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Unit Price</p>
                  <p className="text-sm font-medium text-slate-700">{formatCurrency(selected.unit_price)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Client</p>
                  <p className="text-sm font-medium text-slate-700">{selected.project_name.split(' ').slice(0, 2).join(' ')}</p>
                </div>
              </div>

              {/* Sizes Breakdown */}
              {selectedSizes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Sizes Breakdown</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSizes.map((s) => (
                      <span key={s.size} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-700">{s.size}</span>
                        <span className="text-slate-400">x</span>
                        <span className="font-mono text-slate-600">{s.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- Decoration Summary --- */}
            {selectedDecorations.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decoration Summary</h4>
                </div>
                <div className="space-y-2">
                  {selectedDecorations.map((dec) => (
                    <div key={dec.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{dec.position_label}</span>
                          <span className="inline-flex px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-semibold uppercase">
                            {DECORATION_METHOD_LABELS[dec.method] ?? dec.method}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{dec.color_count} color{dec.color_count !== 1 ? 's' : ''}</span>
                          {dec.stitch_count && <span>{dec.stitch_count.toLocaleString()} stitches</span>}
                          {dec.vendor_name && <span>{dec.vendor_name}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-700">{formatCurrency(dec.decoration_cost)}<span className="text-[10px] text-slate-400 font-normal">/ea</span></p>
                        {dec.art_file_url && (
                          <a
                            href={dec.art_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 mt-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Art File
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Sales Order PDF Upload --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sales Order PDF</h4>
              {hasSalesOrderPdf ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-emerald-700">Sales order uploaded</span>
                      <p className="text-xs text-emerald-600 truncate">
                        {selected.sales_order_pdf_url || salesOrderPdfs[selected.id]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <button
                    onClick={handleEmailSalesOrder}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Email Sales Order to Client
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePdfUpload(selected.id, 'sales_order')}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to upload Sales Order PDF</p>
                  <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                </button>
              )}
            </div>

            {/* --- Shipment Management (B2) --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipments</h4>
                <button
                  onClick={() => setShowAddShipment(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Add Shipment
                </button>
              </div>

              {/* Shipment Progress Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    {selectedTotalShipped === 0
                      ? 'No shipments yet'
                      : selectedTotalShipped >= selected.quantity
                        ? 'All items shipped'
                        : `${selectedTotalShipped} of ${selected.quantity} items shipped`
                    }
                  </span>
                  {selectedTotalShipped > 0 && (
                    <span className="text-xs font-mono text-slate-500">{shipmentProgressPct}%</span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  {selectedTotalShipped > 0 && (
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedTotalShipped >= selected.quantity ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${shipmentProgressPct}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Existing Shipments */}
              {selectedShipments.length > 0 ? (
                <div className="space-y-2">
                  {selectedShipments.map((shipment) => {
                    const carrierStyle = CARRIER_COLORS[shipment.carrier] ?? CARRIER_COLORS['Other']
                    return (
                      <div key={shipment.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${carrierStyle.bg} ${carrierStyle.text}`}>
                                <Truck className="w-2.5 h-2.5" />
                                {shipment.carrier}
                              </span>
                              <span className="text-sm font-mono font-medium text-slate-700">{shipment.tracking_number}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${SHIPMENT_STATUS_STYLES[shipment.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {shipment.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>Shipped: {formatDate(shipment.ship_date)}</span>
                              {shipment.estimated_arrival && (
                                <span>Est. arrival: {formatDate(shipment.estimated_arrival)}</span>
                              )}
                              {shipment.items_shipped != null && (
                                <span className="font-medium text-slate-700">{shipment.items_shipped} items</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSendShipmentNotification(shipment.id)}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
                          >
                            <Send className="w-3 h-3" />
                            Send to Client
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No shipments yet</p>
                </div>
              )}

              {/* Add Shipment Inline Form */}
              {showAddShipment && (
                <div className="mt-3 p-4 bg-primary-50 rounded-lg border border-primary-200 space-y-3">
                  <h5 className="text-sm font-semibold text-slate-700">New Shipment</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Carrier */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Carrier</label>
                      <div className="relative">
                        <select
                          value={shipmentForm.carrier}
                          onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value }))}
                          className="w-full appearance-none px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer pr-8"
                        >
                          {CARRIERS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    {/* Tracking Number */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Tracking Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={shipmentForm.tracking_number}
                          onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                          placeholder="1Z999AA10123456784"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-8"
                        />
                        {shipmentForm.tracking_number.length > 5 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-medium text-purple-600">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Ship Date */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Ship Date</label>
                      <input
                        type="date"
                        value={shipmentForm.ship_date}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, ship_date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                    {/* Items Shipped */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Items Shipped</label>
                      <input
                        type="number"
                        value={shipmentForm.items_shipped}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, items_shipped: e.target.value }))}
                        placeholder={String(selected.quantity - selectedTotalShipped)}
                        min={0}
                        max={selected.quantity - selectedTotalShipped}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleAddShipment}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      Add Shipment
                    </button>
                    <button
                      onClick={() => {
                        setShowAddShipment(false)
                        setShipmentForm({ carrier: 'UPS', tracking_number: '', ship_date: '', items_shipped: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- Invoice PDF Upload --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Invoice PDF</h4>
              {hasInvoicePdf ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-emerald-700">Invoice uploaded</span>
                      <p className="text-xs text-emerald-600 truncate">
                        {selected.invoice_pdf_url || invoicePdfs[selected.id]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <button
                    onClick={handleEmailInvoice}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Invoice to Client
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePdfUpload(selected.id, 'invoice')}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to upload Invoice PDF</p>
                  <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                </button>
              )}
            </div>

            {/* --- Tickets Section --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TicketIcon className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tickets</h4>
              </div>
              <div className="space-y-2">
                {selectedOrderTickets.length > 0 ? (
                  selectedOrderTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate">{ticket.name ?? ticket.reason}</span>
                        {ticket.priority && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                            ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {ticket.priority}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          ticket.status === 'in-progress' ? 'bg-cyan-100 text-cyan-700' :
                          ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No tickets for this order</p>
                )}
                <button
                  onClick={() => showToast('Create ticket from Tickets page', 'action')}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Ticket
                </button>
              </div>
            </div>

            {/* --- Status Transition Buttons (B3) --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</h4>

              {/* Order Entry Needed -> In Production */}
              {selected.status === 'order-entry-needed' && (
                <div className="space-y-2">
                  <button
                    onClick={handleMarkEntered}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Entered
                  </button>
                  {!hasSalesOrderPdf && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700">Sales Order PDF required before marking as entered</p>
                    </div>
                  )}
                </div>
              )}

              {/* In Production -> shows shipment guidance */}
              {selected.status === 'in-production' && (
                <p className="text-xs text-slate-500">Add shipments above to progress this order. First shipment auto-transitions to Partially Shipped.</p>
              )}

              {/* Partially Shipped -> Shipped (only when all items shipped) */}
              {selected.status === 'partially-shipped' && selectedTotalShipped >= selected.quantity && (
                <button
                  onClick={handleMarkShipped}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Mark as Fully Shipped
                </button>
              )}

              {selected.status === 'partially-shipped' && selectedTotalShipped < selected.quantity && (
                <p className="text-xs text-slate-500">Add more shipments to complete this order. {selected.quantity - selectedTotalShipped} items remaining.</p>
              )}

              {/* Shipped -> Ready for Invoicing */}
              {selected.status === 'shipped' && (
                <button
                  onClick={handleReadyForInvoicing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-600 text-white rounded-lg text-sm font-semibold hover:bg-lime-700 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Ready for Invoicing
                </button>
              )}

              {/* Ready for Invoicing -> Invoiced */}
              {selected.status === 'ready-for-invoicing' && (
                <div className="space-y-2">
                  <button
                    onClick={handleSendInvoice}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Invoice
                  </button>
                  {!hasInvoicePdf && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700">Invoice PDF required before sending</p>
                    </div>
                  )}
                </div>
              )}

              {/* Invoiced -> Final state */}
              {selected.status === 'invoiced' && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Order Complete</p>
                    <p className="text-xs text-slate-500">Invoice sent. Awaiting payment.</p>
                  </div>
                </div>
              )}

              {/* Cancel (available from any non-cancelled/invoiced status) */}
              {selected.status !== 'cancelled' && selected.status !== 'invoiced' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </SlidePanel>

      {/* ── Cancel Confirmation Modal ── */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancel Order"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto">
            <Ban className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-slate-600 text-center">
            Are you sure you want to cancel order <strong>{selected?.order_number}</strong>? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
