/**
 * Unified Action Queue data model for Rishab GM app.
 * One queue, six item types — exactly matches the GM spec.
 *
 *   Ticket      Operational issue (AC broken, drain backup)
 *   Task        GM responsibility (schedule, tax filing)
 *   Reminder    Scheduled task (Tue market order)
 *   Escalation  Leadership attention (Regional asks why OOO)
 *   Approval    Decision required (PO, OT, refund)
 *   Alert       System warning (only 18 clean for 42 arrivals)
 */

export type ItemType = 'ticket' | 'task' | 'reminder' | 'escalation' | 'approval' | 'alert';
export type Priority = 'urgent' | 'high' | 'medium' | 'normal';
export type ItemState = 'open' | 'in_progress' | 'pending' | 'overdue' | 'resolved' | 'completed';
export type Department = 'maintenance' | 'housekeeping' | 'front-desk' | 'kitchen' | 'bar' | 'market' | 'gm';

export interface QueueItem {
  id: string;
  type: ItemType;
  title: string;
  whyItMatters: string;       // one short line — the "why does this matter"

  priority: Priority;
  state: ItemState;

  /* Who */
  assignedTo?: string;
  assignedToRole?: string;
  escalatedBy?: string;
  escalatedByRole?: string;
  requester?: string;
  requesterRole?: string;
  contactPhone?: string;

  /* Context */
  room?: string;
  department?: Department;
  amount?: string;
  cadence?: string;
  ticketLinkedTo?: string;

  /* Why-it-matters signals */
  revenueImpact?: number;     // $ per night/day
  guestImpact?: boolean;
  ownershipImpact?: boolean;

  /* Time */
  openedAgo?: string;          // "2 days", "4h"
  dueLabel?: string;           // "Due Friday"
  ageHours?: number;
}

export const QUEUE: QueueItem[] = [
  /* ── ALERTS — system warnings ───────────────────────────── */
  {
    id: 'ALT-001',
    type: 'alert',
    title: 'Only 18 clean rooms for 42 arrivals',
    whyItMatters: '24-room gap. HK pace check needed before 3 PM.',
    priority: 'urgent',
    state: 'open',
    department: 'housekeeping',
    guestImpact: true,
    revenueImpact: 0,
    openedAgo: '12m',
    ageHours: 0.2,
  },
  {
    id: 'ALT-002',
    type: 'alert',
    title: 'Payroll % at 28.4% — over target',
    whyItMatters: 'Above 28% threshold. Review remainder of pay period.',
    priority: 'high',
    state: 'open',
    department: 'gm',
    ownershipImpact: true,
    openedAgo: '2h',
    ageHours: 2,
  },

  /* ── TICKETS — operational issues ───────────────────────── */
  {
    id: 'TKT-301',
    type: 'ticket',
    title: 'Room 303 — AC not cooling',
    whyItMatters: 'Room cannot be sold. Repeat issue (3rd in 60 days).',
    priority: 'urgent',
    state: 'in_progress',
    assignedTo: 'Amir Lopez',
    assignedToRole: 'Maintenance',
    contactPhone: '+1-555-0140',
    room: '303',
    department: 'maintenance',
    revenueImpact: 142,
    guestImpact: true,
    openedAgo: '2 days',
    ageHours: 48,
  },
  {
    id: 'TKT-508',
    type: 'ticket',
    title: 'Room 508 — Drain backup',
    whyItMatters: 'OOO since Mon. Plumber on site.',
    priority: 'urgent',
    state: 'pending',
    assignedTo: 'ABC Plumbing',
    assignedToRole: 'Vendor',
    room: '508',
    department: 'maintenance',
    revenueImpact: 142,
    openedAgo: '1 day',
    ageHours: 22,
  },
  {
    id: 'TKT-411',
    type: 'ticket',
    title: 'Guest complaint — noise level Floor 4',
    whyItMatters: 'Guest from 411 escalated to GM. Refund considered.',
    priority: 'high',
    state: 'open',
    assignedTo: 'Priya Nair',
    assignedToRole: 'Front Desk',
    room: '411',
    department: 'front-desk',
    guestImpact: true,
    openedAgo: '4h',
    ageHours: 4,
  },

  /* ── ESCALATIONS — leadership ↔ GM ──────────────────────── */
  {
    id: 'ESC-001',
    type: 'escalation',
    title: 'Why are 5 rooms OOO this week?',
    whyItMatters: 'Regional asking for an explanation. Revenue hit $710/night.',
    priority: 'high',
    state: 'open',
    escalatedBy: 'Harshal Mehta',
    escalatedByRole: 'Regional Manager',
    department: 'gm',
    ownershipImpact: true,
    revenueImpact: 710,
    dueLabel: 'Reply today',
    ageHours: 3,
  },
  {
    id: 'ESC-002',
    type: 'escalation',
    title: 'Low guest score for May — provide context',
    whyItMatters: 'CEO requested a 1-page note on what changed.',
    priority: 'high',
    state: 'pending',
    escalatedBy: 'Kris Patel',
    escalatedByRole: 'CEO',
    department: 'gm',
    ownershipImpact: true,
    dueLabel: 'Due in 2 days',
    ageHours: 14,
  },

  /* ── APPROVALS — GM decisions ───────────────────────────── */
  {
    id: 'APV-013',
    type: 'approval',
    title: 'Replacement HVAC unit — Room 306',
    whyItMatters: '3rd repair this year. Replace > repair: $720 YTD.',
    priority: 'high',
    state: 'pending',
    requester: 'Amir Lopez',
    requesterRole: 'Maintenance',
    amount: '$3,800',
    department: 'maintenance',
    ownershipImpact: true,
    openedAgo: '3h',
    ageHours: 3,
  },
  {
    id: 'APV-010',
    type: 'approval',
    title: 'Marco — overtime approval (4 hrs)',
    whyItMatters: 'Late checkout coverage Sun. Marco YTD OT: 18 hrs.',
    priority: 'medium',
    state: 'pending',
    requester: 'Marco Lin',
    requesterRole: 'Front Desk',
    amount: '$92.50',
    department: 'front-desk',
    openedAgo: '2h',
    ageHours: 2,
  },
  {
    id: 'APV-012',
    type: 'approval',
    title: 'Vendor invoice — ABC Plumbing',
    whyItMatters: 'Drain repair Room 508. PO matched.',
    priority: 'normal',
    state: 'pending',
    requester: 'AP queue',
    amount: '$1,420',
    department: 'maintenance',
    openedAgo: '3 days',
    ageHours: 72,
  },
  {
    id: 'APV-011',
    type: 'approval',
    title: 'Rosa — time-off (Jun 18–20)',
    whyItMatters: 'Family event. Carlos can cover double shifts.',
    priority: 'normal',
    state: 'pending',
    requester: 'Rosa Navarro',
    requesterRole: 'Housekeeping',
    department: 'housekeeping',
    openedAgo: '1 day',
    ageHours: 22,
  },

  /* ── TASKS — GM responsibilities ────────────────────────── */
  {
    id: 'TSK-002',
    type: 'task',
    title: 'Q2 brand inspection prep',
    whyItMatters: 'Inspector arrives Jun 17. 2 minor + 1 major last quarter.',
    priority: 'high',
    state: 'in_progress',
    assignedTo: 'Rishab Patel',
    assignedToRole: 'GM',
    escalatedBy: 'Harshal Mehta',
    escalatedByRole: 'Regional Manager',
    dueLabel: 'Due in 12 days',
    ageHours: 36,
  },
  {
    id: 'TSK-008',
    type: 'task',
    title: 'Q1 owner report draft',
    whyItMatters: 'Ownership reviews Jun 22. Template in shared drive.',
    priority: 'high',
    state: 'pending',
    assignedTo: 'Rishab Patel',
    assignedToRole: 'GM',
    escalatedBy: 'Kris Patel',
    escalatedByRole: 'CEO',
    ownershipImpact: true,
    dueLabel: 'Due in 5 days',
    ageHours: 8,
  },
  {
    id: 'TSK-001',
    type: 'task',
    title: 'Annual property tax filing',
    whyItMatters: 'Last year: $42,180. Final draft 14 days before deadline.',
    priority: 'medium',
    state: 'pending',
    assignedTo: 'Rishab Patel',
    assignedToRole: 'GM',
    cadence: 'Annual',
    dueLabel: 'Due Apr 15, 2026',
    ageHours: 240,
  },

  /* ── REMINDERS — scheduled / recurring ──────────────────── */
  {
    id: 'RMD-005',
    type: 'reminder',
    title: 'Tuesday inventory order — housekeeping',
    whyItMatters: 'Linens, towels, amenities. PAR levels in supply room.',
    priority: 'medium',
    state: 'pending',
    cadence: 'Tue / Thu',
    department: 'housekeeping',
    dueLabel: 'Due tomorrow',
    ageHours: 0,
  },
  {
    id: 'RMD-006',
    type: 'reminder',
    title: 'Kitchen grocery order — breakfast',
    whyItMatters: 'Out of waffle batter as of 6 AM.',
    priority: 'high',
    state: 'overdue',
    cadence: 'Tue / Thu',
    department: 'kitchen',
    dueLabel: 'Overdue 1 day',
    ageHours: 24,
  },
  {
    id: 'RMD-003',
    type: 'reminder',
    title: 'Bi-weekly staff schedule submission',
    whyItMatters: 'Submit week of Jun 2–15 to corporate. Include OT projections.',
    priority: 'medium',
    state: 'pending',
    cadence: 'Bi-weekly',
    dueLabel: 'Due Friday',
    ageHours: 0,
  },
  {
    id: 'RMD-007',
    type: 'reminder',
    title: 'Market merchandise order',
    whyItMatters: 'Suite Shop snacks, drinks, sundries.',
    priority: 'normal',
    state: 'pending',
    cadence: 'Weekly',
    department: 'market',
    dueLabel: 'Due Thursday',
    ageHours: 0,
  },
];

/* ── Type display config ───────────────────────────────────── */

export const TYPE_CFG: Record<ItemType, { label: string; icon: string; color: string; bg: string }> = {
  alert:       { label: 'Alert',       icon: 'warning-outline',           color: '#b91c1c', bg: '#fee2e2' },
  ticket:      { label: 'Ticket',      icon: 'construct-outline',         color: '#1d4ed8', bg: '#dbeafe' },
  escalation:  { label: 'Escalation',  icon: 'arrow-up-circle-outline',   color: '#b91c1c', bg: '#fee2e2' },
  approval:    { label: 'Approval',    icon: 'checkbox-outline',          color: '#15803d', bg: '#dcfce7' },
  task:        { label: 'Task',        icon: 'briefcase-outline',         color: '#5b21b6', bg: '#e0e7ff' },
  reminder:    { label: 'Reminder',    icon: 'alarm-outline',             color: '#a16207', bg: '#fef9c3' },
};

export const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string; rank: number }> = {
  urgent: { label: 'Urgent', color: '#b91c1c', bg: '#fee2e2', rank: 0 },
  high:   { label: 'High',   color: '#b45309', bg: '#fef3c7', rank: 1 },
  medium: { label: 'Medium', color: '#1d4ed8', bg: '#dbeafe', rank: 2 },
  normal: { label: 'Normal', color: '#6a6a6a', bg: '#f0f0f0', rank: 3 },
};

export const STATE_CFG: Record<ItemState, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#b91c1c', bg: '#fee2e2' },
  in_progress: { label: 'In progress', color: '#1d4ed8', bg: '#dbeafe' },
  pending:     { label: 'Pending',     color: '#6a6a6a', bg: '#f0f0f0' },
  overdue:     { label: 'Overdue',     color: '#b91c1c', bg: '#fee2e2' },
  resolved:    { label: 'Resolved',    color: '#15803d', bg: '#dcfce7' },
  completed:   { label: 'Done',        color: '#15803d', bg: '#dcfce7' },
};

/* ── Selectors ─────────────────────────────────────────────── */

export function sortByPriority(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_CFG[a.priority].rank;
    const pb = PRIORITY_CFG[b.priority].rank;
    if (pa !== pb) return pa - pb;
    return (b.ageHours ?? 0) - (a.ageHours ?? 0);
  });
}

export function getItem(id: string): QueueItem | undefined {
  return QUEUE.find((q) => q.id === id);
}

export function needsAttention(): QueueItem[] {
  // Top 5 urgent/high items that are not resolved
  return sortByPriority(
    QUEUE.filter((q) => q.state !== 'resolved' && q.state !== 'completed' &&
                       (q.priority === 'urgent' || q.priority === 'high'))
  ).slice(0, 5);
}
