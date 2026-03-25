"use client"

import { ReactNode, useState, useRef, useEffect } from 'react'
import { MoreHorizontal, ArrowRight } from 'lucide-react'

interface KanbanColumn {
  id: string
  title: string
  color: string
  count?: number
  subtitle?: string
}

interface KanbanItem {
  id: string
  columnId: string
  content: ReactNode
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  items: KanbanItem[]
  onMove?: (itemId: string, toColumnId: string) => void
}

function MoveMenu({
  columns,
  currentColumnId,
  onMove,
  onClose,
}: {
  columns: KanbanColumn[]
  currentColumnId: string
  onMove: (columnId: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
    >
      <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Move to</p>
      {columns
        .filter(c => c.id !== currentColumnId)
        .map(col => (
          <button
            key={col.id}
            onClick={(e) => { e.stopPropagation(); onMove(col.id) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${col.color}`} />
            <span>{col.title}</span>
            <ArrowRight className="w-3 h-3 ml-auto text-slate-400" />
          </button>
        ))}
    </div>
  )
}

export default function KanbanBoard({ columns, items, onMove }: KanbanBoardProps) {
  const [menuItemId, setMenuItemId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((column) => {
          const columnItems = items.filter(item => item.columnId === column.id)

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-[300px]"
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${column.color}`}
                  />
                  <h3 className="font-semibold text-sm text-slate-900">
                    {column.title}
                  </h3>
                  {(column.count !== undefined || columnItems.length > 0) && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {column.count ?? columnItems.length}
                    </span>
                  )}
                  {column.subtitle && (
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {column.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Column content */}
              <div className="space-y-2">
                {columnItems.length > 0 ? (
                  columnItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all duration-200 relative group"
                    >
                      {/* Move menu trigger */}
                      {onMove && (
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuItemId(menuItemId === item.id ? null : item.id)
                            }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                            title="Move to..."
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {menuItemId === item.id && (
                            <MoveMenu
                              columns={columns}
                              currentColumnId={column.id}
                              onMove={(toColumnId) => {
                                onMove(item.id, toColumnId)
                                setMenuItemId(null)
                              }}
                              onClose={() => setMenuItemId(null)}
                            />
                          )}
                        </div>
                      )}
                      {item.content}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">No items</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
