'use client';

import { useState } from 'react';
import {
  HOTELS, getRoomsForHotel, getActiveTicketsForHotel, getAuditTasksForHotel,
} from '@hos/shared';
import type { Room, MaintenanceTicket, TicketType } from '@hos/shared';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge, AuditStatusBadge, ROOM_STATUS_STYLES } from './OpsBadges';
import { ChevronLeft } from 'lucide-react';

interface Props {
  hotelId: string;
  onBack: () => void;
  onRoomClick: (room: Room) => void;
  onTicketClick: (ticket: MaintenanceTicket) => void;
}

const STATUS_ORDER = ['ready', 'inspecting', 'dirty', 'blocked', 'ooo', 'occupied'] as const;

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
  const rooms = getRoomsForHotel(hotelId);
  const tickets = getActiveTicketsForHotel(hotelId);
  const auditTasks = getAuditTasksForHotel(hotelId);

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

      {/* Status summary pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_ORDER.map((status) => {
          const count = counts[status] ?? 0;
          if (count === 0) return null;
          const s = ROOM_STATUS_STYLES[status];
          return (
            <div
              key={status}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: ROOM_COLORS[status] }} />
              {count} {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        })}
      </div>

      {/* Room grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Room Grid
        </h2>
        <div
          className="rounded-2xl p-4"
          style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
        >
          <div className="flex flex-col gap-2">
            {floors.map((floor) => (
              <div key={floor} className="flex items-center gap-2">
                <span
                  className="text-xs font-bold w-8 text-right flex-shrink-0"
                  style={{ color: '#929292' }}
                >
                  F{floor}
                </span>
                <div className="flex flex-wrap gap-1">
                  {floorMap[floor].sort((a, b) => a.number.localeCompare(b.number)).map((room) => (
                    <button
                      key={room.id}
                      onClick={() => onRoomClick(room)}
                      title={`Room ${room.number} – ${room.type} – ${room.status}${room.oooReason ? ` (${room.oooReason})` : ''}`}
                      className="w-10 h-9 rounded text-xs font-bold transition-all hover:scale-110 hover:z-10 relative hover:shadow-md"
                      style={{
                        background: ROOM_COLORS[room.status],
                        color: room.status === 'occupied' ? '#374151' : '#fff',
                        outline: room.hasOpenTicket ? '2px solid #222' : undefined,
                        outlineOffset: '1px',
                      }}
                    >
                      {room.number.slice(-2)}
                      {room.hasOpenTicket && (
                        <span
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                          style={{ background: '#ff385c' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 flex-wrap" style={{ borderTop: '1px solid #dddddd' }}>
            {Object.entries(ROOM_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-xs capitalize" style={{ color: '#6a6a6a' }}>{status}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border-2" style={{ background: '#94a3b8', borderColor: '#222' }} />
              <span className="text-xs" style={{ color: '#6a6a6a' }}>Has open ticket</span>
            </div>
          </div>
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
