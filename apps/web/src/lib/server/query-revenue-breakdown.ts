import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type {
  ApiRevenueBreakdown, ApiRevenueType, ApiRevenueSubtypeGroup, ApiRevenueLine,
  RevenueAgg,
} from '@hos/shared';

/**
 * Aggregate the new 4-level revenue taxonomy (Type > SubtypeGroup > Subtype >
 * source row) from `night_audit_rows` for the given window + hotels.
 *
 *  - agg='today' (default): sum each row's value_today across the date window.
 *  - agg='mtd':   use the latest report_date in range, take that row's value_mtd.
 *  - agg='ytd':   ditto for value_ytd.
 *
 * Returns one breakdown per hotel that has data, plus a 'PORTFOLIO' rollup.
 * Rows with category != 'Revenue' are excluded (taxes/payments/mix/match aren't
 * part of the revenue mix display).
 */
export async function queryRevenueBreakdown(
  hotelCodes: string[] | null,
  from: string,
  to: string,
  agg: RevenueAgg = 'today',
): Promise<{ portfolio: ApiRevenueBreakdown; perHotel: ApiRevenueBreakdown[] }> {
  const empty: ApiRevenueBreakdown = {
    hotelId: 'PORTFOLIO', total: 0, types: [],
  };
  if (hotelCodes !== null && hotelCodes.length === 0) {
    return { portfolio: empty, perHotel: [] };
  }
  const tenantId = await getHosTenantId();
  if (!tenantId) return { portfolio: empty, perHotel: [] };
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  const rows = agg === 'today'
    ? await db<Array<{
        code: string;
        type: string;
        subtype_group: string | null;
        subtype: string | null;
        source_row_name: string;
        sum_today: string;
      }>>`
        select
          h.code,
          nar.type,
          nar.subtype_group,
          nar.subtype,
          nar.source_row_name,
          sum(nar.value_today)::text as sum_today
        from night_audit_rows nar
        join hotels h on h.id = nar.hotel_id
        where h.tenant_id = ${tenantId}
          and nar.report_date between ${from}::date and ${to}::date
          and nar.category = 'Revenue'
          ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
        group by h.code, nar.type, nar.subtype_group, nar.subtype, nar.source_row_name
        order by h.code, nar.type, nar.subtype_group, nar.subtype, nar.source_row_name
      `
    : await db<Array<{
        code: string;
        type: string;
        subtype_group: string | null;
        subtype: string | null;
        source_row_name: string;
        sum_today: string;
      }>>`
        with latest as (
          select nar.hotel_id, max(nar.report_date) as rd
            from night_audit_rows nar
            join hotels h on h.id = nar.hotel_id
           where h.tenant_id = ${tenantId}
             and nar.report_date between ${from}::date and ${to}::date
             ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
           group by nar.hotel_id
        )
        select
          h.code,
          nar.type,
          nar.subtype_group,
          nar.subtype,
          nar.source_row_name,
          sum(${agg === 'mtd' ? db`nar.value_mtd` : db`nar.value_ytd`})::text as sum_today
        from latest l
        join night_audit_rows nar
          on nar.hotel_id = l.hotel_id and nar.report_date = l.rd
        join hotels h on h.id = nar.hotel_id
        where nar.category = 'Revenue'
        group by h.code, nar.type, nar.subtype_group, nar.subtype, nar.source_row_name
        order by h.code, nar.type, nar.subtype_group, nar.subtype, nar.source_row_name
      `;

  // Build nested structure keyed by code → type → group → subtype → label
  const byHotel = new Map<string, Map<string, Map<string, Map<string, ApiRevenueLine[]>>>>();
  const portByType = new Map<string, Map<string, Map<string, ApiRevenueLine[]>>>();

  const upsertLine = (
    bucket: Map<string, Map<string, Map<string, ApiRevenueLine[]>>>,
    type: string, group: string, subtype: string, label: string, amount: number,
  ) => {
    let g = bucket.get(type);
    if (!g) { g = new Map(); bucket.set(type, g); }
    let s = g.get(group);
    if (!s) { s = new Map(); g.set(group, s); }
    const lines = s.get(subtype) ?? [];
    const existing = lines.find((l) => l.label === label);
    if (existing) existing.amount += amount;
    else lines.push({ label, subtype: subtype === '__null__' ? null : subtype, amount });
    s.set(subtype, lines);
  };

  for (const r of rows) {
    const amount = Number(r.sum_today ?? 0);
    if (amount === 0) continue;
    const group = r.subtype_group ?? 'Not Applicable';
    const subtype = r.subtype ?? '__null__';
    const label = r.source_row_name;

    let perHotelBucket = byHotel.get(r.code);
    if (!perHotelBucket) { perHotelBucket = new Map(); byHotel.set(r.code, perHotelBucket); }
    upsertLine(perHotelBucket, r.type, group, subtype, label, amount);
    upsertLine(portByType, r.type, group, subtype, label, amount);
  }

  // Sorted by descending Type total — but we want a stable ordering: Room
  // Revenue first, No Show Room Revenue second, Charges last. The frontend
  // can re-sort if needed.
  const TYPE_ORDER = ['Room Revenue', 'No Show Room Revenue', 'Charges'];
  const SUBTYPE_GROUP_ORDER = ['Events', 'F&B', 'Additional Room Charges', 'Other Charges', 'Not Applicable'];

  const buildBreakdown = (
    hotelId: string,
    typed: Map<string, Map<string, Map<string, ApiRevenueLine[]>>>,
  ): ApiRevenueBreakdown => {
    const types: ApiRevenueType[] = [];
    let total = 0;
    const typeKeys = [...typed.keys()].sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a); const bi = TYPE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    for (const tKey of typeKeys) {
      const groupMap = typed.get(tKey)!;
      const groups: ApiRevenueSubtypeGroup[] = [];
      let typeTotal = 0;
      const groupKeys = [...groupMap.keys()].sort((a, b) => {
        const ai = SUBTYPE_GROUP_ORDER.indexOf(a); const bi = SUBTYPE_GROUP_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      for (const gKey of groupKeys) {
        const subtypeMap = groupMap.get(gKey)!;
        const lines: ApiRevenueLine[] = [];
        let groupTotal = 0;
        for (const arr of subtypeMap.values()) {
          for (const line of arr) {
            lines.push(line);
            groupTotal += line.amount;
          }
        }
        lines.sort((a, b) => b.amount - a.amount);
        if (lines.length === 0) continue;
        groups.push({ group: gKey, total: groupTotal, lines });
        typeTotal += groupTotal;
      }
      if (groups.length === 0) continue;
      types.push({ type: tKey, total: typeTotal, groups });
      total += typeTotal;
    }
    return { hotelId, total, types };
  };

  const perHotel: ApiRevenueBreakdown[] = [...byHotel.entries()].map(
    ([code, typed]) => buildBreakdown(code, typed),
  );
  perHotel.sort((a, b) => a.hotelId.localeCompare(b.hotelId));

  const portfolio = buildBreakdown('PORTFOLIO', portByType);
  return { portfolio, perHotel };
}
