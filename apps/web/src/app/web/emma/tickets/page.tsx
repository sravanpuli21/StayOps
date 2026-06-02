'use client';

import { useMemo, useState } from 'react';
import type { TicketType, TicketPriority, TicketStatus } from '@hos/shared';
import { EMMA_HOTEL, useHotelTicketsAll } from '@/lib/emma-data';
import { Wrench, AlertTriangle, Clock, Filter, Search, ChevronRight, X, MapPin, User } from 'lucide-react';

const PRIORITY_META: Record<TicketPriority, { label: string; bg: string; color: string }> = {
  urgent: { label: 'Urgent', bg: '#fef2f2', color: '#b91c1c' },
  high:   { label: 'High',   bg: '#fffbeb', color: '#b45309' },
  normal: { label: 'Normal', bg: '#eff6ff', color: '#1d4ed8' },
  low:    { label: 'Low',    bg: '#f7f7f7', color: '#6a6a6a' },
};

const STATUS_META: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  open:             { label: 'Open',             bg: '#fef2f2', color: '#b91c1c' },
  assigned:         { label: 'Assigned',         bg: '#eff6ff', color: '#1d4ed8' },
  in_progress:      { label: 'In progress',      bg: '#fffbeb', color: '#b45309' },
  completed:        { label: 'Completed',        bg: '#f0fdf4', color: '#15803d' },
  callback_pending: { label: 'Callback pending', bg: '#fff7ed', color: '#9a3412' },
  closed:           { label: 'Closed',           bg: '#f3f4f6', color: '#6a6a6a' },
  reopened:         { label: 'Reopened',         bg: '#fef2f2', color: '#b91c1c' },
  pending_part:     { label: 'Pending part',     bg: '#fef3c7', color: '#92400e' },
  scheduled:        { label: 'Scheduled',        bg: '#eff6ff', color: '#1d4ed8' },
  escalated:        { label: 'Escalated',        bg: '#fef2f2', color: '#7f1d1d' },
  resolved:         { label: 'Resolved',         bg: '#f0fdf4', color: '#15803d' },
};

const TYPES: TicketType[] = ['reactive', 'preventive', 'audit', 'escalation'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

const RESOLVED_STATUSES = new Set(['resolved', 'closed']);

export default function EmmaTicketsPage() {
  const allTickets = useHotelTicketsAll();
  const [scope, setScope] = useState<'active' | 'archived'>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [q, setQ] = useState('');
  const [openTicket, setOpenTicket] = useState<any | null>(null);

  const activeTickets = allTickets.filter((t) => !RESOLVED_STATUSES.has(t.status));
  const archivedTickets = allTickets.filter((t) => RESOLVED_STATUSES.has(t.status));
  const tickets = scope === 'active' ? activeTickets : archivedTickets;

  const filtered = tickets.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (q) {
      const hay = `${t.title} ${t.roomNumber ?? ''} ${t.assignedTo ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const counts = {
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance Tickets</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {EMMA_HOTEL.shortName} · {tickets.length} {scope === 'active' ? 'active' : 'archived'} ticket{tickets.length === 1 ? '' : 's'}
            {scope === 'active' ? ` · ${counts.urgent} urgent` : ''}
          </p>
        </div>
        {/* Active / Archived scope toggle */}
        <div className="inline-flex rounded-lg p-0.5" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <button
            onClick={() => setScope('active')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            style={{ background: scope === 'active' ? '#222' : 'transparent', color: scope === 'active' ? '#fff' : '#6a6a6a' }}
          >
            Active · {activeTickets.length}
          </button>
          <button
            onClick={() => setScope('archived')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            style={{ background: scope === 'archived' ? '#222' : 'transparent', color: scope === 'archived' ? '#fff' : '#6a6a6a' }}
          >
            Archived · {archivedTickets.length}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Urgent" value={counts.urgent} bg="#fef2f2" color="#b91c1c" />
        <SummaryCard label="Open" value={counts.open} bg="#fffbeb" color="#b45309" />
        <SummaryCard label="In progress" value={counts.inProgress} bg="#eff6ff" color="#1d4ed8" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 text-xs" style={{ color: '#6a6a6a' }}>
          <Filter className="w-3.5 h-3.5" /> Filter
        </div>
        <div className="inline-flex rounded-xl p-1" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          {(['all', 'urgent', 'high', 'normal', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize"
              style={{ background: priorityFilter === p ? '#ffffff' : 'transparent', color: priorityFilter === p ? '#222' : '#6a6a6a' }}
            >
              {p}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 px-3 rounded-lg text-xs font-semibold outline-none" style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}>
          <option value="all">All types</option>
          {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, room, tech…" className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none" style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }} />
        </div>
        <span className="text-xs" style={{ color: '#929292' }}>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {/* Ticket list */}
      <div className="flex flex-col gap-2">
        {filtered.map((t) => {
          const pmeta = PRIORITY_META[t.priority as TicketPriority];
          const smeta = STATUS_META[t.status as TicketStatus];
          return (
            <button
              key={t.id}
              onClick={() => setOpenTicket(t)}
              className="rounded-2xl p-4 flex items-start gap-3 text-left w-full transition-colors hover:bg-[#fafafa]"
              style={{
                background: '#ffffff',
                border: `1px solid ${t.priority === 'urgent' ? '#fca5a5' : '#dddddd'}`,
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {t.priority === 'urgent'
                  ? <AlertTriangle className="w-5 h-5" style={{ color: '#b91c1c' }} />
                  : <Wrench className="w-5 h-5" style={{ color: '#6a6a6a' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: pmeta.bg, color: pmeta.color }}>
                    {pmeta.label}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: smeta.bg, color: smeta.color }}>
                    {smeta.label}
                  </span>
                  <span className="text-[10px] uppercase font-semibold capitalize" style={{ color: '#929292' }}>{t.type}</span>
                  {t.roomNumber && (
                    <span className="text-xs font-semibold" style={{ color: '#222' }}>Room {t.roomNumber}</span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{t.title}</p>
                <div className="flex items-center gap-4 mt-1 text-[11px]" style={{ color: '#6a6a6a' }}>
                  {t.assignedTo && <span>Assigned to {t.assignedTo}</span>}
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(t.createdAt)}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c1c1c1' }} />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <Wrench className="w-6 h-6 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
            <p className="text-sm font-semibold" style={{ color: '#6a6a6a' }}>No tickets match</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>Try clearing filters.</p>
          </div>
        )}
      </div>

      {openTicket && (
        <TicketDetailModal ticket={openTicket} onClose={() => setOpenTicket(null)} />
      )}
    </div>
  );
}

function TicketDetailModal({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  const pmeta = PRIORITY_META[ticket.priority as TicketPriority] ?? PRIORITY_META.normal;
  const smeta = STATUS_META[ticket.status as TicketStatus] ?? STATUS_META.open;
  const where = ticket.roomNumber ? `Room ${ticket.roomNumber}` : ticket.area ?? '—';
  const activity: Array<{ actor: string; action: string; note?: string; timestamp: string }> =
    Array.isArray(ticket.activity) ? ticket.activity : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
        style={{ border: '1px solid #dddddd' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: pmeta.bg, color: pmeta.color }}>{pmeta.label}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: smeta.bg, color: smeta.color }}>{smeta.label}</span>
              <span className="text-[10px] uppercase font-semibold capitalize" style={{ color: '#929292' }}>{ticket.type}</span>
            </div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222] flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="Where" value={where} />
            <Detail icon={<User className="w-3.5 h-3.5" />} label="Assigned to" value={ticket.assignedTo ?? 'Unassigned'} />
            <Detail icon={<Wrench className="w-3.5 h-3.5" />} label="Department" value={ticket.department ?? '—'} />
            <Detail icon={<Clock className="w-3.5 h-3.5" />} label="Created" value={new Date(ticket.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} />
          </div>

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
                    <p className="text-xs" style={{ color: '#222' }}>
                      <span className="font-semibold">{a.actor}</span>
                      <span className="ml-1.5" style={{ color: '#6a6a6a' }}>· {a.action.replace(/[:_]/g, ' ')}</span>
                    </p>
                    {a.note && <p className="text-xs mt-0.5" style={{ color: '#3f3f3f' }}>{a.note}</p>}
                    <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{new Date(a.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px]" style={{ color: '#929292' }}>
            Housekeeping has read-only visibility here. Status changes are made by Maintenance from the operations console.
          </p>
        </div>

        <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1" style={{ color: '#929292' }}>
        {icon} {label}
      </p>
      <p className="text-sm mt-0.5" style={{ color: '#222' }}>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, bg, color }: { label: string; value: number; bg: string; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${color}30` }}>
      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color }}>{label}</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}
