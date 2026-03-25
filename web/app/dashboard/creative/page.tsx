"use client"

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getAllDemoCreativeRequests, getDemoProjects, getDemoClients } from '@/lib/demo/demo-data-provider'
import CreativeRequestDetailPanel from '@/components/projects/CreativeRequestDetailPanel'
import Portal from '@/components/shared/Portal'
import { useToast } from '@/components/shared'
import { CREATIVE_REQUEST_TYPE_LABELS } from '@/lib/constants/app'
import type { CreativeRequest, CreativeRequestStatus, CreativeRequestType, Project } from '@/lib/types/app'
import {
  Palette,
  Search,
  LayoutGrid,
  List,
  Link2,
  Plus,
  X,
  Calendar,
  GripVertical,
  ChevronRight,
  Share2,
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

const KANBAN_COLUMNS: { status: CreativeRequestStatus; label: string; headerColor: string }[] = [
  { status: 'pending', label: 'Pending', headerColor: 'bg-amber-500' },
  { status: 'in-progress', label: 'In Progress', headerColor: 'bg-blue-500' },
  { status: 'review', label: 'Review', headerColor: 'bg-orange-500' },
  { status: 'approved', label: 'Approved', headerColor: 'bg-emerald-500' },
  { status: 'cancelled', label: 'Cancelled', headerColor: 'bg-gray-400' },
]

type ViewMode = 'table' | 'kanban'

// ===== COMPONENT =====

export default function CreativePage() {
  const [allRequests, setAllRequests] = useState<CreativeRequest[]>(() => getAllDemoCreativeRequests())
  const projects = useMemo(() => getDemoProjects(), [])

  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {}
    for (const p of projects) {
      map[p.id] = p
    }
    return map
  }, [projects])

  const { showToast } = useToast()

  // --- State ---
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<CreativeRequest | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)

  // --- Filtered list ---
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

  // --- Format due date ---
  function formatDueDate(dateStr?: string): string {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // G20: Share All Requests
  const handleShareAll = useCallback(() => {
    const shareId = crypto.randomUUID()
    const url = `${window.location.origin}/creative/${shareId}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Shareable link copied to clipboard', 'action')
    }).catch(() => {
      showToast('Failed to copy link', 'action')
    })
  }, [showToast])

  // FB-078: Per-request share handler
  const handleShareRequest = useCallback((requestId: string) => {
    const shareId = crypto.randomUUID()
    const url = `${window.location.origin}/creative/${shareId}#request-${requestId}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Request link copied to clipboard', 'action')
    }).catch(() => {
      showToast('Failed to copy link', 'action')
    })
  }, [showToast])

  // G7: Kanban move handler
  const handleKanbanMove = useCallback((requestId: string, newStatus: CreativeRequestStatus) => {
    setAllRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r)
    )
    showToast(`Moved to ${CREATIVE_STATUS_LABELS[newStatus]}`, 'action')
  }, [showToast])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Palette className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Creative Requests</h1>
          <p className="text-sm text-slate-500">All creative work across projects</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* G22: New Request button */}
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={14} />
            New Creative Request
          </button>
          {/* G20: Share All */}
          <button
            onClick={handleShareAll}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Link2 size={14} />
            Share All
          </button>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(CREATIVE_STATUS_LABELS) as CreativeRequestStatus[]).map((s) => (
            <option key={s} value={s}>{CREATIVE_STATUS_LABELS[s]}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {(Object.keys(CREATIVE_REQUEST_TYPE_LABELS) as CreativeRequestType[]).map((t) => (
            <option key={t} value={t}>{CREATIVE_REQUEST_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* G7: View toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={14} />
            Table
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'kanban' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={14} />
            Kanban
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-slate-200 rounded-xl bg-white">
          <Palette className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No creative requests found.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table View ── */
        <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 overflow-hidden">
          {filtered.map((req) => {
            const statusStyle = CREATIVE_STATUS_STYLES[req.status]
            return (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {req.title ?? req.description}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-500 uppercase tracking-wide flex-shrink-0">
                      {req.type === 'other' && req.custom_type_name ? req.custom_type_name : CREATIVE_REQUEST_TYPE_LABELS[req.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {req.client_name && (
                      <>
                        <span>{req.client_name}</span>
                        <span className="text-slate-300">&gt;</span>
                      </>
                    )}
                    {req.project_name && <span>{req.project_name}</span>}
                    {req.assigned_to && (
                      <>
                        <span className="text-slate-300 ml-1">|</span>
                        <span className="ml-1">{req.assigned_to}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {req.due_date && (
                    <span className="text-xs text-slate-400">
                      {formatDueDate(req.due_date)}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {CREATIVE_STATUS_LABELS[req.status]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShareRequest(req.id)
                    }}
                    className="p-1 text-slate-300 hover:text-primary-600 rounded transition-colors"
                    title="Copy shareable link"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        /* ── G7: Kanban View ── */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colCards = filtered.filter(r => r.status === col.status)
            return (
              <div key={col.status} className="flex-shrink-0 w-[260px]">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.headerColor}`} />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.label}</span>
                  <span className="text-xs text-slate-400 font-medium ml-auto">{colCards.length}</span>
                </div>
                {/* Cards */}
                <div className="space-y-2.5 min-h-[80px]">
                  {colCards.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical size={14} className="text-slate-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
                          {req.title ?? req.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-500 uppercase tracking-wide">
                          {req.type === 'other' && req.custom_type_name ? req.custom_type_name : CREATIVE_REQUEST_TYPE_LABELS[req.type]}
                        </span>
                        {req.project_name && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{req.project_name}</span>
                        )}
                      </div>
                      {req.due_date && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                          <Calendar size={10} />
                          {formatDueDate(req.due_date)}
                        </div>
                      )}
                      {/* Quick move + Share */}
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShareRequest(req.id)
                          }}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                          title="Copy shareable link"
                        >
                          <Share2 size={8} className="inline -mt-px" /> Share
                        </button>
                        {KANBAN_COLUMNS
                          .filter(c => c.status !== req.status)
                          .slice(0, 3)
                          .map(c => (
                            <button
                              key={c.status}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleKanbanMove(req.id, c.status)
                              }}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                              title={`Move to ${c.label}`}
                            >
                              <ChevronRight size={8} className="inline -mt-px" /> {c.label}
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                  {colCards.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg py-6 text-center">
                      <p className="text-xs text-slate-300">No requests</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selectedRequest && projectMap[selectedRequest.project_id] && (
        <CreativeRequestDetailPanel
          request={selectedRequest}
          project={projectMap[selectedRequest.project_id]}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* G22: New Creative Request Modal */}
      {showNewRequestModal && (
        <NewCreativeRequestModal
          projects={projects}
          onClose={() => setShowNewRequestModal(false)}
          onSave={(req) => {
            setAllRequests(prev => [req, ...prev])
            setShowNewRequestModal(false)
            showToast('Creative request created', 'action')
          }}
        />
      )}
    </div>
  )
}

// ===== G22: New Creative Request Modal Component =====

interface NewCreativeRequestModalProps {
  projects: Project[]
  onClose: () => void
  onSave: (request: CreativeRequest) => void
}

function NewCreativeRequestModal({ projects, onClose, onSave }: NewCreativeRequestModalProps) {
  const demoClients = useMemo(() => getDemoClients(), [])

  // FB-082: Support inline project creation
  const [localProjects, setLocalProjects] = useState<Project[]>(projects)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectClientId, setNewProjectClientId] = useState(demoClients[0]?.id ?? '')

  const [projectId, setProjectId] = useState(localProjects[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<CreativeRequestType>('branding-deck')
  const [description, setDescription] = useState('')
  const [initialDraftDate, setInitialDraftDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  const selectedProject = localProjects.find(p => p.id === projectId)

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    const client = demoClients.find(c => c.id === newProjectClientId)
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      org_id: 'demo-org',
      client_id: newProjectClientId,
      client_name: client?.company_name ?? 'Unknown',
      name: newProjectName.trim(),
      project_number: `PRJ-${(localProjects.length + 1).toString().padStart(3, '0')}`,
      status: 'opportunity',
      source: 'direct',
      is_critical: false,
      estimated_total: 0,
      line_items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLocalProjects(prev => [newProject, ...prev])
    setProjectId(newProject.id)
    setShowCreateProject(false)
    setNewProjectName('')
  }

  const handleSubmit = () => {
    if (!title.trim() || !projectId) return
    const newRequest: CreativeRequest = {
      id: `cr-${Date.now()}`,
      project_id: projectId,
      type,
      description: description || title,
      status: 'pending',
      initial_draft_date: initialDraftDate || undefined,
      due_date: dueDate || undefined,
      files: [],
      title,
      project_name: selectedProject?.name,
      client_name: selectedProject?.client_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onSave(newRequest)
  }

  return (
    <Portal>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">New Creative Request</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Project */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Project
              </label>
              {showCreateProject ? (
                <div className="border border-primary-200 rounded-lg bg-primary-50/30 p-3 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">New Project</p>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    autoFocus
                  />
                  <select
                    value={newProjectClientId}
                    onChange={(e) => setNewProjectClientId(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {demoClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Create Project
                    </button>
                    <button
                      onClick={() => setShowCreateProject(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <select
                    value={projectId}
                    onChange={(e) => {
                      if (e.target.value === '__create_new__') {
                        setShowCreateProject(true)
                      } else {
                        setProjectId(e.target.value)
                      }
                    }}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {localProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.client_name} - {p.name}</option>
                    ))}
                    <option value="__create_new__">+ Create New Project</option>
                  </select>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Homepage Banner Design"
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CreativeRequestType)}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {(Object.entries(CREATIVE_REQUEST_TYPE_LABELS) as [CreativeRequestType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the creative work needed..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Initial Draft Date */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Initial Draft Date
              </label>
              <input
                type="date"
                value={initialDraftDate}
                onChange={(e) => setInitialDraftDate(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !projectId}
              className="h-9 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
            >
              Create Request
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  )
}
