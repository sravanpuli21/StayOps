/**
 * In-memory audit progress store. Lets a user pause an audit (e.g. step out
 * to fix an urgent ticket) and return to it without losing progress.
 *
 * In a real build this would be persisted via backend or AsyncStorage.
 */

import type { AuditRoom } from './audits';

interface PausedState {
  rooms: AuditRoom[];
  pausedAt: string;
  reason?: string;
}

const store = new Map<string, PausedState>();

export function savePausedAudit(auditId: string, rooms: AuditRoom[], reason?: string) {
  store.set(auditId, { rooms, pausedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), reason });
}

export function loadPausedAudit(auditId: string): PausedState | undefined {
  return store.get(auditId);
}

export function clearPausedAudit(auditId: string) {
  store.delete(auditId);
}

export function isPaused(auditId: string): boolean {
  return store.has(auditId);
}
