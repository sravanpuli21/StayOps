'use client';

import { useMemo, useState } from 'react';
import type { TicketType, TicketPriority, TicketStatus } from '@hos/shared';
import { EMMA_HOTEL, EMMA_HOTEL_ID, useHotelTicketsAll } from '@/lib/emma-data';
import { Wrench, AlertTriangle, Clock, Filter, Search, ChevronRight, Inbox } from 'lucide-react';
import { TicketActionModal, isFrontDesk } from '@/components/operations/TicketActionModal';

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
  const [fdOnly, setFdOnly] = useState(false);
  const [openTicket, setOpenTicket] = useState<any | null>(null);

  const activeTickets = allTickets.filter((t) => !RESOLVED_STATUSES.has(t.status));
  const archivedTickets = allTickets.filter((t) => RESOLVED_STATUSES.has(t.status));
  const tickets = scope === 'active' ? activeTickets : archivedTickets;

  // Guest service requests raised at the front desk, not yet picked up.
  const newFromFrontDesk = activeTickets.filter((t) => isFrontDesk(t) && (t.status === 'open' || t.status === 'assigned'));

  const filtered = tickets.filter((t) => {
    if (fdOnly && !isFrontDesk(t)) return false;
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
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Service Requests &amp; Tickets</h1>
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

      {/* New from Front Desk — incoming guest service requests */}
      {newFromFrontDesk.length > 0 && scope === 'active' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #bae6fd', borderLeft: '4px solid #0ea5e9' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f0f0f0', background: '#f0f9ff' }}>
            <Inbox className="w-4 h-4" style={{ color: '#0ea5e9' }} />
            <p className="text-sm font-bold" style={{ color: '#222' }}>New from Front Desk</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#0ea5e9', color: '#fff' }}>{newFromFrontDesk.length}</span>
            <span className="ml-auto text-xs" style={{ color: '#929292' }}>Guest requests raised at the desk — acknowledge & deliver</span>
          </div>
          {newFromFrontDesk.slice(0, 5).map((t, i, arr) => {
            const pmeta = PRIORITY_META[t.priority as TicketPriority];
            const items: any[] = Array.isArray(t.items) ? t.items : [];
            return (
              <button key={t.id} onClick={() => setOpenTicket(t)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#fafafa]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: pmeta.bg, color: pmeta.color }}>{pmeta.label}</span>
                <span className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: '#222' }}>{t.title}</span>
                {items.length > 0 && <span className="text-xs flex-shrink-0" style={{ color: '#0ea5e9' }}>{items.length} item{items.length === 1 ? '' : 's'}</span>}
                {t.roomNumber && <span className="text-xs flex-shrink-0" style={{ color: '#6a6a6a' }}>Room {t.roomNumber}</span>}
                <span className="text-[11px] flex-shrink-0" style={{ color: '#929292' }}>{timeAgo(t.createdAt)}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#c1c1c1' }} />
              </button>
            );
          })}
        </div>
      )}

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
        <button
          onClick={() => setFdOnly((v) => !v)}
          className="px-3 h-8 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          style={{ background: fdOnly ? '#0ea5e9' : '#fff', border: `1px solid ${fdOnly ? '#0ea5e9' : '#dddddd'}`, color: fdOnly ? '#fff' : '#6a6a6a' }}
        >
          <Inbox className="w-3.5 h-3.5" /> Front Desk
        </button>
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
                  {isFrontDesk(t) && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                      <Inbox className="w-2.5 h-2.5" /> Front Desk
                    </span>
                  )}
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
        <TicketActionModal
          ticket={{ ...openTicket, __actor: 'Emma Johnson' }}
          hotelId={EMMA_HOTEL_ID}
          accent="#0ea5e9"
          onClose={() => setOpenTicket(null)}
        />
      )}
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
