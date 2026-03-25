"use client"

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface LoadingStage {
  label: string
  duration: number  // ms
}

interface LoadingSequenceProps {
  stages: LoadingStage[]
  onComplete?: () => void
  children?: ReactNode  // Content shown after loading completes
  triggerOn?: 'mount' | 'click'
  className?: string
}

/**
 * LoadingSequence — Dramatic multi-stage loading animation.
 * Shows a progress bar with stage labels, then reveals content.
 *
 * Usage:
 *   <LoadingSequence
 *     stages={[
 *       { label: 'Analyzing data...', duration: 1500 },
 *       { label: 'Processing leads...', duration: 2000 },
 *       { label: 'Generating insights...', duration: 1800 },
 *     ]}
 *   >
 *     <Dashboard />
 *   </LoadingSequence>
 */
export default function LoadingSequence({
  stages,
  onComplete,
  children,
  triggerOn = 'mount',
  className = '',
}: LoadingSequenceProps) {
  const [currentStage, setCurrentStage] = useState(triggerOn === 'mount' ? 0 : -1)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)

  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0)

  useEffect(() => {
    if (currentStage < 0) return

    let elapsed = 0
    stages.slice(0, currentStage).forEach(s => { elapsed += s.duration })

    if (currentStage >= stages.length) {
      setIsComplete(true)
      setProgress(100)
      onComplete?.()
      return
    }

    const stage = stages[currentStage]
    const interval = setInterval(() => {
      elapsed += 50
      const totalProgress = (elapsed / totalDuration) * 100
      setProgress(Math.min(totalProgress, 100))
    }, 50)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setCurrentStage(prev => prev + 1)
    }, stage.duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [currentStage, stages, totalDuration, onComplete])

  const start = () => setCurrentStage(0)

  if (isComplete && children) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    )
  }

  if (currentStage < 0) {
    return (
      <div className={className} onClick={start}>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-primary-500 mb-8"
      />

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-slate-500 text-sm font-medium mb-6"
        >
          {stages[Math.min(currentStage, stages.length - 1)]?.label}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Percentage */}
      <p className="text-slate-400 text-xs font-mono mt-3">
        {Math.round(progress)}%
      </p>
    </div>
  )
}
