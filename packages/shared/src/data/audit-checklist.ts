/**
 * Room audit checklist template — room-first, area-first.
 *
 * Source: the property room-audit Excel (Name = checklist item, Area = room
 * area it belongs to). The "Subitems" column is intentionally ignored.
 *
 * Structure consumers should use:
 *   Room Number → Area / Audit Group → Checklist Items (where item.area === area)
 *
 * Optional areas (balcony, suites/extended-stay, kitchen) only apply to rooms
 * that have those features — see `getAreasForRoom()`.
 */

export type AuditAreaKey =
  | 'entry'
  | 'bathroom'
  | 'bedroom'
  | 'balcony'
  | 'hvac'
  | 'fire_life_safety'
  | 'suites_extended'
  | 'guest_room_prep'
  | 'perimeter_surfaces'
  | 'furniture_amenities'
  | 'bed'
  | 'kitchen_coffee_bar'
  | 'living_space_flooring';

export interface AuditArea {
  key: AuditAreaKey;
  label: string;
  /** Optional areas only show for rooms that have the feature. */
  optional: boolean;
  /** Feature gate for optional areas. */
  requires?: 'balcony' | 'suite';
  icon: string; // lucide icon name
}

export const AUDIT_AREAS: AuditArea[] = [
  { key: 'entry',               label: 'Entry',                              optional: false, icon: 'DoorOpen' },
  { key: 'bathroom',            label: 'Bathroom',                           optional: false, icon: 'Bath' },
  { key: 'bedroom',             label: 'Bedroom',                            optional: false, icon: 'BedDouble' },
  { key: 'bed',                 label: 'Bed',                                optional: false, icon: 'Bed' },
  { key: 'hvac',                label: 'HVAC',                               optional: false, icon: 'Wind' },
  { key: 'fire_life_safety',    label: 'Fire, Life & Safety',                optional: false, icon: 'ShieldCheck' },
  { key: 'furniture_amenities', label: 'Furniture, Room Amenities & Upholstery', optional: false, icon: 'Armchair' },
  { key: 'perimeter_surfaces',  label: 'Perimeter Surfaces',                 optional: false, icon: 'SquareDashed' },
  { key: 'living_space_flooring', label: 'Living Space Flooring',            optional: false, icon: 'Grid2x2' },
  { key: 'guest_room_prep',     label: 'Guest Room Preparation',             optional: false, icon: 'ClipboardCheck' },
  { key: 'balcony',             label: 'Exterior Balcony',                   optional: true,  requires: 'balcony', icon: 'TreePalm' },
  { key: 'kitchen_coffee_bar',  label: 'Kitchen, Coffee & Bar',              optional: true,  requires: 'suite',   icon: 'CookingPot' },
  { key: 'suites_extended',     label: 'Suites / Extended Stay',             optional: true,  requires: 'suite',   icon: 'Sofa' },
];

export const AUDIT_AREA_BY_KEY: Record<AuditAreaKey, AuditArea> =
  Object.fromEntries(AUDIT_AREAS.map((a) => [a.key, a])) as Record<AuditAreaKey, AuditArea>;

export interface ChecklistItem {
  id: string;
  area: AuditAreaKey;
  name: string;
}

// Raw items from the Excel (Name, Area). Subitems ignored. Exact duplicates
// within an area are removed; the cleaning-pass bathroom items are merged in.
const RAW: Array<[AuditAreaKey, string]> = [
  // Entry
  ['entry', 'All components of the entry door'],
  ['entry', 'All components of the entry threshold'],
  ['entry', 'Entry Door Lock'],
  ['entry', 'Connecting doors and locks'],
  ['entry', 'Closet door'],
  ['entry', 'Closet contents'],

  // Bathroom (inspection)
  ['bathroom', 'Ceiling and wall coverings'],
  ['bathroom', 'Exhaust fan or vent, light and switch'],
  ['bathroom', 'GFCI, electrical outlet and cover'],
  ['bathroom', 'Towel racks and robe hook/clothesline'],
  ['bathroom', 'Floor tile and grout'],
  ['bathroom', 'Check the hot water'],
  ['bathroom', 'All components of door, door frame and door stop'],
  ['bathroom', 'All components of specialty doors (barn/pocket) and tracks'],
  ['bathroom', 'Shower/tub drain/jacuzzi, sealing, door and fixtures'],
  ['bathroom', 'Showerhead, shower arm and plate (sanitize)'],
  ['bathroom', 'Curtain, rod, grab bars, etc.'],
  ['bathroom', 'Toilet/bidet'],
  ['bathroom', 'Toilet paper holder'],
  ['bathroom', 'Vanity and sink area'],
  ['bathroom', 'Sink faucet, drain and components'],
  ['bathroom', 'Mirror(s) and artwork'],
  ['bathroom', 'ADA handheld shower device (as applicable)'],
  // Bathroom (cleaning pass)
  ['bathroom', 'All pipes/valves'],
  ['bathroom', 'Bathroom door and frame'],
  ['bathroom', 'Showerhead (exterior only)'],
  ['bathroom', 'Toilet/bidet (including seat condition and alignment)'],
  ['bathroom', 'Hairdryer'],
  ['bathroom', 'Vents and behind mirror edges (if applicable)'],
  ['bathroom', 'Walls, light switches and baseboard tile'],
  ['bathroom', 'Polish all faucets and fixtures'],
  ['bathroom', 'Clean the mirror(s)'],
  ['bathroom', 'Sanitize curtain hooks'],
  ['bathroom', 'Remove buildup from shower, tub, sink, overflow drains, vanity, shower glass doors'],
  ['bathroom', 'Treat and remove mildew and hard water calcium deposit'],
  ['bathroom', 'Clean grout with grout brush and mop (per manufacturer recommendations)'],

  // Bedroom
  ['bedroom', 'Ceiling and wall coverings'],
  ['bedroom', 'Hard surface floors and carpet'],
  ['bedroom', 'Window treatments/drapes'],
  ['bedroom', 'Lighting and switch/control'],
  ['bedroom', 'Ceiling fans (if applicable)'],
  ['bedroom', 'All pieces of furniture'],
  ['bedroom', 'Electronics, remotes, telephones and cords'],
  ['bedroom', 'All electrical and USB outlets'],
  ['bedroom', 'Bed and bedframe (including headboard)'],
  ['bedroom', 'Mirror and artwork'],
  ['bedroom', 'Wet bar appliances'],

  // Bed
  ['bed', 'Headboard'],
  ['bed', 'Vacuum the mattress'],
  ['bed', 'Inspect for damage or soil; extract as needed'],
  ['bed', 'Clean bed frame'],

  // HVAC
  ['hvac', 'Exterior cover/access panel and grille'],
  ['hvac', 'Interior cabinet components'],
  ['hvac', 'Fan assembly'],
  ['hvac', 'Cooling/heating coil'],
  ['hvac', 'Cooling/heating control valve'],
  ['hvac', 'Condensation drain, pan and float switch'],
  ['hvac', 'Supplemental electric heat'],
  ['hvac', 'Outside air damper'],
  ['hvac', 'Thermostat'],
  ['hvac', 'Supply and return air temperature'],

  // Fire, Life & Safety
  ['fire_life_safety', 'Perform test on applicable device as required by code or Brand Standards, document results'],
  ['fire_life_safety', 'ADA devices'],
  ['fire_life_safety', 'Smoke/heat detectors'],
  ['fire_life_safety', 'Speaker and strobe'],
  ['fire_life_safety', 'Sprinkler head'],
  ['fire_life_safety', 'Carbon monoxide detector'],
  ['fire_life_safety', 'Refrigerant monitor device'],

  // Furniture, Room Amenities & Upholstery
  ['furniture_amenities', 'Furniture (all surfaces, inside and out)'],
  ['furniture_amenities', 'Lamps (including shades and lightbulbs)'],
  ['furniture_amenities', 'Electronics, cords and remote controls'],
  ['furniture_amenities', 'Room amenities (trays, clock, ice bucket, etc.)'],
  ['furniture_amenities', 'Iron, ironing station and luggage rack'],
  ['furniture_amenities', 'Vacuum all upholstered items'],
  ['furniture_amenities', 'Spot clean upholstery as needed'],
  ['furniture_amenities', 'Clean artwork/decor'],

  // Perimeter Surfaces
  ['perimeter_surfaces', 'Walls and high places'],
  ['perimeter_surfaces', 'Vents and HVAC'],
  ['perimeter_surfaces', 'All doors'],
  ['perimeter_surfaces', 'Closets and windows'],
  ['perimeter_surfaces', 'Window treatments, drapes and sheers'],
  ['perimeter_surfaces', 'Edge the carpet, wipe baseboards'],

  // Living Space Flooring
  ['living_space_flooring', 'Thoroughly vacuum carpet (extract if necessary)'],
  ['living_space_flooring', 'Sweep all hard floors thoroughly (polish/buff, if applicable)'],

  // Guest Room Preparation
  ['guest_room_prep', 'Collect items for laundering'],
  ['guest_room_prep', 'Remove all trash and used amenities'],
  ['guest_room_prep', 'Check cleanliness of other bed-related items'],
  ['guest_room_prep', 'Move furniture away from the wall and unplug lamps/electronics'],

  // Exterior Balcony (optional)
  ['balcony', 'Balcony/lanai doors and railing'],
  ['balcony', 'Furniture'],
  ['balcony', 'Paint'],
  ['balcony', 'Balcony lighting'],
  ['balcony', 'Sweep and clean balconies'],
  ['balcony', 'Wipe down all patio furniture'],
  ['balcony', 'Clean all door tracks and frames'],
  ['balcony', 'Clean exterior of window'],

  // Kitchen, Coffee & Bar (optional)
  ['kitchen_coffee_bar', 'All kitchen/bar countertops and surface areas'],
  ['kitchen_coffee_bar', 'All dishes, glassware and utensils'],
  ['kitchen_coffee_bar', 'Appliances (based on manufacturer recommendations)'],

  // Suites / Extended Stay (optional)
  ['suites_extended', 'All components of the dining area'],
  ['suites_extended', 'All components of the living room'],
  ['suites_extended', 'All components of the kitchen/wet bar area'],
  ['suites_extended', 'Sink, faucet, drain and garbage disposal'],
  ['suites_extended', 'Oven range, exhaust hood and lights'],
  ['suites_extended', 'Microwave'],
  ['suites_extended', 'Dishwasher (de-lime the dishwasher annually)'],
  ['suites_extended', 'All other appliances'],
];

export const AUDIT_CHECKLIST: ChecklistItem[] = RAW.map(([area, name], i) => ({
  id: `chk-${area}-${i}`,
  area,
  name,
}));

export function getChecklistForArea(area: AuditAreaKey): ChecklistItem[] {
  return AUDIT_CHECKLIST.filter((c) => c.area === area);
}

/** Item count per area — handy for area cards. */
export const AREA_ITEM_COUNTS: Record<AuditAreaKey, number> = AUDIT_AREAS.reduce((acc, a) => {
  acc[a.key] = AUDIT_CHECKLIST.filter((c) => c.area === a.key).length;
  return acc;
}, {} as Record<AuditAreaKey, number>);

export interface RoomFeatures {
  hasBalcony: boolean;
  isSuite: boolean;
}

/**
 * Deterministic feature derivation for the demo. Real data would carry these
 * flags on the room record. Top-floor rooms get balconies; rooms whose number
 * ends in 01/15/20 (and any "suite"-typed) are treated as suites/extended stay.
 */
export function deriveRoomFeatures(roomNumber: string, roomType?: string): RoomFeatures {
  const n = parseInt(roomNumber.replace(/\D/g, ''), 10) || 0;
  const last2 = n % 100;
  const floor = Math.floor(n / 100);
  const typeSuite = !!roomType && /suite|king|extended/i.test(roomType);
  return {
    hasBalcony: floor >= 4 || last2 % 10 === 5,
    isSuite: typeSuite || last2 === 1 || last2 === 20,
  };
}

/** Areas applicable to a given room — drops optional areas the room lacks. */
export function getAreasForRoom(roomNumber: string, roomType?: string): AuditArea[] {
  const f = deriveRoomFeatures(roomNumber, roomType);
  return AUDIT_AREAS.filter((a) => {
    if (!a.optional) return true;
    if (a.requires === 'balcony') return f.hasBalcony;
    if (a.requires === 'suite') return f.isSuite;
    return true;
  });
}
