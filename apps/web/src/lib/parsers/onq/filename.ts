/**
 * Hilton OnQ exports arrive with a deterministic filename pattern:
 *
 *   "May 17, 2026-BTRCI-Home2 Suites By Hilton - Baton Rouge Citiplace, LA-final-audit.csv"
 *   "May 17, 2026-BTRCI-Home2 Suites By Hilton - Baton Rouge Citiplace, LA-room-details (1).csv"
 *
 * Structure: <Month Day, Year>-<HotelCode>-<Long Property Name>-<reportType>[ (n)].csv
 *
 * The long name itself contains hyphens, so the report type is whitelisted —
 * we match against the four known suffixes instead of "last hyphen segment".
 */

export type OnqReportType =
  | 'final-audit'
  | 'high-balance-reports'
  | 'room-details'
  | 'arrivals';

export interface ParsedOnqFilename {
  date: string;              // ISO YYYY-MM-DD
  hotelCode: string;         // e.g. 'BTRCI'
  longName: string;          // e.g. 'Home2 Suites By Hilton - Baton Rouge Citiplace, LA'
  reportType: OnqReportType;
  dedupSuffix: string | null; // e.g. ' (1)' if filename was renamed on re-download
}

// Numbered groups (target ES2017 so no named groups):
//   1=date, 2=code, 3=long name, 4=reportType, 5=dedup-suffix
const FILENAME_RE =
  /^([A-Z][a-z]+ \d{1,2}, \d{4})-([A-Z0-9]{3,10})-(.+?)-(final-audit|high-balance-reports|room-details|arrivals)(\s*\(\d+\))?\.csv$/i;

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/**
 * Convert "May 17, 2026" → "2026-05-17" without going through Date()
 * (avoids timezone surprises).
 */
function toIsoDate(humanDate: string): string | null {
  const m = humanDate.match(/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) return null;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (!month) return null;
  const day = m[2].padStart(2, '0');
  return `${m[3]}-${month}-${day}`;
}

export function parseOnqFilename(filename: string): ParsedOnqFilename | null {
  const m = filename.match(FILENAME_RE);
  if (!m) return null;
  const [, dateStr, code, long, reportType, dedup] = m;
  const iso = toIsoDate(dateStr);
  if (!iso) return null;
  return {
    date: iso,
    hotelCode: code.toUpperCase(),
    longName: long.trim(),
    reportType: reportType.toLowerCase() as OnqReportType,
    dedupSuffix: dedup ?? null,
  };
}
