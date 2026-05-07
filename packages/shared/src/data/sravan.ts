// Mock data for Sravan Puli — Front Desk, Home2 Baton Rouge (BTRCI)
// Phase 1 demo data; replace with real backend later.

export interface ShiftBlock {
  date: string;          // 2026-04-28
  label: string;         // "Mon, Apr 28"
  start: string;         // "15:00"
  end: string;           // "23:00"
  role: string;          // "Front Desk"
  hotelCode: string;
  note?: string;
}

export interface ClockSession {
  id: string;
  clockIn: string;       // ISO timestamp
  clockOut?: string;     // ISO
  breakMinutes: number;
  notes?: string;
}

export type AvailabilityLevel = 'unavailable' | 'available' | 'preferred';

export interface AvailabilityDay {
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  level: AvailabilityLevel;
  start?: string;        // "07:00"
  end?: string;          // "23:00"
}

export interface PayStub {
  id: string;
  period: string;        // "Apr 7 – Apr 20"
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  netPay: number;
  tips: number;
  bonus: number;
  payDate: string;       // ISO
  status: 'paid' | 'pending';
}

export interface BonusProgram {
  id: string;
  title: string;
  description: string;
  rewardLabel: string;
  progress: number;      // 0–1
  earnedThisPeriod: number;
  status: 'active' | 'maxed' | 'locked';
}

export interface OpenShift {
  id: string;
  date: string;
  label: string;
  start: string;
  end: string;
  role: string;
  hotelCode: string;
  postedBy: string;
  reason: string;
  payBoost?: string;     // e.g. "+$2/hr incentive"
}

export interface SwapRequest {
  id: string;
  myShiftDate: string;
  myShiftLabel: string;
  myShiftTime: string;
  targetColleague: string;
  targetShiftDate?: string;
  targetShiftTime?: string;
  kind: 'swap' | 'cover';
  status: 'pending' | 'accepted' | 'declined' | 'approved';
  submittedAt: string;
}

export interface ColleagueShift {
  shiftId: string;
  date: string;        // 2026-04-28
  label: string;       // "Mon, Apr 28"
  start: string;       // "07:00"
  end: string;
  role: string;
}

export interface Colleague {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  shiftsThisWeek: ColleagueShift[];
}

export interface SopItem {
  id: string;
  title: string;
  category: 'Check-in' | 'Check-out' | 'Safety' | 'Cash' | 'Guest Service' | 'Systems';
  updatedAt: string;     // ISO
  minutesToRead: number;
  required: boolean;
}

// ─── Static data ───────────────────────────────────────────────────────────

export const SRAVAN_EMPLOYEE = {
  employeeId: 'FD-2042',
  name: 'Sravan Puli',
  role: 'Front Desk Agent',
  hotel: 'Home2 Baton Rouge',
  hotelCode: 'BTRCI',
  hireDate: '2024-07-15',
  payRate: 18.5,         // USD / hr
  payPeriod: 'Apr 21 – May 4',
  nextPayDate: '2026-05-08',
  ptoBalanceHours: 42,
  supervisor: 'Lashwanda (AGM)',
  email: 'sravan.p@hosmanagement.co',
  phone: '(912) 555-0142',
};

export const SRAVAN_SCHEDULE: ShiftBlock[] = [
  { date: '2026-04-27', label: 'Mon, Apr 27', start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI' },
  { date: '2026-04-28', label: 'Tue, Apr 28', start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI' },
  { date: '2026-04-29', label: 'Wed, Apr 29', start: '07:00', end: '15:00', role: 'Front Desk · AM', hotelCode: 'BTRCI', note: 'Covering AM for Jamie' },
  { date: '2026-04-30', label: 'Thu, Apr 30', start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI' },
  { date: '2026-05-01', label: 'Fri, May 1',  start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI' },
  { date: '2026-05-03', label: 'Sun, May 3',  start: '23:00', end: '07:00', role: 'Front Desk · NA', hotelCode: 'BTRCI', note: 'Overnight audit shift' },
];

export const SRAVAN_CLOCK_LOG: ClockSession[] = [
  { id: 'cs-001', clockIn: '2026-04-21T14:58:00-04:00', clockOut: '2026-04-21T23:06:00-04:00', breakMinutes: 30 },
  { id: 'cs-002', clockIn: '2026-04-22T14:55:00-04:00', clockOut: '2026-04-22T23:02:00-04:00', breakMinutes: 30 },
  { id: 'cs-003', clockIn: '2026-04-23T14:59:00-04:00', clockOut: '2026-04-23T23:15:00-04:00', breakMinutes: 30, notes: 'Stayed 15 min late — busy arrival' },
  { id: 'cs-004', clockIn: '2026-04-25T14:57:00-04:00', clockOut: '2026-04-25T23:01:00-04:00', breakMinutes: 30 },
  { id: 'cs-005', clockIn: '2026-04-26T14:54:00-04:00', clockOut: '2026-04-26T23:07:00-04:00', breakMinutes: 30 },
];

export const SRAVAN_AVAILABILITY: AvailabilityDay[] = [
  { dayOfWeek: 'Mon', level: 'available', start: '07:00', end: '23:00' },
  { dayOfWeek: 'Tue', level: 'preferred', start: '15:00', end: '23:00' },
  { dayOfWeek: 'Wed', level: 'available', start: '15:00', end: '23:00' },
  { dayOfWeek: 'Thu', level: 'preferred', start: '15:00', end: '23:00' },
  { dayOfWeek: 'Fri', level: 'available', start: '15:00', end: '23:00' },
  { dayOfWeek: 'Sat', level: 'unavailable' },
  { dayOfWeek: 'Sun', level: 'available', start: '15:00', end: '23:00' },
];

export const SRAVAN_PAYSTUBS: PayStub[] = [
  { id: 'ps-current',  period: 'Apr 21 – May 4',  regularHours: 32,   overtimeHours: 0,   grossPay: 592.00,   netPay: 471.28, tips: 22, bonus: 40, payDate: '2026-05-08', status: 'pending' },
  { id: 'ps-2026-04b', period: 'Apr 7 – Apr 20',  regularHours: 78,   overtimeHours: 2.5, grossPay: 1503.88,  netPay: 1186.42, tips: 58, bonus: 75, payDate: '2026-04-24', status: 'paid' },
  { id: 'ps-2026-04a', period: 'Mar 24 – Apr 6',  regularHours: 80,   overtimeHours: 0,   grossPay: 1480.00,  netPay: 1169.14, tips: 41, bonus: 50, payDate: '2026-04-10', status: 'paid' },
  { id: 'ps-2026-03b', period: 'Mar 10 – Mar 23', regularHours: 76.5, overtimeHours: 4.5, grossPay: 1539.00,  netPay: 1218.88, tips: 38, bonus: 100, payDate: '2026-03-27', status: 'paid' },
  { id: 'ps-2026-03a', period: 'Feb 24 – Mar 9',  regularHours: 80,   overtimeHours: 0,   grossPay: 1480.00,  netPay: 1166.92, tips: 44, bonus: 25,  payDate: '2026-03-13', status: 'paid' },
];

export const SRAVAN_BONUSES: BonusProgram[] = [
  {
    id: 'upsell',
    title: 'Upsell Commission',
    description: 'Earn $5 for every successful room upgrade at check-in.',
    rewardLabel: '$5 / upgrade',
    progress: 0.6,
    earnedThisPeriod: 40,
    status: 'active',
  },
  {
    id: 'perfect-week',
    title: 'Perfect Attendance Week',
    description: 'Clock in on time for every scheduled shift Mon–Sun.',
    rewardLabel: '$50',
    progress: 0.71,
    earnedThisPeriod: 0,
    status: 'active',
  },
  {
    id: 'guest-nps',
    title: 'Guest NPS Mention',
    description: 'Get named in a positive guest review or NPS comment.',
    rewardLabel: '$25 / mention',
    progress: 1,
    earnedThisPeriod: 25,
    status: 'active',
  },
  {
    id: 'referral',
    title: 'Employee Referral',
    description: 'Refer a new hire that completes 90 days.',
    rewardLabel: '$250 / hire',
    progress: 0.33,
    earnedThisPeriod: 0,
    status: 'active',
  },
  {
    id: 'training',
    title: 'Quarterly Training Complete',
    description: 'Finish all required Hilton + HOS trainings before quarter end.',
    rewardLabel: '$75',
    progress: 1,
    earnedThisPeriod: 75,
    status: 'maxed',
  },
];

export const SRAVAN_COLLEAGUES: Colleague[] = [
  {
    id: 'marcus',
    name: 'Marcus Lee',
    initials: 'ML',
    role: 'Front Desk · Night Audit',
    avatarColor: '#1e40af',
    shiftsThisWeek: [
      { shiftId: 'ml-1', date: '2026-04-28', label: 'Tue, Apr 28', start: '23:00', end: '07:00', role: 'Night Audit' },
      { shiftId: 'ml-2', date: '2026-04-30', label: 'Thu, Apr 30', start: '07:00', end: '15:00', role: 'Front Desk · AM' },
      { shiftId: 'ml-3', date: '2026-05-03', label: 'Sun, May 3',  start: '23:00', end: '07:00', role: 'Night Audit' },
    ],
  },
  {
    id: 'jamie',
    name: 'Jamie Rodriguez',
    initials: 'JR',
    role: 'Front Desk · AM',
    avatarColor: '#c2410c',
    shiftsThisWeek: [
      { shiftId: 'jr-1', date: '2026-04-27', label: 'Mon, Apr 27', start: '07:00', end: '15:00', role: 'Front Desk · AM' },
      { shiftId: 'jr-2', date: '2026-04-30', label: 'Thu, Apr 30', start: '07:00', end: '15:00', role: 'Front Desk · AM' },
      { shiftId: 'jr-3', date: '2026-05-02', label: 'Sat, May 2',  start: '07:00', end: '15:00', role: 'Front Desk · AM' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Shah',
    initials: 'PS',
    role: 'Front Desk · PM',
    avatarColor: '#6d28d9',
    shiftsThisWeek: [
      { shiftId: 'ps-1', date: '2026-04-29', label: 'Wed, Apr 29', start: '15:00', end: '23:00', role: 'Front Desk · PM' },
      { shiftId: 'ps-2', date: '2026-05-01', label: 'Fri, May 1',  start: '07:00', end: '15:00', role: 'Front Desk · AM' },
      { shiftId: 'ps-3', date: '2026-05-02', label: 'Sat, May 2',  start: '15:00', end: '23:00', role: 'Front Desk · PM' },
    ],
  },
  {
    id: 'devon',
    name: 'Devon Carter',
    initials: 'DC',
    role: 'Front Desk · PM',
    avatarColor: '#047857',
    shiftsThisWeek: [
      { shiftId: 'dc-1', date: '2026-04-28', label: 'Tue, Apr 28', start: '07:00', end: '15:00', role: 'Front Desk · AM' },
      { shiftId: 'dc-2', date: '2026-05-01', label: 'Fri, May 1',  start: '15:00', end: '23:00', role: 'Front Desk · PM' },
    ],
  },
];

export const SRAVAN_OPEN_SHIFTS: OpenShift[] = [
  { id: 'os-001', date: '2026-05-02', label: 'Sat, May 2',  start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI', postedBy: 'Lashwanda (AGM)', reason: 'Callout — Jamie sick', payBoost: '+$2/hr incentive' },
  { id: 'os-002', date: '2026-05-04', label: 'Mon, May 4',  start: '07:00', end: '15:00', role: 'Front Desk · AM', hotelCode: 'BTRCI', postedBy: 'Lashwanda (AGM)', reason: 'Open shift' },
  { id: 'os-003', date: '2026-05-06', label: 'Wed, May 6',  start: '23:00', end: '07:00', role: 'Night Audit',     hotelCode: 'BTRCI', postedBy: 'Lashwanda (AGM)', reason: 'Coverage needed', payBoost: '+$3/hr night differential' },
  { id: 'os-004', date: '2026-05-09', label: 'Sat, May 9',  start: '15:00', end: '23:00', role: 'Front Desk · PM', hotelCode: 'BTRCI', postedBy: 'Lashwanda (AGM)', reason: 'PTO — Marcus' },
];

export const SRAVAN_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: 'sw-001',
    myShiftDate: '2026-05-01',
    myShiftLabel: 'Fri, May 1',
    myShiftTime: '3:00 PM – 11:00 PM',
    targetColleague: 'Marcus Lee',
    targetShiftDate: '2026-05-03',
    targetShiftTime: '11:00 PM – 7:00 AM',
    kind: 'swap',
    status: 'pending',
    submittedAt: '2026-04-28T11:42:00-04:00',
  },
  {
    id: 'sw-002',
    myShiftDate: '2026-04-30',
    myShiftLabel: 'Thu, Apr 30',
    myShiftTime: '3:00 PM – 11:00 PM',
    targetColleague: 'Any teammate',
    kind: 'cover',
    status: 'accepted',
    submittedAt: '2026-04-24T18:10:00-04:00',
  },
];

export const SRAVAN_SOPS: SopItem[] = [
  { id: 'sop-001', title: 'Guest Check-In Procedure',                category: 'Check-in',       updatedAt: '2026-03-12', minutesToRead: 5,  required: true },
  { id: 'sop-002', title: 'Guest Check-Out & Folio Review',          category: 'Check-out',      updatedAt: '2026-02-28', minutesToRead: 4,  required: true },
  { id: 'sop-003', title: 'Cash Drawer Opening / Closing',           category: 'Cash',           updatedAt: '2026-01-18', minutesToRead: 6,  required: true },
  { id: 'sop-004', title: 'Credit Card Chargeback Handling',         category: 'Cash',           updatedAt: '2026-04-02', minutesToRead: 8,  required: false },
  { id: 'sop-005', title: 'Room Upgrade Offer Script',               category: 'Guest Service',  updatedAt: '2026-03-30', minutesToRead: 3,  required: true },
  { id: 'sop-006', title: 'Handling Guest Complaints (LEAP)',        category: 'Guest Service',  updatedAt: '2026-04-20', minutesToRead: 7,  required: true },
  { id: 'sop-007', title: 'Fire Alarm / Evacuation',                 category: 'Safety',         updatedAt: '2026-03-05', minutesToRead: 10, required: true },
  { id: 'sop-008', title: 'Medical Emergency Response',              category: 'Safety',         updatedAt: '2026-01-22', minutesToRead: 6,  required: true },
  { id: 'sop-009', title: 'PMS — OnQ Basics (night audit)',          category: 'Systems',        updatedAt: '2026-02-11', minutesToRead: 12, required: false },
  { id: 'sop-010', title: 'Lost & Found Logging',                    category: 'Guest Service',  updatedAt: '2026-03-19', minutesToRead: 3,  required: false },
];

// ─── Derived utilities ─────────────────────────────────────────────────────

export function sravanPeriodHours(log: ClockSession[]): { regular: number; overtime: number } {
  const totalMinutes = log.reduce((sum, s) => {
    if (!s.clockOut) return sum;
    const ms = new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime();
    return sum + Math.max(0, ms / 60000 - s.breakMinutes);
  }, 0);
  const total = totalMinutes / 60;
  const regular = Math.min(40, total);
  const overtime = Math.max(0, total - 40);
  return { regular: Number(regular.toFixed(2)), overtime: Number(overtime.toFixed(2)) };
}
