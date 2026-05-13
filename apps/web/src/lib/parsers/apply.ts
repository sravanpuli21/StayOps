import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ParseResult } from './types';

export interface ApplyContext {
  batchId?: string;
  source: 'email' | 'upload' | 'api' | 'manual';
  uploadedBy?: string | null;
}

export interface ApplySummary {
  revenueRowsUpserted: number;
  occupancyRowsUpserted: number;
  labourPeriodsUpserted: number;
  labourDeptRowsUpserted: number;
  amPmSnapshotsUpserted: number;
  amPmRoomTypeRowsUpserted: number;
  warnings: string[];
  errors: string[];
}

/**
 * Apply a ParseResult to Neon Postgres.
 * - Resolves hotel codes → hotel_id within the HOS tenant
 * - Upserts daily_revenue / daily_occupancy on (hotel_id, date)
 * - Upserts labour_periods on (hotel_id, period_end) and labour_departments
 *   on (hotel_id, period_end, department)
 * - AM/PM snapshots are accepted by the parser but skipped at write-time
 *   in Phase 1.A (table not yet present); a warning notes the count.
 */
export async function applyParseResult(result: ParseResult, ctx: ApplyContext): Promise<ApplySummary> {
  const summary: ApplySummary = {
    revenueRowsUpserted: 0,
    occupancyRowsUpserted: 0,
    labourPeriodsUpserted: 0,
    labourDeptRowsUpserted: 0,
    amPmSnapshotsUpserted: 0,
    amPmRoomTypeRowsUpserted: 0,
    warnings: [...(result.warnings ?? [])],
    errors: [...(result.errors ?? [])],
  };

  const tenantId = await getHosTenantId();

  const codes = new Set<string>([
    ...(result.daily_revenue?.map((r) => r.hotelCode) ?? []),
    ...(result.daily_occupancy?.map((r) => r.hotelCode) ?? []),
    ...(result.labour_periods?.map((r) => r.hotelCode) ?? []),
    ...(result.labour_departments?.map((r) => r.hotelCode) ?? []),
    ...(result.am_pm_snapshots?.map((r) => r.hotelCode) ?? []),
  ]);
  if (codes.size === 0) return summary;

  const codeList = [...codes];
  const hotels = await db<{ id: string; code: string }[]>`
    select id, code from hotels
    where tenant_id = ${tenantId} and code = any(${codeList})
  `;
  const codeToId = new Map(hotels.map((h) => [h.code, h.id]));

  await db.begin(async (tx) => {
    // daily_revenue
    if (result.daily_revenue && result.daily_revenue.length > 0) {
      for (const r of result.daily_revenue) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) {
          summary.warnings.push(`Unknown hotel_code ${r.hotelCode} (daily_revenue)`);
          continue;
        }
        await tx`
          insert into daily_revenue (
            hotel_id, date, total_revenue, room_revenue, non_room_revenue,
            mix_room, mix_fb, mix_retail, mix_events, mix_other,
            adr, revpar, occupancy_pct, market_adr, health, source, uploaded_by, uploaded_at
          )
          values (
            ${hid}, ${r.date}::date, ${r.total_revenue}, ${r.room_revenue}, ${r.non_room_revenue},
            ${r.mix_room}, ${r.mix_fb}, ${r.mix_retail}, ${r.mix_events}, ${r.mix_other},
            ${r.adr}, ${r.revpar}, ${r.occupancy_pct}, ${r.market_adr ?? null},
            ${r.health ?? null}, ${ctx.source}, ${ctx.uploadedBy ?? null}, now()
          )
          on conflict (hotel_id, date) do update set
            total_revenue = excluded.total_revenue,
            room_revenue = excluded.room_revenue,
            non_room_revenue = excluded.non_room_revenue,
            mix_room = excluded.mix_room, mix_fb = excluded.mix_fb,
            mix_retail = excluded.mix_retail, mix_events = excluded.mix_events,
            mix_other = excluded.mix_other,
            adr = excluded.adr, revpar = excluded.revpar,
            occupancy_pct = excluded.occupancy_pct,
            market_adr = coalesce(excluded.market_adr, daily_revenue.market_adr),
            health = excluded.health,
            source = excluded.source,
            uploaded_by = excluded.uploaded_by,
            uploaded_at = now()
        `;
        summary.revenueRowsUpserted++;
      }
    }

    // daily_occupancy
    if (result.daily_occupancy && result.daily_occupancy.length > 0) {
      for (const r of result.daily_occupancy) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into daily_occupancy (
            hotel_id, date, rooms_sold, rooms_ooo, walk_ins, no_shows, cancellations,
            arrivals, departures, stay_overs, avg_customer_rating, review_count
          )
          values (
            ${hid}, ${r.date}::date, ${r.rooms_sold}, ${r.rooms_ooo ?? 0}, ${r.walk_ins ?? 0},
            ${r.no_shows ?? 0}, ${r.cancellations ?? 0}, ${r.arrivals ?? 0},
            ${r.departures ?? 0}, ${r.stay_overs ?? 0},
            ${r.avg_customer_rating ?? null}, ${r.review_count ?? 0}
          )
          on conflict (hotel_id, date) do update set
            rooms_sold = excluded.rooms_sold,
            rooms_ooo = excluded.rooms_ooo,
            walk_ins = excluded.walk_ins,
            no_shows = excluded.no_shows,
            cancellations = excluded.cancellations,
            arrivals = excluded.arrivals,
            departures = excluded.departures,
            stay_overs = excluded.stay_overs,
            avg_customer_rating = coalesce(excluded.avg_customer_rating, daily_occupancy.avg_customer_rating),
            review_count = excluded.review_count
        `;
        summary.occupancyRowsUpserted++;
      }
    }

    // labour_periods (must precede labour_departments due to FK)
    if (result.labour_periods && result.labour_periods.length > 0) {
      for (const r of result.labour_periods) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) {
          summary.warnings.push(`Unknown hotel_code ${r.hotelCode} (labour_periods)`);
          continue;
        }
        await tx`
          insert into labour_periods (
            hotel_id, period_end, period_start,
            scheduled_hours, clocked_hours, overtime_hours, payroll_cost,
            health, source, uploaded_by, uploaded_at
          )
          values (
            ${hid}, ${r.period_end}::date, ${r.period_start}::date,
            ${r.scheduled_hours}, ${r.clocked_hours}, ${r.overtime_hours}, ${r.payroll_cost},
            ${r.health ?? null}, ${ctx.source}, ${ctx.uploadedBy ?? null}, now()
          )
          on conflict (hotel_id, period_end) do update set
            period_start = excluded.period_start,
            scheduled_hours = excluded.scheduled_hours,
            clocked_hours = excluded.clocked_hours,
            overtime_hours = excluded.overtime_hours,
            payroll_cost = excluded.payroll_cost,
            health = excluded.health,
            source = excluded.source,
            uploaded_by = excluded.uploaded_by,
            uploaded_at = now()
        `;
        summary.labourPeriodsUpserted++;
      }
    }

    // labour_departments
    if (result.labour_departments && result.labour_departments.length > 0) {
      for (const r of result.labour_departments) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into labour_departments (
            hotel_id, period_end, department,
            scheduled_hours, clocked_hours, overtime_hours, payroll_cost
          )
          values (
            ${hid}, ${r.period_end}::date, ${r.department},
            ${r.scheduled_hours}, ${r.clocked_hours}, ${r.overtime_hours}, ${r.payroll_cost}
          )
          on conflict (hotel_id, period_end, department) do update set
            scheduled_hours = excluded.scheduled_hours,
            clocked_hours = excluded.clocked_hours,
            overtime_hours = excluded.overtime_hours,
            payroll_cost = excluded.payroll_cost
        `;
        summary.labourDeptRowsUpserted++;
      }
    }
    // am_pm_snapshots + nested room_type_rows
    if (result.am_pm_snapshots && result.am_pm_snapshots.length > 0) {
      for (const snap of result.am_pm_snapshots) {
        const hid = codeToId.get(snap.hotelCode);
        if (!hid) {
          summary.warnings.push(`Unknown hotel_code ${snap.hotelCode} (am_pm_snapshots)`);
          continue;
        }
        const [row] = await tx<{ id: string }[]>`
          insert into am_pm_snapshots (
            hotel_id, date, slot, generated_at,
            total_rooms, rooms_sold, rooms_ooo, rooms_left_to_sell,
            adr, avg_price, revpar, occupancy_pct,
            source, uploaded_by, uploaded_at
          )
          values (
            ${hid}, ${snap.date}::date, ${snap.slot},
            ${snap.generated_at ?? new Date().toISOString()}::timestamptz,
            ${snap.total_rooms}, ${snap.rooms_sold}, ${snap.rooms_ooo}, ${snap.rooms_left_to_sell},
            ${snap.adr}, ${snap.avg_price}, ${snap.revpar}, ${snap.occupancy_pct},
            ${ctx.source}, ${ctx.uploadedBy ?? null}, now()
          )
          on conflict (hotel_id, date, slot) do update set
            generated_at = excluded.generated_at,
            total_rooms = excluded.total_rooms,
            rooms_sold = excluded.rooms_sold,
            rooms_ooo = excluded.rooms_ooo,
            rooms_left_to_sell = excluded.rooms_left_to_sell,
            adr = excluded.adr,
            avg_price = excluded.avg_price,
            revpar = excluded.revpar,
            occupancy_pct = excluded.occupancy_pct,
            source = excluded.source,
            uploaded_by = excluded.uploaded_by,
            uploaded_at = now()
          returning id
        `;
        summary.amPmSnapshotsUpserted++;

        // Replace child rows for this snapshot (cleanest semantics for re-ingest)
        await tx`delete from am_pm_room_type_rows where snapshot_id = ${row.id}`;
        for (const rt of snap.room_type_rows) {
          await tx`
            insert into am_pm_room_type_rows (
              snapshot_id, room_type_code, label,
              total, sold, ooo, left_to_sell,
              adr, avg_price, revpar, occupancy_pct
            )
            values (
              ${row.id}, ${rt.room_type_code}, ${rt.label ?? null},
              ${rt.total}, ${rt.sold}, ${rt.ooo}, ${rt.left_to_sell},
              ${rt.adr}, ${rt.avg_price}, ${rt.revpar}, ${rt.occupancy_pct}
            )
          `;
          summary.amPmRoomTypeRowsUpserted++;
        }
      }
    }
  });

  return summary;
}
