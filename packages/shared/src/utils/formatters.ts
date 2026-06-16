export const formatCurrency = (value: number, compact = false): string => {
  if (compact) {
    const abs = Math.abs(value);
    // Past $999,999.99 → roll up to millions / billions so big totals stay
    // readable (avoids "$5000.0k"). Under $1M keeps the thousands shorthand.
    // Thresholds sit just below each boundary so rounding never yields a stray
    // "$1000.0k" or "$1000.00M" — it rolls into the next unit instead.
    if (abs >= 999_999_500) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 999_950)     return `$${(value / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000)       return `$${(value / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyM = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `$${(value / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPct = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

export const formatHours = (value: number): string =>
  `${value.toLocaleString()} hrs`;

export const formatVariance = (value: number): string =>
  value > 0 ? `+${value}` : `${value}`;

export const formatNumber = (value: number): string =>
  value.toLocaleString('en-US');
