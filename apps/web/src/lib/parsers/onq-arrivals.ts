/**
 * Hilton OnQ "arrivals" parser — one row per expected check-in.
 * Filename e.g. "May 17, 2026-BTRCI-...-arrivals.csv".
 */
import Papa from 'papaparse';
import type {
  ParseInput,
  ParseResult,
  ParsedReservationArrival,
  ParserDef,
} from './types';
import { parseOnqFilename } from './onq/filename';
import { parseOnqNumber } from './onq/parse-currency';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function toIsoDate(humanDate: string): string | undefined {
  if (!humanDate) return undefined;
  const m = humanDate.trim().match(/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) return undefined;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (!month) return undefined;
  return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
}

interface RawRow {
  'Guest Name'?: string;
  'ADDN GUESTS'?: string;
  'Arrival Date'?: string;
  'Departure Date'?: string;
  'Confirmation Number'?: string;
  'Rate Plan'?: string;
  'Adults'?: string;
  'CHILDREN'?: string;
  'Company Name'?: string;
  'Avg. Room Rate'?: string;
  'Avg. Room Taxes'?: string;
  'Fee'?: string;
  'HONORS TIER'?: string;
  'Add On'?: string;
  'Stay Requests'?: string;
  'Arrival Time'?: string;
  'Digital Check In'?: string;
  'Room Type'?: string;
  'Room Number'?: string;
  'Guarantee Type'?: string;
  'VIP Guest'?: string;
  'Guest Tier'?: string;
  'Booking Remarks'?: string;
  'Stay Remarks'?: string;
  'Virtual CC'?: string;
}

export async function parseOnqArrivals(input: ParseInput): Promise<ParseResult> {
  const warnings: string[] = [];
  if (!input.filename) {
    return { warnings, errors: ['filename required for OnQ arrivals'] };
  }
  const meta = parseOnqFilename(input.filename);
  if (!meta) {
    return { warnings, errors: [`unrecognized OnQ filename pattern: ${input.filename}`] };
  }
  if (meta.dedupSuffix) {
    warnings.push(`filename has suffix "${meta.dedupSuffix.trim()}" — proceeding (idempotent upsert by confirmation_number)`);
  }
  if (meta.reportType !== 'arrivals') {
    return { warnings, errors: [`reportType is "${meta.reportType}", expected "arrivals"`] };
  }

  const text = input.buffer.toString('utf8');
  const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors.slice(0, 3)) warnings.push(`csv parse: ${e.message} (row ${e.row})`);
  }

  const reservation_arrivals: ParsedReservationArrival[] = [];
  for (const row of parsed.data) {
    const conf = row['Confirmation Number']?.trim();
    if (!conf) continue;
    reservation_arrivals.push({
      hotelCode:           meta.hotelCode,
      confirmation_number: conf,
      arrival_date:        toIsoDate(row['Arrival Date'] ?? ''),
      departure_date:      toIsoDate(row['Departure Date'] ?? ''),
      guest_name:          row['Guest Name']?.trim() || undefined,
      addn_guests:         row['ADDN GUESTS']?.trim() || undefined,
      room_type:           row['Room Type']?.trim() || undefined,
      room_number:         row['Room Number']?.trim() || undefined,
      rate_plan:           row['Rate Plan']?.trim() || undefined,
      adults:              parseOnqNumber(row['Adults']) ?? undefined,
      children:            parseOnqNumber(row['CHILDREN']) ?? undefined,
      company:             row['Company Name']?.trim() || undefined,
      avg_room_rate:       parseOnqNumber(row['Avg. Room Rate']) ?? undefined,
      avg_room_taxes:      parseOnqNumber(row['Avg. Room Taxes']) ?? undefined,
      fee:                 parseOnqNumber(row['Fee']) ?? undefined,
      honors_tier:         row['HONORS TIER']?.trim() || undefined,
      vip_guest:           row['VIP Guest']?.trim() || undefined,
      guest_tier:          row['Guest Tier']?.trim() || undefined,
      guarantee_type:      row['Guarantee Type']?.trim() || undefined,
      arrival_time:        row['Arrival Time']?.trim() || undefined,
      digital_check_in:    row['Digital Check In']?.trim() || undefined,
      add_on:              row['Add On']?.trim() || undefined,
      stay_requests:       row['Stay Requests']?.trim() || undefined,
      booking_remarks:     row['Booking Remarks']?.trim() || undefined,
      stay_remarks:        row['Stay Remarks']?.trim() || undefined,
      virtual_cc:          row['Virtual CC']?.trim() || undefined,
    });
  }

  return {
    reservation_arrivals: reservation_arrivals.length > 0 ? reservation_arrivals : undefined,
    warnings,
    errors: [],
  };
}

export const onqArrivalsParser: ParserDef = {
  id: 'onq-arrivals',
  pmsId: 'onq',
  reportType: 'onq_arrivals',
  matchFilename: /-arrivals(\s*\(\d+\))?\.csv$/i,
  parse: parseOnqArrivals,
};
