import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

export type ShiftType = 'day' | 'evening' | 'overnight';
export type DayCode = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';

export interface ShiftEntry {
  date: string;      // 'Mon · Apr 27'
  isoDay: DayCode;
  start?: string;    // '7:00 AM'
  end?: string;      // '3:30 PM'
  isToday?: boolean;
  offDay?: boolean;
  pto?: boolean;
}

export interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
}

export type LangCode = 'en' | 'es';

export interface Preferences {
  preferredShift: ShiftType;
  maxWeeklyHours: number;
  openToOvertime: boolean;
  willingToSwap: boolean;
  preferredDaysOff: DayCode[];
  language: LangCode;
}

export interface HoursState {
  periodStart: string;              // 'Apr 21'
  periodEnd: string;                // 'May 4'
  periodScheduledHours: number;     // 80
  periodClockedHours: number;       // 42.5
  periodOvertimeHours: number;      // 2.5
  todayClockedIn?: string;          // '7:12 AM'
  todayHours: number;               // 4.2
  weekSoFarHours: number;           // 18.5
}

const INITIAL_PREFS: Preferences = {
  preferredShift: 'evening',
  maxWeeklyHours: 40,
  openToOvertime: true,
  willingToSwap: true,
  preferredDaysOff: ['M', 'T'],
  language: 'en',
};

const INITIAL_HOURS: HoursState = {
  periodStart: 'Apr 21',
  periodEnd: 'May 4',
  periodScheduledHours: 60,
  periodClockedHours: 28.5,
  periodOvertimeHours: 1.5,
  todayClockedIn: '4:03 PM',
  todayHours: 2.1,
  weekSoFarHours: 12.3,
};

const INITIAL_SHIFTS: ShiftEntry[] = [
  { date: 'Today · Mon Apr 27',    isoDay: 'M',  start: '4:00 PM', end: '10:00 PM', isToday: true },
  { date: 'Tomorrow · Tue Apr 28', isoDay: 'T',  offDay: true },
  { date: 'Wed · Apr 29',          isoDay: 'W',  start: '4:00 PM', end: '10:00 PM' },
  { date: 'Thu · Apr 30',          isoDay: 'Th', start: '4:00 PM', end: '10:00 PM' },
  { date: 'Fri · May 1',           isoDay: 'F',  start: '4:00 PM', end: '10:00 PM' },
  { date: 'Sat · May 2',           isoDay: 'Sa', start: '4:00 PM', end: '10:00 PM' },
  { date: 'Sun · May 3',           isoDay: 'Su', offDay: true },
];

const INITIAL_TIMEOFF: TimeOffRequest[] = [
  {
    id: 'to-001',
    startDate: 'May 15',
    endDate: 'May 17',
    reason: 'Family event',
    status: 'approved',
    submittedAt: 'Apr 20',
  },
];

interface PreferencesContextValue {
  prefs: Preferences;
  hours: HoursState;
  shifts: ShiftEntry[];
  timeOff: TimeOffRequest[];
  setPreferredShift: (shift: ShiftType) => void;
  setMaxWeeklyHours: (hours: number) => void;
  setOpenToOvertime: (v: boolean) => void;
  setWillingToSwap: (v: boolean) => void;
  toggleDayOff: (day: DayCode) => void;
  submitTimeOff: (req: Omit<TimeOffRequest, 'id' | 'status' | 'submittedAt'>) => void;
  setLanguage: (lang: LangCode) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(INITIAL_PREFS);
  const [hours] = useState<HoursState>(INITIAL_HOURS);
  const [shifts] = useState<ShiftEntry[]>(INITIAL_SHIFTS);
  const [timeOff, setTimeOff] = useState<TimeOffRequest[]>(INITIAL_TIMEOFF);

  const setPreferredShift = useCallback((shift: ShiftType) => {
    setPrefs((p) => ({ ...p, preferredShift: shift }));
  }, []);
  const setMaxWeeklyHours = useCallback((hoursVal: number) => {
    setPrefs((p) => ({ ...p, maxWeeklyHours: hoursVal }));
  }, []);
  const setOpenToOvertime = useCallback((v: boolean) => {
    setPrefs((p) => ({ ...p, openToOvertime: v }));
  }, []);
  const setWillingToSwap = useCallback((v: boolean) => {
    setPrefs((p) => ({ ...p, willingToSwap: v }));
  }, []);
  const toggleDayOff = useCallback((day: DayCode) => {
    setPrefs((p) => ({
      ...p,
      preferredDaysOff: p.preferredDaysOff.includes(day)
        ? p.preferredDaysOff.filter((d) => d !== day)
        : [...p.preferredDaysOff, day],
    }));
  }, []);
  const setLanguage = useCallback((lang: LangCode) => {
    setPrefs((p) => ({ ...p, language: lang }));
  }, []);
  const submitTimeOff = useCallback((req: Omit<TimeOffRequest, 'id' | 'status' | 'submittedAt'>) => {
    setTimeOff((prev) => [
      { ...req, id: `to-${Date.now()}`, status: 'pending', submittedAt: 'just now' },
      ...prev,
    ]);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      prefs, hours, shifts, timeOff,
      setPreferredShift, setMaxWeeklyHours, setOpenToOvertime, setWillingToSwap, toggleDayOff, submitTimeOff, setLanguage,
    }),
    [prefs, hours, shifts, timeOff, setPreferredShift, setMaxWeeklyHours, setOpenToOvertime, setWillingToSwap, toggleDayOff, submitTimeOff, setLanguage]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
