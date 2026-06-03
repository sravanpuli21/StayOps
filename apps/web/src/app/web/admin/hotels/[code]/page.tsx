'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, MapPin, Phone, Calendar, BedDouble, Building2, ShieldCheck } from 'lucide-react';
import {
  HOS_PROPERTIES, HOS_USERS, HOS_COMPANY,
  canViewSensitive, hotelAdminsForCode, ROLE_META, scopeLabel,
} from '@hos/shared';
import { useAdminAccess } from '@/lib/admin-access-context';
import { LogoUpload } from '@/components/admin/LogoUpload';

export default function HotelDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { acting } = useAdminAccess();
  const hotel = HOS_PROPERTIES.find((h) => h.code === decodeURIComponent(code));

  if (!hotel) {
    return (
      <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/web/admin/hotels" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
            <ArrowLeft className="w-4 h-4" /> Hotels
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#929292' }}>Hotel “{code}” not found.</p>
        </div>
      </div>
    );
  }

  // Hotel Admins restricted to their own hotels.
  const canSee = acting.role === 'super_admin' || acting.role === 'company_admin'
    || (acting.scope.kind === 'hotels' && acting.scope.hotelCodes.includes(hotel.code));
  // Logo editable by company admins, or a hotel admin/GM assigned to this hotel.
  const canManageHotel = acting.role === 'super_admin' || acting.role === 'company_admin'
    || ((acting.role === 'hotel_admin' || acting.role === 'general_manager')
        && acting.scope.kind === 'hotels' && acting.scope.hotelCodes.includes(hotel.code));
  const showTaxId = canViewSensitive(acting.role);
  const admins = hotelAdminsForCode(hotel.code, HOS_USERS);
  // Company/multi-property users who can also reach this hotel.
  const otherUsers = HOS_USERS.filter((u) =>
    u.role !== 'hotel_admin' && (
      u.scope.kind === 'company' ||
      (u.scope.kind === 'hotels' && u.scope.hotelCodes.includes(hotel.code))
    ),
  );

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Link href="/web/admin/hotels" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Hotels
        </Link>

        {!canSee ? (
          <div className="rounded-2xl p-8 flex items-start gap-3" style={{ background: '#fff', border: '1px solid #fca5a5' }}>
            <Lock className="w-5 h-5 mt-0.5" style={{ color: '#b91c1c' }} />
            <div>
              <p className="text-base font-bold" style={{ color: '#b91c1c' }}>Not your hotel</p>
              <p className="text-sm mt-1" style={{ color: '#3f3f3f' }}>
                You&apos;re acting as <strong>{acting.name}</strong> ({ROLE_META[acting.role].label}), who isn&apos;t assigned to {hotel.name}. Switch acting-as to a company-level role or this hotel&apos;s admin to view it.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
              <LogoUpload
                storageKey={`hotel:${hotel.code}`}
                size={56}
                editable={canManageHotel}
                fallback={<Building2 className="w-7 h-7" style={{ color: '#ff385c' }} />}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{hotel.name}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full font-mono" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>{hotel.code}</span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{HOS_COMPANY.name} · {hotel.legalName}</p>
              </div>
            </div>

            {/* Property details */}
            <Section title="Property Details">
              <Detail icon={<Building2 className="w-4 h-4" />} label="Legal Entity" value={hotel.legalName} />
              <Detail icon={<MapPin className="w-4 h-4" />} label="Address" value={hotel.address} />
              <Detail icon={<Phone className="w-4 h-4" />} label="Phone" value={hotel.phone} />
              <Detail icon={<BedDouble className="w-4 h-4" />} label="Rooms" value={String(hotel.rooms)} />
              <Detail icon={<Calendar className="w-4 h-4" />} label="Opening Date" value={hotel.openingDate} />
              <Detail
                icon={<Lock className="w-4 h-4" />}
                label="Tax ID"
                value={showTaxId ? hotel.taxId : 'Hidden — company-level only'}
                sensitive={!showTaxId}
              />
            </Section>

            {/* Hotel Admins */}
            <Section title={`Hotel Admins · ${admins.length}`}>
              <div className="col-span-2 flex flex-col gap-2">
                {admins.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" style={{ color: '#1d4ed8' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#222' }}>{a.name}</p>
                        <p className="text-[11px]" style={{ color: '#929292' }}>{a.email}</p>
                      </div>
                    </div>
                    {a.isDefaultHotelAdmin && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        Default (Manager)
                      </span>
                    )}
                  </div>
                ))}
                <Link href={`/web/admin/hotels/${encodeURIComponent(hotel.code)}/team`} className="text-xs font-semibold inline-flex items-center gap-1 mt-1" style={{ color: '#ff385c' }}>
                  Manage team &amp; hotel admins →
                </Link>
              </div>
            </Section>

            {/* Other users with access */}
            {otherUsers.length > 0 && (
              <Section title="Other Users With Access">
                <div className="col-span-2 flex flex-col gap-2">
                  {otherUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#222' }}>{u.name}</p>
                        <p className="text-[11px]" style={{ color: '#929292' }}>{scopeLabel(u.scope, HOS_PROPERTIES)}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: ROLE_META[u.role].bg, color: ROLE_META[u.role].color }}>
                        {ROLE_META[u.role].label}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Detail({ icon, label, value, sensitive }: { icon: React.ReactNode; label: string; value: string; sensitive?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1" style={{ color: '#929292' }}>
        {icon} {label}
      </p>
      <p className="text-sm mt-0.5" style={{ color: sensitive ? '#c1c1c1' : '#222', fontStyle: sensitive ? 'italic' : 'normal' }}>{value}</p>
    </div>
  );
}
