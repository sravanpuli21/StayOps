'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type HotelSelection =
  | { kind: 'all' }
  | { kind: 'my-territory' }
  | { kind: 'regional'; regionalId: string }
  | { kind: 'single'; hotelId: string };

interface HotelFilterCtx {
  selection: HotelSelection;
  setSelection: (s: HotelSelection) => void;
  /** When a regional director (e.g. Harshal) is viewing, their id. Used to
   *  resolve `{ kind: 'my-territory' }` to the correct set of hotels. */
  viewerRegionalId?: string;
}

const HotelFilterContext = createContext<HotelFilterCtx | null>(null);

export function HotelFilterProvider({
  initial = { kind: 'all' },
  viewerRegionalId,
  children,
}: {
  initial?: HotelSelection;
  viewerRegionalId?: string;
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<HotelSelection>(initial);
  return (
    <HotelFilterContext.Provider value={{ selection, setSelection, viewerRegionalId }}>
      {children}
    </HotelFilterContext.Provider>
  );
}

export function useHotelFilter(): HotelFilterCtx {
  const ctx = useContext(HotelFilterContext);
  if (!ctx) {
    return { selection: { kind: 'all' }, setSelection: () => {} };
  }
  return ctx;
}
