"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Portal from '@/components/shared/Portal'
import { AnimatePresence, motion } from 'motion/react'
import { Search, ArrowRight, Layout, Users, FolderKanban, Package, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCommandPaletteItems } from '@/lib/demo/demo-data-provider'
import type { CommandPaletteItem, CommandCategory } from '@/lib/types/app'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_ICONS: Record<CommandCategory, React.ComponentType<{ className?: string }>> = {
  page: Layout,
  client: Users,
  project: FolderKanban,
  product: Package,
  action: Zap,
}

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  page: 'Pages',
  client: 'Clients',
  project: 'Projects',
  product: 'Products',
  action: 'Actions',
}

const CATEGORY_ORDER: CommandCategory[] = ['page', 'client', 'project', 'product', 'action']
const MAX_PER_CATEGORY = 8

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const allItems = useMemo(() => getCommandPaletteItems(), [])

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems.filter(item => {
      const searchable = [
        item.label,
        item.description || '',
        ...(item.keywords || []),
      ].join(' ').toLowerCase()
      return searchable.includes(q)
    })
  }, [allItems, query])

  // Group by category with truncation
  const groupedItems = useMemo(() => {
    const groups: { category: CommandCategory; items: CommandPaletteItem[]; totalCount: number }[] = []
    for (const cat of CATEGORY_ORDER) {
      const catItems = filteredItems.filter(item => item.category === cat)
      if (catItems.length > 0) {
        groups.push({
          category: cat,
          items: catItems.slice(0, MAX_PER_CATEGORY),
          totalCount: catItems.length,
        })
      }
    }
    return groups
  }, [filteredItems])

  // Flat list of visible items for arrow-key navigation
  const flatVisibleItems = useMemo(() => {
    return groupedItems.flatMap(g => g.items)
  }, [groupedItems])

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      // Small delay to ensure the portal is mounted before focusing
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIndex(prev => Math.min(prev, Math.max(0, flatVisibleItems.length - 1)))
  }, [flatVisibleItems.length])

  const executeItem = useCallback((item: CommandPaletteItem) => {
    if (item.href) {
      router.push(item.href)
    }
    onClose()
  }, [router, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flatVisibleItems.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const item = flatVisibleItems[selectedIndex]
      if (item) executeItem(item)
      return
    }
  }, [flatVisibleItems, selectedIndex, executeItem, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Build a running index counter for data-index attributes
  let runningIndex = 0

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[10001] w-full max-w-xl"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
                  <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search pages, clients, projects..."
                    className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 border border-slate-200 rounded text-slate-400">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
                  {flatVisibleItems.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-slate-400">
                      No results for &quot;{query}&quot;
                    </div>
                  ) : (
                    groupedItems.map((group) => {
                      const startIndex = runningIndex
                      const rows = group.items.map((item, i) => {
                        const globalIndex = startIndex + i
                        const Icon = CATEGORY_ICONS[item.category]
                        return (
                          <button
                            key={item.id}
                            data-index={globalIndex}
                            onClick={() => executeItem(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`h-4 w-4 flex-shrink-0 ${
                              globalIndex === selectedIndex ? 'text-blue-500' : 'text-slate-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{item.label}</span>
                              {item.description && (
                                <span className="text-xs text-slate-400 truncate block">{item.description}</span>
                              )}
                            </div>
                            {globalIndex === selectedIndex && (
                              <ArrowRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            )}
                          </button>
                        )
                      })
                      runningIndex += group.items.length
                      const overflow = group.totalCount - group.items.length

                      return (
                        <div key={group.category}>
                          <div className="px-5 pt-3 pb-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {CATEGORY_LABELS[group.category]}
                            </span>
                          </div>
                          {rows}
                          {overflow > 0 && (
                            <div className="px-5 py-1.5 text-xs text-slate-400 italic">
                              and {overflow} more...
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 font-mono bg-slate-100 border border-slate-200 rounded text-[10px]">&uarr;</kbd>
                    <kbd className="px-1 py-0.5 font-mono bg-slate-100 border border-slate-200 rounded text-[10px]">&darr;</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 font-mono bg-slate-100 border border-slate-200 rounded text-[10px]">&crarr;</kbd>
                    open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 font-mono bg-slate-100 border border-slate-200 rounded text-[10px]">esc</kbd>
                    close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}
