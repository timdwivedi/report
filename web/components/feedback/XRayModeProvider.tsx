"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { FeedbackItem, FeedbackAttachment, FeedbackCategory, FeedbackPriority, FeedbackDayGroup } from '@/lib/types/app'
import {
  saveImages,
  getImagesByFeedbackId,
  deleteImagesByFeedbackId,
  clearAllImages,
  getAllImages,
  dataUrlToBlob,
  type StoredImage,
} from '@/lib/feedback/image-store'

interface XRayModeContextType {
  isXRayActive: boolean
  toggleXRay: () => void
  feedbackItems: FeedbackItem[]
  activePage: string
  addFeedback: (item: {
    section_label: string
    category: FeedbackCategory
    priority: FeedbackPriority
    message: string
    attachments?: FeedbackAttachment[]
    pendingImages?: { id: string; dataUrl: string }[]
  }) => void
  removeFeedback: (id: string) => void
  clearFeedback: () => void
  exportFeedbackJSON: (date?: string) => string
  exportFeedbackMarkdown: (date?: string) => string
  exportFeedbackZip: (date?: string) => Promise<void>
  getFeedbackDayGroups: () => FeedbackDayGroup[]
  exportFeedbackPipelineDay: (date: string) => string
  autoCloseAfterSubmit: boolean
  setAutoCloseAfterSubmit: (value: boolean) => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const XRayModeContext = createContext<XRayModeContextType | null>(null)

export function useXRayMode() {
  const context = useContext(XRayModeContext)
  if (!context) throw new Error('useXRayMode must be used within XRayModeProvider')
  return context
}

const STORAGE_KEY_ACTIVE = 'xray-mode-active'
const STORAGE_KEY_ITEMS = 'xray-feedback-items'
const STORAGE_KEY_AUTO_CLOSE = 'xray-auto-close-after-submit'

export default function XRayModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isXRayActive, setIsXRayActive] = useState(false)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [autoCloseAfterSubmit, setAutoCloseAfterSubmitState] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE)
      if (stored === 'true') setIsXRayActive(true)
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS)
      if (storedItems) setFeedbackItems(JSON.parse(storedItems))
      const storedAutoClose = localStorage.getItem(STORAGE_KEY_AUTO_CLOSE)
      if (storedAutoClose !== null) setAutoCloseAfterSubmitState(storedAutoClose === 'true')
    } catch { /* localStorage unavailable */ }
    setHydrated(true)
  }, [])

  // Persist state changes — only AFTER hydration to prevent clobbering stored data with []
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY_ACTIVE, String(isXRayActive)) } catch { /* */ }
  }, [isXRayActive, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(feedbackItems)) } catch { /* */ }
  }, [feedbackItems, hydrated])

  const setAutoCloseAfterSubmit = useCallback((value: boolean) => {
    setAutoCloseAfterSubmitState(value)
    try { localStorage.setItem(STORAGE_KEY_AUTO_CLOSE, String(value)) } catch { /* */ }
  }, [])

  const toggleXRay = useCallback(() => {
    setIsXRayActive(prev => !prev)
  }, [])

  const addFeedback = useCallback((item: {
    section_label: string
    category: FeedbackCategory
    priority: FeedbackPriority
    message: string
    attachments?: FeedbackAttachment[]
    pendingImages?: { id: string; dataUrl: string }[]
  }) => {
    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const newItem: FeedbackItem = {
      id: feedbackId,
      page_path: pathname,
      section_label: item.section_label,
      category: item.category,
      priority: item.priority,
      message: item.message,
      attachments: item.attachments,
      created_at: new Date().toISOString(),
      status: 'new',
    }

    // Save images to IndexedDB (fire and forget — UI doesn't block on this)
    if (item.pendingImages && item.pendingImages.length > 0) {
      const storedImages: StoredImage[] = item.pendingImages.map(img => ({
        id: img.id,
        feedbackItemId: feedbackId,
        name: item.attachments?.find(a => a.id === img.id)?.name || 'screenshot.png',
        type: item.attachments?.find(a => a.id === img.id)?.type || 'image/png',
        size: item.attachments?.find(a => a.id === img.id)?.size || 0,
        dataUrl: img.dataUrl,
        createdAt: newItem.created_at,
      }))
      saveImages(storedImages).catch(console.error)
    }

    setFeedbackItems(prev => [newItem, ...prev])

    // Auto-close X-Ray mode after submitting feedback if preference is set
    if (autoCloseAfterSubmit) {
      setIsXRayActive(false)
    }
  }, [pathname, autoCloseAfterSubmit])

  const removeFeedback = useCallback((id: string) => {
    deleteImagesByFeedbackId(id).catch(console.error)
    setFeedbackItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearFeedback = useCallback(() => {
    clearAllImages().catch(console.error)
    setFeedbackItems([])
  }, [])

  const exportFeedbackJSON = useCallback((date?: string) => {
    const items = date
      ? feedbackItems.filter(i => i.created_at.slice(0, 10) === date)
      : feedbackItems
    return JSON.stringify({ exported_at: new Date().toISOString(), date: date || 'all', items }, null, 2)
  }, [feedbackItems])

  const exportFeedbackMarkdown = useCallback((filterDate?: string) => {
    const sourceItems = filterDate
      ? feedbackItems.filter(i => i.created_at.slice(0, 10) === filterDate)
      : feedbackItems

    const byDate: Record<string, FeedbackItem[]> = {}
    for (const item of sourceItems) {
      const date = item.created_at.slice(0, 10)
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(item)
    }

    const dates = Object.keys(byDate).sort()
    let md = `<!-- STATUS: UNPROCESSED -->\n`
    md += `<!-- EXPORTED: ${new Date().toISOString()} -->\n`
    md += `<!-- ITEM_COUNT: ${sourceItems.length} -->\n\n`
    md += `# Client Feedback Export\n\n`
    md += `> Source: X-Ray Mode (in-app client feedback)\n`
    md += `> Exported: ${new Date().toISOString()}\n`
    md += `> Total items: ${sourceItems.length}\n`
    md += `> Date range: ${dates.join(', ')}\n\n---\n\n`

    for (const date of dates) {
      const items = byDate[date]
      md += `## ${date} (${items.length} items)\n\n`
      const byPage: Record<string, FeedbackItem[]> = {}
      for (const item of items) {
        if (!byPage[item.page_path]) byPage[item.page_path] = []
        byPage[item.page_path].push(item)
      }
      for (const [page, pageItems] of Object.entries(byPage)) {
        md += `### Page: ${page}\n\n`
        for (const item of pageItems) {
          md += `#### ${item.section_label}\n`
          md += `- **Category:** ${item.category}\n`
          md += `- **Priority:** ${item.priority}\n`
          md += `- **Status:** ${item.status}\n`
          md += `- **Time:** ${item.created_at}\n`
          if (item.attachments && item.attachments.length > 0) {
            md += `- **Attachments:** ${item.attachments.length} screenshot(s)\n`
            for (const att of item.attachments) {
              md += `  - ![${att.name}](images/${att.id}.${att.type.split('/')[1] || 'png'})\n`
            }
          }
          md += `\n> ${item.message}\n\n---\n\n`
        }
      }
    }
    return md
  }, [feedbackItems])

  // Export as ZIP: markdown + images/ folder (optionally filtered to a single date)
  const exportFeedbackZip = useCallback(async (filterDate?: string) => {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    const dateStr = filterDate || new Date().toISOString().slice(0, 10)

    // Generate markdown (filtered if date provided)
    const md = exportFeedbackMarkdown(filterDate)
    zip.file(`client-feedback-${dateStr}.md`, md)

    // Get the set of feedback IDs for this date (to filter images)
    const relevantItems = filterDate
      ? feedbackItems.filter(i => i.created_at.slice(0, 10) === filterDate)
      : feedbackItems
    const relevantIds = new Set(relevantItems.map(i => i.id))

    // Pull images from IndexedDB — only include images belonging to filtered items
    const allImages = await getAllImages()
    const filteredImages = allImages.filter(img => relevantIds.has(img.feedbackItemId))
    if (filteredImages.length > 0) {
      const imagesFolder = zip.folder('images')
      for (const img of filteredImages) {
        const ext = img.type.split('/')[1] || 'png'
        const blob = dataUrlToBlob(img.dataUrl)
        imagesFolder?.file(`${img.id}.${ext}`, blob)
      }
    }

    // Also add JSON export (filtered)
    zip.file(`client-feedback-${dateStr}.json`, exportFeedbackJSON(filterDate))

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `client-feedback-${dateStr}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportFeedbackMarkdown, exportFeedbackJSON, feedbackItems])

  const getFeedbackDayGroups = useCallback((): FeedbackDayGroup[] => {
    const byDate: Record<string, FeedbackItem[]> = {}
    for (const item of feedbackItems) {
      const date = item.created_at.slice(0, 10)
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(item)
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        items,
        sent: items.every(i => !!i.sent_at),
        processed_round: items[0]?.processed_round,
      }))
  }, [feedbackItems])

  const exportFeedbackPipelineDay = useCallback((date: string): string => {
    const dayItems = feedbackItems.filter(i => i.created_at.slice(0, 10) === date)
    let md = `<!-- STATUS: UNPROCESSED -->\n`
    md += `<!-- EXPORTED: ${new Date().toISOString()} -->\n`
    md += `<!-- DATE: ${date} -->\n`
    md += `<!-- ITEM_COUNT: ${dayItems.length} -->\n\n`
    md += `# Client Feedback — ${date}\n\n`
    md += `> Source: X-Ray Mode (in-app client feedback)\n`
    md += `> Exported: ${new Date().toISOString()}\n`
    md += `> Items: ${dayItems.length}\n\n---\n\n`

    const byPage: Record<string, FeedbackItem[]> = {}
    for (const item of dayItems) {
      if (!byPage[item.page_path]) byPage[item.page_path] = []
      byPage[item.page_path].push(item)
    }
    for (const [page, pageItems] of Object.entries(byPage)) {
      md += `## Page: ${page}\n\n`
      for (const item of pageItems) {
        md += `### ${item.section_label}\n`
        md += `- **Category:** ${item.category}\n`
        md += `- **Priority:** ${item.priority}\n`
        md += `- **Status:** ${item.status}\n`
        md += `- **Time:** ${item.created_at}\n`
        if (item.attachments && item.attachments.length > 0) {
          md += `- **Attachments:** ${item.attachments.length} screenshot(s)\n`
          for (const att of item.attachments) {
            md += `  - ![${att.name}](images/${att.id}.${att.type.split('/')[1] || 'png'})\n`
          }
        }
        md += `\n> ${item.message}\n\n---\n\n`
      }
    }
    return md
  }, [feedbackItems])

  return (
    <XRayModeContext.Provider value={{
      isXRayActive,
      toggleXRay,
      feedbackItems,
      activePage: pathname,
      addFeedback,
      removeFeedback,
      clearFeedback,
      exportFeedbackJSON,
      exportFeedbackMarkdown,
      exportFeedbackZip,
      getFeedbackDayGroups,
      exportFeedbackPipelineDay,
      autoCloseAfterSubmit,
      setAutoCloseAfterSubmit,
      panelOpen,
      setPanelOpen,
    }}>
      {children}
    </XRayModeContext.Provider>
  )
}
