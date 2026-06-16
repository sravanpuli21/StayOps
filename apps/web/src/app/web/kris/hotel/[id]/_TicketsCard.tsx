'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { MaintenanceTicket } from '@hos/shared';
import { TicketDetailPanel } from '@/components/operations/TicketDetailPanel';

const PRIORITY_COLOR: Record<string, string> = { urgent: '#dc2626', high: '#d97706', normal: '#2563eb' };

/** Active-tickets card for Kris's hotel detail. Clicking a ticket opens its full
 *  detail (description, room, status, activity timeline) in a slide-over. */
export function TicketsCard({ tickets }: { tickets: MaintenanceTicket[] }) {
  const [open, setOpen] = useState<MaintenanceTicket | null>(null);
  if (tickets.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Active Tickets ({tickets.length})</h2>
        <Link href="/web/kris/operations" className="text-xs font-semibold" style={{ color: '#ff385c' }}>View all →</Link>
      </div>
      <div className="flex flex-col gap-2">
        {tickets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpen(t)}
            className="flex items-start gap-3 bg-white rounded-xl p-4 text-left w-full hover:border-[#ff385c] transition-colors"
            style={{ border: '1px solid #dddddd' }}
          >
            <div className="w-1 self-stretch rounded-full" style={{ background: PRIORITY_COLOR[t.priority] ?? '#6a6a6a' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold" style={{ color: '#929292' }}>{t.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ color: PRIORITY_COLOR[t.priority] ?? '#6a6a6a', background: (PRIORITY_COLOR[t.priority] ?? '#6a6a6a') + '18' }}>{t.priority}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: '#6a6a6a', background: '#f0f0f0' }}>{t.type}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: '#222' }}>{t.title}</p>
              <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{t.roomNumber ? `Room ${t.roomNumber} · ` : ''}{t.status.replace('_', ' ')}</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#c1c1c1' }} />
          </button>
        ))}
      </div>
      <TicketDetailPanel ticket={open} onClose={() => setOpen(null)} />
    </div>
  );
}
