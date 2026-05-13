#!/usr/bin/env node
/**
 * StayOps Phase 1.A seed.
 *
 * Idempotent. Inserts:
 *   - 1 tenant (hos), 4 users (kris/harshal/gautham/rishab), 2 regions
 *   - 16 hotels, region_hotels join
 *   - 90 days of daily_revenue + daily_occupancy per hotel (jittered series)
 *   - 6 bi-weekly labour_periods + department splits per hotel
 *
 * Idempotency: every insert uses ON CONFLICT DO UPDATE on natural keys, so
 * re-running this against a populated DB just re-stamps the rows with fresh
 * jitter. Safe for dev. Run after `node db/migrate.mjs`.
 */
import { readFileSync, existsSync } from 'node:fs';
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
  } catch {}
}
await loadDotenv();

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }
const FROZEN_TODAY = process.env.STAYOPS_FROZEN_TODAY ?? '2026-05-12';

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1, prepare: false });

// ─── Hotel master list (mirrors packages/shared/src/data/hotels.ts) ──────────
const HOTELS = [
  { code: 'SAVGW',   name: 'Hampton Inn & Suites - Gateway',     short: 'Hampton Gateway',       brand: 'Hilton',   city: 'Savannah',     state: 'GA', rooms:  92, pms: 'onq',              region: 'gautham', adr: 158 },
  { code: 'SAVVY',   name: 'Cotton Sail Hotel',                  short: 'Cotton Sail',           brand: 'Hilton',   city: 'Savannah',     state: 'GA', rooms:  56, pms: 'onq',              region: 'gautham', adr: 182 },
  { code: 'GA989',   name: 'Cambria Hotel - Savannah',           short: 'Cambria Savannah',      brand: 'Choice',   city: 'Savannah',     state: 'GA', rooms: 101, pms: 'choice-advantage', region: 'gautham', adr: 168 },
  { code: 'SAVMT',   name: 'Hilton Garden Inn - Midtown',        short: 'Hilton Garden Midtown', brand: 'Hilton',   city: 'Savannah',     state: 'GA', rooms: 132, pms: 'onq',              region: 'gautham', adr: 166 },
  { code: 'SAVMD',   name: 'Hampton Inn & Suites - Midtown',     short: 'Hampton Midtown',       brand: 'Hilton',   city: 'Savannah',     state: 'GA', rooms: 120, pms: 'onq',              region: 'gautham', adr: 161 },
  { code: 'RISAV',   name: 'Residence Inn Savannah Midtown',     short: 'Residence Inn Midtown', brand: 'Marriott', city: 'Savannah',     state: 'GA', rooms:  66, pms: 'marsha',           region: 'gautham', adr: 174 },
  { code: 'SAVFP',   name: 'Fairfield/TPS - Pooler, GA',         short: 'Fairfield Pooler',      brand: 'Marriott', city: 'Pooler',       state: 'GA', rooms: 158, pms: 'marsha',           region: 'gautham', adr: 165 },
  { code: 'BQKCY',   name: 'Courtyard - Brunswick',              short: 'Courtyard Brunswick',   brand: 'Marriott', city: 'Brunswick',    state: 'GA', rooms:  93, pms: 'marsha',           region: 'gautham', adr: 148 },
  { code: 'BSWVE',   name: 'Hampton Inn & Suites - Brunswick',   short: 'Hampton Brunswick',     brand: 'Hilton',   city: 'Brunswick',    state: 'GA', rooms:  97, pms: 'onq',              region: 'harshal', adr: 153 },
  { code: 'GAA84',   name: 'Woodspring - Brunswick',             short: 'Woodspring Brunswick',  brand: 'Choice',   city: 'Brunswick',    state: 'GA', rooms: 122, pms: 'choice-advantage', region: 'harshal', adr: 124 },
  { code: 'BQKFP',   name: 'Four Points by Marriott',            short: 'Four Points',           brand: 'Marriott', city: 'Brunswick',    state: 'GA', rooms: 113, pms: 'marsha',           region: 'harshal', adr: 151 },
  { code: 'SGJES',   name: 'Holiday Inn Express - St. Augustine',short: 'Holiday Inn Express',   brand: 'IHG',      city: 'St. Augustine',state: 'FL', rooms:  82, pms: 'opera',            region: 'harshal', adr: 136 },
  { code: 'JAXTX',   name: 'Hotel Amalga - St. Augustine',       short: 'Hotel Amalga',          brand: 'Marriott', city: 'St. Augustine',state: 'FL', rooms:  58, pms: 'marsha',           region: 'harshal', adr: 190 },
  { code: 'DFWFW',   name: 'Home2 Suites - Flower Mound TX',     short: 'Home2 TX',              brand: 'Hilton',   city: 'Flower Mound', state: 'TX', rooms:  99, pms: 'onq',              region: 'harshal', adr: 141 },
  { code: 'BTRCI',   name: 'Home2 Suites - Baton Rouge',         short: 'Home2 Baton Rouge',     brand: 'Hilton',   city: 'Baton Rouge',  state: 'LA', rooms: 116, pms: 'onq',              region: 'harshal', adr: 134 },
  { code: '58090LA', name: 'La Quinta Inn and Suites',           short: 'La Quinta',             brand: 'Wyndham',  city: 'Hinesville',   state: 'GA', rooms:  80, pms: 'sabre',            region: 'harshal', adr: 128 },
];

// Per-hotel baseline: occupancy %, ADR, total revenue (one day) — mirrors revenue.ts
const BASELINE = {
  SAVGW:   { occ: 83, adr: 162, total: 18200, rating: 4.3, propType: 'limited'  },
  SAVVY:   { occ: 84, adr: 189, total: 19900, rating: 4.6, propType: 'full'     },
  GA989:   { occ: 88, adr: 174, total: 24300, rating: 4.5, propType: 'full'     },
  SAVMT:   { occ: 77, adr: 158, total: 17600, rating: 4.1, propType: 'full'     },
  SAVMD:   { occ: 80, adr: 155, total: 21600, rating: 4.2, propType: 'limited'  },
  RISAV:   { occ: 86, adr: 178, total: 16400, rating: 4.4, propType: 'extended' },
  SAVFP:   { occ: 91, adr: 171, total: 29400, rating: 4.3, propType: 'full'     },
  BQKCY:   { occ: 78, adr: 142, total: 16900, rating: 4.0, propType: 'full'     },
  BSWVE:   { occ: 81, adr: 149, total: 18100, rating: 4.2, propType: 'limited'  },
  GAA84:   { occ: 74, adr: 118, total: 15800, rating: 3.9, propType: 'limited'  },
  BQKFP:   { occ: 79, adr: 145, total: 18900, rating: 4.1, propType: 'full'     },
  SGJES:   { occ: 82, adr: 138, total: 14700, rating: 4.3, propType: 'limited'  },
  JAXTX:   { occ: 87, adr: 196, total: 15200, rating: 4.7, propType: 'full'     },
  DFWFW:   { occ: 85, adr: 129, total: 13720, rating: 3.9, propType: 'extended' },
  BTRCI:   { occ: 83, adr: 131, total: 17900, rating: 4.2, propType: 'extended' },
  '58090LA': { occ: 76, adr: 122, total: 12900, rating: 4.0, propType: 'limited' },
};

const MIX_RATIOS = {
  full:     { room: 0.65, fb: 0.16, retail: 0.09, events: 0.07, other: 0.03 },
  limited:  { room: 0.72, fb: 0.10, retail: 0.09, events: 0.06, other: 0.03 },
  extended: { room: 0.78, fb: 0.05, retail: 0.10, events: 0.04, other: 0.03 },
};

// Labour baseline (from labour.ts): scheduled, clocked, OT, payroll per period.
const LABOUR = {
  SAVGW:   [694, 712, 9,  36480], SAVVY:   [432, 426, 3,  23140],
  GA989:   [768, 799, 13, 41856], SAVMT:   [965, 1024, 21, 53432],
  SAVMD:   [832, 851, 14, 45248], RISAV:   [510, 502, 4,  27540],
  SAVFP:   [1142, 1201, 18, 61240], BQKCY: [712, 728, 11, 38280],
  BSWVE:   [738, 754, 8,  39960], GAA84:   [524, 541, 6,  26200],
  BQKFP:   [856, 870, 12, 45620], SGJES:   [624, 632, 5,  33020],
  JAXTX:   [438, 432, 3,  23800], DFWFW:   [752, 783, 16, 39120],
  BTRCI:   [840, 868, 14, 44280], '58090LA': [608, 619, 7, 31360],
};

const DEPT_SPLITS = [
  ['Housekeeping', 0.36],
  ['Front Desk',   0.21],
  ['Kitchen',      0.17],
  ['Maintenance',  0.12],
  ['Market',       0.09],
  ['Event Space',  0.05],
];

// ─── Deterministic seeded jitter ─────────────────────────────────────────────
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function jitter(seed, spread) {
  return 1 + ((hash(seed) % 1000) / 1000 - 0.5) * 2 * spread;
}
const WEEKLY_MULT = [0.95, 0.88, 0.90, 0.94, 0.98, 1.09, 1.12]; // Sun..Sat

function isoAddDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Begin transaction ───────────────────────────────────────────────────────
console.log(`Seeding against ${DATABASE_URL.split('@')[1]?.split('/')[0] ?? 'unknown'}…`);

await sql.begin(async (tx) => {
  // tenant
  await tx`
    insert into tenants (slug, name, plan) values ('hos', 'HOS Management', 'free')
    on conflict (slug) do update set name = excluded.name, plan = excluded.plan
  `;
  const [tenant] = await tx`select id from tenants where slug = 'hos'`;

  // users
  for (const u of [
    ['kris@hos.com',    'Kris Patel',     'md'],
    ['harshal@hos.com', 'Harshal Patel',  'regional'],
    ['gautham@hos.com', 'Gautham Shetty', 'regional'],
    ['rishab@hos.com',  'Rishab Patel',   'gm'],
  ]) {
    await tx`
      insert into users (tenant_id, email, name, role)
      values (${tenant.id}, ${u[0]}, ${u[1]}, ${u[2]})
      on conflict (tenant_id, email) do update set name = excluded.name, role = excluded.role
    `;
  }

  // regions
  for (const r of [
    ['gautham-region', 'Gautham Region', 'gautham@hos.com'],
    ['harshal-region', 'Harshal Region', 'harshal@hos.com'],
  ]) {
    await tx`
      insert into regions (tenant_id, slug, name, director_user_id)
      values (
        ${tenant.id}, ${r[0]}, ${r[1]},
        (select id from users where email = ${r[2]} and tenant_id = ${tenant.id} limit 1)
      )
      on conflict (tenant_id, slug) do update set name = excluded.name
    `;
  }

  // hotels
  for (const h of HOTELS) {
    const regionSlug = `${h.region}-region`;
    await tx`
      insert into hotels (
        tenant_id, code, name, short_name, brand, parent_chain,
        city, state, total_rooms, pms, region_id, market_adr
      )
      values (
        ${tenant.id}, ${h.code}, ${h.name}, ${h.short}, ${h.brand}, ${h.brand},
        ${h.city}, ${h.state}, ${h.rooms}, ${h.pms},
        (select id from regions where tenant_id = ${tenant.id} and slug = ${regionSlug}),
        ${h.adr}
      )
      on conflict (tenant_id, code) do update set
        name = excluded.name, short_name = excluded.short_name,
        brand = excluded.brand, total_rooms = excluded.total_rooms,
        region_id = excluded.region_id, market_adr = excluded.market_adr
    `;
  }

  // BTRCI gm = Rishab
  await tx`
    update hotels set gm_user_id = (
      select id from users where email = 'rishab@hos.com' and tenant_id = ${tenant.id} limit 1
    )
    where code = 'BTRCI' and tenant_id = ${tenant.id}
  `;

  // region_hotels mirror
  await tx`
    insert into region_hotels (region_id, hotel_id)
    select h.region_id, h.id from hotels h
    where h.tenant_id = ${tenant.id} and h.region_id is not null
    on conflict do nothing
  `;

  // ─── 90 days of daily revenue + occupancy per hotel ────────────────────────
  const hotelRows = await tx`select id, code, total_rooms, market_adr from hotels where tenant_id = ${tenant.id}`;
  const hotelById = new Map(hotelRows.map((h) => [h.code, h]));

  const SERIES_DAYS = 90;
  let revRows = 0, occRows = 0;
  for (let i = SERIES_DAYS - 1; i >= 0; i--) {
    const date = isoAddDays(FROZEN_TODAY, -i);
    const dow = new Date(date + 'T00:00:00Z').getUTCDay();
    const wmult = WEEKLY_MULT[dow];

    for (const code of Object.keys(BASELINE)) {
      const hotel = hotelById.get(code);
      if (!hotel) continue;
      const base = BASELINE[code];

      const dj  = jitter(`${code}-${date}`, 0.08);
      const oj  = jitter(`occ-${code}-${date}`, 0.04);
      const rj  = jitter(`rating-${code}-${date}`, 0.04);
      const oo  = jitter(`ooo-${code}-${date}`, 0.6);

      const occ = Math.max(0, Math.min(100, base.occ * wmult * oj));
      const adr = Math.round(base.adr * dj);
      const totalRev = Math.round(base.total * wmult * dj);
      const roomRev = Math.round(totalRev * MIX_RATIOS[base.propType].room);
      const nonRoom = totalRev - roomRev;
      const m = MIX_RATIOS[base.propType];
      const mixRoom   = Math.round(totalRev * m.room);
      const mixFb     = Math.round(totalRev * m.fb);
      const mixRetail = Math.round(totalRev * m.retail);
      const mixEvents = Math.round(totalRev * m.events);
      const mixOther  = totalRev - mixRoom - mixFb - mixRetail - mixEvents;
      const revpar = Math.round(adr * (occ / 100));
      const roomsSold = Math.max(0, Math.round(hotel.total_rooms * (occ / 100)));
      const roomsOoo = Math.max(0, Math.round(2 * oo));
      const rating = Math.max(1, Math.min(5, base.rating + (rj - 1)));
      const health = occ >= 85 ? 'green' : occ >= 75 ? 'amber' : 'red';

      await tx`
        insert into daily_revenue (
          hotel_id, date, total_revenue, room_revenue, non_room_revenue,
          mix_room, mix_fb, mix_retail, mix_events, mix_other,
          adr, revpar, occupancy_pct, market_adr, health, source
        )
        values (
          ${hotel.id}, ${date}::date, ${totalRev}, ${roomRev}, ${nonRoom},
          ${mixRoom}, ${mixFb}, ${mixRetail}, ${mixEvents}, ${mixOther},
          ${adr}, ${revpar}, ${occ.toFixed(2)}, ${hotel.market_adr ?? base.adr}, ${health}, 'seed'
        )
        on conflict (hotel_id, date) do update set
          total_revenue = excluded.total_revenue,
          room_revenue = excluded.room_revenue,
          non_room_revenue = excluded.non_room_revenue,
          mix_room = excluded.mix_room, mix_fb = excluded.mix_fb,
          mix_retail = excluded.mix_retail, mix_events = excluded.mix_events,
          mix_other = excluded.mix_other,
          adr = excluded.adr, revpar = excluded.revpar,
          occupancy_pct = excluded.occupancy_pct,
          health = excluded.health
      `;
      revRows++;

      await tx`
        insert into daily_occupancy (hotel_id, date, rooms_sold, rooms_ooo, avg_customer_rating)
        values (${hotel.id}, ${date}::date, ${roomsSold}, ${roomsOoo}, ${rating.toFixed(2)})
        on conflict (hotel_id, date) do update set
          rooms_sold = excluded.rooms_sold,
          rooms_ooo = excluded.rooms_ooo,
          avg_customer_rating = excluded.avg_customer_rating
      `;
      occRows++;
    }
  }
  console.log(`  daily_revenue: ${revRows} rows, daily_occupancy: ${occRows} rows`);

  // ─── 6 bi-weekly labour periods per hotel ────────────────────────────────
  // Last period ends on the most recent Sunday before FROZEN_TODAY.
  const today = new Date(FROZEN_TODAY + 'T00:00:00Z');
  const dow = today.getUTCDay();
  const daysToLastSunday = dow === 0 ? 7 : dow;
  const latestEnd = isoAddDays(FROZEN_TODAY, -daysToLastSunday);

  let labourPeriodRows = 0, labourDeptRows = 0;
  for (let p = 0; p < 6; p++) {
    const periodEnd = isoAddDays(latestEnd, -p * 14);
    const periodStart = isoAddDays(periodEnd, -13);

    for (const code of Object.keys(LABOUR)) {
      const hotel = hotelById.get(code);
      if (!hotel) continue;
      const [bSched, bClock, bOt, bPay] = LABOUR[code];
      const j = jitter(`${code}-${periodEnd}`, 0.06);
      const sched = Math.round(bSched * j);
      const clock = Math.round(bClock * j);
      const ot    = Math.round(bOt * j);
      const pay   = Math.round(bPay * j);
      const variance = clock - sched;
      const health = variance > 30 || ot > 18 ? 'red' : variance > 15 || ot > 8 ? 'amber' : 'green';

      await tx`
        insert into labour_periods (
          hotel_id, period_end, period_start,
          scheduled_hours, clocked_hours, overtime_hours, payroll_cost,
          health, source
        ) values (
          ${hotel.id}, ${periodEnd}::date, ${periodStart}::date,
          ${sched}, ${clock}, ${ot}, ${pay},
          ${health}, 'seed'
        )
        on conflict (hotel_id, period_end) do update set
          period_start = excluded.period_start,
          scheduled_hours = excluded.scheduled_hours,
          clocked_hours = excluded.clocked_hours,
          overtime_hours = excluded.overtime_hours,
          payroll_cost = excluded.payroll_cost,
          health = excluded.health
      `;
      labourPeriodRows++;

      const totalShare = DEPT_SPLITS.reduce((s, [, r]) => s + r, 0);
      for (const [dept, share] of DEPT_SPLITS) {
        const dj = jitter(`${code}-${periodEnd}-${dept}`, 0.06);
        const dShare = (share / totalShare) * dj;
        const dSched = Math.round(sched * dShare);
        const dClock = Math.round(clock * dShare);
        const dOt = Math.round(ot * dShare * (dept === 'Housekeeping' ? 1.6 : dept === 'Front Desk' ? 0.9 : 0.4));
        const dPay = Math.round(pay * dShare);
        await tx`
          insert into labour_departments (
            hotel_id, period_end, department,
            scheduled_hours, clocked_hours, overtime_hours, payroll_cost
          ) values (
            ${hotel.id}, ${periodEnd}::date, ${dept},
            ${dSched}, ${dClock}, ${dOt}, ${dPay}
          )
          on conflict (hotel_id, period_end, department) do update set
            scheduled_hours = excluded.scheduled_hours,
            clocked_hours = excluded.clocked_hours,
            overtime_hours = excluded.overtime_hours,
            payroll_cost = excluded.payroll_cost
        `;
        labourDeptRows++;
      }
    }
  }
  console.log(`  labour_periods: ${labourPeriodRows} rows, labour_departments: ${labourDeptRows} rows`);

  // ─── Rooms (one row per hotel × room-number) ────────────────────────────
  // Mirrors generateRoomsForHotel in packages/shared/src/data/operations.ts so
  // status/floor/type/hk_status match what consumer pages were built against.
  const SAVGW_OVERRIDES = {
    '109': { status: 'blocked', hk_status: 'dirty', has_open_ticket: true },
    '215': { status: 'ooo',     hk_status: 'dirty', has_open_ticket: false, ooo_reason: 'Water damage – ceiling repair in progress' },
    '312': { status: 'blocked', hk_status: 'dirty', has_open_ticket: true },
    '315': { status: 'ooo',     hk_status: 'dirty', ooo_reason: 'Active repair – drywall work' },
    '411': { status: 'blocked', hk_status: 'dirty', has_open_ticket: true },
    '412': { status: 'ooo',     hk_status: 'dirty', ooo_reason: 'HVAC replacement in progress' },
    '508': { status: 'ooo',     hk_status: 'dirty', ooo_reason: 'Pest treatment – 72-hr quarantine' },
    '604': { status: 'ooo',     hk_status: 'dirty', ooo_reason: 'Full renovation – est. completion May 10' },
  };

  let roomRows = 0;
  for (const code of HOTELS.map((h) => h.code)) {
    const hotel = hotelById.get(code);
    if (!hotel) continue;
    const totalRooms = hotel.total_rooms;
    const floors = Math.ceil(totalRooms / 16);
    for (let floor = 1; floor <= floors; floor++) {
      const perFloor = floor < floors ? 16 : totalRooms - (floors - 1) * 16;
      for (let n = 1; n <= perFloor; n++) {
        const roomNumber = `${floor}${n.toString().padStart(2, '0')}`;
        const seed = hash(`${code}-${roomNumber}`);
        const roll = seed % 100;
        let status, hkStatus;
        if      (roll < 44) { status = 'occupied';   hkStatus = 'clean';     }
        else if (roll < 63) { status = 'dirty';      hkStatus = 'dirty';     }
        else if (roll < 73) { status = 'inspecting'; hkStatus = 'clean';     }
        else if (roll < 87) { status = 'ready';      hkStatus = 'inspected'; }
        else if (roll < 94) { status = 'ooo';        hkStatus = 'dirty';     }
        else                { status = 'blocked';    hkStatus = 'dirty';     }
        const type = n <= 8 ? 'King' : 'Queen';
        const hasOpenTicket = status === 'blocked';
        const lastCleaned = status !== 'ooo' ? '2026-04-25T08:30:00Z' : null;
        const lastInspected = hkStatus === 'inspected' ? '2026-04-25T09:45:00Z' : null;
        const lastGuestRating = status === 'occupied' ? Math.round((3.6 + (seed % 14) / 10) * 100) / 100 : null;

        let row = {
          hotelId: hotel.id, number: roomNumber, floor, type, status,
          hk_status: hkStatus, last_cleaned: lastCleaned, last_inspected: lastInspected,
          has_open_ticket: hasOpenTicket, ooo_reason: null, last_guest_rating: lastGuestRating,
        };
        if (code === 'SAVGW' && SAVGW_OVERRIDES[roomNumber]) {
          row = { ...row, ...SAVGW_OVERRIDES[roomNumber] };
        }

        await tx`
          insert into rooms (
            hotel_id, number, floor, type, status, hk_status,
            last_cleaned, last_inspected, has_open_ticket, ooo_reason, last_guest_rating
          )
          values (
            ${row.hotelId}, ${row.number}, ${row.floor}, ${row.type}, ${row.status}, ${row.hk_status},
            ${row.last_cleaned}, ${row.last_inspected}, ${row.has_open_ticket}, ${row.ooo_reason}, ${row.last_guest_rating}
          )
          on conflict (hotel_id, number) do update set
            floor = excluded.floor, type = excluded.type,
            status = excluded.status, hk_status = excluded.hk_status,
            last_cleaned = excluded.last_cleaned, last_inspected = excluded.last_inspected,
            has_open_ticket = excluded.has_open_ticket,
            ooo_reason = excluded.ooo_reason,
            last_guest_rating = excluded.last_guest_rating
        `;
        roomRows++;
      }
    }
  }
  console.log(`  rooms: ${roomRows} rows`);

  // ─── Maintenance tickets (loaded from db/fixtures/maintenance-tickets.json) ──
  const ticketsFile = join(__dirname, 'fixtures', 'maintenance-tickets.json');
  let ticketRows = 0;
  if (existsSync(ticketsFile)) {
    const tickets = JSON.parse(readFileSync(ticketsFile, 'utf8'));
    for (const t of tickets) {
      const hotel = hotelById.get(t.hotelId);
      if (!hotel) continue;
      await tx`
        insert into maintenance_tickets (
          legacy_id, hotel_id, room_number, area, type, priority, status,
          title, description, reported_by, assigned_to,
          estimated_cost, revenue_lost, activity, source,
          created_at, updated_at
        )
        values (
          ${t.id}, ${hotel.id}, ${t.roomNumber ?? null}, ${t.area ?? null},
          ${t.type}, ${t.priority}, ${t.status},
          ${t.title}, ${t.description ?? null}, ${t.reportedBy ?? null},
          ${t.assignedTo ?? null}, ${t.estimatedCost ?? null}, ${t.revenueLost ?? null},
          ${JSON.stringify(t.activity ?? [])}::jsonb, 'seed',
          ${t.createdAt ?? new Date().toISOString()}::timestamptz,
          ${t.updatedAt ?? new Date().toISOString()}::timestamptz
        )
        on conflict (legacy_id) do update set
          room_number = excluded.room_number, area = excluded.area,
          type = excluded.type, priority = excluded.priority, status = excluded.status,
          title = excluded.title, description = excluded.description,
          reported_by = excluded.reported_by, assigned_to = excluded.assigned_to,
          estimated_cost = excluded.estimated_cost, revenue_lost = excluded.revenue_lost,
          activity = excluded.activity, updated_at = excluded.updated_at
      `;
      ticketRows++;
    }
    console.log(`  maintenance_tickets: ${ticketRows} rows`);
  } else {
    console.log(`  maintenance_tickets: skipped (run "pnpm tsx db/dump-fixtures.ts" first)`);
  }

  // ─── Audit tasks (loaded from db/fixtures/audit-tasks.json) ──────────────
  const auditFile = join(__dirname, 'fixtures', 'audit-tasks.json');
  let auditRows = 0;
  if (existsSync(auditFile)) {
    const audits = JSON.parse(readFileSync(auditFile, 'utf8'));
    for (const a of audits) {
      const hotel = hotelById.get(a.hotelId);
      if (!hotel) continue;
      await tx`
        insert into audit_tasks (
          legacy_id, hotel_id, room_number, area, type, title,
          scheduled_date, completed_date, status, score, findings,
          assigned_to, source
        )
        values (
          ${a.id}, ${hotel.id}, ${a.roomNumber ?? null}, ${a.area ?? null},
          ${a.type}, ${a.title},
          ${a.scheduledDate}::date,
          ${a.completedDate ?? null},
          ${a.status}, ${a.score ?? null},
          ${JSON.stringify(a.findings ?? [])}::jsonb,
          ${a.assignedTo}, 'seed'
        )
        on conflict (legacy_id) do update set
          room_number = excluded.room_number, area = excluded.area,
          type = excluded.type, title = excluded.title,
          scheduled_date = excluded.scheduled_date,
          completed_date = excluded.completed_date,
          status = excluded.status, score = excluded.score,
          findings = excluded.findings, assigned_to = excluded.assigned_to,
          updated_at = now()
      `;
      auditRows++;
    }
    console.log(`  audit_tasks: ${auditRows} rows`);
  } else {
    console.log(`  audit_tasks: skipped (run "pnpm tsx db/dump-fixtures.ts" first)`);
  }

  // ─── Sravan (front-desk) employee records ───────────────────────────────
  // Single-table JSONB design — see db/migrations/0008_sravan.sql.
  const SRAVAN_EMAIL = 'sravan@hos.com';
  const sravanFiles = [
    ['profile',       'sravan-profile.json'],
    ['schedule',      'sravan-schedule.json'],
    ['clock_log',     'sravan-clock.json'],
    ['availability',  'sravan-availability.json'],
    ['paystubs',      'sravan-paystubs.json'],
    ['bonuses',       'sravan-bonuses.json'],
    ['colleagues',    'sravan-colleagues.json'],
    ['open_shifts',   'sravan-open-shifts.json'],
    ['swap_requests', 'sravan-swaps.json'],
    ['sops',          'sravan-sops.json'],
  ];
  let sravanRows = 0;
  for (const [recordType, filename] of sravanFiles) {
    const path = join(__dirname, 'fixtures', filename);
    if (!existsSync(path)) continue;
    const data = JSON.parse(readFileSync(path, 'utf8'));
    await tx`
      insert into employee_records (employee_email, record_type, data, updated_at)
      values (${SRAVAN_EMAIL}, ${recordType}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (employee_email, record_type) do update set
        data = excluded.data, updated_at = now()
    `;
    sravanRows++;
  }
  console.log(`  employee_records (sravan): ${sravanRows} rows`);

  // ─── Strategy: annual targets, hotel targets, initiatives, capex ───────
  async function loadStrategyTable(tableName, fixtureFile, idField) {
    const path = join(__dirname, 'fixtures', fixtureFile);
    if (!existsSync(path)) return 0;
    const data = JSON.parse(readFileSync(path, 'utf8'));
    let rows = 0;
    for (const row of data) {
      const legacyId = row[idField];
      if (!legacyId) continue;
      await tx.unsafe(
        `insert into ${tableName} (legacy_id, data, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (legacy_id) do update set data = excluded.data, updated_at = now()`,
        [String(legacyId), JSON.stringify(row)],
      );
      rows++;
    }
    return rows;
  }
  const annualT  = await loadStrategyTable('strategy_annual_targets', 'annual-targets.json', 'metric');
  const hotelT   = await loadStrategyTable('strategy_hotel_targets',  'hotel-targets.json',  'hotelId');
  const initT    = await loadStrategyTable('strategy_initiatives',    'initiatives.json',    'id');
  const capexT   = await loadStrategyTable('strategy_capex',          'capex.json',          'id');
  console.log(`  strategy: annual=${annualT}, hotel=${hotelT}, initiatives=${initT}, capex=${capexT}`);

  // ─── Assets, asset summaries, vendor spend ────────────────────────────
  let assetRows = 0;
  const assetsFile = join(__dirname, 'fixtures', 'assets.json');
  if (existsSync(assetsFile)) {
    const assets = JSON.parse(readFileSync(assetsFile, 'utf8'));
    for (const a of assets) {
      const hotel = hotelById.get(a.hotelId);
      await tx`
        insert into assets (legacy_id, hotel_id, data, updated_at)
        values (${a.id}, ${hotel?.id ?? null}, ${JSON.stringify(a)}::jsonb, now())
        on conflict (legacy_id) do update set
          hotel_id = excluded.hotel_id, data = excluded.data, updated_at = now()
      `;
      assetRows++;
    }
  }

  let summaryRows = 0;
  const summariesFile = join(__dirname, 'fixtures', 'asset-summaries.json');
  if (existsSync(summariesFile)) {
    const summaries = JSON.parse(readFileSync(summariesFile, 'utf8'));
    for (const s of summaries) {
      const hotel = hotelById.get(s.hotelId);
      if (!hotel) continue;
      await tx`
        insert into asset_hotel_summaries (hotel_id, data, updated_at)
        values (${hotel.id}, ${JSON.stringify(s)}::jsonb, now())
        on conflict (hotel_id) do update set data = excluded.data, updated_at = now()
      `;
      summaryRows++;
    }
  }

  let vendorRows = 0;
  const vendorsFile = join(__dirname, 'fixtures', 'vendor-spends.json');
  if (existsSync(vendorsFile)) {
    const vendors = JSON.parse(readFileSync(vendorsFile, 'utf8'));
    for (const v of vendors) {
      const legacyId = v.vendor ?? v.id ?? `vendor-${vendorRows}`;
      await tx`
        insert into vendor_spends (legacy_id, data, updated_at)
        values (${legacyId}, ${JSON.stringify(v)}::jsonb, now())
        on conflict (legacy_id) do update set data = excluded.data, updated_at = now()
      `;
      vendorRows++;
    }
  }
  console.log(`  assets: ${assetRows}, asset_summaries: ${summaryRows}, vendor_spends: ${vendorRows}`);

  // ─── AM/PM snapshots (one row per hotel per slot, dated yesterday) ─────
  // Mirror packages/shared/src/data/am-pm-report.ts so the DB seed matches
  // the in-memory shape that pages were originally built against.
  const ROOM_TYPES = ['K','Q','KK','QQ','KS','QS','KPD','QPD'];
  const ROOM_TYPE_LABELS = {
    K: 'King (Single)', Q: 'Queen (Single)',
    KK: '2 King Beds',  QQ: '2 Queen Beds',
    KS: 'King Suite',   QS: 'Queen Suite',
    KPD: 'King Accessible', QPD: 'Queen Accessible',
  };
  const ROOM_MIX = { K: 0.22, Q: 0.14, KK: 0.14, QQ: 0.20, KS: 0.08, QS: 0.06, KPD: 0.09, QPD: 0.07 };
  const RATE_MOD = { K: 1.00, Q: 0.95, KK: 1.10, QQ: 1.05, KS: 1.30, QS: 1.25, KPD: 1.00, QPD: 0.95 };
  const OCC_MOD  = { K: 1.00, Q: 0.98, KK: 1.04, QQ: 1.03, KS: 0.86, QS: 0.88, KPD: 0.92, QPD: 0.90 };

  function distributeRooms(total) {
    const out = { K: 0, Q: 0, KK: 0, QQ: 0, KS: 0, QS: 0, KPD: 0, QPD: 0 };
    let alloc = 0;
    for (const code of ROOM_TYPES) {
      if (code === 'K') continue;
      out[code] = Math.max(1, Math.round(total * ROOM_MIX[code]));
      alloc += out[code];
    }
    out.K = Math.max(1, total - alloc);
    return out;
  }
  function distributeOoo(mix, totalOoo) {
    const out = { K: 0, Q: 0, KK: 0, QQ: 0, KS: 0, QS: 0, KPD: 0, QPD: 0 };
    if (totalOoo <= 0) return out;
    const order = [...ROOM_TYPES].sort((a, b) => mix[b] - mix[a]);
    let remaining = totalOoo, i = 0;
    while (remaining > 0) {
      const code = order[i % order.length];
      if (out[code] < mix[code]) { out[code]++; remaining--; }
      i++;
      if (i > totalOoo * order.length + 8) break;
    }
    return out;
  }

  const yesterday = isoAddDays(FROZEN_TODAY, -1);
  let amPmSnapRows = 0, amPmRtRows = 0;

  for (const slot of ['AM', 'PM']) {
    const occShift = slot === 'AM' ? -4 : 0;
    const adrShift = slot === 'AM' ? 0.99 : 1.00;
    const generatedAt = `${yesterday}T${slot === 'AM' ? '09' : '17'}:00:00-04:00`;

    for (const code of Object.keys(BASELINE)) {
      const hotel = hotelById.get(code);
      if (!hotel) continue;
      const base = BASELINE[code];
      const baseOcc = Math.max(30, Math.min(100, base.occ + occShift));
      const baseAdr = Math.round(base.adr * adrShift);
      const totalOoo = Math.max(0, Math.round(2 * jitter(`ooo-${code}-${yesterday}`, 0.6)));

      const mix = distributeRooms(hotel.total_rooms);
      const oooMix = distributeOoo(mix, totalOoo);

      const rtRows = ROOM_TYPES.map((rt) => {
        const total = mix[rt];
        const ooo = oooMix[rt];
        const sellable = Math.max(0, total - ooo);
        const occ = Math.min(100, baseOcc * OCC_MOD[rt]);
        const sold = Math.min(sellable, Math.max(0, Math.round(sellable * occ / 100)));
        const leftToSell = Math.max(0, sellable - sold);
        const adr = Math.round(baseAdr * RATE_MOD[rt]);
        const avgPrice = Math.round(adr * 0.97);
        const occupancyPct = sellable > 0 ? (sold / sellable) * 100 : 0;
        const revPar = Math.round(adr * (occupancyPct / 100));
        return { code: rt, total, sold, ooo, leftToSell, adr, avgPrice, revPar, occupancyPct };
      });

      const roomsSold = rtRows.reduce((s, r) => s + r.sold, 0);
      const roomsOoo = rtRows.reduce((s, r) => s + r.ooo, 0);
      const roomsLeftToSell = rtRows.reduce((s, r) => s + r.leftToSell, 0);
      const sellable = Math.max(1, hotel.total_rooms - roomsOoo);
      const occupancyPct = (roomsSold / sellable) * 100;
      const adr = baseAdr;
      const avgPrice = Math.round(baseAdr * 0.97);
      const revPar = Math.round(adr * (occupancyPct / 100));

      const [snapRow] = await tx`
        insert into am_pm_snapshots (
          hotel_id, date, slot, generated_at,
          total_rooms, rooms_sold, rooms_ooo, rooms_left_to_sell,
          adr, avg_price, revpar, occupancy_pct, source
        )
        values (
          ${hotel.id}, ${yesterday}::date, ${slot}, ${generatedAt}::timestamptz,
          ${hotel.total_rooms}, ${roomsSold}, ${roomsOoo}, ${roomsLeftToSell},
          ${adr}, ${avgPrice}, ${revPar}, ${occupancyPct.toFixed(2)}, 'seed'
        )
        on conflict (hotel_id, date, slot) do update set
          generated_at = excluded.generated_at,
          total_rooms = excluded.total_rooms,
          rooms_sold = excluded.rooms_sold,
          rooms_ooo = excluded.rooms_ooo,
          rooms_left_to_sell = excluded.rooms_left_to_sell,
          adr = excluded.adr,
          avg_price = excluded.avg_price,
          revpar = excluded.revpar,
          occupancy_pct = excluded.occupancy_pct,
          source = excluded.source,
          uploaded_at = now()
        returning id
      `;
      amPmSnapRows++;

      await tx`delete from am_pm_room_type_rows where snapshot_id = ${snapRow.id}`;
      for (const rt of rtRows) {
        await tx`
          insert into am_pm_room_type_rows (
            snapshot_id, room_type_code, label,
            total, sold, ooo, left_to_sell,
            adr, avg_price, revpar, occupancy_pct
          )
          values (
            ${snapRow.id}, ${rt.code}, ${ROOM_TYPE_LABELS[rt.code]},
            ${rt.total}, ${rt.sold}, ${rt.ooo}, ${rt.leftToSell},
            ${rt.adr}, ${rt.avgPrice}, ${rt.revPar}, ${rt.occupancyPct.toFixed(2)}
          )
        `;
        amPmRtRows++;
      }
    }
  }
  console.log(`  am_pm_snapshots: ${amPmSnapRows} rows, am_pm_room_type_rows: ${amPmRtRows} rows`);
});

console.log('Seed complete.');
await sql.end();
