import type { ParserDef, ParseInput, ParseResult } from './types';

/**
 * StayOps native daily-revenue CSV.
 *
 * One row per (hotel_code, date). Header columns:
 *   hotel_code, date, occupancy_pct, adr, revpar,
 *   room_revenue, fb_revenue, retail_revenue, events_revenue, other_revenue,
 *   total_revenue, rooms_sold, rooms_ooo, market_adr, avg_customer_rating
 *
 * Emits one row each to daily_revenue and daily_occupancy. Used both by the
 * admin upload UI and (Phase 1.B) by the email ingest poller.
 */

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/﻿/g, '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(splitCsvLine);
  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function num(s: string | undefined): number {
  if (s == null || s === '') return 0;
  const n = Number(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function deriveHealth(occ: number): 'green' | 'amber' | 'red' {
  if (occ >= 85) return 'green';
  if (occ >= 75) return 'amber';
  return 'red';
}

export const hosDailyRevenueParser: ParserDef = {
  id: 'hos-daily-revenue',
  pmsId: 'stayops',
  reportType: 'daily_revenue',
  matchFilename: /daily[-_]?revenue.*\.csv$/i,
  matchSubject: /daily.*revenue/i,

  parse({ buffer }: ParseInput): ParseResult {
    const text = buffer.toString('utf8');
    const { headers, rows } = parseCsv(text);
    const result: ParseResult = { daily_revenue: [], daily_occupancy: [], warnings: [], errors: [] };

    if (rows.length === 0) {
      result.errors.push('Empty CSV — no rows after header');
      return result;
    }

    const idx = (name: string) => headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const required = ['hotel_code', 'date', 'occupancy_pct', 'adr', 'revpar', 'total_revenue'];
    for (const r of required) {
      if (idx(r) < 0) {
        result.errors.push(`Missing required column: ${r}`);
      }
    }
    if (result.errors.length > 0) return result;

    const i = {
      code: idx('hotel_code'),
      date: idx('date'),
      occ: idx('occupancy_pct'),
      adr: idx('adr'),
      revpar: idx('revpar'),
      room: idx('room_revenue'),
      fb: idx('fb_revenue'),
      retail: idx('retail_revenue'),
      events: idx('events_revenue'),
      other: idx('other_revenue'),
      total: idx('total_revenue'),
      sold: idx('rooms_sold'),
      ooo: idx('rooms_ooo'),
      market: idx('market_adr'),
      rating: idx('avg_customer_rating'),
    };

    for (const r of rows) {
      const code = r[i.code];
      const date = r[i.date];
      if (!code || !date) {
        result.warnings.push(`Skipping row with empty hotel_code/date: ${r.join(',')}`);
        continue;
      }
      const occ = num(r[i.occ]);
      const room = num(r[i.room]);
      const fb = num(r[i.fb]);
      const retail = num(r[i.retail]);
      const events = num(r[i.events]);
      const other = num(r[i.other]);
      const total = num(r[i.total]);
      const nonRoom = Math.max(0, total - room);

      result.daily_revenue!.push({
        hotelCode: code,
        date,
        total_revenue: total,
        room_revenue: room,
        non_room_revenue: nonRoom,
        mix_room: room,
        mix_fb: fb,
        mix_retail: retail,
        mix_events: events,
        mix_other: other > 0 ? other : Math.max(0, total - room - fb - retail - events),
        adr: num(r[i.adr]),
        revpar: num(r[i.revpar]),
        occupancy_pct: occ,
        market_adr: i.market >= 0 ? num(r[i.market]) : null,
        health: deriveHealth(occ),
      });

      if (i.sold >= 0 || i.ooo >= 0 || i.rating >= 0) {
        result.daily_occupancy!.push({
          hotelCode: code,
          date,
          rooms_sold: num(r[i.sold]),
          rooms_ooo: num(r[i.ooo]),
          avg_customer_rating: i.rating >= 0 ? num(r[i.rating]) : null,
        });
      }
    }

    return result;
  },
};
