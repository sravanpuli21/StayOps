'use client';

/**
 * Kwanisha's Sales OS — data layer.
 *
 * Kwanisha Brown is the only salesperson for Cambria Savannah Downtown (GA989).
 * Her job: turn front-desk "why are guests here?" pulse signals into leads,
 * accounts, opportunities, market events, and rate-review requests — and never
 * touch the PMS (no booking/blocking/rates; she can only *request* a rate review).
 *
 * This is the breadth-first store for the new sections the existing CRM didn't
 * cover yet (Leads, Contacts, Market Calendar, Prospecting, Tasks, Rate
 * Requests, Proposals & Contracts, Notifications). Existing modules — Accounts,
 * Opportunities, Demand Radar — keep their own data; this complements them.
 *
 * Everything is in-memory + localStorage (a real backend is a later step), with
 * a tiny pub/sub so every Kwanisha screen stays in sync within the session.
 */
import { useSyncExternalStore } from 'react';

/* ── Property (locked to GA989) ───────────────────────────────────────── */
export const PROPERTY = {
  code: 'GA989',
  name: 'Cambria Savannah Downtown',
  city: 'Savannah',
  state: 'GA',
} as const;

export const OWNER = 'Kwanisha Brown';
export const ACCENT = '#7c3aed';

/* ── Shared field unions ──────────────────────────────────────────────── */
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export const PRIORITIES: Priority[] = ['low', 'normal', 'high', 'urgent'];
export const PRIORITY_STYLE: Record<Priority, { label: string; fg: string; bg: string }> = {
  low:    { label: 'Low',    fg: '#6a6a6a', bg: '#f0f0f0' },
  normal: { label: 'Normal', fg: '#1d4ed8', bg: '#dbeafe' },
  high:   { label: 'High',   fg: '#b45309', bg: '#fef3c7' },
  urgent: { label: 'Urgent', fg: '#b91c1c', bg: '#fee2e2' },
};

export type Confidence = 'low' | 'medium' | 'high';

/** The demand categories the front desk + Kwanisha speak in (sales vocabulary). */
export type PulseCategory =
  | 'local-event' | 'university' | 'festival' | 'corporate' | 'construction'
  | 'wedding-family' | 'sports' | 'government' | 'medical' | 'weather'
  | 'emergency' | 'competitor-overflow' | 'long-stay' | 'annual' | 'unknown';

export const PULSE_CATEGORY_LABEL: Record<PulseCategory, string> = {
  'local-event': 'Local Event', university: 'SCAD / University', festival: 'Festival / Concert',
  corporate: 'Corporate / Business', construction: 'Construction / Project Crew',
  'wedding-family': 'Wedding / Family Event', sports: 'Sports / Team Travel',
  government: 'Government / Military', medical: 'Medical / Hospital', weather: 'Weather Displacement',
  emergency: 'Emergency / Evacuation', 'competitor-overflow': 'Competitor Overflow',
  'long-stay': 'Long Stay Potential', annual: 'Annual Event', unknown: 'Unknown / Needs Research',
};

/* ── Leads ────────────────────────────────────────────────────────────── */
export type LeadStatus = 'new' | 'needs-research' | 'qualified' | 'converted' | 'not-useful' | 'duplicate' | 'nurture' | 'lost';
export type LeadType = 'company' | 'event' | 'group' | 'weather-demand' | 'annual-demand' | 'unknown';
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New', 'needs-research': 'Needs Research', qualified: 'Qualified', converted: 'Converted to Opportunity',
  'not-useful': 'Not Useful', duplicate: 'Duplicate', nurture: 'Nurture Later', lost: 'Lost',
};
export const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  company: 'Company', event: 'Event', group: 'Group', 'weather-demand': 'Weather Demand',
  'annual-demand': 'Annual Demand', unknown: 'Unknown',
};
export interface SalesLead {
  id: string; propertyCode: string;
  name: string; type: LeadType; source: string; category: PulseCategory;
  company?: string; contact?: string;
  description?: string; potentialDates?: string; guestOrigin?: string;
  estRooms?: number; estRoomNights?: number; estValue?: number;
  confidence: Confidence; priority: Priority; nextAction?: string;
  status: LeadStatus; owner: string; followUpDate?: string;
  sourcePulseId?: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Contacts ─────────────────────────────────────────────────────────── */
export type ContactType = 'travel-booker' | 'event-organizer' | 'company-manager' | 'wedding-planner' | 'guest-contact' | 'vendor' | 'university' | 'government' | 'unknown';
export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  'travel-booker': 'Travel Booker', 'event-organizer': 'Event Organizer', 'company-manager': 'Company Manager',
  'wedding-planner': 'Wedding Planner', 'guest-contact': 'Guest Contact', vendor: 'Vendor',
  university: 'University Contact', government: 'Government Contact', unknown: 'Unknown',
};
export type ContactConsent = 'yes' | 'no' | 'unknown' | 'not-needed';
export interface SalesContact {
  id: string; propertyCode: string;
  name: string; account?: string; title?: string; phone?: string; email?: string;
  type: ContactType; preferredMethod?: string; consent: ContactConsent;
  lastContacted?: string; nextFollowUp?: string; status: 'active' | 'archived';
  source?: string; owner: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Market Calendar events ───────────────────────────────────────────── */
export type MarketCategory =
  | 'university' | 'festival' | 'corporate' | 'government' | 'sports'
  | 'wedding-family' | 'conference' | 'construction' | 'weather' | 'emergency'
  | 'holiday' | 'local' | 'unknown';
export const MARKET_CATEGORY_LABEL: Record<MarketCategory, string> = {
  university: 'SCAD / University', festival: 'Festival / Concert', corporate: 'Corporate / Business',
  government: 'Government / Military', sports: 'Sports', 'wedding-family': 'Wedding / Family',
  conference: 'Conference / Convention', construction: 'Construction / Project', weather: 'Weather Displacement',
  emergency: 'Emergency / Evacuation', holiday: 'Holiday / Long Weekend', local: 'Local Event', unknown: 'Unknown Demand Spike',
};
export type Impact = 'low' | 'medium' | 'high' | 'very-high' | 'unknown';
export const IMPACT_LABEL: Record<Impact, string> = {
  low: 'Low', medium: 'Medium', high: 'High', 'very-high': 'Very High', unknown: 'Unknown',
};
export const IMPACT_STYLE: Record<Impact, { fg: string; bg: string }> = {
  low: { fg: '#6a6a6a', bg: '#f0f0f0' }, medium: { fg: '#1d4ed8', bg: '#dbeafe' },
  high: { fg: '#b45309', bg: '#fef3c7' }, 'very-high': { fg: '#b91c1c', bg: '#fee2e2' },
  unknown: { fg: '#6a6a6a', bg: '#f0f0f0' },
};
export type MarketEventStatus = 'observed' | 'research' | 'confirmed' | 'watching' | 'outreach' | 'rate-review' | 'active' | 'completed' | 'archived';
export const MARKET_STATUS_LABEL: Record<MarketEventStatus, string> = {
  observed: 'Observed', research: 'Research Needed', confirmed: 'Confirmed', watching: 'Watching',
  outreach: 'Outreach Started', 'rate-review': 'Rate Review Needed', active: 'Active', completed: 'Completed', archived: 'Archived',
};
export type Recurring = 'yes' | 'no' | 'unknown';
export interface MarketEvent {
  id: string; propertyCode: string;
  name: string; category: MarketCategory;
  startDate: string; endDate?: string;
  recurring: Recurring; nextExpected?: string;
  impact: Impact; pastImpact?: string;
  salesAction?: string; revenueAction?: string;
  reminders: string[]; // e.g. ['11mo','6mo','1mo']
  owner: string; status: MarketEventStatus;
  sourcePulseId?: string; createdAt: string; updatedAt: string; notes?: string;
}
export const REMINDER_OPTIONS = ['11mo', '9mo', '6mo', '3mo', '1mo', '1wk'] as const;
export const REMINDER_LABEL: Record<string, string> = {
  '11mo': '11 months before', '9mo': '9 months before', '6mo': '6 months before',
  '3mo': '3 months before', '1mo': '1 month before', '1wk': '1 week before',
};

/* ── Prospecting ──────────────────────────────────────────────────────── */
export type ProspectCategory =
  | 'business' | 'corporate' | 'construction' | 'medical' | 'university'
  | 'wedding-planner' | 'venue' | 'tour-operator' | 'government' | 'sports'
  | 'vendor' | 'competitor-overflow' | 'restaurant' | 'long-stay' | 'other';
export const PROSPECT_CATEGORY_LABEL: Record<ProspectCategory, string> = {
  business: 'Nearby Business', corporate: 'Corporate Office', construction: 'Construction Company',
  medical: 'Hospital / Medical Partner', university: 'SCAD / University Contact', 'wedding-planner': 'Wedding Planner',
  venue: 'Event Venue', 'tour-operator': 'Tour Operator', government: 'Government Office', sports: 'Sports Organization',
  vendor: 'Local Vendor', 'competitor-overflow': 'Competitor Overflow', restaurant: 'Restaurant / Venue',
  'long-stay': 'Long-Stay Source', other: 'Other',
};
export type ProspectStatus = 'to-research' | 'researching' | 'ready' | 'contacted' | 'interested' | 'converted-lead' | 'converted-account' | 'not-useful' | 'nurture';
export const PROSPECT_STATUS_LABEL: Record<ProspectStatus, string> = {
  'to-research': 'To Research', researching: 'Researching', ready: 'Ready to Contact', contacted: 'Contacted',
  interested: 'Interested', 'converted-lead': 'Converted to Lead', 'converted-account': 'Converted to Account',
  'not-useful': 'Not Useful', nurture: 'Nurture Later',
};
export interface Prospect {
  id: string; propertyCode: string;
  name: string; category: ProspectCategory;
  address?: string; city?: string; state?: string; website?: string; phone?: string; email?: string;
  contactPerson?: string; whyMatters?: string; businessType?: string;
  priority: Priority; status: ProspectStatus; nextAction?: string;
  owner: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Tasks (follow-up system) ─────────────────────────────────────────── */
export type TaskType = 'call' | 'email' | 'meeting' | 'site-tour' | 'research' | 'follow-up' | 'proposal' | 'rate-request' | 'revenue-review' | 'regional-review' | 'event-reminder' | 'pulse-review' | 'other';
export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  call: 'Call', email: 'Email', meeting: 'Meeting', 'site-tour': 'Site Tour', research: 'Research',
  'follow-up': 'Follow-up', proposal: 'Proposal', 'rate-request': 'Rate Request', 'revenue-review': 'Revenue Manager Review',
  'regional-review': 'Regional Ops Review', 'event-reminder': 'Market Event Reminder', 'pulse-review': 'Pulse Review', other: 'Other',
};
export type TaskStatus = 'open' | 'in-progress' | 'waiting' | 'completed' | 'cancelled';
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Open', 'in-progress': 'In Progress', waiting: 'Waiting', completed: 'Completed', cancelled: 'Cancelled',
};
export interface SalesTask {
  id: string; propertyCode: string;
  title: string; type: TaskType;
  relatedAccount?: string; relatedContact?: string; relatedLead?: string; relatedOpportunity?: string; relatedEvent?: string;
  dueDate?: string; priority: Priority; status: TaskStatus;
  owner: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Rate Requests (request review only — never change rates) ─────────── */
export type RateRequestType = 'corporate' | 'group' | 'discount' | 'high-demand' | 'future-event' | 'renewal' | 'weather';
export const RATE_REQUEST_TYPE_LABEL: Record<RateRequestType, string> = {
  corporate: 'Corporate Rate Request', group: 'Group Rate Request', discount: 'Special Discount Request',
  'high-demand': 'High Demand Pricing Alert', 'future-event': 'Future Event Rate Review',
  renewal: 'Contract Renewal Rate Review', weather: 'Weather Demand Rate Alert',
};
export type RateRequestStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info' | 'cancelled';
export const RATE_REQUEST_STATUS_LABEL: Record<RateRequestStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', 'under-review': 'Under Review', approved: 'Approved',
  rejected: 'Rejected', 'needs-info': 'Needs More Info', cancelled: 'Cancelled',
};
export const RATE_REQUEST_STATUS_STYLE: Record<RateRequestStatus, { fg: string; bg: string }> = {
  draft: { fg: '#6a6a6a', bg: '#f0f0f0' }, submitted: { fg: '#1d4ed8', bg: '#dbeafe' },
  'under-review': { fg: '#7c3aed', bg: '#ece4fb' }, approved: { fg: '#15803d', bg: '#dcfce7' },
  rejected: { fg: '#b91c1c', bg: '#fee2e2' }, 'needs-info': { fg: '#b45309', bg: '#fef3c7' },
  cancelled: { fg: '#6a6a6a', bg: '#f0f0f0' },
};
export type SendTo = 'revenue-manager' | 'regional-ops' | 'both';
export const SEND_TO_LABEL: Record<SendTo, string> = {
  'revenue-manager': 'Revenue Manager', 'regional-ops': 'Regional Operations', both: 'Both',
};
export interface RateRequest {
  id: string; propertyCode: string;
  title: string; type: RateRequestType;
  relatedAccount?: string; relatedOpportunity?: string; relatedEvent?: string;
  dates?: string; estRooms?: number; estRoomNights?: number; requestedRate?: number;
  reason?: string; expectedValue?: number; competitorNotes?: string;
  urgency: Priority; sendTo: SendTo; status: RateRequestStatus;
  decision?: string; owner: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Proposals & Contracts ────────────────────────────────────────────── */
export type ProposalType = 'corporate' | 'group' | 'event' | 'long-stay' | 'partnership';
export const PROPOSAL_TYPE_LABEL: Record<ProposalType, string> = {
  corporate: 'Corporate Rate Proposal', group: 'Group Proposal', event: 'Event Proposal',
  'long-stay': 'Long-Stay Proposal', partnership: 'Partnership Proposal',
};
export type ProposalStatus = 'draft' | 'sent' | 'followed-up' | 'negotiating' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: 'Draft', sent: 'Sent', 'followed-up': 'Viewed / Followed Up', negotiating: 'Negotiating',
  accepted: 'Accepted', rejected: 'Rejected', expired: 'Expired', cancelled: 'Cancelled',
};
export const PROPOSAL_STATUS_STYLE: Record<ProposalStatus, { fg: string; bg: string }> = {
  draft: { fg: '#6a6a6a', bg: '#f0f0f0' }, sent: { fg: '#1d4ed8', bg: '#dbeafe' },
  'followed-up': { fg: '#7c3aed', bg: '#ece4fb' }, negotiating: { fg: '#b45309', bg: '#fef3c7' },
  accepted: { fg: '#15803d', bg: '#dcfce7' }, rejected: { fg: '#b91c1c', bg: '#fee2e2' },
  expired: { fg: '#6a6a6a', bg: '#f0f0f0' }, cancelled: { fg: '#6a6a6a', bg: '#f0f0f0' },
};
export interface Proposal {
  id: string; propertyCode: string;
  name: string; type: ProposalType; account?: string; contact?: string; opportunity?: string;
  dates?: string; estRooms?: number; estRoomNights?: number; proposedRate?: number;
  sentDate?: string; expirationDate?: string; value?: number; nextFollowUp?: string;
  status: ProposalStatus; fileName?: string; owner: string; createdAt: string; updatedAt: string; notes?: string;
}
export type ContractType = 'corporate' | 'group' | 'event' | 'long-stay' | 'partnership';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled' | 'renewal-needed';
export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  draft: 'Draft', sent: 'Sent', signed: 'Signed', expired: 'Expired', cancelled: 'Cancelled', 'renewal-needed': 'Renewal Needed',
};
export interface Contract {
  id: string; propertyCode: string;
  name: string; account?: string; opportunity?: string; type: ContractType;
  startDate?: string; endDate?: string; rateExpiration?: string;
  status: ContractStatus; fileName?: string; renewalReminder?: string;
  owner: string; createdAt: string; updatedAt: string; notes?: string;
}

/* ── Notifications ────────────────────────────────────────────────────── */
export interface SalesNotification {
  id: string; kind: string; title: string; body?: string;
  href?: string; read: boolean; createdAt: string;
}

/* ── Pulse review overlay ─────────────────────────────────────────────
 * The front-desk pulse signals are read-only (shared demand store). Kwanisha's
 * triage — sales/revenue relevance, her cleaned-up interpretation, status —
 * lives here, keyed by the signal id, so the original front-desk note is never
 * overwritten (audit trail). */
export type PulseStatus = 'new' | 'sales-relevant' | 'revenue-relevant' | 'needs-review' | 'converted' | 'not-useful' | 'archived';
export const PULSE_STATUS_LABEL: Record<PulseStatus, string> = {
  new: 'New', 'sales-relevant': 'Sales Relevant', 'revenue-relevant': 'Revenue Relevant',
  'needs-review': 'Needs Review', converted: 'Converted', 'not-useful': 'Not Useful', archived: 'Archived',
};
export interface PulseReview {
  signalId: string;
  status: PulseStatus;
  salesRelevant?: boolean;
  revenueRelevant?: boolean;
  salesInterpretation?: string;
  category?: PulseCategory;
  updatedAt: string;
}

/* ── Unified store ────────────────────────────────────────────────────── */
export interface SalesState {
  leads: SalesLead[];
  contacts: SalesContact[];
  events: MarketEvent[];
  prospects: Prospect[];
  tasks: SalesTask[];
  rateRequests: RateRequest[];
  proposals: Proposal[];
  contracts: Contract[];
  notifications: SalesNotification[];
  pulseReviews: Record<string, PulseReview>;
}

const KEY = 'stayops.kwanisha.sales';
const listeners = new Set<() => void>();
let cache: SalesState | null = null;

function iso(daysFromNow = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}
function dateOnly(daysFromNow = 0) {
  return iso(daysFromNow).slice(0, 10);
}

/* ── Seed (Savannah / GA989, from the spec's sample data) ─────────────── */
function seed(): SalesState {
  const pc = PROPERTY.code;
  const base = { propertyCode: pc, owner: OWNER, createdAt: iso(-20), updatedAt: iso(-2) };
  return {
    leads: [
      { ...base, id: 'LEAD-001', name: 'ABC Construction Monthly Travel', type: 'company', source: 'Front Desk Pulse', category: 'construction', company: 'ABC Construction', description: 'Guest said ABC Construction sends crews to Savannah every month. Potential monthly corporate rate.', guestOrigin: 'Atlanta', estRooms: 8, estRoomNights: 160, estValue: 19000, confidence: 'medium', priority: 'high', nextAction: 'Find travel decision-maker', status: 'new', followUpDate: dateOnly(3) },
      { ...base, id: 'LEAD-002', name: 'Annual Patel Family Reunion', type: 'annual-demand', source: 'Front Desk Pulse', category: 'wedding-family', contact: 'Priya Patel', description: 'Family does a reunion in Savannah every year — booked individually this time.', guestOrigin: 'New York', estRooms: 12, estRoomNights: 24, estValue: 4200, confidence: 'medium', priority: 'normal', nextAction: 'Reconnect ~9 months out', status: 'qualified', followUpDate: dateOnly(14) },
      { ...base, id: 'LEAD-003', name: 'Downtown Wedding Weekend', type: 'event', source: 'Front Desk Pulse', category: 'wedding-family', description: 'Several guests for a downtown wedding — possible planner relationship.', estRooms: 15, estRoomNights: 30, confidence: 'low', priority: 'normal', status: 'needs-research' },
    ],
    contacts: [
      { ...base, id: 'CON-001', name: 'Priya Patel', account: 'Patel Family Reunion', title: 'Family Organizer', phone: '(912) 555-0148', email: 'priya.patel@email.com', type: 'event-organizer', consent: 'yes', status: 'active', source: 'Front Desk Pulse', nextFollowUp: dateOnly(14) },
      { ...base, id: 'CON-002', name: 'Marcus Lee', account: 'ABC Construction', title: 'Field Operations', phone: '(404) 555-0192', email: 'mlee@abcconstruction.com', type: 'company-manager', consent: 'unknown', status: 'active', source: 'Research' },
    ],
    events: [
      { ...base, id: 'MKT-001', name: 'SCAD Commencement', category: 'university', startDate: '2026-05-30', endDate: '2026-06-02', recurring: 'yes', nextExpected: '2027-05-29', impact: 'very-high', pastImpact: 'Citywide compression — sold out, mostly walk-in families.', salesAction: 'Family blocks, vendor & university-department outreach, repeat parent travel.', revenueAction: 'Review pricing for next year, watch compression, consider minimum-stay.', reminders: ['11mo', '9mo', '6mo', '3mo', '1mo'], status: 'confirmed', sourcePulseId: 'DS-001' },
      { ...base, id: 'MKT-002', name: 'Savannah Jazz Festival', category: 'festival', startDate: '2026-09-24', endDate: '2026-09-27', recurring: 'yes', nextExpected: '2027-09-23', impact: 'high', pastImpact: 'Strong downtown demand — rode the wave with no block.', salesAction: 'B2B with festival org, vendors, performers, nearby venues, sponsors.', revenueAction: 'Notify Revenue Manager for next-year rate review.', reminders: ['9mo', '6mo', '3mo'], status: 'watching', sourcePulseId: 'DS-002' },
      { ...base, id: 'MKT-003', name: "St. Patrick's Day (Savannah)", category: 'festival', startDate: '2026-03-17', recurring: 'yes', nextExpected: '2027-03-17', impact: 'very-high', pastImpact: 'Citywide sellout — biggest Savannah draw.', salesAction: 'Pre-sell blocks earlier; lock partner venues.', revenueAction: 'Push rate harder; set minimum stays.', reminders: ['11mo', '6mo', '3mo', '1mo'], status: 'watching' },
      { ...base, id: 'MKT-004', name: 'Hurricane Season Demand Watch', category: 'weather', startDate: '2026-08-01', endDate: '2026-11-30', recurring: 'yes', impact: 'unknown', pastImpact: 'FL evacuees fill Savannah fast off I-95 — reactive, not pre-sellable.', revenueAction: 'Watch the 14-day forecast; hold rate + ready the house when a storm tracks toward FL.', reminders: ['1wk'], status: 'watching' },
    ],
    prospects: [
      { ...base, id: 'PRO-001', name: 'SCAD Event Services', category: 'university', city: 'Savannah', state: 'GA', whyMatters: 'Owns logistics for commencement + university events — the door to recurring family/vendor blocks.', businessType: 'University Event Block', priority: 'high', status: 'to-research', nextAction: 'Find events contact' },
      { ...base, id: 'PRO-002', name: 'Savannah Wedding Planners Group', category: 'wedding-planner', city: 'Savannah', state: 'GA', whyMatters: 'Feeds downtown wedding room blocks year-round.', businessType: 'Wedding Group Blocks', priority: 'normal', status: 'to-research' },
      { ...base, id: 'PRO-003', name: 'River Street Event Venue', category: 'venue', city: 'Savannah', state: 'GA', whyMatters: 'Overflow + partner referrals for events near the river.', businessType: 'Partnership / Overflow', priority: 'normal', status: 'researching' },
      { ...base, id: 'PRO-004', name: 'Coastal Medical Staffing', category: 'medical', city: 'Savannah', state: 'GA', whyMatters: 'Travel nurses + long-stay medical contracts.', businessType: 'Long-Stay / Corporate', priority: 'high', status: 'to-research' },
    ],
    tasks: [
      { ...base, id: 'TASK-001', title: 'Call ABC Construction travel manager', type: 'call', relatedLead: 'ABC Construction Monthly Travel', dueDate: dateOnly(0), priority: 'high', status: 'open' },
      { ...base, id: 'TASK-002', title: 'Research next SCAD commencement date', type: 'research', relatedEvent: 'SCAD Commencement', dueDate: dateOnly(0), priority: 'normal', status: 'open' },
      { ...base, id: 'TASK-003', title: 'Notify Revenue Manager about Jazz Festival dates', type: 'revenue-review', relatedEvent: 'Savannah Jazz Festival', dueDate: dateOnly(2), priority: 'normal', status: 'open' },
      { ...base, id: 'TASK-004', title: 'Follow up with family reunion contact', type: 'follow-up', relatedContact: 'Priya Patel', dueDate: dateOnly(-1), priority: 'normal', status: 'open' },
      { ...base, id: 'TASK-005', title: 'Build prospect list for wedding planners', type: 'research', dueDate: dateOnly(5), priority: 'low', status: 'open' },
    ],
    rateRequests: [
      { ...base, id: 'RATE-001', title: 'SCAD Commencement future rate review', type: 'future-event', relatedEvent: 'SCAD Commencement', dates: 'May 2027', estRooms: 40, reason: 'Annual very-high compression — set strategy early for next year.', urgency: 'normal', sendTo: 'revenue-manager', status: 'submitted' },
      { ...base, id: 'RATE-002', title: 'ABC Construction monthly corporate rate', type: 'corporate', relatedAccount: 'ABC Construction', dates: 'Ongoing monthly', estRooms: 8, estRoomNights: 160, requestedRate: 119, reason: 'Monthly recurring crew — needs a contracted corporate rate to win.', expectedValue: 19000, urgency: 'high', sendTo: 'revenue-manager', status: 'draft' },
    ],
    proposals: [
      { ...base, id: 'PROP-001', name: 'ABC Construction Corporate Rate Proposal', type: 'corporate', account: 'ABC Construction', dates: 'Monthly', estRooms: 8, estRoomNights: 160, proposedRate: 119, status: 'draft', value: 19000, nextFollowUp: dateOnly(4) },
    ],
    contracts: [],
    notifications: [
      { id: 'NOT-001', kind: 'pulse-sales', title: 'New front-desk pulse marked sales-relevant', body: 'SCAD commencement demand — many guests for graduation.', href: '/web/kwanisha/pulse', read: false, createdAt: iso(-1) },
      { id: 'NOT-002', kind: 'task-due', title: 'Task due today: Call ABC Construction travel manager', href: '/web/kwanisha/tasks', read: false, createdAt: iso(0) },
      { id: 'NOT-003', kind: 'event-reminder', title: 'Market event coming up: Savannah Jazz Festival', href: '/web/kwanisha/market-calendar', read: true, createdAt: iso(-3) },
    ],
    pulseReviews: {},
  };
}

function read(): SalesState {
  if (cache) return cache;
  if (typeof window === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...seed(), ...(JSON.parse(raw) as SalesState) } : seed();
  } catch {
    cache = seed();
  }
  return cache!;
}
function write(next: SalesState) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function useSalesState(): SalesState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    seed,
  );
}

function id(prefix: string) {
  // Stable-enough unique id without Date.now collisions across quick adds.
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
const meta = () => ({ propertyCode: PROPERTY.code, owner: OWNER, createdAt: iso(), updatedAt: iso() });

/* ── Mutators (no hard delete — archive/lost/not-useful per platform rule) ── */
export function addLead(l: Omit<SalesLead, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): SalesLead {
  const created: SalesLead = { ...meta(), ...l, id: id('LEAD') };
  write({ ...read(), leads: [created, ...read().leads] });
  return created;
}
export function updateLead(leadId: string, patch: Partial<SalesLead>) {
  const s = read();
  write({ ...s, leads: s.leads.map((x) => x.id === leadId ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addContact(c: Omit<SalesContact, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt' | 'status'>): SalesContact {
  const created: SalesContact = { ...meta(), status: 'active', ...c, id: id('CON') };
  write({ ...read(), contacts: [created, ...read().contacts] });
  return created;
}
export function updateContact(cid: string, patch: Partial<SalesContact>) {
  const s = read();
  write({ ...s, contacts: s.contacts.map((x) => x.id === cid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addMarketEvent(e: Omit<MarketEvent, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): MarketEvent {
  const created: MarketEvent = { ...meta(), ...e, id: id('MKT') };
  write({ ...read(), events: [created, ...read().events] });
  return created;
}
export function updateMarketEvent(eid: string, patch: Partial<MarketEvent>) {
  const s = read();
  write({ ...s, events: s.events.map((x) => x.id === eid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addProspect(p: Omit<Prospect, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): Prospect {
  const created: Prospect = { ...meta(), ...p, id: id('PRO') };
  write({ ...read(), prospects: [created, ...read().prospects] });
  return created;
}
export function updateProspect(pid: string, patch: Partial<Prospect>) {
  const s = read();
  write({ ...s, prospects: s.prospects.map((x) => x.id === pid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addTask(t: Omit<SalesTask, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): SalesTask {
  const created: SalesTask = { ...meta(), ...t, id: id('TASK') };
  write({ ...read(), tasks: [created, ...read().tasks] });
  return created;
}
export function updateTask(tid: string, patch: Partial<SalesTask>) {
  const s = read();
  write({ ...s, tasks: s.tasks.map((x) => x.id === tid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addRateRequest(r: Omit<RateRequest, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): RateRequest {
  const created: RateRequest = { ...meta(), ...r, id: id('RATE') };
  write({ ...read(), rateRequests: [created, ...read().rateRequests] });
  return created;
}
export function updateRateRequest(rid: string, patch: Partial<RateRequest>) {
  const s = read();
  write({ ...s, rateRequests: s.rateRequests.map((x) => x.id === rid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addProposal(p: Omit<Proposal, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): Proposal {
  const created: Proposal = { ...meta(), ...p, id: id('PROP') };
  write({ ...read(), proposals: [created, ...read().proposals] });
  return created;
}
export function updateProposal(pid: string, patch: Partial<Proposal>) {
  const s = read();
  write({ ...s, proposals: s.proposals.map((x) => x.id === pid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function addContract(c: Omit<Contract, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'>): Contract {
  const created: Contract = { ...meta(), ...c, id: id('CONT') };
  write({ ...read(), contracts: [created, ...read().contracts] });
  return created;
}
export function updateContract(cid: string, patch: Partial<Contract>) {
  const s = read();
  write({ ...s, contracts: s.contracts.map((x) => x.id === cid ? { ...x, ...patch, updatedAt: iso() } : x) });
}
export function markNotificationRead(nid: string) {
  const s = read();
  write({ ...s, notifications: s.notifications.map((x) => x.id === nid ? { ...x, read: true } : x) });
}
export function setPulseReview(signalId: string, patch: Partial<PulseReview>) {
  const s = read();
  const prev = s.pulseReviews[signalId] ?? { signalId, status: 'new' as PulseStatus, updatedAt: iso() };
  write({ ...s, pulseReviews: { ...s.pulseReviews, [signalId]: { ...prev, ...patch, signalId, updatedAt: iso() } } });
}
export function addNotification(n: Omit<SalesNotification, 'id' | 'read' | 'createdAt'>) {
  const created: SalesNotification = { ...n, id: id('NOT'), read: false, createdAt: iso() };
  write({ ...read(), notifications: [created, ...read().notifications] });
}

/* ── Small formatting helpers shared across pages ─────────────────────── */
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
export const fmtMoney = (n?: number) =>
  n == null ? '—' : n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
