"use client"

import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/shared"

export function Testimonials() {
  const testimonials = [
    {
      name: "Trevor Sarver",
      title: "CEO",
      company: "85 Supply",
      avatar: "TS",
      quote:
        "I closed $131K in my first 9 days at Boundless — all manually, all through spreadsheets and Salesforce. If I'd had BrandOps, I would've hit $300K. The quoting engine alone saves me 15 hours a week.",
      metric: "$131K in 9 days",
    },
    {
      name: "Nick Rodriguez",
      title: "CEO",
      company: "Threadbird ($20M revenue)",
      avatar: "NR",
      quote:
        "I told Trevor I'd pay $1,000 a month just for the quoting engine. Nobody in the promotional products industry has anything close to this. My team quotes 3x more projects per week now.",
      metric: "3x more projects",
    },
    {
      name: "Derek Morrison",
      title: "Former CEO",
      company: "Touchstone (sold for $120M)",
      avatar: "DM",
      quote:
        "If this platform works the way I think it will, it'll disrupt the entire promotional products industry. CommonSkew, Liftoff — none of them are thinking at this level. This is the ServiceTitan moment for merch.",
      metric: "Industry disruption",
    },
  ]

  return (
    <ScrollReveal direction="up" delay={0.2}>
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
              This Is Why Industry Leaders Love BrandOps
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built by operators who have closed millions in merch deals.
            </p>
          </div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.name}>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 card-depth h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-heading font-bold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-slate-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.title}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-slate-600 italic flex-1">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-sm font-semibold text-primary-600">
                      {testimonial.metric}
                    </span>
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
