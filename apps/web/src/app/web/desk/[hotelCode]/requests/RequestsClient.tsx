'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from '@/components/operations/OpsBadges';

interface Props { hotelCode: string }

type TabKey = 'open' | 'assigned' | 'completed' | 'callback_pending' | 'closed';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'open',             label: 'Open' },
  { key: 'assigned',         label: 'Assigned' },
  { key: 'completed',        label: 'Completed' },
  { key: 'callback_pending', label: 'Callback Pending' },
  { key: 'closed',           label: 'Closed' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.max(1, Math.floor((diff % 3600000) / 60000))}m ago`;
}

function bucketFor(t: MaintenanceTicket): TabKey | null {
  if (t.status === 'closed' || t.status === 'resolved') return 'closed';
  if (t.status === 'callback_pending') return 'callback_pending';
  if (t.status === 'completed') return 'completed';
  if (t.status === 'assigned') return 'assigned';
  if (t.status === 'open' || t.status === 'reopened' || t.status === 'in_progress') return 'open';
  return null;
}

export function RequestsClient({ hotelCode }: Props) {
  const [tab, setTab] = useState<TabKey>('open');
  const { data } = useApi(apiKeys.opsTicketsAll(hotelCode));
  const tickets = (data?.tickets as MaintenanceTicket[] | undefined) ?? [];

  const counts: Record<TabKey, number> = {
    open: 0, assigned: 0, completed: 0, callback_pending: 0, closed: 0,
  };
  for (const t of tickets) {
    const b = bucketFor(t);
    if (b) counts[b]++;
  }

  const filtered = tickets.filter((t) => bucketFor(t) === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>What guest issues are open?</p>
        </div>
        <Link
          href={`/web/desk/${hotelCode}/requests/new`}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold"
          style={{ background: '#ff385c', color: '#fff' }}
        >
          <Plus className="w-4 h-4" />
          New request
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: active ? '#222' : '#f7f7f7',
                color: active ? '#ffffff' : '#6a6a6a',
              }}
            >
              {t.label} <span className="ml-1 opacity-70">{counts[t.key]}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
          Nothing in {TABS.find((x) => x.key === tab)?.label}.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Where</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Issue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Callback</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const where = t.roomNumber ? `Room ${t.roomNumber}` : t.area ?? '—';
                return (
                  <tr key={`${t.id}-${i}`} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : undefined }}>
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
                    <td className="px-4 py-3 text-xs" style={{ color: t.callbackRequired ? '#9a3412' : '#929292' }}>
                      {t.callbackRequired ? (t.callbackStatus ?? 'pending') : 'no'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>{timeAgo(t.updatedAt)}</td>
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
