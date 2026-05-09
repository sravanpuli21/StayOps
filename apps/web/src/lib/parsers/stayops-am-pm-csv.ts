import type { ParserDef, ParseInput, ParseResult, ParsedAmPmSnapshot } from './types';

/**
 * stayops AM/PM Report CSV parser.
 *
 * Format (multi-hotel snapshot):
 *   Line 1: AM-PM Report · <Region/Scope> · 9:00 AM Snapshot
 *   Line 2: Generated: 2026-04-25T09:00:00-04:00
 *   Line 3: blank
 *   Line 4: Property,City,State,# Rooms,Sold,OOO,Left to Sell,ADR,Avg Price,RevPAR,Occupancy %
 *   Line 5+: one row per hotel
 *
 * The hotel is named by its shortName in the report; we map to hotel code
 * using a shortName→code lookup in apply.ts (already stores canonical HOTELS list).
 * For this parser we emit hotelCode derived from the shortName match, or
 * leave a warning if no match.
 */

// shortName → code lookup (inlined from seed data to avoid workspace import
// order problems). Keep in sync with packages/shared/src/data/hotels.ts.
const SHORT_NAME_TO_CODE: Record<string, string> = {
  'hampton gateway': 'SAVGW',
  'cotton sail': 'SAVVY',
  'cambria savannah': 'GA989',
  'hilton garden midtown': 'SAVMT',
  'hampton midtown': 'SAVMD',
  'residence inn midtown': 'RISAV',
  'fairfield pooler': 'SAVFP',
  'courtyard brunswick': 'BQKCY',
  'hampton brunswick': 'BSWVE',
  'woodspring brunswick': 'GAA84',
  'four points': 'BQKFP',
  'holiday inn express': 'SGJES',
  'hotel amalga': 'JAXTX',
  'home2 tx': 'DFWFW',
  'home2 baton rouge': 'BTRCI',
  'la quinta': '58090LA',
};

function splitCsvLine(line: string): string[] {
  // Handle quoted fields containing commas (simple CSV, no nested quotes).
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function toNum(v: string): number {
  const n = Number(String(v).replace(/[$,\s%]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseGeneratedAt(text: string): { date: string; slot: 'AM' | 'PM'; generatedAt: string } | null {
  // "Generated: 2026-04-25T09:00:00-04:00"
  const m = text.match(/Generated:\s*(\d{4}-\d{2}-\d{2})T(\d{2}):\d{2}/);
  if (!m) return null;
  const date = m[1];
  const hour = parseInt(m[2], 10);
  const slot: 'AM' | 'PM' = hour < 12 ? 'AM' : 'PM';
  const isoMatch = text.match(/Generated:\s*([^\s,]+)/);
  return { date, slot, generatedAt: isoMatch?.[1] ?? new Date().toISOString() };
}

function parse(input: ParseInput): ParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const result: ParseResult = { warnings, errors };

  // Strip BOM and split into lines
  const text = input.buffer.toString('utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).map((l) => l).filter((l, i) => i < 5 || l.trim() !== '');

  if (lines.length < 5) {
    errors.push('CSV too short — expected header + generated + blank + columns + rows');
    return result;
  }

  const headerLine = lines[0];
  const genLine = lines[1];
  const colLine = lines[3];

  // Infer slot + date from "Generated: ..." line
  const gen = parseGeneratedAt(genLine);
  if (!gen) {
    errors.push(`Could not parse "Generated:" timestamp from: ${genLine.slice(0, 80)}`);
    return result;
  }

  // Find column indices
  const cols = splitCsvLine(colLine).map((c) => c.toLowerCase().replace(/\s+/g, ' ').trim());
  const idx = {
    property: cols.indexOf('property'),
    rooms: cols.indexOf('# rooms'),
    sold: cols.indexOf('sold'),
    ooo: cols.indexOf('ooo'),
    leftToSell: cols.indexOf('left to sell'),
    adr: cols.indexOf('adr'),
    avgPrice: cols.indexOf('avg price'),
    revpar: cols.indexOf('revpar'),
    occ: cols.indexOf('occupancy %'),
  };
  if (idx.property < 0 || idx.rooms < 0 || idx.sold < 0) {
    errors.push(`Expected columns not found. Got: ${cols.join(', ')}`);
    return result;
  }

  const snapshots: ParsedAmPmSnapshot[] = [];
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const f = splitCsvLine(line);
    if (f.length < idx.occ + 1) continue;

    const shortName = f[idx.property]?.trim();
    const code = SHORT_NAME_TO_CODE[shortName.toLowerCase()];
    if (!code) {
      warnings.push(`Unknown hotel "${shortName}" — skipping row`);
      continue;
    }

    const totalRooms = Math.round(toNum(f[idx.rooms]));
    const sold = Math.round(toNum(f[idx.sold]));
    const ooo = Math.round(toNum(f[idx.ooo]));
    const leftToSell = Math.round(toNum(f[idx.leftToSell]));

    snapshots.push({
      hotelCode: code,
      date: gen.date,
      slot: gen.slot,
      generated_at: gen.generatedAt,
      total_rooms: totalRooms,
      rooms_sold: sold,
      rooms_ooo: ooo,
      rooms_left_to_sell: leftToSell,
      adr: toNum(f[idx.adr]),
      avg_price: toNum(f[idx.avgPrice]),
      revpar: toNum(f[idx.revpar]),
      occupancy_pct: toNum(f[idx.occ]),
      room_type_rows: [],
    });
  }

  if (snapshots.length === 0) {
    warnings.push('No snapshot rows extracted.');
  } else {
    result.am_pm_snapshots = snapshots;
  }

  // Also emit daily_revenue / daily_occupancy rows so the Revenue pages
  // pick up the fresh data even without the full daily-audit file.
  // Derive revenue from ADR × sold; mix proportions match our seed script.
  const dailyRevenue = snapshots.map((s) => {
    const roomRev = s.adr * s.rooms_sold;
    return {
      hotelCode: s.hotelCode,
      date: s.date,
      total_revenue: Math.round(roomRev / 0.78), // extended-stay mix proxy
      room_revenue: Math.round(roomRev),
      non_room_revenue: Math.round(roomRev / 0.78 - roomRev),
      mix_room: Math.round(roomRev),
      mix_fb: Math.round(roomRev / 0.78 * 0.05),
      mix_retail: Math.round(roomRev / 0.78 * 0.10),
      mix_events: Math.round(roomRev / 0.78 * 0.04),
      mix_other: Math.round(roomRev / 0.78 * 0.03),
      adr: s.adr,
      revpar: s.revpar,
      occupancy_pct: s.occupancy_pct,
      health: s.occupancy_pct >= 85 ? ('green' as const) : s.occupancy_pct >= 75 ? ('amber' as const) : ('red' as const),
    };
  });
  if (dailyRevenue.length > 0) result.daily_revenue = dailyRevenue;

  const dailyOccupancy = snapshots.map((s) => ({
    hotelCode: s.hotelCode,
    date: s.date,
    rooms_sold: s.rooms_sold,
    rooms_ooo: s.rooms_ooo,
  }));
  if (dailyOccupancy.length > 0) result.daily_occupancy = dailyOccupancy;

  return result;
}

export const stayopsAmPmCsvParser: ParserDef = {
  id: 'stayops-am-pm-csv',
  pmsId: 'stayops',
  reportType: 'am_snapshot',
  matchSubject: /am[-\s]?pm report|am snapshot|pm snapshot/i,
  matchFilename: /am[-_ ]?pm[-_ ]?report|am[-_ ]?report|pm[-_ ]?report/i,
  parse,
};
