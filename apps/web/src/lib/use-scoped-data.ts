'use client';

import { useMemo } from 'react';
import {
  HOTELS, REGIONAL_ROSTER, resolveDateRange,
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
  const { range } = useDateFilter();
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
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range]);

  const rev = useApi(apiKeys.revenueScoped(hotelIds, from, to));
  const lab = useApi(apiKeys.labourScoped(hotelIds, from, to));
  const day = useApi(apiKeys.dailyScoped(hotelIds, from, to));
  const an  = useApi(apiKeys.anomalies());

  const revenueRows: ApiRevenueSummary[] = rev.data?.rows ?? [];
  const labourRows:  ApiLabourMetrics[]  = lab.data?.rows ?? [];
  const dailyRows:   ApiDailyMetrics[]   = day.data?.rows ?? [];

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
