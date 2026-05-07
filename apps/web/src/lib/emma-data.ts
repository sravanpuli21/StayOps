import {
  getEmployeesForHotel, getRoomsForHotel, getActiveTicketsForHotel,
  getPropertyOpsSummary, HOTELS,
} from '@hos/shared';

export const EMMA_HOTEL_ID = 'BTRCI';

export const EMMA_HOTEL = HOTELS.find((h) => h.id === EMMA_HOTEL_ID)!;

export function getHkStaff() {
  return getEmployeesForHotel(EMMA_HOTEL_ID)
    .filter((e) => e.team === 'Housekeeping' && e.status === 'active');
}

export function getHkCallouts() {
  return getEmployeesForHotel(EMMA_HOTEL_ID)
    .filter((e) => e.team === 'Housekeeping' && e.status === 'callout');
}

export function getAllHotelRooms() {
  return getRoomsForHotel(EMMA_HOTEL_ID);
}

export function getQueueRooms() {
  return getRoomsForHotel(EMMA_HOTEL_ID)
    .filter((r) => r.status === 'dirty' || r.status === 'inspecting');
}

export function getHotelTickets() {
  return getActiveTicketsForHotel(EMMA_HOTEL_ID);
}

export function getHotelOpsSummary() {
  return getPropertyOpsSummary(EMMA_HOTEL_ID);
}

export interface SeededAssignment {
  roomNumber: string;
  assignees: string[];
}

export function seedAssignments(): SeededAssignment[] {
  // Seeds the first ~60% of the queue using the same floor-optimized algorithm
  // so the UI feels pre-solved on first load.
  const queue = getQueueRooms();
  const preset = queue.slice(0, Math.floor(queue.length * 0.6));
  return autoAssignRooms([], preset.map((r) => r.number));
}

/**
 * Floor-optimized round-robin. Assigns rooms so each housekeeper covers at
 * most 2 distinct floors, with a strong preference to stay on one floor.
 *
 * Heuristic per room (in priority order):
 *  1. Prefer staff who already have a room on this exact floor (minimize walking).
 *  2. Otherwise prefer staff who can take a 2nd floor (haven't hit the 2-floor cap).
 *  3. Break ties by lowest current load (balance hours).
 */
export function autoAssignRooms(
  existing: SeededAssignment[],
  roomNumbersToAssign: string[],
): SeededAssignment[] {
  const rooms = getQueueRooms();
  const roomByNumber = new Map<string, { floor: number }>();
  for (const r of rooms) roomByNumber.set(r.number, { floor: r.floor });

  const staff = getHkStaff();
  if (staff.length === 0) return existing;

  // Track each staff member's floors + load
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

  // Sort rooms to assign by floor so nearby ones group naturally
  const sorted = [...roomNumbersToAssign]
    .map((n) => ({ n, floor: roomByNumber.get(n)?.floor ?? 0 }))
    .sort((a, b) => a.floor - b.floor || a.n.localeCompare(b.n));

  for (const { n: roomNumber, floor } of sorted) {
    if (taken.has(roomNumber)) continue;

    const scored = staff.map((s) => {
      const f = floors[s.id];
      const alreadyOnFloor = f.has(floor);
      const distinctFloors = f.size;
      const canAdd = alreadyOnFloor || distinctFloors < 2;
      let score = 0;
      if (alreadyOnFloor) score += 1000;         // huge bonus for same floor
      else if (distinctFloors < 2) score += 500; // allow a 2nd floor
      else score -= 2000;                         // hard penalty — would need 3rd floor
      // adjacent-floor nudge (makes the non-same-floor pick feel sensible)
      if (!alreadyOnFloor) {
        const adjacent = Array.from(f).some((existingFloor) => Math.abs(existingFloor - floor) === 1);
        if (adjacent) score += 150;
      }
      // balance
      score -= loads[s.id] * 10;
      return { s, score, canAdd };
    });

    // Prefer a staff that can add without breaking the 2-floor cap
    const eligible = scored.filter((x) => x.canAdd);
    const pool = eligible.length > 0 ? eligible : scored; // fall back if everyone's capped
    pool.sort((a, b) => b.score - a.score);
    const pick = pool[0].s;

    result.push({ roomNumber, assignees: [pick.id] });
    loads[pick.id] = (loads[pick.id] ?? 0) + 1;
    (floors[pick.id] ??= new Set()).add(floor);
    taken.add(roomNumber);
  }

  return result;
}

export const ROOM_TILE: Record<string, { bg: string; border: string; dot: string; label: string; esp: string }> = {
  ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready',      esp: 'Listo' },
  inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting', esp: 'Inspeccionando' },
  dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty',      esp: 'Sucio' },
  occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied',   esp: 'Ocupado' },
  ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO',        esp: 'Fuera de servicio' },
  blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked',    esp: 'Bloqueado' },
};
