'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Megaphone, Repeat } from 'lucide-react';
import { useFdState } from '../_store';
import { PULSE_REASONS } from '../_data';
import { fdCard, Badge, timeAgo } from '../_ui';

interface Props { hotelCode: string }

export function PulseListClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const [reasonF, setReasonF] = useState('all');
  const [missedF, setMissedF] = useState('all');
  const [followF, setFollowF] = useState(false);

  const rows = useMemo(() => state.pulse.filter((p) => {
    const matchReason = reasonF === 'all' || p.mainReason === reasonF;
    const matchMissed = missedF === 'all' || p.missedOpportunity === missedF;
    const matchFollow = !followF || p.shouldFollowUp === 'Yes';
    return matchReason && matchMissed && matchFollow;
  }), [state.pulse, reasonF, missedF, followF]);

  // Group by date.
  const byDate = useMemo(() => {
    const m = new Map<string, typeof rows>();
    for (const p of rows) { const arr = m.get(p.date) ?? []; arr.push(p); m.set(p.date, arr); }
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2"><TrendingUp className="w-6 h-6" style={{ color: '#7c3aed' }} /><div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Today's Hotel Pulse</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Why guests are here — and the opportunities sales should chase.</p></div></div>
        <Link href={`${base}/pulse/new`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl text-sm font-bold" style={{ background: '#7c3aed', color: '#fff' }}><Plus className="w-4 h-4" /> Log What's Happening</Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select value={reasonF} onChange={(e) => setReasonF(e.target.value)} className={fil}><option value="all">All reasons</option>{PULSE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        <select value={missedF} onChange={(e) => setMissedF(e.target.value)} className={fil}><option value="all">All opportunities</option><option value="Yes">Missed: Yes</option><option value="Maybe">Missed: Maybe</option><option value="No">Missed: No</option></select>
        <button onClick={() => setFollowF((f) => !f)} className="h-10 px-3 rounded-xl text-sm font-semibold" style={{ background: followF ? '#ece4fb' : '#fff', border: '1px solid #dddddd', color: followF ? '#7c3aed' : '#6a6a6a' }}>Sales follow-up needed</button>
      </div>

      {byDate.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No hotel pulse logged yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Notice a pattern at check-in? Log it — it helps sales win the business next time.</p>
          <Link href={`${base}/pulse/new`} className="inline-block mt-3 h-10 leading-10 px-4 rounded-xl text-sm font-bold" style={{ background: '#7c3aed', color: '#fff' }}>Log What's Happening</Link>
        </div>
      ) : byDate.map(([date, items]) => (
        <div key={date} className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          {items.map((p) => (
            <Link key={p.id} href={`${base}/pulse/${p.id}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:shadow-md" style={fdCard}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb' }}><TrendingUp className="w-5 h-5" style={{ color: '#7c3aed' }} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#222' }}>{p.eventName || p.mainReason}</p>
                <p className="text-xs truncate" style={{ color: '#929292' }}>{p.occupancyFeeling} · {p.guestSource || 'source unknown'} · {p.guestsMentioned}</p>
              </div>
              {p.missedOpportunity === 'Yes' && <Badge label="Missed opp" fg="#b45309" bg="#fef3c7" />}
              {p.salesNotified ? <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: '#7c3aed' }}><Megaphone className="w-3.5 h-3.5" /> Sales notified</span> : p.shouldFollowUp === 'Yes' && <Badge label="Follow up" fg="#7c3aed" bg="#ece4fb" />}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

const fil = 'h-10 px-2.5 rounded-xl text-sm border border-[#dddddd] bg-white text-[#6a6a6a]';
