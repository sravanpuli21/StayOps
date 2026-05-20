'use client';

import Link from 'next/link';
import { useState } from 'react';
import { mutate } from 'swr';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TicketTypeBadge, PriorityDot } from '@/components/operations/OpsBadges';

interface Props { hotelCode: string }

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function CallbacksClient({ hotelCode }: Props) {
  const { data } = useApi(apiKeys.opsTicketsAll(hotelCode));
  const tickets = (data?.tickets as MaintenanceTicket[] | undefined) ?? [];
  const callbacks = tickets.filter((t) => t.status === 'callback_pending');

  const [actor, setActor] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => mutate(apiKeys.opsTicketsAll(hotelCode)[0]);

  const callback = async (ticketId: string, action: 'confirmed' | 'not_available' | 'reopen') => {
    setBusyId(ticketId); setError(null);
    try {
      const res = await fetch(`/api/ops/tickets/${ticketId}/callback`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, actor: actor.trim() || undefined }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(typeof j?.error === 'string' ? j.error : 'Action failed');
        return;
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Callbacks</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Which guests need follow-up? Confirm with the guest, then close.
        </p>
      </div>

      {/* Actor — used by all action buttons */}
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

      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}

      {callbacks.length === 0 ? (
        <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
          No callbacks pending.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {callbacks.map((t) => {
            const where = t.roomNumber ? `Room ${t.roomNumber}` : t.area ?? '—';
            const completedAt = [...t.activity].reverse().find((a) => a.action === 'status:completed')?.timestamp;
            const completedBy = [...t.activity].reverse().find((a) => a.action === 'status:completed')?.actor;
            const busy = busyId === t.id;
            return (
              <div key={t.id} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#222' }}>{where}</p>
                    <p className="text-xs" style={{ color: '#929292' }}>{t.department ?? 'Front Desk'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TicketTypeBadge type={t.type} />
                    <PriorityDot priority={t.priority} />
                  </div>
                </div>

                <Link
                  href={`/web/desk/${hotelCode}/requests/${t.id}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#222' }}
                >
                  {t.title}
                </Link>
                {t.requestType && t.requestType !== t.title && (
                  <p className="text-xs -mt-2" style={{ color: '#929292' }}>{t.requestType}</p>
                )}

                <div className="text-xs" style={{ color: '#6a6a6a' }}>
                  {completedAt
                    ? <>Completed {fmtDateTime(completedAt)}{completedBy ? ` by ${completedBy}` : ''}</>
                    : <>Awaiting completion details</>}
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => callback(t.id, 'confirmed')}
                    disabled={busy}
                    className="h-9 px-4 rounded-lg text-xs font-semibold"
                    style={{ background: '#ff385c', color: '#fff', opacity: busy ? 0.6 : 1 }}
                  >
                    Guest confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => callback(t.id, 'not_available')}
                    disabled={busy}
                    className="h-9 px-4 rounded-lg text-xs font-semibold"
                    style={{ background: '#f7f7f7', color: '#222', opacity: busy ? 0.6 : 1 }}
                  >
                    Guest not available
                  </button>
                  <button
                    type="button"
                    onClick={() => callback(t.id, 'reopen')}
                    disabled={busy}
                    className="h-9 px-4 rounded-lg text-xs font-semibold"
                    style={{ background: '#fff1f1', color: '#b91c1c', border: '1px solid #fca5a5', opacity: busy ? 0.6 : 1 }}
                  >
                    Reopen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
