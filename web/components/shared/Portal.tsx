"use client"

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: ReactNode
}

/**
 * Portal — Renders children at document.body level via React createPortal.
 *
 * USE THIS for any fixed-position overlay: modals, side panels, backdrops,
 * toasts, notification dropdowns. Without Portal, overlays rendered inside
 * a parent with overflow-hidden get clipped and show a gap at the top.
 *
 * Usage:
 *   <Portal>
 *     <div className="fixed inset-0 z-[9999]">...</div>
 *   </Portal>
 */
export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
