/**
 * Shared content for /website/trail/newcontent/{night,daylight}.
 *
 * Single source of truth for the new IA copy. If you want to tweak a headline
 * or a card, edit it here and both flavors stay in sync.
 *
 * Per the HOS-as-lead constraint: NO customer claims, NO usage stats, NO
 * fabricated testimonials, NO "we built this in a 16-hotel office" origin.
 * If you spot one slipping in below, rip it out.
 */

export const HERO = {
  eyebrow:    'For hotel owners and regional managers',
  headline:   'Every hotel. Every brand. One dashboard.',
  subheadline:
    'StayOps gives hotel owners and regional managers one clear view\nacross revenue, occupancy, labour, rooms, audits, maintenance,\ntickets, scheduling, assets, reports, and team execution\nacross every property they manage.',
  supporting:
    'Built for hotel groups operating across multiple brands,\nsystems, reports, and locations.',
  primaryCta:   { label: 'Book a Demo',     href: '/website/contact' },
  secondaryCta: { label: 'See the Product', href: '/website/products' },
  trustLine:
    "No commitment. We'll show how StayOps can work with your current hotels, reports, and daily workflows.",
} as const;

export const PROBLEM = {
  headline: 'Running 15 hotels shouldn’t feel\nlike running 15 separate businesses.',
  body:
    'Your hotels may be under Marriott, Hilton, IHG, Choice, Hyatt, Wyndham, or independent brands. But every property has its own systems, reports, managers, tickets, schedules, audits, and daily issues. Leadership spends too much time switching between portals, calling managers, collecting reports, and still not seeing the full picture.',
  cards: [
    { title: 'Too many systems',         body: 'Revenue, payroll, tickets, audits, rooms, schedules, and reports live in different places.' },
    { title: 'Too much manual reporting', body: 'Teams spend hours stitching together spreadsheets before decisions can be made.' },
    { title: 'No full portfolio view',    body: 'You can see one hotel at a time, but not the whole group together.' },
    { title: 'Problems show up late',     body: 'By the time ownership sees the issue, it may have already cost money.' },
  ],
} as const;

export const CORE_VALUE = {
  headline: 'One screen for the full picture.',
  body:
    'StayOps gives leadership one clear view of every property, helping them catch issues early before they become costly losses.',
  cards: [
    { title: 'See every property',       body: 'Compare revenue, occupancy, labour, room status, and operational issues across the full group.' },
    { title: 'Find what needs attention', body: 'Spot high labour, aging tickets, missed audits, out-of-order rooms, and underperforming hotels.' },
    { title: 'Drill down fast',           body: 'Go from portfolio to property to department to room to ticket or asset.' },
    { title: 'Create reports quickly',    body: 'Generate owner-ready reports without rebuilding spreadsheets every day.' },
  ],
} as const;

export const OWNER_LENS = {
  eyebrow:  'For hotel owners and managing directors',
  headline: 'Know where your money is being made — and where it is leaking.',
  body:
    'StayOps helps ownership see revenue, occupancy, labour costs, overtime, out-of-order rooms, missed audits, repair issues, and property performance across the full portfolio.',
  bullets: [
    'Portfolio revenue and occupancy dashboard',
    'Labour cost and overtime visibility',
    'Out-of-order room impact',
    'Revenue leakage and operational red flags',
    'Property-by-property performance comparison',
    'Owner-ready daily, weekly, and monthly reports',
    'AI-supported alerts and summaries',
  ],
  cta: { label: 'See owner solution', href: '/website/solutions/owners' },
} as const;

export const REGIONAL_LENS = {
  eyebrow:  'For regional managers and operations leaders',
  headline: 'Know which hotel needs your attention today.',
  body:
    'Regional managers need to answer ownership, support GMs, follow up on issues, and keep every property moving. StayOps shows what is happening across every hotel, right down to rooms, tickets, audits, labour, and daily handoffs.',
  bullets: [
    'GM and property accountability view',
    'Room-level operations visibility',
    'Maintenance tickets and aging issues',
    'Audit tracking across properties',
    'Labour scheduling and variance tracking',
    'AM/PM shift handover reports',
    'Mobile task execution for property teams',
  ],
  cta: { label: 'See regional manager solution', href: '/website/solutions/regional' },
} as const;

export const PRODUCT_GLIMPSE = {
  headline: 'Everything leadership needs to see. Connected to the work happening on the floor.',
  body:
    'StayOps connects portfolio-level visibility with property-level execution, so owners, regional managers, GMs, and teams are not working from different versions of the truth.',
  tiles: [
    { title: 'Portfolio Dashboard',      body: 'One view across every property, brand, and key number.' },
    { title: 'Revenue & Occupancy',      body: 'Track revenue, ADR, RevPAR, occupancy, and leakage.' },
    { title: 'Labour Control',           body: 'See labour cost, overtime, scheduled hours, and clocked hours.' },
    { title: 'Operations',               body: 'Track rooms, housekeeping, tickets, and daily property issues.' },
    { title: 'Audits',                   body: 'See missed audits, compliance, findings, and room-level checks.' },
    { title: 'Maintenance & Tickets',    body: 'Manage urgent issues, aging tickets, and room-impacting repairs.' },
    { title: 'Assets & Room History',    body: 'Track repair costs, replacement history, and repeat failures.' },
    { title: 'Reports',                  body: 'Create leadership-ready reports in one click.' },
  ],
  cta: { label: 'Explore Product', href: '/website/products' },
} as const;

export const DRILL_DOWN = {
  headline: 'From portfolio to room-level detail.',
  body:
    'Start with your full hotel group. Click into one property. Click into one department. Click into one room. See open tickets, audit history, repair costs, replacement history, photos, notes, and who completed the work.',
  path: ['Portfolio', 'Property', 'Department', 'Room', 'Ticket', 'Asset', 'Cost', 'History'],
  strongLine: 'No matter what brand is on the building, leadership gets one view.',
} as const;

export const REPORTS = {
  headline: 'Reports in one click, not after hours of work.',
  body:
    'Create daily, weekly, monthly, and custom reports for revenue, labour, operations, audits, maintenance, rooms, and assets — without rebuilding spreadsheets every time.',
  reportTypes: [
    'Daily owner summary',
    'Revenue and occupancy report',
    'Labour and overtime report',
    'Out-of-order room report',
    'Maintenance ticket report',
    'Audit compliance report',
    'AM/PM shift handover report',
    'Asset and CapEx planning report',
    'Custom reports',
  ],
  cta: { label: 'View reporting', href: '/website/products' },
} as const;

export const AI_ALERTS = {
  headline: 'Catch problems before they become losses.',
  body:
    'StayOps helps flag unusual labour costs, repeated room issues, missed audits, revenue drops, aging tickets, and assets that may need attention — so owners and regional managers know what to act on first.',
  alerts: [
    'Labour higher than expected for occupancy level',
    'Room repeatedly out of order',
    'Aging ticket with revenue impact',
    'Missed audit or overdue inspection',
    'Revenue drop compared to past performance',
    'Asset showing repeat failure pattern',
  ],
} as const;

export const HOW_IT_WORKS = {
  headline: 'Built around the way hotel groups already work.',
  steps: [
    { n: 1, title: 'Bring in your existing reports and data',
      body: 'StayOps is designed to work with hotel reports, exports, payroll data, audit files, ticket workflows, and property-level systems.' },
    { n: 2, title: 'See every hotel in one dashboard',
      body: 'View revenue, occupancy, labour, rooms, tickets, audits, and reports across your full portfolio.' },
    { n: 3, title: 'Compare and drill down',
      body: 'Find the property, department, room, ticket, asset, or cost that needs attention.' },
    { n: 4, title: 'Send work to teams',
      body: 'Property teams can see assigned work, update tickets, complete audits, and submit proof.' },
    { n: 5, title: 'Generate reports',
      body: 'Create owner-ready reports without manual spreadsheet work.' },
  ],
  cta: { label: 'See how it works', href: '/website/products' },
} as const;

export const FINAL_CTA = {
  headline: 'Ready to see your hotels in one place?',
  body:
    'StayOps is built for hotel ownership and regional operations teams managing multiple properties across different brands, systems, and locations.',
  cta:       { label: 'Book a Demo', href: '/website/contact' },
  smallText: "No commitment. We'll show how it can work with your current portfolio and reports.",
} as const;
