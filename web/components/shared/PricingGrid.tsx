"use client"

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type {
  ProductType,
  DecorationMethod,
  BlankCost,
  LineItemAddOn,
  RunCharge,
  AllInPriceBreak,
} from '@/lib/types/app'
import { getBlankCost, getDecorationCost } from '@/lib/utils/quoting'
import { PRICE_CODE_DISCOUNTS } from '@/lib/constants/app'

// ===== TYPES =====

interface BlankCostTier {
  min: number
  max: number
  cost: number
}

interface QuantityBreak {
  label: string
  min: number
  max: number
  midpoint: number
}

interface PricingGridProps {
  productType: ProductType
  blankCosts?: BlankCost[]
  decorationMethod?: DecorationMethod
  colorCount?: number
  marginPercent: number
  marginSafetyPercent?: number       // Minimum acceptable margin — shows warning below this
  onMarginChange?: (margin: number) => void
  addOns?: LineItemAddOn[]
  runCharges?: RunCharge[]
  currentQuantity?: number
  allInPriceBreaks?: AllInPriceBreak[]
  className?: string
}

// ===== QUANTITY BREAK DEFINITIONS =====

// 7 quantity break columns matching Trevor's Lovable app (Call 4 screenshots)
const DEFAULT_QUANTITY_BREAKS: QuantityBreak[] = [
  { label: '24-35',    min: 24,   max: 35,   midpoint: 30 },
  { label: '36-49',    min: 36,   max: 49,   midpoint: 42 },
  { label: '50-99',    min: 50,   max: 99,   midpoint: 72 },
  { label: '100-199',  min: 100,  max: 199,  midpoint: 150 },
  { label: '200-499',  min: 200,  max: 499,  midpoint: 350 },
  { label: '500-999',  min: 500,  max: 999,  midpoint: 750 },
  { label: '1000+',    min: 1000, max: 9999, midpoint: 1500 },
]

// ===== HELPERS =====

function mapBlankCostsToTiers(blankCosts?: BlankCost[]): BlankCostTier[] | undefined {
  if (!blankCosts || blankCosts.length === 0) return undefined
  return blankCosts.map(bc => ({
    min: bc.min_quantity,
    max: bc.max_quantity,
    cost: bc.cost_per_unit,
  }))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatCurrency(Math.abs(value))}`
}

function isQuantityInBreak(quantity: number, breakRange: QuantityBreak): boolean {
  return quantity >= breakRange.min && quantity <= breakRange.max
}

// ===== COMPONENT =====

export default function PricingGrid({
  productType,
  blankCosts,
  decorationMethod = 'screen-print',
  colorCount = 1,
  marginPercent,
  marginSafetyPercent = 25,
  onMarginChange,
  addOns,
  runCharges,
  currentQuantity,
  allInPriceBreaks,
  className = '',
}: PricingGridProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [columnMargins, setColumnMargins] = useState<Record<number, number>>({})

  const blankCostTiers = useMemo(() => mapBlankCostsToTiers(blankCosts), [blankCosts])

  // Compute per-unit add-on cost
  const addOnsCostPerUnit = useMemo(
    () => (addOns ?? []).reduce((sum, a) => sum + a.cost_per_unit, 0),
    [addOns]
  )

  // Compute per-unit run charges cost
  const runChargesCostPerUnit = useMemo(
    () => (runCharges ?? []).reduce((sum, rc) => sum + rc.cost_per_unit, 0),
    [runCharges]
  )

  // Compute row data for each quantity break
  const gridData = useMemo(() => {
    return DEFAULT_QUANTITY_BREAKS.map((qb, colIndex) => {
      const effectiveMargin = columnMargins[colIndex] ?? marginPercent

      if (productType === 'all-in') {
        // All-in products don't have blank/deco breakdown in the grid
        // Show vendor cost as the unit cost
        const vendorCost = blankCosts?.[0]?.cost_per_unit ?? 0
        const unitCost = vendorCost + addOnsCostPerUnit
        const unitPrice = effectiveMargin >= 100
          ? unitCost
          : unitCost / (1 - effectiveMargin / 100)
        const profit = unitPrice - unitCost

        return {
          break: qb,
          blankCost: vendorCost,
          decoCost: 0,
          runChargesCost: 0,
          addOnsCost: addOnsCostPerUnit,
          unitCost,
          margin: effectiveMargin,
          unitPrice: Math.round(unitPrice * 100) / 100,
          profit: Math.round(profit * 100) / 100,
        }
      }

      // Contract product
      const blankCost = getBlankCost(qb.midpoint, blankCostTiers)
      const decoCost = getDecorationCost(decorationMethod, qb.midpoint, colorCount)
      const unitCost = blankCost + decoCost + runChargesCostPerUnit + addOnsCostPerUnit
      const unitPrice = effectiveMargin >= 100
        ? unitCost
        : unitCost / (1 - effectiveMargin / 100)
      const profit = unitPrice - unitCost

      return {
        break: qb,
        blankCost,
        decoCost,
        runChargesCost: runChargesCostPerUnit,
        addOnsCost: addOnsCostPerUnit,
        unitCost,
        margin: effectiveMargin,
        unitPrice: Math.round(unitPrice * 100) / 100,
        profit: Math.round(profit * 100) / 100,
      }
    })
  }, [
    productType,
    blankCostTiers,
    blankCosts,
    decorationMethod,
    colorCount,
    marginPercent,
    columnMargins,
    addOnsCostPerUnit,
    runChargesCostPerUnit,
  ])

  // All-in price break grid data (when allInPriceBreaks is provided)
  const allInGridData = useMemo(() => {
    if (!allInPriceBreaks || allInPriceBreaks.length === 0) return null
    const sorted = [...allInPriceBreaks].sort((a, b) => a.min_quantity - b.min_quantity)
    return sorted.map((brk, colIndex) => {
      const effectiveMargin = columnMargins[colIndex] ?? marginPercent
      const netCost = brk.net_cost
      const salePrice = effectiveMargin >= 100
        ? netCost
        : netCost / (1 - effectiveMargin / 100)
      const profit = salePrice - netCost
      return {
        break: {
          label: brk.max_quantity >= 9999
            ? `${brk.min_quantity}+`
            : `${brk.min_quantity}-${brk.max_quantity}`,
          min: brk.min_quantity,
          max: brk.max_quantity,
          midpoint: Math.round((brk.min_quantity + brk.max_quantity) / 2),
        } as QuantityBreak,
        listPrice: brk.list_price,
        priceCode: brk.price_code,
        netCost,
        margin: effectiveMargin,
        salePrice: Math.round(salePrice * 100) / 100,
        profit: Math.round(profit * 100) / 100,
      }
    })
  }, [allInPriceBreaks, marginPercent, columnMargins])

  const useAllInMode = productType === 'all-in' && allInGridData !== null

  // Margin safety warnings
  const marginWarnings = useMemo(() => {
    if (useAllInMode) {
      return (allInGridData ?? [])
        .map((col, i) => ({
          index: i,
          label: col.break.label,
          margin: col.margin,
          unitCost: col.netCost,
          suggestedPrice: col.netCost / (1 - marginSafetyPercent / 100),
          isBelowSafety: col.margin < marginSafetyPercent,
        }))
        .filter(w => w.isBelowSafety)
    }
    return gridData
      .map((col, i) => ({
        index: i,
        label: col.break.label,
        margin: col.margin,
        unitCost: col.unitCost,
        suggestedPrice: col.unitCost / (1 - marginSafetyPercent / 100),
        isBelowSafety: col.margin < marginSafetyPercent,
      }))
      .filter(w => w.isBelowSafety)
  }, [useAllInMode, allInGridData, gridData, marginSafetyPercent])

  // Set of column indices below safety for fast lookup
  const unsafeColumns = useMemo(
    () => new Set(marginWarnings.map(w => w.index)),
    [marginWarnings]
  )

  // Handle global margin change
  function handleGlobalMarginChange(value: number) {
    setColumnMargins({}) // clear per-column overrides
    onMarginChange?.(value)
  }

  // Handle per-column margin change
  function handleColumnMarginChange(colIndex: number, value: number) {
    setColumnMargins(prev => ({ ...prev, [colIndex]: value }))
  }

  // Check if a column is the "active" one matching currentQuantity
  function isActiveColumn(qb: QuantityBreak): boolean {
    if (!currentQuantity) return false
    return isQuantityInBreak(currentQuantity, qb)
  }

  // Row definitions for contract products
  const showRunCharges = runChargesCostPerUnit > 0
  const showAddOns = addOnsCostPerUnit > 0

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Pricing Grid</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Margin:</label>
            <div className="flex items-center">
              <input
                type="number" onFocus={(e) => e.target.select()}
                min={0}
                max={99}
                value={marginPercent}
                onChange={(e) => handleGlobalMarginChange(Number(e.target.value))}
                className="w-14 h-7 px-2 text-sm font-mono text-center border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="ml-1 text-xs text-slate-500">%</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <>
              Show Grid
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Hide Grid
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Margin Safety Warning Banner */}
      {!isCollapsed && marginWarnings.length > 0 && (
        <div className="mx-4 mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700">
              Margin below {marginSafetyPercent}% safety threshold
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">
              {marginWarnings.length === 1
                ? `Column ${marginWarnings[0].label} is at ${marginWarnings[0].margin}%.`
                : `${marginWarnings.length} columns below threshold: ${marginWarnings.map(w => `${w.label} (${w.margin}%)`).join(', ')}.`
              }
              {' '}Recommend: raise to {marginSafetyPercent}% (min sale ${formatCurrency(marginWarnings[0].suggestedPrice)}/unit at {marginWarnings[0].label} qty).
            </p>
          </div>
        </div>
      )}

      {/* Grid Table — All-In Price Break Mode */}
      {!isCollapsed && useAllInMode && allInGridData && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-24 sticky left-0 bg-slate-50 z-10">
                  &nbsp;
                </th>
                {allInGridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <th
                      key={col.break.label}
                      className={`text-center text-xs font-semibold px-3 py-2.5 min-w-[90px] ${
                        active
                          ? 'text-primary-700 bg-primary-50 border-l-2 border-primary-500'
                          : 'text-slate-600'
                      }`}
                    >
                      {col.break.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {/* List Price Row */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-white z-10">
                  List $
                </td>
                {allInGridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs px-3 py-2 ${
                        active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                      }`}
                    >
                      {formatCurrency(col.listPrice)}
                    </td>
                  )
                })}
              </tr>

              {/* Price Code Row */}
              <tr className="border-t border-slate-50 bg-slate-50/30">
                <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-slate-50/30 z-10">
                  Code
                </td>
                {allInGridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center px-3 py-2 ${
                        active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                      }`}
                    >
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-xs font-bold">
                        {col.priceCode}
                      </span>
                    </td>
                  )
                })}
              </tr>

              {/* Net Cost Row (bold, darker background) */}
              <tr className="border-t border-slate-200 bg-slate-100/60">
                <td className="text-xs font-bold text-slate-700 px-4 py-2.5 sticky left-0 bg-slate-100/60 z-10">
                  Net Cost
                </td>
                {allInGridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-bold px-3 py-2.5 ${
                        active
                          ? 'bg-primary-100/60 border-l-2 border-primary-500 text-primary-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(col.netCost)}
                    </td>
                  )
                })}
              </tr>

              {/* Margin Row (editable per-column) */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-white z-10">
                  Margin
                </td>
                {allInGridData.map((col, i) => {
                  const active = isActiveColumn(col.break)
                  const unsafe = unsafeColumns.has(i)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center px-3 py-1.5 ${
                        unsafe
                          ? 'bg-red-50 border-l-2 border-red-400'
                          : active
                            ? 'bg-primary-50/50 border-l-2 border-primary-500'
                            : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <input
                          type="number" onFocus={(e) => e.target.select()}
                          min={0}
                          max={99}
                          value={col.margin}
                          onChange={(e) => handleColumnMarginChange(i, Number(e.target.value))}
                          className={`w-11 h-6 px-1 text-xs font-mono text-center border rounded focus:outline-none focus:ring-1 ${
                            unsafe
                              ? 'border-red-300 text-red-700 focus:ring-red-400 focus:border-red-400'
                              : 'border-slate-200 focus:ring-primary-400 focus:border-primary-400'
                          }`}
                        />
                        <span className={`text-[10px] ${unsafe ? 'text-red-400' : 'text-slate-400'}`}>%</span>
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Sale Price Row (bold, primary color) */}
              <tr className="border-t border-slate-200 bg-primary-50/30">
                <td className="text-xs font-bold text-primary-700 px-4 py-2.5 sticky left-0 bg-primary-50/30 z-10">
                  Sale $
                </td>
                {allInGridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-bold px-3 py-2.5 ${
                        active
                          ? 'bg-primary-100/70 border-l-2 border-primary-500 text-primary-900'
                          : 'text-primary-700'
                      }`}
                    >
                      {formatCurrency(col.salePrice)}
                    </td>
                  )
                })}
              </tr>

              {/* Profit Row (green text, red when below safety) */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-semibold text-emerald-700 px-4 py-2.5 sticky left-0 bg-white z-10">
                  Profit
                </td>
                {allInGridData.map((col, i) => {
                  const active = isActiveColumn(col.break)
                  const unsafe = unsafeColumns.has(i)
                  const isPositive = col.profit >= 0
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-semibold px-3 py-2.5 ${
                        unsafe
                          ? 'bg-red-50/50 border-l-2 border-red-400 text-red-600'
                          : active
                            ? 'bg-primary-50/50 border-l-2 border-primary-500'
                            : ''
                      } ${!unsafe && (isPositive ? 'text-emerald-600' : 'text-red-500')}`}
                    >
                      {formatProfit(col.profit)}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Grid Table — Default Mode (Contract / All-In without price breaks) */}
      {!isCollapsed && !useAllInMode && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-24 sticky left-0 bg-slate-50 z-10">
                  &nbsp;
                </th>
                {gridData.map((col, i) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <th
                      key={col.break.label}
                      className={`text-center text-xs font-semibold px-3 py-2.5 min-w-[80px] ${
                        active
                          ? 'text-primary-700 bg-primary-50 border-l-2 border-primary-500'
                          : 'text-slate-600'
                      }`}
                    >
                      {col.break.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {/* Blank Cost Row */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-white z-10">
                  {productType === 'all-in' ? 'Vendor' : 'Blank'}
                </td>
                {gridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs px-3 py-2 ${
                        active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                      }`}
                    >
                      {formatCurrency(col.blankCost)}
                    </td>
                  )
                })}
              </tr>

              {/* Deco Cost Row (contract only) */}
              {productType === 'contract' && (
                <tr className="border-t border-slate-50 bg-slate-50/30">
                  <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-slate-50/30 z-10">
                    Deco
                  </td>
                  {gridData.map((col) => {
                    const active = isActiveColumn(col.break)
                    return (
                      <td
                        key={col.break.label}
                        className={`text-center font-mono text-xs px-3 py-2 ${
                          active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                        }`}
                      >
                        {formatCurrency(col.decoCost)}
                      </td>
                    )
                  })}
                </tr>
              )}

              {/* Run Charges Row (if any) */}
              {showRunCharges && (
                <tr className="border-t border-slate-50">
                  <td className="text-xs font-medium text-slate-500 px-4 py-2 sticky left-0 bg-white z-10">
                    Run Chg
                  </td>
                  {gridData.map((col) => {
                    const active = isActiveColumn(col.break)
                    return (
                      <td
                        key={col.break.label}
                        className={`text-center font-mono text-xs text-slate-500 px-3 py-2 ${
                          active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                        }`}
                      >
                        {formatCurrency(col.runChargesCost)}
                      </td>
                    )
                  })}
                </tr>
              )}

              {/* Add-Ons Row (if any) */}
              {showAddOns && (
                <tr className="border-t border-slate-50 bg-slate-50/30">
                  <td className="text-xs font-medium text-slate-500 px-4 py-2 sticky left-0 bg-slate-50/30 z-10">
                    Add-Ons
                  </td>
                  {gridData.map((col) => {
                    const active = isActiveColumn(col.break)
                    return (
                      <td
                        key={col.break.label}
                        className={`text-center font-mono text-xs text-slate-500 px-3 py-2 ${
                          active ? 'bg-primary-50/50 border-l-2 border-primary-500' : ''
                        }`}
                      >
                        {formatCurrency(col.addOnsCost)}
                      </td>
                    )
                  })}
                </tr>
              )}

              {/* Unit Cost Row (bold, darker background) */}
              <tr className="border-t border-slate-200 bg-slate-100/60">
                <td className="text-xs font-bold text-slate-700 px-4 py-2.5 sticky left-0 bg-slate-100/60 z-10">
                  Cost
                </td>
                {gridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-bold px-3 py-2.5 ${
                        active
                          ? 'bg-primary-100/60 border-l-2 border-primary-500 text-primary-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(col.unitCost)}
                    </td>
                  )
                })}
              </tr>

              {/* Margin Row (editable per-column) */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-medium text-slate-600 px-4 py-2 sticky left-0 bg-white z-10">
                  Margin
                </td>
                {gridData.map((col, i) => {
                  const active = isActiveColumn(col.break)
                  const unsafe = unsafeColumns.has(i)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center px-3 py-1.5 ${
                        unsafe
                          ? 'bg-red-50 border-l-2 border-red-400'
                          : active
                            ? 'bg-primary-50/50 border-l-2 border-primary-500'
                            : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <input
                          type="number" onFocus={(e) => e.target.select()}
                          min={0}
                          max={99}
                          value={col.margin}
                          onChange={(e) => handleColumnMarginChange(i, Number(e.target.value))}
                          className={`w-11 h-6 px-1 text-xs font-mono text-center border rounded focus:outline-none focus:ring-1 ${
                            unsafe
                              ? 'border-red-300 text-red-700 focus:ring-red-400 focus:border-red-400'
                              : 'border-slate-200 focus:ring-primary-400 focus:border-primary-400'
                          }`}
                        />
                        <span className={`text-[10px] ${unsafe ? 'text-red-400' : 'text-slate-400'}`}>%</span>
                      </div>
                    </td>
                  )
                })}
              </tr>

              {/* Sale Price Row (bold, primary color) */}
              <tr className="border-t border-slate-200 bg-primary-50/30">
                <td className="text-xs font-bold text-primary-700 px-4 py-2.5 sticky left-0 bg-primary-50/30 z-10">
                  Sale $
                </td>
                {gridData.map((col) => {
                  const active = isActiveColumn(col.break)
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-bold px-3 py-2.5 ${
                        active
                          ? 'bg-primary-100/70 border-l-2 border-primary-500 text-primary-900'
                          : 'text-primary-700'
                      }`}
                    >
                      {formatCurrency(col.unitPrice)}
                    </td>
                  )
                })}
              </tr>

              {/* Profit Row (green text, red when below safety) */}
              <tr className="border-t border-slate-100">
                <td className="text-xs font-semibold text-emerald-700 px-4 py-2.5 sticky left-0 bg-white z-10">
                  Profit
                </td>
                {gridData.map((col, i) => {
                  const active = isActiveColumn(col.break)
                  const unsafe = unsafeColumns.has(i)
                  const isPositive = col.profit >= 0
                  return (
                    <td
                      key={col.break.label}
                      className={`text-center font-mono text-xs font-semibold px-3 py-2.5 ${
                        unsafe
                          ? 'bg-red-50/50 border-l-2 border-red-400 text-red-600'
                          : active
                            ? 'bg-primary-50/50 border-l-2 border-primary-500'
                            : ''
                      } ${!unsafe && (isPositive ? 'text-emerald-600' : 'text-red-500')}`}
                    >
                      {formatProfit(col.profit)}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
