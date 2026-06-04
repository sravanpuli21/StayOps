'use client';

import { useState } from 'react';
import { Repeat, CalendarClock, Phone, Sparkles, CloudSnow, PartyPopper, GraduationCap, Users, Building2 } from 'lucide-react';
import {
  nextOccurrence, daysUntil, suggestedPlay,
  CATEGORY_LABEL, RECURRENCE_LABEL, CAPTURE_LABEL, PLAY_LABEL,
  type DemandCategory, type DemandSignal, type SuggestedPlay,
} from '@hos/shared';
import { useDemandSignals } from '@/lib/demand-signals-store';
import { Badge, card } from '../_ui';

const CAT_ICON: Record<DemandCategory, React.ReactNode> = {
  event: <GraduationCap className="w-4 h-4" />,
  festival: <PartyPopper className="w-4 h-4" />,
  sports: <Users className="w-4 h-4" />,
  family: <Users className="w-4 h-4" />,
  weather: <CloudSnow className="w-4 h-4" />,
  corporate: <Building2 className="w-4 h-4" />,
  other: <Sparkles className="w-4 h-4" />,
};

const PLAY_STYLE: Record<SuggestedPlay, { fg: string; bg: string }> = {
  'room-block':   { fg: '#15803d', bg: '#dcfce7' },
  'b2b-outreach': { fg: '#1d4ed8', bg: '#dbeafe' },
  'raise-rates':  { fg: '#b45309', bg: '#fef3c7' },
  reconnect:      { fg: '#7c3aed', bg: '#ece4fb' },
  watch:          { fg: '#6a6a6a', bg: '#f0f0f0' },
  'forecast-watch': { fg: '#0891b2', bg: '#cffafe' },
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function DemandRadarPage() {
  const signals = useDemandSignals();
  const [filter, setFilter] = useState<'all' | 'recurring' | 'missed'>('all');

  // Build a radar row per signal: next occurrence, lead time, suggested play.
  const rows = signals
    .map((s) => {
      const next = nextOccurrence(s);
      return { s, next, days: daysUntil(next), play: suggestedPlay(s) };
    })
    .filter((r) => {
      if (filter === 'recurring') return r.s.recurrence !== 'one-time';
      if (filter === 'missed') return r.s.capture === 'walked-in';
      return true;
    })
    // Soonest recurring opportunities first; non-recurring (no date) last.
    .sort((a, b) => (a.days ?? 99999) - (b.days ?? 99999));

  const recurringMissed = signals.filter((s) => s.recurrence !== 'one-time' && s.capture === 'walked-in').length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Demand Radar</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Why the hotel fills — and when it happens again. {recurringMissed} recurring driver{recurringMissed === 1 ? '' : 's'} we caught as walk-ins (missed group/B2B upside).
        </p>
      </div>

      {/* How it works strip */}
      <div className="p-4 flex items-start gap-3" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <p className="text-sm" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>
          Front desk logs what drives demand (a festival, a graduation, a family reunion, a hurricane evacuation). For
          <span style={{ color: '#222', fontWeight: 600 }}> recurring</span> drivers, Radar predicts when they come back and suggests the play — room block, B2B outreach, raise rates, or reconnect with the organizer. Weather is
          <span style={{ color: '#222', fontWeight: 600 }}> reactive</span>, not recurring — you can&rsquo;t pre-sell it, only watch the live forecast and adjust rates when one lands.
          <span style={{ color: '#929292' }}> Soon: auto-discovery of event announcements + a daily weather.com forecast watch (~14-day horizon).</span>
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {([['all', 'All drivers'], ['recurring', 'Recurring'], ['missed', 'Missed (walk-ins)']] as const).map(([k, label]) => {
          const on = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)} className="h-9 px-3.5 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Radar list */}
      <div className="flex flex-col gap-4">
        {rows.map(({ s, next, days, play }) => {
          const ps = PLAY_STYLE[play];
          return (
            <div key={s.id} className="p-4 flex flex-col gap-3" style={card}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                  {CAT_ICON[s.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: '#222' }}>{s.title}</p>
                    <Badge label={CATEGORY_LABEL[s.category]} fg="#6a6a6a" bg="#f0f0f0" />
                    {s.capture === 'walked-in' && <Badge label="Walk-in · missed" fg="#b91c1c" bg="#fee2e2" />}
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{s.note}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: ps.bg, color: ps.fg }}>
                  {PLAY_LABEL[play]}
                </span>
              </div>

              {/* Recurrence + next-occurrence row */}
              <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                  <Repeat className="w-3.5 h-3.5" /> {RECURRENCE_LABEL[s.recurrence]}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                  Last: {fmtDate(s.date)}
                </span>
                {next ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#7c3aed' }}>
                    <CalendarClock className="w-3.5 h-3.5" /> Next ~{fmtDate(next)}
                    {days != null && <span style={{ color: '#929292', fontWeight: 400 }}>· in {days} days</span>}
                  </span>
                ) : s.category === 'weather' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#0891b2' }}>
                    <CloudSnow className="w-3.5 h-3.5" /> Reactive — can&rsquo;t pre-sell · watch live forecast (~14d)
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: '#929292' }}>No recurrence — {s.category === 'family' ? 'reconnect window opens later' : 'one-time'}</span>
                )}
                <span className="text-xs" style={{ color: '#929292' }}>· ~{s.occupancyLift}% of house · {CAPTURE_LABEL[s.capture]}</span>
              </div>

              {/* Organizer contact, if captured */}
              {s.contactName && (
                <div className="flex items-center gap-4 p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
                  <span className="text-xs font-semibold" style={{ color: '#222' }}>{s.contactName}</span>
                  {s.contactInfo && (
                    <a href={`tel:${s.contactInfo}`} className="inline-flex items-center gap-1 text-xs" style={{ color: '#7c3aed' }}>
                      <Phone className="w-3 h-3" /> {s.contactInfo}
                    </a>
                  )}
                  <span className="ml-auto text-[11px]" style={{ color: '#929292' }}>logged by {s.loggedBy}</span>
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <p className="px-4 py-8 text-center text-sm" style={{ color: '#929292' }}>No demand signals match.</p>}
      </div>
    </div>
  );
}
