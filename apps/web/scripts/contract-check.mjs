#!/usr/bin/env node
/**
 * Contract smoke-check: hits each /api/* endpoint on a running dev server.
 * Each route handler already calls `Schema.parse(...)` server-side, so a
 * 200 + valid JSON response is sufficient evidence that the contract holds.
 *
 * Usage:
 *   pnpm dev         # in another terminal
 *   pnpm contract-check
 *
 * Optional: BASE=http://localhost:3001 pnpm contract-check
 */
const BASE = process.env.BASE ?? 'http://localhost:3000';
const HOTEL = 'BTRCI';
const FROM = '2026-05-01';
const TO = '2026-05-12';

const expectKey = (name) => (json) => {
  if (!json || typeof json !== 'object' || !(name in json)) {
    throw new Error(`response missing top-level "${name}" key`);
  }
};
const expectAny = () => () => {};

const checks = [
  ['/api/hotels',                                                                expectKey('hotels')],
  [`/api/revenue/scoped?from=${FROM}&to=${TO}`,                                  expectKey('rows')],
  [`/api/revenue/property?hotelId=${HOTEL}&from=${FROM}&to=${TO}`,               expectKey('summary')],
  [`/api/labour/scoped?from=${FROM}&to=${TO}`,                                   expectKey('rows')],
  [`/api/labour/property?hotelId=${HOTEL}&from=${FROM}&to=${TO}`,                expectKey('summary')],
  [`/api/daily-metrics/scoped?from=${FROM}&to=${TO}`,                            expectKey('rows')],
  [`/api/daily-metrics/property?hotelId=${HOTEL}&from=${FROM}&to=${TO}`,         expectKey('summary')],
  ['/api/anomalies',                                                             expectKey('anomalies')],
  ['/api/alerts',                                                                expectKey('flags')],
  ['/api/intelligence',                                                          expectKey('decisions')],
  ['/api/leaders/gm-scores',                                                     expectKey('scores')],
  ['/api/leaders/regional-scores',                                               expectKey('scores')],
  [`/api/ops/rooms?hotelId=${HOTEL}`,                                            expectKey('rooms')],
  [`/api/ops/tickets?hotelId=${HOTEL}`,                                          expectKey('tickets')],
  [`/api/ops/summary?hotelId=${HOTEL}`,                                          expectKey('summary')],
  ['/api/ops/stale-dirty',                                                       expectKey('rooms')],
  [`/api/employees?hotelId=${HOTEL}`,                                            expectKey('employees')],
  [`/api/audits/summary?hotelId=${HOTEL}`,                                       expectKey('summary')],
  [`/api/audits/tasks?hotelId=${HOTEL}`,                                         expectKey('tasks')],
  ['/api/assets',                                                                expectKey('assets')],
  ['/api/assets/summary',                                                        expectKey('summaries')],
  ['/api/vendor-spend',                                                          expectKey('vendors')],
  ['/api/am-pm-report?slot=AM',                                                  expectKey('rows')],
  ['/api/ota/channel-rows',                                                      expectKey('rows')],
  ['/api/strategy/annual-targets',                                               expectKey('targets')],
  ['/api/strategy/hotel-targets',                                                expectKey('targets')],
  ['/api/strategy/initiatives',                                                  expectKey('initiatives')],
  ['/api/strategy/capex-pipeline',                                               expectKey('pipeline')],
  ['/api/sravan/profile',                                                        expectKey('profile')],
  ['/api/sravan/schedule',                                                       expectKey('shifts')],
  ['/api/sravan/clock',                                                          expectAny()],
  ['/api/sravan/availability',                                                   expectAny()],
  ['/api/sravan/paystubs',                                                       expectKey('paystubs')],
  ['/api/sravan/bonuses',                                                        expectKey('bonuses')],
  ['/api/sravan/colleagues',                                                     expectKey('colleagues')],
  ['/api/sravan/swaps',                                                          expectKey('swaps')],
  ['/api/sravan/open-shifts',                                                    expectKey('openShifts')],
  ['/api/sravan/sops',                                                           expectKey('sops')],
];

let failures = 0;
for (const [path, assertShape] of checks) {
  const url = BASE + path;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) {
      console.error(`✗ ${path} — HTTP ${res.status}`);
      failures++;
      continue;
    }
    const json = await res.json();
    assertShape(json);
    console.log(`✓ ${path}`);
  } catch (err) {
    console.error(`✗ ${path} — ${err instanceof Error ? err.message : err}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} contract failure${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} contracts pass.`);
