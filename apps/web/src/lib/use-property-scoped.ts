'use client';

import { useMemo } from 'react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS,
} from '@hos/shared';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';

/**
 * Period-aware single-property data hook. For personas pinned to one hotel
 * (Rishab / Emma / Sydney) — applies the global date filter's multiplier to
 * revenue / labour / daily metrics so Today/Week/Month/YTD all work.
 *
 * Ratios (occupancy %, ADR, rating) are NOT scaled — they're meaningful as
 * averages regardless of period. Counters (revenue, hours, rooms sold) are.
 */
export function usePropertyScoped(hotelId: string) {
  const { range } = useDateFilter();
  const period = DATE_RANGE_META[range];
  const mult = period.multiplier;

  const hotel = useMemo(() => HOTELS.find((h) => h.id === hotelId)!, [hotelId]);

  const revenue = useMemo(() => {
    const r = REVENUE_DATA.find((x) => x.hotelId === hotelId);
    if (!r) return null;
    return {
      ...r,
      totalRevenue: r.totalRevenue * mult,
      roomRevenue: r.roomRevenue * mult,
      nonRoomRevenue: r.nonRoomRevenue * mult,
    };
  }, [hotelId, mult]);

  const labour = useMemo(() => {
    const l = LABOUR_DATA.find((x) => x.hotelId === hotelId);
    if (!l) return null;
    return {
      ...l,
      scheduledHours: Math.round(l.scheduledHours * mult),
      clockedHours: Math.round(l.clockedHours * mult),
      variance: Math.round(l.variance * mult),
      overtimeHours: Math.round(l.overtimeHours * mult),
      payrollCost: l.payrollCost * mult,
      departments: l.departments.map((d) => ({
        ...d,
        scheduledHours: Math.round(d.scheduledHours * mult),
        clockedHours: Math.round(d.clockedHours * mult),
        variance: Math.round(d.variance * mult),
        overtimeHours: Math.round(d.overtimeHours * mult),
        payrollCost: d.payrollCost * mult,
      })),
    };
  }, [hotelId, mult]);

  const daily = useMemo(() => {
    const d = DAILY_METRICS.find((x) => x.hotelId === hotelId);
    if (!d) return null;
    return {
      ...d,
      roomsSold: Math.round(d.roomsSold * mult),
    };
  }, [hotelId, mult]);

  return {
    hotel,
    period,
    range,
    revenue,
    labour,
    daily,
  };
}
