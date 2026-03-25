"use client"

import Modal from '@/components/shared/Modal'

interface ShortcutsHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['\u2318', 'K'], description: 'Open command palette' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
]

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-3 py-2">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{s.description}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k, j) => (
                <kbd key={j} className="px-2 py-1 text-xs font-mono font-semibold bg-slate-100 border border-slate-300 rounded text-slate-700">
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
