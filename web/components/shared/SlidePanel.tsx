"use client"

import { ReactNode, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Portal from './Portal'

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  headerActions?: ReactNode
  width?: 'md' | 'lg' | 'xl' | 'full' // md=50%, lg=66%, xl=75%, full=100%
}

const WIDTH_MAP = {
  md: 'max-w-[50vw]',
  lg: 'max-w-[66vw]',
  xl: 'max-w-[75vw]',
  full: 'max-w-full',
}

/**
 * SlidePanel — Right-side slide-out panel using Portal + AnimatePresence.
 *
 * Designed for project detail views, settings drawers, and any content
 * that needs a wide canvas without leaving the current page.
 *
 * Usage:
 *   <SlidePanel isOpen={showDetail} onClose={() => setShowDetail(false)} title="Project Details">
 *     <ProjectDetailContent />
 *   </SlidePanel>
 */
export default function SlidePanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerActions,
  width = 'xl',
}: SlidePanelProps) {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed inset-y-0 right-0 z-[9998] w-full ${WIDTH_MAP[width]} flex flex-col bg-white shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 flex-shrink-0">
                {/* Back arrow */}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
                  aria-label="Close panel"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Title + subtitle */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-lg font-semibold text-slate-900 truncate">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-slate-500 truncate">{subtitle}</p>
                  )}
                </div>

                {/* Action buttons slot */}
                {headerActions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}
