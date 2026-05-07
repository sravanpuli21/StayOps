import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

export interface ChecklistItem {
  label: string;
  checked: boolean;
  noteText?: string;
  photoLabel?: string;
}

export type AuditState = 'pending' | 'in_progress' | 'paused' | 'completed';

export interface Audit {
  id: string;              // `${room}-${area}`
  room: string;
  floor: number;
  area: string;
  overdueDays: number;
  items: ChecklistItem[];
  state: AuditState;
  score?: number;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  // For "paused" sanity: where the user stopped
  lastTouchedItemIndex?: number;
}

function nowClockString(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${mm} ${ampm}`;
}

const INITIAL_AUDITS: Record<string, Audit> = {
  '215-HVAC / Climate': {
    id: '215-HVAC / Climate',
    room: '215', floor: 2, area: 'HVAC / Climate', overdueDays: 12,
    items: [
      { label: 'Filter condition',          checked: false },
      { label: 'Thermostat calibration',    checked: false },
      { label: 'Coil cleanliness',          checked: false },
      { label: 'Refrigerant level',         checked: false },
      { label: 'Airflow test',              checked: false },
    ],
    state: 'pending',
  },
  '109-Plumbing': {
    id: '109-Plumbing',
    room: '109', floor: 1, area: 'Plumbing', overdueDays: 6,
    items: [
      { label: 'Shower pressure',                checked: false },
      { label: 'Hot water temp (target 118°F)',  checked: false },
      { label: 'Toilet mechanism',               checked: false },
      { label: 'Under-sink pipes',               checked: false },
      { label: 'Shut-off valve',                 checked: false },
    ],
    state: 'pending',
  },
  '312-Safety Equipment': {
    id: '312-Safety Equipment',
    room: '312', floor: 3, area: 'Safety Equipment', overdueDays: 3,
    items: [
      { label: 'Smoke detector test',           checked: false },
      { label: 'CO detector battery',           checked: false },
      { label: 'Sprinkler clearance',           checked: false },
      { label: 'Fire escape card updated',      checked: false },
      { label: 'Door deadbolt',                 checked: false },
    ],
    state: 'pending',
  },
  '508-Bathroom': {
    id: '508-Bathroom',
    room: '508', floor: 5, area: 'Bathroom', overdueDays: 1,
    items: [
      { label: 'Grout condition',      checked: false },
      { label: 'Caulk seal',           checked: false },
      { label: 'Exhaust fan CFM',      checked: false },
      { label: 'Fixtures clean',       checked: false },
      { label: 'Water temperature',    checked: false },
    ],
    state: 'pending',
  },
  '404-Electrical & Lighting': {
    id: '404-Electrical & Lighting',
    room: '404', floor: 4, area: 'Electrical & Lighting', overdueDays: 0,
    items: [
      { label: 'All outlets functional',   checked: false },
      { label: 'Lamp bulbs',               checked: false },
      { label: 'Switch plates',            checked: false },
      { label: 'Smoke detector battery',   checked: false },
      { label: 'Nightstand USB ports',     checked: false },
    ],
    state: 'pending',
  },
};

interface AuditContextValue {
  audits: Record<string, Audit>;
  allAudits: Audit[];
  getAudit: (id: string) => Audit | undefined;
  toggleItem: (auditId: string, index: number) => void;
  setItemNote: (auditId: string, index: number, noteText: string) => void;
  setItemPhoto: (auditId: string, index: number, photoLabel: string) => void;
  startAudit: (auditId: string) => void;
  pauseAudit: (auditId: string) => void;
  resumeAudit: (auditId: string) => void;
  completeAudit: (auditId: string, score: number) => void;
  resetAudit: (auditId: string) => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [audits, setAudits] = useState<Record<string, Audit>>(INITIAL_AUDITS);

  const update = (id: string, updater: (a: Audit) => Audit) =>
    setAudits((prev) => (prev[id] ? { ...prev, [id]: updater(prev[id]) } : prev));

  const toggleItem = useCallback((auditId: string, index: number) => {
    update(auditId, (a) => ({
      ...a,
      state: a.state === 'pending' || a.state === 'paused' ? 'in_progress' : a.state,
      startedAt: a.startedAt ?? nowClockString(),
      lastTouchedItemIndex: index,
      items: a.items.map((it, i) => (i === index ? { ...it, checked: !it.checked } : it)),
    }));
  }, []);

  const setItemNote = useCallback((auditId: string, index: number, noteText: string) => {
    update(auditId, (a) => ({
      ...a,
      items: a.items.map((it, i) => (i === index ? { ...it, noteText } : it)),
    }));
  }, []);

  const setItemPhoto = useCallback((auditId: string, index: number, photoLabel: string) => {
    update(auditId, (a) => ({
      ...a,
      items: a.items.map((it, i) => (i === index ? { ...it, photoLabel } : it)),
    }));
  }, []);

  const startAudit = useCallback((auditId: string) => {
    update(auditId, (a) => ({
      ...a,
      state: 'in_progress',
      startedAt: a.startedAt ?? nowClockString(),
    }));
  }, []);

  const pauseAudit = useCallback((auditId: string) => {
    update(auditId, (a) => ({
      ...a,
      state: 'paused',
      pausedAt: nowClockString(),
    }));
  }, []);

  const resumeAudit = useCallback((auditId: string) => {
    update(auditId, (a) => ({
      ...a,
      state: 'in_progress',
    }));
  }, []);

  const completeAudit = useCallback((auditId: string, score: number) => {
    update(auditId, (a) => ({
      ...a,
      state: 'completed',
      score,
      completedAt: nowClockString(),
    }));
  }, []);

  const resetAudit = useCallback((auditId: string) => {
    update(auditId, (a) => ({
      ...a,
      state: 'pending',
      items: a.items.map((it) => ({ ...it, checked: false, noteText: undefined, photoLabel: undefined })),
      startedAt: undefined,
      pausedAt: undefined,
      completedAt: undefined,
      score: undefined,
      lastTouchedItemIndex: undefined,
    }));
  }, []);

  const value = useMemo<AuditContextValue>(
    () => ({
      audits,
      allAudits: Object.values(audits),
      getAudit: (id: string) => audits[id],
      toggleItem,
      setItemNote,
      setItemPhoto,
      startAudit,
      pauseAudit,
      resumeAudit,
      completeAudit,
      resetAudit,
    }),
    [audits, toggleItem, setItemNote, setItemPhoto, startAudit, pauseAudit, resumeAudit, completeAudit, resetAudit]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudits(): AuditContextValue {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudits must be used inside AuditProvider');
  return ctx;
}
