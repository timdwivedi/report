/**
 * Quoting Engine - Core pricing calculations
 *
 * FORMULA:
 *   unit_cost = blank_cost(qty) + Σ decoration_cost(method, qty, colors) + Σ add_on_cost
 *   unit_price = unit_cost / (1 - margin_percent / 100)
 *   line_total = unit_price × total_quantity
 *   project_total = Σ line_totals
 */

import type { ProjectLineItem, LineItemDecoration, LineItemAddOn, ProductType, DecoratorMatrix, DecoratorTier, AllInPriceBreak } from '@/lib/types/app'
import { PRICE_CODE_DISCOUNTS } from '@/lib/constants/app'

// ===== BLANK COST LOOKUP =====

interface BlankCostTier {
  min: number
  max: number
  cost: number
}

// Default blank cost tiers (per product, overridden by product.blank_costs)
const DEFAULT_BLANK_TIERS: BlankCostTier[] = [
  { min: 1,    max: 23,   cost: 5.50 },
  { min: 24,   max: 35,   cost: 4.75 },
  { min: 36,   max: 49,   cost: 4.25 },
  { min: 50,   max: 99,   cost: 3.75 },
  { min: 100,  max: 199,  cost: 3.25 },
  { min: 200,  max: 499,  cost: 2.85 },
  { min: 500,  max: 999,  cost: 2.50 },
  { min: 1000, max: 9999, cost: 2.25 },
]

export function getBlankCost(quantity: number, tiers?: BlankCostTier[]): number {
  const lookup = tiers ?? DEFAULT_BLANK_TIERS
  const tier = lookup.find(t => quantity >= t.min && quantity <= t.max)
  return tier?.cost ?? lookup[lookup.length - 1].cost
}

// ===== DECORATION COST LOOKUP =====

interface DecorationPriceTier {
  min: number
  max: number
  pricesByColors: Record<number, number> // { 1: 2.50, 2: 3.65, 3: 4.80 }
}

// Default screen print pricing
const SCREEN_PRINT_TIERS: DecorationPriceTier[] = [
  { min: 24,   max: 35,   pricesByColors: { 1: 3.75, 2: 5.15, 3: 6.55, 4: 7.95, 5: 9.35, 6: 10.75 } },
  { min: 36,   max: 49,   pricesByColors: { 1: 3.50, 2: 4.80, 3: 6.10, 4: 7.40, 5: 8.70, 6: 10.00 } },
  { min: 50,   max: 99,   pricesByColors: { 1: 2.75, 2: 3.80, 3: 4.85, 4: 5.90, 5: 6.95, 6: 8.00 } },
  { min: 100,  max: 199,  pricesByColors: { 1: 2.25, 2: 3.10, 3: 3.95, 4: 4.80, 5: 5.65, 6: 6.50 } },
  { min: 200,  max: 499,  pricesByColors: { 1: 1.95, 2: 2.70, 3: 3.45, 4: 4.20, 5: 4.95, 6: 5.70 } },
  { min: 500,  max: 999,  pricesByColors: { 1: 1.50, 2: 2.10, 3: 2.70, 4: 3.30, 5: 3.90, 6: 4.50 } },
  { min: 1000, max: 9999, pricesByColors: { 1: 1.25, 2: 1.75, 3: 2.25, 4: 2.75, 5: 3.25, 6: 3.75 } },
]

const EMBROIDERY_TIERS: DecorationPriceTier[] = [
  { min: 24,   max: 35,   pricesByColors: { 1: 5.75, 2: 6.85, 3: 7.95, 4: 9.05 } },
  { min: 36,   max: 49,   pricesByColors: { 1: 5.50, 2: 6.50, 3: 7.50, 4: 8.50 } },
  { min: 50,   max: 99,   pricesByColors: { 1: 4.50, 2: 5.50, 3: 6.50, 4: 7.50 } },
  { min: 100,  max: 199,  pricesByColors: { 1: 3.75, 2: 4.50, 3: 5.25, 4: 6.00 } },
  { min: 200,  max: 499,  pricesByColors: { 1: 3.35, 2: 4.10, 3: 4.85, 4: 5.60 } },
  { min: 500,  max: 999,  pricesByColors: { 1: 2.75, 2: 3.45, 3: 4.15, 4: 4.85 } },
  { min: 1000, max: 9999, pricesByColors: { 1: 2.50, 2: 3.15, 3: 3.80, 4: 4.45 } },
]

const DTG_TIERS: DecorationPriceTier[] = [
  { min: 1,    max: 23,   pricesByColors: { 1: 12.00 } },
  { min: 24,   max: 35,   pricesByColors: { 1: 9.50 } },
  { min: 36,   max: 49,   pricesByColors: { 1: 9.00 } },
  { min: 50,   max: 99,   pricesByColors: { 1: 7.50 } },
  { min: 100,  max: 199,  pricesByColors: { 1: 6.00 } },
  { min: 200,  max: 499,  pricesByColors: { 1: 5.25 } },
  { min: 500,  max: 999,  pricesByColors: { 1: 4.75 } },
  { min: 1000, max: 9999, pricesByColors: { 1: 4.50 } },
]

const HEAT_TRANSFER_TIERS: DecorationPriceTier[] = [
  { min: 24,   max: 35,   pricesByColors: { 1: 4.25, 2: 5.35, 3: 6.45 } },
  { min: 36,   max: 49,   pricesByColors: { 1: 4.00, 2: 5.00, 3: 6.00 } },
  { min: 50,   max: 99,   pricesByColors: { 1: 3.25, 2: 4.00, 3: 4.75 } },
  { min: 100,  max: 199,  pricesByColors: { 1: 2.75, 2: 3.25, 3: 3.75 } },
  { min: 200,  max: 499,  pricesByColors: { 1: 2.35, 2: 2.85, 3: 3.35 } },
  { min: 500,  max: 999,  pricesByColors: { 1: 2.15, 2: 2.65, 3: 3.15 } },
  { min: 1000, max: 9999, pricesByColors: { 1: 2.00, 2: 2.50, 3: 3.00 } },
]

type DecorationMethod = 'screen-print' | 'embroidery' | 'dtg' | 'heat-transfer' | 'sublimation' | 'laser-engrave' | 'pad-print' | 'deboss' | 'other'

const DECORATION_TIER_MAP: Partial<Record<DecorationMethod, DecorationPriceTier[]>> = {
  'screen-print': SCREEN_PRINT_TIERS,
  'embroidery': EMBROIDERY_TIERS,
  'dtg': DTG_TIERS,
  'heat-transfer': HEAT_TRANSFER_TIERS,
}

export function getDecorationCost(
  method: DecorationMethod,
  quantity: number,
  colorCount: number
): number {
  const tiers = DECORATION_TIER_MAP[method]
  if (!tiers) return 3.00 // fallback for methods without pricing

  const tier = tiers.find(t => quantity >= t.min && quantity <= t.max)
  if (!tier) return 3.00

  // For DTG, color count doesn't matter (full color)
  if (method === 'dtg') return tier.pricesByColors[1] ?? 6.00

  // Find closest color count price
  const colors = Object.keys(tier.pricesByColors).map(Number).sort((a, b) => a - b)
  const closestColor = colors.find(c => c >= colorCount) ?? colors[colors.length - 1]
  return tier.pricesByColors[closestColor] ?? 3.00
}

// ===== LINE ITEM CALCULATION =====

export interface LineItemCalculation {
  blankCost: number
  decorationsCost: number
  runChargesCost: number           // Per-unit run charges (puff ink, printed tags, etc.)
  setupChargesTotal: number        // Fixed charges summed across all decoration locations
  addOnsCost: number
  vendorCost: number               // All-in products: vendor's per-unit cost
  unitCost: number
  unitPrice: number
  subtotal: number
  marginAmount: number
  productType: ProductType
}

/**
 * Contract product: blank_cost + decoration_costs + run_charges + add_ons + margin
 *                   + setup_charges (fixed, not per-unit — added to subtotal)
 * All-in product:   vendor_cost + add_ons + margin (no blank, no decorations)
 */
export function calculateLineItem(
  totalQuantity: number,
  marginPercent: number,
  productType: ProductType = 'contract',
  blankCostOverride?: number,
  decorations?: LineItemDecoration[],
  addOns?: LineItemAddOn[],
  vendorCost?: number
): LineItemCalculation {
  let blankCost = 0
  let decorationsCost = 0
  let runChargesCost = 0
  let setupChargesTotal = 0
  let vendorCostActual = 0

  if (productType === 'all-in') {
    // All-in: single vendor cost, no blank or decoration breakdown
    vendorCostActual = vendorCost ?? 0
  } else {
    // Contract: blank garment + decoration costs + charges
    blankCost = blankCostOverride ?? getBlankCost(totalQuantity)

    for (const dec of (decorations ?? [])) {
      decorationsCost += dec.decoration_cost

      // Run charges: per-unit surcharges (puff ink, specialty ink, printed tags)
      for (const rc of (dec.run_charges ?? [])) {
        runChargesCost += rc.cost_per_unit
      }

      // Setup charges: fixed fees (screen setup = $amount × colors if per_color)
      for (const sc of (dec.setup_charges ?? [])) {
        setupChargesTotal += sc.per_color ? sc.amount * dec.color_count : sc.amount
      }
    }
  }

  // Dual-level add-ons: product-level + location-level both contribute to per-unit cost
  // Backward compat: add-ons without a 'level' field are treated as product-level
  const productAddOnsCost = (addOns ?? [])
    .filter(a => !('level' in a) || a.level === 'product')
    .reduce((sum, a) => sum + a.cost_per_unit, 0)
  const locationAddOnsCost = (addOns ?? [])
    .filter(a => ('level' in a) && a.level === 'location')
    .reduce((sum, a) => sum + a.cost_per_unit, 0)
  const addOnsCost = productAddOnsCost + locationAddOnsCost

  // Per-unit cost (setup charges are NOT per-unit — they're added to subtotal)
  const unitCost = productType === 'all-in'
    ? vendorCostActual + addOnsCost
    : blankCost + decorationsCost + runChargesCost + addOnsCost
  const unitPrice = marginPercent >= 100 ? unitCost : unitCost / (1 - marginPercent / 100)
  const subtotal = (unitPrice * totalQuantity) + setupChargesTotal
  const marginAmount = (unitPrice - unitCost) * totalQuantity

  return {
    blankCost,
    decorationsCost,
    runChargesCost,
    setupChargesTotal,
    addOnsCost,
    vendorCost: vendorCostActual,
    unitCost,
    unitPrice: Math.round(unitPrice * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    marginAmount: Math.round(marginAmount * 100) / 100,
    productType,
  }
}

// ===== PROJECT TOTAL =====

export function calculateProjectTotal(lineItems: ProjectLineItem[]): {
  totalCost: number
  totalPrice: number
  totalMargin: number
  avgMarginPercent: number
} {
  let totalCost = 0
  let totalPrice = 0

  lineItems.forEach(item => {
    totalCost += item.unit_cost * item.total_quantity
    totalPrice += item.subtotal
  })

  const totalMargin = totalPrice - totalCost
  const avgMarginPercent = totalPrice > 0 ? (totalMargin / totalPrice) * 100 : 0

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalMargin: Math.round(totalMargin * 100) / 100,
    avgMarginPercent: Math.round(avgMarginPercent * 10) / 10,
  }
}

// ===== PRICE BREAK DISTRIBUTION ENGINE =====

/**
 * Given a secondary decoration matrix's native quantity breaks and prices,
 * interpolate costs at the primary matrix's break points using linear interpolation.
 *
 * Example: Primary breaks [24, 36, 50, 100], Secondary breaks [12, 24, 48, 72, 144]
 * → Returns interpolated secondary costs at [24, 36, 50, 100]
 *
 * If the primary break is below all secondary breaks, clamp to lowest secondary value.
 * If above all secondary breaks, clamp to highest secondary value.
 */
export function interpolateSecondaryBreaks(
  primaryBreaks: number[],
  secondaryTiers: DecoratorTier[],
  colorCount: number
): number[] {
  if (primaryBreaks.length === 0 || secondaryTiers.length === 0) return []

  // Sort secondary tiers by min_quantity ascending
  const sorted = [...secondaryTiers].sort((a, b) => a.min_quantity - b.min_quantity)

  // Helper: get the price for a tier at a given color count
  const getPriceAtTier = (tier: DecoratorTier): number => {
    const colors = Object.keys(tier.prices_by_colors).map(Number).sort((a, b) => a - b)
    if (colors.length === 0) return 0
    const closestColor = colors.find(c => c >= colorCount) ?? colors[colors.length - 1]
    return tier.prices_by_colors[closestColor] ?? 0
  }

  // Build a simple mapping of (quantity midpoint → price) for interpolation
  // Use min_quantity as the reference point for each tier
  const points: { qty: number; price: number }[] = sorted.map(tier => ({
    qty: tier.min_quantity,
    price: getPriceAtTier(tier),
  }))

  return primaryBreaks.map(breakQty => {
    // Below all secondary break points — clamp to lowest
    if (breakQty <= points[0].qty) {
      return points[0].price
    }

    // Above all secondary break points — clamp to highest
    if (breakQty >= points[points.length - 1].qty) {
      return points[points.length - 1].price
    }

    // Find the two bracketing points
    let lowIdx = 0
    for (let i = 0; i < points.length - 1; i++) {
      if (breakQty >= points[i].qty && breakQty <= points[i + 1].qty) {
        lowIdx = i
        break
      }
    }

    const low = points[lowIdx]
    const high = points[lowIdx + 1]

    // Avoid division by zero when both points have the same quantity
    if (high.qty === low.qty) return low.price

    // Linear interpolation
    const ratio = (breakQty - low.qty) / (high.qty - low.qty)
    return +(low.price + (high.price - low.price) * ratio).toFixed(4)
  })
}

/**
 * Given a line item with multiple decoration locations, each potentially
 * using a different decorator matrix:
 * 1. First decoration (index 0) = primary price breaks
 * 2. Secondary decorations interpolated at primary break points
 * 3. Returns unified cost breakdown
 */
export function distributeDecorationCosts(
  decorations: LineItemDecoration[],
  matrices: DecoratorMatrix[],
  totalQuantity: number
): {
  breakPoints: number[]
  costPerUnit: number[]
  breakdown: { locationLabel: string; costs: number[] }[]
} {
  const empty = { breakPoints: [], costPerUnit: [], breakdown: [] }
  if (decorations.length === 0 || matrices.length === 0) return empty

  // Find the primary decoration's matrix (first decoration)
  const primaryDec = decorations[0]
  const primaryMatrix = matrices.find(m => m.id === primaryDec.decorator_matrix_id)
  if (!primaryMatrix || primaryMatrix.pricing_tiers.length === 0) return empty

  // Extract primary break points (use min_quantity of each tier)
  const primaryTiers = [...primaryMatrix.pricing_tiers].sort(
    (a, b) => a.min_quantity - b.min_quantity
  )
  const breakPoints = primaryTiers.map(t => t.min_quantity)

  // Get primary decoration costs at each break point
  const primaryCosts = breakPoints.map(qty => {
    const tier = primaryTiers.find(t => qty >= t.min_quantity && qty <= t.max_quantity)
    if (!tier) {
      // Clamp: below min → first tier, above max → last tier
      if (qty < primaryTiers[0].min_quantity) {
        return getColorPrice(primaryTiers[0], primaryDec.color_count)
      }
      return getColorPrice(primaryTiers[primaryTiers.length - 1], primaryDec.color_count)
    }
    return getColorPrice(tier, primaryDec.color_count)
  })

  const breakdown: { locationLabel: string; costs: number[] }[] = [
    { locationLabel: primaryDec.position_label || primaryDec.position, costs: primaryCosts },
  ]

  // Process secondary decorations
  for (let i = 1; i < decorations.length; i++) {
    const dec = decorations[i]
    const matrix = matrices.find(m => m.id === dec.decorator_matrix_id)

    let costs: number[]
    if (matrix && matrix.pricing_tiers.length > 0) {
      costs = interpolateSecondaryBreaks(breakPoints, matrix.pricing_tiers, dec.color_count)
    } else {
      // No matrix found — use the stored decoration_cost as flat rate
      costs = breakPoints.map(() => dec.decoration_cost)
    }

    breakdown.push({
      locationLabel: dec.position_label || dec.position,
      costs,
    })
  }

  // Sum costs across all decorations for each break point
  const costPerUnit = breakPoints.map((_, idx) =>
    +breakdown.reduce((sum, loc) => sum + (loc.costs[idx] ?? 0), 0).toFixed(4)
  )

  return { breakPoints, costPerUnit, breakdown }
}

/** Helper: extract price for a color count from a DecoratorTier */
function getColorPrice(tier: DecoratorTier, colorCount: number): number {
  const colors = Object.keys(tier.prices_by_colors).map(Number).sort((a, b) => a - b)
  if (colors.length === 0) return 0
  const closestColor = colors.find(c => c >= colorCount) ?? colors[colors.length - 1]
  return tier.prices_by_colors[closestColor] ?? 0
}

// ===== PRICE CODE CALCULATIONS =====

/**
 * Calculate the net (wholesale) cost from a list price and price code.
 * ASI/PPAI standard: each letter = discount percentage.
 */
export function calculateNetCostFromPriceCode(listPrice: number, priceCode: string): number {
  const discount = PRICE_CODE_DISCOUNTS[priceCode] ?? 0
  return +(listPrice * (1 - discount)).toFixed(4)
}

// ===== ALL-IN PRODUCT PRICING =====

/**
 * Calculate pricing for an all-in product using its price break tiers.
 * Finds the applicable tier based on quantity, applies price code to get net cost.
 */
export function calculateAllInLineItem(
  priceBreaks: AllInPriceBreak[],
  quantity: number,
  setupCostPerColor?: number,
  setupSalePerColor?: number,
  colorCount?: number
): {
  tierIndex: number
  listPricePerUnit: number
  netCostPerUnit: number
  priceCode: string
  setupCost: number
  setupSale: number
  totalCost: number
  totalSale: number
  marginPercent: number
} {
  const defaultResult = {
    tierIndex: -1,
    listPricePerUnit: 0,
    netCostPerUnit: 0,
    priceCode: '',
    setupCost: 0,
    setupSale: 0,
    totalCost: 0,
    totalSale: 0,
    marginPercent: 0,
  }

  if (priceBreaks.length === 0 || quantity <= 0) return defaultResult

  // Sort by min_quantity ascending
  const sorted = [...priceBreaks].sort((a, b) => a.min_quantity - b.min_quantity)

  // Find the tier where min_quantity <= quantity <= max_quantity
  let tierIndex = sorted.findIndex(
    t => quantity >= t.min_quantity && quantity <= t.max_quantity
  )

  // If quantity is above all tiers, use the highest tier
  if (tierIndex === -1) {
    if (quantity > sorted[sorted.length - 1].max_quantity) {
      tierIndex = sorted.length - 1
    } else if (quantity < sorted[0].min_quantity) {
      // Below all tiers — use the lowest
      tierIndex = 0
    } else {
      // Gap between tiers — shouldn't happen, but use closest lower tier
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (quantity >= sorted[i].min_quantity) {
          tierIndex = i
          break
        }
      }
      if (tierIndex === -1) tierIndex = 0
    }
  }

  const tier = sorted[tierIndex]
  const listPricePerUnit = tier.list_price
  const netCostPerUnit = tier.net_cost
  const priceCode = tier.price_code

  const effectiveColorCount = colorCount ?? 1
  const setupCost = (setupCostPerColor ?? 0) * effectiveColorCount
  const setupSale = (setupSalePerColor ?? 0) * effectiveColorCount

  const totalCost = +(netCostPerUnit * quantity + setupCost).toFixed(2)
  const totalSale = +(listPricePerUnit * quantity + setupSale).toFixed(2)
  const marginPercent = totalSale > 0
    ? +((totalSale - totalCost) / totalSale * 100).toFixed(2)
    : 0

  return {
    tierIndex,
    listPricePerUnit,
    netCostPerUnit,
    priceCode,
    setupCost,
    setupSale,
    totalCost,
    totalSale,
    marginPercent,
  }
}
