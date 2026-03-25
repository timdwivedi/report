"use client"

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Toast {
  id: string
  message: string
  type: 'lead' | 'action' | 'metric' | 'sync' | 'alert'
  icon?: string
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

// Domain-specific mock activity messages for promotional merch distribution
const DEFAULT_MOCK_ACTIVITY = [
  { message: 'Progressive Insurance submitted "Q2 Employee Uniforms" — 500 polos', type: 'lead' as const },
  { message: 'Artwork approved: Raisin Canes embroidered logo for event tees', type: 'action' as const },
  { message: 'Quote close rate up 18% this month — Decorator Matrix in action', type: 'metric' as const },
  { message: '250 embroidered polos shipped to Vanderbilt Medical via UPS', type: 'sync' as const },
  { message: 'Red Bull Nashville requested rush order — 1,000 event caps', type: 'lead' as const },
  { message: 'Commission confirmed: $4,280 on Bridgestone uniform program', type: 'metric' as const },
  { message: 'Production alert: Nashville Sounds order entering screen print', type: 'alert' as const },
  { message: 'Order ORD-2026-0142 paid — $18,500 from HCA Healthcare', type: 'action' as const },
]

const TYPE_ICONS: Record<Toast['type'], string> = {
  lead: '👤',
  action: '⚡',
  metric: '📈',
  sync: '🔄',
  alert: '🔔',
}

const TYPE_COLORS: Record<Toast['type'], string> = {
  lead: 'border-emerald-500/30',
  action: 'border-blue-500/30',
  metric: 'border-amber-500/30',
  sync: 'border-purple-500/30',
  alert: 'border-red-500/30',
}

interface DemoToastProviderProps {
  children: ReactNode
  mockMessages?: typeof DEFAULT_MOCK_ACTIVITY
  intervalMin?: number  // Min seconds between toasts
  intervalMax?: number  // Max seconds between toasts
  enabled?: boolean
}

export default function DemoToastProvider({
  children,
  mockMessages = DEFAULT_MOCK_ACTIVITY,
  intervalMin = 25,
  intervalMax = 50,
  enabled = false,
}: DemoToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'action') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-2), { id, message, type }])

    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // Periodic mock activity toasts
  useEffect(() => {
    if (!enabled || mockMessages.length === 0) return

    let timeout: NodeJS.Timeout
    let msgIndex = 0

    const scheduleNext = () => {
      const delay = (intervalMin + Math.random() * (intervalMax - intervalMin)) * 1000
      timeout = setTimeout(() => {
        const msg = mockMessages[msgIndex % mockMessages.length]
        showToast(msg.message, msg.type)
        msgIndex++
        scheduleNext()
      }, delay)
    }

    // First toast after a shorter delay
    timeout = setTimeout(() => {
      const msg = mockMessages[0]
      showToast(msg.message, msg.type)
      msgIndex = 1
      scheduleNext()
    }, 8000)

    return () => clearTimeout(timeout)
  }, [enabled, mockMessages, intervalMin, intervalMax, showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — bottom right, above X-Ray footer */}
      <div className="fixed bottom-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`pointer-events-auto max-w-sm bg-white border ${TYPE_COLORS[toast.type]} rounded-xl px-4 py-3 shadow-xl`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[toast.type]}</span>
                <p className="text-sm text-slate-700 leading-snug">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
