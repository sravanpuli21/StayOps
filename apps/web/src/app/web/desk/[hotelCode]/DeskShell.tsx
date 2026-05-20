'use client';

import { LeftNav } from '@/components/shell/LeftNav';
import type { NavItem } from '@/lib/constants';

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
 * Front-desk shell — same chrome as the regional / MD personas (LeftNav +
 * TopBar), with two key differences:
 *   1. Nav items are scoped to the hotel via the URL segment, so every link
 *      stays under /web/desk/<hotelCode>/…
 *   2. The TopBar is a stripped-down inline header that shows the hotel name
 *      instead of the global hotel/date filters.
 */
export function DeskShell({
  hotelCode, hotelName, hotelCity, hotelState, hotelBrand, hotelRooms, children,
}: Props) {
  const navItems: readonly NavItem[] = [
    { label: 'Home',       href: `/web/desk/${hotelCode}/home`,       icon: 'LayoutDashboard' },
    { label: 'Rooms',      href: `/web/desk/${hotelCode}/rooms`,      icon: 'Bed'             },
    { label: 'Requests',   href: `/web/desk/${hotelCode}/requests`,   icon: 'ClipboardList'   },
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
          <p className="ml-auto text-xs" style={{ color: '#929292' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
