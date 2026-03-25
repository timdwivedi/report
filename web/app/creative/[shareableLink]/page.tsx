"use client"

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useParams } from 'next/navigation'
import { getAllDemoCreativeRequests, getDemoProjects } from '@/lib/demo/demo-data-provider'
import { CREATIVE_REQUEST_TYPE_LABELS } from '@/lib/constants/app'
import type { CreativeRequest, CreativeRequestStatus, CreativeRequestType, Project } from '@/lib/types/app'
import {
  Palette,
  Search,
  FileText,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  User,
  ExternalLink,
} from 'lucide-react'

// ===== LABEL MAPS =====

const CREATIVE_STATUS_LABELS: Record<CreativeRequestStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  review: 'Review',
  approved: 'Approved',
  cancelled: 'Cancelled',
}

const CREATIVE_STATUS_STYLES: Record<CreativeRequestStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  review: { bg: 'bg-orange-100', text: 'text-orange-700' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

// ===== HELPERS =====

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

// ===== COMPONENT =====

export default function CreativePublicPage() {
  const params = useParams()
  const _shareableLink = params.shareableLink as string

  // In demo mode, load all requests regardless of link validity
  const allRequests = useMemo(() => getAllDemoCreativeRequests(), [])
  const projects = useMemo(() => getDemoProjects(), [])

  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {}
    for (const p of projects) {
      map[p.id] = p
    }
    return map
  }, [projects])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // FB-078: Auto-scroll to specific request from hash anchor
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#request-')) {
      const requestId = hash.replace('#request-', '')
      setExpandedId(requestId)
      setHighlightedId(requestId)
      // Wait for render, then scroll
      setTimeout(() => {
        const el = document.getElementById(`request-${requestId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      // Clear highlight after animation
      setTimeout(() => setHighlightedId(null), 3000)
    }
  }, [])

  const filtered = useMemo(() => {
    return allRequests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false
      if (typeFilter !== 'all' && req.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const title = (req.title ?? req.description ?? '').toLowerCase()
        const client = (req.client_name ?? '').toLowerCase()
        const project = (req.project_name ?? '').toLowerCase()
        if (!title.includes(q) && !client.includes(q) && !project.includes(q)) return false
      }
      return true
    })
  }, [allRequests, search, statusFilter, typeFilter])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
            <Palette className="h-4.5 w-4.5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Creative Requests</h1>
            <p className="text-xs text-slate-400">Shared view — read only</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(CREATIVE_STATUS_LABELS) as CreativeRequestStatus[]).map((s) => (
              <option key={s} value={s}>{CREATIVE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {(Object.keys(CREATIVE_REQUEST_TYPE_LABELS) as CreativeRequestType[]).map((t) => (
              <option key={t} value={t}>{CREATIVE_REQUEST_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Request List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-slate-200 rounded-xl bg-white">
            <Palette className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No creative requests found.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Project</div>
            </div>

            {filtered.map((req) => {
              const statusStyle = CREATIVE_STATUS_STYLES[req.status]
              const isExpanded = expandedId === req.id
              const versions = [...(req.versions ?? [])].sort((a, b) => b.version_number - a.version_number)

              return (
                <div key={req.id} id={`request-${req.id}`}>
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className={`w-full grid grid-cols-12 gap-4 px-5 py-3 text-left hover:bg-slate-50 transition-colors items-center ${
                      highlightedId === req.id ? 'bg-violet-50 ring-2 ring-violet-300 ring-inset' : ''
                    }`}
                  >
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {req.title ?? req.description}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-500 uppercase tracking-wide">
                        {req.type === 'other' && req.custom_type_name ? req.custom_type_name : CREATIVE_REQUEST_TYPE_LABELS[req.type]}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        {CREATIVE_STATUS_LABELS[req.status]}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500">
                        {req.due_date ? formatDueDate(req.due_date) : '-'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500 truncate block">
                        {req.project_name ?? '-'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Left: Description + Meta */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {req.assigned_to && (
                                  <div className="flex items-center gap-1">
                                    <User size={12} className="text-slate-400" />
                                    {req.assigned_to}
                                  </div>
                                )}
                                {req.client_name && (
                                  <div className="flex items-center gap-1">
                                    <ExternalLink size={12} className="text-slate-400" />
                                    {req.client_name}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400" />
                                  Created {formatDate(req.created_at)}
                                </div>
                              </div>
                            </div>

                            {/* Right: Files + Versions */}
                            <div className="space-y-3">
                              {/* Files */}
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                  Files ({req.files.length})
                                </p>
                                {req.files.length === 0 ? (
                                  <p className="text-xs text-slate-400">No files attached</p>
                                ) : (
                                  <div className="space-y-1">
                                    {req.files.map((file, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                        <FileText size={12} className="text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-600 truncate">{file}</span>
                                        <button className="ml-auto text-slate-400 hover:text-slate-600 transition-colors" title="Download">
                                          <Download size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Version History */}
                              {versions.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Version History ({versions.length})
                                  </p>
                                  <div className="space-y-1">
                                    {versions.map((ver) => (
                                      <div key={ver.id} className="flex items-center gap-2 text-xs">
                                        <Clock size={12} className="text-slate-400 flex-shrink-0" />
                                        <span className="font-semibold text-slate-600">v{ver.version_number}</span>
                                        <span className="text-slate-400">{formatDate(ver.created_at)}</span>
                                        {ver.uploaded_by && (
                                          <span className="text-slate-400">by {ver.uploaded_by}</span>
                                        )}
                                        {ver.notes && (
                                          <span className="text-slate-500 truncate ml-1">- {ver.notes}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-xs text-slate-300">Shared Creative Requests View</p>
      </div>
    </div>
  )
}
