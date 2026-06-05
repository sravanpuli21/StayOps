'use client';

/**
 * Accounting scope — the accountant works ONE hotel (= one entity / one set of
 * books) and ONE statement period (keyed off the statement closing date) at a
 * time. There is no collective/portfolio working mode here. Persisted to
 * localStorage so they stay where they were.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { HOTELS, defaultPeriodForHotel, periodsForHotel } from '@hos/shared';

interface AccountingScope {
  hotelId: string;
  periodEndIso: string;
  setHotel: (hotelId: string) => void;
  setPeriod: (periodEndIso: string) => void;
}

const KEY = 'hos.accounting.scope';
const Ctx = createContext<AccountingScope | null>(null);

export function AccountingScopeProvider({ children }: { children: ReactNode }) {
  const [hotelId, setHotelId] = useState<string>(HOTELS[0].id);
  const [periodEndIso, setPeriodEndIso] = useState<string>(defaultPeriodForHotel(HOTELS[0].id).periodEndIso);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as { hotelId?: string; periodEndIso?: string };
        if (s.hotelId && HOTELS.some((h) => h.id === s.hotelId)) {
          setHotelId(s.hotelId);
          setPeriodEndIso(s.periodEndIso ?? defaultPeriodForHotel(s.hotelId).periodEndIso);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const persist = (h: string, p: string) => {
    try { localStorage.setItem(KEY, JSON.stringify({ hotelId: h, periodEndIso: p })); } catch { /* ignore */ }
  };

  const setHotel = (h: string) => {
    // When switching hotels, land on that hotel's sensible default period
    // unless the same period exists for it.
    const periods = periodsForHotel(h);
    const keep = periods.some((x) => x.periodEndIso === periodEndIso) ? periodEndIso : defaultPeriodForHotel(h).periodEndIso;
    setHotelId(h);
    setPeriodEndIso(keep);
    persist(h, keep);
  };
  const setPeriod = (p: string) => {
    setPeriodEndIso(p);
    persist(hotelId, p);
  };

  return (
    <Ctx.Provider value={{ hotelId, periodEndIso, setHotel, setPeriod }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAccountingScope(): AccountingScope {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback (shouldn't happen inside the accounting layout).
    return {
      hotelId: HOTELS[0].id,
      periodEndIso: defaultPeriodForHotel(HOTELS[0].id).periodEndIso,
      setHotel: () => {}, setPeriod: () => {},
    };
  }
  return ctx;
}
