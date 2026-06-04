/**
 * Demand signals — the "why is demand up?" intelligence layer.
 *
 * Front desk captures WHY guests are here (a festival, a graduation, a family
 * reunion, weather displacement) even when it never shows up as a group
 * reservation. The CRM then turns these into RECURRING opportunities: it knows
 * when the driver is likely to happen again, so sales can pre-empt it with a
 * room block, a B2B outreach, or a rate increase — instead of missing it.
 *
 * Future: an agent auto-discovers event announcements + watches weather and
 * raises these signals automatically. For now they're logged by humans + seeded.
 */

export type DemandCategory =
  | 'event'        // concerts, conferences, commencements
  | 'festival'     // city festivals (jazz fest, food & wine)
  | 'sports'       // tournaments, games
  | 'family'       // reunions, weddings, milestone gatherings
  | 'weather'      // displacement: hurricanes, snowstorms, evacuations
  | 'corporate'    // a company in town for a project/launch
  | 'other';

export type Recurrence = 'annual' | 'seasonal' | 'recurring' | 'one-time' | 'unknown';

/** Was the demand captured as a group, or did it walk in unmanaged (missed)? */
export type Capture = 'group-booked' | 'walked-in' | 'mixed';

export type SuggestedPlay = 'room-block' | 'b2b-outreach' | 'raise-rates' | 'reconnect' | 'watch' | 'forecast-watch';

export interface DemandSignal {
  id: string;
  title: string;
  category: DemandCategory;
  /** ISO date the driver occurred / is occurring. */
  date: string;
  recurrence: Recurrence;
  capture: Capture;
  /** Rough share of the house attributable to this driver (0-100). */
  occupancyLift: number;
  /** Free text from whoever logged it — the guest-interaction insight. */
  note: string;
  loggedBy: string;
  source: 'front-desk' | 'sales' | 'auto' | 'seed';
  /** Optional contact captured from a guest (e.g. the family-reunion organizer). */
  contactName?: string;
  contactInfo?: string;
}

/** Add ~1 year (annual) etc. to estimate when this driver recurs. */
export function nextOccurrence(s: DemandSignal): string | null {
  // Weather is reactive, NOT recurring — you can't predict it a year out, only
  // watch the current forecast (~14-day horizon). Never compute a next date.
  if (s.category === 'weather') return null;
  if (s.recurrence === 'one-time') return null;
  const d = new Date(s.date);
  if (Number.isNaN(d.getTime())) return null;
  const add = (months: number) => {
    const n = new Date(d);
    n.setMonth(n.getMonth() + months);
    // Roll forward until it's in the future.
    while (n.getTime() < Date.now()) n.setMonth(n.getMonth() + months);
    return n.toISOString().slice(0, 10);
  };
  switch (s.recurrence) {
    case 'annual':   return add(12);
    case 'seasonal': return add(12); // same season next year
    case 'recurring':return add(3);  // assume quarterly-ish cadence
    default:         return null;     // unknown
  }
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

/** What sales should do about this driver, given how it was captured. */
export function suggestedPlay(s: DemandSignal): SuggestedPlay {
  // Weather can't be pre-sold — it's reactive. The only play is to watch the
  // live forecast (~14 days out) and adjust rates / readiness when one lands.
  if (s.category === 'weather') return 'forecast-watch';
  if (s.recurrence === 'one-time' || s.recurrence === 'unknown') {
    return s.category === 'family' ? 'reconnect' : 'watch';
  }
  if (s.category === 'family') return 'reconnect';
  if (s.capture === 'group-booked') return 'raise-rates';   // already ours — protect/optimize rate
  // Walked in unmanaged + recurring → biggest missed opportunity.
  if (s.occupancyLift >= 40) return 'room-block';
  return 'b2b-outreach';
}

export const CATEGORY_LABEL: Record<DemandCategory, string> = {
  event: 'Event', festival: 'Festival', sports: 'Sports', family: 'Family',
  weather: 'Weather', corporate: 'Corporate', other: 'Other',
};
export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  annual: 'Annual', seasonal: 'Seasonal', recurring: 'Recurring', 'one-time': 'One-time', unknown: 'Unknown',
};
export const CAPTURE_LABEL: Record<Capture, string> = {
  'group-booked': 'Group booked', 'walked-in': 'Walked in (missed)', mixed: 'Mixed',
};
export const PLAY_LABEL: Record<SuggestedPlay, string> = {
  'room-block': 'Set a room block', 'b2b-outreach': 'B2B outreach', 'raise-rates': 'Raise rates next time',
  reconnect: 'Reconnect with organizer', watch: 'Keep watching', 'forecast-watch': 'Watch forecast (~14d)',
};

/** Seed signals — drawn from real Savannah demand drivers. */
export const DEMAND_SIGNALS_SEED: DemandSignal[] = [
  {
    id: 'DS-001', title: 'SCAD Commencement Weekend', category: 'event', date: '2026-05-30',
    recurrence: 'annual', capture: 'walked-in', occupancyLift: 55, source: 'seed', loggedBy: 'Front Desk',
    note: 'Tons of families in town for SCAD graduation — sold out, mostly individual bookings at walk-in rates. No block. Happens every spring.',
  },
  {
    id: 'DS-002', title: 'Savannah Jazz Festival (downtown)', category: 'festival', date: '2025-09-25',
    recurrence: 'annual', capture: 'walked-in', occupancyLift: 40, source: 'seed', loggedBy: 'Front Desk',
    note: 'Lots of guests said they were here for the jazz fest downtown. None were group reservations — we just rode the wave. Could block rooms or B2B with festival org next year.',
  },
  {
    id: 'DS-003', title: 'Hurricane evac from Florida', category: 'weather', date: '2025-10-08',
    recurrence: 'one-time', capture: 'walked-in', occupancyLift: 70, source: 'seed', loggedBy: 'Front Desk',
    note: 'FL hurricane pushed evacuees north — filled fast off I-95 (south-Savannah hotels fill first). Reactive only: can\'t pre-sell, but when the forecast shows a storm tracking toward FL, hold rate and ready the house.',
  },
  {
    id: 'DS-004', title: 'NE snowstorm — winter escape guests', category: 'weather', date: '2026-01-20',
    recurrence: 'one-time', capture: 'walked-in', occupancyLift: 25, source: 'seed', loggedBy: 'Front Desk',
    note: 'Severe Northeast snowstorm — some guests came down to escape / had travel rerouted here. Reactive demand: watch the 14-day forecast for big NE systems and be ready to adjust rates.',
  },
  {
    id: 'DS-005', title: 'Thompson family reunion', category: 'family', date: '2026-04-12',
    recurrence: 'annual', capture: 'walked-in', occupancyLift: 12, source: 'seed', loggedBy: 'Front Desk',
    contactName: 'Gloria Thompson', contactInfo: '(912) 555-0173',
    note: '~10 rooms of one extended family for an annual reunion — booked individually. Organizer is Gloria. If we reconnect in ~9 months we could host the whole thing as a block + maybe an event space.',
  },
  {
    id: 'DS-006', title: 'St. Patrick\'s Day (Savannah)', category: 'festival', date: '2026-03-17',
    recurrence: 'annual', capture: 'mixed', occupancyLift: 80, source: 'seed', loggedBy: 'Sales',
    note: 'Savannah\'s huge St. Paddy\'s draw — citywide sellout. We do okay on rate but could push harder + pre-sell blocks earlier.',
  },
];
