/**
 * Audits — room-wise.
 *
 *   Audit  →  Room[]  →  Area[]  →  Item[]
 *
 * A single-room audit (Room 315 FF&E) has rooms[].length === 1 with the
 * standard 10 areas inside. A floor-wide audit (Floor 2 remotes Rooms 201–212)
 * has rooms[].length === 12, each room with its own areas+items.
 *
 * Inventory connects only AFTER an item fails — when the user picks
 * "Use inventory item" on the failed-item action sheet.
 *
 * Photo/note rule: optional by default, required for fails / damaged /
 * borrowed-from-room / escalated / OOO.
 *
 * Familiarity rule: same person on same room/area when possible.
 */

export type AuditType =
  | 'room_ffe'
  | 'item'
  | 'lighting'
  | 'electronics'
  | 'bathroom'
  | 'public_area'
  | 'preventive_asset'
  | 'inventory';

export type AuditStatus = 'open' | 'in_progress' | 'completed' | 'overdue';
export type Condition = 'good' | 'fair' | 'poor' | 'damaged';
export type Action = 'none' | 'repair' | 'replace' | 'clean' | 'dispose' | 'reuse';
export type LifecycleDecision = 'keep' | 'repair' | 'replace' | 'reuse_elsewhere' | 'resale' | 'dispose' | 'mgmt_review';

export interface AuditItem {
  id: string;
  label: string;
  /* Inspection */
  present?: boolean;
  working?: boolean;
  condition?: Condition;
  action?: Action;
  /* Proof */
  note?: string;
  photoLabel?: string;
  /* Outcomes */
  ticketCreatedId?: string;
  lifecycleDecision?: LifecycleDecision;
  inventoryUsed?: { item: string; qty: number; source: string };
  oooRisk?: boolean;
}

export interface AuditArea {
  id: string;
  name: string;
  icon: 'enter-outline' | 'shirt-outline' | 'bed-outline' | 'tv-outline' | 'briefcase-outline' | 'snow-outline' | 'water-outline' | 'bulb-outline' | 'sunny-outline' | 'shield-checkmark-outline' | 'cube-outline';
  items: AuditItem[];
}

export interface AuditRoom {
  id: string;
  number: string;        // '315', '201', etc — for 'common areas' use a label like 'Hallway'
  label?: string;        // optional descriptor: 'Vacant', 'Suite', 'Common'
  areas: AuditArea[];
}

export interface AuditNote {
  who: 'Sydney Rivera' | 'Amir Lopez';
  text: string;
  at: string;
}

export interface Audit {
  id: string;
  name: string;
  type: AuditType;
  area: string;             // human label of the audit's overall scope
  scopeLabel: string;
  rooms: AuditRoom[];       // 1 or many rooms
  /* Ownership */
  preferredOwner: 'Sydney Rivera' | 'Amir Lopez';
  backupOwner: 'Sydney Rivera' | 'Amir Lopez';
  assignedTo: 'Sydney Rivera' | 'Amir Lopez';
  reassignmentReason?: string;
  lastCompletedBy?: 'Sydney Rivera' | 'Amir Lopez';
  familiarityScore: 'high' | 'medium' | 'low';
  /* Time */
  dueDate: string;
  cadence: string;
  status: AuditStatus;
  /* History */
  prevNotes: AuditNote[];
}

export const CONDITION_CFG: Record<Condition, { label: string; color: string; bg: string }> = {
  good:    { label: 'Good',    color: '#15803d', bg: '#dcfce7' },
  fair:    { label: 'Fair',    color: '#a16207', bg: '#fef9c3' },
  poor:    { label: 'Poor',    color: '#b45309', bg: '#fef3c7' },
  damaged: { label: 'Damaged', color: '#b91c1c', bg: '#fee2e2' },
};

export const ACTION_OPTIONS: { key: Action; label: string }[] = [
  { key: 'none',    label: 'None' },
  { key: 'repair',  label: 'Repair' },
  { key: 'replace', label: 'Replace' },
  { key: 'clean',   label: 'Clean' },
  { key: 'reuse',   label: 'Reuse' },
  { key: 'dispose', label: 'Dispose' },
];

export const LIFECYCLE_OPTIONS: { key: LifecycleDecision; label: string }[] = [
  { key: 'keep',            label: 'Keep using' },
  { key: 'repair',          label: 'Repair' },
  { key: 'replace',         label: 'Replace' },
  { key: 'reuse_elsewhere', label: 'Reuse elsewhere' },
  { key: 'resale',          label: 'Resale' },
  { key: 'dispose',         label: 'Dispose' },
  { key: 'mgmt_review',     label: 'Needs mgmt review' },
];

export const TYPE_CFG: Record<AuditType, { label: string; icon: string; color: string; bg: string }> = {
  room_ffe:         { label: 'Room FF&E',     icon: 'home-outline',             color: '#5b21b6', bg: '#e0e7ff' },
  item:             { label: 'Item audit',    icon: 'tv-outline',               color: '#1d4ed8', bg: '#dbeafe' },
  lighting:         { label: 'Lighting',      icon: 'bulb-outline',             color: '#a16207', bg: '#fef9c3' },
  electronics:      { label: 'Electronics',   icon: 'flash-outline',            color: '#1d4ed8', bg: '#dbeafe' },
  bathroom:         { label: 'Bathroom',      icon: 'water-outline',            color: '#1d4ed8', bg: '#dbeafe' },
  public_area:      { label: 'Public area',   icon: 'business-outline',         color: '#5b21b6', bg: '#e0e7ff' },
  preventive_asset: { label: 'Preventive',    icon: 'shield-checkmark-outline', color: '#15803d', bg: '#dcfce7' },
  inventory:        { label: 'Inventory',     icon: 'cube-outline',             color: '#b45309', bg: '#fef3c7' },
};

/* ─── Builders ─────────────────────────────────────── */

function area(id: string, name: string, icon: AuditArea['icon'], items: string[]): AuditArea {
  return {
    id, name, icon,
    items: items.map((label, i) => ({ id: `${id}-${i}`, label })),
  };
}

/* Standard room — Excel room-audit checklist (Name grouped by Area).
   Subitems column ignored. Optional areas (balcony/suite/kitchen) added by the
   suite/balcony variants below. */
function standardKingAreas(roomId: string): AuditArea[] {
  return [
    area(`${roomId}-entry`, 'Entry', 'enter-outline', [
      'All components of the entry door',
      'All components of the entry threshold',
      'Entry Door Lock',
      'Connecting doors and locks',
      'Closet door',
      'Closet contents',
    ]),
    area(`${roomId}-bath`, 'Bathroom', 'water-outline', [
      'Ceiling and wall coverings',
      'Exhaust fan or vent, light and switch',
      'GFCI, electrical outlet and cover',
      'Towel racks and robe hook/clothesline',
      'Floor tile and grout',
      'Check the hot water',
      'All components of door, door frame and door stop',
      'Shower/tub drain/jacuzzi, sealing, door and fixtures',
      'Showerhead, shower arm and plate (sanitize)',
      'Curtain, rod, grab bars, etc.',
      'Toilet/bidet',
      'Toilet paper holder',
      'Vanity and sink area',
      'Sink faucet, drain and components',
      'Mirror(s) and artwork',
      'ADA handheld shower device (as applicable)',
      'All pipes/valves',
      'Hairdryer',
      'Polish all faucets and fixtures',
      'Remove buildup from shower, tub, sink, drains, vanity, glass doors',
      'Treat and remove mildew and hard water calcium deposit',
    ]),
    area(`${roomId}-bedroom`, 'Bedroom', 'bed-outline', [
      'Ceiling and wall coverings',
      'Hard surface floors and carpet',
      'Window treatments/drapes',
      'Lighting and switch/control',
      'Ceiling fans (if applicable)',
      'All pieces of furniture',
      'Electronics, remotes, telephones and cords',
      'All electrical and USB outlets',
      'Bed and bedframe (including headboard)',
      'Mirror and artwork',
      'Wet bar appliances',
    ]),
    area(`${roomId}-bed`, 'Bed', 'bed-outline', [
      'Headboard',
      'Vacuum the mattress',
      'Inspect for damage or soil; extract as needed',
      'Clean bed frame',
    ]),
    area(`${roomId}-hvac`, 'HVAC', 'snow-outline', [
      'Exterior cover/access panel and grille',
      'Interior cabinet components',
      'Fan assembly',
      'Cooling/heating coil',
      'Cooling/heating control valve',
      'Condensation drain, pan and float switch',
      'Supplemental electric heat',
      'Outside air damper',
      'Thermostat',
      'Supply and return air temperature',
    ]),
    area(`${roomId}-fls`, 'Fire, Life & Safety', 'shield-checkmark-outline', [
      'Perform test on applicable device per code/Brand Standards, document results',
      'ADA devices',
      'Smoke/heat detectors',
      'Speaker and strobe',
      'Sprinkler head',
      'Carbon monoxide detector',
      'Refrigerant monitor device',
    ]),
    area(`${roomId}-furniture`, 'Furniture & Amenities', 'cube-outline', [
      'Furniture (all surfaces, inside and out)',
      'Lamps (including shades and lightbulbs)',
      'Electronics, cords and remote controls',
      'Room amenities (trays, clock, ice bucket, etc.)',
      'Iron, ironing station and luggage rack',
      'Vacuum all upholstered items',
      'Spot clean upholstery as needed',
      'Clean artwork/decor',
    ]),
    area(`${roomId}-perimeter`, 'Perimeter Surfaces', 'sunny-outline', [
      'Walls and high places',
      'Vents and HVAC',
      'All doors',
      'Closets and windows',
      'Window treatments, drapes and sheers',
      'Edge the carpet, wipe baseboards',
    ]),
    area(`${roomId}-flooring`, 'Living Space Flooring', 'bulb-outline', [
      'Thoroughly vacuum carpet (extract if necessary)',
      'Sweep all hard floors thoroughly (polish/buff if applicable)',
    ]),
    area(`${roomId}-prep`, 'Guest Room Preparation', 'briefcase-outline', [
      'Collect items for laundering',
      'Remove all trash and used amenities',
      'Check cleanliness of other bed-related items',
      'Move furniture away from wall and unplug lamps/electronics',
    ]),
  ];
}

/* Suite / extended-stay rooms add the kitchen + suite living/dining areas. */
function suiteAreas(roomId: string): AuditArea[] {
  return [
    ...standardKingAreas(roomId),
    area(`${roomId}-kitchen`, 'Kitchen, Coffee & Bar', 'cube-outline', [
      'All kitchen/bar countertops and surface areas',
      'All dishes, glassware and utensils',
      'Appliances (per manufacturer recommendations)',
    ]),
    area(`${roomId}-suite`, 'Suites / Extended Stay', 'briefcase-outline', [
      'All components of the dining area',
      'All components of the living room',
      'All components of the kitchen/wet bar area',
      'Sink, faucet, drain and garbage disposal',
      'Oven range, exhaust hood and lights',
      'Microwave',
      'Dishwasher (de-lime annually)',
      'All other appliances',
    ]),
  ];
}

/* Balcony rooms add the exterior balcony area. */
function balconyAreas(roomId: string): AuditArea[] {
  return [
    ...standardKingAreas(roomId),
    area(`${roomId}-balcony`, 'Exterior Balcony', 'sunny-outline', [
      'Balcony/lanai doors and railing',
      'Furniture',
      'Paint',
      'Balcony lighting',
      'Sweep and clean balconies',
      'Wipe down all patio furniture',
      'Clean all door tracks and frames',
      'Clean exterior of window',
    ]),
  ];
}

function bathroomOnlyAreas(roomId: string): AuditArea[] {
  return [area(`${roomId}-bath`, 'Bathroom', 'water-outline', [
    'Exhaust fan — working',
    'Shower head — clean, working',
    'Faucet — no leak',
    'Toilet flush — working',
    'Drain — flowing',
    'Mirror — clean, no crack',
    'Light — working',
  ])];
}

/* Just the TV / Media Unit area for an item-style remote audit */
function mediaOnlyAreas(roomId: string): AuditArea[] {
  return [area(`${roomId}-tv`, 'TV / Media Unit', 'tv-outline', [
    'TV remote — present',
    'Remote batteries — working',
  ])];
}

function lightingOnlyAreas(roomId: string): AuditArea[] {
  return [area(`${roomId}-light`, 'Lighting', 'bulb-outline', [
    'Bedside lamp — working',
    'Desk lamp — working',
    'Bathroom light — working',
    'Ceiling light — working',
  ])];
}

/* Public hallway — for shared-area audits (Floor 3 hallway lighting) */
function hallwayLightingAreas(): AuditArea[] {
  return [area('hallway-light', 'Hallway lighting', 'bulb-outline', [
    'Hallway fixture 1',
    'Hallway fixture 2',
    'Hallway fixture 3',
    'Hallway fixture 4',
    'Hallway fixture 5',
    'Emergency exit lights',
  ])];
}

function inventoryAreas(): AuditArea[] {
  return [area('stock', 'Stock cabinet · Floor 1', 'cube-outline', [
    'TV Remote · Spare universal — count vs system',
    'AAA Battery · For remotes — count',
    'AA Battery · General — count',
    'LED Bulb · Warm 10W — count',
    'LED Bulb · White 10W — count',
    'AC Filter · PTAC unit — count',
    'Door lock CR2 battery — count',
    'Toilet flapper — count',
  ])];
}

/* ─── Mock dataset ─────────────────────────────────── */

/**
 * Each audit is a single-room walk through the standard 10 areas
 * (Entry, Closet, Bed, TV/Media, Desk, HVAC, Bathroom, Lighting,
 *  Windows, Safety). Familiarity rule keeps the same person on the
 * same room when possible.
 */
export const AUDITS: Audit[] = [
  {
    id: 'AUD-101',
    name: 'Room 315 audit',
    type: 'room_ffe',
    area: 'Room 315',
    scopeLabel: 'Suite · 12 areas',
    rooms: [
      { id: 'r315', number: '315', label: 'Suite', areas: suiteAreas('315') },
    ],
    preferredOwner: 'Sydney Rivera',
    backupOwner: 'Amir Lopez',
    assignedTo: 'Sydney Rivera',
    lastCompletedBy: 'Sydney Rivera',
    familiarityScore: 'high',
    dueDate: 'Due Friday',
    cadence: 'Quarterly',
    status: 'open',
    prevNotes: [
      { who: 'Sydney Rivera', text: 'AC complaint repeated twice this month.',  at: 'Last quarter' },
      { who: 'Sydney Rivera', text: 'Lamp bulb replaced last audit.',           at: 'Last quarter' },
      { who: 'Amir Lopez',    text: 'Remote batteries changed during evening.', at: '12 days ago' },
    ],
  },
  {
    id: 'AUD-102',
    name: 'Room 201 audit',
    type: 'room_ffe',
    area: 'Room 201',
    scopeLabel: 'Standard king · 10 areas',
    rooms: [
      { id: 'r201', number: '201', areas: standardKingAreas('201') },
    ],
    preferredOwner: 'Amir Lopez',
    backupOwner: 'Sydney Rivera',
    assignedTo: 'Amir Lopez',
    lastCompletedBy: 'Amir Lopez',
    familiarityScore: 'high',
    dueDate: 'Due today',
    cadence: 'Quarterly',
    status: 'open',
    prevNotes: [
      { who: 'Amir Lopez', text: 'Last audit: replaced TV remote from inventory.', at: '90 days ago' },
    ],
  },
  {
    id: 'AUD-103',
    name: 'Room 305 audit',
    type: 'room_ffe',
    area: 'Room 305',
    scopeLabel: 'Standard king · 10 areas',
    rooms: [
      { id: 'r305', number: '305', areas: standardKingAreas('305') },
    ],
    preferredOwner: 'Sydney Rivera',
    backupOwner: 'Amir Lopez',
    assignedTo: 'Amir Lopez',
    reassignmentReason: 'Sydney has 5 urgent room blockers · Amir has evening capacity',
    lastCompletedBy: 'Sydney Rivera',
    familiarityScore: 'medium',
    dueDate: 'Due Sat',
    cadence: 'Quarterly',
    status: 'open',
    prevNotes: [
      { who: 'Sydney Rivera', text: 'Bedside lamp replaced 6 months ago — check still working.', at: 'Last quarter' },
    ],
  },
  {
    id: 'AUD-104',
    name: 'Room 408 audit',
    type: 'room_ffe',
    area: 'Room 408',
    scopeLabel: 'Standard + balcony · 11 areas',
    rooms: [
      { id: 'r408', number: '408', label: 'Balcony', areas: balconyAreas('408') },
    ],
    preferredOwner: 'Sydney Rivera',
    backupOwner: 'Amir Lopez',
    assignedTo: 'Sydney Rivera',
    lastCompletedBy: 'Sydney Rivera',
    familiarityScore: 'high',
    dueDate: 'Due Mon',
    cadence: 'Quarterly',
    status: 'open',
    prevNotes: [
      { who: 'Amir Lopez', text: 'Drain was slow last week — guest complaint.', at: '4 days ago' },
    ],
  },
  {
    id: 'AUD-105',
    name: 'Room 510 audit',
    type: 'room_ffe',
    area: 'Room 510',
    scopeLabel: 'Standard king · 10 areas',
    rooms: [
      { id: 'r510', number: '510', areas: standardKingAreas('510') },
    ],
    preferredOwner: 'Sydney Rivera',
    backupOwner: 'Amir Lopez',
    assignedTo: 'Sydney Rivera',
    lastCompletedBy: 'Sydney Rivera',
    familiarityScore: 'high',
    dueDate: 'Due Wed',
    cadence: 'Quarterly',
    status: 'in_progress',
    prevNotes: [
      { who: 'Sydney Rivera', text: 'AC unit may need vendor inspection — flag during audit.', at: 'Last month' },
      { who: 'Amir Lopez',    text: 'Reset AC twice last week. Watchlist room.',             at: '6 days ago' },
    ],
  },
];

export function getAudit(id: string): Audit | undefined {
  return AUDITS.find((a) => a.id === id);
}

export function auditsForPerson(name: 'Sydney Rivera' | 'Amir Lopez'): Audit[] {
  return AUDITS.filter((a) => a.assignedTo === name);
}

/* ─── Counters across rooms → areas → items ─── */

export function totalItems(audit: Audit): number {
  let n = 0;
  for (const r of audit.rooms) for (const a of r.areas) n += a.items.length;
  return n;
}

export function inspectedItems(audit: Audit): number {
  let n = 0;
  for (const r of audit.rooms) for (const a of r.areas) for (const it of a.items)
    if (it.condition !== undefined || it.present !== undefined) n++;
  return n;
}

export function failedItems(audit: Audit): AuditItem[] {
  const out: AuditItem[] = [];
  for (const r of audit.rooms) for (const a of r.areas) for (const it of a.items)
    if (it.condition === 'poor' || it.condition === 'damaged' || it.present === false || it.working === false) out.push(it);
  return out;
}

export function roomProgress(room: AuditRoom): { total: number; done: number; failed: number } {
  let total = 0, done = 0, failed = 0;
  for (const a of room.areas) for (const it of a.items) {
    total++;
    if (it.condition !== undefined || it.present !== undefined) done++;
    if (it.condition === 'poor' || it.condition === 'damaged' || it.present === false || it.working === false) failed++;
  }
  return { total, done, failed };
}
