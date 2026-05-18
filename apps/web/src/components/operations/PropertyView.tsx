'use client';

import { useMemo, useState } from 'react';
import {
  HOTELS, getRoomsForHotel, getActiveTicketsForHotel, getAuditTasksForHotel,
  resolveDateRange, type DateRangeKind,
} from '@hos/shared';
import type { Room, MaintenanceTicket, TicketType } from '@hos/shared';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge, AuditStatusBadge } from './OpsBadges';
import { ChevronLeft } from 'lucide-react';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { useDateFilter } from '@/lib/date-filter-context';

interface Props {
  hotelId: string;
  onBack: () => void;
  onRoomClick: (room: Room) => void;
  onTicketClick: (ticket: MaintenanceTicket) => void;
}

/**
 * Project the new RoomStatus type values onto the grid's 6-status visual
 * buckets so existing tile colors keep working unchanged.
 */
function statusFromType(t: string): Room['status'] {
  if (t === 'Occupied' || t === 'Stayover') return 'occupied';
  if (t === 'Available') return 'ready';
  if (t === 'Dirty')     return 'dirty';
  if (t === 'Assigned')  return 'inspecting';
  if (t === 'OOO')       return 'ooo';
  return 'occupied';
}

/**
 * Per-room "Final Room Status" pills from room_snapshots.reservation_status:
 *   IN HOUSE    → Occupied
 *   Arrival     → Assigned
 *   blank/empty → Available
 *   CHECKED OUT → Dirty
 */
const OPS_PILLS: Array<{
  type: string; label: string;
  bg: string; border: string; color: string; dot: string;
}> = [
  { type: 'Room.Occupied',  label: 'Occupied',  bg: '#f3f4f6', border: '#d1d5db', color: '#374151', dot: '#94a3b8' },
  { type: 'Room.Stayover',  label: 'Stayover',  bg: '#fff7ed', border: '#fdba74', color: '#9a3412', dot: '#fb923c' },
  { type: 'Room.Assigned',  label: 'Assigned',  bg: '#dbeafe', border: '#93c5fd', color: '#1e40af', dot: '#3b82f6' },
  { type: 'Room.Available', label: 'Available', bg: '#dcfce7', border: '#86efac', color: '#15803d', dot: '#22c55e' },
  { type: 'Room.Dirty',     label: 'Dirty',     bg: '#fef9c3', border: '#fde047', color: '#854d0e', dot: '#f59e0b' },
];

const TYPE_FILTERS: { label: string; value: TicketType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reactive', value: 'reactive' },
  { label: 'Preventive', value: 'preventive' },
  { label: 'Audit', value: 'audit' },
  { label: 'Escalation', value: 'escalation' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor((diff % 3600000) / 60000)}m ago`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PropertyView({ hotelId, onBack, onRoomClick, onTicketClick }: Props) {
  const [ticketFilter, setTicketFilter] = useState<TicketType | 'all'>('all');
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  const tickets = getActiveTicketsForHotel(hotelId);
  const auditTasks = getAuditTasksForHotel(hotelId);

  // ── Live operational counts (status pills) — driven by night_audit_rows ──
  // The room grid + tickets + audits below stay on mock helpers for now;
  // this hook only powers the pill row.
  const { range, customFrom, customTo } = useDateFilter();
  const { from, to } = useMemo(() => {
    if (range === 'custom') {
      const f = customFrom || customTo;
      const t = customTo   || customFrom;
      if (f && t) return { from: f, to: t };
    }
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range, customFrom, customTo]);
  const { data: opsStatsData } = useApi(apiKeys.opsPropertyStats(hotelId, from, to));
  const opsStats = opsStatsData?.stats ?? null;

  // ── Live room grid — from room_snapshots (OnQ room-details upload) ──────
  // Each API row carries its derived `type` (Occupied / Stayover / Assigned /
  // Available / Dirty / raw-for-review). We project that onto the grid's
  // existing 6-status visual buckets so the design stays unchanged. If there
  // are no snapshots for this hotel yet, we fall back to mock rooms so the
  // grid never goes empty.
  const { data: roomsData } = useApi(apiKeys.opsPropertyRooms(hotelId));
  const apiRooms = roomsData?.rooms ?? [];
  const rooms: Room[] = apiRooms.length > 0
    ? apiRooms.map((r) => ({
        id:               `${r.hotelId}-${r.roomNumber}`,
        hotelId:          r.hotelId,
        number:           r.roomNumber,
        floor:            r.floor,
        type:             'King',                 // placeholder; not in spec
        status:           statusFromType(r.type),
        hkStatus:         'clean',
        lastCleaned:      null,
        lastInspected:    null,
        hasOpenTicket:    false,
        oooReason:        r.matchStatus === 'Needs Review' ? `Raw: ${r.type}` : undefined,
      }))
    : getRoomsForHotel(hotelId);

  // Group rooms by floor, sort floors descending
  const floorMap: Record<number, Room[]> = {};
  for (const room of rooms) {
    if (!floorMap[room.floor]) floorMap[room.floor] = [];
    floorMap[room.floor].push(room);
  }
  const floors = Object.keys(floorMap).map(Number).sort((a, b) => b - a);

  // Status summary counts
  const counts: Record<string, number> = {};
  for (const r of rooms) counts[r.status] = (counts[r.status] ?? 0) + 1;

  const filteredTickets = tickets.filter((t) =>
    ticketFilter === 'all' || t.type === ticketFilter,
  );

  const ROOM_COLORS: Record<string, string> = {
    ready: '#22c55e',
    dirty: '#f59e0b',
    inspecting: '#3b82f6',
    occupied: '#94a3b8',
    ooo: '#ef4444',
    blocked: '#e11d48',
  };

  // Tile styles mirror Audits HotelAuditView room grid
  const TILE_CFG: Record<string, { bg: string; border: string; dot: string; label: string }> = {
    ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
    inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting' },
    dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
    occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
    ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
    blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked' },
  };

  // Per-room ticket counts so each tile can show a corner badge
  const ticketsByRoom: Record<string, number> = {};
  for (const t of tickets) {
    if (t.roomNumber) ticketsByRoom[t.roomNumber] = (ticketsByRoom[t.roomNumber] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-semibold mb-2 hover:underline"
          style={{ color: '#ff385c' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Portfolio
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{hotel.name}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotel.city}, {hotel.state} · {hotel.brand} · {hotel.rooms} rooms
        </p>
      </div>

      {/* Status summary pills — sourced from night_audit_rows operational counts */}
      <div className="flex items-center gap-2 flex-wrap">
        {OPS_PILLS.map((pill) => {
          const m = opsStats?.metrics.find((x) => x.type === pill.type);
          const count = m?.today ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={pill.type}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: pill.bg, border: `1px solid ${pill.border}`, color: pill.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: pill.dot }} />
              {count} {pill.label}
            </div>
          );
        })}
      </div>

      {/* Room grid — Audits-style tiled layout */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Room Grid
          </h2>
          <span className="text-xs" style={{ color: '#929292' }}>Click a room to drill in</span>
        </div>

        {/* Legend */}
        <div
          className="px-5 py-2.5 flex items-center gap-5 flex-wrap rounded-t-2xl"
          style={{ background: '#fafafa', borderTop: '1px solid #dddddd', borderLeft: '1px solid #dddddd', borderRight: '1px solid #dddddd' }}
        >
          <span className="text-xs font-semibold" style={{ color: '#929292' }}>Status:</span>
          {Object.entries(TILE_CFG).map(([status, cfg]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
              {cfg.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <span className="w-3 h-3 rounded-full text-[8px] font-black text-white flex items-center justify-center" style={{ background: '#ff385c' }}>!</span>
            Open ticket count
          </span>
        </div>

        <div
          className="px-5 py-5 rounded-b-2xl"
          style={{ background: '#ffffff', border: '1px solid #dddddd', borderTop: 'none' }}
        >
          {floors.map((floor) => (
            <div key={floor} className="mb-6 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
                Floor {floor}
              </p>
              <div className="flex flex-wrap gap-2">
                {floorMap[floor].sort((a, b) => a.number.localeCompare(b.number)).map((room) => {
                  const cfg = TILE_CFG[room.status] ?? TILE_CFG.occupied;
                  const ticketCount = ticketsByRoom[room.number] ?? 0;
                  return (
                    <button
                      key={room.id}
                      onClick={() => onRoomClick(room)}
                      title={`Room ${room.number} · ${room.type} · ${cfg.label}${room.oooReason ? ` (${room.oooReason})` : ''}${ticketCount ? ` · ${ticketCount} open ticket${ticketCount === 1 ? '' : 's'}` : ''}`}
                      className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{
                        width: 64, height: 56,
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222222' }}>{room.number}</span>
                      {ticketCount > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                          style={{ background: '#ff385c', fontSize: '9px' }}
                        >
                          {ticketCount}
                        </span>
                      )}
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ background: cfg.dot }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property ticket queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Ticket Queue ({tickets.length})
          </h2>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 mb-3">
          {TYPE_FILTERS.map((f) => {
            const count = f.value === 'all'
              ? tickets.length
              : tickets.filter((t) => t.type === f.value).length;
            if (count === 0 && f.value !== 'all') return null;
            const active = ticketFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTicketFilter(f.value)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: active ? '#222222' : '#f7f7f7',
                  color: active ? '#ffffff' : '#6a6a6a',
                }}
              >
                {f.label} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {filteredTickets.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-8 text-center text-sm"
            style={{ border: '1px solid #dddddd', color: '#929292' }}
          >
            No tickets found
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Issue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Age</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, i) => {
                  const location = ticket.roomNumber ? `Room ${ticket.roomNumber}` : ticket.area ?? '—';
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onTicketClick(ticket)}
                      className="cursor-pointer hover:bg-[#fafafa] transition-colors"
                      style={{ borderBottom: i < filteredTickets.length - 1 ? '1px solid #f0f0f0' : undefined }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: '#6a6a6a' }}>{ticket.id}</td>
                      <td className="px-4 py-3"><TicketTypeBadge type={ticket.type} /></td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#444' }}>{location}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium truncate" style={{ color: '#222222' }}>{ticket.title}</p>
                      </td>
                      <td className="px-4 py-3"><PriorityDot priority={ticket.priority} /></td>
                      <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>{timeAgo(ticket.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit & Preventive Tasks */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Audit & Preventive Tasks ({auditTasks.length})
        </h2>
        {auditTasks.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-8 text-center text-sm"
            style={{ border: '1px solid #dddddd', color: '#929292' }}
          >
            No audit or preventive tasks
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Scope</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Scheduled</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {auditTasks.map((task, i) => (
                  <tr
                    key={task.id}
                    style={{ borderBottom: i < auditTasks.length - 1 ? '1px solid #f0f0f0' : undefined }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded capitalize"
                          style={{
                            background: task.type === 'audit' ? '#f5f0ff' : '#eff6ff',
                            color: task.type === 'audit' ? '#6d28d9' : '#1d6fa4',
                          }}
                        >
                          {task.type}
                        </span>
                        <p className="font-medium" style={{ color: '#222222' }}>{task.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#6a6a6a' }}>
                      {task.roomNumber ? `Room ${task.roomNumber}` : task.area ?? 'Hotel-wide'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#444' }}>
                      {fmtDate(task.scheduledDate)}
                    </td>
                    <td className="px-4 py-3"><AuditStatusBadge status={task.status} /></td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#222222' }}>
                      {task.score !== undefined ? `${task.score}/100` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#6a6a6a' }}>{task.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
