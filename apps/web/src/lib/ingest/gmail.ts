import 'server-only';
import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { simpleParser } from 'mailparser';
import { db, getHosTenantId } from '@/lib/db/client';
import { classifyForParser, runParser } from '@/lib/parsers/registry';
import { applyParseResult } from '@/lib/parsers/apply';

/**
 * Poll Gmail for `stayops-ingest`-labelled messages, parse each attachment,
 * apply rows to Postgres, then move the message to `stayops-processed`.
 *
 * Idempotent via `upload_batches.source_email_message_id`. Phase 1.A drops
 * raw .eml storage (no Vercel Blob hookup yet).
 *
 * Called by:
 *   - Daily cron at /api/inbox/cron (Hobby tier minimum)
 *   - Admin "Check inbox now" at /api/inbox/poll-now
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

  const gmailAddress  = process.env.GMAIL_ADDRESS;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  // Default to INBOX so the only manual setup needed is creating the
  // `stayops-processed` archive label (see admin/ingestion page for the
  // setup checklist). Override with GMAIL_INGEST_LABEL if you ever want
  // to filter to a custom inbox label.
  const ingestLabel    = process.env.GMAIL_INGEST_LABEL    ?? 'INBOX';
  const processedLabel = process.env.GMAIL_PROCESSED_LABEL ?? 'stayops-processed';

  if (!gmailAddress)  { out.errors.push('GMAIL_ADDRESS not set');             out.durationMs = Date.now() - start; return out; }
  if (!gmailPassword) { out.errors.push('GMAIL_APP_PASSWORD not set');        out.durationMs = Date.now() - start; return out; }

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

    const mbox = await client.mailboxOpen(ingestLabel);
    if (!mbox) throw new Error(`Label "${ingestLabel}" not found in Gmail`);

    const tenantId = await getHosTenantId();

    const uids: number[] = [];
    for await (const msg of client.fetch('1:*', { uid: true, envelope: true, labels: true, source: false })) {
      out.scannedMessages++;
      const labels = new Set<string>((msg.labels ?? []) as string[]);
      if (labels.has(processedLabel)) continue;
      uids.push(msg.uid);
    }

    for (const uid of uids) {
      try {
        const source = await client.download(String(uid), undefined, { uid: true });
        if (!source?.content) { out.failedMessages++; continue; }

        const chunks: Buffer[] = [];
        for await (const chunk of source.content as AsyncIterable<Buffer>) chunks.push(chunk);
        const raw = Buffer.concat(chunks);

        const parsed = await simpleParser(raw);
        const messageId = parsed.messageId ?? `uid-${uid}-${Date.now()}`;
        const subject  = parsed.subject ?? '(no subject)';
        const fromAddr = parsed.from?.value?.[0]?.address ?? '(unknown)';
        const fromDomain = fromAddr.split('@')[1]?.toLowerCase() ?? '';

        // Dedupe by message-id
        const existing = await db<{ id: string }[]>`
          select id from upload_batches where source_email_message_id = ${messageId} limit 1
        `;
        if (existing.length > 0) {
          out.skippedDuplicates++;
          try { await (client as unknown as { messageMove: (u: string, l: string, o: object) => Promise<void> })
            .messageMove(String(uid), processedLabel, { uid: true }); } catch { /* ignore */ }
          continue;
        }

        const att = (parsed.attachments ?? []).find((a) =>
          /\.(xlsx|xls|csv)$/i.test(a.filename ?? '') ||
          a.contentType?.includes('spreadsheet') ||
          a.contentType?.includes('csv') ||
          a.contentType?.includes('excel'),
        );

        const parser = classifyForParser({
          subject,
          filename: att?.filename,
          senderEmail: fromAddr,
        });

        const [batch] = await db<{ id: string }[]>`
          insert into upload_batches (
            tenant_id, source, source_filename, source_email_from, source_email_subject,
            source_email_message_id, report_type, parser_id, status
          )
          values (
            ${tenantId}, 'email', ${att?.filename ?? null}, ${fromAddr}, ${subject},
            ${messageId}, ${parser?.reportType ?? null}, ${parser?.id ?? null}, 'pending'
          )
          returning id
        `;
        out.batchIds.push(batch.id);

        if (!att || !parser) {
          const reason = !att
            ? 'No spreadsheet attachment found'
            : `No parser matched sender=${fromDomain} subject="${subject}"`;
          await db`
            update upload_batches set status='failed',
              errors = ${JSON.stringify([reason])}::jsonb,
              completed_at = now()
            where id = ${batch.id}
          `;
          out.failedMessages++;
          try { await (client as unknown as { messageMove: (u: string, l: string, o: object) => Promise<void> })
            .messageMove(String(uid), processedLabel, { uid: true }); } catch { /* ignore */ }
          continue;
        }

        const result = await runParser(parser, { buffer: att.content as Buffer, filename: att.filename });
        const applied = await applyParseResult(result, { batchId: batch.id, source: 'email' });
        const rowCount = applied.revenueRowsUpserted + applied.occupancyRowsUpserted +
                         applied.labourPeriodsUpserted + applied.labourDeptRowsUpserted;

        await db`
          update upload_batches set
            status = ${applied.errors.length > 0 ? 'failed' : 'parsed'},
            row_count = ${rowCount},
            warnings = ${JSON.stringify(applied.warnings)}::jsonb,
            errors   = ${JSON.stringify(applied.errors)}::jsonb,
            completed_at = now()
          where id = ${batch.id}
        `;
        if (applied.errors.length > 0) out.failedMessages++;
        else out.processedMessages++;

        try { await (client as unknown as { messageMove: (u: string, l: string, o: object) => Promise<void> })
          .messageMove(String(uid), processedLabel, { uid: true }); } catch (e) {
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
