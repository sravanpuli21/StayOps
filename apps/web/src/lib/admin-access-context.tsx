'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AdminRole, UserScope } from '@hos/shared';
import { HOS_USERS } from '@hos/shared';

/**
 * Admin "acting-as" context. Real per-user auth (Clerk) is a separate backend
 * task; for now the Super Admin can preview the console as any access level so
 * the hierarchy + scope-gating is demonstrable. Persisted to localStorage.
 */

export interface ActingUser {
  id: string;
  name: string;
  role: AdminRole;
  scope: UserScope;
}

interface Ctx {
  acting: ActingUser;
  setActingId: (id: string) => void;
}

const STORAGE_KEY = 'stayops.admin.acting';

// Default to the Super Admin.
const SUPER = HOS_USERS.find((u) => u.role === 'super_admin')!;
const DEFAULT: ActingUser = { id: SUPER.id, name: SUPER.name, role: SUPER.role, scope: SUPER.scope };

const AdminAccessContext = createContext<Ctx | null>(null);

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const [acting, setActing] = useState<ActingUser>(DEFAULT);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const u = HOS_USERS.find((x) => x.id === saved);
    if (u) setActing({ id: u.id, name: u.name, role: u.role, scope: u.scope });
  }, []);

  const setActingId = (id: string) => {
    const u = HOS_USERS.find((x) => x.id === id);
    if (!u) return;
    setActing({ id: u.id, name: u.name, role: u.role, scope: u.scope });
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <AdminAccessContext.Provider value={{ acting, setActingId }}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess(): Ctx {
  const v = useContext(AdminAccessContext);
  if (!v) {
    // Safe fallback when used outside the provider (e.g. SSR shell) — acts as
    // Super Admin so screens render; the provider hydrates the real choice.
    return { acting: DEFAULT, setActingId: () => {} };
  }
  return v;
}
