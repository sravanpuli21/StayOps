'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
  scope: string;
  createdAt: string;
}

const ROLE_META: Record<string, { label: string; bg: string; color: string; rank: number; desc: string }> = {
  md:       { label: 'Managing Director',  bg: '#fee2e2', color: '#b91c1c', rank: 1, desc: 'Full portfolio · all hotels, all modules' },
  regional: { label: 'Regional Director',  bg: '#fef3c7', color: '#92400e', rank: 2, desc: 'Region scope · hotels in their territory' },
  gm:       { label: 'General Manager',    bg: '#dbeafe', color: '#1d4ed8', rank: 3, desc: 'Single property · their hotel' },
  staff:    { label: 'Staff',              bg: '#f0f0f0', color: '#3f3f3f', rank: 4, desc: 'Property-level · assigned duties only' },
};

function roleMeta(role: string) {
  return ROLE_META[role] ?? { label: role, bg: '#f0f0f0', color: '#3f3f3f', rank: 99, desc: '' };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    fetch('/api/admin/users', { headers: { 'x-admin-secret': secret } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setUsers(d.users ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const byRole = useMemo(() => {
    const m: Record<string, number> = {};
    for (const u of users) m[u.role] = (m[u.role] ?? 0) + 1;
    return m;
  }, [users]);

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5" style={{ color: '#ff385c' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Users &amp; Roles</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          {users.length} user{users.length === 1 ? '' : 's'} · access tiers across the portfolio · live from Postgres
        </p>

        {/* Role legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(ROLE_META).map(([key, m]) => (
            <div key={key} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: m.bg, color: m.color }}>
                  {m.label.toUpperCase()}
                </span>
                <span className="text-lg font-bold" style={{ color: '#222' }}>{byRole[key] ?? 0}</span>
              </div>
              <p className="text-[11px] mt-2" style={{ color: '#6a6a6a' }}>{m.desc}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl p-12 flex items-center justify-center gap-2" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6a6a6a' }} />
            <span className="text-sm" style={{ color: '#929292' }}>Loading users…</span>
          </div>
        ) : err ? (
          <div className="rounded-2xl p-5 flex items-start gap-2" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} />
            <p className="text-sm" style={{ color: '#b91c1c' }}>Failed to load: {err}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Role</th>
                  <th className={th}>Scope</th>
                  <th className={th}>Added</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const m = roleMeta(u.role);
                  return (
                    <tr key={u.email} style={{ borderBottom: i < users.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td className="py-3 px-4 font-medium" style={{ color: '#222' }}>{u.name}</td>
                      <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: m.bg, color: m.color }}>
                          {m.label.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{u.scope}</td>
                      <td className="py-3 px-4 text-xs" style={{ color: '#929292' }}>{u.createdAt?.slice(0, 10) ?? '—'}</td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs mt-4" style={{ color: '#929292' }}>
          Phase 1 uses a shared-secret admin gate. Per-user auth + role enforcement (Clerk) lands in a later phase — these roles map to the persona apps under <code className="px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>/web/&lt;persona&gt;</code>.
        </p>
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
