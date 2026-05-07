import {
  HOTELS, getEmployeesForHotel, getRoomsForHotel,
  getActiveTicketsForHotel, getAuditTasksForHotel, getPropertyOpsSummary,
  ASSETS, ASSET_HOTEL_SUMMARIES, VENDOR_SPENDS,
} from '@hos/shared';

export const SYDNEY_HOTEL_ID = 'BTRCI';
export const SYDNEY_HOTEL = HOTELS.find((h) => h.id === SYDNEY_HOTEL_ID)!;

export function getMaintenanceStaff() {
  return getEmployeesForHotel(SYDNEY_HOTEL_ID)
    .filter((e) => e.team === 'Maintenance' && e.status === 'active');
}

export function getHotelTickets() {
  return getActiveTicketsForHotel(SYDNEY_HOTEL_ID);
}

export function getHotelAudits() {
  return getAuditTasksForHotel(SYDNEY_HOTEL_ID);
}

export function getHotelRooms() {
  return getRoomsForHotel(SYDNEY_HOTEL_ID);
}

export function getOpsSummary() {
  return getPropertyOpsSummary(SYDNEY_HOTEL_ID);
}

export function getHotelAssets() {
  return ASSETS.filter((a) => a.hotelId === SYDNEY_HOTEL_ID);
}

export function getAssetSummary() {
  return ASSET_HOTEL_SUMMARIES.find((s) => s.hotelId === SYDNEY_HOTEL_ID);
}

export function getHotelVendorSpend() {
  return VENDOR_SPENDS
    .map((v) => ({ ...v, hotelIds: v.hotelIds.filter((id) => id === SYDNEY_HOTEL_ID) }))
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
