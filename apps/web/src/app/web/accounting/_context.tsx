'use client';

/**
 * StayOps Accounting OS — app context. Holds the global selection that scopes
 * every screen: the company (HOS) and the entity (All Hotels OR one hotel).
 * Persisted to localStorage. Also tracks left-nav collapse.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type EntitySelection = { kind: 'all' } | { kind: 'hotel'; hotelId: string };

interface AcctOsCtx {
  selection: EntitySelection;
  selectAll: () => void;
  selectHotel: (hotelId: string) => void;
  navCollapsed: boolean;
  toggleNav: () => void;
}

const KEY = 'stayops.acctos.selection';
const NAV_KEY = 'stayops.acctos.nav';
const Ctx = createContext<AcctOsCtx | null>(null);

export function AcctOsProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<EntitySelection>({ kind: 'all' });
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSelection(JSON.parse(raw) as EntitySelection);
      setNavCollapsed(localStorage.getItem(NAV_KEY) === '1');
    } catch { /* ignore */ }
  }, []);

  const persist = (s: EntitySelection) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  };
  const selectAll = () => { setSelection({ kind: 'all' }); persist({ kind: 'all' }); };
  const selectHotel = (hotelId: string) => { const s: EntitySelection = { kind: 'hotel', hotelId }; setSelection(s); persist(s); };
  const toggleNav = () => setNavCollapsed((c) => { const n = !c; try { localStorage.setItem(NAV_KEY, n ? '1' : '0'); } catch { /* ignore */ } return n; });

  return (
    <Ctx.Provider value={{ selection, selectAll, selectHotel, navCollapsed, toggleNav }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAcctOs(): AcctOsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { selection: { kind: 'all' }, selectAll: () => {}, selectHotel: () => {}, navCollapsed: false, toggleNav: () => {} };
  return ctx;
}
