import Stripe from 'stripe'

// Demo mode: use placeholder when env var is not set
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Map Stripe price IDs to subscription tiers
// Update these with real price IDs when connecting Stripe
const PRICE_TIER_MAP: Record<string, string> = {
  // price_xxx: 'pro',
  // price_yyy: 'enterprise',
}

export function getTierFromPriceId(priceId: string): string {
  return PRICE_TIER_MAP[priceId] || 'pro'
}
