'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, Badge, Building2, Calendar, DollarSign, User, Camera, Trash2 } from 'lucide-react';
import { formatCurrency } from '@hos/shared';
import { useSravanProfile } from '@/lib/sravan-data';

const DP_STORAGE_KEY = 'sravan.profile.dp';

export default function SravanProfilePage() {
  const SRAVAN_EMPLOYEE = useSravanProfile() as any;
  const [dp, setDp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDp(window.localStorage.getItem(DP_STORAGE_KEY));
  }, []);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setDp(dataUrl);
      try { window.localStorage.setItem(DP_STORAGE_KEY, dataUrl); } catch { /* quota — keep in memory */ }
    };
    reader.readAsDataURL(file);
  };

  const removeDp = () => {
    setDp(null);
    window.localStorage.removeItem(DP_STORAGE_KEY);
  };

  if (!SRAVAN_EMPLOYEE) return <div className="p-6 text-sm text-[#6a6a6a]">Loading…</div>;
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Your employee details · contact HR to update pay rate or direct deposit
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl p-6 flex items-center gap-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden relative"
            style={{ background: '#0f766e' }}
            title="Change photo"
          >
            {dp ? (
              <img src={dp} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              'SP'
            )}
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <Camera className="w-6 h-6 text-white" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: '#222222' }}>{SRAVAN_EMPLOYEE.name}</h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{SRAVAN_EMPLOYEE.role} · {SRAVAN_EMPLOYEE.hotel}</p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>Employee ID · {SRAVAN_EMPLOYEE.employeeId}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#f7f7f7', color: '#222', border: '1px solid #dddddd' }}
            >
              <Camera className="w-3.5 h-3.5" /> {dp ? 'Change photo' : 'Add photo'}
            </button>
            {dp && (
              <button
                type="button"
                onClick={removeDp}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: '#fff', color: '#b91c1c', border: '1px solid #fca5a5' }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
          {error && <p className="text-xs mt-1.5" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
      </div>

      {/* Contact */}
      <Section title="Contact">
        <Row icon={Mail}  label="Email" value={SRAVAN_EMPLOYEE.email} />
        <Row icon={Phone} label="Phone" value={SRAVAN_EMPLOYEE.phone} />
      </Section>

      {/* Employment */}
      <Section title="Employment">
        <Row icon={Building2} label="Property"    value={`${SRAVAN_EMPLOYEE.hotel} (${SRAVAN_EMPLOYEE.hotelCode})`} />
        <Row icon={User}      label="Supervisor"  value={SRAVAN_EMPLOYEE.supervisor} />
        <Row icon={Calendar}  label="Hired"       value={SRAVAN_EMPLOYEE.hireDate} />
        <Row icon={Badge}     label="Employee ID" value={SRAVAN_EMPLOYEE.employeeId} />
      </Section>

      {/* Pay */}
      <Section title="Pay">
        <Row icon={DollarSign} label="Pay Rate"     value={`${formatCurrency(SRAVAN_EMPLOYEE.payRate)} / hr`} />
        <Row icon={Calendar}   label="Pay Period"   value={SRAVAN_EMPLOYEE.payPeriod} />
        <Row icon={Calendar}   label="Next Pay Day" value={SRAVAN_EMPLOYEE.nextPayDate} />
      </Section>

      <p className="text-xs" style={{ color: '#929292' }}>
        To update your address, W-4, direct deposit, or emergency contact, visit the HR portal or reach out to HR at hr@hosmanagement.co.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h3>
      </div>
      <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center px-5 py-3 gap-4">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
      <p className="text-xs font-medium w-28 flex-shrink-0" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-sm flex-1" style={{ color: '#222222' }}>{value}</p>
    </div>
  );
}
