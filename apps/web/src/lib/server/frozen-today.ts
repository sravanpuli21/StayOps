import 'server-only';

/**
 * Mock mode anchors every "today" to a deterministic frozen date so dashboards
 * stay repeatable across restarts. When real DB lands, this is replaced with
 * `new Date()` (or a per-tenant clock) without touching route handlers.
 */
export function frozenToday(): Date {
  const iso = process.env.STAYOPS_FROZEN_TODAY ?? '2026-05-12';
  return new Date(iso + 'T00:00:00Z');
}
