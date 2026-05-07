import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

export type NotifLevel = 'always' | 'quiet' | 'off';
export type AuditCadence = 'daily' | 'every-other-day' | 'weekly' | 'custom';
export type AssignmentMode = 'auto' | 'manual';
export type DayCode = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';

export interface ShiftEntry {
  date: string;
  isoDay: DayCode;
  start?: string;
  end?: string;
  isToday?: boolean;
  offDay?: boolean;
  onCall?: boolean;
}

export interface Broadcast {
  id: string;
  message: string;
  audience: 'all' | 'maintenance' | 'housekeeping' | 'front_desk';
  sentAt: string;
}

export interface SupervisorPrefs {
  urgentTickets:    NotifLevel;
  escalations:      NotifLevel;
  auditOverdue:     NotifLevel;
  staffIssues:      NotifLevel;
  autoAssignMaintenance: AssignmentMode;
  auditCadence:     AuditCadence;
  onCallThisWeek:   boolean;
  afterHoursContactable: boolean;
}

export interface SupervisorHours {
  periodStart: string;
  periodEnd: string;
  periodScheduledHours: number;
  periodClockedHours: number;
  periodOvertimeHours: number;
  todayClockedIn?: string;
  todayHours: number;
  weekSoFarHours: number;
}

const INITIAL_PREFS: SupervisorPrefs = {
  urgentTickets:         'always',
  escalations:           'always',
  auditOverdue:          'quiet',
  staffIssues:           'always',
  autoAssignMaintenance: 'auto',
  auditCadence:          'daily',
  onCallThisWeek:        true,
  afterHoursContactable: true,
};

const INITIAL_HOURS: SupervisorHours = {
  periodStart: 'Apr 21',
  periodEnd: 'May 4',
  periodScheduledHours: 80,
  periodClockedHours: 48.5,
  periodOvertimeHours: 1.0,
  todayClockedIn: '6:48 AM',
  todayHours: 5.3,
  weekSoFarHours: 21.0,
};

const INITIAL_SHIFTS: ShiftEntry[] = [
  { date: 'Today · Mon Apr 27',    isoDay: 'M',  start: '7:00 AM', end: '3:00 PM', isToday: true },
  { date: 'Tomorrow · Tue Apr 28', isoDay: 'T',  start: '7:00 AM', end: '3:00 PM' },
  { date: 'Wed · Apr 29',          isoDay: 'W',  start: '7:00 AM', end: '3:00 PM', onCall: true },
  { date: 'Thu · Apr 30',          isoDay: 'Th', start: '7:00 AM', end: '3:00 PM' },
  { date: 'Fri · May 1',           isoDay: 'F',  start: '7:00 AM', end: '3:00 PM' },
  { date: 'Sat · May 2',           isoDay: 'Sa', offDay: true },
  { date: 'Sun · May 3',           isoDay: 'Su', offDay: true },
];

const INITIAL_BROADCASTS: Broadcast[] = [];

interface SupervisorContextValue {
  prefs: SupervisorPrefs;
  hours: SupervisorHours;
  shifts: ShiftEntry[];
  broadcasts: Broadcast[];
  setNotifLevel: (key: 'urgentTickets' | 'escalations' | 'auditOverdue' | 'staffIssues', level: NotifLevel) => void;
  setAutoAssign: (mode: AssignmentMode) => void;
  setAuditCadence: (cadence: AuditCadence) => void;
  setOnCallThisWeek: (v: boolean) => void;
  setAfterHoursContactable: (v: boolean) => void;
  sendBroadcast: (msg: Omit<Broadcast, 'id' | 'sentAt'>) => void;
}

const SupervisorContext = createContext<SupervisorContextValue | null>(null);

export function SupervisorProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs]   = useState<SupervisorPrefs>(INITIAL_PREFS);
  const [hours]             = useState<SupervisorHours>(INITIAL_HOURS);
  const [shifts]            = useState<ShiftEntry[]>(INITIAL_SHIFTS);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(INITIAL_BROADCASTS);

  const setNotifLevel = useCallback((key: 'urgentTickets' | 'escalations' | 'auditOverdue' | 'staffIssues', level: NotifLevel) => {
    setPrefs((p) => ({ ...p, [key]: level }));
  }, []);
  const setAutoAssign = useCallback((mode: AssignmentMode) => {
    setPrefs((p) => ({ ...p, autoAssignMaintenance: mode }));
  }, []);
  const setAuditCadence = useCallback((cadence: AuditCadence) => {
    setPrefs((p) => ({ ...p, auditCadence: cadence }));
  }, []);
  const setOnCallThisWeek = useCallback((v: boolean) => {
    setPrefs((p) => ({ ...p, onCallThisWeek: v }));
  }, []);
  const setAfterHoursContactable = useCallback((v: boolean) => {
    setPrefs((p) => ({ ...p, afterHoursContactable: v }));
  }, []);
  const sendBroadcast = useCallback((msg: Omit<Broadcast, 'id' | 'sentAt'>) => {
    setBroadcasts((prev) => [
      { ...msg, id: `b-${Date.now()}`, sentAt: 'just now' },
      ...prev,
    ]);
  }, []);

  const value = useMemo<SupervisorContextValue>(() => ({
    prefs, hours, shifts, broadcasts,
    setNotifLevel, setAutoAssign, setAuditCadence, setOnCallThisWeek, setAfterHoursContactable, sendBroadcast,
  }), [prefs, hours, shifts, broadcasts, setNotifLevel, setAutoAssign, setAuditCadence, setOnCallThisWeek, setAfterHoursContactable, sendBroadcast]);

  return <SupervisorContext.Provider value={value}>{children}</SupervisorContext.Provider>;
}

export function useSupervisor(): SupervisorContextValue {
  const ctx = useContext(SupervisorContext);
  if (!ctx) throw new Error('useSupervisor must be used inside SupervisorProvider');
  return ctx;
}
