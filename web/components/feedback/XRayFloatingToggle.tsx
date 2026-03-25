"use client"

import { useXRayMode } from './XRayModeProvider'
import { ScanEye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Floating toggle for pages without a nav bar (landing pages, funnels, portals).
 * Fixed position bottom-right corner. Hides on dashboard/admin (they have header toggles).
 */
export default function XRayFloatingToggle() {
  const { isXRayActive, toggleXRay, feedbackItems, setPanelOpen } = useXRayMode()
  const itemCount = feedbackItems.length

  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-center gap-2" data-xray-ui>
      {/* Feedback count — opens panel */}
      {itemCount > 0 && (
        <button
          onClick={() => setPanelOpen(true)}
          className="w-6 h-6 text-[10px] font-bold bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
          title={`${itemCount} feedback item${itemCount !== 1 ? 's' : ''} — click to view`}
        >
          {itemCount}
        </button>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleXRay}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200',
          isXRayActive
            ? 'bg-blue-600 text-white ring-4 ring-blue-300/50'
            : 'bg-white text-slate-500 hover:text-slate-700 hover:shadow-xl border border-slate-200'
        )}
        title={isXRayActive ? 'Disable X-Ray Mode' : 'Enable X-Ray Mode — leave feedback on any section'}
      >
        <ScanEye className="w-5 h-5" />
        {isXRayActive && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-pulse border-2 border-blue-600" />
        )}
      </button>
    </div>
  )
}
