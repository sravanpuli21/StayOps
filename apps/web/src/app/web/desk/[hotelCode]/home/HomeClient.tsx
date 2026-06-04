'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, Sparkles, TrendingUp, Repeat } from 'lucide-react';
import { CATEGORY_LABEL, RECURRENCE_LABEL } from '@hos/shared';
import { useDemandSignals } from '@/lib/demand-signals-store';
import { DemandNoteModal } from './DemandNoteModal';

interface Props { hotelCode: string }

/**
 * Front-desk home — log a Work Order, a Service Request, or a Demand Note
 * ("why is the hotel busy today?"). Demand notes flow to the Sales CRM so a
 * walk-in festival crowd this year becomes a planned room block next year.
 */
export function HomeClient({ hotelCode }: Props) {
  const [demandOpen, setDemandOpen] = useState(false);
  const signals = useDemandSignals();
  const today = new Date().toISOString().slice(0, 10);
  const todays = signals.filter((s) => s.date === today);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Front Desk</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>What do you need to log?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
          description="Housekeeping or guest items — towels, water, shampoo, etc."
        />
        <button onClick={() => setDemandOpen(true)} className="text-left rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#fafafa', borderLeft: '3px solid #7c3aed' }}>
            <TrendingUp className="w-7 h-7" style={{ color: '#7c3aed' }} />
          </div>
          <p className="text-base font-bold" style={{ color: '#222' }}>Demand Note</p>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>Why is the hotel busy today? Events, festivals, weather, family gatherings.</p>
        </button>
      </div>

      {/* Today's demand drivers */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Today&rsquo;s demand drivers</h2>
        {todays.length === 0 ? (
          <div className="rounded-2xl px-5 py-6 text-sm" style={{ background: '#fff', border: '1px dashed #dddddd', color: '#929292' }}>
            Nothing logged yet today. Notice a pattern at check-in? Tap <span style={{ color: '#7c3aed', fontWeight: 600 }}>Demand Note</span> — it helps Sales win the business next time.
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            {todays.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < todays.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>{s.title}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{CATEGORY_LABEL[s.category]} · ~{s.occupancyLift}% of house</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>
                  <Repeat className="w-3 h-3" /> {RECURRENCE_LABEL[s.recurrence]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {demandOpen && <DemandNoteModal onClose={() => setDemandOpen(false)} />}
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
