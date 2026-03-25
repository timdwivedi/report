"use client"

import { ScrollReveal } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"

export function FinalCTA() {
  return (
    <ScrollReveal direction="up" delay={0.1}>
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Dot grid for dark background */}
        <div className="dot-grid" />

        {/* Ambient glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/[0.12] rounded-full blur-[160px] pointer-events-none animate-pulse-subtle" />

        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-6 text-gradient-headline">
            Stop Running Your Merch Company from a Spreadsheet.
          </h2>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the distributors who are closing more deals, faster — with
            professional tools built for the promo products industry.
          </p>

          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="inline-block">
            <Button
              asChild
              className="bg-white text-primary-600 hover:bg-slate-100 px-8 py-4 rounded-[10px] font-semibold text-lg shadow-xl transition-colors duration-200"
            >
              <Link href="/signup">Start Your Free Trial — No Credit Card Required</Link>
            </Button>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-white">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Backed by 85 Supply</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Built for the $12B promo industry</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Your data, your ownership</span>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}
