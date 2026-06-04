'use client';

/**
 * Shared demand-signal store (client-side, localStorage).
 * Front desk logs signals here; the Sales CRM reads them — so a "why is demand
 * up?" note captured at check-in flows straight to the sales team's radar.
 * Backed by localStorage + a tiny pub/sub so both surfaces stay in sync within
 * the session. (Real persistence is a backend follow-up.)
 */
import { useSyncExternalStore } from 'react';
import { DEMAND_SIGNALS_SEED, type DemandSignal } from '@hos/shared';

const KEY = 'stayops.demandSignals';
const listeners = new Set<() => void>();
let cache: DemandSignal[] | null = null;

function read(): DemandSignal[] {
  if (cache) return cache;
  if (typeof window === 'undefined') return DEMAND_SIGNALS_SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as DemandSignal[]) : [...DEMAND_SIGNALS_SEED];
  } catch {
    cache = [...DEMAND_SIGNALS_SEED];
  }
  return cache!;
}

function write(next: DemandSignal[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function addDemandSignal(s: Omit<DemandSignal, 'id'>): DemandSignal {
  const created: DemandSignal = { ...s, id: `DS-${Date.now()}` };
  write([created, ...read()]);
  return created;
}

export function useDemandSignals(): DemandSignal[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => DEMAND_SIGNALS_SEED,
  );
}
