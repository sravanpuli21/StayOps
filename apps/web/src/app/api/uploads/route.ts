import { NextRequest } from 'next/server';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { classifyForParser, runParser } from '@/lib/parsers/registry';
import { applyParseResult } from '@/lib/parsers/apply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/uploads
 *
 * Accepts multipart/form-data with:
 *   - file: the PMS Excel/CSV (required)
 *   - hotelCode: string (optional — inferred from filename if omitted)
 *   - reportDate: YYYY-MM-DD (optional — inferred from filename)
 *
 * Flow:
 *   1. Guard (admin secret)
 *   2. Store raw file bytes in Supabase Storage bucket pms-raw/
 *   3. Classify → pick parser
 *   4. Create upload_batches row
 *   5. Run parser → apply → mark batch parsed/failed
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'missing file' }, { status: 400 });
  }
  const hotelCode = (form.get('hotelCode') as string | null) ?? undefined;
  const reportDate = (form.get('reportDate') as string | null) ?? undefined;

  const buffer = Buffer.from(await file.arrayBuffer());
  const sb = supabaseServer();
  const tenantId = await getHosTenantId();

  // 1. Store raw
  const storagePath = `${tenantId}/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${file.name}`;
  const { error: upErr } = await sb.storage
    .from('pms-raw')
    .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (upErr && !upErr.message.includes('The resource already exists')) {
    // Bucket may not exist yet; surface a clear error
    return Response.json({
      error: `storage upload failed: ${upErr.message}`,
      hint: 'Make sure the "pms-raw" bucket exists in Supabase Storage (we create it via setup-storage.sql).',
    }, { status: 500 });
  }

  // 2. Classify
  const parser = classifyForParser({ filename: file.name });

  // 3. Hotel lookup (optional — only if explicit hotelCode)
  let hotelDbId: string | null = null;
  if (hotelCode) {
    const { data: h } = await sb.from('hotels').select('id').eq('tenant_id', tenantId).eq('code', hotelCode).single();
    hotelDbId = h?.id ?? null;
  }

  // 4. Batch row
  const { data: batch, error: bErr } = await sb
    .from('upload_batches')
    .insert({
      tenant_id: tenantId,
      hotel_id: hotelDbId,
      uploaded_at: new Date().toISOString(),
      source: 'upload',
      source_filename: file.name,
      report_date: reportDate ?? null,
      report_type: parser?.reportType ?? null,
      parser_id: parser?.id ?? null,
      raw_storage_path: storagePath,
      status: 'pending',
    })
    .select('id')
    .single();
  if (bErr || !batch) {
    return Response.json({ error: `batch create failed: ${bErr?.message ?? 'unknown'}` }, { status: 500 });
  }

  if (!parser) {
    await sb.from('upload_batches').update({
      status: 'failed',
      errors: [{ message: 'No parser matched this file. Rename or add a parser.' }],
      completed_at: new Date().toISOString(),
    }).eq('id', batch.id);
    return Response.json({
      batchId: batch.id,
      status: 'failed',
      error: 'No parser matched. Expected filename like "*FinalAudit*.xlsx" or similar.',
    }, { status: 422 });
  }

  // 5. Parse + apply
  const parsed = await runParser(parser, { buffer, filename: file.name, hotelCode, reportDate });
  if (parsed.errors.length > 0 && !parsed.daily_revenue && !parsed.daily_occupancy && !parsed.am_pm_snapshots) {
    await sb.from('upload_batches').update({
      status: 'failed',
      errors: parsed.errors.map((m) => ({ message: m })),
      warnings: parsed.warnings.map((m) => ({ message: m })),
      completed_at: new Date().toISOString(),
    }).eq('id', batch.id);
    return Response.json({ batchId: batch.id, status: 'failed', errors: parsed.errors }, { status: 422 });
  }

  const applied = await applyParseResult(parsed, { batchId: batch.id, source: 'upload' });
  const rowCount = applied.revenueRowsUpserted + applied.occupancyRowsUpserted + applied.snapshotsUpserted;

  await sb.from('upload_batches').update({
    status: applied.errors.length > 0 ? 'failed' : 'parsed',
    row_count: rowCount,
    errors: applied.errors.length > 0 ? applied.errors.map((m) => ({ message: m })) : null,
    warnings: applied.warnings.length > 0 ? applied.warnings.map((m) => ({ message: m })) : null,
    completed_at: new Date().toISOString(),
  }).eq('id', batch.id);

  return Response.json({
    batchId: batch.id,
    status: applied.errors.length > 0 ? 'failed' : 'parsed',
    parser: parser.id,
    applied,
  });
}

/** GET /api/uploads — list recent batches. */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  try {
    const sb = supabaseServer();
    const tenantId = await getHosTenantId();
    const { data, error } = await sb
      .from('upload_batches')
      .select('id, uploaded_at, source, source_filename, source_email_from, source_email_subject, report_date, report_type, parser_id, status, row_count, errors, warnings, completed_at, hotel_id')
      .eq('tenant_id', tenantId)
      .order('uploaded_at', { ascending: false })
      .limit(50);
    if (error) return Response.json({ error: error.message, batches: [] }, { status: 200 });
    return Response.json({ batches: data ?? [] });
  } catch (e) {
    // DB likely not provisioned yet — return empty list so UI doesn't crash
    return Response.json({
      batches: [],
      error: e instanceof Error ? e.message : 'database not ready',
      hint: 'Run the SQL files in supabase/migrations/ + seed.sql in the Supabase SQL editor to initialize tables.',
    }, { status: 200 });
  }
}
