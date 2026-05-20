'use client';

import Link from 'next/link';
import { Wrench, Sparkles } from 'lucide-react';

interface Props { hotelCode: string }

/**
 * Front-desk home — intentionally minimal. Only two actions: log a Work
 * Order (Engineering) or a Service Request (Housekeeping). Anything else
 * lives behind the left nav.
 */
export function HomeClient({ hotelCode }: Props) {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Front Desk</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>What do you need to log?</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <ActionCard
          href={`/web/desk/${hotelCode}/requests/new?type=work-order`}
          icon={<Wrench className="w-7 h-7" style={{ color: '#ff385c' }} />}
          accent="#ff385c"
          title="Work Order"
          description="Maintenance or engineering issue for a room or hotel area."
        />
        <ActionCard
          href={`/web/desk/${hotelCode}/requests/new?type=service-request`}
          icon={<Sparkles className="w-7 h-7" style={{ color: '#0ea5e9' }} />}
          accent="#0ea5e9"
          title="Service Request"
          description="Housekeeping or guest items — towels, water, shampoo, conditioner, etc."
        />
      </div>
    </div>
  );
}

function ActionCard({
  href, icon, title, description, accent,
}: { href: string; icon: React.ReactNode; title: string; description: string; accent: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: '#fafafa', borderLeft: `3px solid ${accent}` }}
      >
        {icon}
      </div>
      <p className="text-base font-bold" style={{ color: '#222' }}>{title}</p>
      <p className="text-sm" style={{ color: '#6a6a6a' }}>{description}</p>
    </Link>
  );
}
