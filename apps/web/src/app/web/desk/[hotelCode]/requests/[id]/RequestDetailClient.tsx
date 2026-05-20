'use client';

import Link from 'next/link';
import { useState } from 'react';
import { mutate } from 'swr';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from '@/components/operations/OpsBadges';

interface Props {
  hotelCode: string;
  ticketId:  string;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function RequestDetailClient({ hotelCode, ticketId }: Props) {
  const { data } = useApi(apiKeys.opsTicketsAll(hotelCode));
  const tickets = (data?.tickets as MaintenanceTicket[] | undefined) ?? [];
  const ticket = tickets.find((t) => t.id === ticketId) ?? null;

  const [note, setNote] = useState<string>('');
  const [actor, setActor] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => mutate(apiKeys.opsTicketsAll(hotelCode)[0]);

  const callApi = async (path: string, body: Record<string, unknown>) => {
    setSubmitting(true); setError(null);
    try {
      const res = await fetch(path, {
        method: path.endsWith(`/tickets/${ticketId}`) ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...body, actor: actor.trim() || undefined }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(typeof j?.error === 'string' ? j.error : 'Action failed');
        return;
      }
      setNote('');
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ticket) {
    return (
      <div className="flex flex-col gap-6">
        <Link href={`/web/desk/${hotelCode}/requests`} className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#ff385c' }}>
          <ChevronLeft className="w-4 h-4" />
          Requests
        </Link>
        <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
          Loading or request not found.
        </div>
      </div>
    );
  }

  const where    = ticket.roomNumber ? `Room ${ticket.roomNumber}` : ticket.area ?? '—';
  const isOpen   = ticket.status === 'open' || ticket.status === 'reopened' || ticket.status === 'in_progress';
  const isAssigned = ticket.status === 'assigned';
  const canComplete = ticket.status === 'open' || ticket.status === 'assigned' || ticket.status === 'in_progress' || ticket.status === 'reopened';
  const canMoveToCallback = ticket.status === 'completed' && ticket.callbackRequired;
  const canClose = ticket.status === 'completed' || ticket.status === 'callback_pending';
  const canReopen = ticket.status === 'completed' || ticket.status === 'callback_pending' || ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/web/desk/${hotelCode}/requests`} className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#ff385c' }}>
        <ChevronLeft className="w-4 h-4" />
        Requests
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TicketTypeBadge type={ticket.type} />
          <TicketStatusBadge status={ticket.status} />
          <PriorityDot priority={ticket.priority} />
          {ticket.callbackRequired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#fff7ed', color: '#9a3412' }}>
              Callback {ticket.callbackStatus ?? 'pending'}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>{ticket.title}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {where} · {ticket.department ?? 'Front Desk'} · created {fmtDateTime(ticket.createdAt)}
        </p>
        {ticket.description && (
          <p className="mt-3 text-sm whitespace-pre-wrap" style={{ color: '#3f3f3f' }}>{ticket.description}</p>
        )}
      </div>

      {/* Actor field — used by all action buttons */}
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Your name</label>
        <input
          type="text"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          placeholder="Front Desk"
          className="flex-1 h-9 px-3 rounded-lg outline-none focus:ring-2 focus:ring-[#ff385c] text-sm"
          style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#222' }}
        />
      </div>

      {/* Action buttons — only the ones valid for the current status */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Update status</p>
        <div className="flex flex-wrap gap-2">
          {(isOpen || isAssigned) && (
            <ActionBtn label="Mark in progress"
              onClick={() => callApi(`/api/ops/tickets/${ticketId}`, { status: 'in_progress' })}
              disabled={submitting} />
          )}
          {canComplete && (
            <ActionBtn label="Mark completed"
              onClick={() => callApi(`/api/ops/tickets/${ticketId}`, { status: 'completed' })}
              disabled={submitting} variant="primary" />
          )}
          {canMoveToCallback && (
            <ActionBtn label="Move to callback pending"
              onClick={() => callApi(`/api/ops/tickets/${ticketId}`, { status: 'callback_pending' })}
              disabled={submitting} variant="amber" />
          )}
          {canClose && (
            <ActionBtn label="Close request"
              onClick={() => callApi(`/api/ops/tickets/${ticketId}`, { status: 'closed' })}
              disabled={submitting} />
          )}
          {canReopen && (
            <ActionBtn label="Reopen"
              onClick={() => callApi(`/api/ops/tickets/${ticketId}`, { status: 'reopened' })}
              disabled={submitting} />
          )}
        </div>

        {ticket.callbackRequired && ticket.status === 'callback_pending' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: '#6a6a6a' }}>Callback</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn label="Guest confirmed"
                onClick={() => callApi(`/api/ops/tickets/${ticketId}/callback`, { action: 'confirmed' })}
                disabled={submitting} variant="primary" />
              <ActionBtn label="Guest not available"
                onClick={() => callApi(`/api/ops/tickets/${ticketId}/callback`, { action: 'not_available' })}
                disabled={submitting} />
              <ActionBtn label="Reopen — issue not resolved"
                onClick={() => callApi(`/api/ops/tickets/${ticketId}/callback`, { action: 'reopen' })}
                disabled={submitting} variant="danger" />
            </div>
          </>
        )}

        {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
      </div>

      {/* Add note */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Add a note</p>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="What happened?"
          className="w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#ff385c] text-sm resize-y"
          style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#222' }}
        />
        <div>
          <button
            type="button"
            disabled={submitting || !note.trim()}
            onClick={() => callApi(`/api/ops/tickets/${ticketId}/note`, { note: note.trim() })}
            className="h-9 px-4 rounded-lg text-sm font-semibold"
            style={{
              background: '#222',
              color: '#fff',
              opacity: submitting || !note.trim() ? 0.5 : 1,
            }}
          >
            Add note
          </button>
        </div>
      </div>

      {/* Timeline */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Timeline</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <ul>
            {[...ticket.activity].reverse().map((a, i, arr) => (
              <li key={i} className="px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                <p className="text-sm" style={{ color: '#222' }}>
                  <span className="font-semibold">{a.actor}</span>
                  <span className="ml-1.5" style={{ color: '#6a6a6a' }}>· {labelForAction(a.action)}</span>
                </p>
                {a.note && <p className="text-sm mt-1" style={{ color: '#3f3f3f' }}>{a.note}</p>}
                <p className="text-[11px] mt-1" style={{ color: '#929292' }}>{fmtDateTime(a.timestamp)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ActionBtn({
  label, onClick, disabled, variant,
}: { label: string; onClick: () => void; disabled?: boolean; variant?: 'primary' | 'amber' | 'danger' }) {
  const palette =
    variant === 'primary' ? { bg: '#ff385c', fg: '#fff' } :
    variant === 'amber'   ? { bg: '#f97316', fg: '#fff' } :
    variant === 'danger'  ? { bg: '#b91c1c', fg: '#fff' } :
                            { bg: '#f7f7f7', fg: '#222' };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-9 px-4 rounded-lg text-sm font-semibold transition-opacity"
      style={{ background: palette.bg, color: palette.fg, opacity: disabled ? 0.5 : 1 }}
    >
      {label}
    </button>
  );
}

function labelForAction(action: string): string {
  if (action === 'created') return 'created the request';
  if (action === 'note') return 'added a note';
  if (action.startsWith('status:')) return `set status to ${action.slice(7).replace(/_/g, ' ')}`;
  if (action.startsWith('callback:')) return `callback · ${action.slice(9).replace(/_/g, ' ')}`;
  return action;
}
