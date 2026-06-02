'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AccountingDemoMode = 'seeded' | 'empty';

interface Ctx {
  mode: AccountingDemoMode;
  setMode: (m: AccountingDemoMode) => void;
}

const AccountingDemoContext = createContext<Ctx | null>(null);
const STORAGE_KEY = 'hos.accounting.demo';

export function AccountingDemoProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AccountingDemoMode>('seeded');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'seeded' || stored === 'empty') {
      setModeState(stored);
    }
  }, []);

  const setMode = (m: AccountingDemoMode) => {
    setModeState(m);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, m);
    }
  };

  return (
    <AccountingDemoContext.Provider value={{ mode, setMode }}>
      {children}
    </AccountingDemoContext.Provider>
  );
}

export function useAccountingDemo() {
  const v = useContext(AccountingDemoContext);
  if (!v) throw new Error('useAccountingDemo must be used inside AccountingDemoProvider');
  return v;
}
