/**
 * Front Desk Access — static dictionaries from the spec. Drives every dropdown
 * in the Work Order and Service Request flows, plus Hotel Pulse options.
 */

/* ── Work Order: location types ───────────────────────────────────────── */
export const WO_LOCATION_TYPES = ['Guest Room', 'Common Area', 'Employee Area', 'Guest Amenity', 'Exterior'] as const;
export type WoLocationType = typeof WO_LOCATION_TYPES[number];

export const ROOM_AREAS = ['Bathroom', 'Bedroom', 'Closet', 'Entrance'] as const;
export type RoomArea = typeof ROOM_AREAS[number];

export const ROOM_AREA_ITEMS: Record<RoomArea, string[]> = {
  Bathroom: ['Bathroom door', 'Ceiling fan', 'Hair dryer', 'Mirror', 'Shower', 'Sink', 'Tile', 'Toilet', 'Toilet paper holder', 'Towel rack', 'Vanity light', 'Wallpaper'],
  Bedroom: ['Bed', 'Ceiling lamp', 'Coffee maker', 'Coffee table', 'Couch', 'Curtains', 'Data outlet', 'Desk', 'Desk chair', 'Desk lamp', 'Dressers', 'Electrical outlet', 'Ethernet', 'Fire alarm', 'Fire sprinkler', 'Floor lamp', 'Headboard light', 'HVAC', 'Nightstand', 'Phone', 'Picture', 'Recess light', 'Side table', 'Smoke detector', 'Trash bin', 'TV', 'TV remote', 'Wallpaper', 'Wi-Fi', 'Window'],
  Closet: ['Closet door', 'Garment rack', 'Guest safe', 'Ironing board'],
  Entrance: ['Card reader', 'Entry door', 'Evacuation plan', 'Handicap sign', 'Tower laws', 'Hotel laws', 'Room number', 'Sink', 'Welcome light'],
};

export const COMMON_AREAS = ['First floor', 'Second floor', 'Third floor', 'Fourth floor', 'Fifth floor', 'Sixth floor', 'Dining room', 'Elevator', 'Elevator 1', 'Elevator to front desk', 'Lobby', 'Lounge', "Men's bathroom", 'Not applicable', 'Public bathroom', "Women's bathroom"];
export const EMPLOYEE_AREAS = ['Back office', 'Baggage cart room', 'Electrical equipment room', 'Elevator equipment room', 'Employee bathroom', 'Employee break room', 'Engineer office', 'Fire pump room', 'General manager office', 'Housekeeping laundry', 'IT or security equipment room', 'Kitchen', 'Mechanical room', 'Phone or internet equipment room', 'TV equipment room'];
export const AMENITY_AREAS = ['Gym', 'Meeting room', 'Swimming pool', 'Internet / computer'];
export const EXTERIOR_AREAS = ['Building back', 'Building east side', 'Building front', 'Building west side', 'Dumpster area', 'Parking lot', 'Patio', 'Roof', 'Utility area'];

/** Generic issue categories for non-guest-room work orders. */
export const ISSUE_CATEGORIES = ['Electrical', 'Plumbing', 'HVAC', 'Lighting', 'Door / lock', 'Appliance', 'Furniture', 'Structural / damage', 'Elevator', 'Safety / alarm', 'Cleaning / damage', 'Other'];

export function areasFor(locationType: WoLocationType): string[] {
  switch (locationType) {
    case 'Common Area': return COMMON_AREAS;
    case 'Employee Area': return EMPLOYEE_AREAS;
    case 'Guest Amenity': return AMENITY_AREAS;
    case 'Exterior': return EXTERIOR_AREAS;
    default: return [];
  }
}

/* ── Service Request: item catalog (grouped) ──────────────────────────── */
export const SR_ITEM_GROUPS: Array<{ group: string; items: string[] }> = [
  { group: 'Bedding and Room Comfort', items: ['Extra bed', 'Mattress', 'Blanket', 'Feather-free pillow', 'Pillows', 'Mattress cover', 'Sheets', 'Bed sheet change', 'Blinds'] },
  { group: 'Bathroom and Toiletries', items: ['Body wash', 'Conditioner', 'Face soap', 'Hand soap', 'Lotion', 'Shampoo', 'Toilet paper', 'Toothbrush', 'Toothpaste', 'Towels', 'Hand towels'] },
  { group: 'Coffee, Water, and Room Supplies', items: ['Water', 'Full coffee set', 'Coffee', 'Coffee cups', 'Sugar', 'Creamer', 'Dish soap', 'Dish towels'] },
  { group: 'Cleaning and Housekeeping', items: ['Broom', 'Deep clean', 'Dirty area', 'Dirty floor', 'Trash', 'Take out trash'] },
  { group: 'Other Front Desk / Guest Service', items: ['Late checkout', 'Iron board', 'Brush', 'Light bulb', 'AC bed', 'Toilets'] },
];
export const SR_ALL_ITEMS = SR_ITEM_GROUPS.flatMap((g) => g.items);
export const SR_LOCATION_TYPES = ['Guest Room', 'Common Area', 'Other'] as const;

/* ── Shared option lists ──────────────────────────────────────────────── */
export const REQUESTED_BY = ['Guest', 'Front desk', 'Housekeeping', 'Engineering', 'Other'] as const;
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
export type Priority = typeof PRIORITIES[number];

export const WO_STATUSES = ['New', 'Acknowledged', 'In Progress', 'Waiting', 'Completed', 'Cancelled'] as const;
export const SR_STATUSES = ['New', 'Acknowledged', 'In Progress', 'Delivered', 'Completed', 'Cancelled'] as const;
export type WoStatus = typeof WO_STATUSES[number];
export type SrStatus = typeof SR_STATUSES[number];

/* ── Today's Hotel Pulse dropdowns ────────────────────────────────────── */
export const OCCUPANCY_FEELINGS = ['Normal', 'Higher than usual', 'Very high', 'Sold out or almost sold out', 'Lower than usual'];
export const PULSE_REASONS = ['Local event', 'College / university event', 'Graduation / commencement', 'Festival', 'Concert', 'Sports event', 'Corporate travel', 'Wedding', 'Family reunion', 'Group gathering', 'Weather related travel', 'Hurricane evacuation', 'Snowstorm escape', 'Road closure / emergency travel', 'Government / military', 'Construction crew', 'Unknown', 'Other'];
export const GUEST_SOURCES = ['Florida', 'Atlanta', 'New York', 'Northeast', 'South Carolina', 'Local area', 'Texas', 'California', 'Unknown'];
export const FOUND_OUT = ['Guest told us', 'Multiple guests mentioned it', 'Front desk noticed pattern', 'Reservation notes', 'Phone calls', 'Walk-ins', 'Other'];
export const GUESTS_MENTIONED = ['1 guest', '2 to 5 guests', '6 to 10 guests', 'More than 10 guests', 'Not sure'];
export const GROUP_BOOKING = ['Yes, already group booking', 'No, individual reservations only', 'Mixed', 'Not sure'];
export const YES_MAYBE_NO = ['Yes', 'Maybe', 'No', 'Not sure'];
export const FOLLOWUP_YES = ['Yes', 'No', 'Maybe later'];
export const FOLLOWUP_TIMING = ['In 1 month', 'In 3 months', 'In 6 months', 'In 9 months', 'In 11 months', 'Next year', 'Custom date'];

/* ── Seed employees for punch validation (front desk never sees payroll) ─ */
export interface FdEmployee { id: string; pin: string; name: string; department: string }
export const FD_EMPLOYEES: FdEmployee[] = [
  { id: 'E1042', pin: '1042', name: 'Maria Lopez', department: 'Housekeeping' },
  { id: 'E1088', pin: '1088', name: 'James Carter', department: 'Front Desk' },
  { id: 'E1130', pin: '1130', name: 'Devin Brooks', department: 'Engineering' },
  { id: 'E1175', pin: '1175', name: 'Aisha Khan', department: 'Housekeeping' },
  { id: 'E1206', pin: '1206', name: 'Robert Nguyen', department: 'Maintenance' },
  { id: 'E1251', pin: '1251', name: 'Tasha Greene', department: 'Front Desk' },
];
export function findEmployee(id: string, pin: string): FdEmployee | undefined {
  const e = FD_EMPLOYEES.find((x) => x.id.toLowerCase() === id.trim().toLowerCase());
  return e && e.pin === pin.trim() ? e : undefined;
}

export const DEVICE_NAME = 'Front Desk Computer 1';

export const TEAM_FOR = { workOrder: 'Engineering', serviceRequest: 'Housekeeping' } as const;

export function priorityStyle(p: Priority): { fg: string; bg: string } {
  switch (p) {
    case 'Urgent': return { fg: '#b91c1c', bg: '#fee2e2' };
    case 'High': return { fg: '#b45309', bg: '#fef3c7' };
    case 'Low': return { fg: '#6a6a6a', bg: '#f0f0f0' };
    default: return { fg: '#1d4ed8', bg: '#dbeafe' };
  }
}
export function statusStyle(s: string): { fg: string; bg: string } {
  if (s === 'Completed' || s === 'Delivered') return { fg: '#15803d', bg: '#dcfce7' };
  if (s === 'Cancelled') return { fg: '#6a6a6a', bg: '#f0f0f0' };
  if (s === 'In Progress') return { fg: '#1d4ed8', bg: '#dbeafe' };
  if (s === 'Waiting') return { fg: '#b45309', bg: '#fef3c7' };
  if (s === 'Acknowledged') return { fg: '#6a4ec0', bg: '#ece4fb' };
  return { fg: '#b45309', bg: '#fef3c7' }; // New
}
