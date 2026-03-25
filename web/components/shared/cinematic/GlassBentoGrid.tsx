"use client"

import { motion, useMotionValue, useMotionTemplate } from "motion/react"
import { StaggerContainer, StaggerItem, ScrollReveal } from "@/components/shared"
import type { ElementType, MouseEvent } from "react"
import { ArrowRight } from "lucide-react"

interface BentoItem {
  icon: ElementType
  title: string
  description: string
  isLarge?: boolean
  isVertical?: boolean
}

interface GlassBentoGridProps {
  title: string
  subtitle: string
  items: BentoItem[]
}

function BentoCard({ item, spanClass }: { item: BentoItem; spanClass: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <StaggerItem className={`h-full ${spanClass}`}>
      <motion.div
        onMouseMove={handleMouseMove}
        whileHover={{ scale: 1.01, translateY: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="group bg-white rounded-xl border border-slate-200 shadow-sm p-8 card-depth h-full flex flex-col justify-between relative overflow-hidden"
      >
        {/* Volumetric mouse-tracking spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                rgba(59, 130, 246, 0.08),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50">
            <item.icon className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-slate-900">
            {item.title}
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="relative z-10 mt-8 flex items-center gap-2 text-primary-600 font-medium text-sm translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          Learn more <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>
    </StaggerItem>
  )
}

export function GlassBentoGrid({ title, subtitle, items }: GlassBentoGridProps) {
  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Cinematic layer: Ambience */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <StaggerContainer className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, i) => {
              const spanClass = item.isLarge
                ? "md:col-span-2 lg:col-span-2"
                : item.isVertical
                  ? "md:col-span-1 lg:row-span-2"
                  : "col-span-1"

              return <BentoCard key={i} item={item} spanClass={spanClass} />
            })}
          </StaggerContainer>
        </div>
      </section>
    </ScrollReveal>
  )
}
