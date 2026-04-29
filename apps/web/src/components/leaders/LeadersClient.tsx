'use client';

import { useState, useMemo } from 'react';
import {
  REGIONAL_ROSTER, GM_ROSTER, getAllGMScores, computeRegionalScore,
} from '@hos/shared';
import { HOTELS } from '@hos/shared';
import type { LeaderScore } from '@hos/shared';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Trophy, Users, BarChart3, Grid3x3,
} from 'lucide-react';

type SortKey = 'rank' | 'composite' | 'revenue' | 'payroll' | 'costSavings' | 'assetUptime' | 'trend';
type Tab = 'scoreboard' | 'heatmap';

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(v: number): string {
  if (v >= 85) return '#22c55e';
  if (v >= 70) return '#f59e0b';
  return '#ef4444';
}

function scoreBg(v: number): string {
  if (v >= 85) return 'rgba(34,197,94,0.10)';
  if (v >= 70) return 'rgba(245,158,11,0.10)';
  return 'rgba(239,68,68,0.10)';
}

function TrendBadge({ delta, direction }: { delta: number; direction: LeaderScore['trendDirection'] }) {
  if (direction === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#22c55e' }}>
        <TrendingUp className="w-3 h-3" />+{delta}
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#ef4444' }}>
        <TrendingDown className="w-3 h-3" />{delta}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#929292' }}>
      <Minus className="w-3 h-3" />{delta > 0 ? `+${delta}` : delta}
    </span>
  );
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: '#929292' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: scoreColor(value) }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
      <span className="text-xs font-semibold w-6 text-right" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  );
}

// ── Regional Card ─────────────────────────────────────────────────────────────

function RegionalCard({ regional }: { regional: typeof REGIONAL_ROSTER[0] }) {
  const score = useMemo(() => computeRegionalScore(regional.hotelIds), [regional.hotelIds]);
  const hotels = HOTELS.filter((h) => regional.hotelIds.includes(h.id));

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 flex-1"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: '#ff385c' }}
            >
              {regional.initials}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#222222' }}>{regional.name}</p>
              <p className="text-xs" style={{ color: '#929292' }}>{regional.title}</p>
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>
            {regional.hotelIds.length} properties · {hotels.map((h) => h.city).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-3xl font-black"
            style={{ color: scoreColor(score.composite) }}
          >
            {score.composite}
          </div>
          <p className="text-xs" style={{ color: '#929292' }}>composite</p>
          <TrendBadge delta={score.trendDelta} direction={score.trendDirection} />
        </div>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-2.5">
        <ScoreBar value={score.revenue} label="Revenue" />
        <ScoreBar value={score.payroll} label="Payroll" />
        <ScoreBar value={score.costSavings} label="Cost Savings" />
        <ScoreBar value={score.assetUptime} label="Asset Uptime" />
        <ScoreBar value={score.trend} label="Trend" />
      </div>

      {/* Hotel chips */}
      <div className="flex flex-wrap gap-1.5">
        {hotels.map((h) => (
          <span
            key={h.id}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #ebebeb' }}
          >
            {h.shortName}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── GM Table ──────────────────────────────────────────────────────────────────

type MetricKey = 'revenue' | 'payroll' | 'costSavings' | 'assetUptime' | 'trend';

const METRIC_COLS: { key: MetricKey; label: string; short: string }[] = [
  { key: 'revenue',     label: 'Revenue',      short: 'Rev' },
  { key: 'payroll',     label: 'Payroll',      short: 'Pay' },
  { key: 'costSavings', label: 'Cost Savings', short: 'Cost' },
  { key: 'assetUptime', label: 'Asset Uptime', short: 'Asset' },
  { key: 'trend',       label: 'Trend',        short: 'Trend' },
];

function GMTable() {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortAsc, setSortAsc] = useState(false);

  const gmScores = useMemo(() => getAllGMScores(), []);

  const sorted = useMemo(() => {
    return [...gmScores].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === 'rank') {
        av = a.rank; bv = b.rank;
      } else {
        const sk = sortKey as keyof LeaderScore;
        av = a.score[sk] as number;
        bv = b.score[sk] as number;
      }
      return sortAsc ? av - bv : bv - av;
    });
  }, [gmScores, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((x) => !x);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3" style={{ color: '#ff385c' }} />
      : <ChevronDown className="w-3 h-3" style={{ color: '#ff385c' }} />;
  };

  const regional = (hotelId: string) =>
    REGIONAL_ROSTER.find((r) => r.hotelIds.includes(hotelId));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide cursor-pointer select-none"
              style={{ color: '#929292', width: 40 }}
              onClick={() => handleSort('rank')}
            >
              <span className="flex items-center gap-1">#<SortIcon k="rank" /></span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
              GM / Property
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide cursor-pointer select-none"
              style={{ color: '#929292', width: 110 }}
              onClick={() => handleSort('composite')}
            >
              <span className="flex items-center gap-1">Score<SortIcon k="composite" /></span>
            </th>
            {METRIC_COLS.map((col) => (
              <th
                key={col.key}
                className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide cursor-pointer select-none"
                style={{ color: '#929292', width: 120 }}
                onClick={() => handleSort(col.key)}
              >
                <span className="flex items-center gap-1">{col.short}<SortIcon k={col.key} /></span>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292', width: 70 }}>
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((gm, idx) => {
            const reg = regional(gm.hotelId);
            const isTop3 = gm.rank <= 3;
            return (
              <tr
                key={gm.hotelId}
                style={{
                  borderBottom: idx < sorted.length - 1 ? '1px solid #f0f0f0' : undefined,
                  background: isTop3 ? 'rgba(255,56,92,0.02)' : '#ffffff',
                }}
                className="hover:bg-[#fafafa] transition-colors"
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  {gm.rank <= 3 ? (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{
                        background: gm.rank === 1 ? '#f59e0b' : gm.rank === 2 ? '#94a3b8' : '#cd7f32',
                        display: 'inline-flex',
                      }}
                    >
                      {gm.rank}
                    </span>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: '#929292' }}>{gm.rank}</span>
                  )}
                </td>

                {/* GM info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: '#222222' }}
                    >
                      {gm.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#222222' }}>{gm.name}</p>
                      <p className="text-xs" style={{ color: '#929292' }}>
                        {gm.hotel.shortName}
                        {reg && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium"
                            style={{ background: '#f7f7f7', color: '#6a6a6a' }}>
                            {reg.initials}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Composite score */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-black px-2.5 py-1 rounded-lg"
                      style={{
                        color: scoreColor(gm.score.composite),
                        background: scoreBg(gm.score.composite),
                      }}
                    >
                      {gm.score.composite}
                    </span>
                  </div>
                </td>

                {/* Metric mini-bars */}
                {METRIC_COLS.map((col) => (
                  <td key={col.key} className="px-3 py-3" style={{ minWidth: 100 }}>
                    <MiniBar value={gm.score[col.key] as number} />
                  </td>
                ))}

                {/* Trend */}
                <td className="px-4 py-3">
                  <TrendBadge delta={gm.score.trendDelta} direction={gm.score.trendDirection} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

const HEATMAP_METRICS: { key: keyof LeaderScore; label: string }[] = [
  { key: 'revenue',     label: 'Revenue' },
  { key: 'payroll',     label: 'Payroll' },
  { key: 'costSavings', label: 'Cost Savings' },
  { key: 'assetUptime', label: 'Asset Uptime' },
  { key: 'trend',       label: 'Trend' },
];

function heatCell(v: number) {
  if (v >= 85) return { bg: 'rgba(34,197,94,0.15)', color: '#15803d', label: v };
  if (v >= 70) return { bg: 'rgba(245,158,11,0.15)', color: '#b45309', label: v };
  return { bg: 'rgba(239,68,68,0.15)', color: '#b91c1c', label: v };
}

function AccountabilityHeatmap() {
  const gmScores = useMemo(() => getAllGMScores(), []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid #dddddd' }}
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292', minWidth: 200 }}>
              GM / Property
            </th>
            {HEATMAP_METRICS.map((m) => (
              <th key={m.key} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
                {m.label}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
              Overall
            </th>
          </tr>
        </thead>
        <tbody>
          {gmScores.map((gm, idx) => {
            const reg = REGIONAL_ROSTER.find((r) => r.hotelIds.includes(gm.hotelId));
            return (
              <tr
                key={gm.hotelId}
                style={{ borderBottom: idx < gmScores.length - 1 ? '1px solid #f0f0f0' : undefined }}
                className="hover:bg-[#fafafa] transition-colors"
              >
                <td className="px-4 py-2.5">
                  <p className="text-sm font-semibold" style={{ color: '#222222' }}>{gm.name}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>
                    {gm.hotel.shortName}
                    {reg && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{ background: '#f7f7f7', color: '#6a6a6a' }}>
                        {reg.initials}
                      </span>
                    )}
                  </p>
                </td>
                {HEATMAP_METRICS.map((m) => {
                  const v = gm.score[m.key] as number;
                  const cell = heatCell(v);
                  return (
                    <td key={m.key} className="px-4 py-2.5 text-center">
                      <span
                        className="inline-block px-3 py-1 rounded-lg text-xs font-bold min-w-[44px]"
                        style={{ background: cell.bg, color: cell.color }}
                      >
                        {v}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-center">
                  {(() => {
                    const cell = heatCell(gm.score.composite);
                    return (
                      <span
                        className="inline-block px-3 py-1 rounded-lg text-xs font-black min-w-[44px]"
                        style={{ background: cell.bg, color: cell.color }}
                      >
                        {gm.score.composite}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Summary KPI bar ───────────────────────────────────────────────────────────

function SummaryKPIs() {
  const gmScores = useMemo(() => getAllGMScores(), []);
  const scores = gmScores.map((g) => g.score.composite);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const above85 = scores.filter((v) => v >= 85).length;
  const below70 = scores.filter((v) => v < 70).length;
  const top = gmScores[0];

  const kpis = [
    { label: 'Portfolio Avg', value: avg.toString(), sub: 'composite score', color: scoreColor(avg) },
    { label: 'Top Performer', value: top.name.split(' ')[0], sub: `${top.score.composite} pts · #1`, color: '#f59e0b' },
    { label: 'At Target (≥85)', value: above85.toString(), sub: `of ${gmScores.length} GMs`, color: '#22c55e' },
    { label: 'Below Threshold', value: below70.toString(), sub: `score < 70`, color: below70 > 0 ? '#ef4444' : '#929292' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl px-5 py-4"
          style={{ background: '#ffffff', border: '1px solid #dddddd' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#929292' }}>{k.label}</p>
          <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function LeadersClient() {
  const [tab, setTab] = useState<Tab>('scoreboard');

  const TABS = [
    { id: 'scoreboard' as Tab, label: 'GM Scoreboard', icon: Trophy },
    { id: 'heatmap' as Tab, label: 'Accountability Heatmap', icon: Grid3x3 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI summary */}
      <SummaryKPIs />

      {/* Regional scorecards */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
          Regional Directors
        </p>
        <div className="flex gap-4">
          {REGIONAL_ROSTER.map((r) => (
            <RegionalCard key={r.id} regional={r} />
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div>
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#222222' : '#929292',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                  border: active ? '1px solid #ebebeb' : '1px solid transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'scoreboard' && <GMTable />}
        {tab === 'heatmap' && <AccountabilityHeatmap />}
      </div>
    </div>
  );
}
