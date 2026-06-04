'use client';

import Link from 'next/link';
import { ArrowRight, Target, RefreshCw, Repeat, TrendingUp, Sparkles, CalendarClock } from 'lucide-react';
import {
  CRM_ACCOUNTS, CRM_OPPORTUNITIES, CRM_RFPS, CRM_ACTIVITIES,
  crmPipelineValue, crmRecurringRevenue, CADENCE_LABEL,
  nextOccurrence, daysUntil, suggestedPlay, PLAY_LABEL,
} from '@hos/shared';
import { useDemandSignals } from '@/lib/demand-signals-store';
import { fmtMoney, fmtMoneyFull, Badge, KIND_STYLE, STATUS_STYLE, card } from '../_ui';

export default function KwanishaDashboard() {
  const open = CRM_OPPORTUNITIES.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const pipeline = crmPipelineValue();
  const recurring = crmRecurringRevenue();
  const recurringAccts = CRM_ACCOUNTS.filter((a) => a.cadence !== 'one-time' && a.status === 'active');

  // The headline: recurring opportunities to act on now.
  const rebookDue = open.filter((o) => o.kind === 'rebook-due');
  const winBack = open.filter((o) => o.kind === 'win-back');
  const hot = [...open].sort((a, b) => b.confidence - a.confidence).slice(0, 5);

  const todaysActivities = CRM_ACTIVITIES.filter((a) => !a.done);

  // Demand radar — upcoming recurring drivers, soonest first.
  const signals = useDemandSignals();
  const upcoming = signals
    .map((s) => ({ s, next: nextOccurrence(s), days: daysUntil(nextOccurrence(s)), play: suggestedPlay(s) }))
    .filter((r) => r.days != null)
    .sort((a, b) => (a.days! - b.days!))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Good morning, Kwanisha</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Sales · group &amp; recurring business · Home2 Baton Rouge
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Open pipeline" value={fmtMoney(pipeline)} sub={`${open.length} opportunities`} icon={<Target className="w-4 h-4" />} accent="#7c3aed" />
        <Kpi label="Recurring revenue" value={fmtMoney(recurring)} sub="trailing 12 mo" icon={<Repeat className="w-4 h-4" />} accent="#15803d" />
        <Kpi label="Rebook due now" value={String(rebookDue.length)} sub={fmtMoney(rebookDue.reduce((s, o) => s + o.estValue, 0))} icon={<RefreshCw className="w-4 h-4" />} accent="#15803d" />
        <Kpi label="Win-backs" value={String(winBack.length)} sub="lapsed regulars" icon={<TrendingUp className="w-4 h-4" />} accent="#b45309" />
      </div>

      {/* Demand radar — recurring drivers coming back */}
      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: '#6a6a6a' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} /> Demand radar — coming back
            </h2>
            <Link href="/web/kwanisha/demand" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#7c3aed' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcoming.map(({ s, next, days, play }) => (
              <Link key={s.id} href="/web/kwanisha/demand" className="p-4 flex flex-col gap-2" style={card}>
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#7c3aed' }}>
                  <CalendarClock className="w-3.5 h-3.5" /> in {days} days
                </div>
                <p className="text-sm font-bold" style={{ color: '#222' }}>{s.title}</p>
                <p className="text-xs" style={{ color: '#929292' }}>
                  ~{next ? new Date(next).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} · ~{s.occupancyLift}% of house
                </p>
                <span className="mt-1 self-start text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                  {PLAY_LABEL[play]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Opportunities to act on — the heart */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Opportunities to act on</h2>
          <Link href="/web/kwanisha/opportunities" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#7c3aed' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div style={card}>
          {hot.map((o, i) => {
            const k = KIND_STYLE[o.kind];
            return (
              <Link
                key={o.id}
                href={`/web/kwanisha/accounts/${o.accountId}`}
                className="flex items-center gap-4 px-4 py-3.5"
                style={{ borderBottom: i < hot.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge label={k.label} fg={k.fg} bg={k.bg} />
                    <p className="font-semibold text-sm truncate" style={{ color: '#222' }}>{o.accountName}</p>
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#222' }}>{o.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{o.signal}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#222' }}>{fmtMoneyFull(o.estValue)}</p>
                  <p className="text-[11px]" style={{ color: '#929292' }}>{o.estRooms} rooms · {o.confidence}%</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recurring accounts */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Recurring accounts</h2>
          <div style={card}>
            {recurringAccts.map((a, i) => (
              <Link key={a.id} href={`/web/kwanisha/accounts/${a.id}`} className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < recurringAccts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: '#222' }}>{a.name}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{CADENCE_LABEL[a.cadence]} · {a.typicalRooms} rooms · ${a.negotiatedRate}/nt</p>
                </div>
                <p className="text-sm font-semibold flex-shrink-0" style={{ color: '#15803d' }}>{fmtMoney(a.ytdRevenue)}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Today */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Today</h2>
            <Link href="/web/kwanisha/activities" className="text-xs font-semibold" style={{ color: '#7c3aed' }}>All activities</Link>
          </div>
          <div style={card}>
            {todaysActivities.map((act, i) => (
              <div key={act.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < todaysActivities.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: '#222' }}>{act.summary}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{act.accountName} · {act.kind}</p>
                </div>
                <p className="text-[11px] flex-shrink-0" style={{ color: '#929292' }}>
                  {new Date(act.when).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="p-4 flex flex-col gap-1.5" style={card}>
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#222' }}>{value}</p>
      <p className="text-xs" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}
