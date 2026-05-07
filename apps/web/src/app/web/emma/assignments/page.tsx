'use client';

import { useMemo, useState } from 'react';
import type { Room } from '@hos/shared';
import {
  EMMA_HOTEL, getHkStaff, getAllHotelRooms, getQueueRooms, seedAssignments, autoAssignRooms, ROOM_TILE,
} from '@/lib/emma-data';
import { CheckCircle2, Circle, Sparkles, UserPlus, X, Printer, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
  roomNumber: string;
  assignees: string[];
}
type RoomProgress = 'pending' | 'cleaning' | 'cleaned' | 'inspected';

const PROGRESS_META: Record<RoomProgress, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',    bg: '#f3f4f6', color: '#6a6a6a' },
  cleaning:  { label: 'Cleaning',   bg: '#fffbeb', color: '#b45309' },
  cleaned:   { label: 'Cleaned',    bg: '#eff6ff', color: '#1d4ed8' },
  inspected: { label: 'Inspected',  bg: '#f0fdf4', color: '#15803d' },
};

const PROGRESS_CYCLE: RoomProgress[] = ['pending', 'cleaning', 'cleaned', 'inspected'];

export default function EmmaAssignmentsPage() {
  const hotel = EMMA_HOTEL;
  const hkStaff = useMemo(() => getHkStaff(), []);
  const allRooms = useMemo(() => getAllHotelRooms(), []);
  const queueRooms = useMemo(() => getQueueRooms(), []);
  const roomByNumber = useMemo(() => {
    const m = new Map<string, Room>();
    for (const r of allRooms) m.set(r.number, r);
    return m;
  }, [allRooms]);

  const [assignments, setAssignments] = useState<Assignment[]>(() => seedAssignments());
  const [progress, setProgress] = useState<Record<string, RoomProgress>>(() => {
    // Seed first few as "cleaning" to make the page feel live
    const seed: Record<string, RoomProgress> = {};
    seedAssignments().slice(0, 4).forEach((a, i) => {
      seed[a.roomNumber] = i < 2 ? 'cleaned' : 'cleaning';
    });
    return seed;
  });

  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const assignmentMap = useMemo(() => {
    const m = new Map<string, Assignment>();
    for (const a of assignments) m.set(a.roomNumber, a);
    return m;
  }, [assignments]);

  const unassigned = queueRooms.filter((r) => !assignmentMap.has(r.number));

  const assignedByStaff = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of assignments) {
      for (const id of a.assignees) {
        if (!m.has(id)) m.set(id, []);
        m.get(id)!.push(a.roomNumber);
      }
    }
    return m;
  }, [assignments]);

  const assignToStaff = (roomNumber: string, employeeId: string) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.roomNumber === roomNumber);
      if (!existing) return [...prev, { roomNumber, assignees: [employeeId] }];
      if (existing.assignees.includes(employeeId) || existing.assignees.length >= 2) return prev;
      return prev.map((a) => a.roomNumber === roomNumber ? { ...a, assignees: [...a.assignees, employeeId] } : a);
    });
    setSelectedRoom(null);
  };

  const removeAssignee = (roomNumber: string, employeeId: string) => {
    setAssignments((prev) => {
      const a = prev.find((x) => x.roomNumber === roomNumber);
      if (!a) return prev;
      const next = a.assignees.filter((id) => id !== employeeId);
      if (next.length === 0) return prev.filter((x) => x.roomNumber !== roomNumber);
      return prev.map((x) => x.roomNumber === roomNumber ? { ...x, assignees: next } : x);
    });
  };

  const autoAssign = () => {
    const taken = new Set(assignments.map((a) => a.roomNumber));
    const toFill = queueRooms.filter((r) => !taken.has(r.number)).map((r) => r.number);
    setAssignments(autoAssignRooms(assignments, toFill));
  };

  const cycleProgress = (roomNumber: string) => {
    setProgress((p) => {
      const current = p[roomNumber] ?? 'pending';
      const next = PROGRESS_CYCLE[(PROGRESS_CYCLE.indexOf(current) + 1) % PROGRESS_CYCLE.length];
      return { ...p, [roomNumber]: next };
    });
  };

  // Filters
  const filteredRoomsByStaff = useMemo(() => {
    const filter = (room: string) => {
      const r = roomByNumber.get(room);
      if (!r) return false;
      if (floorFilter !== 'all' && r.floor !== Number(floorFilter)) return false;
      return true;
    };
    const m = new Map<string, string[]>();
    for (const [id, rooms] of assignedByStaff) {
      if (staffFilter !== 'all' && id !== staffFilter) continue;
      m.set(id, rooms.filter(filter));
    }
    return m;
  }, [assignedByStaff, staffFilter, floorFilter, roomByNumber]);

  const floors = Array.from(new Set(queueRooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Staff completion stats
  const staffStats = hkStaff.map((emp) => {
    const rooms = assignedByStaff.get(emp.id) ?? [];
    const done = rooms.filter((rn) => {
      const p = progress[rn];
      return p === 'cleaned' || p === 'inspected';
    }).length;
    return { emp, total: rooms.length, done };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Assignments</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {hotel.shortName} · {assignments.length} of {queueRooms.length} rooms assigned · {Object.keys(progress).length} in progress
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={autoAssign}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-assign remaining
          </button>
          <Link
            href="/web/emma/print"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Link>
        </div>
      </div>

      {/* Staff completion bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {staffStats.map(({ emp, total, done }) => {
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <button
              key={emp.id}
              onClick={() => setStaffFilter(staffFilter === emp.id ? 'all' : emp.id)}
              className="rounded-2xl p-4 text-left transition-colors"
              style={{
                background: staffFilter === emp.id ? '#fff1f3' : '#ffffff',
                border: staffFilter === emp.id ? '1.5px solid #ff385c' : '1px solid #dddddd',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: '#428bff', color: '#ffffff' }}>
                  {emp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                  <p className="text-[10px] truncate" style={{ color: '#929292' }}>{emp.role}</p>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Done</span>
                <span className="text-xs font-bold" style={{ color: pct >= 75 ? '#15803d' : pct >= 40 ? '#b45309' : '#6a6a6a' }}>
                  {done} / {total} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 75 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#d1d5db' }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 text-xs" style={{ color: '#6a6a6a' }}>
          <Filter className="w-3.5 h-3.5" /> Filter
        </div>
        <div className="inline-flex rounded-xl p-1" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <button onClick={() => setStaffFilter('all')} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: staffFilter === 'all' ? '#ffffff' : 'transparent', color: staffFilter === 'all' ? '#222' : '#6a6a6a' }}>
            All staff
          </button>
          {hkStaff.map((e) => (
            <button key={e.id} onClick={() => setStaffFilter(e.id)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: staffFilter === e.id ? '#ffffff' : 'transparent', color: staffFilter === e.id ? '#222' : '#6a6a6a' }}>
              {e.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="h-8 px-3 rounded-lg text-xs font-semibold outline-none"
          style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
        >
          <option value="all">All floors</option>
          {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
        </select>
      </div>

      {/* Layout: unassigned + staff columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* Unassigned queue */}
        <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
            Unassigned · {unassigned.length}
          </p>
          {unassigned.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#16a34a' }} />
              <p className="text-xs font-semibold" style={{ color: '#15803d' }}>Everything assigned</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[700px] overflow-y-auto pr-1">
              {unassigned.map((r) => {
                const isSelected = selectedRoom === r.number;
                return (
                  <button
                    key={r.number}
                    onClick={() => setSelectedRoom(isSelected ? null : r.number)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left"
                    style={{
                      background: isSelected ? '#fff1f3' : '#fafafa',
                      border: isSelected ? '1.5px solid #ff385c' : '1px solid #f0f0f0',
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ROOM_TILE[r.status].bg, border: `1px solid ${ROOM_TILE[r.status].border}` }}>
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{r.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#222' }}>Room {r.number}</p>
                      <p className="text-[11px]" style={{ color: '#6a6a6a' }}>Floor {r.floor} · {r.type} · {ROOM_TILE[r.status].label}</p>
                    </div>
                    {isSelected && <span className="text-[10px] font-bold" style={{ color: '#ff385c' }}>PICK →</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Staff checklist columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {hkStaff
            .filter((e) => staffFilter === 'all' || e.id === staffFilter)
            .map((emp) => {
              const rooms = filteredRoomsByStaff.get(emp.id) ?? [];
              const isPickable = !!selectedRoom;
              return (
                <div
                  key={emp.id}
                  onClick={() => isPickable && assignToStaff(selectedRoom!, emp.id)}
                  className="rounded-2xl flex flex-col min-h-[300px]"
                  style={{
                    background: '#ffffff',
                    border: isPickable ? '1.5px dashed #ff385c' : '1px solid #dddddd',
                    cursor: isPickable ? 'pointer' : 'default',
                  }}
                >
                  <div className="flex items-center gap-2 p-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#428bff', color: '#ffffff' }}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                      <p className="text-[10px] truncate" style={{ color: '#929292' }}>
                        {emp.role} · {rooms.length} room{rooms.length === 1 ? '' : 's'}
                        {(() => {
                          const fs = Array.from(new Set(rooms.map((rn) => roomByNumber.get(rn)?.floor).filter((f): f is number => f !== undefined))).sort();
                          if (fs.length === 0) return null;
                          return <span> · F{fs.join(',')}</span>;
                        })()}
                      </p>
                    </div>
                  </div>
                  {rooms.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] italic p-4" style={{ color: '#c1c1c1' }}>
                      {isPickable ? 'Click to assign here' : staffFilter === 'all' ? 'No rooms yet' : 'No rooms match filter'}
                    </div>
                  ) : (
                    <div className="flex flex-col p-2">
                      {rooms.map((roomNumber) => {
                        const room = roomByNumber.get(roomNumber);
                        const isTeam = (assignmentMap.get(roomNumber)?.assignees.length ?? 0) === 2;
                        const p = progress[roomNumber] ?? 'pending';
                        const pmeta = PROGRESS_META[p];
                        return (
                          <div
                            key={roomNumber}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                            style={{ background: p !== 'pending' ? pmeta.bg : 'transparent' }}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); cycleProgress(roomNumber); }}
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: '#ffffff', border: `1.5px solid ${pmeta.color}` }}
                              title={`Mark ${p === 'inspected' ? 'pending' : PROGRESS_CYCLE[(PROGRESS_CYCLE.indexOf(p) + 1) % PROGRESS_CYCLE.length]}`}
                            >
                              {p === 'inspected' || p === 'cleaned' ? (
                                <CheckCircle2 className="w-3 h-3" style={{ color: pmeta.color }} />
                              ) : p === 'cleaning' ? (
                                <div className="w-2 h-2 rounded-full" style={{ background: pmeta.color }} />
                              ) : (
                                <Circle className="w-3 h-3" style={{ color: '#c1c1c1' }} />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold" style={{ color: '#222', textDecoration: p === 'inspected' ? 'line-through' : 'none' }}>
                                Room {roomNumber} {isTeam && <UserPlus className="w-2.5 h-2.5 inline ml-0.5" style={{ color: '#1d4ed8' }} />}
                              </p>
                              <p className="text-[10px]" style={{ color: '#929292' }}>
                                F{room?.floor} · {room?.type} · <span style={{ color: pmeta.color, fontWeight: 700 }}>{pmeta.label}</span>
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeAssignee(roomNumber, emp.id); }}
                              className="w-5 h-5 rounded flex items-center justify-center opacity-40 hover:opacity-100"
                              title="Unassign"
                            >
                              <X className="w-3 h-3" style={{ color: '#929292' }} />
                            </button>
                          </div>
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
  );
}
