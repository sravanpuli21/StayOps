'use client';

import { useEffect, useMemo, useState } from 'react';
import { AI_ANOMALIES, LABOUR_DATA, REGIONAL_ROSTER, type Hotel } from '@hos/shared';
import type {
  ApiRevenueRow,
  ApiDailyRow,
  ApiHotelRow,
  DateRangeToken,
  DateWindow,
} from '@hos/shared';
import { useHotelFilter } from './hotel-filter-context';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';

interface ScopedApiResponse {
  window: DateWindow;
  scopeLabel: string;
  scopeSub: string;
  hotels: ApiHotelRow[];
  revenueRows: ApiRevenueRow[];
  dailyRows: ApiDailyRow[];
}

/**
 * Shared scope state for portfolio pages. Fetches from /api/revenue/scoped
 * which does SQL aggregation server-side (replaces the old multiplier hack).
 *
 * Return shape stays backwards-compatible with the old mock-data version
 * so existing pages don't need to change — `hotels`, `revenueRows`,
 * `labourRows`, `dailyRows`, `openAnomalies`, `scopeLabel`, `scopeSub`,
 * `period`, `filterByHotel`, flags.
 *
 * labourRows: still derived from mock LABOUR_DATA (Module 4 — not in scope
 * for Phase 0 Revenue). Ignored by Revenue pages.
 */
export function useScopedData() {
  const { selection, viewerRegionalId } = useHotelFilter();
  const { range } = useDateFilter();
  const period = DATE_RANGE_META[range];

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set('range', range as DateRangeToken);
    if (selection.kind === 'single') {
      p.set('selection', 'single');
      p.set('hotelId', selection.hotelId);
    } else if (selection.kind === 'regional') {
      p.set('selection', 'regional');
      p.set('regionalId', selection.regionalId);
    } else if (selection.kind === 'my-territory' && viewerRegionalId) {
      p.set('selection', 'my-territory');
      p.set('viewerRegionalId', viewerRegionalId);
    } else {
      p.set('selection', 'all');
    }
    return p.toString();
  }, [range, selection, viewerRegionalId]);

  const [data, setData] = useState<ScopedApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/revenue/scoped?${qs}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: ScopedApiResponse) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [qs]);

  // Adapt API response to legacy Hotel[] shape (adds `id` = code)
  const hotels: Hotel[] = useMemo(() => {
    if (!data) return [];
    return data.hotels.map((h) => ({
      id: h.id,
      code: h.code,
      name: h.name,
      shortName: h.shortName,
      rooms: h.rooms,
      brand: h.brand,
      city: h.city,
      state: h.state,
    }));
  }, [data]);

  const hotelIdSet = useMemo(() => new Set(hotels.map((h) => h.id)), [hotels]);

  const scopeLabel = useMemo(() => {
    if (!data) return 'Portfolio';
    // Prefer regional roster name when available
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
  }, [data, selection, viewerRegionalId, hotels]);

  const scopeSub = useMemo(() => {
    if (!data) return '';
    if (selection.kind === 'single' && hotels[0]) {
      return `${period.label} · ${hotels[0].city}, ${hotels[0].state} · ${hotels[0].brand}`;
    }
    return `${period.label} · ${hotels.length === 16 ? `All 16 Hotels` : `${hotels.length} Hotels`}`;
  }, [data, selection, hotels, period.label]);

  // Revenue rows already shaped API-side (matches RevenueSummary fields the frontend expects)
  const revenueRows = data?.revenueRows ?? [];
  const dailyRows = data?.dailyRows ?? [];

  // Labour stays mock for Phase 0 (Module 4 scope). Keep shape stable for callers.
  const labourRows = useMemo(
    () => LABOUR_DATA.filter((l) => hotelIdSet.has(l.hotelId)),
    [hotelIdSet],
  );

  const openAnomalies = useMemo(
    () => AI_ANOMALIES.filter((a) => hotelIdSet.has(a.hotelId) && a.kind !== 'resolved'),
    [hotelIdSet],
  );

  return {
    selection,
    range,
    period,
    window: data?.window,
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
