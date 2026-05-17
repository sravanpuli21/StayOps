/**
 * Hilton OnQ "room-details" parser — one row per room snapshot.
 * Filename e.g. "May 17, 2026-BTRCI-...-room-details.csv".
 */
import Papa from 'papaparse';
import type {
  ParseInput,
  ParseResult,
  ParsedRoomSnapshot,
  ParserDef,
} from './types';
import { parseOnqFilename } from './onq/filename';

const DATE_RE = /^[A-Z][a-z]+ \d{1,2}, \d{4}$/;
const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function toIsoDate(humanDate: string): string | undefined {
  if (!humanDate) return undefined;
  if (!DATE_RE.test(humanDate.trim())) return undefined;
  const m = humanDate.trim().match(/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) return undefined;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (!month) return undefined;
  return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
}

interface RawRow {
  'Room Number'?: string;
  'Room Type'?: string;
  'Guest Name'?: string;
  'ADDN GUESTS'?: string;
  'HONORS TIER'?: string;
  'Arrival Date'?: string;
  'Departure Date'?: string;
  'OCC STATUS'?: string;
  'HSK STATUS'?: string;
  'Rate Plan'?: string;
  'Reservation Status'?: string;
  'Pending Status'?: string;
  'Maintenance'?: string;
  'Last Occupied'?: string;
}

export async function parseOnqRoomDetails(input: ParseInput): Promise<ParseResult> {
  const warnings: string[] = [];
  if (!input.filename) {
    return { warnings, errors: ['filename required for OnQ room-details (date + hotel code live there)'] };
  }
  const meta = parseOnqFilename(input.filename);
  if (!meta) {
    return { warnings, errors: [`unrecognized OnQ filename pattern: ${input.filename}`] };
  }
  if (meta.dedupSuffix) {
    warnings.push(`filename has suffix "${meta.dedupSuffix.trim()}" — proceeding (idempotent upsert by captured_at + room_number)`);
  }
  if (meta.reportType !== 'room-details') {
    return { warnings, errors: [`reportType is "${meta.reportType}", expected "room-details"`] };
  }

  const capturedAt = `${meta.date}T23:59:59Z`;
  const text = input.buffer.toString('utf8');
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors.slice(0, 3)) warnings.push(`csv parse: ${e.message} (row ${e.row})`);
  }

  const room_snapshots: ParsedRoomSnapshot[] = [];
  for (const row of parsed.data) {
    const roomNumber = row['Room Number']?.trim();
    if (!roomNumber) continue;
    room_snapshots.push({
      hotelCode: meta.hotelCode,
      captured_at: capturedAt,
      room_number: roomNumber,
      room_type_code:     row['Room Type']?.trim() || undefined,
      occ_status:         row['OCC STATUS']?.trim() || undefined,
      hsk_status:         row['HSK STATUS']?.trim() || undefined,
      guest_name:         row['Guest Name']?.trim() || undefined,
      addn_guests:        row['ADDN GUESTS']?.trim() || undefined,
      honors_tier:        row['HONORS TIER']?.trim() || undefined,
      arrival_date:       toIsoDate(row['Arrival Date'] ?? ''),
      departure_date:     toIsoDate(row['Departure Date'] ?? ''),
      rate_plan:          row['Rate Plan']?.trim() || undefined,
      reservation_status: row['Reservation Status']?.trim() || undefined,
      pending_status:     row['Pending Status']?.trim() || undefined,
      maintenance:        row['Maintenance']?.trim() || undefined,
      last_occupied:      toIsoDate(row['Last Occupied'] ?? ''),
    });
  }

  return {
    room_snapshots: room_snapshots.length > 0 ? room_snapshots : undefined,
    warnings,
    errors: [],
  };
}

export const onqRoomDetailsParser: ParserDef = {
  id: 'onq-room-details',
  pmsId: 'onq',
  reportType: 'onq_room_details',
  matchFilename: /-room-details(\s*\(\d+\))?\.csv$/i,
  parse: parseOnqRoomDetails,
};
