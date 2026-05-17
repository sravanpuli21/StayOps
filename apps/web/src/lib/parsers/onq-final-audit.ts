/**
 * Hilton OnQ Final Audit (daily property close) parser.
 *
 * Input: a CSV like "May 17, 2026-BTRCI-Home2 Suites By Hilton - Baton Rouge
 * Citiplace, LA-final-audit.csv" — multi-section, ~20 sections separated by
 * blank lines, each with its own column header.
 *
 * Output: rows for daily_revenue, daily_occupancy, payment_method_mix,
 * market_segment_mix, tax_breakdown, ledger_balances.
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
  ParserDef,
} from './types';
import { parseOnqFilename } from './onq/filename';
import { parseOnqNumber, parseOnqNumberOrZero } from './onq/parse-currency';
import {
  splitSections,
  findSectionContaining,
  findSectionsByHeader,
} from './onq/sections';

function findRow(rows: string[][], label: string): string[] | undefined {
  const target = label.trim().toUpperCase();
  return rows.find((r) => r[0]?.trim().toUpperCase() === target);
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
    // Email systems sometimes append "(1)" to attachment names when the
    // sender's reports have the same base name. These are real reports for
    // distinct dates, not browser re-downloads — process them normally and
    // let the (hotel_id, date) ON CONFLICT handle any actual re-ingestion.
    warnings.push(`filename has suffix "${meta.dedupSuffix.trim()}" — proceeding (idempotent upsert by date)`);
  }
  if (meta.reportType !== 'final-audit') {
    return { warnings, errors: [`filename reportType is "${meta.reportType}", expected "final-audit"`] };
  }

  const { hotelCode, date } = meta;

  // Parse CSV. The file has unquoted commas inside some labels — Papa with
  // header:false gives us raw string-cell rows, exactly what splitSections wants.
  const text = input.buffer.toString('utf8');
  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: false,  // we use blank lines as section separators
  });
  if (parsed.errors.length > 0) {
    // Papa errors are usually recoverable (extra delimiter etc.) — warn, don't fail.
    for (const e of parsed.errors.slice(0, 3)) warnings.push(`csv parse: ${e.message} (row ${e.row})`);
  }
  const rows = (parsed.data as string[][]).map((r) => r.map((c) => (c ?? '').toString()));

  const sections = splitSections(rows);
  if (sections.length === 0) {
    return { warnings, errors: ['no recognisable sections found in CSV'] };
  }

  // ── Daily revenue + occupancy from the "Type" rollup section ────────────
  // Section signature: header "Type" containing rows "Room Revenue", "Other
  // Room Revenue", "Charges", "Taxes" + a trailing totals row.
  const rollupSection = findSectionContaining(sections, 'Type', 'Room Revenue');
  let dailyRevenue: ParsedDailyRevenue | null = null;
  if (rollupSection) {
    const roomRev   = findRow(rollupSection.rows, 'Room Revenue');
    const otherRoom = findRow(rollupSection.rows, 'Other Room Revenue');
    const charges   = findRow(rollupSection.rows, 'Charges');
    const total     = rollupSection.totals;

    if (roomRev && total) {
      const roomRevenueToday = parseOnqNumberOrZero(roomRev[1]);
      const totalRevenueToday = parseOnqNumberOrZero(total[1]);
      const otherRoomToday = parseOnqNumberOrZero(otherRoom?.[1] ?? '0');
      const chargesToday = parseOnqNumberOrZero(charges?.[1] ?? '0');
      const nonRoomToday = otherRoomToday + chargesToday;
      dailyRevenue = {
        hotelCode,
        date,
        total_revenue: totalRevenueToday,
        room_revenue: roomRevenueToday,
        non_room_revenue: nonRoomToday,
        mix_room: roomRevenueToday,
        mix_fb: 0,        // Hilton OnQ doesn't break out F&B/retail/events separately at this hotel
        mix_retail: chargesToday,  // Charges = mostly retail / fees in OnQ
        mix_events: 0,
        mix_other: otherRoomToday,
        adr: 0,           // overwritten by the ADR section below
        revpar: 0,        // overwritten by the RevPAR section below
        occupancy_pct: 0, // overwritten by the OCCUPANCY section below
      };
    }
  } else {
    warnings.push('no Type/Room Revenue rollup section found — daily_revenue will be skipped');
  }

  // Enrich ADR / RevPAR from the ADR section
  const adrSection = findSectionContaining(sections, 'Type', 'ADR INCLUDING COMP, HOUSE USE ROOMS');
  if (adrSection && dailyRevenue) {
    const adrRow    = findRow(adrSection.rows, 'ADR INCLUDING COMP, HOUSE USE ROOMS');
    const revparRow =
      findRow(adrSection.rows, 'RevPar Without Out Of Order Rooms') ??
      findRow(adrSection.rows, 'RevPar With Out Of Order Rooms');
    if (adrRow) dailyRevenue.adr = parseOnqNumberOrZero(adrRow[1]);
    if (revparRow) dailyRevenue.revpar = parseOnqNumberOrZero(revparRow[1]);
  }

  // Enrich occupancy_pct from the OCCUPANCY section
  const occSection = findSectionContaining(sections, 'Type', 'OCCUPANCY INCLUDING DOWN, COMP, HOUSE USE ROOMS');
  if (occSection && dailyRevenue) {
    const occRow = findRow(occSection.rows, 'OCCUPANCY INCLUDING DOWN, COMP, HOUSE USE ROOMS');
    if (occRow) dailyRevenue.occupancy_pct = parseOnqNumberOrZero(occRow[1]);
  }

  // ── daily_occupancy from the operational stats section ──────────────────
  // Section signature: header "Type" containing 'Stayover Rooms', 'TOTAL GUESTS',
  // 'Total Sold Rooms', 'Down Rooms', 'NO SHOW', 'CANCELLED', etc.
  const opsSection = findSectionContaining(sections, 'Type', 'Total Sold Rooms');
  let dailyOccupancy: ParsedDailyOccupancy | null = null;
  if (opsSection) {
    const roomsSold     = findRow(opsSection.rows, 'Total Sold Rooms');
    const downRooms     = findRow(opsSection.rows, 'Down Rooms');
    const noShow        = findRow(opsSection.rows, 'NO SHOW');
    const cancelled     = findRow(opsSection.rows, 'CANCELLED');
    const stayover      = findRow(opsSection.rows, 'Stayover Rooms');
    const sameDay       = findRow(opsSection.rows, 'Same Day Bookings');
    const checkedIn     = findRow(opsSection.rows, 'Checked In Reservations');
    const departed      = findRow(opsSection.rows, 'Departed Reservations');

    dailyOccupancy = {
      hotelCode,
      date,
      rooms_sold:     parseOnqNumberOrZero(roomsSold?.[1]),
      rooms_ooo:      parseOnqNumberOrZero(downRooms?.[1]),
      walk_ins:       parseOnqNumberOrZero(sameDay?.[1]),
      no_shows:       parseOnqNumberOrZero(noShow?.[1]),
      cancellations:  parseOnqNumberOrZero(cancelled?.[1]),
      arrivals:       parseOnqNumberOrZero(checkedIn?.[1]),
      departures:     parseOnqNumberOrZero(departed?.[1]),
      stay_overs:     parseOnqNumberOrZero(stayover?.[1]),
      avg_customer_rating: null,
      review_count:   0,
    };
  } else {
    warnings.push('no Type/operational-stats section found — daily_occupancy will be skipped');
  }

  // ── payment_method_mix from "Payment Method" section ───────────────────
  const paymentSections = findSectionsByHeader(sections, 'Payment Method');
  const payment_method_mix: ParsedPaymentMethodMix[] = [];
  // Use the first (most detailed) Payment Method section
  const paymentSection = paymentSections[0];
  if (paymentSection) {
    for (const row of paymentSection.rows) {
      const method = row[0]?.trim();
      if (!method) continue;
      const today = parseOnqNumber(row[1]);
      const mtd = parseOnqNumber(row[5]);
      const ytd = parseOnqNumber(row[8]);
      // Skip rows that are entirely zero — keeps the table small
      if ((today ?? 0) === 0 && (mtd ?? 0) === 0 && (ytd ?? 0) === 0) continue;
      payment_method_mix.push({
        hotelCode, date,
        method,
        amount_today: today ?? 0,
        amount_mtd: mtd ?? 0,
        amount_ytd: ytd ?? 0,
      });
    }
  }

  // ── tax_breakdown from "Tax Type" section with rows ─────────────────────
  // (There are two "Tax Type" sections — one empty, one with the actual breakdown.)
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
        amount_today: parseOnqNumberOrZero(row[1]),
        amount_mtd:   parseOnqNumberOrZero(row[5]),
        amount_ytd:   parseOnqNumberOrZero(row[8]),
      });
    }
  }

  // ── ledger_balances from "Ledger Name" section ─────────────────────────
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

  // ── market_segment_mix from the paired "Type" segment sections ─────────
  // Two consecutive "Type" sections (after ADR) carry the same segment list:
  // the first has room counts, the second has revenue. We pair by index.
  // Identify them by: header "Type", first data row starts with a segment
  // name like 'BEST AVAILABLE RATE' (not 'Room Revenue', not 'Down Rooms',
  // not 'OCCUPANCY...', not 'ADR...').
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
      first !== 'IN HOUSE'  // payments-ledger style
    );
  });

  const market_segment_mix: ParsedMarketSegmentMix[] = [];
  if (segmentSections.length >= 2) {
    const counts = segmentSections[0];
    const revenues = segmentSections[1];
    // Group by segment name; OnQ emits two rows per segment (often one empty),
    // so we aggregate.
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
