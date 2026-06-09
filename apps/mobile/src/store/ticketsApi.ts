/**
 * Live ticket sync for the mobile app.
 *
 * The phone app is otherwise in-memory (seeded). This pulls real tickets from
 * the same backend the web personas use (GET /api/ops/tickets), so a Work Order
 * raised at the front-desk computer reaches Sydney's and Amir's phones too.
 *
 * Read-only sync for now: we fetch + merge front-desk-originated tickets on top
 * of the local seed. Local mutations (status/notes the tech makes on the phone)
 * still live in the in-memory store and win for ids they've touched.
 *
 * Set the backend via EXPO_PUBLIC_API_URL (e.g. http://10.0.0.29:3000). With no
 * URL set, sync is a no-op and the app runs entirely on seed data.
 */
import type { Ticket, TicketStatus, Priority, TicketTaskType, TimelineEntry } from './ticketsContext';

const HOTEL_CODE = 'BTRCI'; // the property this device covers
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** Map the web/DB status onto the mobile status vocabulary. */
function mapStatus(s: string): TicketStatus {
  switch (s) {
    case 'assigned': return 'open';        // acknowledged but tech hasn't started
    case 'in_progress': return 'in_progress';
    case 'pending_part': return 'pending_part';
    case 'scheduled': return 'scheduled';
    case 'completed':
    case 'closed':
    case 'resolved': return 'resolved';
    case 'escalated': return 'escalated';
    default: return 'open';
  }
}
function mapPriority(p: string): Priority {
  if (p === 'urgent') return 'urgent';
  if (p === 'high') return 'high';
  return 'normal';
}
function mapType(t: string): TicketTaskType {
  if (t === 'preventive') return 'preventive';
  if (t === 'audit') return 'audit';
  return 'reactive';
}
function floorOf(room?: string | null): number {
  if (!room) return 0;
  const n = parseInt(String(room).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? Math.floor(n / 100) || 1 : 0;
}

interface ApiTicket {
  id: string; roomNumber?: string | null; area?: string | null;
  type: string; priority: string; status: string;
  title: string; description?: string | null;
  reportedBy?: string | null; assignedTo?: string | null;
  department?: string | null; requestType?: string | null;
  createdAt: string; updatedAt: string;
  items?: Array<{ item: string; quantity?: number; category?: string; area?: string }> | null;
  activity?: Array<{ actor: string; action: string; note?: string; timestamp: string }> | null;
}

function toMobileTicket(a: ApiTicket): Ticket {
  const activity: TimelineEntry[] = Array.isArray(a.activity)
    ? a.activity.map((e) => ({ time: new Date(e.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), actor: e.actor, action: String(e.action).replace(/[:_]/g, ' '), kind: 'system' as const, noteText: e.note }))
    : [];
  const itemLine = Array.isArray(a.items) && a.items.length
    ? a.items.map((i) => `${i.quantity ? i.quantity + '× ' : ''}${i.item}`).join(', ')
    : '';
  return {
    id: a.id,
    room: a.roomNumber ?? '',
    floor: floorOf(a.roomNumber),
    area: a.area ?? (a.department === 'Housekeeping' ? 'Guest Request' : 'General'),
    type: mapType(a.type),
    priority: mapPriority(a.priority),
    status: mapStatus(a.status),
    title: a.title,
    description: a.description ?? itemLine,
    reportedBy: a.reportedBy ?? 'Front Desk',
    assignee: a.assignedTo ?? 'Amir Lopez',
    createdAt: 'Just now',
    updatedAt: 'Just now',
    estimatedCost: 0,
    revenueLost: 0,
    activity,
    aiFeedback: null,
  };
}

/** Fetch front-desk + other open tickets from the backend. Returns [] on any failure. */
export async function fetchLiveTickets(): Promise<Ticket[]> {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/ops/tickets?hotelId=${HOTEL_CODE}`);
    if (!res.ok) return [];
    const json = await res.json();
    const rows: ApiTicket[] = Array.isArray(json?.tickets) ? json.tickets : [];
    // Only surface items that originated at the front desk — the rest of the
    // mobile demo runs on its curated seed.
    return rows
      .filter((t) => typeof t.reportedBy === 'string' && t.reportedBy.startsWith('Front Desk'))
      .map(toMobileTicket);
  } catch {
    return [];
  }
}

export const LIVE_SYNC_ENABLED = !!API_URL;
