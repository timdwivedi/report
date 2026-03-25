import { Header } from "@/components/public/Header"
import { Hero } from "@/components/public/Hero"
import { SocialProof } from "@/components/public/SocialProof"
import { Problem } from "@/components/public/Problem"
import { Solution } from "@/components/public/Solution"
import { Benefits } from "@/components/public/Benefits"
import { Testimonials } from "@/components/public/Testimonials"
import { Pricing } from "@/components/public/Pricing"
import { FinalCTA } from "@/components/public/FinalCTA"
import { Footer } from "@/components/public/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white noise-overlay force-light">
      <div className="relative z-10">
        <Header />
        <Hero />
        <SocialProof />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <Problem />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <Solution />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <Benefits />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <Testimonials />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <Pricing />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        <FinalCTA />

        <Footer />
      </div>
    </main>
  )
}
