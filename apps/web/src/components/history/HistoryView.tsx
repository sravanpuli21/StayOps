'use client';

/**
 * Historic Data — year-over-year performance view.
 *
 * Works for a single property (GM) or a multi-hotel scope (MD / Regional).
 * Pulls deterministic historic metrics and compares the current period against
 * the same dates last year + the year before. Preset windows (Today / MTD /
 * YTD / Last 12 mo) plus a custom date-range puller.
 */
import { useMemo, useState } from 'react';
import {
  resolveDateRange, mockHistoryWindowMulti, shiftYears, formatCurrency, formatPct,
  type HistoryWindow,
} from '@hos/shared';
import {
  TrendingUp, CalendarRange, BedDouble, DollarSign,
  Percent, Receipt, Wallet, Star, Building2,
} from 'lucide-react';

function frozenToday(): Date {
  const f = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
  return f ? new Date(`${f}T00:00:00Z`) : new Date();
}
const TODAY = frozenToday();
const THIS_YEAR = TODAY.getUTCFullYear();

type PresetKey = 'today' | 'mtd' | 'ytd' | 'trailing12';
const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'mtd', label: 'Month to date' },
  { key: 'ytd', label: 'Year to date' },
  { key: 'trailing12', label: 'Last 12 months' },
];

function presetWindow(key: PresetKey): { from: string; to: string; label: string } {
  if (key === 'today') { const r = resolveDateRange('today', TODAY); return { from: r.from, to: r.to, label: 'Today' }; }
  if (key === 'mtd') { const r = resolveDateRange('month', TODAY); return { from: r.from, to: r.to, label: 'Month to date' }; }
  if (key === 'ytd') { const r = resolveDateRange('ytd', TODAY); return { from: r.from, to: r.to, label: 'Year to date' }; }
  const to = TODAY.toISOString().slice(0, 10);
  return { from: shiftYears(to, 1), to, label: 'Last 12 months' };
}

interface MetricDef {
  key: keyof HistoryWindow;
  label: string;
  icon: React.ReactNode;
  fmt: (v: number) => string;
  pointDelta?: boolean;
  lowerBetter?: boolean;
}
const METRICS: MetricDef[] = [
  { key: 'occupancyPct', label: 'Occupancy', icon: <Percent className="w-4 h-4" />, fmt: (v) => formatPct(v, 1), pointDelta: true },
  { key: 'adr', label: 'ADR (room rate)', icon: <BedDouble className="w-4 h-4" />, fmt: (v) => formatCurrency(v) },
  { key: 'revPar', label: 'RevPAR', icon: <DollarSign className="w-4 h-4" />, fmt: (v) => formatCurrency(v) },
  { key: 'totalRevenue', label: 'Total Revenue', icon: <DollarSign className="w-4 h-4" />, fmt: (v) => formatCurrency(v, true) },
  { key: 'roomRevenue', label: 'Room Revenue', icon: <DollarSign className="w-4 h-4" />, fmt: (v) => formatCurrency(v, true) },
  { key: 'operatingCost', label: 'Operating Cost', icon: <Receipt className="w-4 h-4" />, fmt: (v) => formatCurrency(v, true), lowerBetter: true },
  { key: 'payrollCost', label: 'Payroll Cost', icon: <Wallet className="w-4 h-4" />, fmt: (v) => formatCurrency(v, true), lowerBetter: true },
  { key: 'profit', label: 'Gross Profit', icon: <TrendingUp className="w-4 h-4" />, fmt: (v) => formatCurrency(v, true) },
  { key: 'roomsSold', label: 'Rooms Sold', icon: <BedDouble className="w-4 h-4" />, fmt: (v) => v.toLocaleString() },
  { key: 'csat', label: 'Guest Satisfaction', icon: <Star className="w-4 h-4" />, fmt: (v) => `${v.toFixed(2)} / 5.0`, pointDelta: true },
];

interface HistoryViewProps {
  /** Hotels in scope. One id = single property; many = portfolio/region rollup. */
  hotelIds: string[];
  /** Short scope label shown in the header (e.g. hotel name or "Portfolio"). */
  scopeLabel: string;
}

export function HistoryView({ hotelIds, scopeLabel }: HistoryViewProps) {
  const [preset, setPreset] = useState<PresetKey>('mtd');
  const [customOn, setCustomOn] = useState(false);
  const [customFrom, setCustomFrom] = useState(resolveDateRange('month', TODAY).from);
  const [customTo, setCustomTo] = useState(resolveDateRange('today', TODAY).to);

  const window = customOn
    ? { from: customFrom, to: customTo, label: 'Custom range' }
    : presetWindow(preset);

  const ids = useMemo(() => hotelIds.join(','), [hotelIds]);
  const { thisYear, lastYear, priorYear } = useMemo(() => {
    const arr = ids ? ids.split(',') : [];
    const ty = mockHistoryWindowMulti(arr, window.from, window.to);
    const ly = mockHistoryWindowMulti(arr, shiftYears(window.from, 1), shiftYears(window.to, 1));
    const py = mockHistoryWindowMulti(arr, shiftYears(window.from, 2), shiftYears(window.to, 2));
    return { thisYear: ty, lastYear: ly, priorYear: py };
  }, [ids, window.from, window.to]);

  const scopeNote = hotelIds.length === 1 ? 'single property' : `${hotelIds.length} hotels`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Historic Data</h1>
            <span className="text-sm" style={{ color: '#6a6a6a' }}>{scopeLabel} · {scopeNote}</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Year-over-year performance · {window.label} · {THIS_YEAR} vs {THIS_YEAR - 1}
          </p>
        </div>
      </div>

      {/* Window picker */}
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPreset(p.key); setCustomOn(false); }}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{
              background: !customOn && preset === p.key ? '#ff385c' : '#ffffff',
              color: !customOn && preset === p.key ? '#ffffff' : '#6a6a6a',
              border: `1px solid ${!customOn && preset === p.key ? '#ff385c' : '#dddddd'}`,
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setCustomOn(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
          style={{
            background: customOn ? '#ff385c' : '#ffffff',
            color: customOn ? '#ffffff' : '#6a6a6a',
            border: `1px solid ${customOn ? '#ff385c' : '#dddddd'}`,
          }}
        >
          <CalendarRange className="w-4 h-4" /> Custom range
        </button>
        {customOn && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} className="text-xs outline-none" style={{ color: '#222' }} />
            <span className="text-xs" style={{ color: '#929292' }}>→</span>
            <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} className="text-xs outline-none" style={{ color: '#222' }} />
          </div>
        )}
      </div>

      {/* Window summary banner */}
      <div className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: '#f7f7f7' }}>
        <Building2 className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        <span className="text-sm" style={{ color: '#444' }}>
          Comparing <b>{window.from}</b> → <b>{window.to}</b> ({thisYear.days} day{thisYear.days === 1 ? '' : 's'})
          against the same dates in {THIS_YEAR - 1}.
        </span>
      </div>

      {/* Full historic table */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          All metrics · {window.label}
        </h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Metric</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#222' }}>{THIS_YEAR}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{THIS_YEAR - 1}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{THIS_YEAR - 2}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>YoY</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m, i) => {
                const ty = thisYear[m.key];
                const ly = lastYear[m.key];
                const py = priorYear[m.key];
                const delta = m.pointDelta ? ty - ly : (ly !== 0 ? ((ty - ly) / ly) * 100 : 0);
                const up = ty >= ly;
                const good = m.lowerBetter ? !up : up;
                const color = ty === ly ? '#929292' : good ? '#15803d' : '#b91c1c';
                return (
                  <tr key={m.key} style={{ borderBottom: i < METRICS.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                    <td className="px-4 py-3 font-medium" style={{ color: '#222' }}>
                      <span className="inline-flex items-center gap-2"><span style={{ color: '#929292' }}>{m.icon}</span>{m.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: '#222' }}>{m.fmt(ty)}</td>
                    <td className="px-4 py-3 text-right" style={{ color: '#6a6a6a' }}>{m.fmt(ly)}</td>
                    <td className="px-4 py-3 text-right" style={{ color: '#929292' }}>{m.fmt(py)}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color }}>
                      {ty === ly ? '—' : m.pointDelta
                        ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}${m.key === 'csat' ? '' : ' pts'}`
                        : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: '#c1c1c1' }}>
          Operating cost & profit are modeled estimates for planning. CSAT and occupancy show point deltas; the rest show % change.
        </p>
      </div>
    </div>
  );
}
