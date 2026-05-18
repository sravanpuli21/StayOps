'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  formatCurrency, resolveDateRange, type DateRangeKind,
  type ApiRevenueBreakdown, type ApiRevenueLine,
} from '@hos/shared';

/** Full currency w/ cents for daily numbers; compact $k for MTD / YTD totals. */
const formatExact = (v: number): string =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { useDateFilter } from '@/lib/date-filter-context';

type DisplayBucket = 'room' | 'fb' | 'retail' | 'events' | 'other';

const BUCKET_COLOR: Record<DisplayBucket, string> = {
  room:   '#ff385c',
  fb:     '#f97316',
  retail: '#eab308',
  events: '#22c55e',
  other:  '#94a3b8',
};

const BUCKET_LABEL: Record<DisplayBucket, string> = {
  room:   'Rooms',
  fb:     'Restaurant',
  retail: 'Market',
  events: 'Events',
  other:  'Other',
};

interface BucketView {
  bucket: DisplayBucket;
  label:  string;
  total:  number;
  lines:  Array<{ chargeType: string; amount: number }>;
}

interface Props {
  hotelIds: string[];
  /** Which bucket is open by default. Use `null` to start collapsed. */
  initialOpen?: DisplayBucket | null;
  /** Compact variant (used inside the dashboard drawer). */
  compact?: boolean;
  /** Days in the active window — kept for back-compat with callers. */
  days?: number;
}

/**
 * Revenue mix by source — 5 bucket cards (Rooms / Restaurant / Market /
 * Events / Other) with inline expansion to show individual OnQ source-row
 * line items. Reads live data from `/api/revenue/breakdown`, which aggregates
 * `night_audit_rows` for the active scope+window.
 */
export function RevenueMixBreakdown({
  hotelIds, initialOpen = null, compact = false,
}: Props) {
  const { range, customFrom, customTo } = useDateFilter();
  const sortedIds = useMemo(() => [...hotelIds].sort(), [hotelIds]);

  const { from, to } = useMemo(() => {
    if (range === 'custom') {
      const f = customFrom || customTo;
      const t = customTo   || customFrom;
      if (f && t) return { from: f, to: t };
    }
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range, customFrom, customTo]);

  const agg: 'today' | 'mtd' | 'ytd' =
    range === 'month' ? 'mtd' : range === 'ytd' ? 'ytd' : 'today';
  const isCumulative = agg !== 'today';
  const fmt = (v: number): string => (isCumulative ? formatCurrency(v, true) : formatExact(v));
  const { data } = useApi(apiKeys.revenueBreakdown(sortedIds, from, to, agg));
  const portfolio = data?.portfolio ?? null;

  const buckets = useMemo(() => mapToBuckets(portfolio), [portfolio]);
  const total = buckets.reduce((s, b) => s + b.total, 0);

  const [openBucket, setOpenBucket] = useState<DisplayBucket | null>(initialOpen);

  return (
    <div className="flex flex-col gap-2">
      {buckets.map((b) => {
        const open = openBucket === b.bucket;
        const pct = total > 0 ? (b.total / total) * 100 : 0;
        return (
          <div
            key={b.bucket}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid #dddddd', background: '#ffffff' }}
          >
            <button
              type="button"
              onClick={() => setOpenBucket(open ? null : b.bucket)}
              className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#fafafa]"
              style={{ padding: compact ? '12px 16px' : '14px 18px' }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: BUCKET_COLOR[b.bucket] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>
                  {b.label}
                </p>
                <p className="text-xs" style={{ color: '#929292' }}>
                  {b.lines.length} charge type{b.lines.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums" style={{ color: '#222' }}>
                  {fmt(b.total)}
                </p>
                <p className="text-xs" style={{ color: '#929292' }}>{pct.toFixed(0)}% of total</p>
              </div>
              {open
                ? <ChevronDown  className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />
                : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />}
            </button>
            {open && (
              <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                {b.lines.length === 0 && (
                  <div className="px-4 py-3 text-xs italic" style={{ color: '#929292' }}>
                    No line items in this window.
                  </div>
                )}
                {b.lines.map((line) => {
                  const linePct = b.total > 0 ? (line.amount / b.total) * 100 : 0;
                  return (
                    <div
                      key={line.chargeType}
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: '1px solid #f0f0f0' }}
                    >
                      <p className="text-sm" style={{ color: '#3f3f3f' }}>{line.chargeType}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums" style={{ color: '#222' }}>
                          {fmt(line.amount)}
                        </p>
                        <p className="text-[10px]" style={{ color: '#929292' }}>
                          {linePct.toFixed(0)}% of {b.label}
                        </p>
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

/**
 * Project the 4-level taxonomy returned by /api/revenue/breakdown into the
 * existing 5 display buckets:
 *   - Rooms       = Room Revenue + No Show Room Revenue   (all lines)
 *   - Restaurant  = Charges / F&B / Restaurant            (lines)
 *   - Market      = Charges / F&B / Front Market          (lines)
 *   - Events      = Charges / Events                      (lines)
 *   - Other       = Charges / Additional Room Charges + Other Charges (lines)
 */
function mapToBuckets(portfolio: ApiRevenueBreakdown | null): BucketView[] {
  const empty = (bucket: DisplayBucket): BucketView => ({
    bucket, label: BUCKET_LABEL[bucket], total: 0, lines: [],
  });
  const buckets: Record<DisplayBucket, BucketView> = {
    room:   empty('room'),
    fb:     empty('fb'),
    retail: empty('retail'),
    events: empty('events'),
    other:  empty('other'),
  };
  if (!portfolio) return Object.values(buckets);

  const pushLines = (b: DisplayBucket, lines: ApiRevenueLine[]) => {
    for (const l of lines) {
      buckets[b].total += l.amount;
      const existing = buckets[b].lines.find((x) => x.chargeType === l.label);
      if (existing) existing.amount += l.amount;
      else buckets[b].lines.push({ chargeType: l.label, amount: l.amount });
    }
  };

  for (const t of portfolio.types) {
    if (t.type === 'Room Revenue' || t.type === 'No Show Room Revenue') {
      for (const g of t.groups) pushLines('room', g.lines);
      continue;
    }
    if (t.type === 'Charges') {
      for (const g of t.groups) {
        if (g.group === 'Events') {
          pushLines('events', g.lines);
        } else if (g.group === 'F&B') {
          pushLines('fb',     g.lines.filter((l) => l.subtype === 'Restaurant'));
          pushLines('retail', g.lines.filter((l) => l.subtype === 'Front Market'));
        } else if (g.group === 'Additional Room Charges' || g.group === 'Other Charges') {
          pushLines('other', g.lines);
        }
      }
    }
  }

  // Sort each bucket's line items by amount desc for a stable, scan-friendly view.
  for (const b of Object.values(buckets)) b.lines.sort((a, b) => b.amount - a.amount);

  return Object.values(buckets);
}
