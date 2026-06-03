'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, ShieldCheck, Users, CreditCard,
  Activity, Upload, Inbox, UserCog, Lock,
} from 'lucide-react';
import { HOS_USERS, ROLE_META } from '@hos/shared';
import { useAdminAccess } from '@/lib/admin-access-context';

interface NavItem { label: string; href: string; icon: typeof Building2; ready?: boolean }

const NAV: NavItem[] = [
  { label: 'Overview',        href: '/web/admin',           icon: LayoutDashboard },
  { label: 'Hotels',          href: '/web/admin/hotels',    icon: Building2 },
  { label: 'Hotel Admins',    href: '/web/admin/admins',    icon: ShieldCheck },
  { label: 'Company Users',   href: '/web/admin/users',     icon: Users },
  { label: 'Payments',        href: '/web/admin/payments',  icon: CreditCard },
  { label: 'System Health',   href: '/web/admin/health',    icon: Activity },
  { label: 'Uploads',         href: '/web/admin/uploads',   icon: Upload },
  { label: 'Email Ingestion', href: '/web/admin/ingestion', icon: Inbox },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { acting, setActingId } = useAdminAccess();

  const actingOptions = [
    HOS_USERS.find((u) => u.role === 'super_admin'),
    HOS_USERS.find((u) => u.role === 'company_admin'),
    HOS_USERS.find((u) => u.role === 'regional_manager'),
    HOS_USERS.find((u) => u.role === 'general_manager'),
  ].filter(Boolean) as typeof HOS_USERS;

  const isActive = (href: string) =>
    href === '/web/admin' ? pathname === '/web/admin' : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      {/* Left nav */}
      <aside className="w-60 h-full flex flex-col flex-shrink-0" style={{ background: '#fff', borderRight: '1px solid #dddddd' }}>
        <div className="h-16 flex items-center px-5 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ff385c' }}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#222' }}>Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            if (item.ready === false) {
              return (
                <div key={item.href} className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium" style={{ color: '#c1c1c1', cursor: 'not-allowed' }} title="Coming soon">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <Lock className="w-3 h-3" />
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{ color: active ? '#ff385c' : '#6a6a6a', background: active ? 'rgba(255,56,92,0.08)' : undefined }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid #dddddd' }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>Acting as</p>
          <select
            value={acting.id}
            onChange={(e) => setActingId(e.target.value)}
            className="w-full text-xs font-semibold rounded-lg px-2 py-1.5 outline-none cursor-pointer"
            style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}
          >
            {actingOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.name} · {ROLE_META[u.role].label}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
