/**
 * Hilton OnQ Final Audit (daily property close) parser.
 *
 * Input: a CSV like "May 17, 2026-BTRCI-Home2 Suites By Hilton - Baton Rouge
 * Citiplace, LA-final-audit.csv" — multi-section, ~20 sections separated by
 * blank lines, each with its own column header.
 *
 * Output:
 *   - night_audit_rows        ← per-row records (12-field schema, the source
 *                               of truth — Mapped + Needs Review preserved)
 *   - daily_revenue           ← derived from night_audit_rows + KPI lookups
 *   - daily_occupancy         ← derived from Mix/Match + ops section
 *   - payment_method_mix      ← preserved, also tagged with method_type
 *   - market_segment_mix      ← preserved
 *   - tax_breakdown           ← preserved
 *   - ledger_balances         ← preserved
 *
 * Resilience: section detection by header NAME, row matching by label NAME.
 * A blank row inserted anywhere does not shift any output.
 */
import Papa from 'papaparse';
import type {
  ParseInput,
  ParseResult,
  ParsedDailyRevenue,
  ParsedDailyOccupancy,
  ParsedPaymentMethodMix,
  ParsedMarketSegmentMix,
  ParsedTaxBreakdown,
  ParsedLedgerBalance,
  ParsedNightAuditRow,
  ParserDef,
} from './types';
import { parseOnqFilename } from './onq/filename';
import { parseOnqNumber, parseOnqNumberOrZero } from './onq/parse-currency';
import {
  splitSections,
  findSectionContaining,
  findSectionsByHeader,
  type OnqSection,
} from './onq/sections';
import {
  CHARGE_MAPPING,
  UNMAPPED,
  normaliseLabel,
  lookupMapping,
  isIgnoredLabel,
} from './onq/charge-mapping';

type ColumnLayout = 'charge-table' | 'mix-match';

function findRow(rows: string[][], label: string): string[] | undefined {
  const target = label.trim().toUpperCase();
  return rows.find((r) => r[0]?.trim().toUpperCase() === target);
}

function deriveHealth(occ: number): 'green' | 'amber' | 'red' {
  if (occ >= 85) return 'green';
  if (occ >= 75) return 'amber';
  return 'red';
}

/**
 * Charge Type / Tax Type / Payment Method sections: Net Today=col 4 (E),
 * MTD=col 5 (F), YTD=col 8 (I).
 * Mix/Match + KPI sections (header='Type'): Today=col 1 (B), MTD=col 2 (C),
 * YTD=col 4 (E).
 */
function extractValues(
  row: string[],
  layout: ColumnLayout,
): { today: number | null; mtd: number | null; ytd: number | null } {
  if (layout === 'charge-table') {
    return {
      today: parseOnqNumber(row[4]),
      mtd:   parseOnqNumber(row[5]),
      ytd:   parseOnqNumber(row[8]),
    };
  }
  return {
    today: parseOnqNumber(row[1]),
    mtd:   parseOnqNumber(row[2]),
    ytd:   parseOnqNumber(row[4]),
  };
}

function layoutForHeader(header: string): ColumnLayout | null {
  const h = header.trim();
  if (h === 'Charge Type' || h === 'Tax Type' || h === 'Payment Method') return 'charge-table';
  if (h === 'Type') return 'mix-match';
  return null;
}

export async function parseOnqFinalAudit(input: ParseInput): Promise<ParseResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!input.filename) {
    return { warnings, errors: ['filename is required for OnQ final-audit (date + hotel code live there)'] };
  }
  const meta = parseOnqFilename(input.filename);
  if (!meta) {
    return { warnings, errors: [`unrecognized OnQ filename pattern: ${input.filename}`] };
  }
  if (meta.dedupSuffix) {
    warnings.push(`filename has suffix "${meta.dedupSuffix.trim()}" — proceeding (idempotent upsert by date)`);
  }
  if (meta.reportType !== 'final-audit') {
    return { warnings, errors: [`filename reportType is "${meta.reportType}", expected "final-audit"`] };
  }

  const { hotelCode, date } = meta;

  const text = input.buffer.toString('utf8');
  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: false, // blank lines = section separators
  });
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors.slice(0, 3)) warnings.push(`csv parse: ${e.message} (row ${e.row})`);
  }
  const rows = (parsed.data as string[][]).map((r) => r.map((c) => (c ?? '').toString()));

  const sections = splitSections(rows);
  if (sections.length === 0) {
    return { warnings, errors: ['no recognisable sections found in CSV'] };
  }

  // ── 1. Walk every section, emit one ParsedNightAuditRow per row ─────────
  const night_audit_rows: ParsedNightAuditRow[] = [];
  /** Last seen night_audit_row by normalised label — used for KPI/Mix lookups. */
  const rowIndex = new Map<string, ParsedNightAuditRow>();

  for (const section of sections) {
    const layout = layoutForHeader(section.header);
    if (!layout) continue;

    for (const row of section.rows) {
      const label = (row[0] ?? '').trim();
      if (!label) continue;

      // User-defined skip list (Same Day Bookings, Stayover Rooms, guest
      // counts, etc.) — never persisted, never surfaced as Needs Review.
      if (isIgnoredLabel(label)) continue;

      const { today, mtd, ytd } = extractValues(row, layout);

      // Drop rows where every value is null/zero (placeholder lines).
      if ((today ?? 0) === 0 && (mtd ?? 0) === 0 && (ytd ?? 0) === 0) continue;

      const mapped = lookupMapping(label);
      const mapping = mapped ?? UNMAPPED;
      const matchStatus: 'Mapped' | 'Needs Review' = mapped ? 'Mapped' : 'Needs Review';

      const out: ParsedNightAuditRow = {
        hotelCode,
        reportDate: date,
        sourceFileName: input.filename,
        sourceTable: section.header,
        sourceRowName: label,
        category: mapping.category,
        type: mapping.type,
        subtypeGroup: mapping.subtypeGroup,
        subtype: mapping.subtype,
        valueToday: today,
        valueMtd: mtd,
        valueYtd: ytd,
        matchStatus,
      };
      night_audit_rows.push(out);
      rowIndex.set(normaliseLabel(label), out);
    }
  }

  // ── 2. Derive daily_revenue from night_audit_rows + KPI rows ────────────
  const sumWhere = (pred: (r: ParsedNightAuditRow) => boolean): number =>
    night_audit_rows.filter(pred).reduce((s, r) => s + (r.valueToday ?? 0), 0);

  // Total revenue mirrors the file's Net Today rollup — Revenue category
  // PLUS Taxes (Hilton presents tax as part of daily revenue total).
  const totalRevenueOnly = sumWhere((r) => r.category === 'Revenue');
  const taxesTotal       = sumWhere((r) => r.category === 'Taxes');
  const totalRevenue     = totalRevenueOnly + taxesTotal;

  // Mix buckets — pure Revenue category (no taxes), grouped by the new
  // Type / SubtypeGroup taxonomy.
  const roomRev      = sumWhere((r) => r.type === 'Room Revenue');
  const noShowRev    = sumWhere((r) => r.type === 'No Show Room Revenue');
  // F&B SubtypeGroup splits into two display buckets: Restaurant (sit-down /
  // breakfast) and Front Market (suite shop, vending). The legacy mix_fb +
  // mix_retail columns are reused here as Restaurant + Market respectively.
  const restaurantRev= sumWhere((r) => r.type === 'Charges' && r.subtypeGroup === 'F&B' && r.subtype === 'Restaurant');
  const marketRev    = sumWhere((r) => r.type === 'Charges' && r.subtypeGroup === 'F&B' && r.subtype === 'Front Market');
  const eventsCharges= sumWhere((r) => r.type === 'Charges' && r.subtypeGroup === 'Events');
  const addlRoom     = sumWhere((r) => r.type === 'Charges' && r.subtypeGroup === 'Additional Room Charges');
  const otherCharges = sumWhere((r) => r.type === 'Charges' && r.subtypeGroup === 'Other Charges');

  const totalRoom    = roomRev + noShowRev;

  // KPI rows lookup
  const occKpi    = rowIndex.get(normaliseLabel('OCCUPANCY INCLUDING DOWN ROOMS AND EXCLUDING COMP, HOUSE USE ROOMS'));
  const adrKpi    = rowIndex.get(normaliseLabel('ADR INCLUDING COMP, HOUSE USE ROOMS'));
  const revparKpi =
    rowIndex.get(normaliseLabel('ROOMS REVPAR WITH OUT OF ORDER ROOMS'))
    ?? rowIndex.get(normaliseLabel('REVPAR WITH OUT OF ORDER ROOMS'));

  let dailyRevenue: ParsedDailyRevenue | null = null;
  if (night_audit_rows.length > 0) {
    const occ = occKpi?.valueToday ?? 0;
    dailyRevenue = {
      hotelCode,
      date,
      total_revenue:    totalRevenue,
      room_revenue:     totalRoom,
      non_room_revenue: Math.max(0, totalRevenue - totalRoom),
      mix_room:         totalRoom,
      mix_fb:           restaurantRev, // displayed as "Restaurant"
      mix_retail:       marketRev,     // displayed as "Market"
      mix_events:       eventsCharges,
      mix_other:        addlRoom + otherCharges,
      adr:              adrKpi?.valueToday    ?? 0,
      revpar:           revparKpi?.valueToday ?? 0,
      occupancy_pct:    occ,
      health:           deriveHealth(occ),
    };
  } else {
    warnings.push('no night-audit rows extracted — daily_revenue will be skipped');
  }

  // ── 3. Derive daily_occupancy from Mix/Match counts + ops section ───────
  const totalSoldRooms = rowIndex.get(normaliseLabel('TOTAL SOLD ROOMS'));
  const downRooms      = rowIndex.get(normaliseLabel('DOWN ROOMS'));
  const noShow         = rowIndex.get(normaliseLabel('NO SHOW'));

  let dailyOccupancy: ParsedDailyOccupancy | null = null;

  const opsSection: OnqSection | null = findSectionContaining(sections, 'Type', 'Stayover Rooms');
  const opsRow = (label: string): string[] | undefined =>
    opsSection ? findRow(opsSection.rows, label) : undefined;

  if (totalSoldRooms || downRooms || opsSection) {
    const stayover  = opsRow('Stayover Rooms');
    const sameDay   = opsRow('Same Day Bookings');
    const cancelled = opsRow('CANCELLED');
    const checkedIn = opsRow('Checked In Reservations');
    const departed  = opsRow('Departed Reservations');

    dailyOccupancy = {
      hotelCode,
      date,
      rooms_sold:     totalSoldRooms?.valueToday ?? parseOnqNumberOrZero(opsRow('Total Sold Rooms')?.[1]),
      rooms_ooo:      downRooms?.valueToday      ?? parseOnqNumberOrZero(opsRow('Down Rooms')?.[1]),
      walk_ins:       parseOnqNumberOrZero(sameDay?.[1]),
      no_shows:       noShow?.valueToday         ?? parseOnqNumberOrZero(opsRow('NO SHOW')?.[1]),
      cancellations:  parseOnqNumberOrZero(cancelled?.[1]),
      arrivals:       parseOnqNumberOrZero(checkedIn?.[1]),
      departures:     parseOnqNumberOrZero(departed?.[1]),
      stay_overs:     parseOnqNumberOrZero(stayover?.[1]),
      avg_customer_rating: null,
      review_count:   0,
    };
  } else {
    warnings.push('no Mix/Match nor ops section found — daily_occupancy will be skipped');
  }

  // ── 4. payment_method_mix — preserve old behaviour, add method_type ─────
  const paymentSection = findSectionsByHeader(sections, 'Payment Method')[0];
  const payment_method_mix: ParsedPaymentMethodMix[] = [];
  if (paymentSection) {
    for (const row of paymentSection.rows) {
      const method = row[0]?.trim();
      if (!method) continue;
      const today = parseOnqNumber(row[4]);
      const mtd   = parseOnqNumber(row[5]);
      const ytd   = parseOnqNumber(row[8]);
      if ((today ?? 0) === 0 && (mtd ?? 0) === 0 && (ytd ?? 0) === 0) continue;

      const mapping = lookupMapping(method);
      payment_method_mix.push({
        hotelCode, date,
        method,
        method_type: mapping?.type ?? null,
        amount_today: today ?? 0,
        amount_mtd:   mtd ?? 0,
        amount_ytd:   ytd ?? 0,
      });
    }
  }

  // ── 5. tax_breakdown — preserve old behaviour ───────────────────────────
  const taxSections = findSectionsByHeader(sections, 'Tax Type').filter((s) => s.rows.length > 0);
  const tax_breakdown: ParsedTaxBreakdown[] = [];
  const taxSection = taxSections[0];
  if (taxSection) {
    for (const row of taxSection.rows) {
      const taxType = row[0]?.trim();
      if (!taxType) continue;
      tax_breakdown.push({
        hotelCode, date,
        tax_type: taxType,
        amount_today: parseOnqNumberOrZero(row[4]),
        amount_mtd:   parseOnqNumberOrZero(row[5]),
        amount_ytd:   parseOnqNumberOrZero(row[8]),
      });
    }
  }

  // ── 6. ledger_balances — preserve old behaviour ─────────────────────────
  const ledgerSection = findSectionsByHeader(sections, 'Ledger Name')[0];
  const ledger_balances: ParsedLedgerBalance[] = [];
  if (ledgerSection) {
    for (const row of ledgerSection.rows) {
      const name = row[0]?.trim();
      if (!name) continue;
      ledger_balances.push({
        hotelCode, date,
        ledger_name: name,
        opening_balance: parseOnqNumberOrZero(row[1]),
        net_change:      parseOnqNumberOrZero(row[2]),
        closing_balance: parseOnqNumberOrZero(row[3]),
      });
    }
  }

  // ── 7. market_segment_mix — preserve old behaviour ──────────────────────
  const segmentSections = sections.filter((s) => {
    if (s.header !== 'Type') return false;
    if (s.rows.length === 0) return false;
    const first = s.rows[0]?.[0]?.trim().toUpperCase() ?? '';
    return (
      first !== 'ROOM REVENUE' &&
      first !== 'OTHER ROOM REVENUE' &&
      first !== 'STAYOVER ROOMS' &&
      first !== 'DOWN ROOMS' &&
      !first.startsWith('OCCUPANCY') &&
      !first.startsWith('ADR') &&
      !first.startsWith('REVPAR') &&
      first !== 'IN HOUSE' &&
      !CHARGE_MAPPING[normaliseLabel(first)]
    );
  });

  const market_segment_mix: ParsedMarketSegmentMix[] = [];
  if (segmentSections.length >= 2) {
    const counts   = segmentSections[0];
    const revenues = segmentSections[1];
    const counted = new Map<string, { rt: number; rm: number; ry: number }>();
    for (const row of counts.rows) {
      const seg = row[0]?.trim();
      if (!seg) continue;
      const cur = counted.get(seg) ?? { rt: 0, rm: 0, ry: 0 };
      cur.rt += parseOnqNumberOrZero(row[1]);
      cur.rm += parseOnqNumberOrZero(row[4]);
      cur.ry += parseOnqNumberOrZero(row[6]);
      counted.set(seg, cur);
    }
    const rev = new Map<string, { rt: number; rm: number; ry: number }>();
    for (const row of revenues.rows) {
      const seg = row[0]?.trim();
      if (!seg) continue;
      const cur = rev.get(seg) ?? { rt: 0, rm: 0, ry: 0 };
      cur.rt += parseOnqNumberOrZero(row[1]);
      cur.rm += parseOnqNumberOrZero(row[4]);
      cur.ry += parseOnqNumberOrZero(row[6]);
      rev.set(seg, cur);
    }
    const allSegments = new Set([...counted.keys(), ...rev.keys()]);
    for (const seg of allSegments) {
      const c = counted.get(seg) ?? { rt: 0, rm: 0, ry: 0 };
      const r = rev.get(seg)     ?? { rt: 0, rm: 0, ry: 0 };
      if (c.rt === 0 && c.rm === 0 && c.ry === 0 && r.rt === 0 && r.rm === 0 && r.ry === 0) continue;
      market_segment_mix.push({
        hotelCode, date,
        segment: seg,
        rooms_today: c.rt,
        rooms_mtd:   c.rm,
        rooms_ytd:   c.ry,
        revenue_today: r.rt,
        revenue_mtd:   r.rm,
        revenue_ytd:   r.ry,
      });
    }
  }

  return {
    daily_revenue:      dailyRevenue ? [dailyRevenue] : undefined,
    daily_occupancy:    dailyOccupancy ? [dailyOccupancy] : undefined,
    payment_method_mix: payment_method_mix.length > 0 ? payment_method_mix : undefined,
    market_segment_mix: market_segment_mix.length > 0 ? market_segment_mix : undefined,
    tax_breakdown:      tax_breakdown.length > 0 ? tax_breakdown : undefined,
    ledger_balances:    ledger_balances.length > 0 ? ledger_balances : undefined,
    night_audit_rows:   night_audit_rows.length > 0 ? night_audit_rows : undefined,
    warnings,
    errors,
  };
}

export const onqFinalAuditParser: ParserDef = {
  id: 'onq-final-audit',
  pmsId: 'onq',
  reportType: 'onq_final_audit',
  matchFilename: /-final-audit(\s*\(\d+\))?\.csv$/i,
  parse: parseOnqFinalAudit,
};
