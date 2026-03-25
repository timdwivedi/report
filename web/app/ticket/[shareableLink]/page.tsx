"use client"

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { getDemoTickets } from '@/lib/demo/demo-data-provider'
import type { TicketType, TicketFault, TicketStatus, TicketComment } from '@/lib/types/app'
import {
  Ticket,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  FileText,
  ChevronDown,
} from 'lucide-react'

// ===== CONSTANTS =====

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

const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  'open': { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  'closed': { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle },
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
}

const FAULT_STYLES: Record<TicketFault, { bg: string; text: string }> = {
  'vendor': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'our-fault': { bg: 'bg-orange-50', text: 'text-orange-700' },
}

const FAULT_LABELS: Record<TicketFault, string> = {
  'vendor': 'Vendor Fault',
  'our-fault': 'Our Fault',
}

const NEXT_ACTIONS = [
  { value: '', label: 'Select next action...' },
  { value: 'reprint', label: 'Reprint at vendor cost' },
  { value: 'refund', label: 'Issue refund' },
  { value: 'credit', label: 'Apply account credit' },
  { value: 'other', label: 'Other (specify in comment)' },
]

export default function PublicTicketPage() {
  const params = useParams()
  const shareableLink = params.shareableLink as string

  // Find ticket by shareable link
  const allTickets = useMemo(() => getDemoTickets(), [])
  const ticket = useMemo(
    () => allTickets.find(t =>
      t.shareable_link?.includes(shareableLink) || t.id === shareableLink
    ),
    [allTickets, shareableLink]
  )

  // Local state for comments and vendor response
  const [comments, setComments] = useState<TicketComment[]>(() => ticket?.comments ?? [])
  const [newComment, setNewComment] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: TicketComment = {
      id: `tc-vendor-${Date.now()}`,
      author: 'Vendor',
      message: newComment.trim(),
      created_at: new Date().toISOString(),
    }
    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const handleSubmitResponse = () => {
    if (!nextAction) return
    setIsSubmitting(true)
    // Mock async response
    setTimeout(() => {
      const actionLabel = NEXT_ACTIONS.find(a => a.value === nextAction)?.label || nextAction
      const comment: TicketComment = {
        id: `tc-vendor-resp-${Date.now()}`,
        author: 'Vendor',
        message: `Response submitted: ${actionLabel}`,
        created_at: new Date().toISOString(),
      }
      setComments(prev => [...prev, comment])
      setIsSubmitting(false)
      setSubmitted(true)
      setNextAction('')
    }, 800)
  }

  // ===== NOT FOUND =====
  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md w-full">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Ticket Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">
            This ticket link may be expired or invalid. Please contact the administrator.
          </p>
        </div>
      </div>
    )
  }

  const TypeIcon = TYPE_ICONS[ticket.type]
  const statusStyle = STATUS_STYLES[ticket.status]
  const StatusIcon = statusStyle.icon
  const faultStyle = FAULT_STYLES[ticket.fault]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Ticket Portal</p>
              <p className="text-xs text-slate-500">{ticket.id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Ticket Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Title + Badges */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ticket.name || ticket.id}</h1>
              <p className="text-sm text-slate-500 mt-1">{ticket.project_name}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                  <TypeIcon className="w-3 h-3" />
                  {TYPE_LABELS[ticket.type]}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${faultStyle.bg} ${faultStyle.text}`}>
                  {FAULT_LABELS[ticket.fault]}
                </span>
                {ticket.priority && (
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {ticket.priority}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.reason}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Quantity</p>
                <p className="text-sm font-bold text-slate-900">{ticket.quantity}</p>
              </div>
              {ticket.cost !== undefined && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Est. Cost</p>
                  <p className="text-sm font-bold text-slate-900">${ticket.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Created</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {ticket.resolved_at && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Resolved</p>
                  <p className="text-sm font-medium text-emerald-700">
                    {new Date(ticket.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Resolution */}
            {ticket.resolution && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Resolution</h3>
                <p className="text-sm text-emerald-800">{ticket.resolution}</p>
              </div>
            )}

            {/* Supporting Files (mock) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supporting Files</h3>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">quality-inspection-report.pdf</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">defect-photos.zip</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Comments</h2>
            <span className="text-xs text-slate-400">({comments.length})</span>
          </div>

          <div className="p-6 space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No comments yet. Start the conversation below.</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className={`flex gap-3 ${c.author === 'Vendor' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      c.author === 'Vendor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.author[0]}
                    </div>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      c.author === 'Vendor' ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50 border border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">V</div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Response Section */}
        {!submitted && (ticket.status === 'open' || ticket.status === 'in-progress') && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Vendor Response</h2>
              <p className="text-xs text-slate-500 mt-0.5">Specify the proposed resolution for this ticket.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Proposed Next Action</label>
                <div className="relative">
                  <select
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 pr-8"
                  >
                    {NEXT_ACTIONS.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleSubmitResponse}
                disabled={!nextAction || isSubmitting}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        )}

        {/* Submitted Confirmation */}
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-800">Response Submitted</h3>
            <p className="text-xs text-emerald-600 mt-1">Your response has been recorded. The admin team will review and follow up.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-[10px] text-slate-400">Powered by BrandOps</p>
        </div>
      </div>
    </div>
  )
}
