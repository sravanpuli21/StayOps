import 'server-only';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';
import type { ParseResult } from './types';

export interface ApplyContext {
  batchId?: string; // upload_batches row id
  source: 'email' | 'upload' | 'api' | 'manual';
  uploadedBy?: string | null;
}

export interface ApplySummary {
  revenueRowsUpserted: number;
  occupancyRowsUpserted: number;
  snapshotsUpserted: number;
  roomTypeRowsUpserted: number;
  warnings: string[];
  errors: string[];
}

/**
 * Applies a ParseResult to the database.
 * - Resolves hotel code → hotel_id
 * - Upserts daily_revenue, daily_occupancy on (hotel_id, date)
 * - Upserts am_pm_snapshots on (hotel_id, date, slot) and links room_type_rows
 */
export async function applyParseResult(result: ParseResult, ctx: ApplyContext): Promise<ApplySummary> {
  const summary: ApplySummary = {
    revenueRowsUpserted: 0,
    occupancyRowsUpserted: 0,
    snapshotsUpserted: 0,
    roomTypeRowsUpserted: 0,
    warnings: [...(result.warnings ?? [])],
    errors: [...(result.errors ?? [])],
  };

  const sb = supabaseServer();
  const tenantId = await getHosTenantId();

  // Resolve all hotel codes → ids in one shot
  const codes = new Set<string>([
    ...(result.daily_revenue?.map((r) => r.hotelCode) ?? []),
    ...(result.daily_occupancy?.map((r) => r.hotelCode) ?? []),
    ...(result.am_pm_snapshots?.map((r) => r.hotelCode) ?? []),
  ]);
  const codeList = [...codes];
  if (codeList.length === 0) return summary;

  const { data: hotels, error: hErr } = await sb
    .from('hotels')
    .select('id, code')
    .eq('tenant_id', tenantId)
    .in('code', codeList);
  if (hErr) {
    summary.errors.push(`Hotel lookup failed: ${hErr.message}`);
    return summary;
  }
  const codeToId = new Map<string, string>((hotels ?? []).map((h) => [h.code, h.id]));

  // daily_revenue
  if (result.daily_revenue && result.daily_revenue.length > 0) {
    const rows = result.daily_revenue
      .map((r) => {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) {
          summary.warnings.push(`Unknown hotel code ${r.hotelCode} in daily_revenue row; skipped`);
          return null;
        }
        return {
          hotel_id: hid,
          date: r.date,
          total_revenue: r.total_revenue,
          room_revenue: r.room_revenue,
          non_room_revenue: r.non_room_revenue,
          mix_room: r.mix_room,
          mix_fb: r.mix_fb,
          mix_retail: r.mix_retail,
          mix_events: r.mix_events,
          mix_other: r.mix_other,
          adr: r.adr,
          revpar: r.revpar,
          occupancy_pct: r.occupancy_pct,
          market_adr: r.market_adr ?? null,
          health: r.health ?? null,
          source: ctx.source,
          uploaded_by: ctx.uploadedBy ?? null,
          uploaded_at: new Date().toISOString(),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (rows.length > 0) {
      const { error } = await sb.from('daily_revenue').upsert(rows, { onConflict: 'hotel_id,date' });
      if (error) summary.errors.push(`daily_revenue upsert: ${error.message}`);
      else summary.revenueRowsUpserted = rows.length;
    }
  }

  // daily_occupancy
  if (result.daily_occupancy && result.daily_occupancy.length > 0) {
    const rows = result.daily_occupancy
      .map((r) => {
        const hid = codeToId.get(r.hotelCode);
        if (!hid) return null;
        return {
          hotel_id: hid,
          date: r.date,
          rooms_sold: r.rooms_sold,
          rooms_ooo: r.rooms_ooo ?? 0,
          walk_ins: r.walk_ins ?? 0,
          no_shows: r.no_shows ?? 0,
          cancellations: r.cancellations ?? 0,
          arrivals: r.arrivals ?? 0,
          departures: r.departures ?? 0,
          stay_overs: r.stay_overs ?? 0,
          avg_customer_rating: r.avg_customer_rating ?? null,
          review_count: r.review_count ?? 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (rows.length > 0) {
      const { error } = await sb.from('daily_occupancy').upsert(rows, { onConflict: 'hotel_id,date' });
      if (error) summary.errors.push(`daily_occupancy upsert: ${error.message}`);
      else summary.occupancyRowsUpserted = rows.length;
    }
  }

  // am_pm_snapshots (+ child rows)
  if (result.am_pm_snapshots && result.am_pm_snapshots.length > 0) {
    for (const snap of result.am_pm_snapshots) {
      const hid = codeToId.get(snap.hotelCode);
      if (!hid) continue;

      // Upsert snapshot head
      const { data: inserted, error } = await sb
        .from('am_pm_snapshots')
        .upsert({
          hotel_id: hid,
          date: snap.date,
          slot: snap.slot,
          generated_at: snap.generated_at ?? new Date().toISOString(),
          total_rooms: snap.total_rooms,
          rooms_sold: snap.rooms_sold,
          rooms_ooo: snap.rooms_ooo,
          rooms_left_to_sell: snap.rooms_left_to_sell,
          adr: snap.adr,
          avg_price: snap.avg_price,
          revpar: snap.revpar,
          occupancy_pct: snap.occupancy_pct,
        }, { onConflict: 'hotel_id,date,slot' })
        .select('id')
        .single();
      if (error || !inserted) {
        summary.errors.push(`am_pm_snapshots upsert: ${error?.message ?? 'unknown'}`);
        continue;
      }
      summary.snapshotsUpserted += 1;

      // Replace child rows for this snapshot
      await sb.from('am_pm_room_type_rows').delete().eq('snapshot_id', inserted.id);
      if (snap.room_type_rows.length > 0) {
        const { error: cErr } = await sb.from('am_pm_room_type_rows').insert(
          snap.room_type_rows.map((row) => ({
            snapshot_id: inserted.id,
            room_type_code: row.room_type_code,
            label: row.label ?? null,
            total: row.total,
            sold: row.sold,
            ooo: row.ooo,
            left_to_sell: row.left_to_sell,
            adr: row.adr,
            avg_price: row.avg_price,
            revpar: row.revpar,
            occupancy_pct: row.occupancy_pct,
          })),
        );
        if (cErr) summary.errors.push(`am_pm_room_type_rows insert: ${cErr.message}`);
        else summary.roomTypeRowsUpserted += snap.room_type_rows.length;
      }
    }
  }

  return summary;
}
