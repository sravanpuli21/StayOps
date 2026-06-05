'use client';

import { useState } from 'react';
import { X, Lock, Eye } from 'lucide-react';
import { useAcctState, editEntity, type EntityFields } from '../_store';
import { oneEntity, maskTaxId } from '../_entities';

export function EditEntityDrawer({ hotelId, onClose }: { hotelId: string; onClose: () => void }) {
  const store = useAcctState();
  const h = oneEntity(store, hotelId);
  const [f, setF] = useState<Partial<EntityFields>>({
    hotelName: h?.hotelName, legalEntity: h?.legalEntity, propertyCode: h?.propertyCode,
    address: h?.address, phone: h?.phone, rooms: h?.rooms, openingDate: h?.openingDate,
    city: h?.city, state: h?.state, manager: h?.manager, taxId: h?.taxId,
  });
  const [taxEditable, setTaxEditable] = useState(false);
  const [toast, setToast] = useState(false);
  if (!h) return null;

  const set = (k: keyof EntityFields, v: any) => setF((p) => ({ ...p, [k]: v }));
  const valid = (f.hotelName ?? '').trim() && (f.legalEntity ?? '').trim() && (f.propertyCode ?? '').trim();

  const save = () => {
    if (!valid) return;
    editEntity(hotelId, f, 'Edited from drawer');
    setToast(true);
    setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>Edit Hotel Entity</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5 flex-1">
          <Group title="Basic Info">
            <F label="Hotel / Business Name"><I value={f.hotelName ?? ''} onChange={(v) => set('hotelName', v)} /></F>
            <F label="Legal Entity Name"><I value={f.legalEntity ?? ''} onChange={(v) => set('legalEntity', v)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Property Code"><I value={f.propertyCode ?? ''} onChange={(v) => set('propertyCode', v)} /></F>
              <F label="Status"><Sel value={h.status} options={['active', 'inactive', 'archived']} onChange={() => {}} /></F>
            </div>
          </Group>

          <Group title="Property Info">
            <F label="Address"><I value={f.address ?? ''} onChange={(v) => set('address', v)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="City"><I value={f.city ?? ''} onChange={(v) => set('city', v)} /></F>
              <F label="State"><I value={f.state ?? ''} onChange={(v) => set('state', v)} /></F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Phone"><I value={f.phone ?? ''} onChange={(v) => set('phone', v)} /></F>
              <F label="Rooms"><I value={String(f.rooms ?? '')} onChange={(v) => set('rooms', Number(v) || 0)} /></F>
            </div>
            <F label="Opening Date"><I value={f.openingDate ?? ''} onChange={(v) => set('openingDate', v)} type="date" /></F>
          </Group>

          <Group title="Manager Info">
            <F label="Manager Name"><I value={f.manager ?? ''} onChange={(v) => set('manager', v)} /></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Manager Email"><I value={f.managerEmail ?? ''} onChange={(v) => set('managerEmail', v)} /></F>
              <F label="Manager Phone"><I value={f.managerPhone ?? ''} onChange={(v) => set('managerPhone', v)} /></F>
            </div>
          </Group>

          <Group title="Sensitive Info">
            <F label="Tax ID">
              <div className="flex items-center gap-2">
                {taxEditable
                  ? <I value={f.taxId ?? ''} onChange={(v) => set('taxId', v)} />
                  : <div className="flex-1 h-9 px-2.5 rounded-lg flex items-center text-sm font-mono" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{maskTaxId(f.taxId ?? '')}</div>}
                {!taxEditable && <button onClick={() => { if (confirm('Tax ID is sensitive accounting information. Changes will be recorded in the audit log. Continue?')) setTaxEditable(true); }} className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: '#fee2e2', color: '#b91c1c' }}><Lock className="w-3 h-3" /> Edit Tax ID</button>}
              </div>
            </F>
          </Group>
        </div>

        <div className="px-5 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
          {toast && <span className="text-xs font-semibold mr-auto self-center" style={{ color: '#15803d' }}>Hotel entity updated ✓</span>}
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={save} disabled={!valid} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: valid ? 1 : 0.5 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5"><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a4ec0' }}>{title}</p>{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function I({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />;
}
function Sel({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full capitalize" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
