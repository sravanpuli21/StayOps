'use client';

import { useMemo } from 'react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS, AI_ANOMALIES, REGIONAL_ROSTER,
} from '@hos/shared';
import { useHotelFilter } from './hotel-filter-context';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';

/**
 * Shared scope state for pages inside Kris's (MD) app.
 * Combines global hotel selection + date range. All numeric arrays it exposes
 * are pre-scaled by the period multiplier (except ratios/averages), so pages
 * and their children can just sum/display values.
 *
 * Scaled fields:
 *  - revenueRows: totalRevenue, roomRevenue, nonRoomRevenue (NOT occupancyPct/adr/revPar — ratios)
 *  - labourRows:  scheduledHours, clockedHours, variance, overtimeHours, payrollCost; departments.* same
 *  - dailyRows:   roomsSold (NOT avgCustomerRating/occupancyPct — ratios)
 *  - AI_ANOMALIES not scaled (they're individual findings, not accumulators)
 */
export function useScopedData() {
  const { selection, viewerRegionalId } = useHotelFilter();
  const { range } = useDateFilter();
  const period = DATE_RANGE_META[range];
  const mult = period.multiplier;

  const hotels = useMemo(() => {
    // Resolve my-territory based on viewer (regional directors)
    if (selection.kind === 'my-territory' && viewerRegionalId) {
      const reg = REGIONAL_ROSTER.find((r) => r.id === viewerRegionalId);
      if (reg) return HOTELS.filter((h) => reg.hotelIds.includes(h.id));
    }
    if (selection.kind === 'regional') {
      const reg = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
      if (reg) return HOTELS.filter((h) => reg.hotelIds.includes(h.id));
    }
    if (selection.kind === 'single') {
      const h = HOTELS.find((x) => x.id === selection.hotelId);
      if (h) return [h];
    }
    return HOTELS;
  }, [selection, viewerRegionalId]);

  const hotelIdSet = useMemo(() => new Set(hotels.map((h) => h.id)), [hotels]);

  const scopeLabel = useMemo(() => {
    if (selection.kind === 'my-territory' && viewerRegionalId) {
      const reg = REGIONAL_ROSTER.find((r) => r.id === viewerRegionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'regional') {
      const reg = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'single' && hotels[0]) return hotels[0].shortName;
    return 'Portfolio';
  }, [selection, viewerRegionalId, hotels]);

  const scopeSub = useMemo(() => {
    if (selection.kind === 'single' && hotels[0]) {
      return `${period.label} · ${hotels[0].city}, ${hotels[0].state} · ${hotels[0].brand}`;
    }
    return `${period.label} · ${hotels.length === HOTELS.length ? `All ${HOTELS.length} Hotels` : `${hotels.length} Hotels`}`;
  }, [selection, hotels, period.label]);

  const revenueRows = useMemo(() =>
    REVENUE_DATA
      .filter((r) => hotelIdSet.has(r.hotelId))
      .map((r) => ({
        ...r,
        totalRevenue: r.totalRevenue * mult,
        roomRevenue: r.roomRevenue * mult,
        nonRoomRevenue: r.nonRoomRevenue * mult,
      })),
  [hotelIdSet, mult]);

  const labourRows = useMemo(() =>
    LABOUR_DATA
      .filter((l) => hotelIdSet.has(l.hotelId))
      .map((l) => ({
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
      })),
  [hotelIdSet, mult]);

  const dailyRows = useMemo(() =>
    DAILY_METRICS
      .filter((m) => hotelIdSet.has(m.hotelId))
      .map((m) => ({
        ...m,
        roomsSold: Math.round(m.roomsSold * mult),
      })),
  [hotelIdSet, mult]);

  const openAnomalies = useMemo(
    () => AI_ANOMALIES.filter((a) => hotelIdSet.has(a.hotelId) && a.kind !== 'resolved'),
    [hotelIdSet],
  );

  return {
    selection,
    range,
    period,
    hotels,
    hotelIdSet,
    scopeLabel,
    scopeSub,
    revenueRows,
    labourRows,
    dailyRows,
    openAnomalies,
    filterByHotel: <T extends { hotelId: string }>(arr: readonly T[]): T[] =>
      arr.filter((x) => hotelIdSet.has(x.hotelId)),
    isSingleHotel: selection.kind === 'single',
    isRegional: selection.kind === 'regional',
    isPortfolio: selection.kind === 'all' || selection.kind === 'my-territory',
  };
}
