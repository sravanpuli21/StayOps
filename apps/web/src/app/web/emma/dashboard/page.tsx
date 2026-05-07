'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Room } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import {
  Bed, CheckCircle2, AlertTriangle, Wrench, Printer, Users, ChevronRight,
  Sparkles, UserPlus, X, Globe,
} from 'lucide-react';
import {
  EMMA_HOTEL, getHkStaff, getHkCallouts, getAllHotelRooms, getQueueRooms,
  getHotelTickets, getHotelOpsSummary, seedAssignments, autoAssignRooms,
  ROOM_TILE as SHARED_ROOM_TILE,
} from '@/lib/emma-data';

interface Assignment {
  roomNumber: string;
  assignees: string[];
}

const ROOM_TILE = SHARED_ROOM_TILE;

export default function EmmaDashboard() {
  const hotel = EMMA_HOTEL;
  const allRooms = getAllHotelRooms();
  const tickets = getHotelTickets();
  const ops = getHotelOpsSummary();
  const hkStaff = useMemo(() => getHkStaff(), []);
  const calloutCount = useMemo(() => getHkCallouts().length, []);
  const queueRooms = useMemo(() => getQueueRooms(), []);

  const [assignments, setAssignments] = useState<Assignment[]>(() => seedAssignments());

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showBilingual, setShowBilingual] = useState(false);

  const assignmentMap = useMemo(() => {
    const m = new Map<string, Assignment>();
    for (const a of assignments) m.set(a.roomNumber, a);
    return m;
  }, [assignments]);

  const unassigned = queueRooms.filter((r) => !assignmentMap.has(r.number));
  const assignedByStaff = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of assignments) {
      for (const empId of a.assignees) {
        if (!m.has(empId)) m.set(empId, []);
        m.get(empId)!.push(a.roomNumber);
      }
    }
    return m;
  }, [assignments]);

  const assignToStaff = (roomNumber: string, employeeId: string) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.roomNumber === roomNumber);
      if (!existing) return [...prev, { roomNumber, assignees: [employeeId] }];
      if (existing.assignees.includes(employeeId)) return prev;
      if (existing.assignees.length >= 2) return prev; // cap at team-of-2
      return prev.map((a) =>
        a.roomNumber === roomNumber ? { ...a, assignees: [...a.assignees, employeeId] } : a,
      );
    });
    setSelectedRoom(null);
  };

  const unassignRoom = (roomNumber: string) => {
    setAssignments((prev) => prev.filter((a) => a.roomNumber !== roomNumber));
  };

  const removeAssignee = (roomNumber: string, employeeId: string) => {
    setAssignments((prev) => {
      const a = prev.find((x) => x.roomNumber === roomNumber);
      if (!a) return prev;
      const next = a.assignees.filter((id) => id !== employeeId);
      if (next.length === 0) return prev.filter((x) => x.roomNumber !== roomNumber);
      return prev.map((x) => (x.roomNumber === roomNumber ? { ...x, assignees: next } : x));
    });
  };

  const autoAssign = () => {
    const taken = new Set(assignments.map((a) => a.roomNumber));
    const toFill = queueRooms.filter((r) => !taken.has(r.number)).map((r) => r.number);
    setAssignments(autoAssignRooms(assignments, toFill));
  };

  const clearAll = () => setAssignments([]);

  // Urgent tickets to escalate
  const urgentTickets = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').slice(0, 4);

  // Floor groups for live floor visibility grid
  const floors = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const r of allRooms) {
      if (!map.has(r.floor)) map.set(r.floor, []);
      map.get(r.floor)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [allRooms]);

  const empById = (id: string) => hkStaff.find((e) => e.id === id);

  return (
    <div className="flex flex-col gap-6">
      {/* Morning header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
            Good morning, Emma
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {hotel.shortName} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · Housekeeping
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBilingual((v) => !v)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: showBilingual ? '#222' : '#ffffff', color: showBilingual ? '#ffffff' : '#6a6a6a', border: '1px solid #dddddd' }}
          >
            <Globe className="w-3.5 h-3.5" />
            {showBilingual ? 'EN + ES' : 'EN only'}
          </button>
          <Link
            href="/web/emma/print"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print assignments
          </Link>
        </div>
      </div>

      {/* Morning briefing KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          label="Rooms to clean"
          value={queueRooms.length.toString()}
          subtext={showBilingual ? 'Por limpiar' : `${ops.dirtyRooms} dirty · ${ops.inspectingRooms} inspecting`}
          size="medium"
          alert={queueRooms.length > 30}
        />
        <KpiCard
          label="Rooms ready"
          value={ops.readyRooms.toString()}
          subtext={showBilingual ? 'Listos' : 'clean + inspected'}
          size="medium"
        />
        <KpiCard
          label="Out of order"
          value={ops.oooRooms.toString()}
          subtext={showBilingual ? 'Fuera de servicio' : 'blocked / OOO'}
          alert={ops.oooRooms > 3}
          size="medium"
        />
        <KpiCard
          label="Staff on shift"
          value={hkStaff.length.toString()}
          subtext={calloutCount > 0
            ? (showBilingual ? `${calloutCount} ausente(s)` : `${calloutCount} callout${calloutCount === 1 ? '' : 's'}`)
            : (showBilingual ? 'Todos presentes' : 'all present')}
          alert={calloutCount > 0}
          size="medium"
        />
        <KpiCard
          label="Open tickets"
          value={ops.openTickets.toString()}
          subtext={ops.urgentTickets > 0 ? `${ops.urgentTickets} urgent` : 'tracking'}
          alert={ops.urgentTickets > 0}
          size="medium"
        />
      </div>

      {/* Assignment board */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              Room assignments · {assignments.length} of {queueRooms.length}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              Click an unassigned room, then click a person. Click a staff card to add a second person for a team of 2.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={autoAssign}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: '#ff385c', color: '#ffffff' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-assign remaining
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Unassigned queue */}
          <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
                Unassigned · {unassigned.length}
              </p>
              {showBilingual && <p className="text-[10px]" style={{ color: '#929292' }}>Sin asignar</p>}
            </div>
            {unassigned.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#16a34a' }} />
                <p className="text-xs font-semibold" style={{ color: '#15803d' }}>All rooms assigned</p>
                {showBilingual && <p className="text-[10px]" style={{ color: '#6a6a6a' }}>Todas asignadas</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
                {unassigned.map((r) => {
                  const isSelected = selectedRoom === r.number;
                  return (
                    <button
                      key={r.number}
                      onClick={() => setSelectedRoom(isSelected ? null : r.number)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                      style={{
                        background: isSelected ? '#fff1f3' : '#fafafa',
                        border: isSelected ? '1.5px solid #ff385c' : '1px solid #f0f0f0',
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ROOM_TILE[r.status].bg, border: `1px solid ${ROOM_TILE[r.status].border}` }}>
                        <span className="text-xs font-bold" style={{ color: '#222' }}>{r.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#222' }}>
                          Room {r.number} · {r.type}
                        </p>
                        <p className="text-[11px]" style={{ color: '#6a6a6a' }}>
                          Floor {r.floor} · {ROOM_TILE[r.status].label}{showBilingual ? ` / ${ROOM_TILE[r.status].esp}` : ''}
                          {r.hasOpenTicket && ' · has ticket'}
                        </p>
                      </div>
                      {isSelected && <span className="text-[10px] font-bold" style={{ color: '#ff385c' }}>PICK STAFF →</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Staff columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {hkStaff.map((emp) => {
              const rooms = assignedByStaff.get(emp.id) ?? [];
              const totalRooms = rooms.length;
              const isPickable = !!selectedRoom;
              return (
                <div
                  key={emp.id}
                  onClick={() => isPickable && assignToStaff(selectedRoom!, emp.id)}
                  className="rounded-2xl p-3 flex flex-col min-h-[200px]"
                  style={{
                    background: '#ffffff',
                    border: isPickable ? '1.5px dashed #ff385c' : '1px solid #dddddd',
                    cursor: isPickable ? 'pointer' : 'default',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#428bff', color: '#ffffff' }}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                      <p className="text-[10px] truncate" style={{ color: '#929292' }}>{emp.role}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: totalRooms >= 10 ? '#fef2f2' : '#f0fdf4', color: totalRooms >= 10 ? '#b91c1c' : '#15803d' }}
                    >
                      {totalRooms}
                    </span>
                  </div>
                  {rooms.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] italic" style={{ color: '#c1c1c1' }}>
                      {isPickable ? 'Click to assign here' : 'No rooms yet'}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 flex-1 content-start">
                      {rooms.map((roomNumber) => {
                        const isTeam = (assignmentMap.get(roomNumber)?.assignees.length ?? 0) === 2;
                        return (
                          <button
                            key={roomNumber}
                            onClick={(e) => { e.stopPropagation(); removeAssignee(roomNumber, emp.id); }}
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:line-through"
                            style={{
                              background: isTeam ? '#eff6ff' : '#f7f7f7',
                              color: isTeam ? '#1d4ed8' : '#222',
                              border: `1px solid ${isTeam ? '#bfdbfe' : '#e5e7eb'}`,
                            }}
                            title={isTeam ? 'Team of 2 · click to remove this person' : 'Click to unassign'}
                          >
                            {isTeam && <UserPlus className="w-2.5 h-2.5" />}
                            {roomNumber}
                            <X className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live floor visibility — room status grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Floor view · live room status
          </h2>
          <span className="text-xs" style={{ color: '#929292' }}>{allRooms.length} rooms · 6 floors</span>
        </div>
        <div
          className="px-5 py-2.5 flex items-center gap-5 flex-wrap rounded-t-2xl"
          style={{ background: '#fafafa', border: '1px solid #dddddd' }}
        >
          {Object.entries(ROOM_TILE).map(([status, cfg]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
              {cfg.label}{showBilingual ? ` / ${cfg.esp}` : ''}
            </span>
          ))}
        </div>
        <div className="px-5 py-5 rounded-b-2xl" style={{ background: '#ffffff', border: '1px solid #dddddd', borderTop: 'none' }}>
          {floors.map(([floor, rooms]) => (
            <div key={floor} className="mb-5 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
                Floor {floor}
              </p>
              <div className="flex flex-wrap gap-2">
                {rooms.sort((a, b) => a.number.localeCompare(b.number)).map((room) => {
                  const cfg = ROOM_TILE[room.status] ?? ROOM_TILE.occupied;
                  const assignees = assignmentMap.get(room.number)?.assignees ?? [];
                  return (
                    <div
                      key={room.id}
                      className="relative rounded-xl flex flex-col items-center justify-center"
                      style={{ width: 64, height: 56, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                      title={`Room ${room.number} · ${cfg.label}${room.hasOpenTicket ? ' · has ticket' : ''}${assignees.length ? ' · ' + assignees.map((id) => empById(id)?.initials).join(' + ') : ''}`}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{room.number}</span>
                      {room.hasOpenTicket && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#ff385c' }}
                        >
                          <Wrench className="w-2 h-2" style={{ color: '#ffffff' }} />
                        </span>
                      )}
                      {assignees.length > 0 && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-[2px]">
                          {assignees.map((id) => {
                            const emp = empById(id);
                            return (
                              <div
                                key={id}
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border-2"
                                style={{ background: '#428bff', color: '#ffffff', borderColor: '#ffffff' }}
                              >
                                {emp?.initials[0] ?? '?'}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent tickets Emma should know about */}
      {urgentTickets.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />
            <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>
              Urgent tickets · {urgentTickets.length}
              {showBilingual && <span className="ml-2 text-xs" style={{ color: '#7f1d1d' }}>Urgentes</span>}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {urgentTickets.map((t) => (
              <div
                key={t.id}
                className="rounded-lg px-3 py-2"
                style={{ background: '#ffffff', border: '1px solid #fecaca' }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: '#b91c1c' }}>URGENT</span>
                  {t.roomNumber && <span className="text-xs font-semibold" style={{ color: '#222' }}>Room {t.roomNumber}</span>}
                  <span className="text-[11px]" style={{ color: '#929292' }}>· {t.type}</span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#222' }}>{t.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>Assigned to {t.assignedTo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jump into */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Jump into</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <JumpCard href="/web/emma/print" icon={<Printer className="w-5 h-5" style={{ color: '#ff385c' }} />} label="Print sheets" hint="Assignment printouts" />
          <JumpCard href="/web/emma/rooms" icon={<Bed className="w-5 h-5" style={{ color: '#ff385c' }} />} label="Rooms" hint="Full room inventory" />
          <JumpCard href="/web/emma/team" icon={<Users className="w-5 h-5" style={{ color: '#ff385c' }} />} label="Team" hint={`${hkStaff.length} active staff`} />
          <JumpCard href="/web/emma/tickets" icon={<Wrench className="w-5 h-5" style={{ color: '#ff385c' }} />} label="Tickets" hint={`${ops.openTickets} open`} />
        </div>
      </div>
    </div>
  );
}

function JumpCard({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
      {icon}
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: '#222' }}>{label}</p>
        <p className="text-xs" style={{ color: '#6a6a6a' }}>{hint}</p>
      </div>
      <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
    </Link>
  );
}
