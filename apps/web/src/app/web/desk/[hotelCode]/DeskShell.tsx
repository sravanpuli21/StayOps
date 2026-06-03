'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { LeftNav } from '@/components/shell/LeftNav';
import type { NavItem } from '@/lib/constants';
import { QuickPunchModal } from './QuickPunchModal';
import { flushQueue, pendingCount } from './punch-queue';

interface Props {
  hotelCode:  string;
  hotelName:  string;
  hotelCity:  string;
  hotelState: string;
  hotelBrand: string;
  hotelRooms: number;
  children:   React.ReactNode;
}

/**
 * Front-desk shell. Shared kiosk with NO login — the tools (Rooms, Requests,
 * Tickets, Callbacks…) are open all day in the left nav. The only "who are you"
 * is the Punch action, which stamps the right person's timecard:
 *   • An always-visible Punch In/Out button (header) opens a quick modal where any
 *     employee enters their own username + password to clock in/out.
 *   • Punches are offline-resilient — saved on the device and synced when the
 *     network returns (see ./punch-queue).
 */
export function DeskShell({
  hotelCode, hotelName, hotelCity, hotelState, hotelBrand, hotelRooms, children,
}: Props) {
  const [punchOpen, setPunchOpen] = useState(false);
  const [pending, setPending]     = useState(0);

  // Flush any device-queued punches when we come back online + periodically.
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await flushQueue(hotelCode);
      if (!cancelled) setPending(pendingCount(hotelCode));
    };
    setPending(pendingCount(hotelCode));
    sync();
    const onOnline = () => sync();
    window.addEventListener('online', onOnline);
    const interval = setInterval(sync, 30_000);
    return () => { cancelled = true; window.removeEventListener('online', onOnline); clearInterval(interval); };
  }, [hotelCode, punchOpen]);

  const navItems: readonly NavItem[] = [
    { label: 'Home',       href: `/web/desk/${hotelCode}/home`,       icon: 'LayoutDashboard' },
    { label: 'Rooms',      href: `/web/desk/${hotelCode}/rooms`,      icon: 'Bed'             },
    { label: 'Requests',   href: `/web/desk/${hotelCode}/requests`,   icon: 'ClipboardList'   },
    { label: 'Active Tickets', href: `/web/desk/${hotelCode}/tickets`, icon: 'Wrench'         },
    { label: 'Callbacks',  href: `/web/desk/${hotelCode}/callbacks`,  icon: 'Bell'            },
    { label: 'Punch In/Out', href: `/web/desk/${hotelCode}/punch`,    icon: 'Clock'           },
    { label: 'More',       href: `/web/desk/${hotelCode}/more`,       icon: 'Settings'        },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      <LeftNav
        navItems={navItems}
        footerName="Front Desk"
        footerTitle={hotelName}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header
          className="no-print h-14 flex items-center px-6 flex-shrink-0"
          style={{ background: '#ffffff', borderBottom: '1px solid #dddddd' }}
        >
          <p className="text-sm" style={{ color: '#929292' }}>
            <span className="font-medium" style={{ color: '#222' }}>{hotelName}</span>
            <span className="ml-2">{hotelCity}, {hotelState} · {hotelBrand} · {hotelRooms} rooms</span>
          </p>
          <div className="ml-auto flex items-center gap-4">
            {pending > 0 && (
              <span
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-semibold"
                style={{ background: '#fff7ed', color: '#9a3412' }}
                title="Punches saved on this computer, waiting for internet to sync"
              >
                {pending} punch{pending === 1 ? '' : 'es'} waiting to sync
              </span>
            )}
            {/* Always-visible quick punch — any employee can clock in/out. */}
            <button
              onClick={() => setPunchOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold"
              style={{ background: '#ff385c', color: '#fff' }}
              title="Punch in / out — any employee"
            >
              <Clock className="w-4 h-4" /> Punch In/Out
            </button>
            <p className="text-xs hidden md:block" style={{ color: '#929292' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {punchOpen && <QuickPunchModal hotelCode={hotelCode} onClose={() => setPunchOpen(false)} />}
    </div>
  );
}
