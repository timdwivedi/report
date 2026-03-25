"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-slate-50">
      {/* Dot grid background */}
      <div className="dot-grid-light" />

      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary-500/[0.07] rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/[0.05] rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left column: Text content */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
            }}
            className="lg:col-span-3 text-center lg:text-left"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(12px)", scaleY: 1.1 },
                show: { opacity: 1, y: 0, filter: "blur(0px)", scaleY: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-slate-900 leading-tight mb-4 origin-bottom"
            >
              Close <span className="text-primary-600 text-glow-primary">3x More</span> Merch Deals in Half the Time
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-xl sm:text-2xl font-medium text-slate-700 mb-6"
            >
              Without 5-Hour Manual Quotes
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Instant quoting. Client portals. Pipeline management. Order
              tracking. One platform built by a 13-year industry veteran —
              because the promo products industry should not run on email and
              prayer.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <Button
                  asChild
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-colors duration-200"
                >
                  <Link href="/signup">Start Your Free Trial</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent border-2 border-primary-500 text-primary-500 px-7 py-3 rounded-[10px] font-semibold hover:bg-primary-50 transition-colors duration-200"
                >
                  <Link href="/calculator">Calculate Your Quoting Cost</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { duration: 1.2 } }
              }}
              className="text-sm text-slate-500 mt-6"
            >
              Backed by 85 Supply. Built for the $12B promo products industry.
            </motion.p>
          </motion.div>

          {/* Right column: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
            className="lg:col-span-2 relative z-10"
          >
            <div className="absolute inset-0 bg-primary-500/5 blur-3xl rounded-full" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-6 relative overflow-hidden card-depth"
            >
              {/* macOS window dots */}
              <div className="flex gap-1.5 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-heading font-semibold text-slate-900">
                    Pipeline
                  </h3>
                  <div className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">12 active</div>
                </div>

                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
                  }}
                  className="space-y-3"
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-primary-200 ring-1 ring-primary-500/20 shadow-sm rounded-lg p-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <div className="text-sm font-bold text-slate-900">
                        Raisin Canes Q2 Uniforms
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-1 rounded-full shadow-sm">
                        Curating
                      </div>
                    </div>
                    <div className="text-2xl font-mono font-bold text-primary-600 relative z-10">
                      $45,000
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-600">
                        Progressive Regional Polos
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        Qualifying
                      </div>
                    </div>
                    <div className="text-2xl font-mono font-bold text-slate-700">
                      $22,000
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 opacity-75 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-slate-600">
                        Threadbird Artist Merch
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-full">
                        Client Review
                      </div>
                    </div>
                    <div className="text-2xl font-mono font-bold text-slate-700">
                      $34,200
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
