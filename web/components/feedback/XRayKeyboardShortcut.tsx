"use client"

import { useEffect } from 'react'
import { useXRayMode } from './XRayModeProvider'

/**
 * Global keyboard shortcut for X-Ray Mode.
 * Cmd+Shift+X (Mac) / Ctrl+Shift+X (Windows) toggles X-Ray on/off.
 * Works even when panels/modals cover the toggle button.
 */
export default function XRayKeyboardShortcut() {
  const { toggleXRay } = useXRayMode()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault()
        toggleXRay()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleXRay])

  return null
}
