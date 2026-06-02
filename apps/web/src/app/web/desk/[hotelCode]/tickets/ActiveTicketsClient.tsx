'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Wrench, Clock, Filter, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import type { MaintenanceTicket, TicketPriority, TicketType } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from '@/components/operations/OpsBadges';

interface Props { hotelCode: string }

// "Active" = anything not resolved/closed.
const RESOLVED = new Set(['resolved', 'closed']);
const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
}

const PRIORITIES: (TicketPriority | 'all')[] = ['all', 'urgent', 'high', 'normal', 'low'];
const TYPES: (TicketType | 'all')[] = ['all', 'reactive', 'preventive', 'audit', 'escalation'];

export function ActiveTicketsClient({ hotelCode }: Props) {
  const { data } = useApi(apiKeys.opsTickets(hotelCode));
  const all = (data?.tickets as MaintenanceTicket[] | undefined) ?? [];

  const [priority, setPriority] = useState<TicketPriority | 'all'>('all');
  const [type, setType] = useState<TicketType | 'all'>('all');
  const [q, setQ] = useState('');

  const active = useMemo(() => all.filter((t) => !RESOLVED.has(t.status)), [all]);

  const filtered = useMemo(() => {
    return active
      .filter((t) => {
        if (priority !== 'all' && t.priority !== priority) return false;
        if (type !== 'all' && t.type !== type) return false;
        if (q.trim()) {
          const hay = `${t.title} ${t.roomNumber ?? ''} ${t.area ?? ''} ${t.assignedTo ?? ''} ${t.department ?? ''}`.toLowerCase();
          if (!hay.includes(q.trim().toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pr = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
        if (pr !== 0) return pr;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [active, priority, type, q]);

  const counts = {
    total: active.length,
    urgent: active.filter((t) => t.priority === 'urgent').length,
    inProgress: active.filter((t) => t.status === 'in_progress').length,
    unassigned: active.filter((t) => !t.assignedTo).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Active Tickets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          What maintenance is open right now · {counts.total} active · {counts.urgent} urgent
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Active" value={counts.total} bg="#f7f7f7" color="#222" />
        <SummaryCard label="Urgent" value={counts.urgent} bg="#fef2f2" color="#b91c1c" />
        <SummaryCard label="In progress" value={counts.inProgress} bg="#fffbeb" color="#b45309" />
        <SummaryCard label="Unassigned" value={counts.unassigned} bg="#eff6ff" color="#1d4ed8" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 text-xs" style={{ color: '#6a6a6a' }}>
          <Filter className="w-3.5 h-3.5" /> Filter
        </div>
        <div className="inline-flex rounded-xl p-1" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize"
              style={{ background: priority === p ? '#222' : 'transparent', color: priority === p ? '#fff' : '#6a6a6a' }}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TicketType | 'all')}
          className="h-8 px-3 rounded-lg text-xs font-semibold outline-none"
          style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}
        >
          {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t === 'all' ? 'All types' : t}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search room, area, tech…"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none"
            style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}
          />
        </div>
        <span className="text-xs" style={{ color: '#929292' }}>{filtered.length} shown</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl px-6 py-10 text-center" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <Wrench className="w-6 h-6 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
          <p className="text-sm font-semibold" style={{ color: '#6a6a6a' }}>
            {active.length === 0 ? 'No active tickets — all clear.' : 'No tickets match these filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className={th}>Type</th>
                <th className={th}>Where</th>
                <th className={th}>Issue</th>
                <th className={th}>Department</th>
                <th className={th}>Priority</th>
                <th className={th}>Status</th>
                <th className={th}>Assigned</th>
                <th className={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const where = t.roomNumber ? `Room ${t.roomNumber}` : t.area ?? '—';
                return (
                  <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                    <td className="px-4 py-3"><TicketTypeBadge type={t.type} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#444' }}>{where}</td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <Link href={`/web/desk/${hotelCode}/requests/${t.id}`} className="font-medium truncate hover:underline" style={{ color: '#222' }}>
                        {t.title}
                      </Link>
                      {t.requestType && t.requestType !== t.title && (
                        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{t.requestType}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#444' }}>{t.department ?? '—'}</td>
                    <td className="px-4 py-3"><PriorityDot priority={t.priority} /></td>
                    <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: t.assignedTo ? '#444' : '#c1c1c1' }}>
                      {t.assignedTo ?? 'unassigned'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(t.updatedAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = 'text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide';

function SummaryCard({ label, value, bg, color }: { label: string; value: number; bg: string; color: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${color}20` }}>
      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color }}>{label}</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}
