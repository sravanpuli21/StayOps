import { NextRequest } from 'next/server';
import { db, requireHosTenantId } from '@/lib/db/client';
import { requireAdminSecret } from '@/lib/admin-guard';
import { classifyForParser, runParser } from '@/lib/parsers/registry';
import { applyParseResult, type ApplyStep, type ApplySummary } from '@/lib/parsers/apply';
import { parseOnqFilename } from '@/lib/parsers/onq/filename';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/uploads
 *
 * Admin-gated CSV/XLSX intake. Two response modes:
 *  - default: single JSON `{ ok, parser, batchId, summary }`
 *  - `Accept: text/event-stream`: live SSE event stream with one event per
 *    step (classifying → parsing → applying-{table}* → done | error)
 *
 * Form fields:
 *   file        — multipart File (required)
 *   hotelCode   — optional override; otherwise inferred from filename
 *   reportDate  — optional ISO date
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'missing file' }, { status: 400 });
  }
  const hotelCodeOverride = (form.get('hotelCode') as string | null) ?? undefined;
  const reportDateOverride = (form.get('reportDate') as string | null) ?? undefined;
  const buffer = Buffer.from(await file.arrayBuffer());
  const wantsStream = req.headers.get('accept')?.includes('text/event-stream') ?? false;

  if (wantsStream) {
    return new Response(buildEventStream(file.name, buffer, hotelCodeOverride, reportDateOverride), {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        'x-accel-buffering': 'no',
        connection: 'keep-alive',
      },
    });
  }

  // ── Non-streaming path (kept for backward compat) ─────────────────────
  const result = await runIngest(file.name, buffer, hotelCodeOverride, reportDateOverride);
  return Response.json(result.body, { status: result.status });
}

// =============================================================================
// Streaming variant — emits one SSE event per pipeline step
// =============================================================================

function sseEvent(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(payload);
}

function buildEventStream(
  filename: string,
  buffer: Buffer,
  hotelCodeOverride: string | undefined,
  reportDateOverride: string | undefined,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(sseEvent(event, data));
      try {
        // 1. Classify
        const fnameMeta = parseOnqFilename(filename);
        const parser = classifyForParser({ filename });
        send('classifying', {
          filename,
          hotelCode: fnameMeta?.hotelCode ?? hotelCodeOverride ?? null,
          date: fnameMeta?.date ?? reportDateOverride ?? null,
          reportType: fnameMeta?.reportType ?? parser?.reportType ?? null,
          parserId: parser?.id ?? null,
          dedup: fnameMeta?.dedupSuffix ?? null,
        });

        const tenantId = await requireHosTenantId();
        let hotelDbId: string | null = null;
        if (hotelCodeOverride) {
          const found = await db<{ id: string }[]>`
            select id from hotels where tenant_id = ${tenantId} and code = ${hotelCodeOverride} limit 1
          `;
          hotelDbId = found[0]?.id ?? null;
        }

        // 2. Open audit row
        const [batch] = await db<{ id: string }[]>`
          insert into upload_batches (
            tenant_id, hotel_id, source, source_filename, report_date, report_type, parser_id, status
          )
          values (
            ${tenantId}, ${hotelDbId}, 'upload', ${filename},
            ${reportDateOverride ?? fnameMeta?.date ?? null}, ${parser?.reportType ?? null}, ${parser?.id ?? null}, 'pending'
          )
          returning id
        `;

        if (!parser) {
          await db`
            update upload_batches set status='failed',
              errors = ${JSON.stringify(['no parser matched filename'])}::jsonb,
              completed_at = now()
            where id = ${batch.id}
          `;
          send('error', { batchId: batch.id, message: `No parser matched filename "${filename}"` });
          controller.close();
          return;
        }

        // 3. Parse
        const t0 = Date.now();
        const parsed = await runParser(parser, { buffer, filename, hotelCode: hotelCodeOverride, reportDate: reportDateOverride });
        send('parsing', {
          parserId: parser.id,
          ms: Date.now() - t0,
          rowsExtracted: rowSummary(parsed),
          warnings: parsed.warnings,
        });

        if (parsed.errors.length > 0) {
          await db`
            update upload_batches set status='failed',
              errors = ${JSON.stringify(parsed.errors)}::jsonb,
              warnings = ${JSON.stringify(parsed.warnings)}::jsonb,
              completed_at = now()
            where id = ${batch.id}
          `;
          send('error', { batchId: batch.id, errors: parsed.errors, warnings: parsed.warnings });
          controller.close();
          return;
        }

        // 4. Apply (with per-step progress events)
        const summary = await applyParseResult(parsed, {
          source: 'upload',
          batchId: batch.id,
          onProgress: ({ step, rows, ms }) => send(`applying-${step}` as const, { step, rows, ms }),
        });

        const rowCount = totalRows(summary);
        await db`
          update upload_batches set
            status = ${summary.errors.length > 0 ? 'failed' : 'parsed'},
            row_count = ${rowCount},
            warnings = ${JSON.stringify(summary.warnings)}::jsonb,
            errors = ${JSON.stringify(summary.errors)}::jsonb,
            completed_at = now()
          where id = ${batch.id}
        `;

        send('done', {
          batchId: batch.id,
          ok: summary.errors.length === 0,
          parser: parser.id,
          rowCount,
          summary,
        });
        controller.close();
      } catch (e) {
        send('error', { message: e instanceof Error ? e.message : String(e) });
        controller.close();
      }
    },
  });
}

// =============================================================================
// Non-streaming variant — same pipeline, single JSON response
// =============================================================================

async function runIngest(
  filename: string,
  buffer: Buffer,
  hotelCodeOverride: string | undefined,
  reportDateOverride: string | undefined,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const tenantId = await requireHosTenantId();
  const parser = classifyForParser({ filename });
  const fnameMeta = parseOnqFilename(filename);

  let hotelDbId: string | null = null;
  if (hotelCodeOverride) {
    const found = await db<{ id: string }[]>`
      select id from hotels where tenant_id = ${tenantId} and code = ${hotelCodeOverride} limit 1
    `;
    hotelDbId = found[0]?.id ?? null;
  }
  const [batch] = await db<{ id: string }[]>`
    insert into upload_batches (
      tenant_id, hotel_id, source, source_filename, report_date, report_type, parser_id, status
    )
    values (
      ${tenantId}, ${hotelDbId}, 'upload', ${filename},
      ${reportDateOverride ?? fnameMeta?.date ?? null}, ${parser?.reportType ?? null}, ${parser?.id ?? null}, 'pending'
    )
    returning id
  `;

  if (!parser) {
    await db`
      update upload_batches set status='failed',
        errors = ${JSON.stringify(['no parser matched filename'])}::jsonb,
        completed_at = now()
      where id = ${batch.id}
    `;
    return { status: 422, body: { error: 'No parser matched filename', filename } };
  }

  const parsed = await runParser(parser, { buffer, filename, hotelCode: hotelCodeOverride, reportDate: reportDateOverride });
  if (parsed.errors.length > 0) {
    await db`
      update upload_batches set status='failed',
        errors = ${JSON.stringify(parsed.errors)}::jsonb,
        warnings = ${JSON.stringify(parsed.warnings)}::jsonb,
        completed_at = now()
      where id = ${batch.id}
    `;
    return { status: 422, body: { ok: false, parser: parser.id, errors: parsed.errors, warnings: parsed.warnings } };
  }

  const summary = await applyParseResult(parsed, { source: 'upload', batchId: batch.id });
  const rowCount = totalRows(summary);
  await db`
    update upload_batches set
      status = ${summary.errors.length > 0 ? 'failed' : 'parsed'},
      row_count = ${rowCount},
      warnings = ${JSON.stringify(summary.warnings)}::jsonb,
      errors = ${JSON.stringify(summary.errors)}::jsonb,
      completed_at = now()
    where id = ${batch.id}
  `;
  return {
    status: 200,
    body: { ok: summary.errors.length === 0, parser: parser.id, batchId: batch.id, summary },
  };
}

// =============================================================================
// Helpers
// =============================================================================

function rowSummary(parsed: import('@/lib/parsers/types').ParseResult) {
  return {
    revenue:        parsed.daily_revenue?.length        ?? 0,
    occupancy:      parsed.daily_occupancy?.length      ?? 0,
    labour:         (parsed.labour_periods?.length ?? 0) + (parsed.labour_departments?.length ?? 0),
    paymentMix:     parsed.payment_method_mix?.length   ?? 0,
    marketSegment:  parsed.market_segment_mix?.length   ?? 0,
    tax:            parsed.tax_breakdown?.length        ?? 0,
    ledger:         parsed.ledger_balances?.length      ?? 0,
    rooms:          parsed.room_snapshots?.length       ?? 0,
    arrivals:       parsed.reservation_arrivals?.length ?? 0,
    highBalance:    parsed.high_balance_alerts?.length  ?? 0,
  };
}

function totalRows(s: ApplySummary): number {
  return s.revenueRowsUpserted +
    s.occupancyRowsUpserted +
    s.labourPeriodsUpserted +
    s.labourDeptRowsUpserted +
    s.amPmSnapshotsUpserted +
    s.paymentMixUpserted +
    s.marketSegmentUpserted +
    s.taxBreakdownUpserted +
    s.ledgerBalancesUpserted +
    s.roomSnapshotsUpserted +
    s.reservationArrivalsUpserted +
    s.highBalanceAlertsUpserted;
}

// Type-only re-export to keep tree-shaking happy in case `ApplyStep` ever changes name.
export type { ApplyStep };
