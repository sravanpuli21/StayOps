'use client';

import { useMemo, useState } from 'react';
import type { TicketType, TicketPriority, TicketStatus } from '@hos/shared';
import { Wrench, Clock, Filter, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { SYDNEY_HOTEL, getHotelTickets, TICKET_TYPE_META, PRIORITY_META } from '@/lib/sydney-data';

const STATUS_META: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  open:         { label: 'Open',         bg: '#fef2f2', color: '#b91c1c' },
  in_progress:  { label: 'In progress',  bg: '#fffbeb', color: '#b45309' },
  pending_part: { label: 'Pending part', bg: '#fef3c7', color: '#92400e' },
  scheduled:    { label: 'Scheduled',    bg: '#eff6ff', color: '#1d4ed8' },
  escalated:    { label: 'Escalated',    bg: '#fef2f2', color: '#7f1d1d' },
  resolved:     { label: 'Resolved',     bg: '#f0fdf4', color: '#15803d' },
};

const TYPE_TABS: (TicketType | 'all')[] = ['all', 'reactive', 'preventive', 'audit', 'escalation'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

export default function SydneyTicketsPage() {
  const tickets = useMemo(() => getHotelTickets(), []);
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [q, setQ] = useState('');

  const filtered = tickets.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (q) {
      const hay = `${t.title} ${t.roomNumber ?? ''} ${t.assignedTo ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const countsByType = tickets.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const urgent = tickets.filter((t) => t.priority === 'urgent').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance Tickets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {tickets.length} tickets · {urgent} urgent
        </p>
      </div>

      {/* Type tabs with visually distinct styling per memory */}
      <div className="flex gap-2 flex-wrap">
        <TypeTab
          label="All"
          count={tickets.length}
          active={typeFilter === 'all'}
          onClick={() => setTypeFilter('all')}
        />
        {TYPE_TABS.filter((t) => t !== 'all').map((t) => {
          const meta = TICKET_TYPE_META[t as TicketType];
          return (
            <TypeTab
              key={t}
              label={meta.label}
              count={countsByType[t] ?? 0}
              active={typeFilter === t}
              onClick={() => setTypeFilter(typeFilter === t ? 'all' : (t as TicketType))}
              icon={meta.icon}
              chipBg={meta.bg}
              chipColor={meta.color}
              chipBorder={meta.border}
            />
          );
        })}
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
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, room, tech…"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
          />
        </div>
        <span className="text-xs" style={{ color: '#929292' }}>{filtered.length} match{filtered.length === 1 ? '' : 'es'}</span>
      </div>

      {/* Tickets */}
      <div className="flex flex-col gap-2">
        {filtered.map((t) => {
          const tmeta = TICKET_TYPE_META[t.type];
          const pmeta = PRIORITY_META[t.priority];
          const smeta = STATUS_META[t.status] ?? STATUS_META.open;
          return (
            <div
              key={t.id}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: '#ffffff',
                border: `1px solid ${t.priority === 'urgent' ? '#fca5a5' : '#dddddd'}`,
                borderLeft: `4px solid ${tmeta.color}`,
              }}
            >
              <div className="flex-shrink-0 text-lg mt-0.5">{tmeta.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: tmeta.bg, color: tmeta.color }}>
                    {tmeta.label}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: pmeta.bg, color: pmeta.color }}>
                    {pmeta.label}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: smeta.bg, color: smeta.color }}>
                    {smeta.label}
                  </span>
                  {t.roomNumber && (
                    <span className="text-xs font-semibold" style={{ color: '#222' }}>Room {t.roomNumber}</span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{t.title}</p>
                <div className="flex items-center gap-4 mt-1 text-[11px]" style={{ color: '#6a6a6a' }}>
                  {t.assignedTo && <span>→ {t.assignedTo}</span>}
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

function TypeTab({
  label, count, active, onClick, icon, chipBg, chipColor, chipBorder,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
  icon?: string; chipBg?: string; chipColor?: string; chipBorder?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
      style={{
        background: active ? (chipColor ?? '#ff385c') : (chipBg ?? '#ffffff'),
        color: active ? '#ffffff' : (chipColor ?? '#6a6a6a'),
        border: active ? `1px solid ${chipColor ?? '#ff385c'}` : `1px solid ${chipBorder ?? '#dddddd'}`,
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
        style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.05)', color: active ? '#ffffff' : 'inherit' }}
      >
        {count}
      </span>
    </button>
  );
}
