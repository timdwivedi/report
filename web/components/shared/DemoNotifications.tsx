"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
  type: 'lead' | 'action' | 'metric' | 'alert'
}

// Domain-specific mock notifications for promotional merch distribution
const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'Raisin Canes submitted new project: Q2 Uniform Rollout ($250K)', time: '12 min ago', read: false, type: 'lead' },
  { id: '2', message: 'Artwork uploaded by Red Bull Nashville — event cap design v2', time: '45 min ago', read: false, type: 'action' },
  { id: '3', message: 'Order shipped: Nashville Sounds 500x embroidered caps via UPS', time: '2 hrs ago', read: false, type: 'action' },
  { id: '4', message: 'Progressive Insurance approved $22K regional polo order', time: '3 hrs ago', read: true, type: 'action' },
  { id: '5', message: 'Budget alert: Raisin Canes program spend at 68% of limit', time: '1 day ago', read: true, type: 'alert' },
]

const TYPE_ICONS: Record<string, string> = {
  lead: '👤',
  action: '⚡',
  metric: '📈',
  alert: '🔔',
}

interface DemoNotificationsProps {
  notifications?: Notification[]
}

/**
 * DemoNotifications — Notification bell with badge count + dropdown.
 * Place in the dashboard header. Badge count increments periodically.
 *
 * Usage:
 *   <DemoNotifications />  // Uses defaults
 *   <DemoNotifications notifications={customNotifications} />
 */
export default function DemoNotifications({
  notifications: initialNotifications = DEFAULT_NOTIFICATIONS,
}: DemoNotificationsProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  // Periodically add a new notification
  useEffect(() => {
    const newNotifs = [
      { message: 'New project request from HCA Healthcare — 200 nurse scrub sets', type: 'lead' as const },
      { message: 'Monthly commission total: $12,400 across 8 orders', type: 'metric' as const },
      { message: 'Production delay: Bridgestone jacket embroidery pushed to Friday', type: 'alert' as const },
    ]

    let idx = 0
    const interval = setInterval(() => {
      if (idx >= newNotifs.length) return
      const n = newNotifs[idx]
      setNotifications(prev => [
        { id: `new-${Date.now()}`, message: n.message, time: 'Just now', read: false, type: n.type },
        ...prev.slice(0, 7),
      ])
      idx++
    }, 35000) // Every ~35s

    return () => clearInterval(interval)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9997]"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[9998] overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      !notif.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-snug">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
