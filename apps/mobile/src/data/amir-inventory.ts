/**
 * Amir's inventory — variants matter (Warm 10W ≠ White 10W ≠ White 5W).
 * Sydney owns the master catalog; Amir uses + logs.
 */

export type StockLevel = 'good' | 'low' | 'out';
export type Category =
  | 'bulbs'
  | 'remotes'
  | 'batteries'
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'other';

export interface InventoryItem {
  id: string;
  category: Category;
  name: string;        // 'LED Bulb'
  variant: string;     // 'Warm 10W'
  count: number;
  par: number;
  level: StockLevel;
  unit: string;
  location: string;
  lastRestocked?: string;
}

export const CATEGORY_CFG: Record<Category, { label: string; icon: string; color: string; bg: string }> = {
  bulbs:      { label: 'Bulbs',       icon: 'bulb-outline',         color: '#a16207', bg: '#fef9c3' },
  remotes:    { label: 'Remotes',     icon: 'tv-outline',           color: '#1d4ed8', bg: '#dbeafe' },
  batteries:  { label: 'Batteries',   icon: 'battery-charging-outline', color: '#15803d', bg: '#dcfce7' },
  hvac:       { label: 'HVAC',        icon: 'snow-outline',         color: '#5b21b6', bg: '#e0e7ff' },
  plumbing:   { label: 'Plumbing',    icon: 'water-outline',        color: '#1d4ed8', bg: '#dbeafe' },
  electrical: { label: 'Electrical',  icon: 'flash-outline',        color: '#b45309', bg: '#fef3c7' },
  other:      { label: 'Other',       icon: 'cube-outline',         color: '#6a6a6a', bg: '#f0f0f0' },
};

export const INVENTORY: InventoryItem[] = [
  /* Bulbs — variants matter */
  { id: 'INV-001', category: 'bulbs',     name: 'LED Bulb',          variant: 'White 10W',         count: 24, par: 8,  level: 'good', unit: 'each',   location: 'Engineering cabinet' },
  { id: 'INV-002', category: 'bulbs',     name: 'LED Bulb',          variant: 'White 5W',          count: 18, par: 6,  level: 'good', unit: 'each',   location: 'Engineering cabinet' },
  { id: 'INV-003', category: 'bulbs',     name: 'LED Bulb',          variant: 'Warm 10W',          count: 12, par: 6,  level: 'good', unit: 'each',   location: 'Engineering cabinet' },
  { id: 'INV-004', category: 'bulbs',     name: 'LED Bulb',          variant: 'Warm 5W',           count: 4,  par: 6,  level: 'low',  unit: 'each',   location: 'Engineering cabinet' },

  /* Remotes */
  { id: 'INV-005', category: 'remotes',   name: 'TV Remote',         variant: 'Spare universal',   count: 1,  par: 5,  level: 'low',  unit: 'each',   location: 'Stock cabinet · Floor 1', lastRestocked: '8 days ago' },
  { id: 'INV-006', category: 'remotes',   name: 'AC Remote',         variant: 'PTAC unit',         count: 3,  par: 3,  level: 'good', unit: 'each',   location: 'Engineering closet' },

  /* Batteries */
  { id: 'INV-007', category: 'batteries', name: 'AAA Battery',       variant: 'For remotes',       count: 64, par: 24, level: 'good', unit: 'each',   location: 'Stock cabinet · Floor 1' },
  { id: 'INV-008', category: 'batteries', name: 'AA Battery',        variant: 'General use',       count: 30, par: 20, level: 'good', unit: 'each',   location: 'Stock cabinet · Floor 1' },
  { id: 'INV-009', category: 'batteries', name: 'CR2 Battery',       variant: 'Door lock',         count: 20, par: 6,  level: 'good', unit: 'each',   location: 'Maintenance closet' },

  /* HVAC */
  { id: 'INV-010', category: 'hvac',      name: 'AC Filter',         variant: 'PTAC room unit',    count: 2,  par: 4,  level: 'low',  unit: 'each',   location: 'Maintenance closet', lastRestocked: '3 weeks ago' },
  { id: 'INV-011', category: 'hvac',      name: 'Thermostat',        variant: 'Standard',          count: 3,  par: 2,  level: 'good', unit: 'each',   location: 'Engineering closet' },

  /* Plumbing */
  { id: 'INV-012', category: 'plumbing',  name: 'Toilet flapper',    variant: 'Standard',          count: 0,  par: 3,  level: 'out',  unit: 'each',   location: 'Maintenance closet' },
  { id: 'INV-013', category: 'plumbing',  name: 'Shower head',       variant: 'Standard',          count: 5,  par: 3,  level: 'good', unit: 'each',   location: 'Maintenance closet' },
  { id: 'INV-014', category: 'plumbing',  name: 'Drain snake',       variant: 'Small',             count: 1,  par: 2,  level: 'low',  unit: 'each',   location: 'Maintenance closet' },

  /* Electrical / other */
  { id: 'INV-015', category: 'electrical',name: 'Lamp shade',        variant: 'Standard',          count: 3,  par: 4,  level: 'low',  unit: 'each',   location: 'Stock cabinet · Floor 1' },
  { id: 'INV-016', category: 'electrical',name: 'Surge strip',       variant: '6-outlet',          count: 8,  par: 4,  level: 'good', unit: 'each',   location: 'Engineering closet' },
];

export const SOURCES = [
  { key: 'inventory',     label: 'Inventory / stock' },
  { key: 'another_room',  label: 'Another room' },
  { key: 'vendor',        label: 'Vendor delivery' },
  { key: 'temporary',     label: 'Temporary fix' },
  { key: 'other',         label: 'Other' },
] as const;

export interface UsageEntry {
  id: string;
  itemName: string;
  variant?: string;
  source: string;
  sourceRoom?: string;        // when borrowed from another room
  destinationRoom?: string;
  ticketId?: string;
  loggedAt: string;
  note?: string;
  followUpTicketId?: string;  // if a follow-up ticket was auto-created
}

/** Mock log of items Amir has used today — drives the Handover. */
export const USAGE_TODAY: UsageEntry[] = [
  {
    id: 'U-1',
    itemName: 'TV Remote',
    variant: 'Spare universal',
    source: 'inventory',
    destinationRoom: '402',
    ticketId: 'TK-204',
    loggedAt: '5:42 PM',
    note: 'Replaced — old remote sticky buttons',
  },
  {
    id: 'U-2',
    itemName: 'AAA Battery',
    variant: 'For remotes',
    source: 'inventory',
    destinationRoom: '512',
    ticketId: 'TK-211',
    loggedAt: '6:18 PM',
  },
  {
    id: 'U-3',
    itemName: 'TV Remote',
    variant: 'From source room',
    source: 'another_room',
    sourceRoom: '402',
    destinationRoom: '303',
    ticketId: 'TK-217',
    loggedAt: '6:55 PM',
    note: 'No spare in stock. Took remote from vacant 402.',
    followUpTicketId: 'TK-FOLLOWUP-402',
  },
];

/** Watchlist rooms — drive room/handover notes. */
export const WATCHLIST_ROOMS = [
  { number: '315', reason: 'AC reset 3rd time this month — vendor check needed' },
  { number: '420', reason: 'Door latch loose — 2nd report' },
  { number: '510', reason: 'AC unit may need vendor inspection' },
];

/** Auto-created follow-up tickets from borrowed-item flow. */
export const FOLLOWUP_TICKETS = [
  {
    id: 'TK-FOLLOWUP-402',
    room: '402',
    title: 'Replace TV remote — taken for Room 303',
    linkedTicketId: 'TK-217',
    priority: 'urgent' as const,    // arrival today
    arrivalSoon: true,
    note: 'Original remote moved to 303 (urgent guest complaint). Source room has arrival today — replace before 5:30 PM.',
    createdAt: '6:55 PM',
  },
];

/** Sydney's morning handover notes for Amir. */
export const SYDNEY_NOTES = [
  { from: 'Sydney Rivera', body: 'Room 510 AC needs vendor — already requested. If guest complains, comp + reroom.', at: '2:48 PM' },
  { from: 'Sydney Rivera', body: '4 AAA batteries left in 1F cabinet. Hold for remote swaps only.', at: '3:12 PM' },
];
