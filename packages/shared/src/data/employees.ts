export type EmployeeTeam = 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Restaurant' | 'Management';

export type ShiftCode = 'AM' | 'PM' | 'NA' | 'DAY' | 'OFF';
// AM = 7a-3p, PM = 3p-11p, NA = night audit 11p-7a, DAY = 8a-4p full, OFF = unavailable

export type DayCode = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface EmployeeAvailability {
  // Which shifts they can work per day
  // e.g. { Mon: ['AM','PM'], Tue: ['OFF'], ... }
  // (submitted through the availability portal)
  Mon: ShiftCode[];
  Tue: ShiftCode[];
  Wed: ShiftCode[];
  Thu: ShiftCode[];
  Fri: ShiftCode[];
  Sat: ShiftCode[];
  Sun: ShiftCode[];
}

// Per-day shifts the employee explicitly PREFERS (subset of availability).
// The AI ranks preferred slots highest when auto-filling.
export type EmployeePreferences = Partial<Record<DayCode, ShiftCode[]>>;

export interface Employee {
  id: string;
  hotelId: string;
  name: string;
  initials: string;
  role: string;          // e.g. 'Front Desk Associate'
  team: EmployeeTeam;
  hourlyRate: number;
  maxHoursWeek: number;
  hoursThisWeek: number;
  status: 'active' | 'callout' | 'pto' | 'terminated';
  startDate: string;
  preferredShift?: ShiftCode;
  availability: EmployeeAvailability;
  preferences?: EmployeePreferences;
  performanceScore: number;   // 0-100
  callouts30d: number;
  phone: string;
}

// All-off availability helper
const none: ShiftCode[] = ['OFF'];

export const SAVGW_EMPLOYEES: Employee[] = [
  // ── Front Desk ──
  {
    id: 'emp-001',
    hotelId: 'BTRCI',
    name: 'Priya Nair',
    initials: 'PN',
    role: 'Front Desk Associate',
    team: 'Front Desk',
    hourlyRate: 18,
    maxHoursWeek: 40,
    hoursThisWeek: 32,
    status: 'active',
    startDate: '2024-03-12',
    preferredShift: 'AM',
    availability: {
      Mon: ['AM'], Tue: ['AM'], Wed: ['AM'], Thu: ['AM'], Fri: ['AM','PM'],
      Sat: none, Sun: none,
    },
    preferences: {
      Tue: ['AM'], Thu: ['AM'],
    },
    performanceScore: 92,
    callouts30d: 0,
    phone: '(912) 555-0167',
  },
  {
    id: 'emp-002',
    hotelId: 'BTRCI',
    name: 'Daniel Chen',
    initials: 'DC',
    role: 'Front Desk Associate',
    team: 'Front Desk',
    hourlyRate: 17,
    maxHoursWeek: 40,
    hoursThisWeek: 28,
    status: 'active',
    startDate: '2024-11-02',
    preferredShift: 'PM',
    availability: {
      Mon: ['PM'], Tue: ['PM'], Wed: ['PM'], Thu: ['PM'], Fri: ['PM'],
      Sat: ['AM','PM'], Sun: ['AM','PM'],
    },
    preferences: {
      Fri: ['PM'], Sat: ['PM'],
    },
    performanceScore: 85,
    callouts30d: 1,
    phone: '(912) 555-0188',
  },
  {
    id: 'emp-003',
    hotelId: 'BTRCI',
    name: 'Marcus Webb',
    initials: 'MW',
    role: 'Front Desk — Night Audit',
    team: 'Front Desk',
    hourlyRate: 19,
    maxHoursWeek: 40,
    hoursThisWeek: 40,
    status: 'active',
    startDate: '2023-08-18',
    preferredShift: 'NA',
    availability: {
      Mon: ['NA'], Tue: ['NA'], Wed: ['NA'], Thu: ['NA'], Fri: ['NA'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    preferences: {
      Wed: ['NA'], Thu: ['NA'], Fri: ['NA'],
    },
    performanceScore: 88,
    callouts30d: 0,
    phone: '(912) 555-0214',
  },
  {
    id: 'emp-004',
    hotelId: 'BTRCI',
    name: 'Sofia Ramirez',
    initials: 'SR',
    role: 'Front Desk Manager',
    team: 'Front Desk',
    hourlyRate: 26,
    maxHoursWeek: 45,
    hoursThisWeek: 38,
    status: 'active',
    startDate: '2022-05-01',
    preferredShift: 'AM',
    availability: {
      Mon: ['AM','PM'], Tue: ['AM','PM'], Wed: ['AM'], Thu: ['AM','PM'], Fri: ['AM','PM'],
      Sat: ['AM'], Sun: ['OFF'],
    },
    performanceScore: 94,
    callouts30d: 0,
    phone: '(912) 555-0122',
  },

  // ── Housekeeping ──
  {
    id: 'emp-010',
    hotelId: 'BTRCI',
    name: 'Rosa Navarro',
    initials: 'RN',
    role: 'Housekeeper',
    team: 'Housekeeping',
    hourlyRate: 16,
    maxHoursWeek: 40,
    hoursThisWeek: 36,
    status: 'active',
    startDate: '2023-02-14',
    preferredShift: 'DAY',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['DAY'], Thu: ['DAY'], Fri: ['DAY'],
      Sat: ['DAY'], Sun: ['OFF'],
    },
    performanceScore: 91,
    callouts30d: 0,
    phone: '(912) 555-0142',
  },
  {
    id: 'emp-011',
    hotelId: 'BTRCI',
    name: 'Carlos Reyes',
    initials: 'CR',
    role: 'Housekeeper',
    team: 'Housekeeping',
    hourlyRate: 15.5,
    maxHoursWeek: 40,
    hoursThisWeek: 30,
    status: 'active',
    startDate: '2024-06-03',
    preferredShift: 'DAY',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['OFF'], Thu: ['DAY'], Fri: ['DAY'],
      Sat: ['DAY'], Sun: ['DAY'],
    },
    performanceScore: 82,
    callouts30d: 2,
    phone: '(912) 555-0201',
  },
  {
    id: 'emp-012',
    hotelId: 'BTRCI',
    name: 'Lena Torres',
    initials: 'LT',
    role: 'Housekeeper',
    team: 'Housekeeping',
    hourlyRate: 16,
    maxHoursWeek: 32,
    hoursThisWeek: 24,
    status: 'active',
    startDate: '2024-09-10',
    preferredShift: 'DAY',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['DAY'], Thu: ['OFF'], Fri: ['DAY'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    performanceScore: 87,
    callouts30d: 1,
    phone: '(912) 555-0233',
  },
  {
    id: 'emp-013',
    hotelId: 'BTRCI',
    name: 'Anita Desai',
    initials: 'AD',
    role: 'Housekeeping Lead',
    team: 'Housekeeping',
    hourlyRate: 19,
    maxHoursWeek: 40,
    hoursThisWeek: 40,
    status: 'active',
    startDate: '2021-11-22',
    preferredShift: 'DAY',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['DAY'], Thu: ['DAY'], Fri: ['DAY'],
      Sat: ['DAY'], Sun: ['OFF'],
    },
    performanceScore: 95,
    callouts30d: 0,
    phone: '(912) 555-0155',
  },
  {
    id: 'emp-014',
    hotelId: 'BTRCI',
    name: 'Jada Williams',
    initials: 'JW',
    role: 'Housekeeper',
    team: 'Housekeeping',
    hourlyRate: 15.5,
    maxHoursWeek: 32,
    hoursThisWeek: 8,
    status: 'callout',
    startDate: '2025-01-08',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['DAY'], Thu: ['DAY'], Fri: ['DAY'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    performanceScore: 74,
    callouts30d: 4,
    phone: '(912) 555-0199',
  },

  // ── Maintenance ──
  {
    id: 'emp-020',
    hotelId: 'BTRCI',
    name: 'Amir Lopez',
    initials: 'AL',
    role: 'Maintenance Tech — Evening',
    team: 'Maintenance',
    hourlyRate: 22,
    maxHoursWeek: 40,
    hoursThisWeek: 28,
    status: 'active',
    startDate: '2023-06-15',
    preferredShift: 'PM',
    availability: {
      Mon: ['PM'], Tue: ['PM'], Wed: ['PM'], Thu: ['PM'], Fri: ['PM'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    performanceScore: 93,
    callouts30d: 0,
    phone: '(912) 555-0142',
  },
  {
    id: 'emp-021',
    hotelId: 'BTRCI',
    name: 'Sydney Rivera',
    initials: 'SR',
    role: 'Maintenance Supervisor',
    team: 'Maintenance',
    hourlyRate: 28,
    maxHoursWeek: 45,
    hoursThisWeek: 42,
    status: 'active',
    startDate: '2020-09-01',
    preferredShift: 'AM',
    availability: {
      Mon: ['AM'], Tue: ['AM'], Wed: ['AM'], Thu: ['AM'], Fri: ['AM'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    performanceScore: 96,
    callouts30d: 0,
    phone: '(912) 555-0110',
  },

  // ── Restaurant / Breakfast ──
  {
    id: 'emp-030',
    hotelId: 'BTRCI',
    name: 'Mei Lin',
    initials: 'ML',
    role: 'Breakfast Attendant',
    team: 'Restaurant',
    hourlyRate: 15,
    maxHoursWeek: 25,
    hoursThisWeek: 20,
    status: 'active',
    startDate: '2024-04-18',
    preferredShift: 'AM',
    availability: {
      Mon: ['AM'], Tue: ['AM'], Wed: ['AM'], Thu: ['AM'], Fri: ['AM'],
      Sat: ['AM'], Sun: ['AM'],
    },
    performanceScore: 89,
    callouts30d: 0,
    phone: '(912) 555-0177',
  },
  {
    id: 'emp-031',
    hotelId: 'BTRCI',
    name: 'Tyrone Jackson',
    initials: 'TJ',
    role: 'Breakfast Attendant',
    team: 'Restaurant',
    hourlyRate: 15,
    maxHoursWeek: 25,
    hoursThisWeek: 15,
    status: 'active',
    startDate: '2024-12-01',
    preferredShift: 'AM',
    availability: {
      Mon: ['OFF'], Tue: ['AM'], Wed: ['AM'], Thu: ['AM'], Fri: ['OFF'],
      Sat: ['AM'], Sun: ['AM'],
    },
    performanceScore: 80,
    callouts30d: 1,
    phone: '(912) 555-0183',
  },

  // ── Management ──
  {
    id: 'emp-100',
    hotelId: 'BTRCI',
    name: 'Lashwanda Jones',
    initials: 'LJ',
    role: 'Assistant General Manager',
    team: 'Management',
    hourlyRate: 32,
    maxHoursWeek: 50,
    hoursThisWeek: 46,
    status: 'active',
    startDate: '2021-02-01',
    preferredShift: 'DAY',
    availability: {
      Mon: ['DAY'], Tue: ['DAY'], Wed: ['DAY'], Thu: ['DAY'], Fri: ['DAY'],
      Sat: ['OFF'], Sun: ['OFF'],
    },
    performanceScore: 91,
    callouts30d: 0,
    phone: '(912) 555-0118',
  },
];

export function getEmployeesForHotel(hotelId: string): Employee[] {
  return SAVGW_EMPLOYEES.filter((e) => e.hotelId === hotelId);
}

export function getEmployeeById(id: string): Employee | undefined {
  return SAVGW_EMPLOYEES.find((e) => e.id === id);
}

// ── Shift meta ───────────────────────────────────────────────────────────────

export const SHIFT_META: Record<ShiftCode, { label: string; start: string; end: string; hours: number; color: string; bg: string }> = {
  AM:  { label: 'Morning (7a–3p)',     start: '07:00', end: '15:00', hours: 8,  color: '#b45309', bg: '#fffbeb' },
  PM:  { label: 'Afternoon (3p–11p)',  start: '15:00', end: '23:00', hours: 8,  color: '#1d4ed8', bg: '#eff6ff' },
  NA:  { label: 'Night Audit (11p–7a)',start: '23:00', end: '07:00', hours: 8,  color: '#7c3aed', bg: '#f5f3ff' },
  DAY: { label: 'Day (8a–4p)',         start: '08:00', end: '16:00', hours: 8,  color: '#15803d', bg: '#f0fdf4' },
  OFF: { label: 'Unavailable',         start: '—',     end: '—',     hours: 0,  color: '#929292', bg: '#f0f0f0' },
};
