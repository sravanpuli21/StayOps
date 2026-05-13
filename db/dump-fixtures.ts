/**
 * One-off helper: dumps rich in-memory fixtures from @hos/shared to JSON
 * files under db/fixtures/, so the (.mjs) seed script can read them without
 * needing a TS loader.
 *
 * Run with: pnpm tsx db/dump-fixtures.ts
 *
 * Re-run any time in-memory mock data changes; the produced JSONs are
 * checked into git so seed.mjs has a stable input.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAINTENANCE_TICKETS, AUDIT_TASKS,
  SRAVAN_EMPLOYEE, SRAVAN_SCHEDULE, SRAVAN_CLOCK_LOG, SRAVAN_AVAILABILITY,
  SRAVAN_PAYSTUBS, SRAVAN_BONUSES, SRAVAN_COLLEAGUES, SRAVAN_OPEN_SHIFTS,
  SRAVAN_SWAP_REQUESTS, SRAVAN_SOPS,
  ASSETS, ASSET_HOTEL_SUMMARIES, VENDOR_SPENDS,
  ANNUAL_TARGETS, HOTEL_TARGETS, STRATEGIC_INITIATIVES, CAPEX_PIPELINE,
} from '@hos/shared';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, 'fixtures');
mkdirSync(fixturesDir, { recursive: true });

const dump = (name: string, data: unknown) =>
  writeFileSync(join(fixturesDir, `${name}.json`), JSON.stringify(data, null, 2));

dump('maintenance-tickets', MAINTENANCE_TICKETS);
dump('audit-tasks',         AUDIT_TASKS);

dump('sravan-profile',      SRAVAN_EMPLOYEE);
dump('sravan-schedule',     SRAVAN_SCHEDULE);
dump('sravan-clock',        SRAVAN_CLOCK_LOG);
dump('sravan-availability', SRAVAN_AVAILABILITY);
dump('sravan-paystubs',     SRAVAN_PAYSTUBS);
dump('sravan-bonuses',      SRAVAN_BONUSES);
dump('sravan-colleagues',   SRAVAN_COLLEAGUES);
dump('sravan-open-shifts',  SRAVAN_OPEN_SHIFTS);
dump('sravan-swaps',        SRAVAN_SWAP_REQUESTS);
dump('sravan-sops',         SRAVAN_SOPS);

dump('assets',              ASSETS);
dump('asset-summaries',     ASSET_HOTEL_SUMMARIES);
dump('vendor-spends',       VENDOR_SPENDS);

dump('annual-targets',      ANNUAL_TARGETS);
dump('hotel-targets',       HOTEL_TARGETS);
dump('initiatives',         STRATEGIC_INITIATIVES);
dump('capex',               CAPEX_PIPELINE);

console.log(`Wrote ${MAINTENANCE_TICKETS.length} tickets, ${AUDIT_TASKS.length} audit tasks,`);
console.log(`      ${SRAVAN_SCHEDULE.length} sravan shifts, ${SRAVAN_PAYSTUBS.length} paystubs, ${SRAVAN_COLLEAGUES.length} colleagues,`);
console.log(`      ${ASSETS.length} assets, ${VENDOR_SPENDS.length} vendors,`);
console.log(`      ${ANNUAL_TARGETS.length} annual targets, ${HOTEL_TARGETS.length} hotel targets, ${CAPEX_PIPELINE.length} capex items.`);
