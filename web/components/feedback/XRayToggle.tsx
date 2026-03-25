"use client"

import { useXRayMode } from './XRayModeProvider'
import { ScanEye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function XRayToggle() {
  const { isXRayActive, toggleXRay, feedbackItems, setPanelOpen } = useXRayMode()
  const itemCount = feedbackItems.length

  return (
    <div className="relative flex items-center gap-1" data-xray-ui>
      {/* Toggle button */}
      <button
        onClick={toggleXRay}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-200',
          isXRayActive
            ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-300 ring-offset-1'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        )}
        title={isXRayActive ? 'Disable X-Ray Mode' : 'Enable X-Ray Mode — leave feedback on any section'}
      >
        <ScanEye className="w-5 h-5" />
        {isXRayActive && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Feedback count badge — opens panel */}
      {itemCount > 0 && (
        <button
          onClick={() => setPanelOpen(true)}
          className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full min-w-[18px] text-center hover:bg-blue-600 transition-colors"
          title={`${itemCount} feedback item${itemCount !== 1 ? 's' : ''} — click to view`}
        >
          {itemCount}
        </button>
      )}
    </div>
  )
}
