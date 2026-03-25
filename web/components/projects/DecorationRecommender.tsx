"use client"

import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

interface DecorationRecommenderProps {
  quantity: number
  category: string
  productType: string
}

interface Recommendation {
  method: string
  reason: string
}

function getRecommendation(
  quantity: number,
  category: string,
  productType: string
): Recommendation | null {
  // All-in products are vendor-decorated — no recommendation needed
  if (productType === 'all-in') return null

  const cat = category.toLowerCase()

  // Category-specific recommendations
  if (cat.includes('polos') || cat.includes('hats-caps')) {
    return { method: 'Embroidery', reason: 'industry standard for polos and caps' }
  }
  if (cat.includes('drinkware')) {
    return { method: 'Laser Engrave', reason: 'permanent mark, dishwasher safe' }
  }

  // Quantity-based recommendations
  if (quantity < 24) {
    return { method: 'DTG', reason: 'best for short runs under 24 units' }
  }
  if (quantity >= 24 && quantity <= 144) {
    return { method: 'Screen Print', reason: 'best value at this quantity range' }
  }
  if (quantity > 144) {
    return { method: 'Screen Print', reason: 'lowest per-unit cost at scale' }
  }

  return { method: 'Screen Print', reason: 'best all-round decoration method' }
}

export default function DecorationRecommender({
  quantity,
  category,
  productType,
}: DecorationRecommenderProps) {
  const recommendation = getRecommendation(quantity, category, productType)

  if (!recommendation) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm"
    >
      <Sparkles className="h-4 w-4 text-violet-500 flex-shrink-0" />
      <div>
        <span className="font-semibold text-violet-700">Recommended: {recommendation.method}</span>
        <span className="text-violet-600 ml-1">&mdash; {recommendation.reason}</span>
      </div>
    </motion.div>
  )
}
