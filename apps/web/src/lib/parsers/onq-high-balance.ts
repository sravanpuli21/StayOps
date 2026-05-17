/**
 * Hilton OnQ "high-balance-reports" parser — one row per guest with a high
 * folio balance. Often empty (no alerts).
 */
import Papa from 'papaparse';
import type {
  ParseInput,
  ParseResult,
  ParsedHighBalanceAlert,
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
  'Room Number'?: string;
  'Guest Name'?: string;
  'Guest Tier'?: string;
  'Arrival Date'?: string;
  'Departure Date'?: string;
  'Room Rate'?: string;
  'Folio Name'?: string;
  'Folio Balance'?: string;
  'Credit Balance'?: string;
  'Outstanding Balance'?: string;
  'Payment Method'?: string;
  'Available Credit Limit'?: string;
  'Auto Top Off Status'?: string;
}

export async function parseOnqHighBalance(input: ParseInput): Promise<ParseResult> {
  const warnings: string[] = [];
  if (!input.filename) {
    return { warnings, errors: ['filename required for OnQ high-balance-reports'] };
  }
  const meta = parseOnqFilename(input.filename);
  if (!meta) {
    return { warnings, errors: [`unrecognized OnQ filename pattern: ${input.filename}`] };
  }
  if (meta.dedupSuffix) {
    warnings.push(`filename has suffix "${meta.dedupSuffix.trim()}" — proceeding (idempotent upsert by captured_at + folio_name)`);
  }
  if (meta.reportType !== 'high-balance-reports') {
    return { warnings, errors: [`reportType is "${meta.reportType}", expected "high-balance-reports"`] };
  }

  const capturedAt = `${meta.date}T23:59:59Z`;
  const text = input.buffer.toString('utf8');
  const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors.slice(0, 3)) warnings.push(`csv parse: ${e.message} (row ${e.row})`);
  }

  const high_balance_alerts: ParsedHighBalanceAlert[] = [];
  for (const row of parsed.data) {
    const folio = row['Folio Name']?.trim();
    if (!folio) continue;
    high_balance_alerts.push({
      hotelCode: meta.hotelCode,
      captured_at: capturedAt,
      folio_name: folio,
      room_number:            row['Room Number']?.trim() || undefined,
      guest_name:             row['Guest Name']?.trim() || undefined,
      guest_tier:             row['Guest Tier']?.trim() || undefined,
      arrival_date:           toIsoDate(row['Arrival Date'] ?? ''),
      departure_date:         toIsoDate(row['Departure Date'] ?? ''),
      room_rate:              parseOnqNumber(row['Room Rate']) ?? undefined,
      folio_balance:          parseOnqNumber(row['Folio Balance']) ?? undefined,
      credit_balance:         parseOnqNumber(row['Credit Balance']) ?? undefined,
      outstanding_balance:    parseOnqNumber(row['Outstanding Balance']) ?? undefined,
      payment_method:         row['Payment Method']?.trim() || undefined,
      available_credit_limit: parseOnqNumber(row['Available Credit Limit']) ?? undefined,
      auto_top_off_status:    row['Auto Top Off Status']?.trim() || undefined,
    });
  }

  // Empty file (header-only) is fine — just no alerts today.
  return {
    high_balance_alerts: high_balance_alerts.length > 0 ? high_balance_alerts : undefined,
    warnings,
    errors: [],
  };
}

export const onqHighBalanceParser: ParserDef = {
  id: 'onq-high-balance',
  pmsId: 'onq',
  reportType: 'onq_high_balance',
  matchFilename: /-high-balance-reports(\s*\(\d+\))?\.csv$/i,
  parse: parseOnqHighBalance,
};
