'use client';

import { useMemo, useState } from 'react';
import {
  HOTELS, GM_ROSTER, getRoomsForHotel, getOpenTicketsForHotel, getClosedTicketsForHotel,
  getAuditTasksForHotel, resolveDateRange, type DateRangeKind,
} from '@hos/shared';
import type { Room, MaintenanceTicket, TicketType, TicketPriority } from '@hos/shared';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge, AuditStatusBadge } from './OpsBadges';
import { ChevronLeft, Plus, X, CheckCircle2, Bell, Wrench, Sparkles, UserCog, ArrowRight } from 'lucide-react';

// Assign-to teams/roles for a new ticket. "Manager" routes to the hotel GM,
// who is notified and can reassign to the right team or person.
type AssignTeam = 'Engineering' | 'Housekeeping' | 'Manager';
const ASSIGN_LABEL: Record<AssignTeam, string> = {
  Engineering: 'Engineering Team',
  Housekeeping: 'Housekeeping Team',
  Manager: 'Manager',
};
// Targets the manager can route a ticket to.
const REASSIGN_TARGETS = [
  { group: 'Engineering', people: ['Engineering Team', 'Amir Lopez', 'Marcus Chen', 'Tom Becker'] },
  { group: 'Housekeeping', people: ['Housekeeping Team', 'Priya Nair', 'Sofia Reyes'] },
  { group: 'Front Desk', people: ['Front Desk Team', 'Dwayne Ellis'] },
];
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { useDateFilter } from '@/lib/date-filter-context';
import { OPS_PILLS, ROOM_COLORS, TILE_CFG, statusFromType } from './_constants';
import { KpiCard } from '@/components/common/KpiCard';

interface Props {
  hotelId: string;
  /** Back to portfolio. Omit for single-property personas (no portfolio above). */
  onBack?: () => void;
  onRoomClick: (room: Room) => void;
  onTicketClick: (ticket: MaintenanceTicket) => void;
  /** Show the 4 summary KPI cards (Available/Occupied/Dirty/Assigned) on top. */
  showSummaryKpis?: boolean;
}

const TYPE_FILTERS: { label: string; value: TicketType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reactive', value: 'reactive' },
  { label: 'Preventive', value: 'preventive' },
  { label: 'Audit', value: 'audit' },
  { label: 'Escalation', value: 'escalation' },
];

// Deterministic "now" so server and client render identical strings (no
// hydration mismatch). Honors the frozen demo clock when set.
const NOW_MS = (() => {
  const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
  return frozen ? new Date(`${frozen}T12:00:00Z`).getTime() : Date.now();
})();

function timeAgo(iso: string): string {
  const diff = NOW_MS - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor((diff % 3600000) / 60000)}m ago`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PropertyView({ hotelId, onBack, onRoomClick, onTicketClick, showSummaryKpis }: Props) {
  const [ticketFilter, setTicketFilter] = useState<TicketType | 'all'>('all');
  const [ticketTab, setTicketTab] = useState<'current' | 'closed'>('current');
  const [showNewTicket, setShowNewTicket] = useState(false);
  // Locally-created tickets (demo): prepended to the current queue for this hotel.
  const [createdTickets, setCreatedTickets] = useState<MaintenanceTicket[]>([]);
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  const openTickets = useMemo(
    () => [...createdTickets, ...getOpenTicketsForHotel(hotelId)],
    [hotelId, createdTickets],
  );
  const closedTickets = useMemo(() => getClosedTicketsForHotel(hotelId), [hotelId]);
  const tickets = ticketTab === 'current' ? openTickets : closedTickets;
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

  // Per-room ticket counts so each tile can show a corner badge (open only).
  const ticketsByRoom: Record<string, number> = {};
  for (const t of openTickets) {
    if (t.roomNumber) ticketsByRoom[t.roomNumber] = (ticketsByRoom[t.roomNumber] ?? 0) + 1;
  }

  const addTicket = (t: MaintenanceTicket) => {
    setCreatedTickets((prev) => [t, ...prev]);
    setTicketTab('current');
    setShowNewTicket(false);
  };

  // Manager re-routes a ticket that was assigned to them → update it in place.
  const [reassignFor, setReassignFor] = useState<MaintenanceTicket | null>(null);
  const reassignTicket = (ticketId: string, target: string) => {
    setCreatedTickets((prev) => prev.map((t) => t.id === ticketId ? {
      ...t,
      assignedTo: target,
      status: 'assigned',
      updatedAt: NEW_TICKET_NOW_ISO,
      department: /housekeep/i.test(target) ? 'Housekeeping' : /engineer/i.test(target) ? 'Engineering' : t.department,
      activity: [
        { timestamp: NEW_TICKET_NOW_ISO, actor: 'Manager', action: 'Reassigned', note: `Routed to ${target}` },
        ...t.activity,
      ],
    } : t));
    setReassignFor(null);
  };

  // Summary KPI counts (single-property header). Prefer live opsStats; fall
  // back to the room-grid status buckets so the cards never read all-zero.
  const metricToday = (t: string) => opsStats?.metrics.find((x) => x.type === t)?.today ?? 0;
  const totalRooms = rooms.length || hotel.rooms;
  const occupiedCount = (metricToday('Room.Occupied') + metricToday('Room.Stayover')) || counts.occupied || 0;
  const stayoverCount = metricToday('Room.Stayover');
  const availableCount = metricToday('Room.Available') || counts.ready || 0;
  const dirtyCount = metricToday('Room.Dirty') || counts.dirty || 0;
  const assignedCount = metricToday('Room.Assigned') || counts.inspecting || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold mb-2 hover:underline"
            style={{ color: '#ff385c' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Portfolio
          </button>
        )}
        {!showSummaryKpis && (
          <>
            <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{hotel.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
              {hotel.city}, {hotel.state} · {hotel.brand} · {hotel.rooms} rooms
            </p>
          </>
        )}
      </div>

      {/* Summary KPI cards (single-property) */}
      {showSummaryKpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Available" value={`${availableCount} / ${totalRooms}`} subtext={totalRooms > 0 ? `${((availableCount / totalRooms) * 100).toFixed(1)}% ready to assign` : '—'} size="large" />
          <KpiCard label="Occupied" value={occupiedCount.toString()} subtext={`incl. ${stayoverCount} stayover`} size="large" />
          <KpiCard label="Dirty" value={dirtyCount.toString()} subtext="awaiting housekeeping" alert={totalRooms > 0 && dirtyCount / totalRooms > 0.15} size="large" />
          <KpiCard label="Assigned" value={assignedCount.toString()} subtext="arriving today" size="large" />
        </div>
      )}

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
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              Tickets
            </h2>
            {/* Current / Closed tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: '#f0f0f0' }}>
              <button
                onClick={() => { setTicketTab('current'); setTicketFilter('all'); }}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                style={{ background: ticketTab === 'current' ? '#fff' : 'transparent', color: ticketTab === 'current' ? '#222' : '#6a6a6a' }}
              >
                Current ({openTickets.length})
              </button>
              <button
                onClick={() => { setTicketTab('closed'); setTicketFilter('all'); }}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                style={{ background: ticketTab === 'closed' ? '#fff' : 'transparent', color: ticketTab === 'closed' ? '#222' : '#6a6a6a' }}
              >
                Closed ({closedTickets.length})
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5"
            style={{ background: '#ff385c', color: '#fff' }}
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
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
            {ticketTab === 'current' ? 'No open tickets' : 'No closed tickets'}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{ticketTab === 'closed' ? 'Closed' : 'Age'}</th>
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
                      <td className="px-4 py-3 text-sm" style={{ color: '#444' }}>
                        {ticket.status === 'callback_pending' && ticket.assignedTo && GM_ROSTER.some((g) => g.name === ticket.assignedTo) ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-xs font-medium" style={{ color: '#b45309' }}>{ticket.assignedTo}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setReassignFor(ticket); }}
                              className="text-[11px] font-semibold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full"
                              style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}
                            >
                              <ArrowRight className="w-3 h-3" /> Reassign
                            </button>
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: ticket.assignedTo ? '#444' : '#c1c1c1' }}>{ticket.assignedTo ?? 'Unassigned'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>
                        {ticketTab === 'closed' && ticket.closedAt ? fmtDate(ticket.closedAt) : timeAgo(ticket.createdAt)}
                      </td>
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

      {showNewTicket && (
        <NewTicketModal hotelId={hotelId} onClose={() => setShowNewTicket(false)} onCreate={addTicket} />
      )}
      {reassignFor && (
        <ReassignModal ticket={reassignFor} onClose={() => setReassignFor(null)} onReassign={(target) => reassignTicket(reassignFor.id, target)} />
      )}
    </div>
  );
}

/* ── Manager reassign modal ───────────────────────────────────────────── */
function ReassignModal({ ticket, onClose, onReassign }: { ticket: MaintenanceTicket; onClose: () => void; onReassign: (target: string) => void }) {
  const [target, setTarget] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold inline-flex items-center gap-2" style={{ color: '#222' }}>
            <UserCog className="w-4 h-4" style={{ color: '#ff385c' }} /> Reassign ticket
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">
          <div className="rounded-lg px-3 py-2" style={{ background: '#f7f7f7' }}>
            <p className="text-xs font-mono font-bold" style={{ color: '#6a6a6a' }}>{ticket.id}</p>
            <p className="text-sm font-medium" style={{ color: '#222' }}>{ticket.title}</p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Route to</p>
          {REASSIGN_TARGETS.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{grp.group}</p>
              <div className="flex flex-wrap gap-1.5">
                {grp.people.map((p) => (
                  <button key={p} onClick={() => setTarget(p)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ border: `1px solid ${target === p ? '#ff385c' : '#ddd'}`, background: target === p ? '#fff1f3' : '#fff', color: target === p ? '#ff385c' : '#444' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={() => target && onReassign(target)} disabled={!target} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: target ? '#ff385c' : '#f3c0cb', color: '#fff' }}>Reassign</button>
        </div>
      </div>
    </div>
  );
}

/* ── New ticket modal ─────────────────────────────────────────────────── */
const NEW_TICKET_NOW_ISO = (() => {
  const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
  return frozen ? `${frozen}T12:00:00` : new Date(NOW_MS).toISOString().slice(0, 19);
})();

function NewTicketModal({ hotelId, onClose, onCreate }: { hotelId: string; onClose: () => void; onCreate: (t: MaintenanceTicket) => void }) {
  const [title, setTitle] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState<TicketType>('reactive');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [description, setDescription] = useState('');
  const [team, setTeam] = useState<AssignTeam>('Engineering');
  const [error, setError] = useState('');

  const TYPES: TicketType[] = ['reactive', 'preventive', 'audit', 'escalation'];
  const PRIORITIES: TicketPriority[] = ['urgent', 'high', 'normal', 'low'];
  const gm = GM_ROSTER.find((g) => g.hotelId === hotelId);
  const gmName = gm?.name ?? 'Hotel Manager';

  const TEAM_OPTIONS: { key: AssignTeam; icon: React.ReactNode; desc: string }[] = [
    { key: 'Engineering', icon: <Wrench className="w-4 h-4" />, desc: 'Maintenance & repairs' },
    { key: 'Housekeeping', icon: <Sparkles className="w-4 h-4" />, desc: 'Cleaning & room prep' },
    { key: 'Manager', icon: <UserCog className="w-4 h-4" />, desc: `${gmName} decides routing` },
  ];

  const submit = () => {
    if (!title.trim()) return setError('A short title is required.');
    const id = `NEW-${hotelId}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const toManager = team === 'Manager';
    const assignedTo = toManager ? gmName : ASSIGN_LABEL[team];
    onCreate({
      id,
      hotelId,
      roomNumber: roomNumber.trim() || undefined,
      area: roomNumber.trim() ? undefined : 'Hotel-wide',
      type,
      priority,
      // Manager route → waits on the GM to triage (callback_pending used as the
      // "awaiting manager routing" state). Team route → assigned straight away.
      status: toManager ? 'callback_pending' : 'assigned',
      title: title.trim(),
      description: description.trim() || title.trim(),
      reportedBy: 'Operations',
      assignedTo,
      department: team === 'Housekeeping' ? 'Housekeeping' : team === 'Engineering' ? 'Engineering' : undefined,
      createdAt: NEW_TICKET_NOW_ISO,
      updatedAt: NEW_TICKET_NOW_ISO,
      estimatedCost: undefined,
      revenueLost: 0,
      activity: [
        { timestamp: NEW_TICKET_NOW_ISO, actor: 'Operations', action: 'Ticket created', note: title.trim() },
        toManager
          ? { timestamp: NEW_TICKET_NOW_ISO, actor: 'Operations', action: 'Routed to manager', note: `${gmName} notified to review and assign` }
          : { timestamp: NEW_TICKET_NOW_ISO, actor: 'Operations', action: 'Assigned', note: `Assigned to ${assignedTo}` },
      ],
    });
  };

  const field = 'h-9 px-2.5 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222] outline-none focus:ring-2 focus:ring-[#ff385c]';
  const lbl = 'text-[11px] font-semibold uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold inline-flex items-center gap-2" style={{ color: '#222' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#ff385c' }} /> New Ticket
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={lbl} style={{ color: '#6a6a6a' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AC not cooling – room at 78°F" className={field} />
          </div>

          {/* Assign to — team / role */}
          <div className="flex flex-col gap-1.5">
            <label className={lbl} style={{ color: '#6a6a6a' }}>Assign to</label>
            <div className="grid grid-cols-3 gap-2">
              {TEAM_OPTIONS.map((o) => (
                <button key={o.key} onClick={() => setTeam(o.key)} className="p-2.5 rounded-xl text-left flex flex-col gap-1" style={{ border: `1px solid ${team === o.key ? '#ff385c' : '#eee'}`, background: team === o.key ? '#fff1f3' : '#fff' }}>
                  <span style={{ color: team === o.key ? '#ff385c' : '#6a6a6a' }}>{o.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: '#222' }}>{o.key}</span>
                  <span className="text-[10px] leading-tight" style={{ color: '#929292' }}>{o.desc}</span>
                </button>
              ))}
            </div>
            {team === 'Manager' && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg mt-0.5" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <Bell className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }} />
                <p className="text-[11px]" style={{ color: '#92400e' }}>
                  <span className="font-semibold">{gmName}</span> will be notified and can route this to the right team or person.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={lbl} style={{ color: '#6a6a6a' }}>Room</label>
              <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="312" className={field} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} style={{ color: '#6a6a6a' }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as TicketType)} className={field}>
                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} style={{ color: '#6a6a6a' }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className={field}>
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl} style={{ color: '#6a6a6a' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the issue? Add any detail the team needs." rows={3} className="px-2.5 py-2 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222] outline-none focus:ring-2 focus:ring-[#ff385c] resize-none" />
          </div>
          {error && <p className="text-xs font-medium" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={submit} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#ff385c', color: '#fff' }}>Create Ticket</button>
        </div>
      </div>
    </div>
  );
}
