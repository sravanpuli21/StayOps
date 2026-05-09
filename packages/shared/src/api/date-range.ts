/**
 * Translates a DateRange token into an absolute [from, to] window the
 * server aggregates over. Replaces the old multiplier hack.
 *
 * Convention: dates are YYYY-MM-DD in the hotel's local timezone (we
 * ignore TZ for Phase 0 — all hotels are US East or similar, single day
 * reports).
 */

export type DateRangeToken =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'pay-period'
  | 'ytd'
  | 'custom';

export interface DateWindow {
  from: string; // YYYY-MM-DD, inclusive
  to: string;   // YYYY-MM-DD, inclusive
  days: number; // number of days in window
  label: string;
}

export function resolveDateWindow(
  range: DateRangeToken,
  ref: Date = new Date(),
  custom?: { from: string; to: string },
): DateWindow {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  switch (range) {
    case 'today':
      return { from: iso(today), to: iso(today), days: 1, label: 'Today' };
    case 'yesterday':
      return { from: iso(yesterday), to: iso(yesterday), days: 1, label: 'Yesterday' };
    case 'week': {
      // 7 days ending today (rolling)
      const from = new Date(today); from.setDate(today.getDate() - 6);
      return { from: iso(from), to: iso(today), days: 7, label: 'This Week' };
    }
    case 'month': {
      // 1st of current month → today
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const days = Math.round((today.getTime() - from.getTime()) / 86400000) + 1;
      return { from: iso(from), to: iso(today), days, label: 'This Month' };
    }
    case 'pay-period': {
      // 14-day window ending today
      const from = new Date(today); from.setDate(today.getDate() - 13);
      return { from: iso(from), to: iso(today), days: 14, label: 'Pay Period' };
    }
    case 'ytd': {
      const from = new Date(today.getFullYear(), 0, 1);
      const days = Math.round((today.getTime() - from.getTime()) / 86400000) + 1;
      return { from: iso(from), to: iso(today), days, label: 'YTD' };
    }
    case 'custom': {
      if (!custom) throw new Error('custom range requires from/to');
      const f = new Date(custom.from);
      const t = new Date(custom.to);
      const days = Math.round((t.getTime() - f.getTime()) / 86400000) + 1;
      return { from: custom.from, to: custom.to, days, label: 'Custom' };
    }
  }
}
