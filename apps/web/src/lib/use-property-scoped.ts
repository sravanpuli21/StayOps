'use client';

import { useMemo } from 'react';
import { HOTELS, resolveDateRange, type DateRangeKind } from '@hos/shared';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';
import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

/**
 * Single-property data hook (Rishab / Emma / Sydney). Reads server-aggregated
 * revenue / labour / daily for the active date window.
 */
export function usePropertyScoped(hotelId: string) {
  const { range } = useDateFilter();
  const meta = DATE_RANGE_META[range];

  const hotel = useMemo(() => HOTELS.find((h) => h.id === hotelId)!, [hotelId]);

  const { from, to } = useMemo(() => {
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range]);

  const rev = useApi(apiKeys.revenueProperty(hotelId, from, to));
  const lab = useApi(apiKeys.labourProperty(hotelId, from, to));
  const day = useApi(apiKeys.dailyProperty(hotelId, from, to));

  const loading = rev.isLoading || lab.isLoading || day.isLoading;
  const error   = rev.error ?? lab.error ?? day.error ?? null;

  return {
    hotel,
    period: { ...meta, multiplier: 1 },
    range,
    revenue: rev.data?.summary ?? null,
    labour:  lab.data?.summary ?? null,
    daily:   day.data?.summary ?? null,
    loading,
    error,
  };
}
