'use client';

import { HOTELS } from '@hos/shared';
import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

export const SYDNEY_HOTEL_ID = 'BTRCI';
export const SYDNEY_HOTEL = HOTELS.find((h) => h.id === SYDNEY_HOTEL_ID)!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function useMaintenanceStaff(): Any[] {
  const { data } = useApi(apiKeys.employees(SYDNEY_HOTEL_ID, 'Maintenance'));
  const employees = (data?.employees ?? []) as Any[];
  return employees.filter((e) => e.status === 'active');
}

export function useHotelTickets(): Any[] {
  const { data } = useApi(apiKeys.opsTickets(SYDNEY_HOTEL_ID));
  return (data?.tickets ?? []) as Any[];
}

export function useHotelAudits(): Any[] {
  const { data } = useApi(apiKeys.auditTasks(SYDNEY_HOTEL_ID));
  return (data?.tasks ?? []) as Any[];
}

export function useHotelRooms(): Any[] {
  const { data } = useApi(apiKeys.opsRooms(SYDNEY_HOTEL_ID));
  return (data?.rooms ?? []) as Any[];
}

export function useOpsSummary(): Any {
  const { data } = useApi(apiKeys.opsSummary(SYDNEY_HOTEL_ID));
  return data?.summary ?? null;
}

export function useHotelAssets(): Any[] {
  const { data } = useApi(apiKeys.assets(SYDNEY_HOTEL_ID));
  return (data?.assets ?? []) as Any[];
}

export function useAssetSummary(): Any {
  const { data } = useApi(apiKeys.assetsSummary());
  return ((data?.summaries ?? []) as Any[]).find((s) => s.hotelId === SYDNEY_HOTEL_ID) ?? null;
}

export function useHotelVendorSpend(): Any[] {
  const { data } = useApi(apiKeys.vendorSpend());
  const vendors = (data?.vendors ?? []) as Any[];
  return vendors
    .map((v) => ({ ...v, hotelIds: v.hotelIds.filter((id: string) => id === SYDNEY_HOTEL_ID) }))
    .filter((v) => v.hotelIds.length > 0);
}

export const TICKET_TYPE_META = {
  reactive:   { label: 'Reactive',   bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5', icon: '🔧' },
  preventive: { label: 'Preventive', bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd', icon: '📅' },
  audit:      { label: 'Audit',      bg: '#f0fdf4', color: '#15803d', border: '#86efac', icon: '✓' },
  escalation: { label: 'Escalation', bg: '#fffbeb', color: '#b45309', border: '#fcd34d', icon: '⚠' },
} as const;

export const PRIORITY_META = {
  urgent: { label: 'Urgent', bg: '#fef2f2', color: '#b91c1c' },
  high:   { label: 'High',   bg: '#fffbeb', color: '#b45309' },
  normal: { label: 'Normal', bg: '#eff6ff', color: '#1d4ed8' },
  low:    { label: 'Low',    bg: '#f7f7f7', color: '#6a6a6a' },
} as const;
