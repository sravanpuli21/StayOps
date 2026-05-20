/**
 * Dropdown dictionaries for the front-desk request flow.
 * Keep these literals close to the wizard so non-engineers can edit them
 * without touching the form code.
 */

export const HOTEL_AREAS = [
  'Lobby',
  'Front Desk',
  'Hallway',
  'Elevator',
  'Laundry',
  'Storage',
  'Parking',
  'Pool',
  'Gym',
  'Breakfast Area',
  'Exterior',
  'Other',
] as const;
export type HotelArea = (typeof HOTEL_AREAS)[number];

// ── Work Order: Area → Items ────────────────────────────────────────────────
export const WORK_ORDER_AREAS = [
  'Balcony',
  'Bathroom',
  'Closet',
  'Bed Area',
  'Desk Area',
  'Entrance',
  'HVAC / AC',
  'Lighting',
  'Plumbing',
  'Electrical',
  'Door / Lock',
  'TV',
  'Furniture',
  'Floor',
  'Wall / Ceiling',
  'Other',
] as const;
export type WorkOrderArea = (typeof WORK_ORDER_AREAS)[number];

export const WORK_ORDER_ITEMS: Record<WorkOrderArea, string[]> = {
  'Balcony':        ['Door', 'Handle', 'Light', 'Chair', 'Table', 'Railing', 'Other'],
  'Bathroom':       ['Toilet', 'Sink', 'Shower', 'Tub', 'Faucet', 'Drain', 'Mirror', 'Light', 'Exhaust Fan', 'Towel Rack', 'Other'],
  'Closet':         ['Hanger', 'Iron', 'Iron Board', 'Safe', 'Closet Door', 'Light', 'Other'],
  'Bed Area':       ['Bed', 'Mattress', 'Headboard', 'Bedsheet', 'Pillow', 'Lamp', 'Nightstand', 'Outlet', 'Other'],
  'Desk Area':      ['Desk', 'Chair', 'Lamp', 'Outlet', 'Phone', 'Other'],
  'Entrance':       ['Door', 'Handle', 'Lock', 'Light', 'Other'],
  'HVAC / AC':      ['AC Not Cooling', 'AC Not Heating', 'AC Making Noise', 'Thermostat', 'Filter', 'Other'],
  'Lighting':       ['Bulb', 'Lamp', 'Switch', 'Bathroom Light', 'Entrance Light', 'Other'],
  'Plumbing':       ['Leak', 'Drain', 'Toilet', 'Faucet', 'Shower', 'Hot Water', 'Other'],
  'Electrical':     ['Outlet', 'Switch', 'Power Issue', 'Light Issue', 'Other'],
  'Door / Lock':    ['Door Lock', 'Key Card Issue', 'Handle', 'Hinge', 'Door Not Closing', 'Other'],
  'TV':             ['TV Not Working', 'Remote', 'Cable', 'HDMI', 'Other'],
  'Furniture':      ['Chair', 'Table', 'Sofa', 'Drawer', 'Cabinet', 'Other'],
  'Floor':          ['Carpet', 'Tile', 'Stain', 'Damage', 'Other'],
  'Wall / Ceiling': ['Paint', 'Crack', 'Leak', 'Stain', 'Damage', 'Other'],
  'Other':          ['Other'],
};

// ── Service Request: Category → Items ──────────────────────────────────────
export const SERVICE_CATEGORIES = [
  'Towels',
  'Bathroom Supplies',
  'Bedding',
  'Water / Amenities',
  'Cleaning Request',
  'Laundry',
  'Other',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_ITEMS: Record<ServiceCategory, string[]> = {
  'Towels':            ['Bath Towel', 'Hand Towel', 'Face Towel', 'Floor Mat', 'Extra Towels', 'Other'],
  'Bathroom Supplies': ['Shampoo', 'Conditioner', 'Body Wash', 'Soap', 'Toilet Paper', 'Tissue Box', 'Toothbrush', 'Toothpaste', 'Shower Cap', 'Other'],
  'Bedding':           ['Pillow', 'Blanket', 'Bedsheet', 'Comforter', 'Extra Bedding', 'Other'],
  'Water / Amenities': ['Water Bottle', 'Coffee', 'Tea', 'Cup', 'Sugar', 'Creamer', 'Ice Bucket', 'Other'],
  'Cleaning Request':  ['Room Cleaning', 'Bathroom Cleaning', 'Trash Pickup', 'Spill Cleanup', 'Odor Issue', 'Other'],
  'Laundry':           ['Laundry Pickup', 'Laundry Drop', 'Linen Request', 'Other'],
  'Other':             ['Other'],
};

export const REQUESTED_BY_WORK_ORDER = ['Guest', 'Management', 'Front Desk', 'Housekeeping', 'Engineering', 'Other'] as const;
export const REQUESTED_BY_SERVICE    = ['Guest', 'Management', 'Front Desk', 'Housekeeping', 'Other'] as const;
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];
