#!/usr/bin/env node
/**
 * Wipe metric tables but keep master data (tenants, users, regions, hotels,
 * region_hotels, annual_targets). After running this, the app starts empty —
 * dashboards show <EmptyState>, and data only appears as CSVs arrive via
 * /api/uploads or the Gmail poller.
 *
 * Idempotent. Safe to re-run.
 *
 * Usage:
 *   node db/wipe-metrics.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadDotenv() {
  try {
    const envPath = join(__dirname, '..', 'apps', 'web', '.env.local');
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { /* CI / prod path */ }
}
await loadDotenv();

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1, prepare: false, idle_timeout: 5 });

// Tables to truncate, in an order that respects existing FKs.
// Children (FK-pointing) first, parents last.
const TABLES = [
  // upload audit (cascades to nothing critical)
  'upload_batches',

  // metric children referencing snapshots first
  'am_pm_room_type_rows',
  'am_pm_snapshots',

  // labour
  'labour_departments',
  'labour_periods',

  // operations
  'maintenance_tickets',
  'audit_tasks',
  'employee_records',

  // financial daily
  'daily_revenue',
  'daily_occupancy',
  'rate_events',

  // assets & vendor spend
  'assets',
  'asset_hotel_summaries',
  'vendor_spends',

  // OnQ extras (created by 0012 — guard with table existence check below)
  'payment_method_mix',
  'market_segment_mix',
  'tax_breakdown',
  'ledger_balances',
  'room_snapshots',
  'reservation_arrivals',
  'high_balance_alerts',
];

// Determine which tables actually exist (some are added by later migrations).
const existing = new Set(
  (await sql`
    select tablename from pg_tables where schemaname = 'public'
  `).map((r) => r.tablename),
);

const toTruncate = TABLES.filter((t) => existing.has(t));

if (toTruncate.length === 0) {
  console.log('No metric tables present — nothing to wipe.');
  await sql.end();
  process.exit(0);
}

const list = toTruncate.join(', ');
console.log(`Truncating ${toTruncate.length} tables…`);
console.log('  ' + toTruncate.join('\n  '));

// Single TRUNCATE statement; RESTART IDENTITY resets sequences; CASCADE not
// needed because we ordered children-first.
await sql.unsafe(`truncate table ${list} restart identity`);

// Quick sanity report
const counts = await Promise.all(
  toTruncate.map(async (t) => {
    const r = await sql.unsafe(`select count(*)::int as n from ${t}`);
    return { table: t, count: r[0].n };
  }),
);
const masterCounts = await Promise.all(
  ['tenants', 'users', 'regions', 'hotels', 'region_hotels'].map(async (t) => {
    if (!existing.has(t)) return { table: t, count: 0 };
    const r = await sql.unsafe(`select count(*)::int as n from ${t}`);
    return { table: t, count: r[0].n };
  }),
);

console.log('\nMetric tables (post-wipe):');
for (const c of counts) console.log(`  ${c.table.padEnd(28)} ${c.count}`);
console.log('\nMaster tables (kept):');
for (const c of masterCounts) console.log(`  ${c.table.padEnd(28)} ${c.count}`);

await sql.end();
console.log('\nDone. App now starts empty until CSVs arrive.');
