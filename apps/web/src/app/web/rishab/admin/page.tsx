'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, ShieldCheck, ShieldOff, Building2, MapPin, BedDouble } from 'lucide-react';
import {
  HOS_PROPERTIES, hotelTeam, hotelAdminsForCode, ROLE_META, KEY_HOTEL_ROLES, HOTEL_ROLES,
  type CompanyUser, type AdminRole,
} from '@hos/shared';
import { UserFormModal } from '@/components/admin/UserFormModal';

// Rishab is the GM of Home2 Baton Rouge.
const HOTEL_CODE = 'BTRCI';
const HOTEL_ROLES_REST: AdminRole[] = HOTEL_ROLES.filter((r) => !KEY_HOTEL_ROLES.includes(r));

export default function RishabAdminPage() {
  const hotel = HOS_PROPERTIES.find((h) => h.code === HOTEL_CODE)!;

  const [overrides, setOverrides] = useState<Record<string, CompanyUser>>({});
  const [added, setAdded] = useState<CompanyUser[]>([]);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [adding, setAdding] = useState(false);

  const team = useMemo(() => {
    const base = hotelTeam(HOTEL_CODE).map((u) => overrides[u.id] ?? u);
    return [...base, ...added].sort((a, b) => ROLE_META[a.role].rank - ROLE_META[b.role].rank || a.name.localeCompare(b.name));
  }, [overrides, added]);

  const adminCount = hotelAdminsForCode(HOTEL_CODE, team).length;

  const saveUser = (u: CompanyUser) => {
    const isExisting = hotelTeam(HOTEL_CODE).some((x) => x.id === u.id);
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Admin · Team & Roles</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotel.name} · manage your hotel’s users and roles
        </p>
      </div>

      {/* Hotel summary */}
      <div className="rounded-2xl p-5 flex items-center gap-4 flex-wrap" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff' }}>
          <Building2 className="w-6 h-6" style={{ color: '#1e40af' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold" style={{ color: '#222' }}>{hotel.name}</p>
          <div className="flex items-center gap-4 mt-0.5 text-xs flex-wrap" style={{ color: '#929292' }}>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {hotel.address}</span>
            <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" /> {hotel.rooms} rooms</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Stat label="Team" value={team.length} />
          <Stat label="Hotel Admins" value={adminCount} />
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Team members</h2>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold" style={{ background: '#1e40af', color: '#fff' }}>
          <Plus className="w-4 h-4" /> Add team member
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Name</th>
              <th className={th}>Department</th>
              <th className={th}>Role</th>
              <th className={th}>Supervisor</th>
              <th className={th}>Status</th>
              <th className={th}>Action</th>
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
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{u.supervisor ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: u.active ? '#dcfce7' : '#fee2e2', color: u.active ? '#15803d' : '#b91c1c' }}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditing(u)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#1e40af' }} title="Edit user">
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
                </tr>
              );
            })}
            {team.length === 0 && (
              <tr><td colSpan={6} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No team members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs" style={{ color: '#929292' }}>
        As GM you’re the default Hotel Admin. Change any role inline — no need to recreate the user. Changes persist in this session only.
      </p>

      {(adding || editing) && (
        <UserFormModal
          context={{ kind: 'hotel', hotelCode: HOTEL_CODE, hotelName: hotel.name }}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold" style={{ color: '#222' }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
    </div>
  );
}
