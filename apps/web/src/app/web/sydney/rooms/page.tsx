'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Wrench, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { SYDNEY_HOTEL, useHotelRooms, useHotelTickets } from '@/lib/sydney-data';

const ROOM_TILE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
  inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting' },
  dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
  occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
  ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
  blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked' },
};

export default function SydneyRoomsPage() {
  const rooms = useHotelRooms();
  const tickets = useHotelTickets();
  const ticketsByRoom = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tickets) {
      if (t.roomNumber && t.status !== 'resolved') {
        m.set(t.roomNumber, (m.get(t.roomNumber) ?? 0) + 1);
      }
    }
    return m;
  }, [tickets]);

  const [filter, setFilter] = useState<'all' | 'hasTicket' | 'ooo' | 'blocked'>('all');
  const [openRoom, setOpenRoom] = useState<typeof rooms[number] | null>(null);

  const floors = useMemo(() => {
    const byFloor = new Map<number, typeof rooms>();
    for (const r of rooms) {
      if (!byFloor.has(r.floor)) byFloor.set(r.floor, []);
      byFloor.get(r.floor)!.push(r);
    }
    return Array.from(byFloor.entries()).sort((a, b) => b[0] - a[0]);
  }, [rooms]);

  const passFilter = (r: typeof rooms[number]) => {
    if (filter === 'all') return true;
    if (filter === 'hasTicket') return (ticketsByRoom.get(r.number) ?? 0) > 0;
    if (filter === 'ooo') return r.status === 'ooo';
    if (filter === 'blocked') return r.status === 'blocked';
    return true;
  };

  const counts = {
    all: rooms.length,
    hasTicket: rooms.filter((r) => (ticketsByRoom.get(r.number) ?? 0) > 0).length,
    ooo: rooms.filter((r) => r.status === 'ooo').length,
    blocked: rooms.filter((r) => r.status === 'blocked').length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Rooms — Maintenance View</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {rooms.length} rooms · {counts.hasTicket} with open tickets · {counts.ooo} OOO · {counts.blocked} blocked
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { k: 'all',        label: 'All rooms',    count: counts.all,        color: undefined  },
          { k: 'hasTicket',  label: 'With tickets', count: counts.hasTicket,  color: '#b91c1c' },
          { k: 'ooo',        label: 'Out of order', count: counts.ooo,        color: '#ef4444' },
          { k: 'blocked',    label: 'Blocked',      count: counts.blocked,    color: '#e11d48' },
        ] as const).map((t) => {
          const active = filter === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: active ? '#ff385c' : '#ffffff',
                color: active ? '#ffffff' : (t.color ?? '#6a6a6a'),
                border: active ? '1px solid #ff385c' : '1px solid #dddddd',
              }}
            >
              {t.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f0f0f0', color: active ? '#ffffff' : '#6a6a6a' }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 flex items-center gap-5 flex-wrap rounded-t-2xl" style={{ background: '#fafafa', border: '1px solid #dddddd' }}>
        <span className="text-xs font-semibold" style={{ color: '#929292' }}>Status:</span>
        {Object.entries(ROOM_TILE).map(([status, cfg]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
            {cfg.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
          <span className="w-3 h-3 rounded-full text-[8px] font-black text-white flex items-center justify-center" style={{ background: '#ff385c' }}>!</span>
          Ticket count
        </span>
      </div>

      {/* Floors */}
      <div className="px-5 py-5 rounded-b-2xl" style={{ background: '#ffffff', border: '1px solid #dddddd', borderTop: 'none' }}>
        {floors.map(([floor, rms]) => {
          const visible = rms.filter(passFilter);
          if (visible.length === 0) return null;
          return (
            <div key={floor} className="mb-5 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
                Floor {floor} · {visible.length} rooms
              </p>
              <div className="flex flex-wrap gap-2">
                {visible.sort((a, b) => a.number.localeCompare(b.number)).map((r) => {
                  const cfg = ROOM_TILE[r.status] ?? ROOM_TILE.occupied;
                  const tk = ticketsByRoom.get(r.number) ?? 0;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setOpenRoom(r)}
                      className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{ width: 64, height: 56, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                      title={`Room ${r.number} · ${cfg.label}${r.oooReason ? ` (${r.oooReason})` : ''}${tk ? ` · ${tk} open ticket${tk === 1 ? '' : 's'}` : ''}`}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{r.number}</span>
                      {tk > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                          style={{ background: '#ff385c', fontSize: '9px' }}
                        >
                          {tk}
                        </span>
                      )}
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openRoom && (
        <RoomDetailModal
          room={openRoom}
          tickets={tickets.filter((t) => t.roomNumber === openRoom.number && t.status !== 'resolved')}
          onClose={() => setOpenRoom(null)}
        />
      )}
    </div>
  );
}

function RoomDetailModal({
  room, tickets, onClose,
}: { room: any; tickets: any[]; onClose: () => void }) {
  const cfg = ROOM_TILE[room.status] ?? ROOM_TILE.occupied;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[85vh]" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: 48, height: 44, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
              <span className="text-sm font-bold" style={{ color: '#222' }}>{room.number}</span>
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#222' }}>Room {room.number}</h2>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Floor {room.floor} · {cfg.label}{room.type ? ` · ${room.type}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222] flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          {room.oooReason && (
            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
              <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: '#b91c1c' }}>Out of order</p>
                <p className="text-xs mt-0.5" style={{ color: '#3f3f3f' }}>{room.oooReason}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
              Open tickets · {tickets.length}
            </p>
            {tickets.length === 0 ? (
              <p className="text-sm" style={{ color: '#15803d' }}>No open maintenance tickets for this room.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-lg px-3 py-2" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {t.priority === 'urgent' && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>Urgent</span>}
                      <span className="text-[10px] uppercase font-semibold capitalize" style={{ color: '#929292' }}>{t.type}</span>
                    </div>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#222' }}>{t.title}</p>
                    {t.assignedTo && <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>→ {t.assignedTo}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          <Link
            href={`/web/sydney/tickets`}
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: '#ff385c' }}
          >
            View all tickets <ChevronRight className="w-3 h-3" />
          </Link>
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
