'use client';

import { createContext, useContext, useState } from 'react';
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
}

const DateFilterContext = createContext<DateFilterCtx | null>(null);

export function DateFilterProvider({
  initial = 'yesterday',
  children,
}: {
  initial?: DateRange;
  children: ReactNode;
}) {
  const [range, setRange] = useState<DateRange>(initial);
  return (
    <DateFilterContext.Provider value={{ range, setRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter(): DateFilterCtx {
  const ctx = useContext(DateFilterContext);
  if (!ctx) return { range: 'yesterday', setRange: () => {} };
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
  month:        { label: 'This Month',    short: 'this mo',    multiplier: 22.3, days: 30 },
  'pay-period': { label: 'Pay Period',    short: 'pay period', multiplier: 12.7, days: 14 },
  ytd:          { label: 'YTD',           short: 'YTD',        multiplier: 112,  days: 124 },
  custom:       { label: 'Custom',        short: 'custom',     multiplier: 1.0,  days: 1 },
};
