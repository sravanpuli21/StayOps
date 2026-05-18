'use client';

import { useState } from 'react';
import { HOTELS, MAINTENANCE_TICKETS } from '@hos/shared';
import type { MaintenanceTicket, TicketType } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from './OpsBadges';
import { AlertTriangle } from 'lucide-react';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';

interface Props {
  onHotelClick: (hotelId: string) => void;
  onTicketClick: (ticket: MaintenanceTicket) => void;
  hotelIds?: readonly string[];
}

const TYPE_FILTERS: { label: string; value: TicketType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reactive', value: 'reactive' },
  { label: 'Escalation', value: 'escalation' },
  { label: 'Preventive', value: 'preventive' },
  { label: 'Audit', value: 'audit' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor((diff % 3600000) / 60000)}m ago`;
}

export function PortfolioView({ onHotelClick, onTicketClick, hotelIds }: Props) {
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const scopedHotels = hotelIds ? HOTELS.filter((h) => hotelIds.includes(h.id)) : HOTELS;

  // Live per-hotel ops summary from room_snapshots.
  const { data: portfolioData } = useApi(apiKeys.opsPortfolio(scopedHotels.map((h) => h.id)));
  const portfolioRows = portfolioData?.rows ?? [];
  const summaryByHotel = new Map(portfolioRows.map((r) => [r.hotelId, r]));

  // Portfolio KPIs (sum across the API rows).
  const totalRooms     = portfolioRows.reduce((s, r) => s + r.totalRooms, 0);
  const totalAvailable = portfolioRows.reduce((s, r) => s + r.available, 0);
  const totalOccupied  = portfolioRows.reduce((s, r) => s + r.occupied + r.stayover, 0);
  const totalDirty     = portfolioRows.reduce((s, r) => s + r.dirty, 0);
  const totalAssigned  = portfolioRows.reduce((s, r) => s + r.assigned, 0);

  // Maintenance queue stays on mock for now (no DB rows yet).
  const activeTickets = MAINTENANCE_TICKETS.filter((t) =>
    t.status !== 'resolved' && (!hotelIds || hotelIds.includes(t.hotelId))
  );
  const urgentTickets = activeTickets.filter((t) => t.priority === 'urgent');

  const filteredTickets = activeTickets.filter((t) => {
    if (urgentOnly && t.priority !== 'urgent') return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards — sourced from room_snapshots */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Available"
          value={`${totalAvailable} / ${totalRooms}`}
          subtext={totalRooms > 0 ? `${((totalAvailable / totalRooms) * 100).toFixed(1)}% ready to assign` : 'no snapshots yet'}
          size="large"
        />
        <KpiCard
          label="Occupied"
          value={totalOccupied.toString()}
          subtext={`incl. ${portfolioRows.reduce((s, r) => s + r.stayover, 0)} stayover`}
          size="large"
        />
        <KpiCard
          label="Dirty"
          value={totalDirty.toString()}
          subtext="awaiting housekeeping"
          alert={totalRooms > 0 && totalDirty / totalRooms > 0.15}
          size="large"
        />
        <KpiCard
          label="Assigned"
          value={totalAssigned.toString()}
          subtext="arriving today"
          size="large"
        />
      </div>

      {/* Property ops table */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Property Operations
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #dddddd' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Property</th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Available</th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Occupied</th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Stayover</th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Assigned</th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Dirty</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {scopedHotels.map((hotel, i) => {
                const s = summaryByHotel.get(hotel.id);
                const total = s?.totalRooms ?? hotel.rooms;
                const available = s?.available ?? 0;
                const availablePct = total > 0 ? Math.round((available / total) * 100) : 0;
                const dirtyPct    = total > 0 ? (s?.dirty ?? 0) / total : 0;
                const hasIssue    = !s || dirtyPct > 0.15;
                return (
                  <tr
                    key={hotel.id}
                    onClick={() => onHotelClick(hotel.id)}
                    className="cursor-pointer transition-colors hover:bg-[#fafafa]"
                    style={{ borderBottom: i < scopedHotels.length - 1 ? '1px solid #f0f0f0' : undefined }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasIssue && (
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#d97706' }} />
                        )}
                        <div>
                          <p className="font-semibold" style={{ color: '#222222' }}>{hotel.shortName}</p>
                          <p className="text-xs" style={{ color: '#929292' }}>
                            {hotel.city}, {hotel.state} · {hotel.brand}
                            {!s && ' · no snapshot yet'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div>
                        <p className="font-semibold" style={{ color: '#222222' }}>{available}</p>
                        {s && <p className="text-xs" style={{ color: '#929292' }}>{availablePct}%</p>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold" style={{ color: '#222222' }}>{s?.occupied ?? 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold" style={{ color: '#222222' }}>{s?.stayover ?? 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold" style={{ color: '#222222' }}>{s?.assigned ?? 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="font-semibold"
                        style={{ color: dirtyPct > 0.15 ? '#c0392b' : '#222222' }}
                      >
                        {s?.dirty ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold" style={{ color: '#ff385c' }}>View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio ticket queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Maintenance Queue
          </h2>
          <button
            onClick={() => setUrgentOnly((v) => !v)}
            className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
            style={{
              background: urgentOnly ? '#fff1f1' : '#f7f7f7',
              color: urgentOnly ? '#c0392b' : '#6a6a6a',
              border: urgentOnly ? '1px solid #fca5a5' : '1px solid #dddddd',
            }}
          >
            {urgentOnly ? '🚨 Urgent only' : 'All priorities'}
          </button>
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1 mb-3">
          {TYPE_FILTERS.map((f) => {
            const count = f.value === 'all'
              ? activeTickets.length
              : activeTickets.filter((t) => t.type === f.value).length;
            const active = typeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: active ? '#222222' : '#f7f7f7',
                  color: active ? '#ffffff' : '#6a6a6a',
                }}
              >
                {f.label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #dddddd' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hotel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Issue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#929292' }}>
                    No tickets match the current filter
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, i) => {
                  const hotel = HOTELS.find((h) => h.id === ticket.hotelId);
                  const location = ticket.roomNumber ? `Rm ${ticket.roomNumber}` : ticket.area ?? '';
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onTicketClick(ticket)}
                      className="cursor-pointer transition-colors hover:bg-[#fafafa]"
                      style={{ borderBottom: i < filteredTickets.length - 1 ? '1px solid #f0f0f0' : undefined }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: '#6a6a6a' }}>
                        {ticket.id}
                      </td>
                      <td className="px-4 py-3">
                        <TicketTypeBadge type={ticket.type} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: '#222222' }}>{hotel?.shortName ?? ticket.hotelId}</p>
                        {location && <p className="text-xs" style={{ color: '#929292' }}>{location}</p>}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-medium truncate" style={{ color: '#222222' }}>{ticket.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityDot priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>
                        {timeAgo(ticket.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
