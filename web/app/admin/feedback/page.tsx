"use client"

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { FeedbackItem, FeedbackExportMeta, FeedbackCategory, FeedbackPriority } from '@/lib/types/app'
import {
  MessageSquareText,
  Inbox,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Filter,
  FileText,
  RefreshCw,
  BarChart3,
  List,
  Clock,
  ImageIcon,
  X,
} from 'lucide-react'
import { getImagesByFeedbackId, type StoredImage } from '@/lib/feedback/image-store'
import Portal from '@/components/shared/Portal'

// ─── localStorage keys (shared with XRayModeProvider) ─
const STORAGE_KEY_ITEMS = 'xray-feedback-items'
const STORAGE_KEY_EXPORTS = 'admin-feedback-exports'

// ─── Law 13: Static Tailwind class maps ───────────────

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  ui: { bg: 'bg-purple-50', text: 'text-purple-700' },
  data: { bg: 'bg-blue-50', text: 'text-blue-700' },
  feature: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  workflow: { bg: 'bg-amber-50', text: 'text-amber-700' },
  bug: { bg: 'bg-red-50', text: 'text-red-700' },
  other: { bg: 'bg-slate-50', text: 'text-slate-600' },
}

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

const PIPELINE_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  unprocessed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'New' },
  sent: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Sent' },
  processed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Processed' },
}

// ─── Helpers ──────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getDayStatus(items: FeedbackItem[]): 'unprocessed' | 'sent' | 'processed' {
  if (items.some(i => i.processed_round)) return 'processed'
  if (items.some(i => i.sent_at)) return 'sent'
  return 'unprocessed'
}

function getProcessedRound(items: FeedbackItem[]): number | undefined {
  for (const item of items) {
    if (item.processed_round) return item.processed_round
  }
  return undefined
}

// ─── Export Generators ────────────────────────────────

function generatePipelineExport(items: FeedbackItem[], date: string): string {
  let md = `<!-- STATUS: UNPROCESSED -->\n`
  md += `<!-- EXPORTED: ${new Date().toISOString()} -->\n`
  md += `<!-- DATE: ${date} -->\n`
  md += `<!-- ITEM_COUNT: ${items.length} -->\n\n`
  md += `# Client Feedback — ${date}\n\n`
  md += `> Source: X-Ray Mode (in-app client feedback)\n`
  md += `> Exported: ${new Date().toISOString()}\n`
  md += `> Items: ${items.length}\n\n---\n\n`

  // Group by page
  const byPage: Record<string, FeedbackItem[]> = {}
  for (const item of items) {
    if (!byPage[item.page_path]) byPage[item.page_path] = []
    byPage[item.page_path].push(item)
  }

  for (const [page, pageItems] of Object.entries(byPage)) {
    md += `## ${page}\n\n`
    for (const item of pageItems) {
      md += `### ${item.section_label}\n`
      md += `- **Category:** ${item.category}\n`
      md += `- **Priority:** ${item.priority}\n`
      md += `- **Time:** ${formatTime(item.created_at)}\n`
      if (item.created_by) md += `- **From:** ${item.created_by}\n`
      md += `\n> ${item.message}\n\n`
    }
  }

  return md
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Tab Type ─────────────────────────────────────────

type TabId = 'by-day' | 'all-items' | 'export-history'

const TABS: { id: TabId; label: string; icon: typeof Calendar }[] = [
  { id: 'by-day', label: 'By Day', icon: Calendar },
  { id: 'all-items', label: 'All Items', icon: List },
  { id: 'export-history', label: 'Export History', icon: Clock },
]

// ─── Day Group Interface ──────────────────────────────

interface DayGroup {
  date: string
  items: FeedbackItem[]
  status: 'unprocessed' | 'sent' | 'processed'
  processedRound?: number
}

// ─── Main Page ────────────────────────────────────────

export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState<TabId>('by-day')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | 'all'>('all')

  // ─── Load real feedback from localStorage ───────────
  const [allItems, setAllItems] = useState<FeedbackItem[]>([])
  const [exportHistory, setExportHistory] = useState<FeedbackExportMeta[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS)
      if (stored) setAllItems(JSON.parse(stored))
    } catch { /* localStorage unavailable */ }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPORTS)
      if (stored) setExportHistory(JSON.parse(stored))
    } catch { /* localStorage unavailable */ }
  }, [])

  // Re-read localStorage when window regains focus (catch feedback added in other tabs)
  useEffect(() => {
    function handleFocus() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ITEMS)
        if (stored) setAllItems(JSON.parse(stored))
        const storedExports = localStorage.getItem(STORAGE_KEY_EXPORTS)
        if (storedExports) setExportHistory(JSON.parse(storedExports))
      } catch { /* */ }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Compute stats from real data
  const stats = useMemo(() => {
    const total = allItems.length
    const processed = allItems.filter(i => i.processed_round).length
    const sent = allItems.filter(i => i.sent_at && !i.processed_round).length
    const unprocessed = total - processed - sent
    return { total, unprocessed, sent, processed }
  }, [allItems])

  // Group items by day, newest first
  const dayGroups: DayGroup[] = useMemo(() => {
    const byDate: Record<string, FeedbackItem[]> = {}
    for (const item of allItems) {
      const date = item.created_at.slice(0, 10)
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(item)
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        items,
        status: getDayStatus(items),
        processedRound: getProcessedRound(items),
      }))
  }, [allItems])

  // Filtered items for All Items tab
  const filteredItems = useMemo(() => {
    let items = allItems
    if (categoryFilter !== 'all') {
      items = items.filter(i => i.category === categoryFilter)
    }
    if (priorityFilter !== 'all') {
      items = items.filter(i => i.priority === priorityFilter)
    }
    return items
  }, [allItems, categoryFilter, priorityFilter])

  // Selection helpers
  function toggleItem(id: string) {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleDay(date: string) {
    const dayItems = dayGroups.find(g => g.date === date)?.items ?? []
    const allSelected = dayItems.every(i => selectedItems.has(i.id))
    setSelectedItems(prev => {
      const next = new Set(prev)
      for (const item of dayItems) {
        if (allSelected) next.delete(item.id)
        else next.add(item.id)
      }
      return next
    })
  }

  function toggleDayExpand(date: string) {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  function toggleItemExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Mark items as sent and persist
  function markItemsSent(itemIds: string[]) {
    const now = new Date().toISOString()
    setAllItems(prev => {
      const updated = prev.map(item =>
        itemIds.includes(item.id) ? { ...item, sent_at: item.sent_at || now } : item
      )
      try { localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated)) } catch { /* */ }
      return updated
    })
  }

  // Add export to history and persist
  function addExportRecord(filename: string, date: string, itemCount: number) {
    const entry: FeedbackExportMeta = {
      filename,
      date,
      item_count: itemCount,
      sent_at: new Date().toISOString(),
    }
    setExportHistory(prev => {
      const updated = [entry, ...prev]
      try { localStorage.setItem(STORAGE_KEY_EXPORTS, JSON.stringify(updated)) } catch { /* */ }
      return updated
    })
  }

  function handleExportDay(date: string) {
    const group = dayGroups.find(g => g.date === date)
    if (!group) return
    const md = generatePipelineExport(group.items, date)
    const filename = `feedback-${date}.md`
    downloadMarkdown(md, filename)
    markItemsSent(group.items.map(i => i.id))
    addExportRecord(filename, date, group.items.length)
  }

  function handleExportSelected() {
    const items = allItems.filter(i => selectedItems.has(i.id))
    if (items.length === 0) return
    const date = new Date().toISOString().slice(0, 10)
    const md = generatePipelineExport(items, date)
    const filename = `feedback-selected-${date}.md`
    downloadMarkdown(md, filename)
    markItemsSent(items.map(i => i.id))
    addExportRecord(filename, date, items.length)
    setSelectedItems(new Set())
  }

  function handleReExport(entry: FeedbackExportMeta) {
    const items = allItems.filter(i => i.created_at.slice(0, 10) === entry.date)
    const md = generatePipelineExport(items, entry.date)
    downloadMarkdown(md, entry.filename)
  }

  // ─── Stat Cards ───────────────────────────────────

  const statCards = [
    { label: 'Total Items', value: stats.total, icon: MessageSquareText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Unprocessed', value: stats.unprocessed, icon: Inbox, color: 'bg-slate-50 text-slate-600' },
    { label: 'Sent to Pipeline', value: stats.sent, icon: Send, color: 'bg-amber-50 text-amber-600' },
    { label: 'Processed', value: stats.processed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Client Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">X-Ray Mode feedback from client sessions</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'by-day' && (
            <ByDayTab
              dayGroups={dayGroups}
              selectedItems={selectedItems}
              expandedDays={expandedDays}
              expandedItems={expandedItems}
              toggleItem={toggleItem}
              toggleDay={toggleDay}
              toggleDayExpand={toggleDayExpand}
              toggleItemExpand={toggleItemExpand}
              onExportDay={handleExportDay}
              onExportSelected={handleExportSelected}
            />
          )}
          {activeTab === 'all-items' && (
            <AllItemsTab
              items={filteredItems}
              expandedItems={expandedItems}
              toggleItemExpand={toggleItemExpand}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
          )}
          {activeTab === 'export-history' && (
            <ExportHistoryTab
              history={exportHistory}
              onReExport={handleReExport}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar: Export Selected */}
      {activeTab === 'by-day' && selectedItems.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Selected ({selectedItems.size})
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Tab 1: By Day ────────────────────────────────────

function ByDayTab({
  dayGroups,
  selectedItems,
  expandedDays,
  expandedItems,
  toggleItem,
  toggleDay,
  toggleDayExpand,
  toggleItemExpand,
  onExportDay,
  onExportSelected,
}: {
  dayGroups: DayGroup[]
  selectedItems: Set<string>
  expandedDays: Set<string>
  expandedItems: Set<string>
  toggleItem: (id: string) => void
  toggleDay: (date: string) => void
  toggleDayExpand: (date: string) => void
  toggleItemExpand: (id: string) => void
  onExportDay: (date: string) => void
  onExportSelected: () => void
}) {
  if (dayGroups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">No feedback yet</p>
        <p className="text-xs text-slate-400 mt-1">
          When clients leave feedback using X-Ray Mode, it will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {dayGroups.map(group => {
        const isExpanded = expandedDays.has(group.date)
        const allSelected = group.items.every(i => selectedItems.has(i.id))
        const someSelected = group.items.some(i => selectedItems.has(i.id))
        const statusMeta = PIPELINE_STATUS[group.status]

        return (
          <div
            key={group.date}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={() => toggleDay(group.date)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <button
                  onClick={() => toggleDayExpand(group.date)}
                  className="flex items-center gap-3 text-left"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{formatDate(group.date)}</h3>
                    <p className="text-xs text-slate-500">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </button>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.text}`}>
                  {statusMeta.label}
                  {group.processedRound != null && ` R${group.processedRound}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExportDay(group.date)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Day
                </button>
                <button
                  onClick={() => toggleDayExpand(group.date)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Item List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100">
                    {group.items.map(item => (
                      <FeedbackRow
                        key={item.id}
                        item={item}
                        selected={selectedItems.has(item.id)}
                        expanded={expandedItems.has(item.id)}
                        onToggleSelect={() => toggleItem(item.id)}
                        onToggleExpand={() => toggleItemExpand(item.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ─── Feedback Row (shared between tabs) ───────────────

function FeedbackRow({
  item,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
}: {
  item: FeedbackItem
  selected: boolean
  expanded: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
}) {
  const [images, setImages] = useState<StoredImage[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other
  const hasAttachments = item.attachments && item.attachments.length > 0

  useEffect(() => {
    if (!hasAttachments) return
    getImagesByFeedbackId(item.id).then(setImages).catch(console.error)
  }, [item.id, hasAttachments])

  return (
    <>
      <div className="px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
          />
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOTS[item.priority]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${catStyle.bg} ${catStyle.text}`}>
                {item.category}
              </span>
              <span className="text-xs font-semibold text-slate-900">{item.section_label}</span>
              {hasAttachments && (
                <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-medium">
                  <ImageIcon className="w-3 h-3" />
                  {item.attachments!.length}
                </span>
              )}
              <span className="text-[10px] text-slate-400">{item.page_path}</span>
              {item.created_by && (
                <span className="text-[10px] text-slate-400">by {item.created_by}</span>
              )}
            </div>
            <button onClick={onToggleExpand} className="text-left w-full mt-1">
              <p className={`text-sm text-slate-600 ${!expanded ? 'truncate' : ''}`}>
                {item.message}
              </p>
            </button>
            {expanded && (
              <>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatTime(item.created_at)}
                  {item.sent_at && ` · Sent ${new Date(item.sent_at).toLocaleDateString()}`}
                  {item.processed_round != null && ` · Round ${item.processed_round}`}
                </p>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {images.map(img => (
                      <button key={img.id} onClick={() => setLightboxImg(img.dataUrl)} className="group relative">
                        <img src={img.dataUrl} alt={img.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-blue-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {lightboxImg && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center cursor-pointer" onClick={() => setLightboxImg(null)}>
            <img src={lightboxImg} alt="Screenshot" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </Portal>
      )}
    </>
  )
}

// ─── Tab 2: All Items ─────────────────────────────────

const ALL_CATEGORIES: { value: FeedbackCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ui', label: 'UI' },
  { value: 'data', label: 'Data' },
  { value: 'feature', label: 'Feature' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Other' },
]

const ALL_PRIORITIES: { value: FeedbackPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

function AllItemsTab({
  items,
  expandedItems,
  toggleItemExpand,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
}: {
  items: FeedbackItem[]
  expandedItems: Set<string>
  toggleItemExpand: (id: string) => void
  categoryFilter: FeedbackCategory | 'all'
  setCategoryFilter: (v: FeedbackCategory | 'all') => void
  priorityFilter: FeedbackPriority | 'all'
  setPriorityFilter: (v: FeedbackPriority | 'all') => void
}) {
  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Category:</span>
          <div className="flex items-center gap-1">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Priority:</span>
          <div className="flex items-center gap-1">
            {ALL_PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => setPriorityFilter(p.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  priorityFilter === p.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No items match the selected filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting category or priority filters</p>
          </div>
        ) : (
          items.map(item => (
            <AllItemsCard
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleItemExpand(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── All Items Card (with image thumbnails) ─────────────

function AllItemsCard({
  item,
  isExpanded,
  onToggleExpand,
}: {
  item: FeedbackItem
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const [images, setImages] = useState<StoredImage[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other
  const hasAttachments = item.attachments && item.attachments.length > 0
  const statusMeta = item.processed_round
    ? PIPELINE_STATUS.processed
    : item.sent_at
      ? PIPELINE_STATUS.sent
      : PIPELINE_STATUS.unprocessed

  useEffect(() => {
    if (!hasAttachments) return
    getImagesByFeedbackId(item.id).then(setImages).catch(console.error)
  }, [item.id, hasAttachments])

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOTS[item.priority]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${catStyle.bg} ${catStyle.text}`}>
                {item.category}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMeta.bg} ${statusMeta.text}`}>
                {statusMeta.label}
                {item.processed_round != null && ` R${item.processed_round}`}
              </span>
              {hasAttachments && (
                <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-medium">
                  <ImageIcon className="w-3 h-3" />
                  {item.attachments!.length}
                </span>
              )}
              <span className="text-[10px] text-slate-400">{item.priority} priority</span>
            </div>

            <p className="text-sm font-semibold text-slate-900">{item.section_label}</p>
            <p className="text-[10px] text-slate-400 mb-2">
              {item.page_path}
              {item.created_by && ` · ${item.created_by}`}
              {` · ${formatDate(item.created_at)}`}
            </p>

            <button onClick={onToggleExpand} className="text-left w-full">
              <p className={`text-sm text-slate-600 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {item.message}
              </p>
            </button>

            {item.message.length > 120 && (
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1 mt-1 text-[10px] text-blue-500 hover:text-blue-700 font-medium"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {isExpanded && images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map(img => (
                  <button key={img.id} onClick={() => setLightboxImg(img.dataUrl)} className="group relative">
                    <img src={img.dataUrl} alt={img.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxImg && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center cursor-pointer" onClick={() => setLightboxImg(null)}>
            <img src={lightboxImg} alt="Screenshot" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </Portal>
      )}
    </>
  )
}

// ─── Tab 3: Export History ─────────────────────────────

function ExportHistoryTab({
  history,
  onReExport,
}: {
  history: FeedbackExportMeta[]
  onReExport: (entry: FeedbackExportMeta) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Export History</h2>
        <p className="text-xs text-slate-500 mt-0.5">Previously exported feedback files</p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No exports yet</p>
          <p className="text-xs text-slate-400 mt-1">Export feedback from the By Day tab to see history here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Filename</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Sent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(entry => {
                const statusMeta = entry.processed_round
                  ? PIPELINE_STATUS.processed
                  : PIPELINE_STATUS.sent

                return (
                  <tr key={entry.filename} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 font-mono">{entry.filename}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{formatDate(entry.date)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-semibold text-slate-900">{entry.item_count}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(entry.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.text}`}>
                        {statusMeta.label}
                        {entry.processed_round != null && ` R${entry.processed_round}`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onReExport(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Re-export
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
