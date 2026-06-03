'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, ShieldCheck, ShieldOff, Lock } from 'lucide-react';
import {
  HOS_PROPERTIES, hotelTeam, ROLE_META, KEY_HOTEL_ROLES, HOTEL_ROLES, canManageUsers,
  type CompanyUser, type AdminRole,
} from '@hos/shared';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { useAdminAccess } from '@/lib/admin-access-context';

export default function HotelTeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const hotelCode = decodeURIComponent(code);
  const { acting } = useAdminAccess();
  const hotel = HOS_PROPERTIES.find((h) => h.code === hotelCode);

  const [overrides, setOverrides] = useState<Record<string, CompanyUser>>({});
  const [added, setAdded] = useState<CompanyUser[]>([]);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [adding, setAdding] = useState(false);

  // Access: company-level admins, or a hotel admin assigned to THIS hotel.
  const assignedHere = acting.scope.kind === 'hotels' && acting.scope.hotelCodes.includes(hotelCode);
  const canSee = acting.role === 'super_admin' || acting.role === 'company_admin' || acting.scope.kind === 'company' || assignedHere;
  const canManage = canManageUsers(acting.role) && (acting.role === 'super_admin' || acting.role === 'company_admin' || assignedHere);

  const team = useMemo(() => {
    const base = hotelTeam(hotelCode).map((u) => overrides[u.id] ?? u);
    return [...base, ...added].sort((a, b) => ROLE_META[a.role].rank - ROLE_META[b.role].rank || a.name.localeCompare(b.name));
  }, [hotelCode, overrides, added]);

  if (!hotel) {
    return (
      <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/web/admin/hotels" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotels</Link>
          <p className="mt-6 text-sm" style={{ color: '#929292' }}>Hotel “{hotelCode}” not found.</p>
        </div>
      </div>
    );
  }

  const saveUser = (u: CompanyUser) => {
    const isExisting = hotelTeam(hotelCode).some((x) => x.id === u.id);
    if (added.some((x) => x.id === u.id)) setAdded((cur) => cur.map((x) => (x.id === u.id ? u : x)));
    else if (isExisting) setOverrides((cur) => ({ ...cur, [u.id]: u }));
    else setAdded((cur) => [...cur, u]);
    // The modal closes itself (after the invite screen for new users).
  };

  const setRole = (u: CompanyUser, role: AdminRole) =>
    saveUser({ ...u, role, department: ROLE_META[role].department ?? u.department });

  const toggleHotelAdmin = (u: CompanyUser) =>
    saveUser({ ...u, isHotelAdmin: !(u.isHotelAdmin || u.isDefaultHotelAdmin || u.role === 'general_manager') });

  const toggleActive = (u: CompanyUser) => saveUser({ ...u, active: !u.active });

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <Link href={`/web/admin/hotels/${encodeURIComponent(hotelCode)}`} className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> {hotel.name}
        </Link>
        <AdminHeader title={`${hotel.name} · Team`} subtitle={`${hotelCode} · ${team.length} team members · manage hotel-level users & roles`} backHref={`/web/admin/hotels/${encodeURIComponent(hotelCode)}`} />

        {!canSee ? (
          <div className="rounded-2xl p-8 flex items-start gap-3" style={{ background: '#fff', border: '1px solid #fca5a5' }}>
            <Lock className="w-5 h-5 mt-0.5" style={{ color: '#b91c1c' }} />
            <div>
              <p className="text-base font-bold" style={{ color: '#b91c1c' }}>Not your hotel</p>
              <p className="text-sm mt-1" style={{ color: '#3f3f3f' }}>Acting as {acting.name} — not assigned to {hotel.name}.</p>
            </div>
          </div>
        ) : (
          <>
            {canManage && (
              <div className="flex justify-end">
                <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold" style={{ background: '#ff385c', color: '#fff' }}>
                  <Plus className="w-4 h-4" /> Add team member
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                    <th className={th}>Name</th>
                    <th className={th}>Department</th>
                    <th className={th}>Role</th>
                    <th className={th}>Supervisor</th>
                    <th className={th}>Status</th>
                    {canManage && <th className={th}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {team.map((u, i) => {
                    const m = ROLE_META[u.role];
                    const isAdmin = u.isHotelAdmin || u.isDefaultHotelAdmin || u.role === 'general_manager';
                    return (
                      <tr key={u.id} style={{ borderBottom: i < team.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <td className="py-3 px-4">
                          <p className="font-medium inline-flex items-center gap-1.5" style={{ color: '#222' }}>
                            {u.name}
                            {isAdmin && <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} />}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{u.email}</p>
                        </td>
                        <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{u.department ?? '—'}</td>
                        <td className="py-3 px-4">
                          {canManage ? (
                            // Inline easy role change.
                            <select
                              value={u.role}
                              onChange={(e) => setRole(u, e.target.value as AdminRole)}
                              className="text-xs font-semibold rounded px-1.5 py-1 outline-none cursor-pointer"
                              style={{ background: m.bg, color: m.color, border: 'none' }}
                            >
                              {[...KEY_HOTEL_ROLES, ...HOTEL_ROLES_REST].map((r) => (
                                <option key={r} value={r}>{ROLE_META[r].label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: m.bg, color: m.color }}>{m.label}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{u.supervisor ?? '—'}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: u.active ? '#dcfce7' : '#fee2e2', color: u.active ? '#15803d' : '#b91c1c' }}>
                            {u.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setEditing(u)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#ff385c' }} title="Edit user">
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => toggleHotelAdmin(u)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: isAdmin ? '#b45309' : '#1d4ed8' }} title={isAdmin ? 'Remove Hotel Admin' : 'Make Hotel Admin'}>
                                {isAdmin ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                {isAdmin ? 'Unadmin' : 'Make admin'}
                              </button>
                              <button onClick={() => toggleActive(u)} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>
                                {u.active ? 'Deactivate' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {team.length === 0 && (
                    <tr><td colSpan={canManage ? 6 : 5} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No team members yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs" style={{ color: '#929292' }}>
              Change a role inline from the Role column — no need to recreate the user. The hotel’s default admin is its General Manager; you can grant additional Hotel Admins. Changes persist in this session only.
            </p>
          </>
        )}
      </div>

      {(adding || editing) && (
        <UserFormModal
          context={{ kind: 'hotel', hotelCode, hotelName: hotel.name }}
          initial={editing ?? undefined}
          supervisorOptions={team.map((u) => u.name)}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={saveUser}
        />
      )}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

// Hotel roles minus the key ones (already listed first in the dropdown).
const HOTEL_ROLES_REST: AdminRole[] = HOTEL_ROLES.filter((r) => !KEY_HOTEL_ROLES.includes(r));
