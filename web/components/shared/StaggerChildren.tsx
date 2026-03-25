"use client"

import { motion, useInView } from 'motion/react'
import { useRef, ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  stagger?: number
  className?: string
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  className = '',
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
}

export function StaggerItem({
  children,
  direction = 'up',
  className = '',
}: StaggerItemProps) {
  const offsets = {
    up: { y: 25 },
    left: { x: 25 },
    right: { x: -25 },
    none: {},
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offsets[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
