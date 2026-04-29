import type {
  Room, RoomStatus, HkStatus, RoomType,
  MaintenanceTicket, AuditTask, RoomInventoryItem,
} from '../types/operations';
import { HOTELS } from './hotels';

// ─── Room Generator ───────────────────────────────────────────────────────────

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// ─── Inventory & Audit Generators ────────────────────────────────────────────

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysAgo(days: number): string {
  const d = new Date('2026-04-25');
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function generateRoomInventory(hotelId: string, roomNumber: string): RoomInventoryItem[] {
  const s = hash(`${hotelId}-${roomNumber}`);

  // AC age & condition
  const acBucket = s % 10 < 4 ? 0 : s % 10 < 8 ? 1 : 2; // 0=newer,1=mid,2=older
  const acYear = acBucket === 0 ? 2021 + (s % 2) : acBucket === 1 ? 2018 + (s % 3) : 2015 + (s % 3);
  const acCond = (['good', 'fair', 'poor'] as const)[acBucket];
  const acRepairCount = acBucket === 0 ? 0 : acBucket === 1 ? 1 : 2 + (s % 2);
  const acRepairHistory: Array<{ date: string; type: 'repair'; description: string; cost: number; technician: string }> = [];
  if (acRepairCount >= 3) {
    acRepairHistory.push({ date: daysAgo(22), type: 'repair', description: 'Refrigerant recharge – unit not cooling efficiently', cost: 160, technician: 'HVAC Vendor' });
    acRepairHistory.push({ date: daysAgo(190), type: 'repair', description: 'Fan motor replaced – excessive vibration', cost: 220, technician: 'HVAC Vendor' });
    acRepairHistory.push({ date: daysAgo(410), type: 'repair', description: 'Capacitor replaced – unit failing to start', cost: 110, technician: 'Maintenance Tech' });
  } else if (acRepairCount === 2) {
    acRepairHistory.push({ date: daysAgo(60 + (s % 60)), type: 'repair', description: 'Capacitor replaced – unit failing to start', cost: 110, technician: 'Maintenance Tech' });
    acRepairHistory.push({ date: daysAgo(285 + (s % 80)), type: 'repair', description: 'Refrigerant recharge – low coolant level', cost: 150, technician: 'HVAC Vendor' });
  } else if (acRepairCount === 1) {
    acRepairHistory.push({ date: daysAgo(95 + (s % 180)), type: 'repair', description: 'Capacitor replaced – unit failing to start', cost: 110, technician: 'Maintenance Tech' });
  }
  const acHistory: typeof acRepairHistory = [
    ...acRepairHistory,
    { date: daysAgo(155 + (s % 100)), type: 'repair', description: 'Annual HVAC check – operational' + (acCond !== 'good' ? ', showing age-related wear' : ''), cost: 0, technician: 'Sydney Rivera' } as unknown as (typeof acRepairHistory)[0],
    { date: isoDate(acYear, 6, 1), type: 'repair', description: 'Unit installed – ' + (acYear < 2019 ? 'original installation' : 'replaced during property refresh'), cost: 2800, technician: 'HVACo Inc.' } as unknown as (typeof acRepairHistory)[0],
  ];
  // Properly typed history
  const acHistoryTyped: import('../types/operations').ItemHistoryEntry[] = [
    ...acRepairHistory,
    { date: daysAgo(155 + (s % 100)), type: 'inspection', description: 'Annual HVAC check – operational' + (acCond !== 'good' ? ', showing age-related wear' : ''), technician: 'Sydney Rivera' },
    { date: isoDate(acYear, 6, 1), type: 'replacement', description: 'Unit installed – ' + (acYear < 2019 ? 'original installation' : 'replaced during property refresh'), cost: 2800, technician: 'HVACo Inc.' },
  ];
  const acRepairCost = acRepairHistory.reduce((t, h) => t + h.cost, 0);
  void acHistory;

  // TV
  const tvYear = 2021 + (s % 3);
  const tvCost = 650;

  // Bed frame
  const bedYear = 2018 + (s % 5);
  const bedCond = bedYear < 2020 ? 'fair' : 'good';

  // Mattress
  const mattYear = 2020 + (s % 4);

  // Toilet
  const wcYear = 2016 + (s % 7);
  const wcCond = wcYear < 2019 ? 'fair' : 'good';
  const wcRepairs = wcCond === 'fair' ? 1 : 0;
  const wcHistory: import('../types/operations').ItemHistoryEntry[] = [
    ...(wcRepairs > 0
      ? [{ date: daysAgo(105 + (s % 200)), type: 'repair' as const, description: 'Flapper valve and fill valve replaced – constant running', cost: 85, technician: 'Amir Lopez' }]
      : []),
    { date: isoDate(wcYear, 4, 1), type: 'replacement', description: 'Original installation', cost: 420, technician: 'Plumbing Vendor' },
  ];

  // Shower
  const showerYear = 2016 + (s % 7);
  const showerCond = showerYear < 2018 ? 'fair' : 'good';
  const showerRepairs = showerCond === 'fair' && s % 3 === 0 ? 1 : 0;
  const showerHistory: import('../types/operations').ItemHistoryEntry[] = [
    ...(showerRepairs > 0
      ? [{ date: daysAgo(210 + (s % 100)), type: 'repair' as const, description: 'Shower head replaced – scale buildup causing low pressure', cost: 45, technician: 'Maintenance Tech' }]
      : []),
    { date: isoDate(showerYear, 4, 1), type: 'replacement', description: 'Original installation', cost: 380, technician: 'Plumbing Vendor' },
  ];

  return [
    {
      id: `INV-${hotelId}-${roomNumber}-AC`,
      hotelId, roomNumber,
      name: 'AC/PTAC Unit',
      category: 'appliance',
      condition: acCond,
      installedDate: isoDate(acYear, 6, 1),
      lastServiceDate: daysAgo(155 + (s % 100)),
      repairCount: acRepairCount,
      totalRepairCost: acRepairCost,
      replacementCost: 2800,
      history: acHistoryTyped,
    },
    {
      id: `INV-${hotelId}-${roomNumber}-TV`,
      hotelId, roomNumber,
      name: '55" Smart TV (Samsung)',
      category: 'electronics',
      condition: 'good',
      installedDate: isoDate(tvYear, 3, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: tvCost,
      history: [{ date: isoDate(tvYear, 3, 1), type: 'replacement', description: 'New TV installed – room refresh program', cost: tvCost, technician: 'AV Vendor' }],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-BED`,
      hotelId, roomNumber,
      name: 'King/Queen Bed Frame',
      category: 'furniture',
      condition: bedCond,
      installedDate: isoDate(bedYear, 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 900,
      history: [{ date: isoDate(bedYear, 4, 1), type: 'replacement', description: 'Bed frame installed – property refresh program', cost: 900, technician: 'FF&E Vendor' }],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-MATT`,
      hotelId, roomNumber,
      name: 'Mattress (Sealy)',
      category: 'linen',
      condition: 'good',
      installedDate: isoDate(mattYear, 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 780,
      history: [{ date: isoDate(mattYear, 4, 1), type: 'replacement', description: 'New mattress – annual rotation program', cost: 780, technician: 'Housekeeping' }],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-WC`,
      hotelId, roomNumber,
      name: 'Toilet (Kohler)',
      category: 'fixture',
      condition: wcCond,
      installedDate: isoDate(wcYear, 4, 1),
      repairCount: wcRepairs,
      totalRepairCost: wcRepairs * 85,
      replacementCost: 420,
      history: wcHistory,
    },
    {
      id: `INV-${hotelId}-${roomNumber}-SHOWER`,
      hotelId, roomNumber,
      name: 'Shower Head & Fixture',
      category: 'fixture',
      condition: showerCond,
      installedDate: isoDate(showerYear, 4, 1),
      repairCount: showerRepairs,
      totalRepairCost: showerRepairs * 45,
      replacementCost: 380,
      history: showerHistory,
    },
    {
      id: `INV-${hotelId}-${roomNumber}-DESK`,
      hotelId, roomNumber,
      name: 'Work Desk & Chair Set',
      category: 'furniture',
      condition: 'good',
      installedDate: isoDate(2019 + (s % 4), 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 650,
      history: [{ date: isoDate(2019 + (s % 4), 4, 1), type: 'replacement', description: 'Desk & chair installed – room refresh', cost: 650, technician: 'FF&E Vendor' }],
    },
    // ── Accessories ────────────────────────────────────────────────────────────
    {
      id: `INV-${hotelId}-${roomNumber}-REMOTE`,
      hotelId, roomNumber,
      name: 'TV Remote',
      category: 'electronics',
      condition: s % 8 === 0 ? 'fair' : 'good',
      installedDate: isoDate(tvYear, 3, 1),
      repairCount: s % 8 === 0 ? 1 : 0,
      totalRepairCost: s % 8 === 0 ? 18 : 0,
      replacementCost: 18,
      history: [
        ...(s % 8 === 0 ? [{ date: daysAgo(30 + (s % 60)), type: 'replacement' as const, description: 'Remote replaced – buttons unresponsive', cost: 18, technician: 'Front Desk' }] : []),
        { date: isoDate(tvYear, 3, 1), type: 'replacement', description: 'Installed with TV', cost: 18, technician: 'AV Vendor' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-LAMP`,
      hotelId, roomNumber,
      name: 'Bedside Lamps × 2',
      category: 'electronics',
      condition: s % 11 === 0 ? 'fair' : 'good',
      installedDate: isoDate(2019 + (s % 4), 4, 1),
      repairCount: s % 11 === 0 ? 1 : 0,
      totalRepairCost: s % 11 === 0 ? 28 : 0,
      replacementCost: 140,
      history: [
        ...(s % 11 === 0 ? [{ date: daysAgo(45 + (s % 90)), type: 'replacement' as const, description: 'One lamp shade replaced – cracked', cost: 28, technician: 'Maintenance Tech' }] : []),
        { date: isoDate(2019 + (s % 4), 4, 1), type: 'replacement', description: 'Lamps installed – room refresh', cost: 140, technician: 'FF&E Vendor' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-DRYER`,
      hotelId, roomNumber,
      name: 'Hair Dryer (wall-mount)',
      category: 'appliance',
      condition: s % 13 === 0 ? 'fair' : 'good',
      installedDate: isoDate(2018 + (s % 5), 6, 1),
      repairCount: s % 13 === 0 ? 1 : 0,
      totalRepairCost: s % 13 === 0 ? 38 : 0,
      replacementCost: 55,
      history: [
        ...(s % 13 === 0 ? [{ date: daysAgo(60 + (s % 100)), type: 'replacement' as const, description: 'Hair dryer replaced – overheating safety cutoff failing', cost: 38, technician: 'Maintenance Tech' }] : []),
        { date: isoDate(2018 + (s % 5), 6, 1), type: 'replacement', description: 'Wall-mount dryer installed', cost: 55, technician: 'Maintenance Tech' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-IRON`,
      hotelId, roomNumber,
      name: 'Iron & Ironing Board',
      category: 'appliance',
      condition: 'good',
      installedDate: isoDate(2020 + (s % 4), 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 85,
      history: [
        { date: isoDate(2020 + (s % 4), 4, 1), type: 'replacement', description: 'Iron & board set replaced – wear', cost: 85, technician: 'Housekeeping' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-CLOCK`,
      hotelId, roomNumber,
      name: 'Alarm Clock / Radio',
      category: 'electronics',
      condition: 'good',
      installedDate: isoDate(2020 + (s % 3), 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 35,
      history: [
        { date: isoDate(2020 + (s % 3), 4, 1), type: 'replacement', description: 'Clock replaced – brand standard update', cost: 35, technician: 'Housekeeping' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-EXHAUST`,
      hotelId, roomNumber,
      name: 'Bathroom Exhaust Fan',
      category: 'fixture',
      condition: s % 7 === 0 ? 'fair' : 'good',
      installedDate: isoDate(2016 + (s % 6), 4, 1),
      repairCount: s % 7 === 0 ? 1 : 0,
      totalRepairCost: s % 7 === 0 ? 65 : 0,
      replacementCost: 95,
      history: [
        ...(s % 7 === 0 ? [{ date: daysAgo(80 + (s % 120)), type: 'repair' as const, description: 'Fan bearing replaced – seized, mold risk', cost: 65, technician: 'Maintenance Tech' }] : []),
        { date: isoDate(2016 + (s % 6), 4, 1), type: 'replacement', description: 'Original installation', cost: 95, technician: 'Electrical Contractor' },
      ],
    },
    {
      id: `INV-${hotelId}-${roomNumber}-PHONE`,
      hotelId, roomNumber,
      name: 'Room Telephone',
      category: 'electronics',
      condition: 'good',
      installedDate: isoDate(2019 + (s % 3), 4, 1),
      repairCount: 0,
      totalRepairCost: 0,
      replacementCost: 48,
      history: [
        { date: isoDate(2019 + (s % 3), 4, 1), type: 'replacement', description: 'Phone replaced – system upgrade', cost: 48, technician: 'IT Vendor' },
      ],
    },
  ];
}

export function generateRoomAuditHistory(hotelId: string, roomNumber: string): AuditTask[] {
  const s = hash(`${hotelId}-${roomNumber}-aud`);

  const r1DaysAgo = 18 + (s % 38);
  const r1Score = 82 + (s % 16);
  const r1Date = daysAgo(r1DaysAgo);
  const r1Findings: string[] = [];
  if (r1Score < 90) r1Findings.push('Minor grout discoloration in shower corner');
  if (r1Score < 87) r1Findings.push('Ceiling light flickering – ballast showing age');
  if (r1Score < 85) r1Findings.push('Carpet shows wear near entry – flagged for next FF&E cycle');
  if (r1Score < 83) r1Findings.push('AC vent filter overdue for replacement');

  const r2DaysAgo = 92 + (s % 32);
  const r2Score = 82 + ((s + 7) % 16);
  const r2Date = daysAgo(r2DaysAgo);
  const r2Findings: string[] = [];
  if (r2Score < 90) r2Findings.push('Bathroom grout needs resealing – scheduled');
  if (r2Score < 87) r2Findings.push('Shower head showing early scale buildup');

  return [
    {
      id: `AUD-${hotelId}-${roomNumber}-R1`,
      hotelId, roomNumber,
      type: 'audit',
      title: 'Quarterly Room Inspection',
      scheduledDate: r1Date,
      completedDate: r1Date,
      status: r1Score >= 85 ? 'passed' : 'failed',
      score: r1Score,
      findings: r1Findings,
      assignedTo: 'Emma Johnson',
    },
    {
      id: `AUD-${hotelId}-${roomNumber}-R2`,
      hotelId, roomNumber,
      type: 'audit',
      title: 'Quarterly Room Inspection',
      scheduledDate: r2Date,
      completedDate: r2Date,
      status: r2Score >= 85 ? 'passed' : 'failed',
      score: r2Score,
      findings: r2Findings,
      assignedTo: 'Emma Johnson',
    },
  ];
}

function generateRoomsForHotel(hotelId: string, totalRooms: number): Room[] {
  const floors = Math.ceil(totalRooms / 16);
  const rooms: Room[] = [];
  for (let floor = 1; floor <= floors; floor++) {
    const perFloor = floor < floors ? 16 : totalRooms - (floors - 1) * 16;
    for (let n = 1; n <= perFloor; n++) {
      const roomNumber = `${floor}${n.toString().padStart(2, '0')}`;
      const seed = hash(`${hotelId}-${roomNumber}`);
      const roll = seed % 100;
      let status: RoomStatus, hkStatus: HkStatus;
      if (roll < 44)      { status = 'occupied';   hkStatus = 'clean'; }
      else if (roll < 63) { status = 'dirty';       hkStatus = 'dirty'; }
      else if (roll < 73) { status = 'inspecting';  hkStatus = 'clean'; }
      else if (roll < 87) { status = 'ready';       hkStatus = 'inspected'; }
      else if (roll < 94) { status = 'ooo';         hkStatus = 'dirty'; }
      else                { status = 'blocked';     hkStatus = 'dirty'; }
      const type: RoomType = n <= 8 ? 'King' : 'Queen';
      rooms.push({
        id: `${hotelId}-${roomNumber}`,
        hotelId,
        number: roomNumber,
        floor,
        type,
        status,
        hkStatus,
        lastCleaned: status !== 'ooo' ? '2026-04-25T08:30:00' : null,
        lastInspected: hkStatus === 'inspected' ? '2026-04-25T09:45:00' : null,
        hasOpenTicket: status === 'blocked',
        lastGuestRating: status === 'occupied' ? 3.6 + (seed % 14) / 10 : undefined,
      });
    }
  }
  return rooms;
}

// ─── SAVGW Room Overrides ─────────────────────────────────────────────────────

const SAVGW_OVERRIDES: Record<string, Partial<Room>> = {
  '109': { status: 'blocked', hkStatus: 'dirty', hasOpenTicket: true },
  '215': { status: 'ooo', hkStatus: 'dirty', hasOpenTicket: false, oooReason: 'Water damage – ceiling repair in progress' },
  '312': { status: 'blocked', hkStatus: 'dirty', hasOpenTicket: true },
  '315': { status: 'ooo', hkStatus: 'dirty', oooReason: 'Active repair – drywall work' },
  '411': { status: 'blocked', hkStatus: 'dirty', hasOpenTicket: true },
  '412': { status: 'ooo', hkStatus: 'dirty', oooReason: 'HVAC replacement in progress' },
  '508': { status: 'ooo', hkStatus: 'dirty', oooReason: 'Pest treatment – 72-hr quarantine' },
  '604': { status: 'ooo', hkStatus: 'dirty', oooReason: 'Full renovation – est. completion May 10' },
};

// ─── All Hotel Rooms ──────────────────────────────────────────────────────────

const _roomsByHotel: Record<string, Room[]> = {};
for (const hotel of HOTELS) {
  const base = generateRoomsForHotel(hotel.id, hotel.rooms);
  if (hotel.id === 'SAVGW') {
    _roomsByHotel[hotel.id] = base.map((r) => {
      const ov = SAVGW_OVERRIDES[r.number];
      return ov ? { ...r, ...ov } : r;
    });
  } else {
    _roomsByHotel[hotel.id] = base;
  }
}

export const ROOMS_BY_HOTEL = _roomsByHotel;
export const getRoomsForHotel = (hotelId: string): Room[] => ROOMS_BY_HOTEL[hotelId] ?? [];
export const getRoomByNumber = (hotelId: string, roomNumber: string): Room | undefined =>
  ROOMS_BY_HOTEL[hotelId]?.find((r) => r.number === roomNumber);

// ─── Maintenance Tickets ──────────────────────────────────────────────────────

export const MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'T001',
    hotelId: 'SAVGW',
    roomNumber: '109',
    type: 'reactive',
    priority: 'urgent',
    status: 'in_progress',
    title: 'AC not cooling – room at 78°F',
    description: 'Room 109 reported AC running continuously but room temperature is 78°F with thermostat set to 68°F. Unit is blowing air but no cold output.',
    reportedBy: 'Front Desk',
    assignedTo: 'Amir Lopez',
    createdAt: '2026-04-25T15:14:00',
    updatedAt: '2026-04-25T17:45:00',
    estimatedCost: 180,
    revenueLost: 189,
    activity: [
      { timestamp: '2026-04-25T17:45:00', actor: 'Amir Lopez', action: 'On the way', note: 'Have refrigerant kit and gauges, heading up now' },
      { timestamp: '2026-04-25T17:22:00', actor: 'Emma Johnson', action: 'Escalated to Urgent', note: 'Second call from room 109 in 2 hours' },
      { timestamp: '2026-04-25T16:30:00', actor: 'Amir Lopez', action: 'Acknowledged', note: 'Will check after finishing bathroom in 307' },
      { timestamp: '2026-04-25T15:14:00', actor: 'Front Desk', action: 'Ticket created', note: 'Room 109 called – AC running but room is hot' },
    ],
  },
  {
    id: 'T002',
    hotelId: 'SAVGW',
    roomNumber: '312',
    type: 'reactive',
    priority: 'urgent',
    status: 'open',
    title: 'Toilet backing up – water on floor',
    description: 'Room 312 toilet is backing up and overflowing. Guest was moved to room 314. Water on bathroom floor – risk of seeping into 212 below.',
    reportedBy: 'Front Desk',
    assignedTo: 'Sydney Rivera',
    createdAt: '2026-04-25T16:10:00',
    updatedAt: '2026-04-25T18:02:00',
    estimatedCost: 220,
    revenueLost: 189,
    activity: [
      { timestamp: '2026-04-25T18:02:00', actor: 'Emma Johnson', action: 'Escalated to Urgent', note: 'Water on floor, risk of damage to room 212' },
      { timestamp: '2026-04-25T17:30:00', actor: 'Front Desk', action: 'Updated', note: 'Guest moved to 314, original guest unhappy' },
      { timestamp: '2026-04-25T16:45:00', actor: 'Sydney Rivera', action: 'Assigned to Amir', note: 'Plumbing issue, Amir to handle when done with T001' },
      { timestamp: '2026-04-25T16:10:00', actor: 'Front Desk', action: 'Ticket created', note: 'Room 312 – toilet overflowing' },
    ],
  },
  {
    id: 'T003',
    hotelId: 'SAVMT',
    roomNumber: '421',
    type: 'reactive',
    priority: 'urgent',
    status: 'in_progress',
    title: 'Active water leak from ceiling',
    description: 'Room 421 has an active ceiling leak – water dripping near the window. Appears to originate from bathroom in 521. Leak pan placed.',
    reportedBy: 'Housekeeping',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-25T13:20:00',
    updatedAt: '2026-04-25T16:10:00',
    estimatedCost: 800,
    revenueLost: 195,
    activity: [
      { timestamp: '2026-04-25T16:10:00', actor: 'Maintenance Tech', action: 'In room', note: 'Confirmed source is wax ring failure in 521 – plumber called' },
      { timestamp: '2026-04-25T14:30:00', actor: 'GM', action: 'Updated', note: 'Room 421 and 521 both placed OOO. Plumber ETA 5pm' },
      { timestamp: '2026-04-25T13:20:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Water dripping from ceiling when cleaning 421' },
    ],
  },
  {
    id: 'T004',
    hotelId: 'BQKCY',
    area: 'North Elevator',
    type: 'reactive',
    priority: 'urgent',
    status: 'escalated',
    title: 'Elevator out of service – guests affected',
    description: 'North elevator stopped between floors 2 and 3. Manual reset failed. Guests unable to use elevator. One mobility-impaired guest being assisted via staff escort.',
    reportedBy: 'Front Desk',
    assignedTo: 'KONE Service',
    createdAt: '2026-04-25T12:40:00',
    updatedAt: '2026-04-25T14:30:00',
    estimatedCost: 2400,
    revenueLost: 0,
    activity: [
      { timestamp: '2026-04-25T14:30:00', actor: 'GM (Courtyard)', action: 'Updated', note: 'KONE tech on site – motor relay failed, part being sourced, ETA 6pm' },
      { timestamp: '2026-04-25T13:45:00', actor: 'Gautham Shetty', action: 'Escalated', note: 'Escalated to regional – liability risk with mobility-impaired guest' },
      { timestamp: '2026-04-25T13:15:00', actor: 'Maintenance Sup', action: 'Updated', note: 'Called KONE – parts needed, 4-6 hr window' },
      { timestamp: '2026-04-25T12:40:00', actor: 'Front Desk', action: 'Ticket created', note: 'Elevator stopped between floors, reset failed' },
    ],
  },
  {
    id: 'T005',
    hotelId: 'SAVFP',
    roomNumber: '234',
    type: 'escalation',
    priority: 'urgent',
    status: 'escalated',
    title: 'Recurring HVAC failure – 3rd breakdown in 90 days',
    description: 'HVAC unit in room 234 has failed again. This is the 3rd breakdown since Jan 18. Compressor appears to be failing. Total repair spend now $2,200 vs $3,400 replacement cost. Capital approval requested.',
    reportedBy: 'GM (Fairfield/TPS)',
    assignedTo: 'Gautham Shetty',
    createdAt: '2026-04-25T08:45:00',
    updatedAt: '2026-04-25T10:00:00',
    estimatedCost: 850,
    revenueLost: 185,
    activity: [
      { timestamp: '2026-04-25T10:00:00', actor: 'Gautham Shetty', action: 'Escalated to MD', note: 'Third failure in 90 days – requesting capital approval for unit replacement ($3,400)' },
      { timestamp: '2026-04-25T09:30:00', actor: 'GM (Fairfield)', action: 'Updated', note: 'Tech confirmed compressor failing again – same root cause as March ticket' },
      { timestamp: '2026-04-25T08:45:00', actor: 'Front Desk', action: 'Ticket created', note: 'Room 234 – HVAC not working again' },
    ],
  },
  {
    id: 'T006',
    hotelId: 'SAVGW',
    roomNumber: '411',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Window lock mechanism broken – security risk',
    description: 'Window lock in room 411 is broken. Window cannot be properly secured. Room has been blocked per security policy until repaired.',
    reportedBy: 'Housekeeping',
    assignedTo: 'Amir Lopez',
    createdAt: '2026-04-25T10:30:00',
    updatedAt: '2026-04-25T10:30:00',
    estimatedCost: 75,
    activity: [
      { timestamp: '2026-04-25T10:30:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Found broken lock during morning inspection of 411' },
    ],
  },
  {
    id: 'T007',
    hotelId: 'SAVVY',
    roomNumber: '312',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Bathroom exhaust fan seized – mold risk',
    description: 'Exhaust fan in room 312 bathroom is not spinning – seized bearing. Without ventilation, mold risk increases. Immediate repair needed.',
    reportedBy: 'Housekeeping',
    createdAt: '2026-04-25T09:15:00',
    updatedAt: '2026-04-25T09:15:00',
    estimatedCost: 95,
    activity: [
      { timestamp: '2026-04-25T09:15:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Fan not working during morning turndown' },
    ],
  },
  {
    id: 'T008',
    hotelId: 'GA989',
    roomNumber: '118',
    type: 'reactive',
    priority: 'high',
    status: 'in_progress',
    title: 'Shower head broken – low pressure / spray malfunction',
    description: 'Shower head in 118 is cracked and only producing a trickle. Guest complaint yesterday. Replacement part on hand.',
    reportedBy: 'Guest Complaint',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-24T19:30:00',
    updatedAt: '2026-04-25T11:00:00',
    estimatedCost: 45,
    activity: [
      { timestamp: '2026-04-25T11:00:00', actor: 'Maintenance Tech', action: 'In progress', note: 'Replacing shower head, have replacement part' },
      { timestamp: '2026-04-24T19:30:00', actor: 'Front Desk', action: 'Ticket created', note: 'Guest called – shower barely working' },
    ],
  },
  {
    id: 'T009',
    hotelId: 'RISAV',
    roomNumber: '203',
    type: 'reactive',
    priority: 'high',
    status: 'pending_part',
    title: 'Television will not power on',
    description: '65" TV in room 203 is completely dead – no power. Board replacement needed. Part ordered, ETA 2 business days.',
    reportedBy: 'Guest Complaint',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-23T14:00:00',
    updatedAt: '2026-04-25T09:00:00',
    estimatedCost: 280,
    activity: [
      { timestamp: '2026-04-25T09:00:00', actor: 'Maintenance Tech', action: 'Pending part', note: 'Main board ordered from Samsung – ETA Apr 27' },
      { timestamp: '2026-04-24T10:00:00', actor: 'Maintenance Tech', action: 'Diagnosed', note: 'Main board failure – not repairable, part ordered' },
      { timestamp: '2026-04-23T14:00:00', actor: 'Front Desk', action: 'Ticket created', note: 'Guest reported TV dead' },
    ],
  },
  {
    id: 'T010',
    hotelId: 'BSWVE',
    area: 'Pool Deck',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Pool heater offline – water temperature 58°F',
    description: 'Pool heater failed overnight. Water temperature dropped to 58°F (target 82°F). Pool closed to guests. Vendor called – heat exchanger failure suspected.',
    reportedBy: 'Maintenance Supervisor',
    createdAt: '2026-04-25T06:45:00',
    updatedAt: '2026-04-25T06:45:00',
    estimatedCost: 1800,
    activity: [
      { timestamp: '2026-04-25T06:45:00', actor: 'Maintenance Sup', action: 'Ticket created', note: 'Pool heater offline, closed pool. Vendor coming today.' },
    ],
  },
  {
    id: 'T011',
    hotelId: 'SAVMD',
    roomNumber: '508',
    type: 'preventive',
    priority: 'high',
    status: 'in_progress',
    title: 'HVAC filter replacement – 14 days overdue',
    description: 'HVAC filters on floor 5 are 14 days past replacement schedule. Airflow reduction detected in guest room readings. Completing today.',
    reportedBy: 'PM Schedule',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-11T08:00:00',
    updatedAt: '2026-04-25T14:00:00',
    activity: [
      { timestamp: '2026-04-25T14:00:00', actor: 'Maintenance Tech', action: 'In progress', note: 'Replacing floor 5 filters now – 3 units done, 5 remaining' },
      { timestamp: '2026-04-11T08:00:00', actor: 'PM Schedule', action: 'Task generated', note: 'Quarterly HVAC filter replacement due' },
    ],
  },
  {
    id: 'T012',
    hotelId: 'JAXTX',
    roomNumber: '204',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Sliding door off track – cannot fully close',
    description: 'Sliding balcony door in room 204 has jumped the track and cannot close completely. Security concern – room cannot be sold until fixed.',
    reportedBy: 'Housekeeping',
    createdAt: '2026-04-25T11:20:00',
    updatedAt: '2026-04-25T11:20:00',
    estimatedCost: 85,
    activity: [
      { timestamp: '2026-04-25T11:20:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Found during AM inspection – door off track' },
    ],
  },
  {
    id: 'T013',
    hotelId: 'DFWFW',
    roomNumber: '115',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Kitchen dishwasher not draining – suite',
    description: 'Suite 115 dishwasher is not draining – standing water in basin. Likely clogged drain or pump failure. Room blocked until resolved.',
    reportedBy: 'Housekeeping',
    createdAt: '2026-04-25T10:00:00',
    updatedAt: '2026-04-25T10:00:00',
    estimatedCost: 120,
    activity: [
      { timestamp: '2026-04-25T10:00:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Standing water in dishwasher during AM check' },
    ],
  },
  {
    id: 'T014',
    hotelId: 'SAVGW',
    roomNumber: '203',
    type: 'reactive',
    priority: 'normal',
    status: 'in_progress',
    title: 'Ceiling light fixture flickering',
    description: 'Main ceiling light in room 203 is flickering intermittently. Likely loose connection or failing ballast. Room occupied – fixing during guest outing.',
    reportedBy: 'Guest Complaint',
    assignedTo: 'Amir Lopez',
    createdAt: '2026-04-24T21:00:00',
    updatedAt: '2026-04-25T14:30:00',
    estimatedCost: 40,
    activity: [
      { timestamp: '2026-04-25T14:30:00', actor: 'Amir Lopez', action: 'In progress', note: 'Guest is out – checking ballast now' },
      { timestamp: '2026-04-24T21:00:00', actor: 'Front Desk', action: 'Ticket created', note: 'Guest called about flickering light' },
    ],
  },
  {
    id: 'T015',
    hotelId: 'SAVGW',
    roomNumber: '405',
    type: 'reactive',
    priority: 'normal',
    status: 'open',
    title: 'Shower drain slow – guest complaint',
    description: 'Shower drain in room 405 is draining very slowly. Guest mentioned standing water during shower. Needs snaking or clog removal.',
    reportedBy: 'Guest Complaint',
    createdAt: '2026-04-25T08:00:00',
    updatedAt: '2026-04-25T08:00:00',
    estimatedCost: 30,
    activity: [
      { timestamp: '2026-04-25T08:00:00', actor: 'Front Desk', action: 'Ticket created', note: 'Guest at checkout mentioned slow drain in 405' },
    ],
  },
  {
    id: 'T016',
    hotelId: 'BQKFP',
    area: 'HVAC System',
    type: 'preventive',
    priority: 'normal',
    status: 'scheduled',
    title: 'Quarterly HVAC system servicing',
    description: 'Scheduled quarterly service for all HVAC units. Includes filter replacement, coil cleaning, refrigerant check, and belt inspection.',
    reportedBy: 'PM Schedule',
    assignedTo: 'HVAC Vendor',
    createdAt: '2026-04-20T08:00:00',
    updatedAt: '2026-04-20T08:00:00',
    activity: [
      { timestamp: '2026-04-20T08:00:00', actor: 'PM Schedule', action: 'Task scheduled', note: 'Quarterly service – vendor scheduled Apr 28' },
    ],
  },
  {
    id: 'T017',
    hotelId: 'GAA84',
    area: 'Building-wide',
    type: 'audit',
    priority: 'normal',
    status: 'scheduled',
    title: 'Quarterly fire safety inspection',
    description: 'Annual fire safety audit covering extinguishers, sprinkler heads, exit signage, smoke detectors, and emergency lighting.',
    reportedBy: 'Compliance Schedule',
    assignedTo: 'Fire Safety Inspector',
    createdAt: '2026-04-15T08:00:00',
    updatedAt: '2026-04-15T08:00:00',
    activity: [
      { timestamp: '2026-04-15T08:00:00', actor: 'Compliance', action: 'Task scheduled', note: 'Annual fire safety inspection – Apr 29' },
    ],
  },
  {
    id: 'T018',
    hotelId: 'SGJES',
    roomNumber: '301',
    type: 'reactive',
    priority: 'normal',
    status: 'open',
    title: 'TV remote not functional',
    description: 'TV remote in room 301 is unresponsive. Batteries replaced – still not working. Remote needs replacement.',
    reportedBy: 'Housekeeping',
    createdAt: '2026-04-25T09:45:00',
    updatedAt: '2026-04-25T09:45:00',
    estimatedCost: 18,
    activity: [
      { timestamp: '2026-04-25T09:45:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Remote dead even with new batteries' },
    ],
  },
  {
    id: 'T019',
    hotelId: 'BTRCI',
    roomNumber: '118',
    type: 'reactive',
    priority: 'normal',
    status: 'open',
    title: 'Deadbolt stiff – requires excessive force',
    description: 'Deadbolt in room 118 requires significant force to turn. Mechanism may need lubrication or replacement. Minor security concern.',
    reportedBy: 'Housekeeping',
    createdAt: '2026-04-25T10:15:00',
    updatedAt: '2026-04-25T10:15:00',
    estimatedCost: 25,
    activity: [
      { timestamp: '2026-04-25T10:15:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Deadbolt very stiff during AM check' },
    ],
  },
  {
    id: 'T020',
    hotelId: '58090LA',
    roomNumber: '205',
    type: 'reactive',
    priority: 'high',
    status: 'open',
    title: 'Bathroom light switch sparking – electrical hazard',
    description: 'Guest reported light switch in bathroom sparking when toggled. Room blocked immediately. Likely worn contacts or water ingress.',
    reportedBy: 'Guest Complaint',
    createdAt: '2026-04-25T07:30:00',
    updatedAt: '2026-04-25T07:30:00',
    estimatedCost: 65,
    revenueLost: 115,
    activity: [
      { timestamp: '2026-04-25T07:30:00', actor: 'Front Desk', action: 'Ticket created', note: 'Guest reported sparking switch – room blocked for safety' },
    ],
  },
  {
    id: 'T021',
    hotelId: 'SAVVY',
    roomNumber: '101',
    type: 'preventive',
    priority: 'normal',
    status: 'scheduled',
    title: 'Annual mattress rotation – Room 101',
    description: 'Annual mattress rotation and inspection per brand standards. Check for wear, staining, and structural integrity.',
    reportedBy: 'PM Schedule',
    assignedTo: 'Housekeeping',
    createdAt: '2026-04-22T08:00:00',
    updatedAt: '2026-04-22T08:00:00',
    activity: [
      { timestamp: '2026-04-22T08:00:00', actor: 'PM Schedule', action: 'Task scheduled', note: 'Annual mattress rotation – scheduled Apr 28' },
    ],
  },
  {
    id: 'T022',
    hotelId: 'RISAV',
    area: 'Hotel-wide',
    type: 'audit',
    priority: 'normal',
    status: 'in_progress',
    title: 'Marriott brand standards audit',
    description: 'Annual Marriott brand standards audit underway. Covers guest room quality, public spaces, F&B, and brand compliance. Day 2 of 3.',
    reportedBy: 'Marriott Corporate',
    assignedTo: 'GM',
    createdAt: '2026-04-24T09:00:00',
    updatedAt: '2026-04-25T09:00:00',
    activity: [
      { timestamp: '2026-04-25T09:00:00', actor: 'GM', action: 'Day 2 update', note: 'Guest rooms passed – public areas and F&B today' },
      { timestamp: '2026-04-24T09:00:00', actor: 'Marriott Corporate', action: 'Audit started', note: 'Annual brand standards audit – 3-day inspection' },
    ],
  },
  {
    id: 'T023',
    hotelId: 'SAVMT',
    roomNumber: '312',
    type: 'reactive',
    priority: 'normal',
    status: 'resolved',
    title: 'Running toilet – resolved',
    description: 'Toilet in room 312 was running continuously. Fill valve replaced. Verified resolved.',
    reportedBy: 'Housekeeping',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-24T11:00:00',
    updatedAt: '2026-04-24T14:30:00',
    estimatedCost: 35,
    activity: [
      { timestamp: '2026-04-24T14:30:00', actor: 'Maintenance Tech', action: 'Resolved', note: 'Fill valve replaced – verified no more running' },
      { timestamp: '2026-04-24T11:00:00', actor: 'Housekeeping', action: 'Ticket created', note: 'Toilet running non-stop in 312' },
    ],
  },
  {
    id: 'T024',
    hotelId: 'DFWFW',
    area: 'Pool',
    type: 'preventive',
    priority: 'normal',
    status: 'resolved',
    title: 'Pool chemical balance check – completed',
    description: 'Bi-weekly pool chemical balance check. pH 7.5, chlorine 2.8ppm – both within target range. All clear.',
    reportedBy: 'PM Schedule',
    assignedTo: 'Maintenance Tech',
    createdAt: '2026-04-24T07:00:00',
    updatedAt: '2026-04-24T08:30:00',
    activity: [
      { timestamp: '2026-04-24T08:30:00', actor: 'Maintenance Tech', action: 'Completed', note: 'pH 7.5, chlorine 2.8 – within range' },
      { timestamp: '2026-04-24T07:00:00', actor: 'PM Schedule', action: 'Task due', note: 'Bi-weekly pool check' },
    ],
  },
  {
    id: 'T025',
    hotelId: 'GA989',
    roomNumber: '118',
    type: 'audit',
    priority: 'normal',
    status: 'scheduled',
    title: 'Post-repair QA inspection – Room 118',
    description: 'QA inspection of room 118 following shower head replacement to verify repair quality and overall room readiness.',
    reportedBy: 'Quality Assurance',
    assignedTo: 'Emma Johnson',
    createdAt: '2026-04-25T11:00:00',
    updatedAt: '2026-04-25T11:00:00',
    activity: [
      { timestamp: '2026-04-25T11:00:00', actor: 'QA', action: 'Inspection scheduled', note: 'Post-repair check after T008 resolved' },
    ],
  },
];

// ─── Audit Tasks ──────────────────────────────────────────────────────────────

export const AUDIT_TASKS: AuditTask[] = [
  {
    id: 'A001',
    hotelId: 'SAVGW',
    roomNumber: '312',
    type: 'audit',
    title: 'Room Deep Inspection',
    scheduledDate: '2026-04-20',
    completedDate: '2026-04-20',
    status: 'passed',
    score: 88,
    findings: ['Minor grout discoloration in shower corner', 'Toilet mechanism showing age-related wear'],
    assignedTo: 'Emma Johnson',
  },
  {
    id: 'A002',
    hotelId: 'SAVGW',
    roomNumber: '109',
    type: 'audit',
    title: 'Quarterly Room Inspection',
    scheduledDate: '2026-04-18',
    completedDate: '2026-04-18',
    status: 'passed',
    score: 92,
    findings: ['AC unit showing age – recommend monitoring for cooling efficiency'],
    assignedTo: 'Emma Johnson',
  },
  {
    id: 'A003',
    hotelId: 'SAVGW',
    area: 'Floors 1–3',
    type: 'preventive',
    title: 'HVAC Filter Replacement – Floors 1–3',
    scheduledDate: '2026-04-25',
    status: 'scheduled',
    assignedTo: 'Amir Lopez',
  },
  {
    id: 'A004',
    hotelId: 'SAVGW',
    area: 'Floors 4–6',
    type: 'preventive',
    title: 'HVAC Filter Replacement – Floors 4–6',
    scheduledDate: '2026-04-28',
    status: 'scheduled',
    assignedTo: 'Amir Lopez',
  },
  {
    id: 'A005',
    hotelId: 'SAVGW',
    roomNumber: '412',
    type: 'audit',
    title: 'Pre-renovation Assessment',
    scheduledDate: '2026-04-22',
    completedDate: '2026-04-22',
    status: 'passed',
    score: 95,
    findings: [],
    assignedTo: 'Sydney Rivera',
  },
  {
    id: 'A006',
    hotelId: 'SAVMT',
    area: 'Hotel-wide',
    type: 'audit',
    title: 'Hilton Brand Standards Audit',
    scheduledDate: '2026-05-01',
    status: 'scheduled',
    assignedTo: 'GM (Hilton Garden Midtown)',
  },
  {
    id: 'A007',
    hotelId: 'SAVFP',
    roomNumber: '234',
    type: 'audit',
    title: 'Post-repair Inspection (3rd HVAC)',
    scheduledDate: '2026-04-26',
    status: 'scheduled',
    assignedTo: 'Sydney Rivera',
  },
  {
    id: 'A008',
    hotelId: 'GA989',
    area: 'Hotel-wide',
    type: 'audit',
    title: 'Choice Hotels QA Inspection',
    scheduledDate: '2026-04-30',
    status: 'in_progress',
    assignedTo: 'QA Inspector',
  },
  {
    id: 'A009',
    hotelId: 'BQKCY',
    area: 'Common Areas',
    type: 'audit',
    title: 'Life Safety Systems Inspection',
    scheduledDate: '2026-04-23',
    completedDate: '2026-04-23',
    status: 'passed',
    score: 96,
    findings: [],
    assignedTo: 'Fire Safety Inspector',
  },
  {
    id: 'A010',
    hotelId: 'BSWVE',
    area: 'Pool & Spa',
    type: 'preventive',
    title: 'Pool & Spa Quarterly Check',
    scheduledDate: '2026-04-24',
    completedDate: '2026-04-24',
    status: 'failed',
    findings: ['Pool heater inoperative – heat exchanger failure', 'Pool pH at 8.2 (target 7.4–7.6)'],
    assignedTo: 'Pool Vendor',
  },
];

// ─── Room Inventory ───────────────────────────────────────────────────────────

export const ROOM_INVENTORY: RoomInventoryItem[] = [
  {
    id: 'INV-SAVGW-109-AC',
    hotelId: 'SAVGW',
    roomNumber: '109',
    name: 'AC Unit (Carrier 2.5 Ton)',
    category: 'appliance',
    condition: 'fair',
    installedDate: '2018-03-12',
    lastServiceDate: '2026-04-25',
    repairCount: 2,
    totalRepairCost: 290,
    replacementCost: 2800,
    history: [
      { date: '2026-04-25', type: 'repair', description: 'Refrigerant recharge – low coolant causing poor cooling', cost: 180, technician: 'Amir Lopez' },
      { date: '2025-08-14', type: 'repair', description: 'Capacitor replaced – unit failing to start', cost: 110, technician: 'HVAC Vendor' },
      { date: '2025-01-10', type: 'inspection', description: 'Annual HVAC check – operational, showing age-related wear', technician: 'Sydney Rivera' },
    ],
  },
  {
    id: 'INV-SAVGW-109-TV',
    hotelId: 'SAVGW',
    roomNumber: '109',
    name: '55" Smart TV (Samsung)',
    category: 'electronics',
    condition: 'good',
    installedDate: '2022-06-15',
    repairCount: 0,
    totalRepairCost: 0,
    replacementCost: 650,
    history: [
      { date: '2022-06-15', type: 'replacement', description: 'New installation – room refresh', cost: 650, technician: 'AV Vendor' },
    ],
  },
  {
    id: 'INV-SAVGW-312-TOILET',
    hotelId: 'SAVGW',
    roomNumber: '312',
    name: 'Toilet Assembly (Kohler)',
    category: 'fixture',
    condition: 'poor',
    installedDate: '2016-04-01',
    lastServiceDate: '2026-04-25',
    repairCount: 3,
    totalRepairCost: 380,
    replacementCost: 420,
    history: [
      { date: '2026-04-25', type: 'repair', description: 'Overflow investigation – backing up, plumbing inspection', cost: 120, technician: 'Amir Lopez' },
      { date: '2026-01-22', type: 'repair', description: 'Flapper valve and fill valve replaced', cost: 85, technician: 'Amir Lopez' },
      { date: '2025-03-18', type: 'repair', description: 'Constant running – worn flapper replaced', cost: 90, technician: 'Amir Lopez' },
      { date: '2024-07-10', type: 'complaint', description: 'Guest reported running water sound throughout night', technician: 'Rosa Martinez' },
      { date: '2023-11-05', type: 'repair', description: 'Wax ring seal replaced – minor leak detected', cost: 85, technician: 'Plumbing Vendor' },
    ],
  },
  {
    id: 'INV-SAVGW-312-SHOWER',
    hotelId: 'SAVGW',
    roomNumber: '312',
    name: 'Shower/Tub Surround',
    category: 'fixture',
    condition: 'fair',
    installedDate: '2016-04-01',
    lastServiceDate: '2025-09-12',
    repairCount: 1,
    totalRepairCost: 180,
    replacementCost: 1200,
    history: [
      { date: '2025-09-12', type: 'repair', description: 'Grout resealing – mildew detected in corner joints', cost: 180, technician: 'Tile Vendor' },
      { date: '2024-03-01', type: 'inspection', description: 'Brand audit – minor grout discoloration noted', technician: 'Emma Johnson' },
    ],
  },
  {
    id: 'INV-SAVGW-312-AC',
    hotelId: 'SAVGW',
    roomNumber: '312',
    name: 'AC Unit (Carrier 2.5 Ton)',
    category: 'appliance',
    condition: 'good',
    installedDate: '2020-07-15',
    lastServiceDate: '2025-11-08',
    repairCount: 0,
    totalRepairCost: 0,
    replacementCost: 2800,
    history: [
      { date: '2025-11-08', type: 'inspection', description: 'Annual HVAC check – passed, no issues found', technician: 'Sydney Rivera' },
      { date: '2020-07-15', type: 'replacement', description: 'New unit installed – replaced aging 2012 unit', cost: 2800, technician: 'HVACo Inc.' },
    ],
  },
  {
    id: 'INV-SAVGW-411-WINDOW',
    hotelId: 'SAVGW',
    roomNumber: '411',
    name: 'Window Assembly (Double Pane)',
    category: 'fixture',
    condition: 'poor',
    installedDate: '2012-06-01',
    lastServiceDate: '2026-04-25',
    repairCount: 1,
    totalRepairCost: 75,
    replacementCost: 600,
    history: [
      { date: '2026-04-25', type: 'repair', description: 'Lock mechanism broken – cannot secure window', cost: 75, technician: 'Amir Lopez' },
      { date: '2024-06-20', type: 'inspection', description: 'Annual safety check – window operation noted as stiff', technician: 'Sydney Rivera' },
      { date: '2022-11-15', type: 'inspection', description: 'Brand audit walkthrough – passed', technician: 'Emma Johnson' },
    ],
  },
  {
    id: 'INV-SAVGW-411-BED',
    hotelId: 'SAVGW',
    roomNumber: '411',
    name: 'King Bed Frame',
    category: 'furniture',
    condition: 'good',
    installedDate: '2019-03-01',
    repairCount: 0,
    totalRepairCost: 0,
    replacementCost: 800,
    history: [
      { date: '2019-03-01', type: 'replacement', description: 'New bed frame installed – room refresh program', cost: 800, technician: 'FF&E Vendor' },
    ],
  },
  {
    id: 'INV-BQKCY-ELEVATOR',
    hotelId: 'BQKCY',
    roomNumber: 'N/A',
    name: 'North Elevator (KONE)',
    category: 'appliance',
    condition: 'poor',
    installedDate: '2009-01-15',
    lastServiceDate: '2026-04-25',
    repairCount: 4,
    totalRepairCost: 12880,
    replacementCost: 45000,
    history: [
      { date: '2026-04-25', type: 'repair', description: 'Unit stopped between floors – motor relay failure (active)', technician: 'KONE Service' },
      { date: '2025-11-12', type: 'repair', description: 'Door sensor replacement – doors not closing properly', cost: 2100, technician: 'KONE Service' },
      { date: '2025-03-08', type: 'repair', description: 'Motor overhaul – excessive vibration', cost: 4800, technician: 'KONE Service' },
      { date: '2024-09-05', type: 'repair', description: 'Cable tension adjustment', cost: 580, technician: 'KONE Service' },
      { date: '2022-04-20', type: 'inspection', description: 'Annual elevator inspection – passed', technician: 'State Inspector' },
      { date: '2009-01-15', type: 'replacement', description: 'Original installation', cost: 38000, technician: 'KONE Inc.' },
    ],
  },
  {
    id: 'INV-SAVFP-234-HVAC',
    hotelId: 'SAVFP',
    roomNumber: '234',
    name: 'HVAC Unit (Carrier 3 Ton)',
    category: 'appliance',
    condition: 'condemned',
    installedDate: '2015-06-10',
    lastServiceDate: '2026-04-25',
    repairCount: 3,
    totalRepairCost: 2200,
    replacementCost: 3400,
    history: [
      { date: '2026-04-25', type: 'repair', description: 'Compressor failure – refrigerant leak, active escalation (3rd breakdown)', cost: 850, technician: 'HVAC Vendor' },
      { date: '2026-03-04', type: 'repair', description: 'Compressor contactor failure', cost: 680, technician: 'HVAC Vendor' },
      { date: '2026-01-18', type: 'repair', description: 'Refrigerant recharge + coil cleaning', cost: 670, technician: 'HVAC Vendor' },
      { date: '2025-11-20', type: 'inspection', description: 'Pre-winter HVAC check – unusual compressor wear noted', technician: 'Sydney Rivera' },
    ],
  },
  {
    id: 'INV-BSWVE-POOL-HEATER',
    hotelId: 'BSWVE',
    roomNumber: 'N/A',
    name: 'Pool Heater (Hayward 400k BTU)',
    category: 'appliance',
    condition: 'poor',
    installedDate: '2018-05-01',
    lastServiceDate: '2026-04-24',
    repairCount: 2,
    totalRepairCost: 3100,
    replacementCost: 8500,
    history: [
      { date: '2026-04-24', type: 'repair', description: 'Heat exchanger failure – pool offline, vendor dispatched', technician: 'Pool Vendor' },
      { date: '2025-07-15', type: 'repair', description: 'Thermostat and igniter replacement', cost: 1600, technician: 'Pool Vendor' },
      { date: '2024-10-20', type: 'repair', description: 'Heat exchanger partial blockage – cleaned and descaled', cost: 1500, technician: 'Pool Vendor' },
      { date: '2023-05-10', type: 'inspection', description: 'Seasonal startup check – operational', technician: 'Pool Vendor' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getActiveTicketsForHotel(hotelId: string): MaintenanceTicket[] {
  return MAINTENANCE_TICKETS.filter(
    (t) => t.hotelId === hotelId && t.status !== 'resolved',
  );
}

export function getActiveTicketsForRoom(hotelId: string, roomNumber: string): MaintenanceTicket[] {
  return MAINTENANCE_TICKETS.filter(
    (t) => t.hotelId === hotelId && t.roomNumber === roomNumber && t.status !== 'resolved',
  );
}

export function getAuditTasksForHotel(hotelId: string): AuditTask[] {
  return AUDIT_TASKS.filter((a) => a.hotelId === hotelId);
}

export function getInventoryForRoom(hotelId: string, roomNumber: string): RoomInventoryItem[] {
  const hardcoded = ROOM_INVENTORY.filter((i) => i.hotelId === hotelId && i.roomNumber === roomNumber);
  return hardcoded.length > 0 ? hardcoded : generateRoomInventory(hotelId, roomNumber);
}

export function getAuditHistoryForRoom(hotelId: string, roomNumber: string): AuditTask[] {
  const hardcoded = AUDIT_TASKS.filter(
    (a) => a.hotelId === hotelId && a.roomNumber === roomNumber && (a.status === 'passed' || a.status === 'failed'),
  );
  return hardcoded.length > 0 ? hardcoded : generateRoomAuditHistory(hotelId, roomNumber);
}

export function getInventoryItemById(itemId: string): RoomInventoryItem | undefined {
  const hardcoded = ROOM_INVENTORY.find((i) => i.id === itemId);
  if (hardcoded) return hardcoded;
  // Parse generated ID: INV-{hotelId}-{roomNumber}-{SUFFIX}
  const match = itemId.match(/^INV-(.+?)-(\d+[A-Za-z]*)-([A-Z]+)$/);
  if (!match) return undefined;
  const [, hotelId, roomNumber] = match;
  return generateRoomInventory(hotelId, roomNumber).find((i) => i.id === itemId);
}

export function getPropertyOpsSummary(hotelId: string) {
  const rooms = getRoomsForHotel(hotelId);
  const tickets = MAINTENANCE_TICKETS.filter(
    (t) => t.hotelId === hotelId && t.status !== 'resolved',
  );
  const auditTasks = AUDIT_TASKS.filter((a) => a.hotelId === hotelId);
  const completed = auditTasks.filter((a) => a.status === 'passed' || a.status === 'failed');
  const passed = completed.filter((a) => a.status === 'passed');
  const auditPassRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 100;
  const lastAudit = auditTasks
    .filter((a) => a.completedDate)
    .sort((a, b) => (b.completedDate ?? '').localeCompare(a.completedDate ?? ''))[0];

  return {
    hotelId,
    readyRooms: rooms.filter((r) => r.status === 'ready').length,
    dirtyRooms: rooms.filter((r) => r.status === 'dirty').length,
    inspectingRooms: rooms.filter((r) => r.status === 'inspecting').length,
    oooRooms: rooms.filter((r) => r.status === 'ooo').length,
    blockedRooms: rooms.filter((r) => r.status === 'blocked').length,
    occupiedRooms: rooms.filter((r) => r.status === 'occupied').length,
    openTickets: tickets.length,
    urgentTickets: tickets.filter((t) => t.priority === 'urgent').length,
    auditPassRate,
    lastAuditDate: lastAudit?.completedDate ?? '2026-04-15',
  };
}
