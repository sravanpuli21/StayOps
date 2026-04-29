'use client';

import { useMemo } from 'react';
import { HOTELS } from '@hos/shared';
import { getRoomsForHotel, getRoomAuditSummary } from '@hos/shared';
import type { AuditComplianceStatus } from '@hos/shared';
import { ChevronLeft } from 'lucide-react';

interface Props {
  hotelId: string;
  onBack: () => void;
  onRoomClick: (roomNumber: string) => void;
}

const TILE_CFG: Record<AuditComplianceStatus, { bg: string; border: string; dot: string; label: string }> = {
  overdue:  { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'Overdue' },
  due_soon: { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Due Soon' },
  current:  { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Current' },
};

export function HotelAuditView({ hotelId, onBack, onRoomClick }: Props) {
  const hotel = HOTELS.find((h) => h.id === hotelId)!;

  const roomData = useMemo(() => {
    const rooms = getRoomsForHotel(hotelId);
    return rooms.map((room) => {
      const summary = getRoomAuditSummary(hotelId, room.number);
      return { room, summary };
    });
  }, [hotelId]);

  const floors = useMemo(() => {
    const map = new Map<number, typeof roomData>();
    for (const rd of roomData) {
      const f = rd.room.floor;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(rd);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [roomData]);

  const overdue = roomData.filter((r) => r.summary.worstStatus === 'overdue').length;
  const dueSoon = roomData.filter((r) => r.summary.worstStatus === 'due_soon').length;
  const current = roomData.filter((r) => r.summary.worstStatus === 'current').length;

  return (
    <div className="flex flex-col h-full">
      {/* Hotel header */}
      <div
        className="px-8 py-5 flex items-center gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #dddddd', background: '#ffffff' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: '#ff385c' }}
        >
          <ChevronLeft className="w-4 h-4" />
          All Properties
        </button>
        <div className="w-px h-5" style={{ background: '#dddddd' }} />
        <div>
          <p className="text-base font-bold" style={{ color: '#222222' }}>{hotel.name}</p>
          <p className="text-xs" style={{ color: '#929292' }}>{hotel.brand} · {hotel.city}, {hotel.state} · {hotel.rooms} rooms</p>
        </div>

        {/* Status pills */}
        <div className="ml-auto flex items-center gap-2">
          {[
            { label: 'Overdue', count: overdue, color: '#b91c1c', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Due Soon', count: dueSoon, color: '#b45309', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Current', count: current, color: '#15803d', bg: 'rgba(34,197,94,0.08)' },
          ].map((p) => (
            <span
              key={p.label}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: p.bg, color: p.color }}
            >
              {p.count} {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="px-8 py-2.5 flex items-center gap-5 flex-shrink-0"
        style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
      >
        <span className="text-xs font-semibold" style={{ color: '#929292' }}>Room compliance:</span>
        {Object.entries(TILE_CFG).map(([status, cfg]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
            {cfg.label}
          </span>
        ))}
        <span className="text-xs" style={{ color: '#929292' }}>· Click room to drill in</span>
      </div>

      {/* Room grid */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {floors.map(([floor, rooms]) => (
          <div key={floor} className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
              Floor {floor}
            </p>
            <div className="flex flex-wrap gap-2">
              {rooms.map(({ room, summary }) => {
                const cfg = TILE_CFG[summary.worstStatus];
                return (
                  <button
                    key={room.number}
                    onClick={() => onRoomClick(room.number)}
                    className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md group"
                    style={{
                      width: 64, height: 56,
                      background: cfg.bg,
                      border: `1.5px solid ${cfg.border}`,
                    }}
                    title={`Room ${room.number} · ${cfg.label} · ${summary.overdueCount} overdue areas`}
                  >
                    <span className="text-xs font-bold" style={{ color: '#222222' }}>{room.number}</span>
                    {summary.overdueCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                        style={{ background: '#ef4444', fontSize: '9px' }}
                      >
                        {summary.overdueCount}
                      </span>
                    )}
                    {summary.worstStatus !== 'overdue' && summary.dueSoonCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                        style={{ background: '#f59e0b', fontSize: '9px' }}
                      >
                        {summary.dueSoonCount}
                      </span>
                    )}
                    {/* Dot indicator */}
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
  );
}
