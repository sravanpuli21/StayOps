'use client';

import { Megaphone } from 'lucide-react';
import { addDemandSignal } from '@/lib/demand-signals-store';
import { useFdState, markPulseNotified } from '../../_store';
import { pulseToSignal } from '../../_pulse-to-sales';
import { fdCard, Badge, BackTo, fmtDateTime } from '../../_ui';

interface Props { hotelCode: string; id: string }

export function PulseDetailClient({ hotelCode, id }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const p = state.pulse.find((x) => x.id === id);

  if (!p) return <div className="max-w-2xl mx-auto flex flex-col gap-4"><BackTo href={`${base}/pulse`} label="Today's Hotel Pulse" /><div className="rounded-2xl p-10 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}><p className="text-sm" style={{ color: '#929292' }}>Pulse entry not found.</p></div></div>;

  const notifySales = () => {
    addDemandSignal(pulseToSignal(p));
    markPulseNotified(p.id);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <BackTo href={`${base}/pulse`} label="Today's Hotel Pulse" />
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>{p.eventName || p.mainReason}</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>{new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · logged by {p.createdBy}</p></div>
        {p.salesNotified ? <Badge label="Sales notified" fg="#7c3aed" bg="#ece4fb" /> : <button onClick={notifySales} className="h-10 px-4 rounded-xl text-sm font-bold inline-flex items-center gap-1.5" style={{ background: '#7c3aed', color: '#fff' }}><Megaphone className="w-4 h-4" /> Mark Sales Notified</button>}
      </div>

      <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={fdCard}>
        <Info k="Occupancy feeling" v={p.occupancyFeeling} />
        <Info k="Main reason" v={p.mainReason} />
        <Info k="Event / reason name" v={p.eventName || '—'} />
        <Info k="Where guests are from" v={p.guestSource || '—'} />
        <Info k="How front desk found out" v={p.foundOut.length ? p.foundOut.join(', ') : '—'} />
        <Info k="Guests who mentioned it" v={p.guestsMentioned} />
        <Info k="Group booking" v={p.groupBooking} />
        <Info k="Missed opportunity" v={p.missedOpportunity} />
        <Info k="Should sales follow up" v={p.shouldFollowUp} />
        <Info k="Follow-up timing" v={p.followUpTiming} />
      </div>

      {p.notes && <div className="rounded-2xl p-5" style={fdCard}><p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>Notes</p><p className="text-sm" style={{ color: '#222' }}>{p.notes}</p></div>}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{v}</p></div>; }
