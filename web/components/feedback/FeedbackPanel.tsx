"use client"

import { useState, useMemo, useEffect } from 'react'
import { useXRayMode } from './XRayModeProvider'
import Portal from '@/components/shared/Portal'
import { AnimatePresence, motion } from 'motion/react'
import {
  X,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileText,
  FileArchive,
  AlertCircle,
  ImageIcon,
} from 'lucide-react'
import type { FeedbackItem, FeedbackCategory } from '@/lib/types/app'
import { getImagesByFeedbackId, type StoredImage } from '@/lib/feedback/image-store'

const CATEGORY_STYLES: Record<FeedbackCategory, { bg: string; text: string }> = {
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

type FilterTab = 'all' | 'this-page' | FeedbackCategory

function FeedbackItemCard({ item, onRemove }: { item: FeedbackItem; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [images, setImages] = useState<StoredImage[]>([])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const wordCount = item.message.split(/\s+/).filter(Boolean).length
  const isLong = item.message.length > 200
  const catStyle = CATEGORY_STYLES[item.category]
  const timeAgo = getTimeAgo(item.created_at)
  const hasAttachments = item.attachments && item.attachments.length > 0

  // Load images from IndexedDB when card has attachments
  useEffect(() => {
    if (!hasAttachments) return
    getImagesByFeedbackId(item.id).then(setImages).catch(console.error)
  }, [item.id, hasAttachments])

  return (
    <>
      <div className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[item.priority]}`} />
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${catStyle.bg} ${catStyle.text}`}>
              {item.category}
            </span>
            {hasAttachments && (
              <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-medium">
                <ImageIcon className="w-3 h-3" />
                {item.attachments!.length}
              </span>
            )}
            {wordCount > 50 && (
              <span className="text-[10px] text-slate-400 font-medium">{wordCount} words</span>
            )}
          </div>
          <button onClick={onRemove} className="p-1 hover:bg-red-50 rounded group flex-shrink-0">
            <Trash2 className="w-3 h-3 text-slate-300 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Section label */}
        <p className="text-xs font-medium text-slate-900 truncate mb-0.5">{item.section_label}</p>

        {/* Page path */}
        <p className="text-[10px] text-slate-400 mb-1.5">{item.page_path} · {timeAgo}</p>

        {/* Message */}
        <p className={`text-xs text-slate-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
          {item.message}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-1 text-[10px] text-blue-500 hover:text-blue-700 font-medium"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Attachment thumbnails */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {images.map(img => (
              <button
                key={img.id}
                onClick={() => setLightboxImg(img.dataUrl)}
                className="relative group"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-14 h-14 object-cover rounded border border-slate-200 hover:border-blue-400 transition-colors"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox for full-size image */}
      {lightboxImg && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center cursor-pointer"
            onClick={() => setLightboxImg(null)}
          >
            <img
              src={lightboxImg}
              alt="Screenshot"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </Portal>
      )}
    </>
  )
}

function getTimeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function FeedbackPanel() {
  const {
    panelOpen,
    setPanelOpen,
    feedbackItems,
    removeFeedback,
    clearFeedback,
    activePage,
    exportFeedbackJSON,
    exportFeedbackMarkdown,
    exportFeedbackZip,
    autoCloseAfterSubmit,
    setAutoCloseAfterSubmit,
  } = useXRayMode()

  const [filter, setFilter] = useState<FilterTab>('all')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const filteredItems = useMemo(() => {
    if (filter === 'all') return feedbackItems
    if (filter === 'this-page') return feedbackItems.filter(i => i.page_path === activePage)
    return feedbackItems.filter(i => i.category === filter)
  }, [feedbackItems, filter, activePage])

  const thisPageCount = feedbackItems.filter(i => i.page_path === activePage).length
  const hasAttachments = feedbackItems.some(i => i.attachments && i.attachments.length > 0)

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = feedbackItems.filter(i => i.created_at.slice(0, 10) === today).length

  const handleExport = (format: 'json' | 'markdown', date?: string) => {
    const filterDate = date // undefined = all
    const content = format === 'json' ? exportFeedbackJSON(filterDate) : exportFeedbackMarkdown(filterDate)
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `client-feedback-${filterDate || 'all'}.${format === 'json' ? 'json' : 'md'}`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const handleExportZip = async (date?: string) => {
    setIsExporting(true)
    try {
      await exportFeedbackZip(date)
    } catch (err) {
      console.error('Zip export failed:', err)
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  return (
    <Portal>
      <div data-xray-ui>
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9993] bg-black/20"
              onClick={() => setPanelOpen(false)}
            />

            {/* Panel drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[9994] w-[420px] max-w-[90vw] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Feedback ({feedbackItems.length})
                  </h2>
                  <p className="text-[10px] text-slate-500">X-Ray Mode — Client feedback collection</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Export — ZIP is primary when screenshots exist */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (hasAttachments) {
                          // Direct ZIP export — today only
                          handleExportZip(today)
                        } else {
                          setShowExportMenu(!showExportMenu)
                        }
                      }}
                      disabled={feedbackItems.length === 0 || isExporting}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                        hasAttachments
                          ? 'hover:bg-blue-100 bg-blue-50'
                          : 'hover:bg-slate-200'
                      }`}
                      title={hasAttachments ? `Export today (${todayCount} items) as ZIP` : `Export today (${todayCount} items)`}
                    >
                      {isExporting ? (
                        <span className="w-4 h-4 block border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : hasAttachments ? (
                        <FileArchive className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Download className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    {/* Secondary options dropdown */}
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={feedbackItems.length === 0}
                      className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                      title="More export options"
                    >
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 w-56">
                        {/* Today only */}
                        <p className="px-3 py-1 text-[10px] text-slate-400 font-medium uppercase tracking-wide">Today ({todayCount} items)</p>
                        {hasAttachments && (
                          <button
                            onClick={() => handleExportZip(today)}
                            disabled={isExporting}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                          >
                            <FileArchive className="w-3.5 h-3.5" />
                            {isExporting ? 'Generating zip...' : 'ZIP — today + screenshots'}
                          </button>
                        )}
                        <button
                          onClick={() => handleExport('markdown', today)}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Markdown — today only
                        </button>
                        <button
                          onClick={() => handleExport('json', today)}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          JSON — today only
                        </button>

                        {/* All history */}
                        <div className="my-1 border-t border-slate-100" />
                        <p className="px-3 py-1 text-[10px] text-slate-400 font-medium uppercase tracking-wide">All history ({feedbackItems.length} items)</p>
                        {hasAttachments && (
                          <button
                            onClick={() => handleExportZip()}
                            disabled={isExporting}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <FileArchive className="w-3.5 h-3.5" />
                            ZIP — all dates + screenshots
                          </button>
                        )}
                        <button
                          onClick={() => handleExport('markdown')}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Markdown — all dates
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          JSON — all dates
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 overflow-x-auto">
                {[
                  { value: 'all' as const, label: `All (${feedbackItems.length})` },
                  { value: 'this-page' as const, label: `This Page (${thisPageCount})` },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                      filter === tab.value
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Feedback list */}
              <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No feedback yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Toggle X-Ray Mode and click any section to leave a note.
                    </p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <FeedbackItemCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeFeedback(item.id)}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50">
                {/* Auto-close toggle */}
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <label className="text-[11px] text-slate-600 font-medium cursor-pointer select-none" htmlFor="auto-close-toggle">
                    Close X-Ray after submit
                  </label>
                  <button
                    id="auto-close-toggle"
                    role="switch"
                    aria-checked={autoCloseAfterSubmit}
                    onClick={() => setAutoCloseAfterSubmit(!autoCloseAfterSubmit)}
                    className={`relative w-8 h-[18px] rounded-full transition-colors ${
                      autoCloseAfterSubmit ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${
                        autoCloseAfterSubmit ? 'translate-x-[16px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                </div>

                {/* Clear + info */}
                {feedbackItems.length > 0 && (
                  <div className="px-4 py-2 flex items-center justify-between">
                    <button
                      onClick={clearFeedback}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear all feedback
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Saved to browser · Export to share
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </Portal>
  )
}
