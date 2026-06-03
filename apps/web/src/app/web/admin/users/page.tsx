'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Lock, Pencil } from 'lucide-react';
import {
  HOS_COMPANY, HOS_PROPERTIES, companyUsers, ROLE_META, scopeLabel, canManageUsers,
  type CompanyUser, type AdminRole,
} from '@hos/shared';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { useAdminAccess } from '@/lib/admin-access-context';

export default function CompanyUsersPage() {
  const { acting } = useAdminAccess();
  const [overrides, setOverrides] = useState<Record<string, CompanyUser>>({});
  const [added, setAdded] = useState<CompanyUser[]>([]);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all');

  const canManage = canManageUsers(acting.role);

  const users = useMemo(() => {
    const base = companyUsers().map((u) => overrides[u.id] ?? u);
    return [...base, ...added];
  }, [overrides, added]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q.trim()) {
        const hay = `${u.name} ${u.email}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => ROLE_META[a.role].rank - ROLE_META[b.role].rank || a.name.localeCompare(b.name));
  }, [users, roleFilter, q]);

  const saveUser = (u: CompanyUser) => {
    const exists = companyUsers().some((x) => x.id === u.id) || added.some((x) => x.id === u.id);
    if (exists) {
      if (added.some((x) => x.id === u.id)) setAdded((cur) => cur.map((x) => (x.id === u.id ? u : x)));
      else setOverrides((cur) => ({ ...cur, [u.id]: u }));
    } else {
      setAdded((cur) => [...cur, u]);
    }
    // The modal closes itself (after the invite screen for new users).
  };

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <AdminHeader title="Company Users" subtitle={`${HOS_COMPANY.name} · company-level users across the portfolio`} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
            <input type="text" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 rounded-full" style={{ border: '1px solid #dddddd', background: '#fff' }} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as AdminRole | 'all')}
            className="h-9 px-3 rounded-lg text-xs font-semibold outline-none" style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}>
            <option value="all">All roles</option>
            {companyUsers().map((u) => u.role).filter((r, i, a) => a.indexOf(r) === i).map((r) => (
              <option key={r} value={r}>{ROLE_META[r].label}</option>
            ))}
          </select>
          {canManage && (
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold ml-auto" style={{ background: '#ff385c', color: '#fff' }}>
              <Plus className="w-4 h-4" /> Add user
            </button>
          )}
        </div>

        {!canManage && (
          <div className="rounded-2xl p-4 flex items-start gap-2" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Lock className="w-4 h-4 mt-0.5" style={{ color: '#92400e' }} />
            <p className="text-xs" style={{ color: '#78350f' }}>View only — Super Admin / Company Admin can add users and change roles.</p>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                <th className={th}>Name</th>
                <th className={th}>Role</th>
                <th className={th}>Access</th>
                <th className={th}>Status</th>
                {canManage && <th className={th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const m = ROLE_META[u.role];
                return (
                  <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-3 px-4">
                      <p className="font-medium" style={{ color: '#222' }}>{u.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{u.email}</p>
                    </td>
                    <td className="py-3 px-4"><span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: m.bg, color: m.color }}>{m.label}</span></td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{scopeLabel(u.scope, HOS_PROPERTIES)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: u.active ? '#dcfce7' : '#fee2e2', color: u.active ? '#15803d' : '#b91c1c' }}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4">
                        <button onClick={() => setEditing(u)} disabled={u.role === 'super_admin'}
                          className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: u.role === 'super_admin' ? '#c1c1c1' : '#ff385c', cursor: u.role === 'super_admin' ? 'not-allowed' : 'pointer' }}>
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={canManage ? 5 : 4} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No users match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs" style={{ color: '#929292' }}>
          Hotel staff are managed per hotel — open a hotel and go to its Team. Created/edited users persist in this session only.
        </p>
      </div>

      {(adding || editing) && (
        <UserFormModal
          context={{ kind: 'company' }}
          initial={editing ?? undefined}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveUser}
        />
      )}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
