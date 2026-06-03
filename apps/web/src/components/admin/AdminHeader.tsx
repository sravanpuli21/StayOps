'use client';

import Link from 'next/link';
import { ArrowLeft, UserCog } from 'lucide-react';
import { HOS_USERS, ROLE_META } from '@hos/shared';
import { useAdminAccess } from '@/lib/admin-access-context';

/**
 * Shared admin page header: back-to-console link + an "acting as" switcher so
 * the access hierarchy (Super Admin / Company Admin / Hotel Admin) can be
 * previewed. Real per-user auth replaces the switcher later.
 */
export function AdminHeader({ title, subtitle, backHref = '/web/admin' }: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  const { acting, setActingId } = useAdminAccess();
  const meta = ROLE_META[acting.role];

  // Offer one representative user per access level + the company admin + a hotel admin.
  const options = [
    HOS_USERS.find((u) => u.role === 'super_admin'),
    HOS_USERS.find((u) => u.role === 'company_admin'),
    HOS_USERS.find((u) => u.role === 'manager'),                 // multi-property
    HOS_USERS.find((u) => u.role === 'hotel_admin'),             // single-hotel default admin
  ].filter(Boolean) as typeof HOS_USERS;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {backHref && (
          <Link href={backHref} className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
            <ArrowLeft className="w-4 h-4" /> Console
          </Link>
        )}
        {/* Acting-as switcher */}
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <UserCog className="w-3.5 h-3.5" style={{ color: '#6a6a6a' }} />
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Acting as</span>
          <select
            value={acting.id}
            onChange={(e) => setActingId(e.target.value)}
            className="text-xs font-semibold bg-transparent outline-none cursor-pointer"
            style={{ color: '#222' }}
          >
            {options.map((u) => (
              <option key={u.id} value={u.id}>{u.name} · {ROLE_META[u.role].label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{title}</h1>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>
      {subtitle && <p className="text-sm -mt-1" style={{ color: '#929292' }}>{subtitle}</p>}
    </div>
  );
}
