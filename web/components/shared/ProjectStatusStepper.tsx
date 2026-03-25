"use client"

import type { ProjectStatus } from '@/lib/types/app'

interface ProjectStatusStepperProps {
  currentStatus: ProjectStatus
  onStatusChange?: (status: ProjectStatus) => void
}

/**
 * Step definition for the pipeline stepper.
 * "presenting" is a visual-only step (no matching ProjectStatus value)
 * so its `value` is null. All others map to a real ProjectStatus.
 */
interface StepDef {
  value: ProjectStatus | null
  label: string
}

const STEPS: StepDef[] = [
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'qualifying', label: 'Qualifying' },
  { value: 'curating', label: 'Curating' },
  { value: 'in-design', label: 'In Design' },
  { value: null, label: 'Presenting' },
  { value: 'client-review', label: 'Client Review' },
  { value: 'confirmed', label: 'Ordered' },
]

/**
 * Returns the visual index of the current status within STEPS.
 * "Presenting" (index 4) is treated as a sub-state of "in-design" --
 * if the status is "in-design" the active index stops at 3,
 * and "Presenting" only illuminates if "client-review" or later is reached.
 */
function getActiveIndex(status: ProjectStatus): number {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (STEPS[i].value === status) return i
  }
  // If the status isn't in our stepper list (e.g. post-order statuses),
  // light up everything
  return STEPS.length - 1
}

/**
 * ProjectStatusStepper — Horizontal pipeline progress indicator.
 *
 * Shows project progression from Opportunity through to Ordered.
 * Completed steps show a filled circle with a checkmark, the current
 * step is highlighted with the brand color, and future steps are gray.
 *
 * Usage:
 *   <ProjectStatusStepper
 *     currentStatus={project.status}
 *     onStatusChange={(s) => updateProject({ status: s })}
 *   />
 */
export default function ProjectStatusStepper({
  currentStatus,
  onStatusChange,
}: ProjectStatusStepperProps) {
  const activeIndex = getActiveIndex(currentStatus)

  return (
    <div className="w-full px-2 py-3">
      {/* Steps row */}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex
          const isCurrent = i === activeIndex
          const isFuture = i > activeIndex
          const isClickable = !!onStatusChange && step.value !== null
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Step dot + label column */}
              <div className="flex flex-col items-center">
                {/* Dot / checkmark */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable && step.value) {
                      onStatusChange(step.value)
                    }
                  }}
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-200 text-slate-400'
                    }
                    ${isClickable ? 'cursor-pointer hover:ring-4 hover:ring-indigo-100' : 'cursor-default'}
                  `}
                  aria-label={step.label}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </button>

                {/* Label */}
                <span
                  className={`
                    mt-1.5 text-[11px] leading-tight text-center whitespace-nowrap
                    ${isCurrent ? 'font-bold text-indigo-700' : isCompleted ? 'font-medium text-slate-700' : 'font-medium text-slate-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 mx-1 mt-[-18px]">
                  <div className="h-0.5 w-full rounded-full bg-slate-200 relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: isCompleted ? '100%' : isCurrent ? '0%' : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
