import { z } from 'zod';

// ─── DateRangeKind & related tokens ──────────────────────────────────────────

export const DateRangeKindSchema = z.enum([
  'today', 'yesterday', 'week', 'month', 'pay-period', 'ytd', 'custom',
]);
export type DateRangeKind = z.infer<typeof DateRangeKindSchema>;

// ─── Query schemas ────────────────────────────────────────────────────────────

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const DateRangeQuerySchema = z.object({
  kind: DateRangeKindSchema.optional(),
  from: IsoDate.optional(),
  to: IsoDate.optional(),
});
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

/**
 * Scope query shared across revenue/labour/daily scoped endpoints.
 * `hotelIds` is tri-state on the wire:
 *   - param absent (`?from=...&to=...`)            → null  → "all hotels"
 *   - empty value (`?hotelIds=&from=...&to=...`)   → []    → empty scope, rows: []
 *   - csv values  (`?hotelIds=BTRCI,SAVMD&...`)    → ['BTRCI','SAVMD']
 */
export const ScopedQuerySchema = z.object({
  hotelIds: z.array(z.string()).nullable(),
  from: IsoDate,
  to: IsoDate,
});
export type ScopedQuery = z.infer<typeof ScopedQuerySchema>;

export const PropertyQuerySchema = z.object({
  hotelId: z.string().min(1),
  from: IsoDate,
  to: IsoDate,
});
export type PropertyQuery = z.infer<typeof PropertyQuerySchema>;

// ─── Resolved range (server- and client-computed) ────────────────────────────

export const ResolvedRangeSchema = z.object({
  from: IsoDate,
  to: IsoDate,
  days: z.number().int().positive(),
  label: z.string(),
});
export type ResolvedRange = z.infer<typeof ResolvedRangeSchema>;

/**
 * Resolve a DateRangeKind into a concrete {from, to, days, label} window,
 * pinned against a frozen "today" so mock dashboards stay deterministic.
 * Both server (env: STAYOPS_FROZEN_TODAY) and client (NEXT_PUBLIC_*) call it.
 */
export function resolveDateRange(
  kind: DateRangeKind,
  frozenToday: Date,
  custom?: { from: string; to: string },
): ResolvedRange {
  const fmt = (d: Date): string =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  const addDays = (d: Date, n: number): Date => {
    const out = new Date(d);
    out.setUTCDate(out.getUTCDate() + n);
    return out;
  };
  const today = new Date(Date.UTC(
    frozenToday.getUTCFullYear(),
    frozenToday.getUTCMonth(),
    frozenToday.getUTCDate(),
  ));

  switch (kind) {
    case 'today':
      return { from: fmt(today), to: fmt(today), days: 1, label: 'Today' };
    case 'yesterday': {
      const y = addDays(today, -1);
      return { from: fmt(y), to: fmt(y), days: 1, label: 'Yesterday' };
    }
    case 'week': {
      // Monday of the current week, Mon=1 ... Sun=0 → translate to 1..7
      const dow = today.getUTCDay(); // 0=Sun
      const daysFromMon = dow === 0 ? 6 : dow - 1;
      const start = addDays(today, -daysFromMon);
      return { from: fmt(start), to: fmt(today), days: daysFromMon + 1, label: 'This Week' };
    }
    case 'month': {
      const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      const days = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
      return { from: fmt(start), to: fmt(today), days, label: 'This Month' };
    }
    case 'pay-period': {
      // Rolling 14-day window ending yesterday
      const end = addDays(today, -1);
      const start = addDays(end, -13);
      return { from: fmt(start), to: fmt(end), days: 14, label: 'Pay Period' };
    }
    case 'ytd': {
      const start = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      const days = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
      return { from: fmt(start), to: fmt(today), days, label: 'YTD' };
    }
    case 'custom': {
      if (!custom) throw new Error('resolveDateRange: custom kind requires {from,to}');
      const a = new Date(custom.from + 'T00:00:00Z');
      const b = new Date(custom.to + 'T00:00:00Z');
      const days = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
      return { from: custom.from, to: custom.to, days, label: 'Custom' };
    }
  }
}
