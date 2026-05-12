'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  aggregateMixBreakdown, type MixBucket,
  formatCurrency,
} from '@hos/shared';

const BUCKET_COLOR: Record<MixBucket, string> = {
  room:   '#ff385c',
  fb:     '#f97316',
  retail: '#eab308',
  events: '#22c55e',
  other:  '#94a3b8',
};

interface Props {
  hotelIds: string[];
  /** Which bucket is open by default. Use `null` to start collapsed. */
  initialOpen?: MixBucket | null;
  /** If true, render a compact variant (used inside the dashboard drawer). */
  compact?: boolean;
  /** Period multiplier from the active date filter (1 = one day). */
  multiplier?: number;
}

/**
 * Revenue mix by source — 5 bucket cards (Rooms / F&B / Retail / Events / Other)
 * with inline expansion to show individual OnQ charge-type line items.
 * Used by both the Total Revenue drawer on the dashboard and the Revenue page.
 */
export function RevenueMixBreakdown({
  hotelIds, initialOpen = 'room', compact = false, multiplier = 1,
}: Props) {
  const [openBucket, setOpenBucket] = useState<MixBucket | null>(initialOpen);
  const buckets = aggregateMixBreakdown(hotelIds, multiplier);
  const total = buckets.reduce((s, b) => s + b.total, 0);

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
                  {formatCurrency(b.total, true)}
                </p>
                <p className="text-xs" style={{ color: '#929292' }}>{pct.toFixed(0)}% of total</p>
              </div>
              {open
                ? <ChevronDown  className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />
                : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />}
            </button>
            {open && (
              <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
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
                          {formatCurrency(line.amount, true)}
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
