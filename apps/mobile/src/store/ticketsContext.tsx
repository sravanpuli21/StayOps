import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

export interface TimelineEntry {
  time: string;
  actor: string;
  action: string;
  icon?: string;
  kind?: 'system' | 'status' | 'note' | 'photo';
  noteText?: string;
  photoLabel?: string;
}

export interface AiInsight {
  confidence: number;
  pattern: string;
  likelyCause: string;
  fixSteps: string[];
  partsNeeded: { name: string; inCart: boolean; vendor?: string }[];
}

export type TicketStatus =
  | 'open'
  | 'en_route'
  | 'in_progress'
  | 'pending_part'
  | 'scheduled'
  | 'resolved'
  | 'escalated';

export type Priority = 'urgent' | 'high' | 'normal';

export type TicketTaskType = 'reactive' | 'preventive' | 'audit' | 'scheduled';

export type GuestContext = 'occupied_urgent' | 'arrival' | 'vacant' | 'public' | 'none';

export interface Ticket {
  id: string;
  room: string;
  floor: number;
  area: string;
  type: TicketTaskType;
  priority: Priority;
  guestContext?: GuestContext;
  repeatInRoom?: boolean;
  status: TicketStatus;
  title: string;
  description: string;
  reportedBy: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost: number;
  revenueLost: number;
  activity: TimelineEntry[];
  ai?: AiInsight;
  aiFeedback?: 'up' | 'down' | null;
  watchers?: string[];
}

const INITIAL_TICKETS: Record<string, Ticket> = {
  T003: {
    id: 'T003', room: '315', floor: 3, area: 'HVAC / Climate',
    type: 'reactive', priority: 'urgent', status: 'open',
    guestContext: 'occupied_urgent', repeatInRoom: true,
    title: 'OOO – HVAC unit not cooling',
    description: 'Guest in room complaining. HVAC compressor running but no cold air. Thermostat reads 82°F despite being set to 68°F.',
    reportedBy: 'Emma Johnson (Supervisor)',
    assignee: 'Amir Lopez',
    createdAt: '2h ago', updatedAt: '45m ago',
    estimatedCost: 280, revenueLost: 174,
    activity: [
      { time: '12:18 PM', actor: 'Amir Lopez',    action: 'Viewed – heading to room now',     icon: 'eye-outline',       kind: 'system' },
      { time: '11:45 AM', actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez',           icon: 'person-outline',    kind: 'system' },
      { time: '11:32 AM', actor: 'Emma Johnson',  action: 'Ticket created',                   icon: 'add-circle-outline', kind: 'system' },
    ],
    ai: {
      confidence: 85,
      pattern: 'Room 315 has had 3 HVAC capacitor failures in past 12 months (summer peak). Last fix was Mar 22 — capacitor replacement.',
      likelyCause: 'PTAC capacitor failure',
      fixSteps: [
        'Power off PTAC at breaker',
        'Remove front grille, inspect capacitor for bulge/leak',
        'Test capacitor with multimeter — < 40µF = bad',
        'Replace with 45µF spare from your cart',
      ],
      partsNeeded: [
        { name: '45µF PTAC capacitor', inCart: true },
        { name: 'Thermal paste (optional)', inCart: true },
      ],
    },
    aiFeedback: null,
  },
  T001: {
    id: 'T001', room: '109', floor: 1, area: 'HVAC / Climate',
    type: 'reactive', priority: 'high', status: 'in_progress',
    guestContext: 'occupied_urgent',
    title: 'AC making loud vibration noise',
    description: 'Guests in rooms 108 and 110 both complaining about noise from 109. AC unit running but fan assembly vibrating excessively. May be a loose mount or worn fan blade.',
    reportedBy: 'Front Desk',
    assignee: 'Amir Lopez',
    createdAt: '18h ago', updatedAt: '6h ago',
    estimatedCost: 150, revenueLost: 0,
    activity: [
      { time: 'Today 8:15 AM',       actor: 'Amir Lopez',    action: 'In progress – fan blade loose, ordered part', icon: 'construct-outline',  kind: 'status' },
      { time: 'Yesterday 6:30 PM',   actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez',                      icon: 'person-outline',     kind: 'system' },
      { time: 'Yesterday 6:00 PM',   actor: 'Front Desk',    action: 'Ticket created',                              icon: 'add-circle-outline', kind: 'system' },
    ],
    ai: {
      confidence: 72,
      pattern: 'Noise complaints on 1st floor cluster around 109 & 111. Fan mount wear is common on units installed 2019.',
      likelyCause: 'Worn fan motor mount',
      fixSteps: [
        'Power off unit, remove front panel',
        'Check fan mount bolts for looseness',
        'Spin blade by hand — feel for bearing play',
        'Replace mount kit if bearing is loose',
      ],
      partsNeeded: [
        { name: 'PTAC fan mount kit', inCart: false, vendor: 'GE Zoneline Service' },
      ],
    },
    aiFeedback: null,
  },
  T012: {
    id: 'T012', room: '204', floor: 2, area: 'Bathroom',
    type: 'reactive', priority: 'normal', status: 'open',
    guestContext: 'vacant',
    title: 'Bathroom exhaust fan not working',
    description: 'Exhaust fan motor not responding when switch toggled. Breaker shows no trip. Possible motor failure or wiring fault at the switch.',
    reportedBy: 'Rosa Navarro (Housekeeping)',
    assignee: 'Amir Lopez',
    createdAt: '1d ago', updatedAt: '1d ago',
    estimatedCost: 90, revenueLost: 0,
    activity: [
      { time: 'Yesterday 9:30 AM', actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez',              icon: 'person-outline',     kind: 'system' },
      { time: 'Yesterday 9:00 AM', actor: 'Rosa Navarro',  action: 'Ticket created during inspection',   icon: 'add-circle-outline', kind: 'system' },
    ],
    ai: {
      confidence: 68,
      pattern: 'First exhaust-fan failure reported for room 204 in 18 months. Not a recurring pattern.',
      likelyCause: 'Switch fault (more common than motor)',
      fixSteps: [
        'Test switch with voltmeter first (likely culprit)',
        'If switch reads OK, power off at breaker',
        'Remove fan cover, check motor connections',
        'Replace motor only if switch tests good',
      ],
      partsNeeded: [
        { name: 'Bathroom fan switch', inCart: true },
        { name: 'Exhaust fan motor (if needed)', inCart: false, vendor: 'HD Supply' },
      ],
    },
    aiFeedback: null,
  },
  T007: {
    id: 'T007', room: '412', floor: 4, area: 'HVAC / Climate',
    type: 'preventive', priority: 'normal', status: 'scheduled',
    guestContext: 'vacant',
    title: 'Quarterly HVAC filter replacement',
    description: 'Scheduled quarterly maintenance. Replace PTAC filter, check refrigerant level, clean coils, verify thermostat calibration.',
    reportedBy: 'Maintenance Schedule',
    assignee: 'Amir Lopez',
    createdAt: '3d ago', updatedAt: '3d ago',
    estimatedCost: 45, revenueLost: 0,
    activity: [
      { time: 'Apr 24', actor: 'System', action: 'Preventive maintenance scheduled', icon: 'calendar-outline', kind: 'system' },
    ],
    aiFeedback: null,
  },
  T019: {
    id: 'T019', room: '508', floor: 5, area: 'Plumbing',
    type: 'reactive', priority: 'high', status: 'in_progress',
    guestContext: 'occupied_urgent', repeatInRoom: true,
    title: 'Shower drain slow / backing up',
    description: 'Shower drain almost completely blocked. Chemical drain treatment attempted yesterday with partial success. Will need mechanical snake to clear fully.',
    reportedBy: 'Guest Complaint',
    assignee: 'Amir Lopez',
    createdAt: '4d ago', updatedAt: '1d ago',
    estimatedCost: 120, revenueLost: 0,
    activity: [
      { time: 'Apr 24', actor: 'Amir Lopez',  action: 'Mechanical snake scheduled',                   icon: 'time-outline',       kind: 'system' },
      { time: 'Apr 23', actor: 'Amir Lopez',  action: 'Chemical treatment applied – partial improvement', icon: 'water-outline',  kind: 'status' },
      { time: 'Apr 23', actor: 'Front Desk',  action: 'Guest complaint logged',                       icon: 'add-circle-outline', kind: 'system' },
    ],
    ai: {
      confidence: 78,
      pattern: '5th floor shower drains back up 2-3x per year — hard-water mineral buildup is typical.',
      likelyCause: 'Mineral + hair buildup in P-trap',
      fixSteps: [
        'Remove drain cover',
        'Run hand-snake through P-trap (3-5ft)',
        'Flush with hot water + enzyme treatment',
        'Note for next PM: descale this line quarterly',
      ],
      partsNeeded: [
        { name: 'Drain snake (25ft)', inCart: true },
        { name: 'Enzyme drain treatment', inCart: true },
      ],
    },
    aiFeedback: null,
  },
  // ── Evening-complaint tickets (small-but-urgent) ──
  T024: {
    id: 'T024', room: '402', floor: 4, area: 'Electronics',
    type: 'reactive', priority: 'high', status: 'open',
    guestContext: 'occupied_urgent', repeatInRoom: true,
    title: 'TV remote not responding',
    description: 'Guest called front desk — TV remote dead, can\'t change channels. Third time this remote has been reported in 6 weeks.',
    reportedBy: 'Priya Nair (Front Desk)',
    assignee: 'Amir Lopez',
    createdAt: '10m ago', updatedAt: '10m ago',
    estimatedCost: 15, revenueLost: 0,
    activity: [
      { time: '4:21 PM', actor: 'Priya Nair', action: 'Guest complaint via FD', icon: 'add-circle-outline', kind: 'system' },
    ],
    ai: {
      confidence: 82,
      pattern: 'Remote in 402 has been replaced twice in 6 weeks. Guests commonly take remotes at checkout. Stock low on spare remotes.',
      likelyCause: 'Missing/dead remote — grab from vacant room 406',
      fixSteps: [
        'Swap remote from vacant room 406 for now',
        'Replace batteries in the 402 remote before stock',
        'Log item source (vacant room) when marking fixed',
        'Add to inventory re-order list',
      ],
      partsNeeded: [
        { name: 'TV remote (Samsung)', inCart: false, vendor: 'stock — low' },
        { name: 'AA batteries (pair)', inCart: true },
      ],
    },
    aiFeedback: null,
  },
  T025: {
    id: 'T025', room: '312', floor: 3, area: 'HVAC / Climate',
    type: 'reactive', priority: 'normal', status: 'open',
    guestContext: 'occupied_urgent',
    title: 'Thermostat reads wrong temp',
    description: 'Guest set to 70°F but room feels warmer. Display shows 68°F. Likely calibration or sensor drift.',
    reportedBy: 'Priya Nair (Front Desk)',
    assignee: 'Amir Lopez',
    createdAt: '18m ago', updatedAt: '18m ago',
    estimatedCost: 20, revenueLost: 0,
    activity: [
      { time: '4:13 PM', actor: 'Priya Nair', action: 'Guest complaint via FD', icon: 'add-circle-outline', kind: 'system' },
    ],
    aiFeedback: null,
  },
  T026: {
    id: 'T026', room: '218', floor: 2, area: 'Electrical & Lighting',
    type: 'reactive', priority: 'normal', status: 'open',
    guestContext: 'arrival',
    title: 'Bathroom light bulb out',
    description: 'Arriving guest reported at check-in. Bathroom vanity light completely out. Room otherwise ready.',
    reportedBy: 'Emma Johnson (HK)',
    assignee: 'Amir Lopez',
    createdAt: '4m ago', updatedAt: '4m ago',
    estimatedCost: 6, revenueLost: 0,
    activity: [
      { time: '4:27 PM', actor: 'Emma Johnson', action: 'Arrival inspection caught it', icon: 'add-circle-outline', kind: 'system' },
    ],
    aiFeedback: null,
  },
  T027: {
    id: 'T027', room: '107', floor: 1, area: 'Hardware',
    type: 'reactive', priority: 'normal', status: 'open',
    guestContext: 'arrival',
    title: 'Door latch sticking',
    description: 'Guest checking in reports the door latch is stiff — needs a hard pull to latch. Safety / security concern.',
    reportedBy: 'Priya Nair (Front Desk)',
    assignee: 'Amir Lopez',
    createdAt: '1m ago', updatedAt: '1m ago',
    estimatedCost: 25, revenueLost: 0,
    activity: [
      { time: '4:30 PM', actor: 'Priya Nair', action: 'Guest complaint via FD at check-in', icon: 'add-circle-outline', kind: 'system' },
    ],
    aiFeedback: null,
  },
  T022: {
    id: 'T022', room: '301', floor: 3, area: 'Audit',
    type: 'audit', priority: 'normal', status: 'resolved',
    title: 'Quarterly room audit – passed',
    description: 'Full room inspection completed. Score 91/100. Minor notes: 2 light bulbs dim, grout cleaning recommended.',
    reportedBy: 'Maintenance Schedule',
    assignee: 'Amir Lopez',
    createdAt: '5d ago', updatedAt: '5d ago',
    estimatedCost: 0, revenueLost: 0,
    activity: [
      { time: 'Apr 22', actor: 'Amir Lopez', action: 'Audit submitted · score 91/100', icon: 'checkmark-circle', kind: 'status' },
      { time: 'Apr 22', actor: 'System',     action: 'Quarterly audit scheduled',      icon: 'calendar-outline', kind: 'system' },
    ],
    aiFeedback: null,
  },
};

function nowClockString(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${mm} ${ampm}`;
}

const STATUS_MESSAGE: Record<TicketStatus, string> = {
  open:          'Ticket reopened',
  en_route:      'On the way to the room',
  in_progress:   'Arrived at room — working on it',
  pending_part:  'Waiting on part — inventory notified',
  scheduled:     'Scheduled for later',
  resolved:      'Marked as fixed',
  escalated:     'Escalated to supervisor',
};

const STATUS_ICON: Record<TicketStatus, string> = {
  open:          'open-outline',
  en_route:      'walk-outline',
  in_progress:   'enter-outline',
  pending_part:  'cube-outline',
  scheduled:     'calendar-outline',
  resolved:      'checkmark-circle',
  escalated:     'warning-outline',
};

interface TicketContextValue {
  tickets: Record<string, Ticket>;
  getTicket: (id: string) => Ticket | undefined;
  allTickets: Ticket[];
  updateStatus: (id: string, newStatus: TicketStatus, actor?: string) => void;
  addNote: (id: string, text: string, actor?: string) => void;
  addPhoto: (id: string, photoLabel: string, actor?: string) => void;
  setAiFeedback: (id: string, feedback: 'up' | 'down') => void;
  setPriority: (id: string, newPriority: Priority, actor?: string) => void;
  reassign: (id: string, newAssignee: string, actor?: string) => void;
  toggleWatch: (id: string, watcher: string) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Record<string, Ticket>>(INITIAL_TICKETS);

  const updateStatus = useCallback((id: string, newStatus: TicketStatus, actor: string = 'Amir Lopez') => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t) return prev;
      const entry: TimelineEntry = {
        time: nowClockString(),
        actor,
        action: STATUS_MESSAGE[newStatus],
        icon: STATUS_ICON[newStatus],
        kind: 'status',
      };
      return {
        ...prev,
        [id]: {
          ...t,
          status: newStatus,
          updatedAt: 'Just now',
          activity: [entry, ...t.activity],
        },
      };
    });
  }, []);

  const addNote = useCallback((id: string, text: string, actor: string = 'Amir Lopez') => {
    if (!text.trim()) return;
    setTickets((prev) => {
      const t = prev[id];
      if (!t) return prev;
      const entry: TimelineEntry = {
        time: nowClockString(),
        actor,
        action: text.trim(),
        icon: 'create-outline',
        kind: 'note',
        noteText: text.trim(),
      };
      return {
        ...prev,
        [id]: {
          ...t,
          updatedAt: 'Just now',
          activity: [entry, ...t.activity],
        },
      };
    });
  }, []);

  const addPhoto = useCallback((id: string, photoLabel: string, actor: string = 'Amir Lopez') => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t) return prev;
      const entry: TimelineEntry = {
        time: nowClockString(),
        actor,
        action: `Added photo: ${photoLabel}`,
        icon: 'camera-outline',
        kind: 'photo',
        photoLabel,
      };
      return {
        ...prev,
        [id]: {
          ...t,
          updatedAt: 'Just now',
          activity: [entry, ...t.activity],
        },
      };
    });
  }, []);

  const setAiFeedback = useCallback((id: string, feedback: 'up' | 'down') => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t) return prev;
      return { ...prev, [id]: { ...t, aiFeedback: feedback } };
    });
  }, []);

  const setPriority = useCallback((id: string, newPriority: Priority, actor: string = 'Sydney Rivera') => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t || t.priority === newPriority) return prev;
      const entry: TimelineEntry = {
        time: nowClockString(),
        actor,
        action: `Priority changed: ${t.priority} → ${newPriority}`,
        icon: 'alert-circle-outline',
        kind: 'status',
      };
      return {
        ...prev,
        [id]: {
          ...t,
          priority: newPriority,
          updatedAt: 'Just now',
          activity: [entry, ...t.activity],
        },
      };
    });
  }, []);

  const reassign = useCallback((id: string, newAssignee: string, actor: string = 'Sydney Rivera') => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t || t.assignee === newAssignee) return prev;
      const entry: TimelineEntry = {
        time: nowClockString(),
        actor,
        action: `Reassigned: ${t.assignee} → ${newAssignee}`,
        icon: 'swap-horizontal-outline',
        kind: 'system',
      };
      return {
        ...prev,
        [id]: {
          ...t,
          assignee: newAssignee,
          updatedAt: 'Just now',
          activity: [entry, ...t.activity],
        },
      };
    });
  }, []);

  const toggleWatch = useCallback((id: string, watcher: string) => {
    setTickets((prev) => {
      const t = prev[id];
      if (!t) return prev;
      const current = t.watchers ?? [];
      const watching = current.includes(watcher);
      return {
        ...prev,
        [id]: {
          ...t,
          watchers: watching ? current.filter((w) => w !== watcher) : [...current, watcher],
        },
      };
    });
  }, []);

  const value = useMemo<TicketContextValue>(
    () => ({
      tickets,
      allTickets: Object.values(tickets),
      getTicket: (id: string) => tickets[id],
      updateStatus,
      addNote,
      addPhoto,
      setAiFeedback,
      setPriority,
      reassign,
      toggleWatch,
    }),
    [tickets, updateStatus, addNote, addPhoto, setAiFeedback, setPriority, reassign, toggleWatch]
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets(): TicketContextValue {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used inside TicketProvider');
  return ctx;
}
