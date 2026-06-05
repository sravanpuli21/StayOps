'use client';

import { useState, useMemo } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctState, createVendor } from '../_store';
import { allVendors } from '../_vendors';
import { EXPENSE_CATS, DEPTS, VENDOR_TYPE_OPTIONS } from './_constants';

export function AddVendorModal({ preHotel, onClose, onCreated }: { preHotel: string; onClose: () => void; onCreated?: (id: string) => void }) {
  const store = useAcctState();
  const [hotelId, setHotelId] = useState(preHotel);
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [type, setType] = useState<string>('Supplier');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [override, setOverride] = useState(false);

  const vendors = allVendors(store);
  const sameHotelDup = useMemo(() => hotelId && name.trim() && vendors.some((v) => v.hotelId === hotelId && v.name.toLowerCase() === name.trim().toLowerCase()), [vendors, hotelId, name]);
  const otherHotelDup = useMemo(() => name.trim() && vendors.some((v) => v.hotelId !== hotelId && v.name.toLowerCase() === name.trim().toLowerCase()), [vendors, hotelId, name]);

  const valid = hotelId && name.trim() && (!sameHotelDup || override);

  const save = (thenRule?: boolean) => {
    if (!valid) return;
    const id = `nv-${Date.now()}`;
    createVendor({ id, hotelId, name: name.trim(), legalName: legalName.trim() || undefined, type, defaultCategory: category || undefined, defaultDepartment: department || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined, status: 'active', createdFrom: 'Manual' });
    onCreated?.(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Add Vendor</h2><p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>This vendor will belong only to the selected hotel entity.</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">
          <L label="Hotel Entity *"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp} style={inpS}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></L>
          <L label="Vendor Name *"><In value={name} onChange={setName} placeholder="Home Depot" /></L>

          {sameHotelDup && !override && (
            <div className="px-3 py-2 rounded-xl text-xs flex items-start gap-2" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>A vendor with this name already exists for this hotel.<button onClick={() => setOverride(true)} className="ml-1 font-semibold underline">Create anyway</button></div>
            </div>
          )}
          {otherHotelDup && !sameHotelDup && (
            <div className="px-3 py-2 rounded-xl text-xs flex items-start gap-2" style={{ background: '#e4edfd', color: '#1d63d8' }}>
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {name.trim()} exists under another hotel, but vendors are hotel-specific in this version — this will be a separate record.
            </div>
          )}

          <L label="Legal Name (optional)"><In value={legalName} onChange={setLegalName} placeholder="Home Depot U.S.A., Inc." /></L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Vendor Type"><select value={type} onChange={(e) => setType(e.target.value)} className={inp} style={inpS}>{VENDOR_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
            <L label="Default Department"><select value={department} onChange={(e) => setDepartment(e.target.value)} className={inp} style={inpS}><option value="">Select…</option>{DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></L>
          </div>
          <L label="Default Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inp} style={inpS}><option value="">Select…</option>{EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></L>
          <div className="grid grid-cols-2 gap-3"><L label="Email"><In value={email} onChange={setEmail} /></L><L label="Phone"><In value={phone} onChange={setPhone} /></L></div>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={() => save(true)} disabled={!valid} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0', opacity: valid ? 1 : 0.5 }}>Save &amp; Create Rule</button>
          <button onClick={() => save()} disabled={!valid} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: valid ? 1 : 0.5 }}>Save Vendor</button>
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function In({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) { return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inp} style={inpS} />; }
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
