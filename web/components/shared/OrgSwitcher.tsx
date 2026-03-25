"use client"

import { useState, useRef, useEffect } from 'react'
import { useOrgContext } from '@/components/providers/OrgContextProvider'
import { ChevronDown, Check } from 'lucide-react'

export default function OrgSwitcher() {
  const { organizations, activeOrg, setActiveOrg, isViewingAs } = useOrgContext()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!activeOrg || organizations.length <= 1) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: activeOrg.primary_color || '#2563eb' }}
        />
        <span className="max-w-[160px] truncate">{activeOrg.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Account</p>
          </div>
          {organizations.map((org) => {
            const isActive = org.id === activeOrg.id
            return (
              <button
                key={org.id}
                onClick={() => {
                  setActiveOrg(org)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: org.primary_color || '#2563eb' }}
                />
                <span className={`flex-1 truncate ${isActive ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                  {org.name}
                </span>
                {isActive && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
