import { NextRequest } from 'next/server';
import { db, getHosTenantId } from '@/lib/db/client';
import { requireAdminSecret } from '@/lib/admin-guard';
import { classifyForParser, runParser } from '@/lib/parsers/registry';
import { applyParseResult } from '@/lib/parsers/apply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/uploads — admin-gated CSV/XLSX intake.
 *
 * Phase 1.A: no raw-file storage (deferred). The file is parsed in-memory
 * and rows are upserted directly. An upload_batches row records what came
 * in, what parser ran, and how many rows landed.
 *
 *   form fields:
 *     file        — multipart File (required)
 *     hotelCode   — optional override; otherwise inferred from filename
 *     reportDate  — optional ISO date
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'missing file' }, { status: 400 });
  }
  const hotelCode  = (form.get('hotelCode')  as string | null) ?? undefined;
  const reportDate = (form.get('reportDate') as string | null) ?? undefined;

  const buffer = Buffer.from(await file.arrayBuffer());
  const tenantId = await getHosTenantId();

  // Pick a parser by filename
  const parser = classifyForParser({ filename: file.name });

  // Resolve hotel_id if explicit code passed
  let hotelDbId: string | null = null;
  if (hotelCode) {
    const found = await db<{ id: string }[]>`
      select id from hotels where tenant_id = ${tenantId} and code = ${hotelCode} limit 1
    `;
    hotelDbId = found[0]?.id ?? null;
  }

  // Open the audit row
  const [batch] = await db<{ id: string }[]>`
    insert into upload_batches (
      tenant_id, hotel_id, source, source_filename, report_date, report_type, parser_id, status
    )
    values (
      ${tenantId}, ${hotelDbId}, 'upload', ${file.name},
      ${reportDate ?? null}, ${parser?.reportType ?? null}, ${parser?.id ?? null}, 'pending'
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
    return Response.json({
      error: 'No parser matched. Filename should match daily-revenue or labour CSVs in 1.A.',
      filename: file.name,
    }, { status: 422 });
  }

  // Parse + apply
  const parsed = await runParser(parser, { buffer, filename: file.name, hotelCode, reportDate });
  if (parsed.errors.length > 0) {
    await db`
      update upload_batches set status='failed',
        errors = ${JSON.stringify(parsed.errors)}::jsonb,
        warnings = ${JSON.stringify(parsed.warnings)}::jsonb,
        completed_at = now()
      where id = ${batch.id}
    `;
    return Response.json({ ok: false, parser: parser.id, errors: parsed.errors, warnings: parsed.warnings }, { status: 422 });
  }

  const summary = await applyParseResult(parsed, { source: 'upload', batchId: batch.id });
  const rowCount =
    summary.revenueRowsUpserted +
    summary.occupancyRowsUpserted +
    summary.labourPeriodsUpserted +
    summary.labourDeptRowsUpserted;

  await db`
    update upload_batches set
      status = ${summary.errors.length > 0 ? 'failed' : 'parsed'},
      row_count = ${rowCount},
      warnings = ${JSON.stringify(summary.warnings)}::jsonb,
      errors = ${JSON.stringify(summary.errors)}::jsonb,
      completed_at = now()
    where id = ${batch.id}
  `;

  return Response.json({
    ok: summary.errors.length === 0,
    parser: parser.id,
    batchId: batch.id,
    summary,
  });
}
