/**
 * Single source of truth for ALL pages in /website/trail/newcontent/[flavor]/*.
 * Adapted verbatim from the IA spec; HOS-as-customer wording scrubbed.
 */

const PRODUCT_BASE = '/website/products';
const SOLUTIONS_BASE = '/website/solutions';

/* ─── Product subpages ──────────────────────────────────────────────────── */
export const PRODUCT_SUBPAGES: Record<string, ProductSubpage> = {
  'portfolio-dashboard': {
    slug: 'portfolio-dashboard',
    label: 'Portfolio Dashboard',
    eyebrow: 'Product',
    headline: 'See every hotel in one dashboard.',
    subhead: 'Track performance across every property, compare hotels side by side, and know which locations need attention today.',
    whatYouSee: [
      'Occupancy percentage', 'Room revenue', 'Total revenue', 'Rooms out of order',
      'Labour hours', 'Labour variance', 'Average customer rating', 'Property health',
      'AI findings and alerts',
    ],
    whyItMatters: 'Owners and regional managers should not have to open 10 systems or call 10 GMs to know what is happening across the portfolio.',
    bestFor: ['Owners', 'Managing directors', 'Regional managers', 'Corporate operations leaders'],
    keyValue: 'See every hotel without opening every system.',
    mock: 'portfolio',
  },
  'revenue-occupancy': {
    slug: 'revenue-occupancy',
    label: 'Revenue & Occupancy',
    eyebrow: 'Product',
    headline: 'Know how every property is performing.',
    subhead: 'See revenue, occupancy, ADR, RevPAR, room revenue, non-room revenue, and revenue mix across the full portfolio.',
    whatYouSee: [
      'Total revenue', 'Room revenue', 'Non-room revenue', 'Occupancy percentage',
      'ADR', 'RevPAR', 'Revenue mix', 'Market comparison', 'Revenue leakage', 'Forecasts',
    ],
    whyItMatters: 'Leadership can quickly see which hotels are performing well, which hotels are underperforming, and where revenue needs attention.',
    keyValue: 'See where money is moving before the month-end report.',
    mock: 'portfolio',
  },
  'labour-control': {
    slug: 'labour-control',
    label: 'Labour Control',
    eyebrow: 'Product',
    headline: 'Control labour before it hits the bottom line.',
    subhead: 'Track scheduled hours, clocked hours, overtime, payroll cost, labour variance, and department-level staffing across every hotel.',
    whatYouSee: [
      'Scheduled hours', 'Clocked hours', 'Variance', 'Overtime hours', 'Payroll cost',
      'Department breakdown', 'Revenue per labour hour', 'Labour efficiency by hotel',
    ],
    whyItMatters: 'Labour is one of the largest controllable costs in hotel operations. StayOps helps owners and regional managers see when staffing does not match occupancy or revenue.',
    keyValue: 'Know when labour is too high before payroll becomes the surprise.',
    mock: 'ownerKpi',
  },
  'operations': {
    slug: 'operations',
    label: 'Operations',
    eyebrow: 'Product',
    headline: 'See what is happening inside every hotel.',
    subhead: 'Track room status, tickets, housekeeping progress, daily issues, and property flow across every hotel.',
    whatYouSee: [
      'Ready rooms', 'Dirty rooms', 'Inspecting rooms', 'Blocked rooms', 'Out-of-order rooms',
      'Open tickets', 'Urgent issues', 'Room-level history', 'Housekeeping and maintenance flow',
    ],
    whyItMatters: 'Revenue, guest experience, and labour all depend on daily execution. StayOps gives leadership visibility into that execution.',
    keyValue: 'If a room, team, or issue is stuck, leadership can see it.',
    mock: 'regional',
  },
  'audits': {
    slug: 'audits',
    label: 'Audits',
    eyebrow: 'Product',
    headline: 'Keep audits visible and accountable.',
    subhead: 'Track room audits, area audits, preventive checks, overdue inspections, pass rates, findings, and completion history.',
    whatYouSee: [
      'Audit compliance', 'Overdue audits', 'Failed checks', 'Audit history',
      'Room-level audit records', 'Assigned staff', 'Completion status', 'Findings and notes',
    ],
    whyItMatters: 'Missed audits become visible before they become brand, safety, guest, or maintenance problems.',
    keyValue: 'Every check has a status, history, and owner.',
    mock: 'regional',
  },
  'maintenance-tickets': {
    slug: 'maintenance-tickets',
    label: 'Maintenance & Tickets',
    eyebrow: 'Product',
    headline: 'Track every issue from report to resolution.',
    subhead: 'See maintenance tickets, urgent issues, aging tickets, preventive work, room-impacting issues, and repair history.',
    whatYouSee: [
      'Open tickets', 'Ticket priority', 'Ticket age', 'Assigned technician',
      'Room impacted', 'Revenue impact', 'Parts needed', 'Photos and notes', 'Resolution history',
    ],
    whyItMatters: 'Regional managers know which issues are stuck, which rooms are affected, and which repairs are costing money.',
    keyValue: 'A ticket is not just a task. It can be a room, a cost, and a guest problem.',
    mock: 'maintenanceApp',
  },
  'assets-room-history': {
    slug: 'assets-room-history',
    label: 'Assets & Room History',
    eyebrow: 'Product',
    headline: 'Know the history behind every room and asset.',
    subhead: 'Track repair counts, replacement costs, asset condition, service history, vendor spend, and CapEx planning.',
    whatYouSee: [
      'Room item history', 'Repair count', 'Total repair cost', 'Replacement cost',
      'Asset condition', 'Warranty and purchase details', 'Vendor spend', 'CapEx predictions', 'Repeat failures',
    ],
    whyItMatters: 'Owners can stop guessing whether to repair, replace, or plan CapEx. Regional managers can see patterns before assets fail again.',
    keyValue: 'Know when the same room or asset keeps costing you money.',
    mock: 'regional',
  },
  'reports': {
    slug: 'reports',
    label: 'Reports',
    eyebrow: 'Product',
    headline: 'The reports your team already builds — now in one click.',
    subhead: 'Create clear reports across revenue, labour, operations, audits, maintenance, rooms, and assets without manually collecting updates from every property.',
    whatYouSee: [
      'Daily owner summary', 'Weekly portfolio summary', 'Monthly operations report',
      'Revenue report', 'Labour report', 'Out-of-order room report', 'Audit report',
      'Maintenance report', 'Asset and CapEx report', 'AM/PM shift handover report', 'Custom reports',
    ],
    whyItMatters: 'Your team should spend less time building reports and more time acting on what the reports show.',
    keyValue: 'Stop rebuilding the same spreadsheet every morning.',
    mock: 'report',
  },
  'mobile-team-app': {
    slug: 'mobile-team-app',
    label: 'Mobile Team App',
    eyebrow: 'Product',
    headline: 'Connect leadership visibility to the people doing the work.',
    subhead: 'Property teams can receive tasks, update tickets, complete audits, add notes, upload photos, and keep work moving from the floor.',
    whatYouSee: [
      'Maintenance technicians', 'Maintenance supervisors', 'Housekeeping supervisors',
      'Front desk staff', 'Employees and property teams',
    ],
    whyItMatters: 'Leadership gets proof and progress from the property floor, not just reports after the fact.',
    keyValue: 'The dashboard is only useful when the work behind it stays updated.',
    mock: 'mobileTriptych',
  },
};

/* ─── Solution subpages ─────────────────────────────────────────────────── */
export const SOLUTION_SUBPAGES: Record<string, SolutionSubpage> = {
  'owners': {
    slug: 'owners',
    label: 'Hotel Owners',
    eyebrow: 'For hotel owners and managing directors',
    headline: 'See where your hotels are making money — and where they are leaking it.',
    subhead: 'StayOps gives hotel owners one clear view across revenue, occupancy, labour, rooms, audits, maintenance, tickets, assets, and reports across every property.',
    pain: 'Owners should not have to call every manager, open every report, and wait until month-end to know what is happening across the business.',
    helps: [
      'See all hotels in one dashboard', 'Track revenue and occupancy', 'Compare property performance',
      'See labour cost and overtime', 'Track out-of-order rooms', 'Find revenue leakage',
      'View missed audits and repeated issues', 'Generate owner-ready reports',
    ],
    keyOutcome: 'Know where to focus before small problems become expensive losses.',
    ctaLabel: 'Book an owner demo',
    mock: 'ownerKpi',
  },
  'regional': {
    slug: 'regional',
    label: 'Regional Managers',
    eyebrow: 'For regional managers and operations leaders',
    headline: 'Know which hotel needs your attention today.',
    subhead: 'StayOps helps regional managers track property performance, GM accountability, labour, operations, audits, tickets, and room-level issues across every hotel they support.',
    pain: 'Regional managers are expected to know what is happening everywhere, but the information is usually spread across reports, calls, texts, and different systems.',
    helps: [
      'Compare hotels quickly', 'See property health', 'Track GM follow-ups',
      'Identify aging tickets', 'See missed audits', 'Track labour variance',
      'Review AM/PM handover reports', 'Drill down into rooms and assets',
    ],
    keyOutcome: 'Answer ownership with confidence and act on the right property first.',
    ctaLabel: 'Book a regional operations demo',
    mock: 'regional',
  },
  'gms': {
    slug: 'gms',
    label: 'General Managers',
    eyebrow: 'For property GMs',
    headline: 'Run one property with clearer visibility.',
    subhead: 'StayOps helps GMs see revenue, labour, rooms, tickets, audits, maintenance, alerts, and property performance in one place.',
    pain: 'GMs have to manage revenue, guest issues, labour, room readiness, maintenance, audits, and staff communication at the same time.',
    helps: [
      "See today's occupancy and revenue", 'Track payroll percentage', 'Monitor overtime',
      'See rooms ready vs arrivals', 'Track open tickets', 'Follow audit pass rates',
      'Manage property alerts', 'Keep leadership updated',
    ],
    keyOutcome: 'Less guessing. Better property control. Clearer communication with regional leadership.',
    ctaLabel: 'See GM view',
    mock: 'ownerKpi',
  },
  'accountant': {
    slug: 'accountant',
    label: 'Accounting-Ready Operations',
    eyebrow: 'Coming soon',
    headline: 'The cleanest books start at the moment work happens.',
    subhead: 'Coming soon — capture purchase, repair, vendor, room, asset, and cost context at the source so bookkeeping and owner reports become cleaner later.',
    pain: 'At the property level, managers and supervisors know exactly what each transaction was for. By month-end, that context is gone — and bookkeeping turns into guesswork.',
    helps: [
      'Purchase context captured at the source',
      'Receipts and invoices attached to operational events',
      'Repair vs replacement tracking per asset and per room',
      'Vendor spend visibility',
      'Reconciliation support',
      'Cleaner accounting categories for review',
      'Owner financial summaries',
      'Export support for existing accounting systems',
    ],
    keyOutcome: 'Help shape the future of hotel accounting-ready operations. Join the wishlist.',
    ctaLabel: 'Join Wishlist',
    mock: 'report',
  },
  'maintenance': {
    slug: 'maintenance',
    label: 'Maintenance Teams',
    eyebrow: 'For maintenance leads + technicians',
    headline: 'Prioritise the maintenance work that affects rooms, guests, and revenue.',
    subhead: 'StayOps helps maintenance teams manage urgent tickets, preventive work, room issues, inventory, handoffs, and repair history.',
    pain: 'Maintenance teams often work from scattered requests, calls, notes, and emergency issues without a clear priority list.',
    helps: [
      'See urgent tickets', 'Track room-impacting issues', 'Manage preventive maintenance',
      'View aging tickets', 'Add notes and photos', 'Track parts and inventory',
      'View room and asset history', 'Hand off work between shifts',
    ],
    keyOutcome: 'The right work gets handled first, with proof and history attached.',
    ctaLabel: 'See maintenance workflow',
    mock: 'maintenanceApp',
  },
  'housekeeping': {
    slug: 'housekeeping',
    label: 'Housekeeping Teams',
    eyebrow: 'For HK supervisors + room attendants',
    headline: 'Keep rooms moving from dirty to ready.',
    subhead: 'StayOps helps housekeeping supervisors assign rooms, track room status, manage staff, see maintenance issues, and print assignment sheets.',
    pain: 'Room readiness depends on constant coordination between housekeeping, front desk, maintenance, and management.',
    helps: [
      'See rooms to clean', 'Track ready, dirty, inspecting, and OOO rooms', 'Assign rooms to staff',
      'Balance workload', 'See open tickets by room', 'Print assignment sheets',
      'Track floor progress', 'Coordinate with maintenance',
    ],
    keyOutcome: 'Rooms get ready faster and leadership can see progress clearly.',
    ctaLabel: 'See housekeeping view',
    mock: 'housekeepingApp',
  },
  'employees': {
    slug: 'employees',
    label: 'Employees',
    eyebrow: 'For hourly + salaried property staff',
    headline: 'Give employees one place to see their work, schedule, and updates.',
    subhead: 'StayOps helps employees view shifts, tasks, hours, bonuses, SOPs, profile information, and required work from one simple portal.',
    pain: 'Employees often depend on paper schedules, messages, verbal instructions, and unclear handoffs.',
    helps: [
      'See next shift', 'Clock in/out', 'View schedule', 'Manage availability',
      'Track hours', 'View earnings', 'See bonuses', 'Complete SOPs', 'Update profile',
    ],
    keyOutcome: 'Employees know what to do, when to do it, and where to find it.',
    ctaLabel: 'See employee portal',
    mock: 'employeeApp',
  },
  'front-desk': {
    slug: 'front-desk',
    label: 'Front Desk Access',
    eyebrow: 'For front desk staff + agents',
    headline: 'Help front desk teams stay aligned with rooms, guests, and property operations.',
    subhead: 'StayOps gives front desk staff access to schedules, SOPs, shift updates, handoffs, and the operational information needed to support guest-facing work.',
    pain: 'Front desk teams are often the first to hear guest issues, room problems, and schedule changes, but they may not have one place to coordinate everything.',
    helps: [
      'See shifts and schedules', 'View SOPs', 'Track handoff notes',
      'Coordinate with housekeeping', 'Flag maintenance issues', 'View assigned tasks',
      'Track hours and profile details', 'Support guest issue follow-up',
    ],
    keyOutcome: 'Front desk teams stay informed and property communication improves.',
    ctaLabel: 'See front desk access',
    mock: 'employeeApp',
  },
};

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type MockKey =
  | 'portfolio' | 'ownerKpi' | 'regional' | 'report'
  | 'maintenanceApp' | 'housekeepingApp' | 'employeeApp' | 'mobileTriptych';

export interface ProductSubpage {
  slug: string;
  label: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  whatYouSee: readonly string[];
  whyItMatters: string;
  bestFor?: readonly string[];
  keyValue: string;
  mock: MockKey;
}

export interface SolutionSubpage {
  slug: string;
  label: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  pain: string;
  helps: readonly string[];
  keyOutcome: string;
  ctaLabel: string;
  mock: MockKey;
}

export const PRODUCT_LIST = Object.values(PRODUCT_SUBPAGES);
export const SOLUTION_LIST = Object.values(SOLUTION_SUBPAGES);

/* ─── Photos used across pages ─────────────────────────────────────────── */
export const PHOTOS = {
  night: {
    hero:      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80&auto=format',
    secondary: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80&auto=format',
    finalBg:   'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1800&q=80&auto=format',
  },
  daylight: {
    hero:      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1800&q=80&auto=format',
    secondary: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80&auto=format',
    finalBg:   'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1800&q=80&auto=format',
  },
} as const;

/* ─── Reusable footer-CTA copy ─────────────────────────────────────────── */
export const FOOTER_CTA = {
  headline: 'Ready to see your hotels in one place?',
  body: 'StayOps is built for hotel ownership and regional operations teams managing multiple properties across different brands, systems, and locations.',
  ctaLabel: 'Book a Demo',
  ctaHref: '/website/contact',
  smallText: "No commitment. We'll show how it can work with your current portfolio and reports.",
} as const;
