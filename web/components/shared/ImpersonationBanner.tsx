"use client"

import { useOrgContext } from '@/components/providers/OrgContextProvider'
import { Eye, X } from 'lucide-react'

export default function ImpersonationBanner() {
  const { isViewingAs, viewAsOrg, stopViewAs } = useOrgContext()

  if (!isViewingAs || !viewAsOrg) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] bg-amber-500 text-white">
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium">
        <Eye className="w-4 h-4 flex-shrink-0" />
        <span>
          Viewing as: <strong>{viewAsOrg.name}</strong>
        </span>
        <button
          onClick={stopViewAs}
          className="flex items-center gap-1.5 ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs font-semibold transition-colors"
        >
          <X className="w-3 h-3" />
          Exit View As
        </button>
      </div>
    </div>
  )
}
