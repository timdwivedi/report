"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { useXRayMode } from './XRayModeProvider'
import Portal from '@/components/shared/Portal'
import type { FeedbackCategory, FeedbackPriority, FeedbackAttachment } from '@/lib/types/app'
import { fileToDataUrl } from '@/lib/feedback/image-store'
import { X, Send, ImagePlus, Trash2 } from 'lucide-react'

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string; color: string }[] = [
  { value: 'ui', label: 'UI / Design', color: 'bg-purple-100 text-purple-700' },
  { value: 'data', label: 'Data / Content', color: 'bg-blue-100 text-blue-700' },
  { value: 'feature', label: 'Feature Request', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'workflow', label: 'Workflow', color: 'bg-amber-100 text-amber-700' },
  { value: 'bug', label: 'Bug / Issue', color: 'bg-red-100 text-red-700' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700' },
]

const PRIORITY_OPTIONS: { value: FeedbackPriority; label: string; dot: string }[] = [
  { value: 'low', label: 'Low', dot: 'bg-slate-400' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-400' },
  { value: 'high', label: 'High', dot: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', dot: 'bg-red-500' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per image
const MAX_ATTACHMENTS = 5

interface PendingAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

interface FeedbackFormState {
  visible: boolean
  sectionLabel: string
  position: { x: number; y: number }
}

export default function XRayOverlay() {
  const { isXRayActive, addFeedback } = useXRayMode()
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null)
  const [form, setForm] = useState<FeedbackFormState>({ visible: false, sectionLabel: '', position: { x: 0, y: 0 } })
  const [category, setCategory] = useState<FeedbackCategory>('feature')
  const [priority, setPriority] = useState<FeedbackPriority>('medium')
  const [message, setMessage] = useState('')
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const getSectionLabel = useCallback((el: HTMLElement): string => {
    // Explicit data-xray label always wins
    const xrayLabel = el.getAttribute('data-xray')
    if (xrayLabel) return xrayLabel

    const heading = el.querySelector('h1, h2, h3, h4, h5, h6')
    if (heading?.textContent) return heading.textContent.trim().slice(0, 80)

    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    // Element's own ID (human-readable)
    if (el.id && !/^(radix-|headless|:r)/.test(el.id)) {
      return el.id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }

    const firstText = el.querySelector('p, span, label')
    if (firstText?.textContent) return firstText.textContent.trim().slice(0, 80)

    // Semantic tag name as fallback
    const tag = el.tagName.toLowerCase()
    if (['section', 'article', 'header', 'footer', 'nav', 'aside'].includes(tag)) {
      return tag.charAt(0).toUpperCase() + tag.slice(1)
    }

    return el.className?.split(' ').find(c => c.includes('rounded') || c.includes('card') || c.includes('section')) || 'Section'
  }, [])

  // Process files from drop, paste, or file input
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const remaining = MAX_ATTACHMENTS - pendingFiles.length
    const toProcess = imageFiles.slice(0, remaining)

    const newAttachments: PendingAttachment[] = []
    for (const file of toProcess) {
      if (file.size > MAX_FILE_SIZE) continue
      const dataUrl = await fileToDataUrl(file)
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      })
    }

    setPendingFiles(prev => [...prev, ...newAttachments])
  }, [pendingFiles.length])

  const removeAttachment = useCallback((id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  // Paste handler (Cmd+V screenshots)
  useEffect(() => {
    if (!form.visible) return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageItems: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (file) imageItems.push(file)
        }
      }

      if (imageItems.length > 0) {
        e.preventDefault()
        processFiles(imageItems)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [form.visible, processFiles])

  // Hover detection for sections
  useEffect(() => {
    if (!isXRayActive || form.visible) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Skip our own X-Ray UI elements
      if (target.closest('[data-xray-ui]')) return
      // Walk up to find a meaningful container
      let el: HTMLElement | null = target
      let depth = 0
      while (el && el !== document.body && depth < 25) {
        // Explicit data-xray label — always wins, highest priority
        if (el.getAttribute('data-xray') !== null) break

        // Dashboard cards/panels (rounded containers)
        if (
          el.classList.contains('rounded-xl') ||
          el.classList.contains('rounded-lg')
        ) break

        // Constrained content wrappers (max-w-* + centered)
        // Catches inner containers of full-width sections on landing pages
        const cls = typeof el.className === 'string' ? el.className : ''
        if (/max-w-(?!full|screen|none)/.test(cls) && cls.includes('mx-auto')) break

        // Elements with meaningful IDs (not library-internal)
        if (el.id && !/^(radix-|headless|:r|__next)/.test(el.id)) break

        // Semantic HTML landmarks
        if (
          el.tagName === 'SECTION' ||
          el.tagName === 'ARTICLE' ||
          el.tagName === 'HEADER' ||
          el.tagName === 'FOOTER' ||
          el.tagName === 'NAV' ||
          el.tagName === 'ASIDE'
        ) break

        // Dialog/portal detection
        if (
          el.getAttribute('role') === 'dialog' ||
          el.getAttribute('data-radix-portal') !== null
        ) break

        // Direct child of main or body — last resort
        if (
          (el.parentElement?.tagName === 'MAIN') ||
          (el.parentElement === document.body)
        ) break

        el = el.parentElement
        depth++
      }
      if (el && el !== document.body && el !== hoveredEl) {
        setHoveredEl(el)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (!related || !hoveredEl?.contains(related)) {
        setHoveredEl(null)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [isXRayActive, form.visible, hoveredEl])

  // Click to open feedback form
  useEffect(() => {
    if (!isXRayActive || form.visible) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Skip our own X-Ray UI elements
      if (target.closest('[data-xray-ui]')) return
      if (!hoveredEl) return
      e.preventDefault()
      e.stopPropagation()

      const rect = hoveredEl.getBoundingClientRect()
      const label = getSectionLabel(hoveredEl)

      setForm({
        visible: true,
        sectionLabel: label,
        position: {
          x: Math.min(rect.right + 12, window.innerWidth - 420),
          y: Math.max(rect.top, 80),
        },
      })
      setHoveredEl(null)

      setTimeout(() => textareaRef.current?.focus(), 100)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isXRayActive, form.visible, hoveredEl, getSectionLabel])

  const handleSubmit = () => {
    if (!message.trim() && pendingFiles.length === 0) return

    const attachments: FeedbackAttachment[] = pendingFiles.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    addFeedback({
      section_label: form.sectionLabel,
      category,
      priority,
      message: message.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
      pendingImages: pendingFiles.map(f => ({ id: f.id, dataUrl: f.dataUrl })),
    })

    setForm({ visible: false, sectionLabel: '', position: { x: 0, y: 0 } })
    setMessage('')
    setCategory('feature')
    setPriority('medium')
    setPendingFiles([])
  }

  const handleCancel = () => {
    setForm({ visible: false, sectionLabel: '', position: { x: 0, y: 0 } })
    setMessage('')
    setPendingFiles([])
  }

  // Drop zone handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = '' // Reset so same file can be selected again
    }
  }, [processFiles])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (!isXRayActive) return null

  return (
    <Portal>
      <div data-xray-ui>
      {/* Hover highlight outline */}
      {hoveredEl && !form.visible && (() => {
        const rect = hoveredEl.getBoundingClientRect()
        return (
          <div
            className="fixed pointer-events-none z-[99990] border-2 border-dashed border-blue-400 rounded-lg transition-all duration-150"
            style={{
              top: rect.top - 2,
              left: rect.left - 2,
              width: rect.width + 4,
              height: rect.height + 4,
            }}
          >
            <span className="absolute -top-6 left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded whitespace-nowrap">
              Click to leave feedback
            </span>
          </div>
        )
      })()}

      {/* Feedback form — centered modal */}
      {form.visible && (
        <>
          <div className="fixed inset-0 z-[99991] bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
          <div className="fixed inset-0 z-[99992] flex items-center justify-center pointer-events-none">
          <div
            className="w-[440px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-900">Leave Feedback</p>
                <p className="text-xs text-slate-500 truncate max-w-[300px]">{form.sectionLabel}</p>
              </div>
              <button onClick={handleCancel} className="p-1 hover:bg-slate-200 rounded">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        category === opt.value
                          ? `${opt.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPriority(opt.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        priority === opt.value
                          ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message — large textarea for WhisperFlow dictation dumps */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Feedback
                  <span className="ml-2 text-slate-400 font-normal">
                    {message.length > 0 && `${message.split(/\s+/).filter(Boolean).length} words`}
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, paste WhisperFlow transcription, or brain dump here..."
                  className="w-full min-h-[160px] px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-400"
                />
              </div>

              {/* Screenshot drop zone */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Screenshots
                  <span className="ml-2 text-slate-400 font-normal">
                    {pendingFiles.length > 0
                      ? `${pendingFiles.length}/${MAX_ATTACHMENTS}`
                      : 'optional'}
                  </span>
                </label>

                {/* Thumbnail previews */}
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pendingFiles.map(file => (
                      <div key={file.id} className="relative group">
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          onClick={() => removeAttachment(file.id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5 rounded-b-lg truncate px-1">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {pendingFiles.length < MAX_ATTACHMENTS && (
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span className="text-xs">
                      {isDragging ? 'Drop screenshot here' : 'Drop, paste (Cmd/Ctrl+V), or click to attach'}
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() && pendingFiles.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
      </div>
    </Portal>
  )
}
