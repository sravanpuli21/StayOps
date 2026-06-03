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

// ── Hotel Area → relevant items ─────────────────────────────────────────────
// When a hotel area is selected for a work order, the Area is locked to that
// area and the Item list is scoped to what actually lives there.
export const HOTEL_AREA_ITEMS: Record<HotelArea, string[]> = {
  'Lobby':          ['Seating / Sofa', 'Coffee Table', 'Lighting', 'Flooring / Carpet', 'Front Doors', 'Automatic Door', 'Windows', 'Decor / Artwork', 'HVAC / AC', 'TV', 'Music / Audio', 'Plants', 'Signage', 'Other'],
  'Front Desk':     ['Computer / PMS', 'Printer', 'Key Card Encoder', 'Phone', 'Desk / Counter', 'Chair', 'Lighting', 'Card Reader', 'Safe', 'Signage', 'Other'],
  'Hallway':        ['Lighting', 'Carpet / Flooring', 'Wall / Paint', 'Ceiling', 'Signage', 'Ice Machine', 'Vending Machine', 'Fire Extinguisher', 'Emergency Exit Sign', 'HVAC Vent', 'Other'],
  'Elevator':       ['Not Working', 'Making Noise', 'Buttons', 'Lighting', 'Door', 'Floor Indicator', 'Emergency Phone', 'Inspection Certificate', 'Other'],
  'Laundry':        ['Washer', 'Dryer', 'Folding Table', 'Lighting', 'Plumbing / Drain', 'Vent', 'Detergent Dispenser', 'Sink', 'Other'],
  'Storage':        ['Shelving', 'Lighting', 'Door / Lock', 'Flooring', 'Inventory Rack', 'Other'],
  'Parking':        ['Lighting', 'Gate / Barrier', 'Pavement / Pothole', 'Signage', 'Line Marking', 'EV Charger', 'Security Camera', 'Drainage', 'Other'],
  'Pool':           ['Water Quality', 'Pump / Filter', 'Heater', 'Lighting', 'Tiles', 'Railing / Ladder', 'Furniture', 'Fence / Gate', 'Signage', 'Other'],
  'Gym':            ['Treadmill', 'Elliptical', 'Weights', 'Exercise Bike', 'Mirror', 'Lighting', 'TV', 'Water Fountain', 'Flooring / Mat', 'HVAC / AC', 'Other'],
  'Breakfast Area': ['Coffee Machine', 'Toaster', 'Microwave', 'Refrigerator', 'Juice Dispenser', 'Waffle Maker', 'Tables', 'Chairs', 'Lighting', 'Flooring', 'Trash Bin', 'Counter', 'Other'],
  'Exterior':       ['Lighting', 'Landscaping', 'Signage', 'Entrance Doors', 'Walkway', 'Drainage', 'Building Facade', 'Flag / Pole', 'Sprinkler', 'Other'],
  'Other':          ['Other'],
};

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
