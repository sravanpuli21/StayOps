import type { Room } from '@hos/shared';

/**
 * Per-room "Final Room Status" pills from room_snapshots.reservation_status:
 *   IN HOUSE    → Occupied
 *   Arrival     → Assigned
 *   blank/empty → Available
 *   CHECKED OUT → Dirty
 * (Plus 'Stayover' when an IN HOUSE row has a future Departure Date.)
 *
 * Each `type` matches the namespaced key returned by
 * GET /api/ops/property-stats so consumers can render the pills with
 * `metrics.find(m => m.type === pill.type)`.
 */
export const OPS_PILLS: Array<{
  type: string; label: string;
  bg: string; border: string; color: string; dot: string;
}> = [
  { type: 'Room.Occupied',  label: 'Occupied',  bg: '#f3f4f6', border: '#d1d5db', color: '#374151', dot: '#94a3b8' },
  { type: 'Room.Stayover',  label: 'Stayover',  bg: '#fff7ed', border: '#fdba74', color: '#9a3412', dot: '#fb923c' },
  { type: 'Room.Assigned',  label: 'Assigned',  bg: '#dbeafe', border: '#93c5fd', color: '#1e40af', dot: '#3b82f6' },
  { type: 'Room.Available', label: 'Available', bg: '#dcfce7', border: '#86efac', color: '#15803d', dot: '#22c55e' },
  { type: 'Room.Dirty',     label: 'Dirty',     bg: '#fef9c3', border: '#fde047', color: '#854d0e', dot: '#f59e0b' },
];

/** Tile dot color per room status (used by the room grid tiles). */
export const ROOM_COLORS: Record<string, string> = {
  ready:      '#22c55e',
  dirty:      '#f59e0b',
  inspecting: '#3b82f6',
  occupied:   '#94a3b8',
  ooo:        '#ef4444',
  blocked:    '#e11d48',
};

/** Tile background / border / dot config — mirrors Audits HotelAuditView grid. */
export const TILE_CFG: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
  inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting' },
  dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
  occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
  ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
  blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked' },
};

/**
 * Project the new RoomStatus type values onto the grid's 6-status visual
 * buckets so existing tile colors keep working unchanged.
 */
export function statusFromType(t: string): Room['status'] {
  if (t === 'Occupied' || t === 'Stayover') return 'occupied';
  if (t === 'Available') return 'ready';
  if (t === 'Dirty')     return 'dirty';
  if (t === 'Assigned')  return 'inspecting';
  if (t === 'OOO')       return 'ooo';
  return 'occupied';
}
