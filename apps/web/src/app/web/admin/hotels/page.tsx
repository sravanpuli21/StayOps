'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Lock } from 'lucide-react';
import {
  HOS_COMPANY, HOS_PROPERTIES, HOS_USERS,
  visibleHotels, canViewSensitive, hotelAdminsForCode,
} from '@hos/shared';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminAccess } from '@/lib/admin-access-context';

export default function AdminHotelsPage() {
  const { acting } = useAdminAccess();
  const [query, setQuery] = useState('');

  const scoped = useMemo(
    () => visibleHotels(acting.role, acting.scope, HOS_PROPERTIES),
    [acting.role, acting.scope],
  );
  const showTaxId = canViewSensitive(acting.role);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.code.toLowerCase().includes(q) ||
      h.legalName.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.managerName.toLowerCase().includes(q),
    );
  }, [scoped, query]);

  const totalRooms = filtered.reduce((s, h) => s + h.rooms, 0);

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <AdminHeader
          title="Hotels"
          subtitle={`${HOS_COMPANY.name} · ${filtered.length} of ${scoped.length} propert${scoped.length === 1 ? 'y' : 'ies'} · ${totalRooms.toLocaleString()} rooms`}
        />

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
          <input
            type="text"
            placeholder="Search name, code, legal entity, manager…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 rounded-full"
            style={{ border: '1px solid #dddddd', background: '#fff' }}
          />
        </div>

        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                <th className={th}>Code</th>
                <th className={th}>Hotel</th>
                <th className={th}>Legal Entity</th>
                <th className={th + ' text-right'}>Rooms</th>
                <th className={th}>Manager / Default Admin</th>
                <th className={th}>Tax ID</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const admins = hotelAdminsForCode(h.code, HOS_USERS);
                return (
                  <tr
                    key={h.code}
                    className="cursor-pointer hover:bg-[#fafafa] transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    onClick={() => { window.location.href = `/web/admin/hotels/${encodeURIComponent(h.code)}`; }}
                  >
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: '#6a6a6a' }}>{h.code}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium" style={{ color: '#222' }}>{h.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{h.address}</p>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h.legalName}</td>
                    <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{h.rooms}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>
                      {h.managerName}
                      {admins.length > 1 && <span className="ml-1" style={{ color: '#929292' }}>+{admins.length - 1}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono" style={{ color: '#6a6a6a' }}>
                      {showTaxId
                        ? h.taxId
                        : <span className="inline-flex items-center gap-1" style={{ color: '#c1c1c1' }}><Lock className="w-3 h-3" /> hidden</span>}
                    </td>
                    <td className="pr-4"><ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#c1c1c1' }} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No hotels match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!showTaxId && (
          <p className="text-xs inline-flex items-center gap-1" style={{ color: '#929292' }}>
            <Lock className="w-3 h-3" /> Tax IDs are company-level information — visible to Super Admin and Company Admin only.
          </p>
        )}
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
