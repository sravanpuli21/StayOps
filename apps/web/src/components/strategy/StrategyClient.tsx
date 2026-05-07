'use client';

import { useState, useMemo } from 'react';
import {
  ANNUAL_TARGETS, STRATEGIC_INITIATIVES, CAPEX_PIPELINE, getHotelMarketPosition,
} from '@hos/shared';
import type { StrategicInitiative, CapExItem, InitiativeStatus, InitiativeCategory } from '@hos/shared';
import { HOTELS } from '@hos/shared';
import {
  ChevronDown, ChevronRight, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Clock, XCircle,
  Target, DollarSign, Wrench, Users, BarChart3,
} from 'lucide-react';

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtCurrency(v: number, decimals = 0): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(decimals === 0 ? 0 : 1)}K`;
  return `$${v.toFixed(decimals)}`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Annual Scorecard ──────────────────────────────────────────────────────────

function AnnualScorecard() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
        Annual Targets · FY 2026 (YTD through April)
      </p>
      <div className="grid grid-cols-3 gap-4">
        {ANNUAL_TARGETS.map((t) => {
          const pct = Math.min(100, (t.actual / t.target) * 100);
          const onTrack = t.metric === 'Payroll % of Rev'
            ? t.actual <= t.target
            : pct >= (new Date().getMonth() / 12) * 100 * 0.90;
          const delta = t.metric === 'Payroll % of Rev'
            ? t.target - t.actual
            : t.actual - t.priorYear;
          const deltaPositive = t.metric === 'Payroll % of Rev' ? delta >= 0 : delta >= 0;

          const barColor = onTrack ? '#22c55e' : pct >= 80 ? '#f59e0b' : '#ef4444';

          const fmtVal = (v: number) => {
            if (t.unit === 'currency') return t.metric.includes('Revenue') ? fmtCurrency(v) : `$${v.toFixed(0)}`;
            if (t.unit === 'percent') return fmtPct(v);
            return v.toFixed(1);
          };

          return (
            <div
              key={t.metric}
              className="rounded-2xl p-5"
              style={{ background: '#ffffff', border: '1px solid #dddddd' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#929292' }}>{t.metric}</p>
                  <p className="text-2xl font-black" style={{ color: '#222222' }}>{fmtVal(t.actual)}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                    target: <span className="font-semibold" style={{ color: '#6a6a6a' }}>{fmtVal(t.target)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{
                      background: onTrack ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
                      color: onTrack ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {deltaPositive
                  ? <TrendingUp className="w-3 h-3" style={{ color: '#22c55e' }} />
                  : <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />
                }
                <span className="text-xs" style={{ color: deltaPositive ? '#15803d' : '#b91c1c' }}>
                  {deltaPositive ? '+' : ''}{fmtVal(delta)} vs prior year
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Market Position ───────────────────────────────────────────────────────────

function MarketPosition() {
  const rows = useMemo(() => getHotelMarketPosition(), []);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 8);

  function indexColor(idx: number) {
    if (idx >= 103) return { color: '#15803d', bg: 'rgba(34,197,94,0.10)' };
    if (idx >= 97) return { color: '#b45309', bg: 'rgba(245,158,11,0.10)' };
    return { color: '#b91c1c', bg: 'rgba(239,68,68,0.10)' };
  }

  function deltaChip(v: number, unit: string) {
    const pos = v >= 0;
    return (
      <span
        className="text-xs font-semibold"
        style={{ color: pos ? '#15803d' : '#b91c1c' }}
      >
        {pos ? '+' : ''}{unit === '$' ? `$${v}` : `${v}%`}
      </span>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
        Market Position · ADR Index vs Comp Set
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Property</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>ADR</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Market ADR</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>ADR Index</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Occupancy</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>vs Target</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>RevPAR</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, idx) => {
              const ic = indexColor(row.adrIndex);
              return (
                <tr
                  key={row.hotel.id}
                  style={{ borderBottom: idx < visible.length - 1 ? '1px solid #f0f0f0' : undefined }}
                  className="hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-semibold" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                    <p className="text-xs" style={{ color: '#929292' }}>{row.hotel.brand} · {row.hotel.city}, {row.hotel.state}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-sm" style={{ color: '#222222' }}>${row.adr}</td>
                  <td className="px-4 py-2.5 text-right text-sm" style={{ color: '#6a6a6a' }}>${row.marketAdr}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className="inline-block px-2.5 py-1 rounded-lg text-xs font-black min-w-[48px]"
                      style={{ background: ic.bg, color: ic.color }}
                    >
                      {row.adrIndex}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-medium" style={{ color: '#222222' }}>
                    {row.occupancyPct}%
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {deltaChip(row.occVsTarget, '%')}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-sm" style={{ color: '#222222' }}>${row.revPar}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length > 8 && (
          <button
            onClick={() => setExpanded((x) => !x)}
            className="w-full py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-[#f7f7f7]"
            style={{ color: '#ff385c', borderTop: '1px solid #ebebeb' }}
          >
            {expanded ? 'Show less' : `Show all ${rows.length} properties`}
            {expanded ? <ChevronDown className="w-3 h-3 rotate-180" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Strategic Initiatives ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InitiativeStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  on_track:  { label: 'On Track',  color: '#15803d', bg: 'rgba(34,197,94,0.10)',   icon: CheckCircle2 },
  at_risk:   { label: 'At Risk',   color: '#b45309', bg: 'rgba(245,158,11,0.10)',  icon: AlertTriangle },
  behind:    { label: 'Behind',    color: '#b91c1c', bg: 'rgba(239,68,68,0.10)',   icon: XCircle },
  completed: { label: 'Completed', color: '#6a6a6a', bg: 'rgba(107,114,128,0.10)', icon: CheckCircle2 },
};

const CAT_CONFIG: Record<InitiativeCategory, { color: string; bg: string; icon: React.ElementType }> = {
  Revenue: { color: '#15803d', bg: 'rgba(34,197,94,0.10)',   icon: DollarSign },
  Cost:    { color: '#b45309', bg: 'rgba(245,158,11,0.10)',  icon: BarChart3 },
  Asset:   { color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)',  icon: Wrench },
  People:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)',  icon: Users },
};

function InitiativeCard({ item }: { item: StrategicInitiative }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_CONFIG[item.status];
  const cat = CAT_CONFIG[item.category];
  const StIcon = st.icon;
  const CatIcon = cat.icon;
  const hotels = item.hotelIds === 'all'
    ? 'All 16 properties'
    : item.hotelIds.map((id) => HOTELS.find((h) => h.id === id)?.shortName ?? id).join(', ');

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
      style={{ border: '1px solid #dddddd', background: '#ffffff' }}
    >
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setOpen((x) => !x)}
      >
        {/* Category dot */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: cat.bg }}
        >
          <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold" style={{ color: '#929292' }}>{item.id}</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cat.bg, color: cat.color }}
            >
              {item.category}
            </span>
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: st.bg, color: st.color }}
            >
              <StIcon className="w-3 h-3" />
              {st.label}
            </span>
          </div>
          <p className="text-sm font-bold" style={{ color: '#222222' }}>{item.title}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs" style={{ color: '#929292' }}>Owner: <span className="font-medium" style={{ color: '#6a6a6a' }}>{item.owner}</span></span>
            <span className="text-xs" style={{ color: '#929292' }}>Due: <span className="font-medium" style={{ color: '#6a6a6a' }}>{fmtDate(item.dueDate)}</span></span>
            <span className="text-xs font-semibold" style={{ color: '#ff385c' }}>{item.impactLabel}</span>
          </div>
        </div>

        {/* Progress + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-black" style={{ color: '#222222' }}>{item.progressPct}%</p>
            <div className="h-1.5 w-20 rounded-full overflow-hidden mt-1" style={{ background: '#ebebeb' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.progressPct}%`,
                  background: item.status === 'behind' ? '#ef4444' : item.status === 'at_risk' ? '#f59e0b' : item.status === 'completed' ? '#6a6a6a' : '#22c55e',
                }}
              />
            </div>
          </div>
          <ChevronRight
            className="w-4 h-4 transition-transform flex-shrink-0"
            style={{ color: '#929292', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4" style={{ borderTop: '1px solid #f0f0f0' }}>
          <p className="text-sm mt-3 mb-3" style={{ color: '#6a6a6a', lineHeight: 1.6 }}>{item.description}</p>
          <div className="flex items-start gap-1.5">
            <span className="text-xs font-semibold flex-shrink-0 mt-0.5" style={{ color: '#929292' }}>Scope:</span>
            <span className="text-xs" style={{ color: '#6a6a6a' }}>{hotels}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Initiatives({ hotelIds }: { hotelIds?: readonly string[] }) {
  const [catFilter, setCatFilter] = useState<InitiativeCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<InitiativeStatus | 'All'>('All');

  const scoped = useMemo(() =>
    STRATEGIC_INITIATIVES.filter((i) =>
      !hotelIds
      || i.hotelIds === 'all'
      || (Array.isArray(i.hotelIds) && i.hotelIds.some((id) => hotelIds.includes(id)))
    ),
    [hotelIds]);

  const filtered = useMemo(() =>
    scoped.filter((i) =>
      (catFilter === 'All' || i.category === catFilter) &&
      (statusFilter === 'All' || i.status === statusFilter)
    ), [catFilter, statusFilter, scoped]);

  const cats: Array<InitiativeCategory | 'All'> = ['All', 'Revenue', 'Cost', 'Asset', 'People'];
  const statuses: Array<InitiativeStatus | 'All'> = ['All', 'on_track', 'at_risk', 'behind', 'completed'];
  const statusLabels: Record<string, string> = { All: 'All', on_track: 'On Track', at_risk: 'At Risk', behind: 'Behind', completed: 'Done' };

  const summaryStats = useMemo(() => {
    const total = scoped.length;
    const onTrack = scoped.filter((i) => i.status === 'on_track').length;
    const atRisk = scoped.filter((i) => i.status === 'at_risk').length;
    const behind = scoped.filter((i) => i.status === 'behind').length;
    const done = scoped.filter((i) => i.status === 'completed').length;
    return { total, onTrack, atRisk, behind, done };
  }, [scoped]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
          Strategic Initiatives · {STRATEGIC_INITIATIVES.length} total
        </p>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span style={{ color: '#15803d' }}>{summaryStats.onTrack} on track</span>
          <span style={{ color: '#b45309' }}>{summaryStats.atRisk} at risk</span>
          <span style={{ color: '#b91c1c' }}>{summaryStats.behind} behind</span>
          <span style={{ color: '#6a6a6a' }}>{summaryStats.done} done</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: catFilter === c ? '#ffffff' : 'transparent',
                color: catFilter === c ? '#222222' : '#929292',
                boxShadow: catFilter === c ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                border: catFilter === c ? '1px solid #ebebeb' : '1px solid transparent',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: statusFilter === s ? '#ffffff' : 'transparent',
                color: statusFilter === s ? '#222222' : '#929292',
                boxShadow: statusFilter === s ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                border: statusFilter === s ? '1px solid #ebebeb' : '1px solid transparent',
              }}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0
          ? <p className="text-sm py-6 text-center" style={{ color: '#929292' }}>No initiatives match the selected filters.</p>
          : filtered.map((item) => <InitiativeCard key={item.id} item={item} />)
        }
      </div>
    </div>
  );
}

// ── CapEx Pipeline ─────────────────────────────────────────────────────────────

const CAPEX_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  planned:     { label: 'Planned',     color: '#6a6a6a', bg: '#f0f0f0' },
  approved:    { label: 'Approved',    color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)' },
  in_progress: { label: 'In Progress', color: '#b45309', bg: 'rgba(245,158,11,0.10)' },
  completed:   { label: 'Completed',   color: '#15803d', bg: 'rgba(34,197,94,0.10)' },
  on_hold:     { label: 'On Hold',     color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
};

function CapExPipeline({ hotelIds }: { hotelIds?: readonly string[] }) {
  const scoped = useMemo(
    () => CAPEX_PIPELINE.filter((c) => !hotelIds || hotelIds.includes(c.hotelId)),
    [hotelIds]
  );
  const totalBudget = scoped.reduce((s, c) => s + c.budget, 0);
  const totalSpent = scoped.reduce((s, c) => s + c.spent, 0);
  const active = scoped.filter((c) => c.status === 'in_progress' || c.status === 'approved').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
          CapEx Pipeline · {scoped.length} projects
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span style={{ color: '#6a6a6a' }}>{active} active</span>
          <span style={{ color: '#6a6a6a' }}>Total budget: <span className="font-bold" style={{ color: '#222222' }}>{fmtCurrency(totalBudget)}</span></span>
          <span style={{ color: '#6a6a6a' }}>Spent: <span className="font-bold" style={{ color: '#ff385c' }}>{fmtCurrency(totalSpent)}</span></span>
        </div>
      </div>

      {/* Spend summary bar */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#222222' }}>Portfolio Spend</span>
          <span className="text-sm font-black" style={{ color: '#222222' }}>
            {fmtCurrency(totalSpent)} <span className="font-normal text-xs" style={{ color: '#929292' }}>of {fmtCurrency(totalBudget)}</span>
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${(totalSpent / totalBudget) * 100}%`, background: '#ff385c' }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: '#929292' }}>
          {Math.round((totalSpent / totalBudget) * 100)}% utilised · {fmtCurrency(totalBudget - totalSpent)} remaining
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Property · Project</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Category</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Budget</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Spent</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292', minWidth: 140 }}>Progress</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Target Date</th>
            </tr>
          </thead>
          <tbody>
            {scoped.map((item, idx) => {
              const hotel = HOTELS.find((h) => h.id === item.hotelId);
              const st = CAPEX_STATUS_CONFIG[item.status];
              const spentPct = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
              const barColor = item.status === 'completed' ? '#6a6a6a' : item.status === 'on_hold' ? '#7c3aed' : '#ff385c';
              return (
                <tr
                  key={item.id}
                  style={{ borderBottom: idx < scoped.length - 1 ? '1px solid #f0f0f0' : undefined }}
                  className="hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold" style={{ color: '#222222' }}>{item.project}</p>
                    <p className="text-xs" style={{ color: '#929292' }}>{hotel?.shortName ?? item.hotelId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: '#6a6a6a' }}>{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-sm" style={{ color: '#222222' }}>
                    {fmtCurrency(item.budget)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: '#6a6a6a' }}>
                    {item.spent > 0 ? fmtCurrency(item.spent) : '—'}
                  </td>
                  <td className="px-4 py-3" style={{ minWidth: 120 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${spentPct}%`, background: barColor }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: '#929292' }}>{spentPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: '#6a6a6a' }}>
                    {fmtDate(item.targetDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Section = 'scorecard' | 'market' | 'initiatives' | 'capex';

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'scorecard',   label: 'Annual Scorecard', icon: Target },
  { id: 'market',      label: 'Market Position',  icon: BarChart3 },
  { id: 'initiatives', label: 'Initiatives',      icon: CheckCircle2 },
  { id: 'capex',       label: 'CapEx Pipeline',   icon: Wrench },
];

interface StrategyClientProps {
  hotelIds?: readonly string[];
}

export function StrategyClient({ hotelIds }: StrategyClientProps = {}) {
  const [section, setSection] = useState<Section>('scorecard');

  return (
    <div className="flex flex-col gap-6">
      {/* Section nav */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: active ? '#ffffff' : 'transparent',
                color: active ? '#222222' : '#929292',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                border: active ? '1px solid #ebebeb' : '1px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === 'scorecard'   && <AnnualScorecard />}
      {section === 'market'      && <MarketPosition />}
      {section === 'initiatives' && <Initiatives hotelIds={hotelIds} />}
      {section === 'capex'       && <CapExPipeline hotelIds={hotelIds} />}
    </div>
  );
}
