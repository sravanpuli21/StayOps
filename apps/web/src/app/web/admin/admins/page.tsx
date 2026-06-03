'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, Plus, X, Lock } from 'lucide-react';
import {
  HOS_COMPANY, HOS_PROPERTIES, HOS_USERS, visibleHotels,
} from '@hos/shared';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminAccess } from '@/lib/admin-access-context';

interface ExtraAdmin { id: string; name: string; email: string; hotelCode: string }

export default function HotelAdminsPage() {
  const { acting } = useAdminAccess();
  // In-session additions (persistence is a documented backend task).
  const [extra, setExtra] = useState<ExtraAdmin[]>([]);
  const [addFor, setAddFor] = useState<string | null>(null);

  const canManage = acting.role === 'super_admin' || acting.role === 'company_admin';
  const hotels = useMemo(
    () => visibleHotels(acting.role, acting.scope, HOS_PROPERTIES),
    [acting.role, acting.scope],
  );

  const adminsFor = (code: string): { name: string; email: string; isDefault: boolean }[] => {
    const seeded = HOS_USERS
      .filter((u) => u.role === 'hotel_admin' && u.scope.kind === 'hotels' && u.scope.hotelCodes.includes(code))
      .map((u) => ({ name: u.name, email: u.email, isDefault: !!u.isDefaultHotelAdmin }));
    const added = extra.filter((e) => e.hotelCode === code).map((e) => ({ name: e.name, email: e.email, isDefault: false }));
    return [...seeded, ...added];
  };

  const removeExtra = (id: string) => setExtra((cur) => cur.filter((e) => e.id !== id));

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <AdminHeader
          title="Hotel Admins"
          subtitle={`${HOS_COMPANY.name} · each hotel's manager is its default admin · add more per hotel`}
        />

        {!canManage && (
          <div className="rounded-2xl p-4 flex items-start gap-2" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Lock className="w-4 h-4 mt-0.5" style={{ color: '#92400e' }} />
            <p className="text-xs" style={{ color: '#78350f' }}>
              You&apos;re acting as a hotel-level role — you can view admins for your assigned hotel(s) but only Super Admin / Company Admin can add or remove admins.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {hotels.map((h) => {
            const admins = adminsFor(h.code);
            return (
              <div key={h.code} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-base font-semibold" style={{ color: '#222' }}>{h.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{h.code} · {admins.length} admin{admins.length === 1 ? '' : 's'}</p>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => setAddFor(h.code)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
                      style={{ background: '#222', color: '#fff' }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add admin
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  {admins.map((a, i) => {
                    const extraRow = extra.find((e) => e.hotelCode === h.code && e.name === a.name && !a.isDefault);
                    return (
                      <div key={`${a.email}-${i}`} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#1d4ed8' }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{a.name}</p>
                            <p className="text-[11px] truncate" style={{ color: '#929292' }}>{a.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {a.isDefault ? (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                              Default (Manager)
                            </span>
                          ) : canManage && extraRow ? (
                            <button onClick={() => removeExtra(extraRow.id)} className="text-[#b91c1c] hover:opacity-70" title="Remove admin">
                              <X className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs" style={{ color: '#929292' }}>
          Added admins are kept in this session only — persistence + real invites are a backend task.
        </p>
      </div>

      {addFor && (
        <AddAdminModal
          hotelName={HOS_PROPERTIES.find((h) => h.code === addFor)?.name ?? addFor}
          onClose={() => setAddFor(null)}
          onAdd={(name, email) => {
            setExtra((cur) => [...cur, { id: `extra-${Date.now()}`, name, email, hotelCode: addFor }]);
            setAddFor(null);
          }}
        />
      )}
    </div>
  );
}

function AddAdminModal({ hotelName, onClose, onAdd }: { hotelName: string; onClose: () => void; onAdd: (name: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>Add Hotel Admin</h2>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{hotelName}</p>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (valid) onAdd(name.trim(), email.trim()); }} className="px-6 py-5 flex flex-col gap-4">
          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Jordan Lee" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="jordan@hosmgmt.com" type="email" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>Cancel</button>
            <button type="submit" disabled={!valid} className="h-9 px-4 rounded-lg text-sm font-semibold transition-opacity" style={{ background: '#ff385c', color: '#fff', opacity: valid ? 1 : 0.5 }}>Add admin</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 px-3 rounded-xl outline-none focus:ring-2 focus:ring-[#ff385c] text-sm"
        style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}
      />
    </div>
  );
}
