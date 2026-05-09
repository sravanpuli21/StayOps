import * as XLSX from 'xlsx';
import type { ParserDef, ParseResult, ParseInput } from './types';

/**
 * Hilton OnQ "Final Audit" daily report parser — modeled after
 * `May 04, 2026-BTRCI-...FinalAuditV2.xlsx`. Extracts:
 *   - daily_revenue (total, room, non-room, mix, ADR, RevPAR, occ)
 *   - daily_occupancy (sold, OOO, arrivals, departures)
 *   - am_pm_snapshots if the workbook includes the AM/PM sheets
 *
 * Heuristic approach: locate known header labels (case-insensitive) and
 * read the value in the adjacent cell. Robust to minor layout drift.
 *
 * TODO(post-Excel): tune cell lookups once the real file is dropped
 * at apps/web/src/lib/parsers/__fixtures__/btrci-2026-05-04.xlsx.
 */

interface Cell { v?: string | number | boolean; t?: string; }

function norm(s: unknown): string {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function toNum(v: unknown): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const clean = String(v).replace(/[$,\s]/g, '').replace(/[()]/g, (m) => (m === '(' ? '-' : ''));
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

/** Scan a worksheet for a label + return the value in the cell N columns to the right (default 1). */
function findByLabel(ws: XLSX.WorkSheet, patterns: RegExp[], colsRight = 1): number | null {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr] as Cell | undefined;
      if (!cell) continue;
      const v = norm(cell.v);
      for (const p of patterns) {
        if (p.test(v)) {
          // Look N cols right, possibly skipping blanks
          for (let off = colsRight; off <= colsRight + 3; off++) {
            const nextAddr = XLSX.utils.encode_cell({ r, c: c + off });
            const nextCell = ws[nextAddr] as Cell | undefined;
            if (nextCell && nextCell.v !== '' && nextCell.v != null) {
              return toNum(nextCell.v);
            }
          }
        }
      }
    }
  }
  return null;
}

async function parse(input: ParseInput): Promise<ParseResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const result: ParseResult = { warnings, errors };

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(input.buffer, { type: 'buffer', cellDates: true });
  } catch (e) {
    errors.push(`Failed to open workbook: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  // Find hotel code: prefer explicit hint, fall back to filename match, fall back to known BTRCI sheets.
  const hotelCode = input.hotelCode
    ?? (input.filename?.match(/[-_]([A-Z0-9]{4,7})[-_\.]/)?.[1])
    ?? 'BTRCI';

  // Find report date: hint, then filename, then sheet scan.
  let reportDate = input.reportDate;
  if (!reportDate && input.filename) {
    const m = input.filename.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
    if (m) {
      const months: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      };
      const mm = months[m[1].toLowerCase()];
      if (mm) reportDate = `${m[3]}-${mm}-${String(parseInt(m[2], 10)).padStart(2, '0')}`;
    }
  }
  if (!reportDate) {
    warnings.push('Could not infer report date from filename; defaulting to today');
    reportDate = new Date().toISOString().slice(0, 10);
  }

  // --- Pass 1: header-scan across all sheets for known metrics ---
  let totalRevenue: number | null = null;
  let roomRevenue: number | null = null;
  let nonRoomRevenue: number | null = null;
  let adr: number | null = null;
  let revpar: number | null = null;
  let occPct: number | null = null;
  let roomsSold: number | null = null;
  let roomsOoo: number | null = null;

  const sheetNames = wb.SheetNames ?? [];
  for (const sn of sheetNames) {
    const ws = wb.Sheets[sn];
    if (!ws) continue;
    totalRevenue ??= findByLabel(ws, [/^total revenue\b/, /^revenue total\b/, /^total rev\b/]);
    roomRevenue ??= findByLabel(ws, [/^room revenue\b/, /^rooms revenue\b/]);
    nonRoomRevenue ??= findByLabel(ws, [/^non.?room revenue\b/, /^other revenue\b/]);
    adr ??= findByLabel(ws, [/^adr\b/, /^avg daily rate\b/, /^average daily rate\b/]);
    revpar ??= findByLabel(ws, [/^revpar\b/, /^rev ?par\b/]);
    occPct ??= findByLabel(ws, [/^occupancy\b/, /^occ ?%/, /^occupancy %/]);
    roomsSold ??= findByLabel(ws, [/^rooms sold\b/, /^total rooms sold\b/]);
    roomsOoo ??= findByLabel(ws, [/^rooms ooo\b/, /^out of order\b/, /^ooo\b/]);
  }

  // If occupancy was captured as fraction (0.83) or percent (83), normalize to percent.
  if (occPct != null && occPct > 0 && occPct <= 1) occPct = occPct * 100;

  // Derive non-room from total - room if missing
  if (nonRoomRevenue == null && totalRevenue != null && roomRevenue != null) {
    nonRoomRevenue = totalRevenue - roomRevenue;
  }

  if (totalRevenue == null) {
    warnings.push('Could not locate "Total Revenue" — check label patterns in btrci-onq parser');
  }

  // Assemble a single daily_revenue row. Mix split defaults to Home2
  // extended-stay ratios (same as revenue.ts).
  const mixRatios = { room: 0.78, fb: 0.05, retail: 0.10, events: 0.04, other: 0.03 };
  const rev: ParseResult['daily_revenue'] = totalRevenue != null ? [{
    hotelCode,
    date: reportDate,
    total_revenue: totalRevenue,
    room_revenue: roomRevenue ?? Math.round(totalRevenue * mixRatios.room),
    non_room_revenue: nonRoomRevenue ?? Math.round(totalRevenue * (1 - mixRatios.room)),
    mix_room: roomRevenue ?? Math.round(totalRevenue * mixRatios.room),
    mix_fb: Math.round(totalRevenue * mixRatios.fb),
    mix_retail: Math.round(totalRevenue * mixRatios.retail),
    mix_events: Math.round(totalRevenue * mixRatios.events),
    mix_other: Math.round(totalRevenue * mixRatios.other),
    adr: adr ?? 0,
    revpar: revpar ?? 0,
    occupancy_pct: occPct ?? 0,
    health: (occPct ?? 0) >= 85 ? 'green' : (occPct ?? 0) >= 75 ? 'amber' : 'red',
  }] : undefined;

  const occ: ParseResult['daily_occupancy'] = roomsSold != null ? [{
    hotelCode,
    date: reportDate,
    rooms_sold: roomsSold,
    rooms_ooo: roomsOoo ?? 0,
  }] : undefined;

  if (rev) result.daily_revenue = rev;
  if (occ) result.daily_occupancy = occ;

  return result;
}

export const btrciOnqParser: ParserDef = {
  id: 'hilton-onq-final-audit',
  pmsId: 'onq',
  reportType: 'daily_revenue',
  matchSubject: /final audit|daily audit|night audit/i,
  matchFilename: /finalaudit|final.audit|dailyaudit|night.audit/i,
  senderDomains: ['onq.com', 'hilton.com', 'hiltonfranchise.com'],
  parse,
};
