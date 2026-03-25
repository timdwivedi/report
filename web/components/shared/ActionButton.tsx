"use client"

import { useState } from 'react'
import { motion } from 'motion/react'

interface ActionButtonProps {
  label: string
  icon?: string
  successMessage?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  onClick?: () => void
}

/**
 * ActionButton — A button that shows feedback when clicked.
 * Instead of doing nothing (dead mockup), it confirms the action with a checkmark.
 *
 * Usage:
 *   <ActionButton label="Export Report" icon="📊" successMessage="Report generated!" />
 *   <ActionButton label="Send Email" variant="primary" />
 */
export default function ActionButton({
  label,
  icon,
  successMessage,
  variant = 'secondary',
  className = '',
  onClick,
}: ActionButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleClick = () => {
    if (state !== 'idle') return
    setState('loading')
    onClick?.()

    // Fake loading → success
    setTimeout(() => {
      setState('success')
      setTimeout(() => setState('idle'), 2500)
    }, 800 + Math.random() * 600)
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 font-semibold',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      className={`
        relative px-4 py-2.5 rounded-lg text-sm transition-all duration-200
        flex items-center gap-2 overflow-hidden
        ${variantClasses[variant]}
        ${state !== 'idle' ? 'pointer-events-none' : ''}
        ${className}
      `}
    >
      {/* Loading state */}
      {state === 'loading' && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-primary-500/10"
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {state === 'idle' && icon && <span>{icon}</span>}
        {state === 'loading' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {state === 'success' && <span className="text-emerald-600">✓</span>}

        <span>
          {state === 'idle' && label}
          {state === 'loading' && 'Processing...'}
          {state === 'success' && (successMessage || `${label} complete`)}
        </span>
      </span>
    </motion.button>
  )
}
