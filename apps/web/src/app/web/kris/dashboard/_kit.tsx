'use client';

/**
 * Standalone UI kit for Kris's (MD) dashboard.
 *
 * Built fresh for this page — it intentionally shares NOTHING with Harshal's
 * dashboard or the common component library, so the MD view can evolve on its
 * own. Self-contained: KPI tile, slide-in drawer, health pill, and the
 * tap-to-expand revenue-mix breakdown all live here.
 */
import { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  formatCurrency, resolveDateRange, mockRevenueBreakdown,
  type DateRangeKind, type ApiRevenueBreakdown, type ApiRevenueLine,
} from '@hos/shared';
import { useDateFilter } from '@/lib/date-filter-context';

/* ── KPI tile ─────────────────────────────────────────────────────────── */
export function MdKpi({
  label, value, subtext, size = 'medium', alert = false, trend, onClick,
}: {
  label: string; value: string; subtext?: string;
  size?: 'large' | 'medium'; alert?: boolean; trend?: 'up' | 'down';
  onClick?: () => void;
}) {
  const inner = (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-1 h-full"
      style={{
        border: alert ? '1px solid #d97706' : '1px solid #dddddd',
        boxShadow: alert ? '0 0 0 3px rgba(217,119,6,0.1)' : 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className={size === 'large' ? 'text-3xl font-bold leading-none' : 'text-2xl font-bold leading-none'} style={{ color: '#222' }}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
          {trend && <span className="font-semibold mr-1" style={{ color: trend === 'up' ? '#16a34a' : '#dc2626' }}>{trend === 'up' ? '▲' : '▼'}</span>}
          {subtext}
        </p>
      )}
    </div>
  );
  if (!onClick) return inner;
  return (
    <button
      type="button" onClick={onClick}
      className="text-left w-full h-full rounded-2xl transition-shadow hover:shadow-[0_0_0_1px_#6a6a6a] focus:outline-none focus-visible:shadow-[0_0_0_2px_#222]"
      style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
    >
      {inner}
    </button>
  );
}

/* ── Health pill ──────────────────────────────────────────────────────── */
export function MdHealth({ health }: { health: 'green' | 'amber' | 'red' }) {
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

/* ── Slide-in drawer ──────────────────────────────────────────────────── */
export function MdDrawer({
  open, onClose, title, subtitle, children,
}: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose} aria-hidden={!open}
        className="fixed inset-0 z-40 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.35)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />
      <aside
        role="dialog" aria-modal="true" aria-label={title}
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 'min(620px, calc(100vw - 64px))', background: '#fff', borderLeft: '1px solid #dddddd',
          boxShadow: '-16px 0 40px -8px rgba(0,0,0,0.2), -4px 0 12px rgba(0,0,0,0.06)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <header className="flex items-start justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: '#222' }}>{title}</h2>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex w-9 h-9 items-center justify-center rounded-full flex-shrink-0" style={{ border: '1px solid #dddddd', color: '#222', background: '#f7f7f7' }}>
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </>
  );
}

/* ── Revenue-mix breakdown (tap a bucket → charge lines) ──────────────── */
type Bucket = 'room' | 'fb' | 'retail' | 'events' | 'other';
const BUCKET_COLOR: Record<Bucket, string> = { room: '#ff385c', fb: '#f97316', retail: '#eab308', events: '#22c55e', other: '#94a3b8' };
const BUCKET_LABEL: Record<Bucket, string> = { room: 'Rooms', fb: 'Restaurant', retail: 'Market', events: 'Events', other: 'Other' };
interface BucketView { bucket: Bucket; label: string; total: number; lines: Array<{ chargeType: string; amount: number }> }

export function MdRevenueMix({ hotelIds }: { hotelIds: string[] }) {
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

  // Phase-1 demo data: always synthesize the portfolio mix for every hotel in
  // scope (see use-scoped-data for the rationale).
  const portfolio = useMemo(
    () => (sortedIds.length === 0 ? null : mockRevenueBreakdown(sortedIds, from, to).portfolio),
    [sortedIds, from, to],
  );

  const buckets = useMemo(() => mapToBuckets(portfolio), [portfolio]);
  const total = buckets.reduce((s, b) => s + b.total, 0);
  const [openBucket, setOpenBucket] = useState<Bucket | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {buckets.map((b) => {
        const open = openBucket === b.bucket;
        const pct = total > 0 ? (b.total / total) * 100 : 0;
        return (
          <div key={b.bucket} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <button type="button" onClick={() => setOpenBucket(open ? null : b.bucket)} className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#fafafa]" style={{ padding: '14px 18px' }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BUCKET_COLOR[b.bucket] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{b.label}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{b.lines.length} charge type{b.lines.length === 1 ? '' : 's'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums" style={{ color: '#222' }}>{formatCurrency(b.total, true)}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{pct.toFixed(0)}% of total</p>
              </div>
              {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} /> : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />}
            </button>
            {open && (
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
  const buckets: Record<Bucket, BucketView> = {
    room: empty('room'), fb: empty('fb'), retail: empty('retail'), events: empty('events'), other: empty('other'),
  };
  if (!portfolio) return Object.values(buckets);
  const push = (b: Bucket, lines: ApiRevenueLine[]) => {
    for (const l of lines) {
      buckets[b].total += l.amount;
      const ex = buckets[b].lines.find((x) => x.chargeType === l.label);
      if (ex) ex.amount += l.amount; else buckets[b].lines.push({ chargeType: l.label, amount: l.amount });
    }
  };
  for (const t of portfolio.types) {
    if (t.type === 'Room Revenue' || t.type === 'No Show Room Revenue') {
      for (const g of t.groups) push('room', g.lines);
      continue;
    }
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

/* ── CSAT tier (inlined to stay standalone) ──────────────────────────── */
export function mdCsatTier(rating: number): { label: string; alert: boolean } {
  if (rating >= 4.5) return { label: 'Excellent', alert: false };
  if (rating >= 4.2) return { label: 'Good', alert: false };
  if (rating >= 4.0) return { label: 'Fair', alert: false };
  if (rating >= 3.7) return { label: 'Needs work', alert: true };
  return { label: 'Poor', alert: true };
}
