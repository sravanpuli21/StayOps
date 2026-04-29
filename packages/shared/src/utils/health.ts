import type { HealthStatus } from '../types/hotel';

export const deriveLabourHealth = (
  variance: number,
  overtimeHours: number,
): HealthStatus => {
  if (variance > 30 || overtimeHours > 18) return 'red';
  if (variance > 15 || overtimeHours > 8) return 'amber';
  return 'green';
};

export const deriveOccupancyHealth = (occupancyPct: number): HealthStatus => {
  if (occupancyPct < 75) return 'red';
  if (occupancyPct < 83) return 'amber';
  return 'green';
};
