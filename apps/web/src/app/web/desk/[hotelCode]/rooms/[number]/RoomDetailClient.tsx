'use client';

import Link from 'next/link';
import { ChevronLeft, Plus, AlertTriangle } from 'lucide-react';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TILE_CFG, statusFromType } from '@/components/operations/_constants';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from '@/components/operations/OpsBadges';

interface Props {
  hotelCode:  string;
  roomNumber: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.max(1, Math.floor((diff % 3600000) / 60000))}m ago`;
}

export function RoomDetailClient({ hotelCode, roomNumber }: Props) {
  const { data: roomsData }   = useApi(apiKeys.opsPropertyRooms(hotelCode));
  const { data: ticketsData } = useApi(apiKeys.opsTickets(hotelCode));

  const room = roomsData?.rooms.find((r) => r.roomNumber === roomNumber) ?? null;
  const tickets = (ticketsData?.tickets as MaintenanceTicket[] | undefined) ?? [];
  const roomTickets = tickets.filter((t) => t.roomNumber === roomNumber);
  const open       = roomTickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved');
  const history    = roomTickets.filter((t) => t.status === 'closed' || t.status === 'resolved');

  const openByDept = (dept: string) => open.filter((t) => t.department === dept);
  const guestReqs        = open.filter((t) => t.department === 'Front Desk' || (t.callbackRequired && t.department !== 'Maintenance' && t.department !== 'Housekeeping'));
  const housekeepingOpen = openByDept('Housekeeping');
  const maintenanceOpen  = openByDept('Maintenance');

  const cfg = room ? TILE_CFG[statusFromType(room.type)] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href={`/web/desk/${hotelCode}/rooms`}
        className="flex items-center gap-1 text-sm font-semibold mb-2 hover:underline"
        style={{ color: '#ff385c' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Rooms
      </Link>

      {/* Header */}
      {room ? (
        <div className="flex items-start gap-4">
          <div
            className="rounded-xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ width: 80, height: 70, background: cfg?.bg, border: `1.5px solid ${cfg?.border}` }}
          >
            <span className="text-base font-bold" style={{ color: '#222' }}>{room.roomNumber}</span>
            <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: cfg?.dot }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#222' }}>Room {room.roomNumber}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
              Floor {room.floor} · {room.type} · OnQ status: {room.rawOccStatus ?? 'n/a'} / {room.rawReservationStatus ?? 'no reservation'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>
              Snapshot: {new Date(room.capturedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
          No snapshot for room {roomNumber}. Upload an OnQ room-details CSV to populate this room.
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/web/desk/${hotelCode}/requests/new?room=${encodeURIComponent(roomNumber)}`}
          className="rounded-2xl p-5 flex items-start gap-3 hover:bg-[#fafafa] transition-colors"
          style={{ background: '#ffffff', border: '1px solid #dddddd' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa' }}>
            <Plus className="w-5 h-5" style={{ color: '#ff385c' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>New Guest Request</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>Pre-filled for Room {roomNumber}</p>
          </div>
        </Link>
        <Link
          href={`/web/desk/${hotelCode}/requests/new?room=${encodeURIComponent(roomNumber)}&source=room-issue`}
          className="rounded-2xl p-5 flex items-start gap-3 hover:bg-[#fafafa] transition-colors"
          style={{ background: '#ffffff', border: '1px solid #dddddd' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#d97706' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>Report Room Issue</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>Internal — no callback by default</p>
          </div>
        </Link>
      </div>

      {/* Open requests / issues, grouped */}
      <Section title="Open guest requests" tickets={guestReqs} hotelCode={hotelCode} emptyMsg="None" />
      <Section title="Open maintenance" tickets={maintenanceOpen} hotelCode={hotelCode} emptyMsg="None" />
      <Section title="Open housekeeping" tickets={housekeepingOpen} hotelCode={hotelCode} emptyMsg="None" />

      {/* History */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>History</h2>
        {history.length === 0 ? (
          <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
            No closed requests for this room yet.
          </div>
        ) : (
          <TicketTable tickets={history} hotelCode={hotelCode} />
        )}
      </section>
    </div>
  );
}

function Section({
  title, tickets, hotelCode, emptyMsg,
}: { title: string; tickets: MaintenanceTicket[]; hotelCode: string; emptyMsg: string }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
        {title} ({tickets.length})
      </h2>
      {tickets.length === 0 ? (
        <div className="rounded-2xl px-6 py-6 text-sm" style={{ border: '1px solid #dddddd', color: '#929292' }}>
          {emptyMsg}
        </div>
      ) : (
        <TicketTable tickets={tickets} hotelCode={hotelCode} />
      )}
    </section>
  );
}

function TicketTable({ tickets, hotelCode }: { tickets: MaintenanceTicket[]; hotelCode: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Issue</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Department</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={`${t.id}-${i}`} style={{ borderBottom: i < tickets.length - 1 ? '1px solid #f0f0f0' : undefined }}>
              <td className="px-4 py-3"><TicketTypeBadge type={t.type} /></td>
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
              <td className="px-4 py-3 text-xs" style={{ color: '#929292' }}>{timeAgo(t.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
