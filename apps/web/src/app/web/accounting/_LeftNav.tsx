'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Inbox, CheckCheck, ArrowLeftRight, Users,
  ListTree, Wand2, BarChart3, CalendarCheck, FolderOpen, Lightbulb,
  Shield, Settings, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { useAcctOs } from './_context';

/** New Statement-to-Books navigation. Banking & Credit Cards are no longer
 *  primary items — they live under Hotel Entities setup + the Statement Inbox. */
const ITEMS = [
  { label: 'Dashboard', href: '/web/accounting/dashboard', icon: LayoutDashboard },
  { label: 'Hotel Entities', href: '/web/accounting/entities', icon: Building2 },
  { label: 'Statement Inbox', href: '/web/accounting/statements', icon: Inbox },
  { label: 'Reconciliation Workbench', href: '/web/accounting/reconciliation-workbench', icon: CheckCheck },
  { label: 'Transactions', href: '/web/accounting/transactions', icon: ArrowLeftRight },
  { label: 'Vendors', href: '/web/accounting/vendors', icon: Users },
  { label: 'Chart of Accounts', href: '/web/accounting/chart-of-accounts', icon: ListTree },
  { label: 'Rules', href: '/web/accounting/rules', icon: Wand2 },
  { label: 'Reports', href: '/web/accounting/reports', icon: BarChart3 },
  { label: 'Month Close', href: '/web/accounting/month-close', icon: CalendarCheck },
  { label: 'Documents', href: '/web/accounting/documents', icon: FolderOpen },
  { label: 'Insights', href: '/web/accounting/insights', icon: Lightbulb },
  { label: 'Admin', href: '/web/accounting/admin', icon: Shield },
  { label: 'Settings', href: '/web/accounting/settings', icon: Settings },
];

export function AcctLeftNav() {
  const pathname = usePathname() ?? '';
  const { navCollapsed, toggleNav } = useAcctOs();
  const w = navCollapsed ? 60 : 232;

  return (
    <aside className="flex flex-col flex-shrink-0 h-full" style={{ width: w, background: '#fff', borderRight: '1px solid #dddddd', transition: 'width 0.15s' }}>
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {ITEMS.map((it) => {
          const active = pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} title={navCollapsed ? it.label : undefined}
              className="group flex items-center gap-3 h-9 px-2.5 rounded-lg text-sm relative"
              style={{ background: active ? '#f0eefb' : 'transparent', color: active ? '#6a4ec0' : '#3f3f3f', fontWeight: active ? 700 : 500 }}>
              <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? '#6a4ec0' : '#6a6a6a' }} />
              {!navCollapsed && <span className="truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
      <button onClick={toggleNav} className="flex items-center gap-2 h-11 px-3.5 text-xs font-semibold" style={{ borderTop: '1px solid #f0f0f0', color: '#6a6a6a' }}>
        {navCollapsed ? <PanelLeft className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Collapse</>}
      </button>
    </aside>
  );
}
