"use client"

import { StickyStackingArchive } from "@/components/shared/cinematic/StickyStackingArchive"

export function Pricing() {
  const tiers = [
    {
      id: "1",
      title: "Starter",
      subtitle: "Solo operators, 1 user",
      price: "$99",
      priceSub: "/mo",
      features: [
        "50 products",
        "Basic quoting",
        "Project pipeline",
        "3 active projects",
      ]
    },
    {
      id: "2",
      title: "Professional",
      subtitle: "Teams of 2-10",
      price: "$499",
      priceSub: "/mo",
      features: [
        "Unlimited products",
        "Client portals",
        "Programs module",
        "Commission tracking",
        "Unlimited projects",
      ],
      isPopular: true
    },
    {
      id: "3",
      title: "Enterprise",
      subtitle: "Multi-location agencies",
      price: "$1,499",
      priceSub: "/mo",
      features: [
        "White-label branding",
        "Salesforce integration",
        "Dedicated support",
        "Custom matrices",
        "Priority onboarding",
      ],
      isEnterprise: true
    },
  ]

  return (
    <StickyStackingArchive
      title="Simple, Transparent Pricing"
      subtitle="Launch offer — lock in these rates for life when you start before March 31st"
      items={tiers}
    />
  )
}
