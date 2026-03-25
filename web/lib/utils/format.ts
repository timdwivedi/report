/**
 * Format a number as USD currency with commas and 2 decimal places.
 * e.g. 1234.5 → "$1,234.50", 7 → "$7.00", 3.5 → "$3.50"
 */
export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number with commas (no currency symbol).
 * e.g. 1234.5 → "1,234.50", 7 → "7.00"
 */
export function fmtNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
