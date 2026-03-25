"use client"

import { TrendingUp, TrendingDown } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number | ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
  prefix?: string
  suffix?: string
  animated?: boolean
}

export default function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  prefix = '',
  suffix = '',
  animated = true,
}: StatCardProps) {
  // Parse numeric value if it's a string with commas
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/,/g, '').replace(/[^0-9.-]/g, ''))
    : typeof value === 'number'
    ? value
    : NaN

  const isNumeric = !isNaN(numericValue)
  const isReactNode = typeof value !== 'string' && typeof value !== 'number'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-mono font-bold text-slate-900">
              {isReactNode ? (
                value
              ) : animated && isNumeric ? (
                <>
                  {prefix}
                  <AnimatedCounter value={numericValue} duration={2} />
                  {suffix}
                </>
              ) : (
                `${prefix}${value}${suffix}`
              )}
            </div>
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-slate-600'
              }`}>
                {changeType === 'positive' && <TrendingUp className="h-4 w-4" />}
                {changeType === 'negative' && <TrendingDown className="h-4 w-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-2xl">{icon}</div>
        )}
      </div>
    </div>
  )
}
