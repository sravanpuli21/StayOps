'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, Inbox, Building2, Users, Activity, Building, ShieldCheck, CreditCard, Lock, UserCog } from 'lucide-react';
import { HOS_USERS, ROLE_META, canViewSensitive } from '@hos/shared';
import { useAdminAccess } from '@/lib/admin-access-context';
import { LogoUpload } from '@/components/admin/LogoUpload';

interface Company {
  slug: string;
  name: string;
  plan: string;
  createdAt: string;
  hotels: number;
  users: number;
  regions: number;
  states: number;
  brands: number;
  rooms: number;
}

export default function AdminHome() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { acting, setActingId } = useAdminAccess();
  const canEditCompany = acting.role === 'super_admin' || acting.role === 'company_admin';

  const actingOptions = [
    HOS_USERS.find((u) => u.role === 'super_admin'),
    HOS_USERS.find((u) => u.role === 'company_admin'),
    HOS_USERS.find((u) => u.role === 'manager'),
    HOS_USERS.find((u) => u.role === 'hotel_admin'),
  ].filter(Boolean) as typeof HOS_USERS;

  useEffect(() => {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    fetch('/api/admin/company', { headers: { 'x-admin-secret': secret } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setCompany(d.company))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const hotelsDesc = company
    ? `${company.hotels} properties — brand, rooms, region, GM, PMS, and last ingested data date.`
    : 'Properties — brand, rooms, region, GM, PMS, and last ingested data date.';

  // `ready: false` cards are intentionally presented as coming-soon — the
  // write/RBAC/payments backend for them is a documented Charan task.
  const cards: Array<{ href: string; icon: typeof Building2; title: string; desc: string; ready: boolean }> = [
    { href: '/web/admin/hotels',    icon: Building2,   title: 'Hotels',          desc: hotelsDesc, ready: true },
    { href: '/web/admin/admins',    icon: ShieldCheck, title: 'Hotel Admins',    desc: 'View and assign admins per hotel — the manager is each hotel’s default admin.', ready: true },
    { href: '/web/admin/users',     icon: Users,       title: 'Company Users',   desc: 'Company-level users — regional, accountant, corporate. Hotel staff live in each hotel’s Team.', ready: true },
    { href: '/web/admin/payments',  icon: CreditCard,  title: 'Payments',        desc: 'Subscription, billing, and per-hotel plan management.', ready: false },
    { href: '/web/admin/health',    icon: Activity,    title: 'System Health',   desc: 'Live DB row counts, last ingestion, and per-hotel data freshness.', ready: true },
    { href: '/web/admin/uploads',   icon: Upload,      title: 'Uploads',         desc: 'Drag-drop an OnQ CSV to push numbers into the dashboards. Streams progress live.', ready: true },
    { href: '/web/admin/ingestion', icon: Inbox,       title: 'Email Ingestion', desc: 'Poll the Gmail inbox now, or watch the daily cron run on its own.', ready: true },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-4xl mx-auto">
        {/* Acting-as switcher */}
        <div className="flex justify-end mb-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <UserCog className="w-3.5 h-3.5" style={{ color: '#6a6a6a' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Acting as</span>
            <select
              value={acting.id}
              onChange={(e) => setActingId(e.target.value)}
              className="text-xs font-semibold bg-transparent outline-none cursor-pointer"
              style={{ color: '#222' }}
            >
              {actingOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name} · {ROLE_META[u.role].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Company header */}
        <div className="rounded-2xl p-6 mb-8 flex items-start gap-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <LogoUpload
            storageKey={`company:${company?.slug ?? 'hos'}`}
            height={56}
            width={112}
            editable={canEditCompany}
            fallback={<Building className="w-7 h-7" style={{ color: '#ff385c' }} />}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: '#222' }}>
                {company?.name ?? (loading ? 'Loading…' : 'HOS Management')}
              </h1>
              {company && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>
                  {company.plan}
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
              Super Admin console · manages hotels, hotel admins, roles &amp; payments · StayOps
            </p>
            {company && (
              <div className="flex items-center gap-5 mt-3 flex-wrap">
                <Stat label="Hotels"  value={company.hotels} />
                <Stat label="Rooms"   value={company.rooms.toLocaleString()} />
                <Stat label="Regions" value={company.regions} />
                <Stat label="States"  value={company.states} />
                <Stat label="Brands"  value={company.brands} />
                <Stat label="Users"   value={company.users} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            if (!c.ready) {
              return (
                <div
                  key={c.href}
                  className="rounded-2xl p-5 relative"
                  style={{ background: '#fafafa', border: '1px dashed #dddddd', cursor: 'not-allowed' }}
                  title="Coming soon — needs the admin-accounts / payments backend"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5" style={{ color: '#c1c1c1' }} />
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0', color: '#929292' }}>
                      <Lock className="w-3 h-3" /> Soon
                    </span>
                  </div>
                  <p className="text-base font-semibold" style={{ color: '#6a6a6a' }}>{c.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#a8a8a8' }}>{c.desc}</p>
                </div>
              );
            }
            return (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-2xl p-5 bg-white hover:bg-[#fafafa] transition-colors"
                style={{ border: '1px solid #dddddd' }}
              >
                <Icon className="w-5 h-5 mb-3" style={{ color: '#ff385c' }} />
                <p className="text-base font-semibold" style={{ color: '#222' }}>{c.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-lg font-bold leading-none" style={{ color: '#222' }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: '#929292' }}>{label}</p>
    </div>
  );
}
