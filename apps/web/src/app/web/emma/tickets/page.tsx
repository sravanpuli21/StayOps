'use client';

import { useMemo, useState } from 'react';
import type { TicketType, TicketPriority, TicketStatus } from '@hos/shared';
import { EMMA_HOTEL, useHotelTickets } from '@/lib/emma-data';
import { Wrench, AlertTriangle, Clock, Filter, Search, ChevronRight } from 'lucide-react';

const PRIORITY_META: Record<TicketPriority, { label: string; bg: string; color: string }> = {
  urgent: { label: 'Urgent', bg: '#fef2f2', color: '#b91c1c' },
  high:   { label: 'High',   bg: '#fffbeb', color: '#b45309' },
  normal: { label: 'Normal', bg: '#eff6ff', color: '#1d4ed8' },
  low:    { label: 'Low',    bg: '#f7f7f7', color: '#6a6a6a' },
};

const STATUS_META: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  open:          { label: 'Open',          bg: '#fef2f2', color: '#b91c1c' },
  in_progress:   { label: 'In progress',   bg: '#fffbeb', color: '#b45309' },
  pending_part:  { label: 'Pending part',  bg: '#fef3c7', color: '#92400e' },
  scheduled:     { label: 'Scheduled',     bg: '#eff6ff', color: '#1d4ed8' },
  escalated:     { label: 'Escalated',     bg: '#fef2f2', color: '#7f1d1d' },
  resolved:      { label: 'Resolved',      bg: '#f0fdf4', color: '#15803d' },
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

export default function EmmaTicketsPage() {
  const tickets = useHotelTickets();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [q, setQ] = useState('');

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
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance Tickets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {EMMA_HOTEL.shortName} · {tickets.length} open tickets · {counts.urgent} urgent
        </p>
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
            <div
              key={t.id}
              className="rounded-2xl p-4 flex items-start gap-3"
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
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#c1c1c1' }} />
            </div>
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
