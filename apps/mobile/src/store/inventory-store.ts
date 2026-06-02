/**
 * Mutable inventory store. Subscribers re-render when counts/levels change.
 * Backed by useSyncExternalStore so React stays happy.
 *
 * Used by: Sydney + Amir Inventory tabs, audit flow, ticket fix flow.
 *
 * In production this would be a server-backed store with optimistic updates.
 * For demo it's an in-memory module singleton.
 */

import { useSyncExternalStore } from 'react';
import { INVENTORY as SEED, type InventoryItem, type StockLevel } from '../data/amir-inventory';

let state: InventoryItem[] = SEED.map((p) => ({ ...p }));
const listeners = new Set<() => void>();

function notify() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

function levelFor(count: number, par: number): StockLevel {
  if (count <= 0)            return 'out';
  if (count < par)           return 'low';
  return 'good';
}

/** Hook — re-renders consumer when inventory mutates. */
export function useInventory(): InventoryItem[] {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Decrement count by 1 and recompute level. Used when an item is consumed. */
export function decrementItem(id: string, qty = 1) {
  state = state.map((p) =>
    p.id === id ? { ...p, count: Math.max(0, p.count - qty), level: levelFor(p.count - qty, p.par) } : p
  );
  notify();
}

/** Match an item by name + variant — useful when called from a flow that
 *  knows the human label but not the id. Falls back to first matching name. */
export function decrementByLabel(name: string, variant?: string, qty = 1) {
  const match = state.find((p) =>
    p.name === name && (variant ? p.variant === variant : true)
  ) ?? state.find((p) => p.name === name);
  if (match) decrementItem(match.id, qty);
}

/** Find a single item by id. */
export function getItemById(id: string): InventoryItem | undefined {
  return state.find((p) => p.id === id);
}

/** Adjust to a specific count (used by Sydney's adjust flow). */
export function setItemCount(id: string, count: number) {
  state = state.map((p) =>
    p.id === id ? { ...p, count: Math.max(0, count), level: levelFor(count, p.par) } : p
  );
  notify();
}

/** Restock an item (Sydney approves the order). */
export function restockItem(id: string, qty: number) {
  const it = getItemById(id);
  if (!it) return;
  setItemCount(id, it.count + qty);
}

/** Reset to seed — useful for "reset demo" buttons later. */
export function resetInventory() {
  state = SEED.map((p) => ({ ...p }));
  notify();
}
