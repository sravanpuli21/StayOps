import 'server-only';
import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { simpleParser } from 'mailparser';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';
import { classifyForParser, runParser } from '@/lib/parsers/registry';
import { applyParseResult } from '@/lib/parsers/apply';

/**
 * Poll Gmail for stayops-ingest labeled messages, parse each, apply to DB,
 * re-label processed. Idempotent via upload_batches.source_email_message_id.
 *
 * Called by:
 *   - Vercel cron at /api/inbox/cron (every 1 min)
 *   - Admin "Check inbox now" button at /api/inbox/poll-now
 */

export interface PollOutcome {
  connected: boolean;
  scannedMessages: number;
  processedMessages: number;
  skippedDuplicates: number;
  failedMessages: number;
  batchIds: string[];
  errors: string[];
  durationMs: number;
}

export async function pollGmailInbox(): Promise<PollOutcome> {
  const start = Date.now();
  const out: PollOutcome = {
    connected: false,
    scannedMessages: 0,
    processedMessages: 0,
    skippedDuplicates: 0,
    failedMessages: 0,
    batchIds: [],
    errors: [],
    durationMs: 0,
  };

  const gmailAddress = process.env.GMAIL_ADDRESS;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const ingestLabel = process.env.GMAIL_INGEST_LABEL ?? 'INBOX';
  const processedLabel = process.env.GMAIL_PROCESSED_LABEL ?? 'stayops-processed';

  if (!gmailAddress) { out.errors.push('GMAIL_ADDRESS not set'); out.durationMs = Date.now() - start; return out; }
  if (!gmailPassword) { out.errors.push('GMAIL_APP_PASSWORD not set — poller idle'); out.durationMs = Date.now() - start; return out; }

  const imapOpts: ImapFlowOptions = {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: gmailAddress, pass: gmailPassword },
    logger: false,
  };
  const client = new ImapFlow(imapOpts);

  try {
    await client.connect();
    out.connected = true;

    // Gmail exposes labels as mailboxes under "[Gmail]/..." — for custom labels, the name is the label.
    // The ingest label must already exist in Gmail (user creates it once).
    const mbox = await client.mailboxOpen(ingestLabel);
    if (!mbox) throw new Error(`Label "${ingestLabel}" not found in Gmail`);

    // Fetch unseen AND not-yet-processed (we use the UID list, filter by gmail labels)
    const uids: number[] = [];
    for await (const msg of client.fetch('1:*', { uid: true, envelope: true, labels: true, source: false })) {
      out.scannedMessages++;
      const labels = new Set<string>((msg.labels ?? []) as string[]);
      if (labels.has(processedLabel)) continue; // already handled
      uids.push(msg.uid);
    }

    const sb = supabaseServer();
    const tenantId = await getHosTenantId();

    for (const uid of uids) {
      try {
        const source = await client.download(String(uid), undefined, { uid: true });
        if (!source?.content) { out.failedMessages++; continue; }

        // Convert readable stream → buffer
        const chunks: Buffer[] = [];
        for await (const chunk of source.content as AsyncIterable<Buffer>) chunks.push(chunk);
        const raw = Buffer.concat(chunks);

        const parsed = await simpleParser(raw);
        const messageId = parsed.messageId ?? `uid-${uid}-${Date.now()}`;
        const subject = parsed.subject ?? '(no subject)';
        const fromAddr = parsed.from?.value?.[0]?.address ?? '(unknown)';
        const fromDomain = fromAddr.split('@')[1]?.toLowerCase() ?? '';

        // Dedupe by message-id
        const { data: existing } = await sb
          .from('upload_batches')
          .select('id, status')
          .eq('source_email_message_id', messageId)
          .maybeSingle();
        if (existing) {
          out.skippedDuplicates++;
          // still mark processed in Gmail so we don't keep revisiting it
          try { await client.messageFlagsAdd(String(uid), [], { uid: true }); } catch { /* no-op */ }
          try { await (client as any).messageMove?.(String(uid), processedLabel, { uid: true }); } catch { /* ignore */ }
          continue;
        }

        // Find an xlsx/csv attachment
        const att = (parsed.attachments ?? []).find((a) =>
          /\.(xlsx|xls|csv)$/i.test(a.filename ?? '') ||
          a.contentType?.includes('spreadsheet') ||
          a.contentType?.includes('csv') ||
          a.contentType?.includes('excel'),
        );

        // Classify (subject + filename + sender)
        const parser = classifyForParser({
          subject,
          filename: att?.filename,
          senderEmail: fromAddr,
        });

        // Store raw email
        const storagePath = `${tenantId}/${new Date().toISOString().slice(0, 10)}/email-${uid}-${Date.now()}.eml`;
        await sb.storage.from('pms-raw').upload(storagePath, raw, { contentType: 'message/rfc822', upsert: false }).catch((e) => {
          out.errors.push(`storage upload: ${e instanceof Error ? e.message : String(e)}`);
        });

        // Create batch row
        const { data: batch, error: bErr } = await sb.from('upload_batches').insert({
          tenant_id: tenantId,
          source: 'email',
          source_filename: att?.filename ?? null,
          source_email_from: fromAddr,
          source_email_subject: subject,
          source_email_message_id: messageId,
          report_type: parser?.reportType ?? null,
          parser_id: parser?.id ?? null,
          raw_storage_path: storagePath,
          status: 'pending',
        }).select('id').single();

        if (bErr || !batch) {
          out.errors.push(`batch insert: ${bErr?.message ?? 'unknown'}`);
          out.failedMessages++;
          continue;
        }
        out.batchIds.push(batch.id);

        // If no attachment or no parser, mark failed but don't lose audit
        if (!att || !parser) {
          await sb.from('upload_batches').update({
            status: 'failed',
            errors: [{ message: !att ? 'No spreadsheet attachment found' : `No parser matched sender=${fromDomain} subject="${subject}"` }],
            completed_at: new Date().toISOString(),
          }).eq('id', batch.id);
          out.failedMessages++;
          // still mark the email processed so we don't retry forever
          try { await (client as any).messageMove?.(String(uid), processedLabel, { uid: true }); } catch { /* ignore */ }
          continue;
        }

        // Parse + apply
        const parseResult = await runParser(parser, { buffer: att.content as Buffer, filename: att.filename });
        const applied = await applyParseResult(parseResult, { batchId: batch.id, source: 'email' });
        const rowCount = applied.revenueRowsUpserted + applied.occupancyRowsUpserted + applied.snapshotsUpserted;

        await sb.from('upload_batches').update({
          status: applied.errors.length > 0 ? 'failed' : 'parsed',
          row_count: rowCount,
          errors: applied.errors.length > 0 ? applied.errors.map((m) => ({ message: m })) : null,
          warnings: applied.warnings.length > 0 ? applied.warnings.map((m) => ({ message: m })) : null,
          completed_at: new Date().toISOString(),
        }).eq('id', batch.id);

        if (applied.errors.length > 0) out.failedMessages++;
        else out.processedMessages++;

        // Move message to processed label
        try {
          await (client as any).messageMove?.(String(uid), processedLabel, { uid: true });
        } catch (e) {
          out.errors.push(`move to ${processedLabel}: ${e instanceof Error ? e.message : String(e)}`);
        }
      } catch (perMsgErr) {
        out.failedMessages++;
        out.errors.push(`uid=${uid}: ${perMsgErr instanceof Error ? perMsgErr.message : String(perMsgErr)}`);
      }
    }

    await client.mailboxClose();
  } catch (e) {
    out.errors.push(`connect/fetch: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }

  out.durationMs = Date.now() - start;
  return out;
}
