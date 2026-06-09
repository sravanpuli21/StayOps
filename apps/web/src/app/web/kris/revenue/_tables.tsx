'use client';

/**
 * Standalone revenue tables for Kris's (MD) revenue page. Built fresh — shares
 * no components with Harshal's revenue view or the common revenue library, so
 * the MD revenue view can evolve independently. Typed against the API row
 * shapes the scoped-data hook returns.
 */
import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import type { Hotel, ApiRevenueSummary, ApiLabourMetrics, ApiDailyMetrics, ApiRevenueBreakdown, ApiRevenueLine, DateRangeKind } from '@hos/shared';
import { formatCurrency, formatPct, resolveDateRange, mockRevenueBreakdown } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { useDateFilter } from '@/lib/date-filter-context';

/* ── Health pill (local) ──────────────────────────────────────────────── */
export function RevHealth({ health }: { health: 'green' | 'amber' | 'red' }) {
  const meta = {
    green: { label: 'On track', fg: '#15803d', bg: '#dcfce7' },
    amber: { label: 'Watch',    fg: '#b45309', bg: '#fef3c7' },
    red:   { label: 'At risk',  fg: '#b91c1c', bg: '#fee2e2' },
  }[health];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.fg, background: meta.bg }}>
      {meta.label}
    </span>
  );
}

const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
    <table className="w-full text-sm border-collapse">{children}</table>
  </div>
);

/* ── 1. Hotel Revenue Breakdown (sortable) ────────────────────────────── */
type RevRow = { hotel: Hotel; revenue: ApiRevenueSummary };
type SortKey = 'name' | 'occupancyPct' | 'adr' | 'revPar' | 'roomRevenue' | 'nonRoomRevenue' | 'totalRevenue';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

export function HotelRevenueTable({ rows }: { rows: RevRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('totalRevenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };
  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else { av = a.revenue[sortKey]; bv = b.revenue[sortKey]; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const th = 'text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none py-3 px-4 whitespace-nowrap';
  return (
    <Shell>
      <thead>
        <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <th className={th} style={{ color: '#6a6a6a' }} onClick={() => handleSort('name')}>Property <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Rooms</th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('occupancyPct')}>Occ% <SortIcon col="occupancyPct" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('adr')}>ADR <SortIcon col="adr" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('revPar')}>RevPAR <SortIcon col="revPar" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('roomRevenue')}>Room Rev <SortIcon col="roomRevenue" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('nonRoomRevenue')}>Non-Room <SortIcon col="nonRoomRevenue" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('totalRevenue')}>Total Rev <SortIcon col="totalRevenue" sortKey={sortKey} sortDir={sortDir} /></th>
          <th className={th} style={{ color: '#6a6a6a' }}>Health</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <td className="py-3 px-4">
              <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
            </td>
            <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{row.hotel.rooms}</td>
            <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.revenue.occupancyPct, 0)}</td>
            <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.adr)}</td>
            <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.revPar)}</td>
            <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.roomRevenue, true)}</td>
            <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.nonRoomRevenue, true)}</td>
            <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222' }}>{formatCurrency(row.revenue.totalRevenue, true)}</td>
            <td className="py-3 px-4"><RevHealth health={row.revenue.health} /></td>
          </tr>
        ))}
      </tbody>
    </Shell>
  );
}

/* ── 2. Revenue Mix by Source — Per Hotel ─────────────────────────────── */
const MIX_COLS: Array<{ key: keyof ApiRevenueSummary['revenueMix']; label: string; color: string }> = [
  { key: 'room',   label: 'Rooms',      color: '#ff385c' },
  { key: 'fb',     label: 'Restaurant', color: '#f97316' },
  { key: 'retail', label: 'Market',     color: '#eab308' },
  { key: 'events', label: 'Events',     color: '#22c55e' },
  { key: 'other',  label: 'Other',      color: '#94a3b8' },
];
function MixCell({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <td className="py-3 px-4 text-sm" style={{ minWidth: 100 }}>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f0f0', width: 80 }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: '#3f3f3f' }}>
          {formatCurrency(value, true)}<span className="ml-1 font-normal" style={{ color: '#929292' }}>{pct.toFixed(0)}%</span>
        </span>
      </div>
    </td>
  );
}
export function RevenueMixTable({ rows }: { rows: RevRow[] }) {
  return (
    <Shell>
      <thead>
        <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
          {MIX_COLS.map((c) => (
            <th key={c.key} className={thBase} style={{ color: '#6a6a6a' }}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: c.color }} />{c.label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.hotel.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <td className="py-3 px-4">
              <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand}</p>
            </td>
            {MIX_COLS.map((c) => <MixCell key={c.key} value={row.revenue.revenueMix[c.key]} total={row.revenue.totalRevenue} color={c.color} />)}
          </tr>
        ))}
      </tbody>
    </Shell>
  );
}

/* ── 3. Opportunity Leakage — Unsold Rooms ────────────────────────────── */
type LeakRow = { hotel: Hotel; revenue: ApiRevenueSummary; daily: ApiDailyMetrics };
export function OpportunityLeakageTable({ rows }: { rows: LeakRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    const mA = (a.hotel.rooms - a.daily.roomsSold) * a.revenue.adr;
    const mB = (b.hotel.rooms - b.daily.roomsSold) * b.revenue.adr;
    return mB - mA;
  });
  return (
    <Shell>
      <thead>
        <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Avail Rooms</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Not Sold</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Occ%</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>ADR</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Est. Missed Rev</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => {
          const available = row.hotel.rooms - row.daily.roomsOoo;
          const notSold = available - row.daily.roomsSold;
          const missedRev = notSold * row.revenue.adr;
          return (
            <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
              </td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{available}</td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: notSold > 20 ? '#dc2626' : '#3f3f3f' }}>{notSold}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatPct(row.daily.occupancyPct, 0)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.adr)}</td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: missedRev > 3000 ? '#dc2626' : '#3f3f3f' }}>{formatCurrency(missedRev, true)}</td>
            </tr>
          );
        })}
      </tbody>
    </Shell>
  );
}

/* ── 4. Revenue / Labour Efficiency ───────────────────────────────────── */
type EffRow = { hotel: Hotel; revenue: ApiRevenueSummary; labour: ApiLabourMetrics };
function PayrollPctBadge({ pct }: { pct: number }) {
  const c = pct > 25 ? { bg: '#fef2f2', text: '#b91c1c' } : pct > 20 ? { bg: '#fffbeb', text: '#b45309' } : { bg: '#f0fdf4', text: '#15803d' };
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.text }}>{formatPct(pct, 1)}</span>;
}
export function RevLabourEfficiencyTable({ rows }: { rows: EffRow[] }) {
  const sorted = [...rows].sort((a, b) => (b.labour.payrollCost / b.revenue.totalRevenue) - (a.labour.payrollCost / a.revenue.totalRevenue));
  return (
    <Shell>
      <thead>
        <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Total Revenue</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll Cost</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll %</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Rev / Labour Hr</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => {
          const payrollPct = row.revenue.totalRevenue > 0 ? (row.labour.payrollCost / row.revenue.totalRevenue) * 100 : 0;
          const revPerHour = row.labour.clockedHours > 0 ? row.revenue.totalRevenue / row.labour.clockedHours : 0;
          return (
            <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand}</p>
              </td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.totalRevenue, true)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.labour.payrollCost, true)}</td>
              <td className="py-3 px-4 text-right"><PayrollPctBadge pct={payrollPct} /></td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(revPerHour)}</td>
            </tr>
          );
        })}
      </tbody>
    </Shell>
  );
}

/* ── 5. Pricing Power vs. Market ──────────────────────────────────────── */
function GapBadge({ gap }: { gap: number }) {
  if (gap > 15) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#f0fdf4', color: '#15803d' }}>+{formatCurrency(gap)}</span>;
  if (gap < -10) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#fef2f2', color: '#b91c1c' }}>{formatCurrency(gap)}</span>;
  return <span className="text-sm font-medium" style={{ color: gap > 0 ? '#15803d' : '#b91c1c' }}>{gap > 0 ? '+' : ''}{formatCurrency(gap)}</span>;
}
export function PricingPowerTable({ rows }: { rows: RevRow[] }) {
  const sorted = [...rows].sort((a, b) => (b.revenue.adr - b.revenue.marketAdr) - (a.revenue.adr - a.revenue.marketAdr));
  return (
    <Shell>
      <thead>
        <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Our ADR</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Market ADR</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Gap ($)</th>
          <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Gap (%)</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => {
          const gap = row.revenue.adr - row.revenue.marketAdr;
          const gapPct = row.revenue.marketAdr > 0 ? (gap / row.revenue.marketAdr) * 100 : 0;
          return (
            <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand} · {row.hotel.city}</p>
              </td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#222' }}>{formatCurrency(row.revenue.adr)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#929292' }}>{formatCurrency(row.revenue.marketAdr)}</td>
              <td className="py-3 px-4 text-right"><GapBadge gap={gap} /></td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: gap >= 0 ? '#15803d' : '#b91c1c' }}>{gap >= 0 ? '+' : ''}{gapPct.toFixed(1)}%</td>
            </tr>
          );
        })}
      </tbody>
    </Shell>
  );
}

/* ── 6. Revenue Mix by Source — Portfolio (bucket drill-down) ─────────── */
type Bucket = 'room' | 'fb' | 'retail' | 'events' | 'other';
const BUCKET_COLOR: Record<Bucket, string> = { room: '#ff385c', fb: '#f97316', retail: '#eab308', events: '#22c55e', other: '#94a3b8' };
const BUCKET_LABEL: Record<Bucket, string> = { room: 'Rooms', fb: 'Restaurant', retail: 'Market', events: 'Events', other: 'Other' };
interface BucketView { bucket: Bucket; label: string; total: number; lines: Array<{ chargeType: string; amount: number }> }

export function PortfolioMix({ hotelIds }: { hotelIds: string[] }) {
  const { range, customFrom, customTo } = useDateFilter();
  const sortedIds = useMemo(() => [...hotelIds].sort(), [hotelIds]);
  const { from, to } = useMemo(() => {
    if (range === 'custom') {
      const f = customFrom || customTo; const t = customTo || customFrom;
      if (f && t) return { from: f, to: t };
    }
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range, customFrom, customTo]);
  const agg: 'today' | 'mtd' | 'ytd' = range === 'month' ? 'mtd' : range === 'ytd' ? 'ytd' : 'today';
  const { data } = useApi(apiKeys.revenueBreakdown(sortedIds, from, to, agg));
  const apiPortfolio = data?.portfolio ?? null;
  const portfolio = useMemo(() => {
    if (apiPortfolio && apiPortfolio.total > 0) return apiPortfolio;
    if (!data || sortedIds.length === 0) return apiPortfolio;
    return mockRevenueBreakdown(sortedIds, from, to).portfolio;
  }, [apiPortfolio, data, sortedIds, from, to]);
  const buckets = useMemo(() => mapToBuckets(portfolio), [portfolio]);
  const total = buckets.reduce((s, b) => s + b.total, 0);
  const [open, setOpen] = useState<Bucket | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {buckets.map((b) => {
        const isOpen = open === b.bucket;
        const pct = total > 0 ? (b.total / total) * 100 : 0;
        return (
          <div key={b.bucket} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <button type="button" onClick={() => setOpen(isOpen ? null : b.bucket)} className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#fafafa]" style={{ padding: '14px 18px' }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BUCKET_COLOR[b.bucket] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{b.label}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{b.lines.length} charge type{b.lines.length === 1 ? '' : 's'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums" style={{ color: '#222' }}>{formatCurrency(b.total, true)}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{pct.toFixed(0)}% of total</p>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} /> : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />}
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                {b.lines.length === 0 && <div className="px-4 py-3 text-xs italic" style={{ color: '#929292' }}>No line items in this window.</div>}
                {b.lines.map((line) => {
                  const linePct = b.total > 0 ? (line.amount / b.total) * 100 : 0;
                  return (
                    <div key={line.chargeType} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <p className="text-sm" style={{ color: '#3f3f3f' }}>{line.chargeType}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums" style={{ color: '#222' }}>{formatCurrency(line.amount, true)}</p>
                        <p className="text-[10px]" style={{ color: '#929292' }}>{linePct.toFixed(0)}% of {b.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function mapToBuckets(portfolio: ApiRevenueBreakdown | null): BucketView[] {
  const empty = (bucket: Bucket): BucketView => ({ bucket, label: BUCKET_LABEL[bucket], total: 0, lines: [] });
  const buckets: Record<Bucket, BucketView> = { room: empty('room'), fb: empty('fb'), retail: empty('retail'), events: empty('events'), other: empty('other') };
  if (!portfolio) return Object.values(buckets);
  const push = (b: Bucket, lines: ApiRevenueLine[]) => {
    for (const l of lines) {
      buckets[b].total += l.amount;
      const ex = buckets[b].lines.find((x) => x.chargeType === l.label);
      if (ex) ex.amount += l.amount; else buckets[b].lines.push({ chargeType: l.label, amount: l.amount });
    }
  };
  for (const t of portfolio.types) {
    if (t.type === 'Room Revenue' || t.type === 'No Show Room Revenue') { for (const g of t.groups) push('room', g.lines); continue; }
    if (t.type === 'Charges') {
      for (const g of t.groups) {
        if (g.group === 'Events') push('events', g.lines);
        else if (g.group === 'F&B') { push('fb', g.lines.filter((l) => l.subtype === 'Restaurant')); push('retail', g.lines.filter((l) => l.subtype === 'Front Market')); }
        else if (g.group === 'Additional Room Charges' || g.group === 'Other Charges') push('other', g.lines);
      }
    }
  }
  for (const b of Object.values(buckets)) b.lines.sort((a, b) => b.amount - a.amount);
  return Object.values(buckets);
}
