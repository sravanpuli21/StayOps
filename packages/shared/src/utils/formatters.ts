export const formatCurrency = (value: number, compact = false): string => {
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
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
