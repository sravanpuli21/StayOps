import type {
  ParserDef, ParseInput, ParseResult,
  ParsedLabourPeriod, ParsedLabourDepartment, LabourDeptName,
} from './types';

/**
 * StayOps native labour CSV.
 *
 * One row per (hotel_code, period_end, department). A magic department named
 * `__TOTAL__` populates labour_periods (the roll-up); all others populate
 * labour_departments.
 *
 * If `__TOTAL__` is missing for a (hotel, period_end), the parser sums the
 * department rows and emits a warning.
 *
 * Header columns:
 *   hotel_code, period_end, period_start, department,
 *   scheduled_hours, clocked_hours, overtime_hours, payroll_cost
 *
 * `period_end` is the (Sunday) inclusive end-of-period; `period_start` may be
 * left blank — defaults to period_end - 13 days.
 */

const VALID_DEPTS = new Set<LabourDeptName>([
  'Housekeeping', 'Front Desk', 'Kitchen', 'Maintenance', 'Market', 'Event Space',
]);

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/﻿/g, '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  return { headers: splitCsv(lines[0]), rows: lines.slice(1).map(splitCsv) };
}
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
function num(s: string | undefined): number {
  if (s == null || s === '') return 0;
  const n = Number(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function isoSubDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}
function deriveHealth(variance: number, ot: number): 'green' | 'amber' | 'red' {
  if (variance > 30 || ot > 18) return 'red';
  if (variance > 15 || ot > 8) return 'amber';
  return 'green';
}

export const hosLabourParser: ParserDef = {
  id: 'hos-labour',
  pmsId: 'stayops',
  reportType: 'labour',
  matchFilename: /labour.*\.csv$/i,
  matchSubject: /labour|labor/i,

  parse({ buffer }: ParseInput): ParseResult {
    const text = buffer.toString('utf8');
    const { headers, rows } = parseCsv(text);
    const result: ParseResult = {
      labour_periods: [], labour_departments: [],
      warnings: [], errors: [],
    };
    if (rows.length === 0) {
      result.errors.push('Empty labour CSV');
      return result;
    }

    const idx = (n: string) => headers.findIndex((h) => h.toLowerCase() === n.toLowerCase());
    const required = ['hotel_code', 'period_end', 'department', 'scheduled_hours', 'clocked_hours'];
    for (const r of required) {
      if (idx(r) < 0) result.errors.push(`Missing column: ${r}`);
    }
    if (result.errors.length > 0) return result;

    const i = {
      code: idx('hotel_code'),
      end: idx('period_end'),
      start: idx('period_start'),
      dept: idx('department'),
      sched: idx('scheduled_hours'),
      clock: idx('clocked_hours'),
      ot: idx('overtime_hours'),
      pay: idx('payroll_cost'),
    };

    // Group by (code, period_end). Department rows + (optional) __TOTAL__ row each.
    type Group = {
      code: string;
      period_end: string;
      period_start: string;
      total: ParsedLabourPeriod | null;
      depts: ParsedLabourDepartment[];
    };
    const groups = new Map<string, Group>();

    for (const r of rows) {
      const code = r[i.code];
      const periodEnd = r[i.end];
      const dept = r[i.dept];
      if (!code || !periodEnd || !dept) {
        result.warnings.push(`Skipping incomplete labour row: ${r.join(',')}`);
        continue;
      }
      const periodStart = (i.start >= 0 && r[i.start]) ? r[i.start] : isoSubDays(periodEnd, 13);
      const sched = num(r[i.sched]);
      const clock = num(r[i.clock]);
      const ot    = i.ot  >= 0 ? num(r[i.ot])  : 0;
      const pay   = i.pay >= 0 ? num(r[i.pay]) : 0;

      const key = `${code}|${periodEnd}`;
      const g = groups.get(key) ?? {
        code, period_end: periodEnd, period_start: periodStart, total: null, depts: [],
      };

      if (dept === '__TOTAL__') {
        g.total = {
          hotelCode: code,
          period_end: periodEnd,
          period_start: periodStart,
          scheduled_hours: sched,
          clocked_hours: clock,
          overtime_hours: ot,
          payroll_cost: pay,
          health: deriveHealth(clock - sched, ot),
        };
      } else if (VALID_DEPTS.has(dept as LabourDeptName)) {
        g.depts.push({
          hotelCode: code,
          period_end: periodEnd,
          department: dept as LabourDeptName,
          scheduled_hours: sched,
          clocked_hours: clock,
          overtime_hours: ot,
          payroll_cost: pay,
        });
      } else {
        result.warnings.push(`Unknown department '${dept}' for ${code}/${periodEnd} — skipped`);
      }

      groups.set(key, g);
    }

    for (const g of groups.values()) {
      if (!g.total) {
        // Synthesize total from departments
        const sumS = g.depts.reduce((s, d) => s + d.scheduled_hours, 0);
        const sumC = g.depts.reduce((s, d) => s + d.clocked_hours, 0);
        const sumO = g.depts.reduce((s, d) => s + d.overtime_hours, 0);
        const sumP = g.depts.reduce((s, d) => s + d.payroll_cost, 0);
        result.warnings.push(`No __TOTAL__ row for ${g.code}/${g.period_end} — derived from ${g.depts.length} dept rows`);
        result.labour_periods!.push({
          hotelCode: g.code,
          period_end: g.period_end,
          period_start: g.period_start,
          scheduled_hours: sumS,
          clocked_hours: sumC,
          overtime_hours: sumO,
          payroll_cost: sumP,
          health: deriveHealth(sumC - sumS, sumO),
        });
      } else {
        result.labour_periods!.push(g.total);
      }
      result.labour_departments!.push(...g.depts);
    }

    return result;
  },
};
