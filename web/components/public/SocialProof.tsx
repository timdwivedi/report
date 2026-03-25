"use client"

import { ScrollReveal } from "@/components/shared"
import AnimatedCounter from "@/components/shared/AnimatedCounter"

export function SocialProof() {
  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary-600 mb-2">
                <AnimatedCounter value={200} suffix="+" duration={2} />
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                Reps
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary-600 mb-2">
                $<AnimatedCounter value={50} suffix="M+" duration={2.5} />
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                Managed
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary-600 mb-2">
                <AnimatedCounter value={60} suffix="sec" duration={2.2} />
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                Quotes
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary-600 mb-2">
                Zero
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                Spreadsheets
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}
