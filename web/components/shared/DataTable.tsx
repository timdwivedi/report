"use client"

import { ReactNode } from 'react'

// ─── Types ──────────────────────────────────────────
export interface Column<T> {
  key: string
  header: string
  width: string        // e.g. "25%" or "120px" — applied to BOTH th and td
  render: (row: T, index: number) => ReactNode
  headerClassName?: string
  cellClassName?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T, index: number) => void
  rowKey?: (row: T, index: number) => string
  emptyMessage?: string
  className?: string
  compact?: boolean
}

/**
 * DataTable — The standard table for all Bloom dashboard pages.
 *
 * Enforces column alignment by applying matching widths to both
 * <th> and <td> elements. Handles text truncation automatically.
 *
 * Usage:
 *   const columns: Column<Campaign>[] = [
 *     { key: 'name', header: 'Name', width: '25%', render: (r) => r.name },
 *     { key: 'status', header: 'Status', width: '15%', render: (r) => <Badge>{r.status}</Badge> },
 *   ]
 *   <DataTable columns={columns} data={campaigns} onRowClick={(r) => setSelected(r)} />
 */
export default function DataTable<T>({
  columns,
  data,
  onRowClick,
  rowKey,
  emptyMessage = 'No data found',
  className = '',
  compact = false,
}: DataTableProps<T>) {
  const py = compact ? 'py-2.5' : 'py-3.5'

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full table-fixed">
        {/* Colgroup enforces widths at the table level — bulletproof alignment */}
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>

        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => {
              const align = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              return (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${align} ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                className={`transition-all duration-150 ${onRowClick ? 'cursor-pointer hover:bg-blue-50/70 hover:shadow-[inset_3px_0_0_0_rgb(59,130,246)]' : ''}`}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              >
                {columns.map((col) => {
                  const align = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  return (
                    <td
                      key={col.key}
                      className={`px-4 ${py} ${align} overflow-hidden ${col.cellClassName || ''}`}
                    >
                      <div className="truncate">
                        {col.render(row, rowIndex)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
