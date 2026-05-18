import 'server-only';
import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { simpleParser } from 'mailparser';
import { db, requireHosTenantId } from '@/lib/db/client';
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

export type GmailProgressEvent =
  | { name: 'connecting'; data: { host: string; mailbox: string } }
  | { name: 'connected'; data: { mailbox: string; messageCount?: number } }
  | { name: 'scanned'; data: { newMessages: number } }
  | { name: 'message-start'; data: { uid: number; subject?: string; from?: string } }
  | { name: 'message-parsed'; data: { uid: number; filename?: string; parser?: string; attachment?: string; rows?: Record<string, number> } }
  | { name: 'message-duplicate'; data: { uid: number; messageId: string; attachment?: string } }
  | { name: 'message-failed'; data: { uid: number; reason: string; attachment?: string } }
  | { name: 'message-applied'; data: { uid: number; rows: number; ms: number } }
  | { name: 'done'; data: PollOutcome };

export interface PollOptions {
  onProgress?: (event: GmailProgressEvent) => void;
}

export async function pollGmailInbox(opts: PollOptions = {}): Promise<PollOutcome> {
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
  const emit = opts.onProgress ?? (() => { /* no-op */ });

  try {
    emit({ name: 'connecting', data: { host: 'imap.gmail.com', mailbox: ingestLabel } });
    await client.connect();
    out.connected = true;

    const mbox = await client.mailboxOpen(ingestLabel);
    if (!mbox) throw new Error(`Label "${ingestLabel}" not found in Gmail`);
    emit({ name: 'connected', data: { mailbox: ingestLabel, messageCount: (mbox as { exists?: number }).exists } });

    const tenantId = await requireHosTenantId();

    const uids: number[] = [];
    for await (const msg of client.fetch('1:*', { uid: true, envelope: true, labels: true, source: false })) {
      out.scannedMessages++;
      const labels = new Set<string>((msg.labels ?? []) as string[]);
      if (labels.has(processedLabel)) continue;
      uids.push(msg.uid);
    }
    emit({ name: 'scanned', data: { newMessages: uids.length } });

    for (const uid of uids) {
      const msgStart = Date.now();
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
        emit({ name: 'message-start', data: { uid, subject, from: fromAddr } });

        // Hilton's "Report Package" emails carry 3-4 CSV attachments (final-audit,
        // room-details, arrivals, high-balance-reports). Process every spreadsheet
        // attachment, not just the first — and dedupe per `(message_id, filename)`
        // so a re-poll of a partially-processed email picks up whatever's missing.
        const attachments = (parsed.attachments ?? []).filter((a) =>
          /\.(xlsx|xls|csv)$/i.test(a.filename ?? '') ||
          a.contentType?.includes('spreadsheet') ||
          a.contentType?.includes('csv') ||
          a.contentType?.includes('excel'),
        );

        if (attachments.length === 0) {
          // Whole-email failure: no spreadsheet attachments at all.
          const [batch] = await db<{ id: string }[]>`
            insert into upload_batches (
              tenant_id, source, source_filename, source_email_from, source_email_subject,
              source_email_message_id, report_type, parser_id, status
            )
            values (
              ${tenantId}, 'email', ${null}, ${fromAddr}, ${subject},
              ${messageId}, ${null}, ${null}, 'failed'
            )
            returning id
          `;
          const reason = 'No spreadsheet attachment found';
          await db`
            update upload_batches set
              errors = ${JSON.stringify([reason])}::jsonb,
              completed_at = now()
            where id = ${batch.id}
          `;
          out.batchIds.push(batch.id);
          out.failedMessages++;
          emit({ name: 'message-failed', data: { uid, reason } });
          try { await (client as unknown as { messageMove: (u: string, l: string, o: object) => Promise<void> })
            .messageMove(String(uid), processedLabel, { uid: true }); } catch { /* ignore */ }
          continue;
        }

        // Track per-message aggregates so the overall outcome reflects the email,
        // not a single attachment.
        let anyApplied = false;
        let anyFailed = false;
        let messageRowCount = 0;
        let messageSkippedDup = 0;

        for (const att of attachments) {
          const attachmentName = att.filename ?? '(unnamed)';

          // Per-attachment dedupe. Skip only if a previous run actually
          // ingested rows from this exact (message_id, filename). Zero-row
          // batches (from the old (1)-suffix skip or single-attachment bug)
          // are treated as not-yet-processed so the next poll fixes them.
          const existing = await db<{ id: string }[]>`
            select id from upload_batches
            where source_email_message_id = ${messageId}
              and source_filename         = ${attachmentName}
              and status                  = 'parsed'
              and coalesce(row_count, 0)  > 0
            limit 1
          `;
          if (existing.length > 0) {
            messageSkippedDup++;
            emit({ name: 'message-duplicate', data: { uid, messageId, attachment: attachmentName } });
            continue;
          }

          const parser = classifyForParser({
            subject,
            filename: attachmentName,
            senderEmail: fromAddr,
          });

          const [batch] = await db<{ id: string }[]>`
            insert into upload_batches (
              tenant_id, source, source_filename, source_email_from, source_email_subject,
              source_email_message_id, report_type, parser_id, status
            )
            values (
              ${tenantId}, 'email', ${attachmentName}, ${fromAddr}, ${subject},
              ${messageId}, ${parser?.reportType ?? null}, ${parser?.id ?? null}, 'pending'
            )
            returning id
          `;
          out.batchIds.push(batch.id);

          if (!parser) {
            const reason = `No parser matched filename "${attachmentName}" (sender=${fromDomain})`;
            await db`
              update upload_batches set status='failed',
                errors = ${JSON.stringify([reason])}::jsonb,
                completed_at = now()
              where id = ${batch.id}
            `;
            anyFailed = true;
            emit({ name: 'message-failed', data: { uid, reason, attachment: attachmentName } });
            continue;
          }

          const result = await runParser(parser, { buffer: att.content as Buffer, filename: attachmentName });
          emit({
            name: 'message-parsed',
            data: {
              uid,
              filename: attachmentName,
              parser: parser.id,
              rows: {
                revenue:    result.daily_revenue?.length        ?? 0,
                occupancy:  result.daily_occupancy?.length      ?? 0,
                rooms:      result.room_snapshots?.length       ?? 0,
                arrivals:   result.reservation_arrivals?.length ?? 0,
                highBalance: result.high_balance_alerts?.length ?? 0,
                paymentMix: result.payment_method_mix?.length   ?? 0,
                marketSeg:  result.market_segment_mix?.length   ?? 0,
                tax:        result.tax_breakdown?.length        ?? 0,
                ledger:     result.ledger_balances?.length      ?? 0,
              },
            },
          });
          const applied = await applyParseResult(result, { batchId: batch.id, source: 'email' });
          const rowCount = applied.revenueRowsUpserted + applied.occupancyRowsUpserted +
                           applied.labourPeriodsUpserted + applied.labourDeptRowsUpserted +
                           applied.paymentMixUpserted + applied.marketSegmentUpserted +
                           applied.taxBreakdownUpserted + applied.ledgerBalancesUpserted +
                           applied.roomSnapshotsUpserted + applied.reservationArrivalsUpserted +
                           applied.highBalanceAlertsUpserted;
          messageRowCount += rowCount;

          await db`
            update upload_batches set
              status = ${applied.errors.length > 0 ? 'failed' : 'parsed'},
              row_count = ${rowCount},
              warnings = ${JSON.stringify(applied.warnings)}::jsonb,
              errors   = ${JSON.stringify(applied.errors)}::jsonb,
              completed_at = now()
            where id = ${batch.id}
          `;
          if (applied.errors.length > 0) {
            anyFailed = true;
            emit({ name: 'message-failed', data: { uid, reason: applied.errors.join('; '), attachment: attachmentName } });
          } else {
            anyApplied = true;
          }
        }

        // Roll up per-email metrics for the overall PollOutcome
        if (messageSkippedDup === attachments.length) {
          // Every attachment was already processed — count the email as a duplicate
          out.skippedDuplicates++;
        } else if (anyApplied) {
          out.processedMessages++;
          emit({
            name: 'message-applied',
            data: {
              uid,
              rows: messageRowCount,
              ms: Date.now() - msgStart,
            },
          });
        } else if (anyFailed) {
          out.failedMessages++;
        }

        try { await (client as unknown as { messageMove: (u: string, l: string, o: object) => Promise<void> })
          .messageMove(String(uid), processedLabel, { uid: true }); } catch (e) {
          out.errors.push(`move to ${processedLabel}: ${e instanceof Error ? e.message : String(e)}`);
        }
      } catch (perMsgErr) {
        out.failedMessages++;
        const reason = perMsgErr instanceof Error ? perMsgErr.message : String(perMsgErr);
        out.errors.push(`uid=${uid}: ${reason}`);
        emit({ name: 'message-failed', data: { uid, reason } });
      }
    }

    await client.mailboxClose();
  } catch (e) {
    out.errors.push(`connect/fetch: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }

  out.durationMs = Date.now() - start;
  emit({ name: 'done', data: out });
  return out;
}
