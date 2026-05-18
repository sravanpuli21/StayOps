/**
 * Hilton OnQ "room-details" parser — one record per room per snapshot.
 * Filename e.g. "May 17, 2026-BTRCI-...-room-details.csv".
 *
 * Per the user's RoomStatus spec, only the following are persisted:
 *   - Room Number
 *   - OCC STATUS         (kept verbatim as raw_occ_status; not used for display)
 *   - Reservation Status (kept verbatim as raw_reservation_status; drives `type`)
 *
 * `type` mapping from Reservation Status:
 *   IN HOUSE     → 'Occupied'
 *   Arrival      → 'Assigned'
 *   blank/empty  → 'Available'
 *   CHECKED OUT  → 'Dirty'
 *   anything else → raw value, match_status='Needs Review'
 *
 * Guest Name, ADDN GUESTS, and HONORS TIER are intentionally NOT extracted.
 */
import Papa from 'papaparse';
import type {
  ParseInput, ParseResult, ParsedRoomSnapshot, ParserDef,
} from './types';
import { parseOnqFilename } from './onq/filename';

interface RawRow {
  'Room Number'?: string;
  'OCC STATUS'?: string;
  'Reservation Status'?: string;
  'Departure Date'?: string;
}

const DEPART_DATE_RE = /^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/;
const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/** Convert "May 19, 2026" → "2026-05-19". Returns null if format unrecognised. */
function toIsoDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.trim().match(DEPART_DATE_RE);
  if (!m) return null;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (!month) return null;
  return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
}

/**
 * Reservation Status → display Type. `capturedDate` is the snapshot's date
 * (YYYY-MM-DD). When status is IN HOUSE and the departure date is later than
 * the snapshot date, the guest is mid-stay → 'Stayover' overrides 'Occupied'.
 */
function deriveType(
  rawReservationStatus: string | null,
  capturedDate: string,
  departureIso: string | null,
): { type: string; matchStatus: 'Mapped' | 'Needs Review' } {
  const raw = (rawReservationStatus ?? '').trim();
  const upper = raw.toUpperCase();
  if (upper === '')            return { type: 'Available', matchStatus: 'Mapped' };
  if (upper === 'IN HOUSE') {
    const isStayover = !!departureIso && departureIso > capturedDate;
    return { type: isStayover ? 'Stayover' : 'Occupied', matchStatus: 'Mapped' };
  }
  if (upper === 'ARRIVAL')     return { type: 'Assigned', matchStatus: 'Mapped' };
  if (upper === 'CHECKED OUT') return { type: 'Dirty',    matchStatus: 'Mapped' };
  // Surface unknown values for review — preserve the raw label as the type.
  return { type: raw, matchStatus: 'Needs Review' };
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

  // Multiple rows can appear for the same room (split reservations, etc.).
  // Keep the first one we see — `applyParseResult` upserts by (hotel,
  // captured_at, room_number) and would otherwise hit the PK constraint.
  const seen = new Set<string>();
  const room_snapshots: ParsedRoomSnapshot[] = [];
  for (const row of parsed.data) {
    const roomNumber = row['Room Number']?.trim();
    if (!roomNumber) continue;
    if (seen.has(roomNumber)) continue;
    seen.add(roomNumber);

    const rawOcc   = row['OCC STATUS']?.trim() ?? '';
    const rawResv  = row['Reservation Status']?.trim() ?? '';
    const departureIso = toIsoDate(row['Departure Date']);
    const { type, matchStatus } = deriveType(rawResv, meta.date, departureIso);

    room_snapshots.push({
      hotelCode: meta.hotelCode,
      captured_at: capturedAt,
      room_number: roomNumber,
      raw_occ_status: rawOcc || null,
      raw_reservation_status: rawResv || null,
      category: 'RoomStatus',
      type,
      subtype: null,
      match_status: matchStatus,
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
