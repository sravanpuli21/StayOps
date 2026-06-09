'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { X, MapPin, User, Clock, Wrench, CheckCircle2, Truck, PackageSearch, Eye, MessageSquarePlus } from 'lucide-react';
import { apiKeys } from '@/lib/swr-keys';

/**
 * Shared, actionable ticket detail modal used by the supervisor consoles
 * (Sydney = Maintenance, Emma = Housekeeping). Unlike the old read-only modals,
 * this lets the supervisor actually WORK an item that arrived from the front
 * desk: Acknowledge → Start → Complete, plus add a note. Every action hits the
 * real API (PATCH /api/ops/tickets/[id], POST .../note) and revalidates the
 * SWR lists so the board updates immediately.
 */

type AnyTicket = Record<string, any>;

type TeamKind = 'maintenance' | 'housekeeping';

/** Which team is working this ticket — drives the verbs + "done" word. */
function teamKind(t: AnyTicket): TeamKind {
  const dept = String(t.department ?? '').toLowerCase();
  if (dept === 'housekeeping') return 'housekeeping';
  if (dept === 'engineering' || dept === 'maintenance') return 'maintenance';
  // Fall back to the request label (Service Request = deliver, else repair).
  return String(t.requestType ?? '').toLowerCase().includes('service') ? 'housekeeping' : 'maintenance';
}

/** Status pill label differs by team — a fixed AC vs a delivered towel. */
function statusMeta(status: string, kind: TeamKind): { label: string; bg: string; color: string } {
  const base: Record<string, { label: string; bg: string; color: string }> = {
    open:             { label: 'New',          bg: '#fef3c7', color: '#b45309' },
    assigned:         { label: 'Acknowledged', bg: '#ece4fb', color: '#6a4ec0' },
    in_progress:      { label: kind === 'housekeeping' ? 'Out for delivery' : 'Repair in progress', bg: '#dbeafe', color: '#1d4ed8' },
    pending_part:     { label: 'Waiting on part', bg: '#fef3c7', color: '#92400e' },
    completed:        { label: kind === 'housekeeping' ? 'Delivered' : 'Fixed', bg: '#dcfce7', color: '#15803d' },
    resolved:         { label: kind === 'housekeeping' ? 'Delivered' : 'Fixed', bg: '#dcfce7', color: '#15803d' },
    closed:           { label: 'Closed',        bg: '#f3f4f6', color: '#6a6a6a' },
    callback_pending: { label: 'Callback',      bg: '#fef3c7', color: '#b45309' },
    escalated:        { label: 'Escalated',     bg: '#fee2e2', color: '#b91c1c' },
  };
  return base[status] ?? base.open;
}
const PRIORITY_META: Record<string, { label: string; bg: string; color: string }> = {
  urgent: { label: 'Urgent', bg: '#fee2e2', color: '#b91c1c' },
  high:   { label: 'High',   bg: '#fef3c7', color: '#b45309' },
  normal: { label: 'Normal', bg: '#dbeafe', color: '#1d4ed8' },
  low:    { label: 'Low',    bg: '#f3f4f6', color: '#6a6a6a' },
};

export function isFrontDesk(t: AnyTicket): boolean {
  return typeof t.reportedBy === 'string' && t.reportedBy.startsWith('Front Desk');
}

export function TicketActionModal({
  ticket, hotelId, accent = '#ff385c', onClose,
}: { ticket: AnyTicket; hotelId: string; accent?: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  // Track local status so the modal reflects the action without waiting on refetch.
  const [status, setStatus] = useState<string>(ticket.status);

  const kind = teamKind(ticket);
  const pmeta = PRIORITY_META[ticket.priority] ?? PRIORITY_META.normal;
  const smeta = statusMeta(status, kind);
  const where = ticket.roomNumber ? `Room ${ticket.roomNumber}` : ticket.area ?? '—';
  const fd = isFrontDesk(ticket);
  const items: Array<{ item: string; quantity?: number; category?: string; area?: string }> = Array.isArray(ticket.items) ? ticket.items : [];
  const activity: Array<{ actor: string; action: string; note?: string; timestamp: string }> = Array.isArray(ticket.activity) ? ticket.activity : [];
  const isDone = status === 'completed' || status === 'resolved' || status === 'closed';

  const refresh = () => { mutate(apiKeys.opsTickets(hotelId)[0]); mutate(apiKeys.opsTicketsAll(hotelId)[0]); };

  const patchStatus = async (next: string, label: string) => {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/ops/tickets/${ticket.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next, actor: ticket.__actor ?? 'Supervisor', note: label }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) { setErr(j?.error ?? 'Could not update'); return; }
      setStatus(next); refresh();
    } catch { setErr('Network error'); } finally { setBusy(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/ops/tickets/${ticket.id}/note`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note: note.trim(), actor: ticket.__actor ?? 'Supervisor' }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) { setErr(j?.error ?? 'Could not add note'); return; }
      // Reflect locally so the timeline shows it instantly.
      activity.push({ actor: ticket.__actor ?? 'Supervisor', action: 'note', note: note.trim(), timestamp: new Date().toISOString() });
      setNote(''); refresh();
    } catch { setErr('Network error'); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[88vh]" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="px-6 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {fd && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: '#fff0f3', color: accent }}>{ticket.requestType ?? 'Front Desk'}</span>}
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: pmeta.bg, color: pmeta.color }}>{pmeta.label}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: smeta.bg, color: smeta.color }}>{smeta.label}</span>
            </div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222] flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="Where" value={where} />
            <Detail icon={<User className="w-3.5 h-3.5" />} label="Reported by" value={ticket.reportedBy ?? '—'} />
            <Detail icon={<Wrench className="w-3.5 h-3.5" />} label="Department" value={ticket.department ?? '—'} />
            <Detail icon={<Clock className="w-3.5 h-3.5" />} label="Created" value={new Date(ticket.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} />
          </div>

          {/* Service-request line items */}
          {items.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#929292' }}>Requested items</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                {items.map((it, i) => (
                  <div key={i} className="px-3 py-2 flex items-center gap-3" style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                    {it.quantity != null && <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#f0f9ff', color: '#0369a1' }}>{it.quantity}</span>}
                    <span className="text-sm font-medium" style={{ color: '#222' }}>{it.item}</span>
                    {it.area && <span className="text-xs ml-auto" style={{ color: '#929292' }}>{it.area}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticket.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>Description</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#3f3f3f' }}>{ticket.description}</p>
            </div>
          )}

          {activity.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Timeline</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                {[...activity].reverse().map((a, i, arr) => (
                  <div key={i} className="px-3 py-2" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : undefined, background: '#fafafa' }}>
                    <p className="text-xs" style={{ color: '#222' }}><span className="font-semibold">{a.actor}</span><span className="ml-1.5" style={{ color: '#6a6a6a' }}>· {String(a.action).replace(/[:_]/g, ' ')}</span></p>
                    {a.note && <p className="text-xs mt-0.5" style={{ color: '#3f3f3f' }}>{a.note}</p>}
                    <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{new Date(a.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add note */}
          {!isDone && (
            <div className="flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 h-10 px-3 rounded-xl text-sm outline-none" style={{ border: '1px solid #dddddd', color: '#222' }} />
              <button onClick={addNote} disabled={busy || !note.trim()} className="h-10 px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a', opacity: !note.trim() ? 0.5 : 1 }}><MessageSquarePlus className="w-4 h-4" /> Note</button>
            </div>
          )}
          {err && <p className="text-xs font-semibold" style={{ color: '#b91c1c' }}>{err}</p>}
        </div>

        {/* action footer — verbs speak each team's language */}
        <div className="px-6 py-4 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid #f0f0f0' }}>
          {status === 'open' && <ActionBtn icon={<Eye className="w-4 h-4" />} label="Acknowledge" accent={accent} busy={busy} onClick={() => patchStatus('assigned', 'Acknowledged by supervisor')} />}

          {kind === 'maintenance' ? (
            <>
              {(status === 'open' || status === 'assigned' || status === 'pending_part') && <ActionBtn icon={<Wrench className="w-4 h-4" />} label="Start repair" accent={accent} busy={busy} onClick={() => patchStatus('in_progress', 'Repair started')} />}
              {status === 'in_progress' && <ActionBtn icon={<PackageSearch className="w-4 h-4" />} label="Waiting on part" accent="#b45309" busy={busy} onClick={() => patchStatus('pending_part', 'Waiting on a part')} />}
              {(status === 'assigned' || status === 'in_progress' || status === 'pending_part') && <ActionBtn icon={<CheckCircle2 className="w-4 h-4" />} label="Mark Fixed" accent="#15803d" busy={busy} onClick={() => patchStatus('completed', 'Repair complete — fixed')} />}
            </>
          ) : (
            <>
              {(status === 'open' || status === 'assigned') && <ActionBtn icon={<Truck className="w-4 h-4" />} label="Out for delivery" accent={accent} busy={busy} onClick={() => patchStatus('in_progress', 'Out for delivery')} />}
              {(status === 'assigned' || status === 'in_progress') && <ActionBtn icon={<CheckCircle2 className="w-4 h-4" />} label="Mark Delivered" accent="#15803d" busy={busy} onClick={() => patchStatus('completed', 'Delivered to guest')} />}
            </>
          )}

          {isDone && <span className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: '#15803d' }}><CheckCircle2 className="w-4 h-4" /> {smeta.label}</span>}
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold ml-auto" style={{ background: '#f7f7f7', color: '#222' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, accent, busy, onClick }: { icon: React.ReactNode; label: string; accent: string; busy: boolean; onClick: () => void }) {
  return <button onClick={onClick} disabled={busy} className="h-9 px-4 rounded-lg text-sm font-bold inline-flex items-center gap-1.5" style={{ background: accent, color: '#fff', opacity: busy ? 0.6 : 1 }}>{icon} {label}</button>;
}
function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5" style={{ color: '#929292' }}>{icon}</span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm" style={{ color: '#222' }}>{value}</p></div>
    </div>
  );
}
