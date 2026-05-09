-- ==============================================================
-- stayops seed — HOS tenant with 16 hotels + 2 regions + users
-- Run AFTER 0001_init.sql.
-- Safe to re-run: uses upserts on natural keys.
-- ==============================================================

-- Tenant ---------------------------------------------------------
insert into tenants (slug, name, plan) values
  ('hos', 'HOS Management', 'free')
on conflict (slug) do update set name = excluded.name, plan = excluded.plan;

-- Users (leaders) ------------------------------------------------
insert into users (tenant_id, email, name, role) values
  ((select id from tenants where slug='hos'), 'kris@hos.com',    'Kris Patel',     'md'),
  ((select id from tenants where slug='hos'), 'harshal@hos.com', 'Harshal Patel',  'regional'),
  ((select id from tenants where slug='hos'), 'gautham@hos.com', 'Gautham Shetty', 'regional'),
  ((select id from tenants where slug='hos'), 'rishab@hos.com',  'Rishab Patel',   'gm')
on conflict do nothing;

-- Regions --------------------------------------------------------
insert into regions (tenant_id, slug, name, director_user_id) values
  (
    (select id from tenants where slug='hos'),
    'gautham-region',
    'Gautham Region',
    (select id from users where email='gautham@hos.com' and tenant_id=(select id from tenants where slug='hos'))
  ),
  (
    (select id from tenants where slug='hos'),
    'harshal-region',
    'Harshal Region',
    (select id from users where email='harshal@hos.com' and tenant_id=(select id from tenants where slug='hos'))
  )
on conflict (tenant_id, slug) do update set name = excluded.name;

-- Hotels (16) ----------------------------------------------------
-- Region assignment per packages/shared/src/data/leaders.ts REGIONAL_ROSTER

insert into hotels (tenant_id, code, name, short_name, brand, parent_chain, city, state, total_rooms, pms, region_id, market_adr)
select t.id, h.code, h.name, h.short_name, h.brand, h.parent_chain, h.city, h.state, h.total_rooms, h.pms,
       (select r.id from regions r where r.tenant_id = t.id and r.slug = h.region_slug),
       h.market_adr
from (values
  -- Gautham's region (SAVGW, SAVVY, GA989, SAVMT, SAVMD, RISAV, SAVFP, BQKCY)
  ('SAVGW', 'Hampton Inn & Suites - Gateway',          'Hampton Gateway',       'Hilton',   'Hilton',   'Savannah',     'GA', 92,  'onq',              'gautham-region', 158.00::numeric),
  ('SAVVY', 'Cotton Sail Hotel',                        'Cotton Sail',           'Hilton',   'Hilton',   'Savannah',     'GA', 56,  'onq',              'gautham-region', 182.00::numeric),
  ('GA989', 'Cambria Hotel - Savannah',                 'Cambria Savannah',      'Choice',   'Choice',   'Savannah',     'GA', 101, 'choice-advantage', 'gautham-region', 168.00::numeric),
  ('SAVMT', 'Hilton Garden Inn - Midtown',              'Hilton Garden Midtown', 'Hilton',   'Hilton',   'Savannah',     'GA', 132, 'onq',              'gautham-region', 166.00::numeric),
  ('SAVMD', 'Hampton Inn & Suites - Midtown',           'Hampton Midtown',       'Hilton',   'Hilton',   'Savannah',     'GA', 120, 'onq',              'gautham-region', 161.00::numeric),
  ('RISAV', 'Residence Inn Savannah Midtown',           'Residence Inn Midtown', 'Marriott', 'Marriott', 'Savannah',     'GA', 66,  'marsha',           'gautham-region', 174.00::numeric),
  ('SAVFP', 'Fairfield/TPS - Pooler, GA',               'Fairfield Pooler',      'Marriott', 'Marriott', 'Pooler',       'GA', 158, 'marsha',           'gautham-region', 165.00::numeric),
  ('BQKCY', 'Courtyard - Brunswick',                    'Courtyard Brunswick',   'Marriott', 'Marriott', 'Brunswick',    'GA', 93,  'marsha',           'gautham-region', 148.00::numeric),
  -- Harshal's region (BSWVE, GAA84, BQKFP, SGJES, JAXTX, DFWFW, BTRCI, 58090LA)
  ('BSWVE', 'Hampton Inn & Suites - Brunswick',         'Hampton Brunswick',     'Hilton',   'Hilton',   'Brunswick',    'GA', 97,  'onq',              'harshal-region', 153.00::numeric),
  ('GAA84', 'Woodspring - Brunswick',                   'Woodspring Brunswick',  'Choice',   'Choice',   'Brunswick',    'GA', 122, 'choice-advantage', 'harshal-region', 124.00::numeric),
  ('BQKFP', 'Four Points by Marriott',                  'Four Points',           'Marriott', 'Marriott', 'Brunswick',    'GA', 113, 'marsha',           'harshal-region', 151.00::numeric),
  ('SGJES', 'Holiday Inn Express - St. Augustine',      'Holiday Inn Express',   'IHG',      'IHG',      'St. Augustine','FL', 82,  'opera',            'harshal-region', 136.00::numeric),
  ('JAXTX', 'Hotel Amalga - St. Augustine',             'Hotel Amalga',          'Marriott', 'Marriott', 'St. Augustine','FL', 58,  'marsha',           'harshal-region', 190.00::numeric),
  ('DFWFW', 'Home2 Suites - Flower Mound TX',           'Home2 TX',              'Hilton',   'Hilton',   'Flower Mound', 'TX', 99,  'onq',              'harshal-region', 141.00::numeric),
  ('BTRCI', 'Home2 Suites - Baton Rouge',               'Home2 Baton Rouge',     'Hilton',   'Hilton',   'Baton Rouge',  'LA', 116, 'onq',              'harshal-region', 134.00::numeric),
  ('58090LA','La Quinta Inn and Suites',                'La Quinta',             'Wyndham',  'Wyndham',  'Hinesville',   'GA', 80,  'sabre',            'harshal-region', 128.00::numeric)
) as h(code, name, short_name, brand, parent_chain, city, state, total_rooms, pms, region_slug, market_adr)
cross join (select id from tenants where slug='hos') t
on conflict (tenant_id, code) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  brand = excluded.brand,
  total_rooms = excluded.total_rooms,
  region_id = excluded.region_id,
  market_adr = excluded.market_adr;

-- Assign GM to BTRCI (Rishab) ------------------------------------
update hotels set gm_user_id = (select id from users where email='rishab@hos.com')
where code = 'BTRCI' and tenant_id = (select id from tenants where slug='hos');

-- Region ↔ hotel links (convenience m2m mirror of hotels.region_id)
insert into region_hotels (region_id, hotel_id)
select h.region_id, h.id
from hotels h
where h.tenant_id = (select id from tenants where slug='hos')
  and h.region_id is not null
on conflict do nothing;

-- Room types (8 per hotel, Home2-style inventory for BTRCI as canonical) -------
-- For Phase 0 simplicity we use the same 8-code mix per hotel with counts proportional
-- to total_rooms. Real counts will be corrected when the BTRCI Excel parses.
insert into room_types (hotel_id, code, label, count)
select h.id, rt.code, rt.label, greatest(1, round(h.total_rooms * rt.share))
from hotels h
cross join (values
  ('K',   '1 King',                0.28::numeric),
  ('Q',   '1 Queen',               0.10::numeric),
  ('KK',  '2 Kings',               0.04::numeric),
  ('QQ',  '2 Queens',              0.28::numeric),
  ('KS',  '1 King Studio Suite',   0.10::numeric),
  ('QS',  '1 Queen Studio Suite',  0.08::numeric),
  ('KPD', '1 King ADA',            0.06::numeric),
  ('QPD', '1 Queen ADA',           0.06::numeric)
) as rt(code, label, share)
where h.tenant_id = (select id from tenants where slug='hos')
on conflict (hotel_id, code) do update set
  label = excluded.label,
  count = excluded.count;

-- ==============================================================
-- Starter daily data — ONE ROW per hotel for 2026-05-06 so dashboards
-- show real numbers immediately, before parsed Excel data arrives.
-- Numbers ported from packages/shared/src/data/revenue.ts & daily-metrics.ts.
-- These get overwritten when real PMS data arrives for the same date.
-- ==============================================================

insert into daily_revenue (
  hotel_id, date, total_revenue, room_revenue, non_room_revenue,
  mix_room, mix_fb, mix_retail, mix_events, mix_other,
  adr, revpar, occupancy_pct, market_adr, health, source
)
select h.id, d.date, d.total_rev, d.room_rev, d.non_room_rev,
       d.mix_room, d.mix_fb, d.mix_retail, d.mix_events, d.mix_other,
       d.adr, d.revpar, d.occ, h.market_adr,
       case when d.occ >= 85 then 'green' when d.occ >= 75 then 'amber' else 'red' end,
       'seed'
from hotels h
join (values
  -- code,    date,           total,  roomRev, nonRoom, mixRoom, mixFb,  mixRetail, mixEvents, mixOther, adr, revpar, occ
  ('SAVGW',   '2026-05-06'::date, 18200,  13104,  5096,   13104,  1820,   1638,      1274,      546,      162, 135,    83.0),
  ('SAVVY',   '2026-05-06'::date, 19900,  12935,  6965,   12935,  3184,   1791,      1393,      597,      189, 159,    84.0),
  ('GA989',   '2026-05-06'::date, 24300,  17496,  6804,   17496,  2430,   2187,      1458,      729,      174, 153,    88.0),
  ('SAVMT',   '2026-05-06'::date, 17600,  11440,  6160,   11440,  2816,   1584,      1056,      528,      158, 122,    77.0),
  ('SAVMD',   '2026-05-06'::date, 21600,  15552,  6048,   15552,  2160,   1944,      1296,      648,      155, 124,    80.0),
  ('RISAV',   '2026-05-06'::date, 16400,  12792,  3608,   12792,   820,   1640,       656,      492,      178, 153,    86.0),
  ('SAVFP',   '2026-05-06'::date, 29400,  19110,  10290,  19110,  2940,   2646,      1764,      940,      171, 156,    91.0),
  ('BQKCY',   '2026-05-06'::date, 16900,  10985,  5915,   10985,  1690,   1521,      1014,      690,      142, 111,    78.0),
  ('BSWVE',   '2026-05-06'::date, 18100,  13032,  5068,   13032,  1810,   1629,      1086,      543,      149, 121,    81.0),
  ('GAA84',   '2026-05-06'::date, 15800,  11376,  4424,   11376,  1580,   1422,       948,      474,      118, 87,     74.0),
  ('BQKFP',   '2026-05-06'::date, 18900,  12285,  6615,   12285,  1890,   1701,      1134,      680,      145, 115,    79.0),
  ('SGJES',   '2026-05-06'::date, 14700,  10584,  4116,   10584,  1470,   1323,       882,      441,      138, 113,    82.0),
  ('JAXTX',   '2026-05-06'::date, 15200,   9880,  5320,    9880,  2432,   1368,       912,      608,      196, 171,    87.0),
  ('DFWFW',   '2026-05-06'::date, 13720,  10701,  3019,   10701,   686,   1372,       549,      412,      129, 110,    85.0),
  ('BTRCI',   '2026-05-06'::date, 17900,  13962,  3938,   13962,   895,   1790,       716,      537,      131, 109,    83.0),
  ('58090LA', '2026-05-06'::date, 12900,   9288,  3612,    9288,  1290,   1161,       774,      387,      122, 93,     76.0)
) as d(code, date, total_rev, room_rev, non_room_rev, mix_room, mix_fb, mix_retail, mix_events, mix_other, adr, revpar, occ)
on h.code = d.code
where h.tenant_id = (select id from tenants where slug='hos')
on conflict (hotel_id, date) do update set
  total_revenue = excluded.total_revenue,
  room_revenue = excluded.room_revenue,
  non_room_revenue = excluded.non_room_revenue,
  mix_room = excluded.mix_room,
  mix_fb = excluded.mix_fb,
  mix_retail = excluded.mix_retail,
  mix_events = excluded.mix_events,
  mix_other = excluded.mix_other,
  adr = excluded.adr,
  revpar = excluded.revpar,
  occupancy_pct = excluded.occupancy_pct,
  market_adr = excluded.market_adr,
  health = excluded.health;

insert into daily_occupancy (hotel_id, date, rooms_sold, rooms_ooo, avg_customer_rating)
select h.id, o.date, o.sold, o.ooo, o.rating
from hotels h
join (values
  ('SAVGW',   '2026-05-06'::date, 76,  0, 4.3),
  ('SAVVY',   '2026-05-06'::date, 47,  0, 4.6),
  ('GA989',   '2026-05-06'::date, 89,  1, 4.5),
  ('SAVMT',   '2026-05-06'::date, 102, 3, 4.1),
  ('SAVMD',   '2026-05-06'::date, 96,  0, 4.2),
  ('RISAV',   '2026-05-06'::date, 57,  0, 4.4),
  ('SAVFP',   '2026-05-06'::date, 144, 0, 4.3),
  ('BQKCY',   '2026-05-06'::date, 73,  1, 4.0),
  ('BSWVE',   '2026-05-06'::date, 79,  0, 4.2),
  ('GAA84',   '2026-05-06'::date, 90,  0, 3.9),
  ('BQKFP',   '2026-05-06'::date, 89,  1, 4.1),
  ('SGJES',   '2026-05-06'::date, 67,  0, 4.3),
  ('JAXTX',   '2026-05-06'::date, 50,  0, 4.7),
  ('DFWFW',   '2026-05-06'::date, 84,  1, 3.9),
  ('BTRCI',   '2026-05-06'::date, 96,  0, 4.2),
  ('58090LA', '2026-05-06'::date, 61,  1, 4.0)
) as o(code, date, sold, ooo, rating)
on h.code = o.code
where h.tenant_id = (select id from tenants where slug='hos')
on conflict (hotel_id, date) do update set
  rooms_sold = excluded.rooms_sold,
  rooms_ooo = excluded.rooms_ooo,
  avg_customer_rating = excluded.avg_customer_rating;
