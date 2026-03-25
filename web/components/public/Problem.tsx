"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react"
import { ScrollReveal } from "@/components/shared"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"

const panels = [
  {
    id: "01",
    title: "Quoting Takes Hours",
    description: "Multi-hour spreadsheets. Matrix lookups. Margin math formatting. A single quote eats your afternoon. Multiply by 15 active projects, and your entire week is gone.",
  },
  {
    id: "02",
    title: "Deals Lost to Speed",
    description: "48-hour turnarounds cost you 20% of your deals. By the time you hit send, SanMar has already sent a generic — but much faster — quote.",
  },
  {
    id: "03",
    title: "System Fragmentation",
    description: "Art in Gmail. Pricing in Sheets. Orders in Salesforce. Your data is everywhere, meaning nothing talks, and mistakes are guaranteed.",
  },
  {
    id: "04",
    title: "Unmanageable Programs",
    description: "Complex employee stores and multi-location uniform programs are impossible to manage through rigid, generic vendor portals.",
  },
]

export function Problem() {
  const [activePanel, setActivePanel] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start center", "end center"]
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.25) setActivePanel(0)
    else if (latest < 0.5) setActivePanel(1)
    else if (latest < 0.75) setActivePanel(2)
    else setActivePanel(3)
  })

  return (
    <section className="bg-white relative py-20 md:py-28 overflow-visible">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
              Your Merch Business Runs on Spreadsheets, Email, and Prayer.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Sound familiar? Here is what that's actually costing you.
            </p>
          </div>
        </ScrollReveal>

        {/* 
          400vh tall container to give immense scroll runway. 
          The sticky div sits inside here so only the panels are pinned, centered perfectly in the screen.
        */}
        <div ref={scrollRef} className="relative h-[400vh] mb-16">
          <div className="sticky top-0 h-screen flex flex-col justify-center">
            <div className="flex flex-col md:flex-row gap-4 h-[600px] md:h-[500px]">
              {panels.map((panel, idx) => {
                const isActive = activePanel === idx

                return (
                  <motion.div
                    key={panel.id}
                    layout
                    onClick={() => setActivePanel(idx)}
                    className={`relative cursor-pointer rounded-xl border flex flex-col overflow-hidden transition-colors duration-300 card-depth
                    ${isActive ? 'border-primary-500 bg-white ring-2 ring-primary-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
                  `}
                    initial={false}
                    animate={{
                      flex: isActive ? 4 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className={`p-6 md:p-8 flex flex-col h-full ${isActive ? '' : 'items-center md:items-start'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-mono font-bold transition-colors
                        ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}
                      `}>
                          {panel.id}
                        </div>

                        {isActive && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>

                      {!isActive && (
                        <div className="hidden md:flex flex-1 items-center justify-center -rotate-90 whitespace-nowrap overflow-hidden">
                          <span className="font-heading font-bold text-slate-400 text-xl">
                            {panel.title}
                          </span>
                        </div>
                      )}

                      {!isActive && (
                        <div className="md:hidden">
                          <span className="font-heading font-bold text-slate-500 text-lg">
                            {panel.title}
                          </span>
                        </div>
                      )}

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex flex-col flex-1"
                          >
                            <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                              {panel.title}
                            </h3>
                            <p className="text-slate-600 sm:text-lg leading-relaxed flex-1 overflow-y-auto pr-2">
                              {panel.description}
                            </p>

                            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="inline-block mt-4 md:mt-8 origin-left">
                              <Link
                                href="/calculator"
                                className="inline-flex items-center gap-2 px-5 py-3 md:px-6 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-semibold transition-colors"
                              >
                                Calculate Time Lost <ArrowRight className="w-4 h-4" />
                              </Link>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cost callout */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 md:p-8 max-w-3xl mx-auto text-center card-depth">
            <h3 className="font-heading md:text-2xl font-bold text-red-900 mb-3 flex items-center justify-center gap-2">
              <X className="w-6 h-6 text-red-500" /> How Much Is This Costing You?
            </h3>
            <p className="text-red-800 text-sm md:text-lg mb-6">
              The average merch company loses <span className="font-bold border-b-2 border-red-300">$180K/year</span> to manual processes. Your spreadsheet is costing you six figures.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="inline-block">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-red-600 text-white rounded-[10px] font-bold md:text-lg shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-colors"
              >
                Calculate Your Quoting Cost &rarr;
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
