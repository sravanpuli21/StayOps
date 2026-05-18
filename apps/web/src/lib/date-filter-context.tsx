'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type DateRange =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'pay-period'
  | 'ytd'
  | 'custom';

interface DateFilterCtx {
  range: DateRange;
  setRange: (r: DateRange) => void;
  /** ISO yyyy-mm-dd. Only used when range === 'custom'. */
  customFrom: string;
  customTo: string;
  setCustomRange: (from: string, to: string) => void;
}

const DateFilterContext = createContext<DateFilterCtx | null>(null);

/** Default custom range — anchor to the frozen "today" if present, else live now. */
function defaultCustom(): { from: string; to: string } {
  const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
  const base = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
  // Default custom = yesterday for both from + to
  base.setUTCDate(base.getUTCDate() - 1);
  const iso = base.toISOString().slice(0, 10);
  return { from: iso, to: iso };
}

export function DateFilterProvider({
  initial = 'yesterday',
  children,
}: {
  initial?: DateRange;
  children: ReactNode;
}) {
  const [range, setRange] = useState<DateRange>(initial);
  const initialCustom = useMemo(defaultCustom, []);
  const [customFrom, setCustomFrom] = useState<string>(initialCustom.from);
  const [customTo,   setCustomTo  ] = useState<string>(initialCustom.to);
  const setCustomRange = (from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
  };
  return (
    <DateFilterContext.Provider value={{ range, setRange, customFrom, customTo, setCustomRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter(): DateFilterCtx {
  const ctx = useContext(DateFilterContext);
  if (!ctx) {
    const c = defaultCustom();
    return { range: 'yesterday', setRange: () => {}, customFrom: c.from, customTo: c.to, setCustomRange: () => {} };
  }
  return ctx;
}

// Underlying data snapshots represent "yesterday" (one day).
// Multipliers scale accumulated metrics (revenue, rooms-sold, hours). Ratios
// (occupancy %, avg rating) stay stable across periods.
// Baseline date = 2026-05-04 (Mon). Ranges are relative to that.
export const DATE_RANGE_META: Record<
  DateRange,
  { label: string; short: string; multiplier: number; days: number }
> = {
  today:        { label: 'Today',         short: 'today',      multiplier: 0.55, days: 1 },
  yesterday:    { label: 'Yesterday',     short: 'yesterday',  multiplier: 1.0,  days: 1 },
  week:         { label: 'This Week',     short: 'this wk',    multiplier: 5.8,  days: 7 },
  month:        { label: 'MTD',           short: 'MTD',        multiplier: 22.3, days: 30 },
  'pay-period': { label: 'Pay Period',    short: 'pay period', multiplier: 12.7, days: 14 },
  ytd:          { label: 'YTD',           short: 'YTD',        multiplier: 112,  days: 124 },
  custom:       { label: 'Custom',        short: 'custom',     multiplier: 1.0,  days: 1 },
};
