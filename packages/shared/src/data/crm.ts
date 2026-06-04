/**
 * Sales CRM data — for Kwanisha Brown, Director of Sales.
 *
 * Focus: RECURRING GROUP business. The job isn't generic deal-chasing — it's
 * managing accounts that book room blocks repeatedly (crews, teams, corporate
 * contracts, travel programs) and surfacing opportunities to rebook, win back,
 * or grow them. Everything here is in-memory demo data.
 */

export type CrmAccountType = 'corporate' | 'crew' | 'sports' | 'travel-agency' | 'event' | 'government';
export type Cadence = 'weekly' | 'monthly' | 'quarterly' | 'seasonal' | 'annual' | 'one-time';
export type AccountStatus = 'active' | 'at-risk' | 'lapsed' | 'prospect';

export interface CrmAccount {
  id: string;
  name: string;
  type: CrmAccountType;
  status: AccountStatus;
  cadence: Cadence;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  /** Typical block size in room-nights per stay. */
  typicalRooms: number;
  negotiatedRate: number;        // nightly $
  /** Revenue booked with us in the trailing 12 months. */
  ytdRoomNights: number;
  ytdRevenue: number;
  lastStay: string;              // ISO date of most recent block
  nextExpected: string | null;   // ISO date we'd expect them back (pattern-based)
  notes: string;
  source: string;
}

export type OppKind = 'rebook-due' | 'win-back' | 'grow' | 'new-lead' | 'rfp';
export type OppStage = 'spotted' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  kind: OppKind;
  stage: OppStage;
  title: string;
  /** Why this is an opportunity right now — the signal that surfaced it. */
  signal: string;
  estRooms: number;
  estValue: number;              // total $ if won
  targetDate: string;            // ISO — when the block would land
  owner: string;
  confidence: number;            // 0-100
}

export type RfpStatus = 'new' | 'reviewing' | 'quoted' | 'won' | 'lost';
export interface Rfp {
  id: string;
  account: string;
  event: string;
  arrival: string;               // ISO
  nights: number;
  rooms: number;
  status: RfpStatus;
  value: number;
  due: string;                   // ISO response-due date
}

export type ActivityKind = 'call' | 'email' | 'meeting' | 'site-visit' | 'task';
export interface CrmActivity {
  id: string;
  kind: ActivityKind;
  accountId: string;
  accountName: string;
  summary: string;
  when: string;                  // ISO datetime
  done: boolean;
}

/* ── Accounts — the recurring relationships ───────────────────────────── */
export const CRM_ACCOUNTS: CrmAccount[] = [
  {
    id: 'ACC-001', name: 'Brentwood Pipeline Crew', type: 'crew', status: 'active', cadence: 'monthly',
    contactName: 'Dale Whitfield', contactTitle: 'Project Logistics Mgr', email: 'dwhitfield@brentwoodpipe.com', phone: '(225) 555-0142',
    typicalRooms: 14, negotiatedRate: 119, ytdRoomNights: 1680, ytdRevenue: 199_920,
    lastStay: '2026-05-12', nextExpected: '2026-06-10', source: 'Repeat', notes: 'Crew rotates 14 rooms ~3 weeks/month. Wants late checkout + laundry. Our #1 account by room-nights.',
  },
  {
    id: 'ACC-002', name: 'Gulf South Energy', type: 'corporate', status: 'active', cadence: 'weekly',
    contactName: 'Renee Adams', contactTitle: 'Travel Coordinator', email: 'radams@gulfsouthenergy.com', phone: '(225) 555-0188',
    typicalRooms: 6, negotiatedRate: 129, ytdRoomNights: 1248, ytdRevenue: 160_992,
    lastStay: '2026-05-29', nextExpected: '2026-06-05', source: 'Corporate LNR', notes: 'Mon–Thu engineers, every week. Steady. Up for LNR renewal in Q3.',
  },
  {
    id: 'ACC-003', name: 'Tigers AAU Basketball', type: 'sports', status: 'at-risk', cadence: 'seasonal',
    contactName: 'Coach Marcus Bell', contactTitle: 'Program Director', email: 'mbell@tigersaau.org', phone: '(225) 555-0119',
    typicalRooms: 22, negotiatedRate: 109, ytdRoomNights: 528, ytdRevenue: 57_552,
    lastStay: '2026-03-22', nextExpected: '2026-06-20', source: 'Event', notes: 'Tournament weekends, spring + summer. Booked a competitor in April — at risk. Summer series coming up.',
  },
  {
    id: 'ACC-004', name: 'Delta Crew Layover Program', type: 'crew', status: 'active', cadence: 'weekly',
    contactName: 'Janelle Ortiz', contactTitle: 'Crew Housing', email: 'jortiz@deltacrew.com', phone: '(404) 555-0177',
    typicalRooms: 8, negotiatedRate: 99, ytdRoomNights: 2080, ytdRevenue: 205_920,
    lastStay: '2026-06-01', nextExpected: '2026-06-08', source: 'Contract', notes: 'Daily flight crew layovers, contracted. Highest-volume, lowest rate. Auto-renews Jan.',
  },
  {
    id: 'ACC-005', name: 'Capitol Region School District', type: 'government', status: 'lapsed', cadence: 'annual',
    contactName: 'Pat Nguyen', contactTitle: 'Athletics Coordinator', email: 'pnguyen@crsd.k12.la.us', phone: '(225) 555-0203',
    typicalRooms: 18, negotiatedRate: 104, ytdRoomNights: 0, ytdRevenue: 0,
    lastStay: '2025-04-18', nextExpected: '2026-04-15', source: 'Past', notes: 'Booked state track meet 2024 + 2025 — did NOT return spring 2026. Win-back priority.',
  },
  {
    id: 'ACC-006', name: 'Bayou Medical Conferences', type: 'event', status: 'active', cadence: 'quarterly',
    contactName: 'Theresa Lamb', contactTitle: 'Events Lead', email: 'tlamb@bayoumed.com', phone: '(225) 555-0166',
    typicalRooms: 30, negotiatedRate: 139, ytdRoomNights: 360, ytdRevenue: 50_040,
    lastStay: '2026-04-30', nextExpected: '2026-07-28', source: 'RFP', notes: 'Quarterly CME conferences, 30-room peak + meeting space. Good banquet attach.',
  },
  {
    id: 'ACC-007', name: 'Premier Travel Partners', type: 'travel-agency', status: 'prospect', cadence: 'monthly',
    contactName: 'Andre Cole', contactTitle: 'Account Manager', email: 'acole@premiertp.com', phone: '(832) 555-0150',
    typicalRooms: 10, negotiatedRate: 0, ytdRoomNights: 0, ytdRevenue: 0,
    lastStay: '', nextExpected: null, source: 'Cold outreach', notes: 'Agency placing relocation + insurance displacement business. No rate yet — proposal stage.',
  },
  {
    id: 'ACC-008', name: 'Riverbend Film Productions', type: 'corporate', status: 'at-risk', cadence: 'one-time',
    contactName: 'Sofia Marchetti', contactTitle: 'Line Producer', email: 'sofia@riverbendfilm.com', phone: '(310) 555-0144',
    typicalRooms: 25, negotiatedRate: 124, ytdRoomNights: 450, ytdRevenue: 55_800,
    lastStay: '2026-02-15', nextExpected: null, source: 'Referral', notes: 'Shoot wrapped Feb. New project rumored for fall — keep warm, could be 25+ rooms / 6 weeks.',
  },
];

/* ── Opportunities — the heart of the tool ────────────────────────────── */
export const CRM_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-001', accountId: 'ACC-001', accountName: 'Brentwood Pipeline Crew', kind: 'rebook-due', stage: 'spotted',
    title: 'June rotation — 14 rooms', signal: 'Books monthly · last block May 12 · due ~June 10 (no booking yet)',
    estRooms: 14, estValue: 24_990, targetDate: '2026-06-10', owner: 'Kwanisha Brown', confidence: 85,
  },
  {
    id: 'OPP-002', accountId: 'ACC-005', accountName: 'Capitol Region School District', kind: 'win-back', stage: 'contacted',
    title: 'Win back state track meet', signal: 'Booked 2024 + 2025, skipped 2026 spring · lapsed 13 months',
    estRooms: 18, estValue: 18_720, targetDate: '2026-09-12', owner: 'Kwanisha Brown', confidence: 45,
  },
  {
    id: 'OPP-003', accountId: 'ACC-003', accountName: 'Tigers AAU Basketball', kind: 'rebook-due', stage: 'proposal',
    title: 'Summer tournament series', signal: 'Seasonal regular · went to competitor in April · summer dates open',
    estRooms: 22, estValue: 35_970, targetDate: '2026-06-20', owner: 'Kwanisha Brown', confidence: 55,
  },
  {
    id: 'OPP-004', accountId: 'ACC-006', accountName: 'Bayou Medical Conferences', kind: 'grow', stage: 'negotiation',
    title: 'Q3 CME + add banquet', signal: 'Quarterly regular · upsell meeting space + F&B on next block',
    estRooms: 34, estValue: 60_000, targetDate: '2026-07-28', owner: 'Kwanisha Brown', confidence: 70,
  },
  {
    id: 'OPP-005', accountId: 'ACC-007', accountName: 'Premier Travel Partners', kind: 'new-lead', stage: 'proposal',
    title: 'Relocation block agreement', signal: 'Agency could feed 10 rooms/month if we land a rate',
    estRooms: 10, estValue: 14_280, targetDate: '2026-07-01', owner: 'Kwanisha Brown', confidence: 40,
  },
  {
    id: 'OPP-006', accountId: 'ACC-008', accountName: 'Riverbend Film Productions', kind: 'grow', stage: 'spotted',
    title: 'Fall production block', signal: 'Past 25-room client · new project rumored for fall',
    estRooms: 25, estValue: 130_200, targetDate: '2026-10-05', owner: 'Kwanisha Brown', confidence: 30,
  },
  {
    id: 'OPP-007', accountId: 'ACC-002', accountName: 'Gulf South Energy', kind: 'grow', stage: 'spotted',
    title: 'LNR renewal + volume bump', signal: 'Weekly regular · contract renews Q3 · room to grow 6→9 rooms',
    estRooms: 9, estValue: 60_000, targetDate: '2026-08-01', owner: 'Kwanisha Brown', confidence: 65,
  },
];

/* ── RFPs / group leads inbox ─────────────────────────────────────────── */
export const CRM_RFPS: Rfp[] = [
  { id: 'RFP-101', account: 'Louisiana CPA Society', event: 'Annual Tax Summit', arrival: '2026-09-18', nights: 3, rooms: 40, status: 'new', value: 16_680, due: '2026-06-09' },
  { id: 'RFP-102', account: 'Southern Baptist Convention', event: 'Regional Youth Retreat', arrival: '2026-07-11', nights: 2, rooms: 55, status: 'reviewing', value: 13_090, due: '2026-06-06' },
  { id: 'RFP-103', account: 'Acadian Ambulance Training', event: 'Paramedic Cert Week', arrival: '2026-08-04', nights: 5, rooms: 20, status: 'quoted', value: 12_900, due: '2026-06-12' },
  { id: 'RFP-104', account: 'Bayou Medical Conferences', event: 'Q3 CME Conference', arrival: '2026-07-28', nights: 3, rooms: 30, status: 'quoted', value: 12_510, due: '2026-06-15' },
];

/* ── Activities ───────────────────────────────────────────────────────── */
export const CRM_ACTIVITIES: CrmActivity[] = [
  { id: 'ACT-1', kind: 'call',     accountId: 'ACC-001', accountName: 'Brentwood Pipeline Crew', summary: 'Confirm June rotation dates + room count', when: '2026-06-04T09:30', done: false },
  { id: 'ACT-2', kind: 'email',    accountId: 'ACC-005', accountName: 'Capitol Region School District', summary: 'Win-back proposal for fall meet', when: '2026-06-04T11:00', done: false },
  { id: 'ACT-3', kind: 'meeting',  accountId: 'ACC-006', accountName: 'Bayou Medical Conferences', summary: 'Site visit — banquet space for Q3', when: '2026-06-05T14:00', done: false },
  { id: 'ACT-4', kind: 'task',     accountId: 'ACC-003', accountName: 'Tigers AAU Basketball', summary: 'Send summer series contract draft', when: '2026-06-04T16:00', done: false },
  { id: 'ACT-5', kind: 'call',     accountId: 'ACC-002', accountName: 'Gulf South Energy', summary: 'Open LNR renewal conversation', when: '2026-06-06T10:00', done: false },
  { id: 'ACT-6', kind: 'email',    accountId: 'ACC-007', accountName: 'Premier Travel Partners', summary: 'Send negotiated-rate proposal', when: '2026-06-03T15:30', done: true },
];

/* ── Derived helpers ──────────────────────────────────────────────────── */
export const ACCOUNT_TYPE_LABEL: Record<CrmAccountType, string> = {
  corporate: 'Corporate', crew: 'Crew', sports: 'Sports', 'travel-agency': 'Travel Agency', event: 'Event', government: 'Government',
};
export const CADENCE_LABEL: Record<Cadence, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', seasonal: 'Seasonal', annual: 'Annual', 'one-time': 'One-time',
};
export const OPP_KIND_LABEL: Record<OppKind, string> = {
  'rebook-due': 'Rebook due', 'win-back': 'Win back', grow: 'Grow', 'new-lead': 'New lead', rfp: 'RFP',
};
export const OPP_STAGE_LABEL: Record<OppStage, string> = {
  spotted: 'Spotted', contacted: 'Contacted', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};
export const OPP_STAGES: OppStage[] = ['spotted', 'contacted', 'proposal', 'negotiation', 'won', 'lost'];

export function crmPipelineValue(opps: Opportunity[] = CRM_OPPORTUNITIES): number {
  return opps.filter((o) => o.stage !== 'won' && o.stage !== 'lost').reduce((s, o) => s + o.estValue, 0);
}
export function crmRecurringRevenue(accts: CrmAccount[] = CRM_ACCOUNTS): number {
  return accts.filter((a) => a.cadence !== 'one-time').reduce((s, a) => s + a.ytdRevenue, 0);
}
