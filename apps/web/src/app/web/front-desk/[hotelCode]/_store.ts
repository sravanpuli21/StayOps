'use client';

/**
 * Front Desk Access — in-session store (useSyncExternalStore + localStorage).
 * Everything the shared desk computer does lives here so every click is real
 * and persists across refresh, with no backend:
 *   - work orders (+ notes)
 *   - service requests (+ line items + notes)
 *   - punch logs (in/out)
 *   - today's hotel pulse entries
 *   - a recent-activity feed for this device
 *
 * Reset-friendly: resetFrontDesk() clears back to seed.
 */
import { useSyncExternalStore } from 'react';
import { DEVICE_NAME, type Priority, type WoStatus, type SrStatus } from './_data';

export interface WoNote { id: string; note: string; by: string; ts: string }
export interface WorkOrder {
  id: string;            // WO-10024
  hotelCode: string;
  locationType: string;
  exactLocation: string; // area / amenity / exterior label
  roomNumber?: string;
  roomArea?: string;
  item: string;
  requestedBy: string;
  priority: Priority;
  details: string;
  status: WoStatus;
  assignedTeam: string;
  photoName?: string;
  notes: WoNote[];
  guestWaiting?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface SrItem { id: string; name: string; qty: number; notes?: string }
export interface ServiceRequest {
  id: string;            // SR-10089
  hotelCode: string;
  locationType: string;
  roomNumber?: string;
  exactLocation?: string; // specific common area (Lobby, Pool…) when not a room
  guestName?: string;
  requestedBy: string;
  priority: Priority;
  overallDetails: string;
  items: SrItem[];
  status: SrStatus;
  assignedTeam: string;
  photoName?: string;
  notes: WoNote[];
  guestWaiting?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface PunchLog { id: string; hotelCode: string; employeeId: string; employeeName: string; department: string; type: 'Punch In' | 'Punch Out'; ts: string; device: string }
export interface HotelPulse {
  id: string;
  hotelCode: string;
  date: string;
  occupancyFeeling: string;
  mainReason: string;
  eventName: string;
  guestSource: string;
  foundOut: string[];
  guestsMentioned: string;
  groupBooking: string;
  missedOpportunity: string;
  shouldFollowUp: string;
  followUpTiming: string;
  notes: string;
  salesNotified: boolean;
  photoName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface ActivityEntry { id: string; ts: string; kind: string; label: string; href?: string }

interface FdState {
  workOrders: WorkOrder[];
  serviceRequests: ServiceRequest[];
  punches: PunchLog[];
  pulse: HotelPulse[];
  activity: ActivityEntry[];
  woCounter: number;
  srCounter: number;
}

const KEY = 'stayops.frontdesk.state';
const listeners = new Set<() => void>();
let cache: FdState | null = null;

function nowIso() { return new Date().toISOString(); }
function ago(mins: number) { return new Date(Date.now() - mins * 60000).toISOString(); }

function seed(): FdState {
  const wo: WorkOrder[] = [
    { id: 'WO-10018', hotelCode: 'BTRCI', locationType: 'Guest Room', exactLocation: 'Room 214 · Bedroom', roomNumber: '214', roomArea: 'Bedroom', item: 'HVAC', requestedBy: 'Guest', priority: 'Urgent', details: 'Guest in 214 says the AC is not cooling at all.', status: 'In Progress', assignedTeam: 'Engineering', notes: [{ id: 'n1', note: 'Engineering acknowledged, heading up now.', by: 'Engineering', ts: ago(40) }], guestWaiting: true, createdBy: DEVICE_NAME, createdAt: ago(120), updatedAt: ago(40) },
    { id: 'WO-10019', hotelCode: 'BTRCI', locationType: 'Guest Room', exactLocation: 'Room 109 · Bathroom', roomNumber: '109', roomArea: 'Bathroom', item: 'Sink', requestedBy: 'Housekeeping', priority: 'Normal', details: 'Bathroom sink draining slowly.', status: 'New', assignedTeam: 'Engineering', notes: [], createdBy: DEVICE_NAME, createdAt: ago(300), updatedAt: ago(300) },
    { id: 'WO-10020', hotelCode: 'BTRCI', locationType: 'Common Area', exactLocation: 'Elevator 1', item: 'Elevator', requestedBy: 'Front desk', priority: 'High', details: 'Elevator 1 making a grinding noise between floors 2 and 3.', status: 'Acknowledged', assignedTeam: 'Engineering', notes: [], createdBy: DEVICE_NAME, createdAt: ago(500), updatedAt: ago(420) },
    { id: 'WO-10015', hotelCode: 'BTRCI', locationType: 'Guest Room', exactLocation: 'Room 330 · Bedroom', roomNumber: '330', roomArea: 'Bedroom', item: 'TV remote', requestedBy: 'Guest', priority: 'Normal', details: 'TV remote not working, replaced batteries no luck.', status: 'Completed', assignedTeam: 'Engineering', notes: [{ id: 'n2', note: 'Replaced remote unit.', by: 'Engineering', ts: ago(1500) }], createdBy: DEVICE_NAME, createdAt: ago(1600), updatedAt: ago(1500) },
    { id: 'WO-10012', hotelCode: 'BTRCI', locationType: 'Guest Room', exactLocation: 'Room 248 · Bathroom', roomNumber: '248', roomArea: 'Bathroom', item: 'Shower', requestedBy: 'Guest', priority: 'High', details: 'Guest reported no hot water in shower. Guest checked out before tech arrived.', status: 'Cancelled', assignedTeam: 'Engineering', notes: [{ id: 'n3', note: 'Guest checked out — cancelling, will re-check on turnover.', by: 'Front Desk', ts: ago(2000) }], createdBy: DEVICE_NAME, createdAt: ago(2200), updatedAt: ago(2000) },
  ];
  const sr: ServiceRequest[] = [
    { id: 'SR-10081', hotelCode: 'BTRCI', locationType: 'Guest Room', roomNumber: '305', requestedBy: 'Guest', priority: 'Normal', overallDetails: 'Guest requested fresh towels and water.', items: [{ id: 'i1', name: 'Towels', qty: 4 }, { id: 'i2', name: 'Water', qty: 2 }], status: 'In Progress', assignedTeam: 'Housekeeping', notes: [], createdBy: DEVICE_NAME, createdAt: ago(60), updatedAt: ago(30) },
    { id: 'SR-10082', hotelCode: 'BTRCI', locationType: 'Guest Room', roomNumber: '218', requestedBy: 'Guest', priority: 'High', overallDetails: 'Extra pillows and blanket, guest is cold.', items: [{ id: 'i3', name: 'Pillows', qty: 2 }, { id: 'i4', name: 'Blanket', qty: 1 }], status: 'New', assignedTeam: 'Housekeeping', notes: [], createdBy: DEVICE_NAME, createdAt: ago(20), updatedAt: ago(20) },
    { id: 'SR-10078', hotelCode: 'BTRCI', locationType: 'Guest Room', roomNumber: '142', requestedBy: 'Guest', priority: 'Normal', overallDetails: 'Late checkout requested until 1pm.', items: [{ id: 'i5', name: 'Late checkout', qty: 1 }], status: 'Delivered', assignedTeam: 'Housekeeping', notes: [], createdBy: DEVICE_NAME, createdAt: ago(900), updatedAt: ago(840) },
  ];
  const punches: PunchLog[] = [
    { id: 'P-1', hotelCode: 'BTRCI', employeeId: 'E1042', employeeName: 'Maria Lopez', department: 'Housekeeping', type: 'Punch In', ts: ago(400), device: DEVICE_NAME },
    { id: 'P-2', hotelCode: 'BTRCI', employeeId: 'E1088', employeeName: 'James Carter', department: 'Front Desk', type: 'Punch In', ts: ago(380), device: DEVICE_NAME },
  ];
  const activity: ActivityEntry[] = [
    { id: 'a1', ts: ago(20), kind: 'SR', label: 'Service request SR-10082 created · Room 218', href: 'service-requests/SR-10082' },
    { id: 'a2', ts: ago(40), kind: 'WO', label: 'Work order WO-10018 updated · Room 214', href: 'work-orders/WO-10018' },
    { id: 'a3', ts: ago(60), kind: 'SR', label: 'Service request SR-10081 created · Room 305', href: 'service-requests/SR-10081' },
    { id: 'a4', ts: ago(380), kind: 'Punch', label: 'James Carter punched in' },
    { id: 'a5', ts: ago(400), kind: 'Punch', label: 'Maria Lopez punched in' },
  ];
  return { workOrders: wo, serviceRequests: sr, punches, pulse: [], activity, woCounter: 10020, srCounter: 10082 };
}

function read(): FdState {
  if (cache) return cache;
  if (typeof window === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...seed(), ...(JSON.parse(raw) as FdState) } : seed();
  } catch { cache = seed(); }
  return cache!;
}
function write(next: FdState) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function logActivity(s: FdState, kind: string, label: string, href?: string): ActivityEntry[] {
  return [{ id: `a-${Date.now()}-${Math.floor(performance.now())}`, ts: nowIso(), kind, label, href }, ...s.activity].slice(0, 50);
}

/* ── Work order mutations ─────────────────────────────────────────────── */
export function createWorkOrder(wo: Omit<WorkOrder, 'id' | 'status' | 'assignedTeam' | 'notes' | 'createdBy' | 'createdAt' | 'updatedAt'>): WorkOrder {
  const s = read();
  const num = s.woCounter + 1;
  const full: WorkOrder = { ...wo, id: `WO-${num}`, status: 'New', assignedTeam: 'Engineering', notes: [], createdBy: DEVICE_NAME, createdAt: nowIso(), updatedAt: nowIso() };
  write({ ...s, workOrders: [full, ...s.workOrders], woCounter: num, activity: logActivity(s, 'WO', `Work order ${full.id} created · ${full.roomNumber ? `Room ${full.roomNumber}` : full.exactLocation}`, `work-orders/${full.id}`) });
  return full;
}
export function addWoNote(id: string, note: string, by = 'Front Desk') {
  const s = read();
  write({ ...s, workOrders: s.workOrders.map((w) => w.id === id ? { ...w, notes: [...w.notes, { id: `n-${Date.now()}`, note, by, ts: nowIso() }], updatedAt: nowIso() } : w), activity: logActivity(s, 'WO', `Note added to ${id}`, `work-orders/${id}`) });
}
export function setWoPriority(id: string, priority: Priority) {
  const s = read();
  write({ ...s, workOrders: s.workOrders.map((w) => w.id === id ? { ...w, priority, updatedAt: nowIso() } : w) });
}
export function setWoGuestWaiting(id: string, waiting: boolean) {
  const s = read();
  write({ ...s, workOrders: s.workOrders.map((w) => w.id === id ? { ...w, guestWaiting: waiting, updatedAt: nowIso() } : w) });
}
export function cancelWorkOrder(id: string) {
  const s = read();
  write({ ...s, workOrders: s.workOrders.map((w) => w.id === id ? { ...w, status: 'Cancelled', updatedAt: nowIso() } : w), activity: logActivity(s, 'WO', `Work order ${id} cancelled`, `work-orders/${id}`) });
}
export function addWoPhoto(id: string, name: string) {
  const s = read();
  write({ ...s, workOrders: s.workOrders.map((w) => w.id === id ? { ...w, photoName: name, updatedAt: nowIso() } : w) });
}

/* ── Service request mutations ────────────────────────────────────────── */
export function createServiceRequest(sr: Omit<ServiceRequest, 'id' | 'status' | 'assignedTeam' | 'notes' | 'createdBy' | 'createdAt' | 'updatedAt'>): ServiceRequest {
  const s = read();
  const num = s.srCounter + 1;
  const full: ServiceRequest = { ...sr, id: `SR-${num}`, status: 'New', assignedTeam: 'Housekeeping', notes: [], createdBy: DEVICE_NAME, createdAt: nowIso(), updatedAt: nowIso() };
  write({ ...s, serviceRequests: [full, ...s.serviceRequests], srCounter: num, activity: logActivity(s, 'SR', `Service request ${full.id} created · ${full.roomNumber ? `Room ${full.roomNumber}` : full.exactLocation || full.locationType}`, `service-requests/${full.id}`) });
  return full;
}
export function addSrNote(id: string, note: string, by = 'Front Desk') {
  const s = read();
  write({ ...s, serviceRequests: s.serviceRequests.map((r) => r.id === id ? { ...r, notes: [...r.notes, { id: `n-${Date.now()}`, note, by, ts: nowIso() }], updatedAt: nowIso() } : r), activity: logActivity(s, 'SR', `Note added to ${id}`, `service-requests/${id}`) });
}
export function addSrItem(id: string, name: string, qty: number, notes?: string) {
  const s = read();
  write({ ...s, serviceRequests: s.serviceRequests.map((r) => r.id === id ? { ...r, items: [...r.items, { id: `i-${Date.now()}`, name, qty, notes }], updatedAt: nowIso() } : r) });
}
export function setSrPriority(id: string, priority: Priority) {
  const s = read();
  write({ ...s, serviceRequests: s.serviceRequests.map((r) => r.id === id ? { ...r, priority, updatedAt: nowIso() } : r) });
}
export function setSrGuestWaiting(id: string, waiting: boolean) {
  const s = read();
  write({ ...s, serviceRequests: s.serviceRequests.map((r) => r.id === id ? { ...r, guestWaiting: waiting, updatedAt: nowIso() } : r) });
}
export function cancelServiceRequest(id: string) {
  const s = read();
  write({ ...s, serviceRequests: s.serviceRequests.map((r) => r.id === id ? { ...r, status: 'Cancelled', updatedAt: nowIso() } : r), activity: logActivity(s, 'SR', `Service request ${id} cancelled`, `service-requests/${id}`) });
}

/* ── Punch mutations ──────────────────────────────────────────────────── */
/** Is this employee currently punched in (last punch was an In)? */
export function isPunchedIn(s: FdState, employeeId: string): boolean {
  const last = s.punches.find((p) => p.employeeId === employeeId);
  return last?.type === 'Punch In';
}
export function recordPunch(hotelCode: string, emp: { id: string; name: string; department: string }, type: 'Punch In' | 'Punch Out'): PunchLog {
  const s = read();
  const p: PunchLog = { id: `P-${Date.now()}`, hotelCode, employeeId: emp.id, employeeName: emp.name, department: emp.department, type, ts: nowIso(), device: DEVICE_NAME };
  write({ ...s, punches: [p, ...s.punches], activity: logActivity(s, 'Punch', `${emp.name} ${type.toLowerCase()}`) });
  return p;
}

/* ── Hotel Pulse mutations ────────────────────────────────────────────── */
export function createPulse(p: Omit<HotelPulse, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): HotelPulse {
  const s = read();
  const full: HotelPulse = { ...p, id: `HP-${Date.now()}`, createdBy: DEVICE_NAME, createdAt: nowIso(), updatedAt: nowIso() };
  write({ ...s, pulse: [full, ...s.pulse], activity: logActivity(s, 'Pulse', `Hotel pulse logged · ${full.eventName || full.mainReason}`, `pulse/${full.id}`) });
  return full;
}
export function markPulseNotified(id: string) {
  const s = read();
  write({ ...s, pulse: s.pulse.map((p) => p.id === id ? { ...p, salesNotified: true, updatedAt: nowIso() } : p) });
}

export function resetFrontDesk() { write(seed()); }

/* ── Reads ────────────────────────────────────────────────────────────── */
export function useFdState(): FdState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, seed);
}
