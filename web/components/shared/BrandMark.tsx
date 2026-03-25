"use client"

interface BrandMarkProps {
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

/**
 * BrandMark — SVG logo mark for BrandOps.
 * Two overlapping rounded squares suggesting stacked packages/operations.
 * Use instead of plain initials in a colored square.
 */
export function BrandMark({ size = 32, className = '', showText = false, textClassName = '' }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="32" height="32" rx="8" fill="url(#brand-grad)" />
        {/* Front package — solid white */}
        <rect x="6" y="6" width="13" height="13" rx="3" fill="white" fillOpacity="0.95" />
        {/* Back package — semi-transparent, offset */}
        <rect x="13" y="13" width="13" height="13" rx="3" fill="white" fillOpacity="0.55" />
      </svg>
      {showText && (
        <span className={textClassName || 'text-lg font-bold text-slate-900'}>
          BrandOps
        </span>
      )}
    </div>
  )
}
