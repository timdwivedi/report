"use client"

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from './Portal'

interface ClickRevealProps {
  children: ReactNode
  title?: string
  detail: ReactNode
  className?: string
}

/**
 * ClickReveal — Wraps any element. Click it to show a slide-in detail panel.
 * Perfect for cards, list items. Makes mock data interactive.
 *
 * ⚠️  DO NOT use ClickReveal around <tr> elements — the <div> wrapper creates
 * invalid HTML (tbody > div > tr) which breaks table column alignment.
 * For tables, use DetailPanel instead (see below).
 *
 * Usage:
 *   <ClickReveal title="Lead Details" detail={<LeadDetail />}>
 *     <Card>...</Card>
 *   </ClickReveal>
 */
export default function ClickReveal({
  children,
  title = 'Details',
  detail,
  className = '',
}: ClickRevealProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={`cursor-pointer ${className}`}>
        {children}
      </div>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              />

              {/* Slide-in Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-[9999] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {detail}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}

/**
 * Mock detail content generator — agents should customize this per-build.
 * This provides a sensible default for any entity type.
 */
interface MockDetailProps {
  fields: Array<{ label: string; value: string; highlight?: boolean }>
  status?: { label: string; color: string }
  actions?: Array<{ label: string; icon?: string }>
}

export function MockDetail({ fields, status, actions }: MockDetailProps) {
  return (
    <div className="space-y-6">
      {status && (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.color}`} />
          <span className="text-sm font-medium text-slate-700">{status.label}</span>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">{field.label}</span>
            <span className={`text-sm font-medium ${field.highlight ? 'text-primary-600' : 'text-slate-900'}`}>
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-4">
          {actions.map((action, i) => (
            <InlineActionButton key={i} label={action.label} icon={action.icon} />
          ))}
        </div>
      )}
    </div>
  )
}

function InlineActionButton({ label, icon }: { label: string; icon?: string }) {
  const [clicked, setClicked] = useState(false)

  return (
    <button
      onClick={() => {
        setClicked(true)
        setTimeout(() => setClicked(false), 2000)
      }}
      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
    >
      {clicked ? '✓ Done' : `${icon ? icon + ' ' : ''}${label}`}
    </button>
  )
}

/**
 * DetailPanel — Standalone slide-in panel for table rows.
 *
 * Unlike ClickReveal, this does NOT wrap children. You control open/close
 * state yourself and render the panel separately from the clickable element.
 * This is the CORRECT pattern for tables — ClickReveal wraps in a <div>
 * which breaks <tbody> > <tr> relationships.
 *
 * Usage with DataTable:
 *   const [selected, setSelected] = useState<Lead | null>(null)
 *
 *   <DataTable columns={cols} data={leads} onRowClick={setSelected} />
 *
 *   <DetailPanel
 *     isOpen={!!selected}
 *     onClose={() => setSelected(null)}
 *     title="Lead Details"
 *   >
 *     {selected && <MockDetail fields={[...]} />}
 *   </DetailPanel>
 */
interface DetailPanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function DetailPanel({
  isOpen,
  onClose,
  title = 'Details',
  children,
}: DetailPanelProps) {
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-[9999] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}
