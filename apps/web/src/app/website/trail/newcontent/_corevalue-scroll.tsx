'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronUp, ChevronsUpDown, ChevronRight, Wrench, AlertTriangle, Clock,
  DollarSign, Bed, FileText, Send, Building2, CheckCircle2,
} from 'lucide-react';
import type { Palette } from './_palette';

/* ─── Shared cell tokens ─── */
const TH = 'text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap';
const HEALTH = {
  green: { dot: '#16a34a', bg: '#f0fdf4', text: '#15803d', label: 'Healthy' },
  amber: { dot: '#d97706', bg: '#fffbeb', text: '#b45309', label: 'Monitor' },
  red:   { dot: '#dc2626', bg: '#fef2f2', text: '#b91c1c', label: 'At Risk' },
} as const;

function Pill({ h }: { h: keyof typeof HEALTH }) {
  const c = HEALTH[h];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function Kpi({ label, value, sub, alert }: { label: string; value: string; sub: string; alert?: boolean }) {
  return (
    <div className="rounded-xl p-3 bg-white" style={{
      border: alert ? '1px solid #d97706' : '1px solid #dddddd',
      boxShadow: alert ? '0 0 0 3px rgba(217,119,6,0.1)' : 'rgba(0,0,0,0.04) 0 1px 2px',
    }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="mt-0.5 text-lg font-bold leading-none" style={{ color: '#222222' }}>{value}</p>
      <p className="mt-1 text-[10px]" style={{ color: '#6a6a6a' }}>{sub}</p>
    </div>
  );
}

/* ─── iPad chrome — landscape, fixed inner height for screen swap ─── */
function IpadFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative rounded-[36px] p-3 sm:p-4"
      style={{
        background: 'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)',
        boxShadow: '0 40px 80px -28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
      <span className="absolute left-1/2 -translate-x-1/2 top-[10px] sm:top-[14px] w-1.5 h-1.5 rounded-full"
        style={{ background: '#0a0a0a', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
      <div className="rounded-[22px] overflow-hidden relative" style={{ background: '#ffffff' }}>
        <div className="px-4 py-2 text-[11px] font-medium flex items-center gap-2"
          style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd', color: '#929292' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          {label}
        </div>
        <div className="relative" style={{ height: 460 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 1: Portfolio dashboard ─── */
function PortfolioScreen() {
  const rows = [
    { name: 'Home2 Suites - Baton Rouge',     meta: 'Baton Rouge, LA · Hilton',  rooms: 116, occ: '83%', rev: '$24.3K', h: 'green' as const },
    { name: 'Hilton Garden Inn - Midtown',    meta: 'Savannah, GA · Hilton',     rooms: 132, occ: '77%', rev: '$17.6K', h: 'amber' as const },
    { name: 'Fairfield/TPS - Pooler',         meta: 'Pooler, GA · Marriott',     rooms: 158, occ: '91%', rev: '$29.4K', h: 'green' as const },
    { name: 'Woodspring - Brunswick',         meta: 'Brunswick, GA · Choice',    rooms: 122, occ: '74%', rev: '$15.8K', h: 'red'   as const },
    { name: 'Home2 Suites - Flower Mound',    meta: 'Flower Mound, TX · Hilton', rooms:  99, occ: '85%', rev: '$13.7K', h: 'green' as const },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="px-4 pt-4">
        <h3 className="text-sm font-bold" style={{ color: '#222' }}>Portfolio Dashboard</h3>
        <p className="text-[11px]" style={{ color: '#929292' }}>16 properties · 5 brands · this month</p>
      </div>
      <div className="grid grid-cols-4 gap-2 p-3" style={{ background: '#f7f7f7' }}>
        <Kpi label="Occupancy"     value="83.4%"  sub="1,243 / 1,490 sold" />
        <Kpi label="Room Revenue"  value="$1.04M" sub="rooms only" />
        <Kpi label="Total Revenue" value="$1.24M" sub="all streams" />
        <Kpi label="Rooms Not Sold" value="247"   sub="11 OOO" alert />
      </div>
      <div style={{ background: '#fff' }}>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={TH} style={{ color: '#6a6a6a' }}>Property <ChevronUp className="w-3 h-3 inline" style={{ color: '#ff385c' }} /></th>
              <th className={TH} style={{ color: '#6a6a6a' }}>Rooms <ChevronsUpDown className="w-3 h-3 opacity-30 inline" /></th>
              <th className={TH} style={{ color: '#6a6a6a' }}>Occ <ChevronsUpDown className="w-3 h-3 opacity-30 inline" /></th>
              <th className={TH} style={{ color: '#6a6a6a' }}>Revenue</th>
              <th className={TH} style={{ color: '#6a6a6a' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2 px-3">
                  <p className="text-xs font-medium" style={{ color: '#222' }}>{r.name}</p>
                  <p className="text-[10px]" style={{ color: '#929292' }}>{r.meta}</p>
                </td>
                <td className="py-2 px-3 text-xs" style={{ color: '#3f3f3f' }}>{r.rooms}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#3f3f3f' }}>{r.occ}</td>
                <td className="py-2 px-3 text-xs font-medium" style={{ color: '#3f3f3f' }}>{r.rev}</td>
                <td className="py-2 px-3"><Pill h={r.h} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Screen 2: Attention list ─── */
function AttentionScreen() {
  const items = [
    { icon: Wrench,         title: 'Aging maintenance ticket',  meta: 'Hilton Garden · Room 214 AC · 6 days open',   h: 'red'   as const },
    { icon: Bed,            title: '3 rooms out of order',      meta: 'Hilton Midtown · ~$540/day revenue impact',    h: 'amber' as const },
    { icon: Clock,          title: 'Audit overdue',             meta: 'Woodspring Brunswick · AM handover · 4d late', h: 'amber' as const },
    { icon: DollarSign,     title: 'Labour cost trending up',   meta: 'Fairfield Pooler · OT +4.2% week-over-week',   h: 'amber' as const },
    { icon: AlertTriangle,  title: 'Underperforming property',  meta: 'Woodspring · Occ 74% · 2nd week below 80%',    h: 'red'   as const },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: '#222' }}>Today&apos;s attention list</p>
          <p className="text-[11px]" style={{ color: '#929292' }}>5 items across 4 properties · ranked by impact</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>2 critical</span>
      </div>
      <div style={{ background: '#fff' }}>
        {items.map((it, i) => {
          const c = HEALTH[it.h];
          return (
            <div key={it.title} className="px-4 py-3 flex items-start gap-3"
              style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: c.bg }}>
                <it.icon className="w-4 h-4" style={{ color: c.dot }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold" style={{ color: '#222' }}>{it.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>{it.meta}</p>
              </div>
              <Pill h={it.h} />
              <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#cfcfcf' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Screen 3: Drill-down path ─── */
function DrillDownScreen() {
  const crumbs = ['Portfolio', 'Hilton Garden Midtown', 'Maintenance', 'Room 214'];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="px-4 py-3" style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          {crumbs.map((c, i) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className={i === crumbs.length - 1 ? 'font-semibold' : ''}
                style={{ color: i === crumbs.length - 1 ? '#222' : '#929292' }}>{c}</span>
              {i < crumbs.length - 1 && <ChevronRight className="w-3 h-3" style={{ color: '#cfcfcf' }} />}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3" style={{ background: '#fff' }}>
        <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <Wrench className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold" style={{ color: '#222' }}>AC unit failure · Room 214</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>Reported by Maria L. · 6 days ago</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Aging</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #ddd' }}>Priority · High</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Activity</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {[
              { dot: '#dc2626', label: 'Day 6 · Guest refused room — moved to 312' },
              { dot: '#d97706', label: 'Day 4 · Vendor called, awaiting parts' },
              { dot: '#929292', label: 'Day 1 · Ticket assigned to Marcus (Maint Lead)' },
              { dot: '#929292', label: 'Day 0 · Reported by housekeeping' },
            ].map((a) => (
              <li key={a.label} className="text-[11px] flex items-start gap-2" style={{ color: '#3f3f3f' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.dot }} />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg px-3 py-2 text-[11px]" style={{ background: '#f7f7f7', border: '1px solid #eee', color: '#6a6a6a' }}>
          <Building2 className="w-3 h-3 inline mr-1.5 -mt-0.5" />
          Cost-to-date · est. <span style={{ color: '#222', fontWeight: 600 }}>$3,240</span> · 6 nights blocked
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 4: Daily owner report preview ─── */
function ReportScreen() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#ff385c' }}>
          <FileText className="w-3 h-3 inline mr-1" />Daily Owner Summary
        </p>
        <p className="mt-1 text-sm font-bold" style={{ color: '#222' }}>April 25, 2026 · 16 properties</p>
        <p className="text-[11px]" style={{ color: '#929292' }}>Generated 6:14 AM · ready for owner inbox</p>
      </div>
      <div className="grid grid-cols-3" style={{ background: '#f7f7f7', borderBottom: '1px solid #f0f0f0' }}>
        {[
          { label: 'Revenue',  value: '$285K',   sub: '+4.1% w/w' },
          { label: 'Occ',      value: '83.4%',   sub: '+2.1pp' },
          { label: 'OOO Cost', value: '$1.4K/d', sub: '11 rooms' },
        ].map((t, i) => (
          <div key={t.label} className="p-3" style={{ borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
            <p className="text-[10px] font-semibold uppercase" style={{ color: '#929292' }}>{t.label}</p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: '#222' }}>{t.value}</p>
            <p className="text-[10px]" style={{ color: '#6a6a6a' }}>{t.sub}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#ff385c' }}>
          <AlertTriangle className="w-3 h-3 inline mr-1" />Needs attention today
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {[
            { name: 'Woodspring Brunswick',  detail: 'Occ 74% · 2nd week below 80%',     h: 'red'   as const },
            { name: 'Hilton Garden Midtown', detail: '3 rooms OOO · ~$540/day impact',   h: 'amber' as const },
            { name: 'Fairfield Pooler',      detail: 'Labour OT +4.2% week-over-week',   h: 'amber' as const },
          ].map((x) => (
            <li key={x.name} className="flex items-start gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: HEALTH[x.h].dot }} />
              <span className="min-w-0 flex-1">
                <span className="font-semibold" style={{ color: '#222' }}>{x.name}</span>
                <span style={{ color: '#6a6a6a' }}> · {x.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-4 py-3 flex items-center gap-2 mt-auto" style={{ borderTop: '1px solid #f0f0f0' }}>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
          style={{ background: '#0a0a0a', color: '#fff' }}>
          <Send className="w-3 h-3" />Send to owner
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
          style={{ background: '#fff', color: '#222', border: '1px solid #ddd' }}>
          Export PDF
        </button>
        <span className="ml-auto text-[10px] inline-flex items-center gap-1" style={{ color: '#6a6a6a' }}>
          <CheckCircle2 className="w-3 h-3" style={{ color: '#16a34a' }} />Auto-built from operational data
        </span>
      </div>
    </div>
  );
}

const SCREENS = [
  { key: 'portfolio',  label: 'StayOps · MD Home · Portfolio',  Render: PortfolioScreen },
  { key: 'attention',  label: "StayOps · MD Home · Attention",  Render: AttentionScreen },
  { key: 'drilldown',  label: 'StayOps · MD Home · Drill-down', Render: DrillDownScreen },
  { key: 'report',     label: 'StayOps · MD Home · Reports',    Render: ReportScreen },
];

/* ─── The interactive section component — pinned scrollytelling ───
 * On lg+: outer wrapper is 4× viewport tall; inner is sticky and pins iPad+text
 * to the viewport. Scroll progress through the wrapper drives which stage is
 * shown. iPad screen and text crossfade together at each stage boundary.
 * On mobile: cards stack normally, no pin, no iPad. */
export function CoreValueScroll({
  palette: P,
  intro,
  cards,
}: {
  palette: Palette;
  intro?: { eyebrow: string; headline: string; body: string };
  cards: ReadonlyArray<{ title: string; body: string }>;
}) {
  const stages = SCREENS.length;
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastScrollAtRef = useRef(0);

  /* Scroll-driven: progress through the tall wrapper => active stage. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      const el = wrapperRef.current;
      if (!el) return;
      if (window.innerWidth < 1024) { setActive(0); return; }
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-r.top, 0), total);
      const progress = scrolled / total;
      const idx = Math.min(stages - 1, Math.floor(progress * stages + 0.0001));
      setActive(idx);
      lastScrollAtRef.current = Date.now();
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [stages]);

  /* Autoplay: every 4s rotate the visual while the section is pinned in
     viewport AND the user has been idle for > 1.5s. Scroll-driven still wins
     during active scrolling. */
  useEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return;
    const id = window.setInterval(() => {
      const el = wrapperRef.current;
      if (!el || window.innerWidth < 1024) return;
      const r = el.getBoundingClientRect();
      const isPinned = r.top <= 0 && r.bottom > window.innerHeight;
      const idle = Date.now() - lastScrollAtRef.current > 1500;
      if (isPinned && idle) {
        setActive((i) => (i + 1) % stages);
      }
    }, 4000);
    return () => { window.clearInterval(id); };
  }, [stages]);

  return (
    <>
      {/* Desktop: pinned scrollytelling. Wrapper = stages * 80vh; sticky child
          pins for (wrapperHeight - 100vh) of scroll, distributed equally
          across the 4 stages (~55vh of scroll per stage). */}
      <div ref={wrapperRef} className="hidden lg:block relative" style={{ height: `${stages * 80}vh` }}>
        <div className="sticky top-0 h-screen flex flex-col justify-center">
          {intro && (
            <div className="mx-auto max-w-6xl w-full px-5 sm:px-8 pb-8 xl:pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
                {intro.eyebrow}
              </p>
              <h2 className="mt-3"
                style={{
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  color: P.text,
                  maxWidth: '24ch',
                }}>
                {intro.headline}
              </h2>
              <p className="mt-4 text-base sm:text-lg"
                style={{ color: P.body, lineHeight: 1.6, maxWidth: '60ch' }}>
                {intro.body}
              </p>
            </div>
          )}
          <div className="mx-auto max-w-6xl w-full px-5 sm:px-8 grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-14 items-center">
            {/* iPad — pinned */}
            <div className="relative">
              <IpadFrame label={SCREENS[active].label}>
                {SCREENS.map((s, i) => (
                  <div key={s.key} className="absolute inset-0"
                    style={{
                      opacity: i === active ? 1 : 0,
                      pointerEvents: i === active ? 'auto' : 'none',
                      transition: 'opacity 600ms cubic-bezier(0.22,0.61,0.36,1)',
                    }}>
                    <s.Render />
                  </div>
                ))}
              </IpadFrame>
              {/* Stage dots */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {SCREENS.map((s, i) => (
                  <span key={s.key} className="rounded-full transition-all duration-300"
                    style={{
                      width: i === active ? 24 : 6,
                      height: 6,
                      background: i === active ? P.brand : P.borderSoft,
                    }} />
                ))}
              </div>
            </div>

            {/* Text — pinned, crossfades */}
            <div className="relative" style={{ minHeight: 300 }}>
              {cards.map((card, i) => (
                <div key={card.title} className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: i === active ? 'translateY(0)' : 'translateY(12px)',
                    pointerEvents: i === active ? 'auto' : 'none',
                    transition: 'opacity 600ms cubic-bezier(0.22,0.61,0.36,1), transform 600ms cubic-bezier(0.22,0.61,0.36,1)',
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                      style={{ background: P.brand, color: '#fff' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: P.brand }}>
                      Step {i + 1} of {cards.length}
                    </span>
                  </div>
                  <h3 className="mt-5"
                    style={{
                      fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                      lineHeight: 1.12,
                      letterSpacing: '-0.02em',
                      fontWeight: 600,
                      color: P.text,
                      maxWidth: '18ch',
                    }}>
                    {card.title}
                  </h3>
                  <p className="mt-5 text-base sm:text-lg"
                    style={{ color: P.body, lineHeight: 1.6, maxWidth: '40ch' }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: just stacked cards, no iPad */}
      <div className="lg:hidden flex flex-col gap-10">
        {cards.map((card, i) => (
          <div key={card.title}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                style={{ background: P.brand, color: '#fff' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: P.brand }}>
                Step {i + 1} of {cards.length}
              </span>
            </div>
            <h3 className="mt-3"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                fontWeight: 600,
                color: P.text,
              }}>
              {card.title}
            </h3>
            <p className="mt-3 text-base"
              style={{ color: P.body, lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
