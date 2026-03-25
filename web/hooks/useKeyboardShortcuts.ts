"use client"
import { useEffect, useState, useCallback } from 'react'

export function useKeyboardShortcuts() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable

    // Cmd+K (or Ctrl+K) -- Command Palette (works even in inputs)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandPaletteOpen(prev => !prev)
      return
    }

    // Don't process other shortcuts when in input fields
    if (isInput) return

    // ? -- Show shortcuts help
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      setShortcutsHelpOpen(prev => !prev)
      return
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    commandPaletteOpen,
    setCommandPaletteOpen,
    shortcutsHelpOpen,
    setShortcutsHelpOpen,
  }
}
