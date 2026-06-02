'use client';

import { useMemo, useState } from 'react';
import type { TicketType, TicketPriority, TicketStatus } from '@hos/shared';
import { Wrench, Clock, Filter, Search, ChevronRight, AlertTriangle, X, MapPin, User } from 'lucide-react';
import { SYDNEY_HOTEL, useHotelTicketsAll, TICKET_TYPE_META, PRIORITY_META } from '@/lib/sydney-data';

const VALID_TYPES: (TicketType | 'all')[] = ['all', 'reactive', 'preventive', 'audit', 'escalation'];

function initialTypeFromUrl(): TicketType | 'all' {
  if (typeof window === 'undefined') return 'all';
  const t = new URLSearchParams(window.location.search).get('type');
  return (t && VALID_TYPES.includes(t as TicketType)) ? (t as TicketType) : 'all';
}

const VALID_PRIORITIES: (TicketPriority | 'all')[] = ['all', 'urgent', 'high', 'normal', 'low'];

function initialPriorityFromUrl(): TicketPriority | 'all' {
  if (typeof window === 'undefined') return 'all';
  const p = new URLSearchParams(window.location.search).get('priority');
  return (p && VALID_PRIORITIES.includes(p as TicketPriority)) ? (p as TicketPriority) : 'all';
}

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

const TYPE_TABS: (TicketType | 'all')[] = ['all', 'reactive', 'preventive', 'audit', 'escalation'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

const RESOLVED_STATUSES = new Set(['resolved', 'closed']);

export default function SydneyTicketsPage() {
  const allTickets = useHotelTicketsAll();
  const [scope, setScope] = useState<'active' | 'archived'>('active');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>(initialTypeFromUrl);
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>(initialPriorityFromUrl);
  const [q, setQ] = useState('');
  const [openTicket, setOpenTicket] = useState<any | null>(null);

  const activeTickets = allTickets.filter((t) => !RESOLVED_STATUSES.has(t.status));
  const archivedTickets = allTickets.filter((t) => RESOLVED_STATUSES.has(t.status));
  const tickets = scope === 'active' ? activeTickets : archivedTickets;

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance Tickets</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {SYDNEY_HOTEL.shortName} · {tickets.length} {scope === 'active' ? 'active' : 'archived'} ticket{tickets.length === 1 ? '' : 's'}
            {scope === 'active' ? ` · ${urgent} urgent` : ''}
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
          const tmeta = TICKET_TYPE_META[t.type as keyof typeof TICKET_TYPE_META];
          const pmeta = PRIORITY_META[t.priority as keyof typeof PRIORITY_META];
          const smeta = STATUS_META[t.status as TicketStatus] ?? STATUS_META.open;
          return (
            <button
              key={t.id}
              onClick={() => setOpenTicket(t)}
              className="rounded-2xl p-4 flex items-start gap-3 text-left w-full transition-colors hover:bg-[#fafafa]"
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
  const tmeta = TICKET_TYPE_META[ticket.type as keyof typeof TICKET_TYPE_META] ?? TICKET_TYPE_META.reactive;
  const pmeta = PRIORITY_META[ticket.priority as keyof typeof PRIORITY_META] ?? PRIORITY_META.normal;
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
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: tmeta.bg, color: tmeta.color }}>{tmeta.icon} {tmeta.label}</span>
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
            <Detail icon={<User className="w-3.5 h-3.5" />} label="Assigned to" value={ticket.assignedTo ?? 'Unassigned'} />
            <Detail icon={<Wrench className="w-3.5 h-3.5" />} label="Department" value={ticket.department ?? 'Maintenance'} />
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
