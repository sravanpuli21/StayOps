'use client';

import { HOTELS, type Room } from '@hos/shared';
import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

export const EMMA_HOTEL_ID = 'BTRCI';
export const EMMA_HOTEL = HOTELS.find((h) => h.id === EMMA_HOTEL_ID)!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function useHkStaff(): Any[] {
  // Server filters by team=Housekeeping; we narrow to status=active client-side.
  const { data } = useApi(apiKeys.employees(EMMA_HOTEL_ID, 'Housekeeping'));
  const employees = (data?.employees ?? []) as Any[];
  return employees.filter((e) => e.status === 'active');
}

export function useHkCallouts(): Any[] {
  const { data } = useApi(apiKeys.employees(EMMA_HOTEL_ID, 'Housekeeping'));
  const employees = (data?.employees ?? []) as Any[];
  return employees.filter((e) => e.status === 'callout');
}

export function useAllHotelRooms(): Room[] {
  const { data } = useApi(apiKeys.opsRooms(EMMA_HOTEL_ID));
  return (data?.rooms ?? []) as Room[];
}

export function useQueueRooms(): Room[] {
  const rooms = useAllHotelRooms();
  return rooms.filter((r) => r.status === 'dirty' || r.status === 'inspecting');
}

export function useHotelTickets(): Any[] {
  const { data } = useApi(apiKeys.opsTickets(EMMA_HOTEL_ID));
  return (data?.tickets ?? []) as Any[];
}

export function useHotelOpsSummary() {
  const { data } = useApi(apiKeys.opsSummary(EMMA_HOTEL_ID));
  return data?.summary ?? null;
}

export interface SeededAssignment {
  roomNumber: string;
  assignees: string[];
}

/**
 * Floor-optimized round-robin. Pure function — pages call it after they have
 * `staff` + `queue` from the hooks above.
 */
export function autoAssignRooms(
  existing: SeededAssignment[],
  roomNumbersToAssign: string[],
  staff: Any[],
  queueRooms: Room[],
): SeededAssignment[] {
  const roomByNumber = new Map<string, { floor: number }>();
  for (const r of queueRooms) roomByNumber.set(r.number, { floor: r.floor });

  if (staff.length === 0) return existing;

  const loads: Record<string, number> = {};
  const floors: Record<string, Set<number>> = {};
  for (const s of staff) { loads[s.id] = 0; floors[s.id] = new Set(); }
  for (const a of existing) {
    for (const id of a.assignees) {
      loads[id] = (loads[id] ?? 0) + 1;
      const f = roomByNumber.get(a.roomNumber)?.floor;
      if (f !== undefined) (floors[id] ??= new Set()).add(f);
    }
  }

  const result = [...existing];
  const taken = new Set(existing.map((a) => a.roomNumber));

  const sorted = [...roomNumbersToAssign]
    .map((n) => ({ n, floor: roomByNumber.get(n)?.floor ?? 0 }))
    .sort((a, b) => a.floor - b.floor || a.n.localeCompare(b.n));

  for (const { n: roomNumber, floor } of sorted) {
    if (taken.has(roomNumber)) continue;

    const scored = staff.map((s) => {
      const id = s.id as string;
      const f = floors[id];
      const alreadyOnFloor = f.has(floor);
      const distinctFloors = f.size;
      const canAdd = alreadyOnFloor || distinctFloors < 2;
      let score = 0;
      if (alreadyOnFloor) score += 1000;
      else if (distinctFloors < 2) score += 500;
      else score -= 2000;
      if (!alreadyOnFloor) {
        const adjacent = Array.from(f).some((existingFloor) => Math.abs(existingFloor - floor) === 1);
        if (adjacent) score += 150;
      }
      score -= loads[id] * 10;
      return { s, id, score, canAdd };
    });

    const eligible = scored.filter((x) => x.canAdd);
    const pool = eligible.length > 0 ? eligible : scored;
    pool.sort((a, b) => b.score - a.score);
    const pick = pool[0];

    result.push({ roomNumber, assignees: [pick.id] });
    loads[pick.id] = (loads[pick.id] ?? 0) + 1;
    (floors[pick.id] ??= new Set()).add(floor);
    taken.add(roomNumber);
  }

  return result;
}

/**
 * Seeds the first ~60% of the queue using the floor-optimized algorithm.
 * Call this with `staff` + `queue` already in hand from the hooks.
 */
export function seedAssignments(staff: Any[], queue: Room[]): SeededAssignment[] {
  const preset = queue.slice(0, Math.floor(queue.length * 0.6));
  return autoAssignRooms([], preset.map((r) => r.number), staff, queue);
}

export const ROOM_TILE: Record<string, { bg: string; border: string; dot: string; label: string; esp: string }> = {
  ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready',      esp: 'Listo' },
  inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting', esp: 'Inspeccionando' },
  dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty',      esp: 'Sucio' },
  occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied',   esp: 'Ocupado' },
  ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO',        esp: 'Fuera de servicio' },
  blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked',    esp: 'Bloqueado' },
};
