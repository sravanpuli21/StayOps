/**
 * Hilton OnQ Final Audit — strict label dictionary.
 *
 * Every row label maps to exactly one (category, type, subtypeGroup, subtype)
 * tuple. No section-conditional inference, no defaults derived from row names.
 *
 * Rows whose label is absent here are surfaced as `UNMAPPED` (match_status =
 * 'Needs Review') — never silently dropped.
 *
 * Match keys are uppercased + trimmed + whitespace-collapsed.
 */

export interface ChargeMapping {
  /** 'Revenue' | 'Taxes' | 'Payment Methods' | 'Room Status' | 'Rooms Availability' | 'Occupancy' | 'KPI' | 'Unmapped' */
  category: string;
  /** 'Room Revenue' | 'No Show Room Revenue' | 'Charges' | tax/payment/mix-match values | 'Needs Review' */
  type: string;
  /** 'Not Applicable' for Room Revenue / No Show; group name for Charges; null for non-revenue. */
  subtypeGroup: string | null;
  /** Leaf bucket; null for non-revenue rows. */
  subtype: string | null;
}

export function normaliseLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

/** Sentinel for unknown rows — preserved with match_status='Needs Review'. */
export const UNMAPPED: ChargeMapping = {
  category: 'Unmapped',
  type: 'Needs Review',
  subtypeGroup: null,
  subtype: null,
};

/**
 * Operational rows from the Mix/Match ("Type" header) section that the user
 * has explicitly told us to skip — they exist in the file but aren't part of
 * the current data model. Listed verbatim so future requests to track any of
 * them can just delete the entry.
 */
export const IGNORED_LABELS: ReadonlySet<string> = new Set([
  'SAME DAY BOOKINGS',
  'DAY USE ROOMS',
  'STAYOVER ROOMS',
  'TOTAL GUESTS',
  'CHILDREN',
  'ADULTS',
  'TOTAL GUEST CERTIFIED',
  'TOTAL GRATIS',
  'HOUSE ROOMS',
  'DEPARTED RESERVATIONS',
  'CHECKED IN RESERVATIONS',
  'CANCELLED',
].map(normaliseLabel));

export function isIgnoredLabel(raw: string): boolean {
  return IGNORED_LABELS.has(normaliseLabel(raw));
}

export const CHARGE_MAPPING: Record<string, ChargeMapping> = {
  // ── Revenue / Room Revenue ───────────────────────────────────────────────
  'EXTRA NO SHOW ROOM REVENUE':      { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Direct Room Revenue' },
  'GUEST ROOM':                      { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Direct Room Revenue' },
  'GUEST ROOM HONORS':               { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Direct Room Revenue' },
  'ROOM UPGRADE':                    { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Room Upgrade' },
  'EXTRA ADULT':                     { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Other' },
  'PREPAID EARLY CHECKOUT':          { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Other' },
  'ROOM REVENUE ADJUSTMENT':         { category: 'Revenue', type: 'Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'Other' },

  // ── Revenue / No Show Room Revenue ───────────────────────────────────────
  'NO SHOW ROOM REVENUE':            { category: 'Revenue', type: 'No Show Room Revenue', subtypeGroup: 'Not Applicable', subtype: 'No Show Room Revenue' },

  // ── Revenue / Charges / Events ───────────────────────────────────────────
  'MEETING ROOM':                    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Events', subtype: 'Meetings' },

  // ── Revenue / Charges / F&B ──────────────────────────────────────────────
  'ADD-ON BREAKFAST':                { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Restaurant' },
  'ALLOWANCE ADD-ON BREAKFAST':      { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Restaurant' },
  'SUITE SHOP - BEVERAGE':           { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },
  'SUITE SHOP - FOOD':               { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },
  'SUITE SHOP - SUNDRY':             { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },
  'SUITE SHOP - VIDEO':              { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },
  'VENDING COMMISSIONS':             { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },
  'VENDING MACHINE REVENUE':         { category: 'Revenue', type: 'Charges', subtypeGroup: 'F&B', subtype: 'Front Market' },

  // ── Revenue / Charges / Additional Room Charges ──────────────────────────
  'ADD-ON EARLY ARRIVAL':            { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Early Arrival' },
  'ALLOWANCE ADD-ON EARLY ARRIVAL':  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Early Arrival' },
  'EARLY ARRIVAL':                   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Early Arrival' },
  'ALLOWANCE ADDON LATE CHECK OUT':  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Late Checkout' },
  'EARLY DEPARTURE FEE':             { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Late Checkout' },
  'LATE CHECK OUT CHARGES':          { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Late Checkout' },
  'LATE DEPARTURE':                  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Additional Room Charges', subtype: 'Late Checkout' },

  // ── Revenue / Charges / Other Charges ────────────────────────────────────
  'ADD-ON POINTS':                   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Brand Revenue' },
  'ALLOWANCE ADD-ON MORE POINTS':    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Brand Revenue' },
  'COMMISSION REVENUE':              { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Brand Revenue' },
  'ADD-ON VALET PARKING':            { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Valet Parking' },
  'ALLOWANCE ADD-ON VALET PARKING':  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Valet Parking' },
  'ALLOWANCE ADD-ON SELF-PARKING':   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Valet Parking' },
  'ALLOWANCE ADD-ON TRAVEL W/ PET':  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'PET FEE':                         { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'PET FEE 1 TO 4 NIGHTS':           { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'PET FEE 5 OR MORE NIGHTS':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'PET FEE ALLOW':                   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'PET FEE MANUAL':                  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'SERVICE ANIMAL':                  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Pet Charges' },
  'CANCELLATION CHARGE':             { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Cancellation Charges' },
  'LATE CANCEL ROOM REVENUE':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Cancellation Charges' },
  'PREPAID LATE CANCEL ROOM REVENUE':{ category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Cancellation Charges' },
  'CLEANING FEE':                    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Cleaning Fees' },
  'COIN LAUNDRY':                    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Laundry' },
  'VALET LAUNDRY':                   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Laundry' },
  'MISC REVENUE NON-TAXABLE':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Non Taxable Revenue' },

  // ── Revenue / Charges / Other Charges / Misc Charges (catch-all explicit) ─
  '100% GTD OTHER ALLOWANCE':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  '100% GTD PHONE ALLOWANCE':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  '100% GTD RESTAURANT ALLOWANCE':   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  '100% GTD RESTAURANT OTHER':       { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  '100% GUARANTEE ALLOWANCE':        { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'ADVANCE PURCHASE 3.5% DISCOUNT':  { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'ADVANCE PURCHASE CHANGE FEE':     { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'BALANCE FORWARD':                 { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'BALANCE TRANSFER':                { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'CHARGE-BACKS':                    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'COPIES':                          { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'FAX':                             { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'GUEST CERTIFICATE':               { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'GUEST EQUIPMENT RENTAL':          { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'MISC REVENUE':                    { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'POSTAGE':                         { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'PREMIUM INTERNET ACCESS':         { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'RETURNED CHECKS':                 { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'SALVAGE SALES':                   { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'SMOKING FEE':                     { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'TELEPHONE-LD (FOREIGN)':          { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'TELEPHONE-LD (INTERSTATE)':       { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'TELEPHONE-LD (INTRASTATE)':       { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },
  'TELEPHONE-LOCAL':                 { category: 'Revenue', type: 'Charges', subtypeGroup: 'Other Charges', subtype: 'Misc Charges' },

  // ── Taxes ────────────────────────────────────────────────────────────────
  'CITY TAX':                        { category: 'Taxes', type: 'CITY',       subtypeGroup: null, subtype: null },
  'OCCUPANCY TAX':                   { category: 'Taxes', type: 'OCCUPANCY',  subtypeGroup: null, subtype: null },
  'ROOM STATE TAX':                  { category: 'Taxes', type: 'ROOM STATE', subtypeGroup: null, subtype: null },
  'STATE TAX':                       { category: 'Taxes', type: 'STATE',      subtypeGroup: null, subtype: null },

  // ── Payment Methods ──────────────────────────────────────────────────────
  'CASH':                                  { category: 'Payment Methods', type: 'Cash',        subtypeGroup: null, subtype: null },
  'CHECK':                                 { category: 'Payment Methods', type: 'Cash',        subtypeGroup: null, subtype: null },
  'AMEX':                                  { category: 'Payment Methods', type: 'Card',        subtypeGroup: null, subtype: null },
  'DISCOVER':                              { category: 'Payment Methods', type: 'Card',        subtypeGroup: null, subtype: null },
  'MASTER':                                { category: 'Payment Methods', type: 'Card',        subtypeGroup: null, subtype: null },
  'VISA':                                  { category: 'Payment Methods', type: 'Card',        subtypeGroup: null, subtype: null },
  'HONORS SETTLEMENT':                     { category: 'Payment Methods', type: 'hilton',      subtypeGroup: null, subtype: null },
  'GUARANTEE TO HOTEL':                    { category: 'Payment Methods', type: 'hilton',      subtypeGroup: null, subtype: null },
  'BALANCE FORWARD DIRECT BILL PAYMENT':   { category: 'Payment Methods', type: 'DirectBill',  subtypeGroup: null, subtype: null },
  'PAY WITH HONORS POINTS':                { category: 'Payment Methods', type: 'hilton',      subtypeGroup: null, subtype: null },
  'HILTON ADVANCE PURCHASE':               { category: 'Payment Methods', type: 'hilton',      subtypeGroup: null, subtype: null },
  'BALANCE FORWARD PAYMENT':               { category: 'Payment Methods', type: 'DirectBill',  subtypeGroup: null, subtype: null },
  'AR WRITE OFF':                          { category: 'Payment Methods', type: 'adjustments', subtypeGroup: null, subtype: null },
  'BILL TO COMPANY':                       { category: 'Payment Methods', type: 'DirectBill',  subtypeGroup: null, subtype: null },

  // ── Mix/Match ────────────────────────────────────────────────────────────
  'DOWN ROOMS':                              { category: 'Room Status',         type: 'OOO',                  subtypeGroup: null, subtype: null },
  'ZERO RATE ROOMS':                         { category: 'Occupancy',           type: 'Zero Rate Rooms',      subtypeGroup: null, subtype: null },
  'VACANT ROOMS':                            { category: 'Rooms Availability',  type: 'Rooms Vacant',         subtypeGroup: null, subtype: null },
  'TOTAL SOLD ROOMS':                        { category: 'Rooms Availability',  type: 'Rooms Sold',           subtypeGroup: null, subtype: null },
  'DIRTY ROOMS':                             { category: 'Room Status',         type: 'Dirty',                subtypeGroup: null, subtype: null },
  'CLEAN ROOMS':                             { category: 'Room Status',         type: 'Clean',                subtypeGroup: null, subtype: null },
  'AVAILABLE ROOMS':                         { category: 'Rooms Availability',  type: 'Rooms Available',      subtypeGroup: null, subtype: null },
  'NO SHOW':                                 { category: 'Occupancy',           type: 'No Show',              subtypeGroup: null, subtype: null },
  'COMPLIMENTARY ROOMS':                     { category: 'Occupancy',           type: 'Zero Rate Rooms',      subtypeGroup: null, subtype: null },
  'ROOM SOLD WITHOUT COMP/HOUSE USE ROOMS':  { category: 'Occupancy',           type: 'Total Rooms Occupied', subtypeGroup: null, subtype: null },

  // ── KPI rows ─────────────────────────────────────────────────────────────
  'OCCUPANCY INCLUDING DOWN ROOMS AND EXCLUDING COMP, HOUSE USE ROOMS': { category: 'KPI', type: 'Occupancy %', subtypeGroup: null, subtype: null },
  'ADR INCLUDING COMP, HOUSE USE ROOMS':                                { category: 'KPI', type: 'ADR',         subtypeGroup: null, subtype: null },
  'ROOMS REVPAR WITH OUT OF ORDER ROOMS':                               { category: 'KPI', type: 'RevPar',      subtypeGroup: null, subtype: null },
  'REVPAR WITH OUT OF ORDER ROOMS':                                     { category: 'KPI', type: 'RevPar',      subtypeGroup: null, subtype: null },
};

/** Look up a row label. Returns the matched mapping or undefined (caller decides how to handle unmapped). */
export function lookupMapping(label: string): ChargeMapping | undefined {
  return CHARGE_MAPPING[normaliseLabel(label)];
}
