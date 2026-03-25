"use client"

import { GlassBentoGrid } from "@/components/shared/cinematic/GlassBentoGrid"
import { Zap, Trello, Link2, Building2, DollarSign, RefreshCw } from "lucide-react"

export function Benefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Decorator Matrix Engine",
      description: "Instant pricing from blank + decoration + margin. Zero spreadsheets.",
      isLarge: true,
    },
    {
      icon: Trello,
      title: "Merch-Native Pipeline",
      description: "10-stage Kanban built for promo workflows. Not Monday.com in disguise.",
    },
    {
      icon: Link2,
      title: "White-Labeled Portals",
      description: "Shareable links your clients will actually use. No login required.",
      isVertical: true,
    },
    {
      icon: Building2,
      title: "Enterprise Programs",
      description: "Employee stores, uniform programs, budget management at scale.",
    },
    {
      icon: DollarSign,
      title: "Commission Tracking",
      description: "Gross, profit, splits, partner payouts. Know your numbers in real-time.",
    },
    {
      icon: RefreshCw,
      title: "Salesforce-Ready",
      description: "Mirrors Salesforce statuses 1:1. Works alongside your corporate CRM.",
    },
  ]

  return (
    <GlassBentoGrid
      title="Everything You Need to Run Your Merch Empire"
      subtitle="Built by operators, for operators. No fluff, no bloat."
      items={benefits}
    />
  )
}
