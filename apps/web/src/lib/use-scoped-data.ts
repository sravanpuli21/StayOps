'use client';

import { useMemo } from 'react';
import {
  HOTELS, REGIONAL_ROSTER, resolveDateRange,
  mockRevenueRows, mockLabourRows, mockDailyRows,
  type DateRangeKind,
  type ApiRevenueSummary, type ApiLabourMetrics, type ApiDailyMetrics, type ApiAnomalyFinding,
} from '@hos/shared';
import { useHotelFilter } from './hotel-filter-context';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';
import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

/**
 * Shared scope state for pages inside Kris's (MD) app.
 *
 * Backend-ready: revenue / labour / daily rows come from /api/* handlers
 * that server-aggregate the seeded series over the real date window. The
 * historical `period.multiplier` is kept on the return shape for back-compat
 * but set to 1 — consumers shouldn't re-multiply.
 */
export function useScopedData() {
  const { selection, viewerRegionalId } = useHotelFilter();
  const { range, customFrom, customTo } = useDateFilter();
  const meta = DATE_RANGE_META[range];

  const selectedHotels = useMemo(() => {
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

  // Sorted alphabetically so identical selections produce identical SWR cache
  // keys regardless of the order the user picked hotels in.
  const hotelIds = useMemo(
    () => [...selectedHotels.map((h) => h.id)].sort(),
    [selectedHotels],
  );

  // Resolve the ISO window for API calls. Reads NEXT_PUBLIC_STAYOPS_FROZEN_TODAY
  // (matches the server's STAYOPS_FROZEN_TODAY). When unset, defaults to live
  // Date.now() so production picks up the real clock.
  const { from, to } = useMemo(() => {
    if (range === 'custom') {
      // Use the dates the user picked in the calendar pickers.
      const f = customFrom || customTo;
      const t = customTo   || customFrom;
      if (f && t) return { from: f, to: t };
      // Fall through to yesterday if neither is set yet.
    }
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range, customFrom, customTo]);

  // 'month' / 'ytd' switch the revenue API into MTD / YTD snapshot mode so
  // the cards reflect the cumulative numbers from the OnQ file rather than
  // a partial sum of whichever days have been uploaded.
  const revAgg: 'today' | 'mtd' | 'ytd' =
    range === 'month' ? 'mtd' : range === 'ytd' ? 'ytd' : 'today';
  const rev = useApi(apiKeys.revenueScoped(hotelIds, from, to, revAgg));
  const lab = useApi(apiKeys.labourScoped(hotelIds, from, to));
  const day = useApi(apiKeys.dailyScoped(hotelIds, from, to));
  const an  = useApi(apiKeys.anomalies());

  const apiRevenueRows: ApiRevenueSummary[] = rev.data?.rows ?? [];
  const apiLabourRows:  ApiLabourMetrics[]  = lab.data?.rows ?? [];
  const apiDailyRows:   ApiDailyMetrics[]   = day.data?.rows ?? [];

  // Phase-1 demo fallback: when the API responded but the DB has no rows for
  // this hotel × date window (local dev / fresh deploy), synthesize realistic
  // per-hotel, per-day numbers so every filter combination shows believable,
  // self-consistent data. Once the DB is seeded, real rows take over verbatim.
  // Keyed on the resolved [from,to] + hotelIds so it varies by date AND hotel.
  const revenueRows = useMemo<ApiRevenueSummary[]>(() => {
    if (apiRevenueRows.length > 0) return apiRevenueRows;
    if (!rev.data || hotelIds.length === 0) return apiRevenueRows;
    return mockRevenueRows(hotelIds, from, to, revAgg);
  }, [apiRevenueRows, rev.data, hotelIds, from, to, revAgg]);

  const labourRows = useMemo<ApiLabourMetrics[]>(() => {
    // Labour API returns a zero-filled row (not []) when the DB has no shifts,
    // so treat "every row has no hours" as empty too.
    const hasReal = apiLabourRows.some((r) => r.scheduledHours > 0 || r.clockedHours > 0 || r.payrollCost > 0);
    if (hasReal) return apiLabourRows;
    if (!lab.data || hotelIds.length === 0) return apiLabourRows;
    return mockLabourRows(hotelIds, from, to);
  }, [apiLabourRows, lab.data, hotelIds, from, to]);

  const dailyRows = useMemo<ApiDailyMetrics[]>(() => {
    if (apiDailyRows.length > 0) return apiDailyRows;
    if (!day.data || hotelIds.length === 0) return apiDailyRows;
    return mockDailyRows(hotelIds, from, to);
  }, [apiDailyRows, day.data, hotelIds, from, to]);

  // Keep hotels aligned with the rows we actually have. During initial load,
  // hotels is empty → pages render no rows instead of `find()→undefined` crashes.
  const ready = !!rev.data && !!lab.data && !!day.data;
  const hotels = ready ? selectedHotels : [];
  const hotelIdSet = useMemo(() => new Set(hotels.map((h) => h.id)), [hotels]);

  const openAnomalies: ApiAnomalyFinding[] = useMemo(
    () => (an.data?.anomalies ?? []).filter((a: ApiAnomalyFinding) => hotelIdSet.has(a.hotelId) && a.kind !== 'resolved'),
    [an.data, hotelIdSet],
  );

  const scopeLabel = useMemo(() => {
    if (selection.kind === 'my-territory' && viewerRegionalId) {
      const reg = REGIONAL_ROSTER.find((r) => r.id === viewerRegionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'regional') {
      const reg = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'single' && selectedHotels[0]) return selectedHotels[0].shortName;
    return 'Portfolio';
  }, [selection, viewerRegionalId, selectedHotels]);

  const scopeSub = useMemo(() => {
    if (selection.kind === 'single' && selectedHotels[0]) {
      return `${meta.label} · ${selectedHotels[0].city}, ${selectedHotels[0].state} · ${selectedHotels[0].brand}`;
    }
    return `${meta.label} · ${selectedHotels.length === HOTELS.length ? `All ${HOTELS.length} Hotels` : `${selectedHotels.length} Hotels`}`;
  }, [selection, selectedHotels, meta.label]);

  const loading = rev.isLoading || lab.isLoading || day.isLoading;
  const error   = rev.error ?? lab.error ?? day.error ?? an.error ?? null;

  // Server returns real-day aggregates, so the legacy `multiplier` is shimmed
  // to 1. Pages doing `value * period.multiplier` keep working (no-op).
  // Pages that previously used multiplier as a "days-equivalent factor" for
  // client-side scaling (OTA leakage, RevenueMixBreakdown) should switch to
  // `period.days`.
  const period = { ...meta, multiplier: 1 };

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
    loading,
    error,
    filterByHotel: <T extends { hotelId: string }>(arr: readonly T[]): T[] =>
      arr.filter((x) => hotelIdSet.has(x.hotelId)),
    isSingleHotel: selection.kind === 'single',
    isRegional: selection.kind === 'regional',
    isPortfolio: selection.kind === 'all' || selection.kind === 'my-territory',
  };
}
