import Link from 'next/link';
import { Upload, Inbox, Building2, Users, Activity } from 'lucide-react';

const CARDS = [
  { href: '/web/admin/hotels',    icon: Building2, title: 'Hotels',         desc: 'The 16 properties — brand, rooms, region, GM, PMS, and last ingested data date.' },
  { href: '/web/admin/users',     icon: Users,     title: 'Users & Roles',  desc: 'Access tiers across the portfolio — MD, regional, GM, staff and their scope.' },
  { href: '/web/admin/health',    icon: Activity,  title: 'System Health',  desc: 'Live DB row counts, last ingestion, and per-hotel data freshness.' },
  { href: '/web/admin/uploads',   icon: Upload,    title: 'Uploads',        desc: 'Drag-drop an OnQ CSV to push numbers into the dashboards. Streams progress live.' },
  { href: '/web/admin/ingestion', icon: Inbox,     title: 'Email Ingestion', desc: 'Poll the Gmail inbox now, or watch the daily cron run on its own.' },
];

export default function AdminHome() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>StayOps Admin</h1>
        <p className="text-sm mb-8" style={{ color: '#929292' }}>
          Operator tools for the StayOps demo tenant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CARDS.map((c) => {
            const Icon = c.icon;
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
