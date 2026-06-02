import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { db, getHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/health — admin-gated system snapshot:
 *  - row counts for the core data tables
 *  - last ingestion batch (any source)
 *  - per-hotel data freshness (latest daily_revenue date vs report cadence)
 *  - recent upload_batches feed
 */

const COUNT_TABLES = [
  'hotels',
  'users',
  'daily_revenue',
  'daily_occupancy',
  'labour_periods',
  'maintenance_tickets',
  'room_snapshots',
  'night_audit_rows',
  'employee_punches',
  'upload_batches',
] as const;

export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const tenantId = await getHosTenantId();
  if (!tenantId) {
    return Response.json({ counts: [], lastIngestion: null, freshness: [], recentBatches: [] });
  }

  // 1) Row counts per table (unsafe table name is from a fixed allowlist above)
  const counts: Array<{ table: string; count: number }> = [];
  for (const table of COUNT_TABLES) {
    const rows = await db.unsafe(`select count(*)::int as n from ${table}`);
    counts.push({ table, count: (rows[0] as unknown as { n: number })?.n ?? 0 });
  }

  // 2) Last ingestion batch overall
  const lastBatchRows = await db<Array<{
    uploaded_at: string; source: string; status: string; source_filename: string | null;
  }>>`
    select uploaded_at, source, status, source_filename
    from upload_batches
    where tenant_id = ${tenantId}
    order by uploaded_at desc
    limit 1
  `;
  const lastIngestion = lastBatchRows[0]
    ? {
        at: lastBatchRows[0].uploaded_at,
        source: lastBatchRows[0].source,
        status: lastBatchRows[0].status,
        filename: lastBatchRows[0].source_filename,
      }
    : null;

  // 3) Per-hotel data freshness
  const freshnessRows = await db<Array<{
    code: string; short_name: string; last_data_date: string | null;
  }>>`
    select
      h.code,
      h.short_name,
      (select max(dr.date) from daily_revenue dr where dr.hotel_id = h.id) as last_data_date
    from hotels h
    where h.tenant_id = ${tenantId}
    order by last_data_date asc nulls first, h.code
  `;
  const freshness = freshnessRows.map((r) => ({
    code: r.code,
    shortName: r.short_name,
    lastDataDate: r.last_data_date,
  }));

  // 4) Recent upload batches
  const recentRows = await db<Array<{
    uploaded_at: string; source: string; report_type: string | null;
    parser_id: string | null; status: string; row_count: number | null;
    source_filename: string | null; report_date: string | null;
  }>>`
    select uploaded_at, source, report_type, parser_id, status, row_count, source_filename, report_date
    from upload_batches
    where tenant_id = ${tenantId}
    order by uploaded_at desc
    limit 15
  `;
  const recentBatches = recentRows.map((r) => ({
    at: r.uploaded_at,
    source: r.source,
    reportType: r.report_type,
    parser: r.parser_id,
    status: r.status,
    rowCount: r.row_count ?? 0,
    filename: r.source_filename,
    reportDate: r.report_date,
  }));

  return Response.json({ counts, lastIngestion, freshness, recentBatches });
}
