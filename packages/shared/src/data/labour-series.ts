import type { LabourMetrics } from '../types/metrics';
import { LABOUR_DATA } from './labour';

/**
 * Deterministic bi-weekly labour series per hotel — 6 pay periods back
 * from the frozen-today window. Source of truth for date-ranged labour
 * aggregation. Per-period values jitter ±6% around the LABOUR_DATA
 * baseline so historical windows show realistic movement.
 *
 * Period end-dates align with actual Sunday pay-period ends.
 */

export const PAY_PERIOD_DAYS = 14;
export const PAY_PERIOD_COUNT = 6;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seededJitter(seed: string, spread: number): number {
  return 1 + ((hash(seed) % 1000) / 1000 - 0.5) * 2 * spread;
}
function isoAddDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Most recent pay-period end is 2026-05-10 (Sunday before the 2026-05-12 today).
export const LATEST_PERIOD_END = '2026-05-10';

export interface LabourPeriod {
  hotelId: string;
  /** Inclusive ISO date — first day of the period */
  from: string;
  /** Inclusive ISO date — last day of the period */
  to: string;
  metrics: LabourMetrics;
}

function generate(): LabourPeriod[] {
  const out: LabourPeriod[] = [];

  for (let p = 0; p < PAY_PERIOD_COUNT; p++) {
    const endDate = isoAddDays(LATEST_PERIOD_END, -p * PAY_PERIOD_DAYS);
    const startDate = isoAddDays(endDate, -(PAY_PERIOD_DAYS - 1));

    for (const base of LABOUR_DATA) {
      const jitter = seededJitter(`${base.hotelId}-${endDate}`, 0.06);
      const scale = (n: number) => Math.round(n * jitter);

      const scheduledHours = scale(base.scheduledHours);
      const clockedHours   = scale(base.clockedHours);
      const variance       = clockedHours - scheduledHours;
      const overtimeHours  = scale(base.overtimeHours);
      const payrollCost    = Math.round(base.payrollCost * jitter);

      const departments = base.departments.map((d) => {
        const dJit = seededJitter(`${base.hotelId}-${endDate}-${d.department}`, 0.06);
        const ds = Math.round(d.scheduledHours * dJit);
        const dc = Math.round(d.clockedHours   * dJit);
        return {
          ...d,
          scheduledHours: ds,
          clockedHours:   dc,
          variance:       dc - ds,
          overtimeHours:  Math.round(d.overtimeHours * dJit),
          payrollCost:    Math.round(d.payrollCost   * dJit),
        };
      });

      out.push({
        hotelId: base.hotelId,
        from: startDate,
        to: endDate,
        metrics: {
          hotelId: base.hotelId,
          scheduledHours,
          clockedHours,
          variance,
          overtimeHours,
          payrollCost,
          departments,
          health: base.health,  // will be recomputed server-side after aggregation
        },
      });
    }
  }

  return out;
}

export const LABOUR_PERIOD_SERIES: LabourPeriod[] = generate();
