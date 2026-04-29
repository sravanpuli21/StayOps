import { getRoomsForHotel } from './operations';
import { HOTELS } from './hotels';

// ─── Reference date ────────────────────────────────────────────────────────────

const REF_MS = new Date('2026-04-27T14:00:00Z').getTime();
const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

function daysAgo(days: number, offsetHours = 0): string {
  return new Date(REF_MS - days * MS_DAY - offsetHours * MS_HOUR).toISOString();
}
function hoursAgo(hours: number): string {
  return new Date(REF_MS - hours * MS_HOUR).toISOString();
}
function isoDate(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day, 10, 0, 0).toISOString();
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuditAreaId =
  | 'full_room'
  | 'bathroom'
  | 'hvac'
  | 'electrical'
  | 'plumbing'
  | 'bedding'
  | 'furniture'
  | 'safety';

export type AuditComplianceStatus = 'overdue' | 'due_soon' | 'current';

export interface AuditImage {
  id: string;
  url: string;
  caption: string;
  type: 'issue' | 'general';
}

export interface AreaAuditRecord {
  id: string;
  hotelId: string;
  roomNumber: string;
  areaId: AuditAreaId;
  auditorName: string;
  completedAt: string;
  score: number;
  result: 'pass' | 'fail' | 'needs_attention';
  findings: string[];
  images: AuditImage[];
  notes?: string;
}

export interface ItemReplacementRecord {
  date: string;
  itemName: string;
  type: 'repair' | 'replacement' | 'inspection';
  description: string;
  cost?: number;
  technician?: string;
}

export interface AreaStatus {
  areaId: AuditAreaId;
  lastAuditAt: string | null;
  nextDueAt: string | null;
  status: AuditComplianceStatus | 'never';
  lastScore: number | null;
  lastResult: 'pass' | 'fail' | 'needs_attention' | null;
  recordCount: number;
}

export interface RoomAuditSummary {
  hotelId: string;
  roomNumber: string;
  worstStatus: AuditComplianceStatus;
  overdueCount: number;
  dueSoonCount: number;
  areas: AreaStatus[];
}

export interface HotelAuditSummary {
  hotelId: string;
  totalRooms: number;
  overdueRooms: number;
  dueSoonRooms: number;
  currentRooms: number;
  compliancePct: number;
  overdueAreas: number;
}

// ─── Area definitions ──────────────────────────────────────────────────────────

export const AUDIT_AREA_DEFS: Record<AuditAreaId, {
  label: string;
  frequencyDays: number;
  frequencyLabel: string;
}> = {
  full_room:  { label: 'Full Room Inspection', frequencyDays: 90,  frequencyLabel: 'Quarterly' },
  bathroom:   { label: 'Bathroom',             frequencyDays: 90,  frequencyLabel: 'Quarterly' },
  hvac:       { label: 'HVAC / Climate',        frequencyDays: 90,  frequencyLabel: 'Quarterly' },
  electrical: { label: 'Electrical & Lighting', frequencyDays: 180, frequencyLabel: 'Semi-annual' },
  plumbing:   { label: 'Plumbing',              frequencyDays: 90,  frequencyLabel: 'Quarterly' },
  bedding:    { label: 'Bed & Linens',          frequencyDays: 30,  frequencyLabel: 'Monthly' },
  furniture:  { label: 'Furniture & Fixtures',  frequencyDays: 180, frequencyLabel: 'Semi-annual' },
  safety:     { label: 'Safety Equipment',      frequencyDays: 30,  frequencyLabel: 'Monthly' },
};

export const AUDIT_AREA_IDS: AuditAreaId[] = [
  'full_room', 'bathroom', 'hvac', 'electrical', 'plumbing', 'bedding', 'furniture', 'safety',
];

// ─── Data pools ────────────────────────────────────────────────────────────────

const AUDITORS = [
  'Emma Johnson', 'Sydney Rivera', 'Amir Lopez', 'Rosa Navarro',
  'Carlos Mendes', 'Priya Sharma', 'Dwayne Mitchell', 'Sarah Lee',
];

const FINDINGS: Record<AuditAreaId, string[]> = {
  full_room: [
    'Carpet shows wear near entry — flagged for next FF&E cycle',
    'Wall scuff near door frame — touch-up paint required',
    'Window seal showing condensation — glazier scheduled',
    'Room thermostat UI unresponsive — replaced',
    'Ceiling paint showing minor discoloration near AC vent',
    'Desk surface has minor lacquer chips — light sanding needed',
  ],
  bathroom: [
    'Grout discoloration in shower corner — deep clean scheduled',
    'Caulk seal around tub showing micro-cracks',
    'Exhaust fan operating below rated CFM',
    'Towel bar mounting loose — re-anchored during inspection',
    'Hot water response time >45s — building plumbing review needed',
    'Shower door bottom seal worn — replacement ordered',
  ],
  hvac: [
    'Filter replacement due — installed new filter',
    'Thermostat calibration off by +2°F — recalibrated',
    'PTAC coils cleaned — efficiency restored',
    'Condensate drain partially blocked — cleared',
    'Unit making intermittent clicking noise — monitoring',
    'Refrigerant level low — vendor recharge scheduled',
  ],
  electrical: [
    'Desk lamp bulb replaced (60W equiv LED)',
    'Nightstand outlet cover cracked — replaced',
    'Bathroom exhaust wiring connection verified',
    'Smoke detector battery replaced during inspection',
    'Bedside USB charger port non-functional — unit replaced',
    'Light switch plate scratched — cosmetic replacement noted',
  ],
  plumbing: [
    'Shower pressure adequate — 42 PSI confirmed',
    'Hot water temp within range — 118°F at fixture',
    'Toilet running intermittently — flapper replaced',
    'Under-sink P-trap shows minor mineral buildup — cleared',
    'Showerhead descaled and flow restored',
    'Shut-off valve exercised — operation confirmed',
  ],
  bedding: [
    'Mattress protector replaced — passed hygiene check',
    'Pillow inserts show compression — two replaced',
    'Duvet cover shows minor pilling — flagged for laundry audit',
    'Box spring support slat re-seated during inspection',
    'All linens passed visual and sniff check',
    'Mattress surface shows minor indentation — flip scheduled',
  ],
  furniture: [
    'Desk chair caster replaced — all five now functional',
    'Mirror mounting hardware re-tightened',
    'TV stand surface has minor scratch — noted for FF&E cycle',
    'Artwork hanging level verified and secured',
    'Dresser drawer track lubricated — operation smooth',
    'Luggage rack webbing worn on one strap — replaced',
  ],
  safety: [
    'Smoke detector tested — passed (79 dB)',
    'CO detector battery replaced — unit tested',
    'Sprinkler head clear of obstruction — confirmed',
    'Fire escape card updated to current map revision',
    'Emergency lighting tested — 90-min backup confirmed',
    'Door chain/deadbolt operation verified',
  ],
};

const IMAGE_CAPTIONS: Record<AuditAreaId, string[]> = {
  full_room:  ['General room overview', 'Entry area and carpet condition', 'Window and drapes condition', 'Wall condition near AC'],
  bathroom:   ['Shower grout condition', 'Sink and fixtures', 'Toilet and surrounding area', 'Exhaust fan and ceiling'],
  hvac:       ['PTAC unit exterior', 'Filter condition (pre-replacement)', 'Thermostat reading', 'Vent diffuser'],
  electrical: ['Outlet tester results', 'Desk lamp and fixture', 'Smoke detector tag', 'Bedside charging unit'],
  plumbing:   ['Under-sink cabinet', 'Shower pressure reading', 'Toilet mechanism', 'Showerhead condition'],
  bedding:    ['Mattress surface', 'Pillow condition and labeling', 'Linen pack inspection', 'Box spring visual'],
  furniture:  ['Desk and chair condition', 'Mirror and mounting', 'Dresser surface', 'Luggage rack'],
  safety:     ['Smoke detector test card', 'CO detector display', 'Sprinkler head clearance', 'Emergency card and door hardware'],
};

function makeImage(hotelId: string, roomNumber: string, areaId: string, recIdx: number, imgIdx: number, caption: string, type: 'issue' | 'general'): AuditImage {
  const seed = `hos-${hotelId}-${roomNumber}-${areaId}-r${recIdx}-i${imgIdx}`;
  return {
    id: `IMG-${seed}`,
    url: `https://picsum.photos/seed/${seed}/480/320`,
    caption,
    type,
  };
}

// ─── Record generation ─────────────────────────────────────────────────────────

export function getAreaAuditRecords(hotelId: string, roomNumber: string, areaId: AuditAreaId): AreaAuditRecord[] {
  const s = hash(`${hotelId}-${roomNumber}-${areaId}-recs`);
  const freq = AUDIT_AREA_DEFS[areaId].frequencyDays;
  const findingPool = FINDINGS[areaId];
  const captionPool = IMAGE_CAPTIONS[areaId];
  const records: AreaAuditRecord[] = [];

  // Generate 4-5 records going back through history
  const numRecords = 4 + (s % 2); // 4 or 5
  const lastDays = getLastAuditDaysAgo(hotelId, roomNumber, areaId);

  for (let i = 0; i < numRecords; i++) {
    const recSeed = hash(`${hotelId}-${roomNumber}-${areaId}-rec-${i}`);
    const daysOffset = lastDays + i * (freq + (recSeed % 10) - 5);
    const completedAt = i === 0
      ? (daysOffset <= 0 ? hoursAgo(2 + (s % 8)) : daysAgo(daysOffset, recSeed % 8))
      : daysAgo(daysOffset, recSeed % 8);

    const score = 78 + (recSeed % 20); // 78-97
    const result: AreaAuditRecord['result'] = score >= 88 ? 'pass' : score >= 80 ? 'needs_attention' : 'fail';

    // Findings: more findings when score is lower
    const maxFindings = score < 82 ? 3 : score < 88 ? 2 : score < 93 ? 1 : 0;
    const findings: string[] = [];
    for (let f = 0; f < maxFindings; f++) {
      const fi = (recSeed + f * 7) % findingPool.length;
      if (!findings.includes(findingPool[fi])) findings.push(findingPool[fi]);
    }

    // Images: attach images proportional to findings
    const imageCount = findings.length > 0 ? 1 + (recSeed % 2) : (recSeed % 3 === 0 ? 1 : 0);
    const images: AuditImage[] = [];
    for (let im = 0; im < imageCount; im++) {
      const capIdx = (recSeed + im * 3) % captionPool.length;
      const isIssue = findings.length > 0 && im === 0;
      images.push(makeImage(hotelId, roomNumber, areaId, i, im, captionPool[capIdx], isIssue ? 'issue' : 'general'));
    }

    const auditorIdx = (recSeed >> 3) % AUDITORS.length;

    records.push({
      id: `AUD-${hotelId}-${roomNumber}-${areaId}-${i}`,
      hotelId,
      roomNumber,
      areaId,
      auditorName: AUDITORS[auditorIdx],
      completedAt,
      score,
      result,
      findings,
      images,
    });
  }

  return records;
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function getLastAuditDaysAgo(hotelId: string, roomNumber: string, areaId: AuditAreaId): number {
  const s = hash(`${hotelId}-${roomNumber}-${areaId}-status`);
  const freq = AUDIT_AREA_DEFS[areaId].frequencyDays;
  const roll = s % 100;
  if (roll < 65) return 1 + (s % Math.max(1, freq - 15));
  if (roll < 87) return freq - 14 + (s % 14);
  return freq + 1 + (s % 45);
}

function computeAreaStatus(daysAgoVal: number, freq: number): AuditComplianceStatus {
  if (daysAgoVal > freq) return 'overdue';
  if (daysAgoVal > freq - 14) return 'due_soon';
  return 'current';
}

export function getRoomAuditSummary(hotelId: string, roomNumber: string): RoomAuditSummary {
  const areas: AreaStatus[] = AUDIT_AREA_IDS.map((areaId) => {
    const freq = AUDIT_AREA_DEFS[areaId].frequencyDays;
    const lastDays = getLastAuditDaysAgo(hotelId, roomNumber, areaId);
    const status = computeAreaStatus(lastDays, freq);
    const lastAt = daysAgo(lastDays);
    const nextAt = new Date(new Date(lastAt).getTime() + freq * MS_DAY).toISOString();
    const s = hash(`${hotelId}-${roomNumber}-${areaId}-recs`);
    const score = 78 + (s % 20);
    const result: AreaStatus['lastResult'] = score >= 88 ? 'pass' : score >= 80 ? 'needs_attention' : 'fail';
    return {
      areaId,
      lastAuditAt: lastAt,
      nextDueAt: nextAt,
      status,
      lastScore: score,
      lastResult: result,
      recordCount: 4 + (s % 2),
    };
  });

  const overdueCount = areas.filter((a) => a.status === 'overdue').length;
  const dueSoonCount = areas.filter((a) => a.status === 'due_soon').length;
  const worstStatus: AuditComplianceStatus =
    overdueCount > 0 ? 'overdue' : dueSoonCount > 0 ? 'due_soon' : 'current';

  return { hotelId, roomNumber, worstStatus, overdueCount, dueSoonCount, areas };
}

export function getHotelAuditSummary(hotelId: string): HotelAuditSummary {
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  const rooms = getRoomsForHotel(hotelId);
  let overdueRooms = 0, dueSoonRooms = 0, currentRooms = 0, overdueAreas = 0;

  for (const room of rooms) {
    const summary = getRoomAuditSummary(hotelId, room.number);
    if (summary.worstStatus === 'overdue') overdueRooms++;
    else if (summary.worstStatus === 'due_soon') dueSoonRooms++;
    else currentRooms++;
    overdueAreas += summary.overdueCount;
  }

  const totalRooms = hotel.rooms;
  const compliancePct = Math.round((currentRooms / totalRooms) * 100);
  return { hotelId, totalRooms, overdueRooms, dueSoonRooms, currentRooms, compliancePct, overdueAreas };
}

export function getPortfolioAuditStats() {
  const hotels = HOTELS;
  let totalRooms = 0, totalOverdue = 0, totalDueSoon = 0, totalCurrent = 0, totalOverdueAreas = 0;
  const hotelSummaries = hotels.map((h) => {
    const s = getHotelAuditSummary(h.id);
    totalRooms += s.totalRooms;
    totalOverdue += s.overdueRooms;
    totalDueSoon += s.dueSoonRooms;
    totalCurrent += s.currentRooms;
    totalOverdueAreas += s.overdueAreas;
    return s;
  });
  const compliancePct = Math.round((totalCurrent / totalRooms) * 100);
  return { totalRooms, totalOverdue, totalDueSoon, totalCurrent, totalOverdueAreas, compliancePct, hotelSummaries };
}

// ─── Item replacement history (pulls from inventory) ──────────────────────────

export function getRoomItemHistory(hotelId: string, roomNumber: string): ItemReplacementRecord[] {
  const s = hash(`${hotelId}-${roomNumber}-itemhist`);
  const records: ItemReplacementRecord[] = [];

  const ITEMS = [
    { name: 'PTAC / AC Unit',     repairs: ['Capacitor replaced', 'Refrigerant recharge', 'Fan motor replaced'], cost: [110, 160, 220] },
    { name: 'Television (65")',    repairs: ['HDMI board replaced', 'Remote replaced', 'Screen replaced'],         cost: [180, 12, 420] },
    { name: 'Mattress',            repairs: ['Mattress replaced', 'Protector replaced', 'Box spring inspected'],   cost: [1100, 35, 0] },
    { name: 'Toilet',              repairs: ['Flapper valve replaced', 'Fill valve replaced', 'Seat replaced'],    cost: [85, 65, 45] },
    { name: 'Showerhead',          repairs: ['Showerhead replaced', 'Flow restrictor cleaned', 'Cartridge replaced'], cost: [95, 0, 120] },
    { name: 'Desk Lamp',           repairs: ['Bulb replaced (LED)', 'Shade replaced', 'Cord replaced'],            cost: [8, 22, 35] },
  ];

  const numItems = 3 + (s % 3);
  for (let i = 0; i < numItems; i++) {
    const itemIdx = (s + i * 17) % ITEMS.length;
    const item = ITEMS[itemIdx];
    const numEvents = 1 + ((s + i) % 3);
    for (let e = 0; e < numEvents; e++) {
      const evSeed = hash(`${hotelId}-${roomNumber}-item-${i}-${e}`);
      const repairIdx = (evSeed) % item.repairs.length;
      const daysOffset = 30 + e * 90 + (evSeed % 60);
      const isReplacement = item.repairs[repairIdx].includes('replaced') && repairIdx === 0;
      records.push({
        date: daysAgo(daysOffset, evSeed % 12),
        itemName: item.name,
        type: isReplacement ? 'replacement' : 'repair',
        description: item.repairs[repairIdx],
        cost: item.cost[repairIdx] || undefined,
        technician: AUDITORS[(evSeed >> 2) % AUDITORS.length],
      });
    }
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}
