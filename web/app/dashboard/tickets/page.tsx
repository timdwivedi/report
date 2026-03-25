"use client"

import { useState, useMemo } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import SlidePanel from '@/components/shared/SlidePanel'
import Modal from '@/components/shared/Modal'
import { useToast } from '@/components/shared'
import { getDemoTickets, getDemoProjects, getDemoOrders, getDemoVendors } from '@/lib/demo/demo-data-provider'
import { TICKET_PRIORITY_STYLES } from '@/lib/constants/app'
import type {
  Ticket, TicketType, TicketFault, TicketStatus, TicketComment,
} from '@/lib/types/app'
import {
  Ticket as TicketIcon, Plus, RotateCcw, DollarSign, AlertTriangle,
  Clock, CheckCircle2, XCircle, Filter, ArrowUpDown, ArrowDown, ArrowUp,
  MessageSquare, Link2, Copy, Check, ChevronRight, Search,
} from 'lucide-react'

// ===== CONSTANTS =====

const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  'open': { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  'closed': { bg: 'bg-slate-50', text: 'text-slate-500', icon: XCircle },
}

const TYPE_ICONS: Record<TicketType, typeof RotateCcw> = {
  'reprint': RotateCcw,
  'credit': DollarSign,
  'spoilage': AlertTriangle,
  'refund': DollarSign,
}

const TYPE_LABELS: Record<TicketType, string> = {
  'reprint': 'Reprint',
  'credit': 'Credit',
  'spoilage': 'Spoilage',
  'refund': 'Refund',
}

const FAULT_LABELS: Record<TicketFault, string> = {
  'vendor': 'Vendor',
  'our-fault': 'Our Fault',
}

const FAULT_STYLES: Record<TicketFault, { bg: string; text: string }> = {
  'vendor': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'our-fault': { bg: 'bg-orange-50', text: 'text-orange-700' },
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
}

const PRIORITY_LABELS: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical',
}

const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus | null> = {
  'open': 'in-progress',
  'in-progress': 'resolved',
  'resolved': 'closed',
  'closed': null,
}

type SortField = 'priority' | 'created_at' | 'status'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
const STATUS_ORDER: Record<TicketStatus, number> = { 'open': 0, 'in-progress': 1, 'resolved': 2, 'closed': 3 }

// ===== HELPERS =====

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ===== COMPONENT =====

export default function TicketsPage() {
  const { showToast } = useToast()

  // Demo data
  const demoProjects = useMemo(() => getDemoProjects(), [])
  const demoOrders = useMemo(() => getDemoOrders(), [])
  const demoVendors = useMemo(() => getDemoVendors(), [])

  // State
  const [tickets, setTickets] = useState<Ticket[]>(() => getDemoTickets())
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all')
  const [faultFilter, setFaultFilter] = useState<TicketFault | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Sort
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Create form
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<TicketType>('reprint')
  const [formFault, setFormFault] = useState<TicketFault>('vendor')
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [formProjectId, setFormProjectId] = useState('')
  const [formOrderId, setFormOrderId] = useState('')
  const [formVendorId, setFormVendorId] = useState('')
  const [formDescription, setFormDescription] = useState('')

  // Comment form
  const [newComment, setNewComment] = useState('')

  // Copy feedback
  const [copiedTicketLink, setCopiedTicketLink] = useState(false)

  // ===== FILTERED & SORTED =====

  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        (t.name?.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q) ||
        t.project_name.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter)
    if (faultFilter !== 'all') result = result.filter(t => t.fault === faultFilter)
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'priority') {
        cmp = (PRIORITY_ORDER[a.priority ?? 'low'] ?? 3) - (PRIORITY_ORDER[b.priority ?? 'low'] ?? 3)
      } else if (sortField === 'status') {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [tickets, searchQuery, statusFilter, typeFilter, faultFilter, priorityFilter, sortField, sortDir])

  // ===== KPI DATA =====

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length
  const resolvedThisMonth = tickets.filter(t => {
    if (t.status !== 'resolved' && t.status !== 'closed') return false
    if (!t.resolved_at) return false
    const now = new Date()
    const resolved = new Date(t.resolved_at)
    return resolved.getMonth() === now.getMonth() && resolved.getFullYear() === now.getFullYear()
  }).length

  // ===== HANDLERS =====

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function handleCreateTicket() {
    if (!formName.trim()) {
      showToast('Ticket name is required', 'alert')
      return
    }

    const projectName = demoProjects.find(p => p.id === formProjectId)?.name ?? 'Unlinked'
    const vendorId = formVendorId || undefined

    const newTicket: Ticket = {
      id: `TKT-2026-${String(tickets.length + 1).padStart(4, '0')}`,
      project_id: formProjectId || 'unlinked',
      project_name: projectName,
      name: formName.trim(),
      type: formType,
      fault: formFault,
      reason: formDescription.trim(),
      quantity: 0,
      status: 'open',
      priority: formPriority,
      order_id: formOrderId || undefined,
      linked_vendor_id: vendorId,
      comments: [],
      created_at: new Date().toISOString().split('T')[0],
    }

    setTickets(prev => [newTicket, ...prev])
    setShowCreateModal(false)
    resetForm()
    showToast('Ticket created', 'action')
  }

  function resetForm() {
    setFormName('')
    setFormType('reprint')
    setFormFault('vendor')
    setFormPriority('medium')
    setFormProjectId('')
    setFormOrderId('')
    setFormVendorId('')
    setFormDescription('')
  }

  function handleStatusTransition(ticket: Ticket) {
    const nextStatus = STATUS_TRANSITIONS[ticket.status]
    if (!nextStatus) return

    const updated: Ticket = {
      ...ticket,
      status: nextStatus,
      resolved_at: nextStatus === 'resolved' || nextStatus === 'closed'
        ? new Date().toISOString().split('T')[0]
        : ticket.resolved_at,
    }

    setTickets(prev => prev.map(t => t.id === ticket.id ? updated : t))
    setSelectedTicket(updated)
    showToast(`Ticket moved to ${STATUS_LABELS[nextStatus]}`, 'action')
  }

  function handleAddComment(ticket: Ticket) {
    if (!newComment.trim()) return

    const comment: TicketComment = {
      id: generateId(),
      author: 'Trevor Sarver',
      message: newComment.trim(),
      created_at: new Date().toISOString(),
    }

    const updated: Ticket = {
      ...ticket,
      comments: [...(ticket.comments ?? []), comment],
    }

    setTickets(prev => prev.map(t => t.id === ticket.id ? updated : t))
    setSelectedTicket(updated)
    setNewComment('')
  }

  function handleGenerateLink(ticket: Ticket) {
    const uuid = crypto.randomUUID()
    const link = `/tickets/share/${uuid}`

    const updated: Ticket = { ...ticket, shareable_link: link }
    setTickets(prev => prev.map(t => t.id === ticket.id ? updated : t))
    setSelectedTicket(updated)
    showToast('Shareable link generated', 'action')
  }

  function handleCopyLink(link: string) {
    navigator.clipboard.writeText(`${window.location.origin}${link}`)
    setCopiedTicketLink(true)
    showToast('Link copied to clipboard', 'action')
    setTimeout(() => setCopiedTicketLink(false), 2000)
  }

  // Orders filtered by selected project
  const projectOrders = useMemo(() => {
    if (!formProjectId) return []
    return demoOrders.filter(o => o.project_id === formProjectId)
  }, [formProjectId, demoOrders])

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Service Tickets"
        subtitle="Reprints, refunds, credits, and spoilage tracking"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${openCount > 5 ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${openCount > 5 ? 'text-red-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{openCount}</p>
              <p className="text-xs text-slate-500">Open Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{resolvedThisMonth}</p>
              <p className="text-xs text-slate-500">Resolved (MTD)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">2.3 days</p>
              <p className="text-xs text-slate-500">Avg Resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as TicketStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as TicketType | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">All Types</option>
            <option value="reprint">Reprint</option>
            <option value="credit">Credit</option>
            <option value="spoilage">Spoilage</option>
            <option value="refund">Refund</option>
          </select>

          {/* Fault Filter */}
          <select
            value={faultFilter}
            onChange={e => setFaultFilter(e.target.value as TicketFault | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">All Fault</option>
            <option value="vendor">Vendor</option>
            <option value="our-fault">Our Fault</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_90px_90px_140px_100px_110px_110px] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div>Name</div>
          <div>Type</div>
          <div>Fault</div>
          <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => toggleSort('priority')}>
            Priority
            {sortField === 'priority' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
          </button>
          <div>Project</div>
          <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => toggleSort('status')}>
            Status
            {sortField === 'status' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
          </button>
          <div>Vendor</div>
          <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => toggleSort('created_at')}>
            Age
            {sortField === 'created_at' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
          </button>
        </div>

        {/* Table Body */}
        {filteredTickets.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <TicketIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tickets match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map(ticket => {
              const style = STATUS_STYLES[ticket.status]
              const StatusIcon = style.icon
              const TypeIcon = TYPE_ICONS[ticket.type]
              const priorityStyle = TICKET_PRIORITY_STYLES[ticket.priority ?? 'low'] ?? TICKET_PRIORITY_STYLES['low']
              const faultStyle = FAULT_STYLES[ticket.fault]
              const vendorName = ticket.linked_vendor_id
                ? demoVendors.find(v => v.id === ticket.linked_vendor_id)?.name ?? '--'
                : '--'

              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="grid grid-cols-[1fr_100px_90px_90px_140px_100px_110px_110px] gap-2 px-5 py-3.5 hover:bg-slate-50 transition-colors w-full text-left items-center"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{ticket.name || ticket.reason}</p>
                    <p className="text-xs text-slate-400 font-mono">{ticket.id}</p>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-600 capitalize">{TYPE_LABELS[ticket.type]}</span>
                  </div>

                  {/* Fault */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${faultStyle.bg} ${faultStyle.text} w-fit`}>
                    {FAULT_LABELS[ticket.fault]}
                  </span>

                  {/* Priority */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text} w-fit`}>
                    {PRIORITY_LABELS[ticket.priority ?? 'low']}
                  </span>

                  {/* Project */}
                  <p className="text-xs text-slate-600 truncate">{ticket.project_name}</p>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} w-fit`}>
                    <StatusIcon className="w-3 h-3" />
                    {STATUS_LABELS[ticket.status]}
                  </span>

                  {/* Vendor */}
                  <p className="text-xs text-slate-500 truncate">{vendorName}</p>

                  {/* Age */}
                  {(() => {
                    const isOpen = ticket.status === 'open' || ticket.status === 'in-progress'
                    const daysOpen = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    const ageClass = !isOpen
                      ? 'bg-slate-100 text-slate-500'
                      : daysOpen >= 7
                      ? 'bg-red-100 text-red-700'
                      : daysOpen >= 3
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                    return (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${ageClass} w-fit`}>
                        {daysOpen}d
                      </span>
                    )
                  })()}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== CREATE TICKET MODAL ===== */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm() }} title="New Ticket" size="lg">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Type + Fault + Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value as TicketType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="reprint">Reprint</option>
                <option value="credit">Credit</option>
                <option value="spoilage">Spoilage</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fault</label>
              <select
                value={formFault}
                onChange={e => setFormFault(e.target.value as TicketFault)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="vendor">Vendor</option>
                <option value="our-fault">Our Fault</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Link to Project */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link to Project</label>
            <select
              value={formProjectId}
              onChange={e => { setFormProjectId(e.target.value); setFormOrderId('') }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">-- None --</option>
              {demoProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.project_number})</option>
              ))}
            </select>
          </div>

          {/* Link to Order (filtered by project) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link to Order</label>
            <select
              value={formOrderId}
              onChange={e => setFormOrderId(e.target.value)}
              disabled={!formProjectId}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- None --</option>
              {projectOrders.map(o => (
                <option key={o.id} value={o.id}>{o.order_number} &mdash; {o.product_name}</option>
              ))}
            </select>
          </div>

          {/* Link to Vendor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link to Vendor</label>
            <select
              value={formVendorId}
              onChange={e => setFormVendorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">-- None --</option>
              {demoVendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
          </div>

          {/* Create Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreateTicket}
              className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== TICKET DETAIL SLIDE PANEL ===== */}
      <SlidePanel
        isOpen={!!selectedTicket}
        onClose={() => { setSelectedTicket(null); setNewComment('') }}
        title={selectedTicket?.name || selectedTicket?.reason || 'Ticket'}
        subtitle={selectedTicket?.id}
        width="xl"
        headerActions={
          selectedTicket && STATUS_TRANSITIONS[selectedTicket.status] ? (
            <button
              onClick={() => selectedTicket && handleStatusTransition(selectedTicket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Move to {STATUS_LABELS[STATUS_TRANSITIONS[selectedTicket.status]!]}
            </button>
          ) : undefined
        }
      >
        {selectedTicket && (
          <div className="p-6 space-y-6">
            {/* Status + Priority Badges */}
            <div className="flex items-center gap-3">
              {(() => {
                const s = STATUS_STYLES[selectedTicket.status]
                const SIcon = s.icon
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
                    <SIcon className="w-4 h-4" />
                    {STATUS_LABELS[selectedTicket.status]}
                  </span>
                )
              })()}
              {(() => {
                const ps = TICKET_PRIORITY_STYLES[selectedTicket.priority ?? 'low'] ?? TICKET_PRIORITY_STYLES['low']
                return (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ps.bg} ${ps.text}`}>
                    {PRIORITY_LABELS[selectedTicket.priority ?? 'low']}
                  </span>
                )
              })()}
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <div className="flex items-center gap-1.5">
                  {(() => { const TI = TYPE_ICONS[selectedTicket.type]; return <TI className="w-4 h-4 text-slate-500" /> })()}
                  <span className="text-sm font-medium text-slate-900">{TYPE_LABELS[selectedTicket.type]}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Fault</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${FAULT_STYLES[selectedTicket.fault].bg} ${FAULT_STYLES[selectedTicket.fault].text}`}>
                  {FAULT_LABELS[selectedTicket.fault]}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Linked Project</p>
                <p className="text-sm font-medium text-slate-900 truncate">{selectedTicket.project_name}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Linked Order</p>
                <p className="text-sm font-medium text-slate-900">
                  {selectedTicket.order_id
                    ? demoOrders.find(o => o.id === selectedTicket.order_id)?.order_number ?? '--'
                    : '--'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Linked Vendor</p>
                <p className="text-sm font-medium text-slate-900">
                  {selectedTicket.linked_vendor_id
                    ? demoVendors.find(v => v.id === selectedTicket.linked_vendor_id)?.name ?? '--'
                    : '--'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Quantity / Cost</p>
                <p className="text-sm font-medium text-slate-900">
                  {selectedTicket.quantity} units{selectedTicket.cost ? ` / $${selectedTicket.cost.toLocaleString()}` : ''}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(selectedTicket.created_at)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Resolved</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(selectedTicket.resolved_at)}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                {selectedTicket.reason || 'No description provided.'}
              </p>
            </div>

            {/* Resolution */}
            {selectedTicket.resolution && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Resolution</h4>
                <div className="flex items-start gap-2 bg-emerald-50 rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">{selectedTicket.resolution}</p>
                </div>
              </div>
            )}

            {/* Shareable Link */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Shareable Link</h4>
              {selectedTicket.shareable_link ? (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                  <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <code className="text-xs text-slate-600 flex-1 truncate">{selectedTicket.shareable_link}</code>
                  <button
                    onClick={() => handleCopyLink(selectedTicket.shareable_link!)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors flex-shrink-0"
                  >
                    {copiedTicketLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedTicketLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateLink(selectedTicket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Generate Link
                </button>
              )}
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({(selectedTicket.comments ?? []).length})
              </h4>

              {(selectedTicket.comments ?? []).length > 0 && (
                <div className="space-y-3 mb-4">
                  {(selectedTicket.comments ?? []).map(comment => (
                    <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{comment.author}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(selectedTicket) }}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  onClick={() => handleAddComment(selectedTicket)}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
