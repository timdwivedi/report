"use client"

import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/shared"
import FeatureVisual from "@/components/shared/FeatureVisual"

export function Solution() {
  const steps = [
    {
      number: "01",
      title: "Clients Browse & Get Instant Pricing",
      description:
        "Your branded catalog with real-time pricing powered by the Decorator Matrix Engine. Clients configure products and see accurate pricing across all quantity breaks — no waiting.",
      variant: "dashboard" as const,
    },
    {
      number: "02",
      title: "Projects Flow Into Your Pipeline",
      description:
        "Every request drops into a merch-native Kanban board. 10 stages from Opportunity to Shipped. Never lose a project to email again.",
      variant: "funnel" as const,
    },
    {
      number: "03",
      title: "Share a Client Portal",
      description:
        "One link: artwork upload, quantity confirmation, order approval. Your clients get a Fortune 500 experience on their phone. You get confirmations in minutes, not days.",
      variant: "form" as const,
    },
    {
      number: "04",
      title: "Track Every Order to Delivery",
      description:
        "From production to shipment to invoicing, every order tracked. Commission reporting in real-time. The numbers that prove ROI to your CEO.",
      variant: "chart" as const,
    },
  ]

  return (
    <ScrollReveal direction="up" delay={0.2}>
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        {/* Ambient glow blob */}
        <div className="absolute top-1/2 right-0 w-[480px] h-[480px] bg-primary-500/[0.06] rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
              This Is How BrandOps Fixes All Of That
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps from chaos to control.
            </p>
          </div>

          <StaggerContainer className="space-y-20">
            {steps.map((step, index) => (
              <StaggerItem key={step.number}>
                <div
                  className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Visual */}
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <FeatureVisual
                      variant={step.variant}
                      accent="#3B82F6"
                    />
                  </div>

                  {/* Text */}
                  <div className={index % 2 === 1 ? "md:order-1" : ""}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-mono font-bold text-lg mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-heading font-semibold text-slate-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </ScrollReveal>
  )
}
