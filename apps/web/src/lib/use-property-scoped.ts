'use client';

import { useEffect, useState } from 'react';
import { HOTELS, LABOUR_DATA, type Hotel } from '@hos/shared';
import type { ApiRevenueRow, ApiDailyRow, DateWindow } from '@hos/shared';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';

interface PropertyApiResponse {
  window: DateWindow;
  hotel: { id: string; code: string; name: string; shortName: string; rooms: number; brand: string; city: string; state: string };
  revenue: ApiRevenueRow | null;
  daily: ApiDailyRow | null;
}

/**
 * Single-property revenue hook. Fetches /api/revenue/property with the
 * chosen date range. Return shape backwards-compatible with the mock-era
 * version so existing Rishab pages keep working.
 *
 * labour stays mock (Module 4 — not in Phase 0 scope).
 */
export function usePropertyScoped(hotelId: string) {
  const { range } = useDateFilter();
  const period = DATE_RANGE_META[range];

  const [data, setData] = useState<PropertyApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/revenue/property?hotelId=${encodeURIComponent(hotelId)}&range=${range}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: PropertyApiResponse) => {
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
  }, [hotelId, range]);

  // Fall back to mock Hotel record if API hasn't loaded yet (prevents null)
  const hotel: Hotel = data
    ? {
        id: data.hotel.id,
        code: data.hotel.code,
        name: data.hotel.name,
        shortName: data.hotel.shortName,
        rooms: data.hotel.rooms,
        brand: data.hotel.brand as Hotel['brand'],
        city: data.hotel.city,
        state: data.hotel.state,
      }
    : HOTELS.find((h) => h.id === hotelId)!;

  // Labour is mock for now (Module 4). Not scaled.
  const labour = LABOUR_DATA.find((l) => l.hotelId === hotelId) ?? null;

  return {
    hotel,
    period,
    window: data?.window,
    range,
    revenue: data?.revenue ?? null,
    labour,
    daily: data?.daily ?? null,
    loading,
    error,
  };
}
