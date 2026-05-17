import 'server-only';
import { db, requireHosTenantId } from '@/lib/db/client';
import type { ParseResult } from './types';

export type ApplyStep =
  | 'revenue' | 'occupancy'
  | 'labour-periods' | 'labour-departments'
  | 'am-pm-snapshots'
  | 'payment-mix' | 'market-segment' | 'tax-breakdown' | 'ledger-balances'
  | 'rooms' | 'arrivals' | 'high-balance';

export interface ApplyContext {
  batchId?: string;
  source: 'email' | 'upload' | 'api' | 'manual';
  uploadedBy?: string | null;
  /** Optional progress callback. Fires once per table block, before & after the upserts. */
  onProgress?: (event: { step: ApplyStep; rows: number; ms?: number }) => void;
}

export interface ApplySummary {
  revenueRowsUpserted: number;
  occupancyRowsUpserted: number;
  labourPeriodsUpserted: number;
  labourDeptRowsUpserted: number;
  amPmSnapshotsUpserted: number;
  amPmRoomTypeRowsUpserted: number;
  // OnQ extras (Phase 2)
  paymentMixUpserted: number;
  marketSegmentUpserted: number;
  taxBreakdownUpserted: number;
  ledgerBalancesUpserted: number;
  roomSnapshotsUpserted: number;
  reservationArrivalsUpserted: number;
  highBalanceAlertsUpserted: number;
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
    paymentMixUpserted: 0,
    marketSegmentUpserted: 0,
    taxBreakdownUpserted: 0,
    ledgerBalancesUpserted: 0,
    roomSnapshotsUpserted: 0,
    reservationArrivalsUpserted: 0,
    highBalanceAlertsUpserted: 0,
    warnings: [...(result.warnings ?? [])],
    errors: [...(result.errors ?? [])],
  };
  const tStep = (step: ApplyStep, rows: number, t0: number) =>
    ctx.onProgress?.({ step, rows, ms: Date.now() - t0 });

  const tenantId = await requireHosTenantId();

  const codes = new Set<string>([
    ...(result.daily_revenue?.map((r) => r.hotelCode) ?? []),
    ...(result.daily_occupancy?.map((r) => r.hotelCode) ?? []),
    ...(result.labour_periods?.map((r) => r.hotelCode) ?? []),
    ...(result.labour_departments?.map((r) => r.hotelCode) ?? []),
    ...(result.am_pm_snapshots?.map((r) => r.hotelCode) ?? []),
    ...(result.payment_method_mix?.map((r) => r.hotelCode) ?? []),
    ...(result.market_segment_mix?.map((r) => r.hotelCode) ?? []),
    ...(result.tax_breakdown?.map((r) => r.hotelCode) ?? []),
    ...(result.ledger_balances?.map((r) => r.hotelCode) ?? []),
    ...(result.room_snapshots?.map((r) => r.hotelCode) ?? []),
    ...(result.reservation_arrivals?.map((r) => r.hotelCode) ?? []),
    ...(result.high_balance_alerts?.map((r) => r.hotelCode) ?? []),
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

    // ── OnQ Phase 2: payment_method_mix ─────────────────────────────────
    if (result.payment_method_mix && result.payment_method_mix.length > 0) {
      const t0 = Date.now();
      for (const r of result.payment_method_mix) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into payment_method_mix (
            hotel_id, date, method, amount_today, amount_mtd, amount_ytd, uploaded_at
          )
          values (${hid}, ${r.date}::date, ${r.method}, ${r.amount_today}, ${r.amount_mtd}, ${r.amount_ytd}, now())
          on conflict (hotel_id, date, method) do update set
            amount_today = excluded.amount_today,
            amount_mtd   = excluded.amount_mtd,
            amount_ytd   = excluded.amount_ytd,
            uploaded_at  = now()
        `;
        summary.paymentMixUpserted++;
      }
      tStep('payment-mix', summary.paymentMixUpserted, t0);
    }

    // ── market_segment_mix ──────────────────────────────────────────────
    if (result.market_segment_mix && result.market_segment_mix.length > 0) {
      const t0 = Date.now();
      for (const r of result.market_segment_mix) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into market_segment_mix (
            hotel_id, date, segment,
            rooms_today, rooms_mtd, rooms_ytd,
            revenue_today, revenue_mtd, revenue_ytd, uploaded_at
          )
          values (
            ${hid}, ${r.date}::date, ${r.segment},
            ${r.rooms_today}, ${r.rooms_mtd}, ${r.rooms_ytd},
            ${r.revenue_today}, ${r.revenue_mtd}, ${r.revenue_ytd}, now()
          )
          on conflict (hotel_id, date, segment) do update set
            rooms_today   = excluded.rooms_today,
            rooms_mtd     = excluded.rooms_mtd,
            rooms_ytd     = excluded.rooms_ytd,
            revenue_today = excluded.revenue_today,
            revenue_mtd   = excluded.revenue_mtd,
            revenue_ytd   = excluded.revenue_ytd,
            uploaded_at   = now()
        `;
        summary.marketSegmentUpserted++;
      }
      tStep('market-segment', summary.marketSegmentUpserted, t0);
    }

    // ── tax_breakdown ───────────────────────────────────────────────────
    if (result.tax_breakdown && result.tax_breakdown.length > 0) {
      const t0 = Date.now();
      for (const r of result.tax_breakdown) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into tax_breakdown (
            hotel_id, date, tax_type, amount_today, amount_mtd, amount_ytd, uploaded_at
          )
          values (${hid}, ${r.date}::date, ${r.tax_type}, ${r.amount_today}, ${r.amount_mtd}, ${r.amount_ytd}, now())
          on conflict (hotel_id, date, tax_type) do update set
            amount_today = excluded.amount_today,
            amount_mtd   = excluded.amount_mtd,
            amount_ytd   = excluded.amount_ytd,
            uploaded_at  = now()
        `;
        summary.taxBreakdownUpserted++;
      }
      tStep('tax-breakdown', summary.taxBreakdownUpserted, t0);
    }

    // ── ledger_balances ─────────────────────────────────────────────────
    if (result.ledger_balances && result.ledger_balances.length > 0) {
      const t0 = Date.now();
      for (const r of result.ledger_balances) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into ledger_balances (
            hotel_id, date, ledger_name, opening_balance, net_change, closing_balance, uploaded_at
          )
          values (${hid}, ${r.date}::date, ${r.ledger_name}, ${r.opening_balance}, ${r.net_change}, ${r.closing_balance}, now())
          on conflict (hotel_id, date, ledger_name) do update set
            opening_balance = excluded.opening_balance,
            net_change      = excluded.net_change,
            closing_balance = excluded.closing_balance,
            uploaded_at     = now()
        `;
        summary.ledgerBalancesUpserted++;
      }
      tStep('ledger-balances', summary.ledgerBalancesUpserted, t0);
    }

    // ── room_snapshots (one row per room per upload) ────────────────────
    if (result.room_snapshots && result.room_snapshots.length > 0) {
      const t0 = Date.now();
      for (const r of result.room_snapshots) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into room_snapshots (
            hotel_id, captured_at, room_number, room_type_code,
            occ_status, hsk_status, guest_name, addn_guests, honors_tier,
            arrival_date, departure_date, rate_plan, reservation_status,
            pending_status, maintenance, last_occupied, uploaded_at
          )
          values (
            ${hid}, ${r.captured_at}::timestamptz, ${r.room_number}, ${r.room_type_code ?? null},
            ${r.occ_status ?? null}, ${r.hsk_status ?? null}, ${r.guest_name ?? null},
            ${r.addn_guests ?? null}, ${r.honors_tier ?? null},
            ${r.arrival_date ?? null}::date, ${r.departure_date ?? null}::date,
            ${r.rate_plan ?? null}, ${r.reservation_status ?? null},
            ${r.pending_status ?? null}, ${r.maintenance ?? null},
            ${r.last_occupied ?? null}::date, now()
          )
          on conflict (hotel_id, captured_at, room_number) do update set
            room_type_code = excluded.room_type_code,
            occ_status     = excluded.occ_status,
            hsk_status     = excluded.hsk_status,
            guest_name     = excluded.guest_name,
            addn_guests    = excluded.addn_guests,
            honors_tier    = excluded.honors_tier,
            arrival_date   = excluded.arrival_date,
            departure_date = excluded.departure_date,
            rate_plan      = excluded.rate_plan,
            reservation_status = excluded.reservation_status,
            pending_status = excluded.pending_status,
            maintenance    = excluded.maintenance,
            last_occupied  = excluded.last_occupied,
            uploaded_at    = now()
        `;
        summary.roomSnapshotsUpserted++;
      }
      tStep('rooms', summary.roomSnapshotsUpserted, t0);
    }

    // ── reservation_arrivals ────────────────────────────────────────────
    if (result.reservation_arrivals && result.reservation_arrivals.length > 0) {
      const t0 = Date.now();
      for (const r of result.reservation_arrivals) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into reservation_arrivals (
            hotel_id, confirmation_number, arrival_date, departure_date,
            guest_name, addn_guests, room_type, room_number, rate_plan,
            adults, children, company, avg_room_rate, avg_room_taxes, fee,
            honors_tier, vip_guest, guest_tier, guarantee_type,
            arrival_time, digital_check_in, add_on, stay_requests,
            booking_remarks, stay_remarks, virtual_cc, uploaded_at
          )
          values (
            ${hid}, ${r.confirmation_number},
            ${r.arrival_date ?? null}::date, ${r.departure_date ?? null}::date,
            ${r.guest_name ?? null}, ${r.addn_guests ?? null},
            ${r.room_type ?? null}, ${r.room_number ?? null}, ${r.rate_plan ?? null},
            ${r.adults ?? null}, ${r.children ?? null}, ${r.company ?? null},
            ${r.avg_room_rate ?? null}, ${r.avg_room_taxes ?? null}, ${r.fee ?? null},
            ${r.honors_tier ?? null}, ${r.vip_guest ?? null}, ${r.guest_tier ?? null},
            ${r.guarantee_type ?? null}, ${r.arrival_time ?? null}, ${r.digital_check_in ?? null},
            ${r.add_on ?? null}, ${r.stay_requests ?? null},
            ${r.booking_remarks ?? null}, ${r.stay_remarks ?? null}, ${r.virtual_cc ?? null},
            now()
          )
          on conflict (hotel_id, confirmation_number) do update set
            arrival_date   = excluded.arrival_date,
            departure_date = excluded.departure_date,
            guest_name     = excluded.guest_name,
            addn_guests    = excluded.addn_guests,
            room_type      = excluded.room_type,
            room_number    = excluded.room_number,
            rate_plan      = excluded.rate_plan,
            adults         = excluded.adults,
            children       = excluded.children,
            company        = excluded.company,
            avg_room_rate  = excluded.avg_room_rate,
            avg_room_taxes = excluded.avg_room_taxes,
            fee            = excluded.fee,
            honors_tier    = excluded.honors_tier,
            vip_guest      = excluded.vip_guest,
            guest_tier     = excluded.guest_tier,
            guarantee_type = excluded.guarantee_type,
            arrival_time   = excluded.arrival_time,
            digital_check_in = excluded.digital_check_in,
            add_on         = excluded.add_on,
            stay_requests  = excluded.stay_requests,
            booking_remarks = excluded.booking_remarks,
            stay_remarks   = excluded.stay_remarks,
            virtual_cc     = excluded.virtual_cc,
            uploaded_at    = now()
        `;
        summary.reservationArrivalsUpserted++;
      }
      tStep('arrivals', summary.reservationArrivalsUpserted, t0);
    }

    // ── high_balance_alerts ─────────────────────────────────────────────
    if (result.high_balance_alerts && result.high_balance_alerts.length > 0) {
      const t0 = Date.now();
      for (const r of result.high_balance_alerts) {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) continue;
        await tx`
          insert into high_balance_alerts (
            hotel_id, captured_at, folio_name, room_number, guest_name, guest_tier,
            arrival_date, departure_date, room_rate, folio_balance, credit_balance,
            outstanding_balance, payment_method, available_credit_limit, auto_top_off_status, uploaded_at
          )
          values (
            ${hid}, ${r.captured_at}::timestamptz, ${r.folio_name}, ${r.room_number ?? null},
            ${r.guest_name ?? null}, ${r.guest_tier ?? null},
            ${r.arrival_date ?? null}::date, ${r.departure_date ?? null}::date,
            ${r.room_rate ?? null}, ${r.folio_balance ?? null}, ${r.credit_balance ?? null},
            ${r.outstanding_balance ?? null}, ${r.payment_method ?? null},
            ${r.available_credit_limit ?? null}, ${r.auto_top_off_status ?? null}, now()
          )
          on conflict (hotel_id, captured_at, folio_name) do update set
            room_number            = excluded.room_number,
            guest_name             = excluded.guest_name,
            guest_tier             = excluded.guest_tier,
            arrival_date           = excluded.arrival_date,
            departure_date         = excluded.departure_date,
            room_rate              = excluded.room_rate,
            folio_balance          = excluded.folio_balance,
            credit_balance         = excluded.credit_balance,
            outstanding_balance    = excluded.outstanding_balance,
            payment_method         = excluded.payment_method,
            available_credit_limit = excluded.available_credit_limit,
            auto_top_off_status    = excluded.auto_top_off_status,
            uploaded_at            = now()
        `;
        summary.highBalanceAlertsUpserted++;
      }
      tStep('high-balance', summary.highBalanceAlertsUpserted, t0);
    }
  });

  return summary;
}
