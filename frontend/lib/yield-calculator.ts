// ═══════════════════════════════════════════════════════════════════════════
// Yield Calculator Utility Module
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate simple interest yield
 * Formula: yield = principal * (rate / 365) * days
 * 
 * @param principal - Principal amount (must be > 0)
 * @param rate - Annual yield rate as decimal (e.g., 0.08 for 8%)
 * @param days - Time period in days (must be > 0)
 * @returns Calculated yield amount
 */
export function calculateSimpleYield(
  principal: number,
  rate: number,
  days: number
): number {
  // Input validation
  if (principal <= 0) {
    console.warn("Invalid principal amount, defaulting to 0");
    return 0;
  }
  if (rate < 0) {
    console.warn("Invalid rate, defaulting to 0");
    rate = 0;
  }
  if (days <= 0) {
    console.warn("Invalid time period, defaulting to 0");
    return 0;
  }

  // Simple interest calculation
  const yield_ = principal * (rate / 365) * days;

  // Handle NaN/Infinity
  if (!isFinite(yield_)) {
    console.error("Yield calculation resulted in non-finite value");
    return 0;
  }

  return yield_;
}

/**
 * Calculate percentage difference between two yield values
 * Formula: ((streaming - idle) / idle) * 100
 * 
 * @param idleYield - Yield from idle funds
 * @param streamingYield - Yield from streaming funds
 * @returns Percentage difference
 */
export function calculateYieldDifference(
  idleYield: number,
  streamingYield: number
): number {
  // Handle edge case: idle = 0
  if (idleYield === 0) {
    if (streamingYield === 0) {
      return 0;
    }
    return Infinity;
  }

  const difference = ((streamingYield - idleYield) / idleYield) * 100;

  // Handle NaN/Infinity
  if (!isFinite(difference)) {
    console.error("Yield difference calculation resulted in non-finite value");
    return 0;
  }

  return difference;
}

/**
 * Format currency amount with symbol
 * 
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: "XLM")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "XLM"): string {
  if (!isFinite(amount)) {
    return `0 ${currency}`;
  }

  // Format with 2 decimal places and thousands separator
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} ${currency}`;
}

/**
 * Format percentage value
 * 
 * @param value - Percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (!isFinite(value)) {
    return "0%";
  }

  return `${value.toFixed(decimals)}%`;
}
