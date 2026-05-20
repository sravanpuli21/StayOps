'use client';

import { useRouter } from 'next/navigation';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TILE_CFG, statusFromType } from '@/components/operations/_constants';

interface Props { hotelCode: string }

export function RoomsClient({ hotelCode }: Props) {
  const router = useRouter();
  const { data: roomsData }   = useApi(apiKeys.opsPropertyRooms(hotelCode));
  const { data: ticketsData } = useApi(apiKeys.opsTickets(hotelCode));

  const apiRooms = roomsData?.rooms ?? [];
  const tickets  = (ticketsData?.tickets as MaintenanceTicket[] | undefined) ?? [];
  const openTickets = tickets.filter((t) => t.status !== 'resolved');

  // Group by floor descending.
  type Tile = { roomNumber: string; floor: number; type: string; status: ReturnType<typeof statusFromType> };
  const tiles: Tile[] = apiRooms.map((r) => ({
    roomNumber: r.roomNumber,
    floor:      r.floor,
    type:       r.type,
    status:     statusFromType(r.type),
  }));
  const floorMap: Record<number, Tile[]> = {};
  for (const t of tiles) {
    if (!floorMap[t.floor]) floorMap[t.floor] = [];
    floorMap[t.floor].push(t);
  }
  const floors = Object.keys(floorMap).map(Number).sort((a, b) => b - a);

  const ticketsByRoom: Record<string, number> = {};
  for (const t of openTickets) {
    if (t.roomNumber) ticketsByRoom[t.roomNumber] = (ticketsByRoom[t.roomNumber] ?? 0) + 1;
  }

  const handleTileClick = (roomNumber: string) => {
    router.push(`/web/desk/${hotelCode}/rooms/${encodeURIComponent(roomNumber)}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Room Grid</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Click any room to log a ticket pre-filled for that room
        </p>
      </div>

      <div>
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
          {floors.length === 0 ? (
            <p className="text-sm italic text-center py-8" style={{ color: '#929292' }}>
              No rooms loaded yet — upload an OnQ room-details CSV to populate this grid.
            </p>
          ) : floors.map((floor) => (
            <div key={floor} className="mb-6 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Floor {floor}</p>
              <div className="flex flex-wrap gap-2">
                {floorMap[floor].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map((t) => {
                  const cfg = TILE_CFG[t.status] ?? TILE_CFG.occupied;
                  const ticketCount = ticketsByRoom[t.roomNumber] ?? 0;
                  return (
                    <button
                      key={t.roomNumber}
                      onClick={() => handleTileClick(t.roomNumber)}
                      title={`Room ${t.roomNumber} · ${cfg.label}${ticketCount ? ` · ${ticketCount} open ticket${ticketCount === 1 ? '' : 's'}` : ''}`}
                      className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{
                        width: 64, height: 56,
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{t.roomNumber}</span>
                      {ticketCount > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                          style={{ background: '#ff385c', fontSize: '9px' }}
                        >{ticketCount}</span>
                      )}
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
