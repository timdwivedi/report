"use client"

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from '@/components/shared/Portal'
import { useToast } from '@/components/shared'
import { CREATIVE_REQUEST_TYPE_LABELS } from '@/lib/constants/app'
import type { CreativeRequest, CreativeRequestType, CreativeFileSection, Project } from '@/lib/types/app'
import {
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronRight,
  MessageSquare,
  Paperclip,
  X,
  Sparkles,
  Send,
  FolderOpen,
  StickyNote,
  Link2,
  ExternalLink,
} from 'lucide-react'

// ===== PROPS =====

interface CreativeRequestDetailPanelProps {
  request: CreativeRequest
  project: Project
  onClose: () => void
}

// ===== CONSTANTS =====

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  review: { bg: 'bg-orange-100', text: 'text-orange-700' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

const TYPE_OPTIONS: { value: CreativeRequestType; label: string }[] = Object.entries(
  CREATIVE_REQUEST_TYPE_LABELS
).map(([value, label]) => ({ value: value as CreativeRequestType, label }))

const EDIT_STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  'in-progress': Loader2,
  pending: Circle,
}

const FILE_SECTION_TABS: { value: CreativeFileSection; label: string }[] = [
  { value: 'provided', label: 'Provided Files' },
  { value: 'client-provided', label: 'Client-Provided' },
  { value: 'print-files', label: 'Print Files' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

// ===== G5: MOCK AI DESCRIPTION HELPER =====

function mockAiDescription(input: string): string {
  const sentences = input.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const capitalized = sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1))
  const bullets = capitalized.map(s => `  - ${s}`)
  return `${capitalized[0] ?? 'Creative request description'}.\n\n**Deliverables:**\n${bullets.join('\n')}\n\n**Notes:**\n  - Please review brand guidelines before starting\n  - Final delivery in print-ready and web formats`
}

// ===== G8: FILE WITH NOTE =====

interface FileWithNote {
  name: string
  section: CreativeFileSection
  note: string
}

// ===== HELPERS =====

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeTracked(minutes?: number): string {
  if (!minutes) return '0h 0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

// ===== COMPONENT =====

export default function CreativeRequestDetailPanel({
  request,
  project,
  onClose,
}: CreativeRequestDetailPanelProps) {
  const statusStyle = STATUS_STYLES[request.status] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }
  const typeLabel = request.type === 'other' && request.custom_type_name
    ? request.custom_type_name
    : (CREATIVE_REQUEST_TYPE_LABELS[request.type] ?? request.type)

  const versions = useMemo(() => {
    return [...(request.versions ?? [])].sort((a, b) => b.version_number - a.version_number)
  }, [request.versions])

  const editRequests = useMemo(() => {
    return request.edit_requests ?? []
  }, [request.edit_requests])

  const { showToast } = useToast()
  const attachInputRef = useRef<HTMLInputElement>(null)
  const [statusValue, setStatusValue] = useState(request.status)
  const [typeValue, setTypeValue] = useState<CreativeRequestType>(request.type)
  const [customTypeName, setCustomTypeName] = useState(request.custom_type_name ?? '')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [localEditRequests, setLocalEditRequests] = useState(editRequests)

  // G5: AI Description Assistant state
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiOutput, setAiOutput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState(request.description)

  // FB-074: Version URLs state
  const [versionUrls, setVersionUrls] = useState<Record<string, string>>(() => {
    const urls: Record<string, string> = {}
    for (const ver of request.versions ?? []) {
      if (ver.url) urls[ver.id] = ver.url
    }
    return urls
  })
  const [editingVersionUrl, setEditingVersionUrl] = useState<string | null>(null)
  const [versionUrlInput, setVersionUrlInput] = useState('')

  // G6: File sections state
  const [activeFileSection, setActiveFileSection] = useState<CreativeFileSection>('provided')
  const [sectionFiles, setSectionFiles] = useState<FileWithNote[]>(() =>
    request.files.map((f) => ({ name: f, section: 'provided' as CreativeFileSection, note: '' }))
  )

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[10000] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-[55vw] max-w-[900px] h-full bg-slate-50 shadow-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Creative Request Details</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {project.name} — {project.project_number}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Breadcrumb ── */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>{request.client_name ?? project.client_name}</span>
                <ChevronRight size={12} />
                <span>{request.project_name ?? project.name}</span>
                <ChevronRight size={12} />
                <span className="text-slate-600">{request.title ?? request.description.slice(0, 40)}</span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                  {typeLabel}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
                  {request.status}
                </span>
              </div>

              {/* ── Details Card ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700">Details</h4>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Status
                    </label>
                    <select
                      value={statusValue}
                      onChange={(e) => {
                        setStatusValue(e.target.value as CreativeRequest['status'])
                        const label = STATUS_OPTIONS.find(o => o.value === e.target.value)?.label ?? e.target.value
                        showToast(`Status updated to ${label}`, 'action')
                      }}
                      className="w-full h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Type
                    </label>
                    <select
                      value={typeValue}
                      onChange={(e) => {
                        const v = e.target.value as CreativeRequestType
                        setTypeValue(v)
                        if (v !== 'other') setCustomTypeName('')
                        const label = CREATIVE_REQUEST_TYPE_LABELS[v] ?? v
                        showToast(`Type updated to ${label}`, 'action')
                      }}
                      className="w-full h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {typeValue === 'other' && (
                      <input
                        type="text"
                        value={customTypeName}
                        onChange={(e) => setCustomTypeName(e.target.value)}
                        placeholder="Enter custom type..."
                        className="w-full h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mt-2"
                      />
                    )}
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Assigned To
                    </label>
                    <div className="flex items-center gap-2 h-8">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{request.assigned_to ?? 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Initial Draft Date */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Initial Draft Date
                    </label>
                    <div className="flex items-center gap-2 h-8">
                      <Calendar size={14} className="text-slate-400" />
                      <input
                        type="date"
                        defaultValue={request.initial_draft_date ?? ''}
                        onChange={(e) => showToast('Initial draft date updated', 'action')}
                        className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 h-7 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2 h-8">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">
                        {request.due_date ? formatDate(request.due_date) : 'Not set'}
                      </span>
                    </div>
                  </div>

                  {/* Time Tracked */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Time Tracked
                    </label>
                    <div className="flex items-center gap-2 h-8">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">
                        {formatTimeTracked(request.time_tracked_minutes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description + G5 AI Assistant */}
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Description
                    </label>
                    <button
                      onClick={() => setShowAiAssistant(!showAiAssistant)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:text-violet-700 px-2 py-0.5 rounded-md hover:bg-violet-50 transition-colors"
                    >
                      <Sparkles size={12} />
                      AI Assistant
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{descriptionValue}</p>

                  {/* G5: AI Assistant inline panel */}
                  <AnimatePresence>
                    {showAiAssistant && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 border border-violet-200 rounded-lg bg-violet-50/50 p-3 space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                            Describe what you need in plain language
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={aiInput}
                              onChange={(e) => setAiInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && aiInput.trim()) {
                                  setAiLoading(true)
                                  setTimeout(() => {
                                    setAiOutput(mockAiDescription(aiInput))
                                    setAiLoading(false)
                                  }, 600)
                                }
                              }}
                              placeholder="e.g. need a branding deck for the new product launch with 3 concepts..."
                              className="flex-1 h-8 px-3 text-sm border border-violet-200 rounded-md bg-white text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none"
                            />
                            <button
                              onClick={() => {
                                if (!aiInput.trim()) return
                                setAiLoading(true)
                                setTimeout(() => {
                                  setAiOutput(mockAiDescription(aiInput))
                                  setAiLoading(false)
                                }, 600)
                              }}
                              disabled={aiLoading || !aiInput.trim()}
                              className="h-8 px-3 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1"
                            >
                              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                              Generate
                            </button>
                          </div>
                          {aiOutput && (
                            <div className="bg-white border border-violet-100 rounded-md p-3 space-y-2">
                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{aiOutput}</p>
                              <button
                                onClick={() => {
                                  setDescriptionValue(aiOutput)
                                  setAiOutput('')
                                  setAiInput('')
                                  setShowAiAssistant(false)
                                  showToast('Description updated from AI suggestion', 'action')
                                }}
                                className="text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-md transition-colors"
                              >
                                Use This Description
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── G6: Tabbed File Sections + G8: Notes per File ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={14} className="text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-700">Files</h4>
                    <span className="text-xs text-slate-400">({sectionFiles.length})</span>
                  </div>
                  <button
                    onClick={() => attachInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Upload size={12} />
                    Upload to {FILE_SECTION_TABS.find(t => t.value === activeFileSection)?.label}
                  </button>
                  <input
                    ref={attachInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSectionFiles(prev => [...prev, { name: file.name, section: activeFileSection, note: '' }])
                        showToast(`"${file.name}" added to ${FILE_SECTION_TABS.find(t => t.value === activeFileSection)?.label}`, 'action')
                      }
                      e.target.value = ''
                    }}
                  />
                </div>

                {/* Section tabs */}
                <div className="flex border-b border-slate-100 px-5">
                  {FILE_SECTION_TABS.map((tab) => {
                    const count = sectionFiles.filter(f => f.section === tab.value).length
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveFileSection(tab.value)}
                        className={`text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
                          activeFileSection === tab.value
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab.label} {count > 0 && <span className="text-[10px] ml-0.5">({count})</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Files for active section */}
                <div className="divide-y divide-slate-100">
                  {sectionFiles.filter(f => f.section === activeFileSection).length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No files in this section</p>
                    </div>
                  ) : (
                    sectionFiles
                      .map((file, idx) => ({ file, idx }))
                      .filter(({ file }) => file.section === activeFileSection)
                      .map(({ file, idx }) => (
                        <div key={idx} className="px-5 py-2.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                            <button
                              onClick={() => {
                                const updated = [...sectionFiles]
                                updated[idx] = { ...updated[idx], note: updated[idx].note ? '' : ' ' }
                                setSectionFiles(updated)
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Toggle note"
                            >
                              <StickyNote size={14} />
                            </button>
                          </div>
                          {/* G8: Inline note */}
                          {file.note !== '' && (
                            <div className="ml-7 mt-1.5">
                              <input
                                type="text"
                                value={file.note.trim()}
                                onChange={(e) => {
                                  const updated = [...sectionFiles]
                                  updated[idx] = { ...updated[idx], note: e.target.value || ' ' }
                                  setSectionFiles(updated)
                                }}
                                placeholder="Add a note for this file..."
                                className="w-full h-7 px-2 text-xs border border-slate-200 rounded bg-slate-50 text-slate-600 placeholder-slate-300 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                              />
                            </div>
                          )}
                          {file.note.trim().length > 1 && (
                            <p className="ml-7 mt-0.5 text-[11px] text-slate-400">{file.note.trim()}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* ── Version History Section ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-700">Version History</h4>
                    <span className="text-xs text-slate-400">({versions.length})</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {versions.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-sm text-slate-400">No versions yet</p>
                    </div>
                  ) : (
                    versions.map((ver) => (
                      <div key={ver.id} className="px-5 py-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              v{ver.version_number}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(ver.created_at)}
                            </span>
                            {ver.uploaded_by && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <User size={10} />
                                {ver.uploaded_by}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowEditForm(true)
                              }}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              Request Edits
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setStatusValue('approved' as CreativeRequest['status'])
                                showToast('Version approved — status set to Approved', 'action')
                              }}
                              className="text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 px-2 py-1 rounded-md transition-colors"
                            >
                              Upload &amp; Complete
                            </button>
                          </div>
                        </div>
                        {ver.notes && (
                          <p className="text-xs text-slate-500 ml-0.5">{ver.notes}</p>
                        )}
                        {/* FB-074: Version URL field */}
                        <div className="mt-1.5 ml-0.5">
                          {versionUrls[ver.id] && editingVersionUrl !== ver.id ? (
                            <div className="flex items-center gap-2">
                              <Link2 size={12} className="text-slate-400 flex-shrink-0" />
                              <a
                                href={versionUrls[ver.id]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:text-primary-700 hover:underline truncate max-w-[300px]"
                              >
                                {versionUrls[ver.id]}
                              </a>
                              <ExternalLink size={10} className="text-primary-400 flex-shrink-0" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingVersionUrl(ver.id)
                                  setVersionUrlInput(versionUrls[ver.id] || '')
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-600 ml-1 transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          ) : editingVersionUrl === ver.id ? (
                            <div className="flex items-center gap-2">
                              <Link2 size={12} className="text-slate-400 flex-shrink-0" />
                              <input
                                type="url"
                                value={versionUrlInput}
                                onChange={(e) => setVersionUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && versionUrlInput.trim()) {
                                    setVersionUrls(prev => ({ ...prev, [ver.id]: versionUrlInput.trim() }))
                                    setEditingVersionUrl(null)
                                    showToast('Version URL saved', 'action')
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingVersionUrl(null)
                                    setVersionUrlInput('')
                                  }
                                }}
                                placeholder="Paste pitch.com or file URL..."
                                className="flex-1 h-6 px-2 text-xs border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (versionUrlInput.trim()) {
                                    setVersionUrls(prev => ({ ...prev, [ver.id]: versionUrlInput.trim() }))
                                    setEditingVersionUrl(null)
                                    showToast('Version URL saved', 'action')
                                  }
                                }}
                                className="text-[10px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingVersionUrl(null)
                                  setVersionUrlInput('')
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingVersionUrl(ver.id)
                                setVersionUrlInput('')
                              }}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary-600 transition-colors"
                            >
                              <Link2 size={10} />
                              Add URL
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Inline Edit Request Form ── */}
              {showEditForm && (
                <div className="bg-white rounded-xl border border-indigo-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-indigo-100 bg-indigo-50">
                    <h4 className="text-sm font-semibold text-indigo-700">Request Edits</h4>
                  </div>
                  <div className="px-5 py-3 space-y-2">
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Describe the edits needed..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!editNotes.trim()) return
                          const newEdit = {
                            id: `er-${Date.now()}`,
                            description: editNotes.trim(),
                            status: 'pending' as const,
                            requested_by: 'You',
                            created_at: new Date().toISOString(),
                          }
                          setLocalEditRequests((prev) => [...prev, newEdit])
                          setEditNotes('')
                          setShowEditForm(false)
                          setStatusValue('in-progress' as CreativeRequest['status'])
                          showToast('Edit request sent to designer', 'action')
                        }}
                        className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Send Request
                      </button>
                      <button
                        onClick={() => { setShowEditForm(false); setEditNotes('') }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Edit Requests Section ── */}
              {localEditRequests.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-400" />
                      <h4 className="text-sm font-semibold text-slate-700">Edit Requests</h4>
                      <span className="text-xs text-slate-400">({localEditRequests.length})</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {localEditRequests.map((er) => {
                      const Icon = EDIT_STATUS_ICONS[er.status] ?? Circle
                      const isComplete = er.status === 'completed'
                      return (
                        <div key={er.id} className="px-5 py-3 flex items-start gap-3">
                          <Icon
                            size={16}
                            className={`mt-0.5 flex-shrink-0 ${
                              isComplete ? 'text-emerald-500' :
                              er.status === 'in-progress' ? 'text-blue-500 animate-spin' :
                              'text-slate-300'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${isComplete ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {er.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {er.requested_by && (
                                <span className="text-xs text-slate-400">
                                  from {er.requested_by}
                                </span>
                              )}
                              <span className="text-xs text-slate-300">
                                {formatDate(er.created_at)}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                            isComplete ? 'bg-emerald-100 text-emerald-700' :
                            er.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {er.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Notes ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700">Notes</h4>
                </div>
                <div className="px-5 py-4">
                  <textarea
                    rows={3}
                    placeholder="Add notes about this creative request..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  )
}
