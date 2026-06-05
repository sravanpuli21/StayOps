'use client';

import { useState } from 'react';
import { Upload, Download, X, FileText } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, addDoc } from '../_store';
import { card, Badge, fmtDate } from '../_ui';

const DOC_TYPES = ['Bank Statement', 'Credit Card Statement', 'Receipt', 'Reconciliation Report', 'Exported Report', 'Supporting Document'];

const SEED_DOCS = [
  { id: 'd1', name: 'Operating Checking · May 2026.pdf', type: 'Bank Statement', hotelId: 'GA989', vendor: '', dateIso: '2026-05-31', uploadedBy: 'Sanjay Narsee' },
  { id: 'd2', name: 'Home Depot #1234 receipt.jpg', type: 'Receipt', hotelId: 'GA989', vendor: 'HOME DEPOT', dateIso: '2026-05-14', uploadedBy: 'Sanjay Narsee' },
  { id: 'd3', name: 'Corporate Card · May 2026.pdf', type: 'Credit Card Statement', hotelId: 'BTRCI', vendor: '', dateIso: '2026-05-28', uploadedBy: 'Sanjay Narsee' },
  { id: 'd4', name: 'Reconciliation · Operating Checking.pdf', type: 'Reconciliation Report', hotelId: 'SAVMT', vendor: '', dateIso: '2026-05-31', uploadedBy: 'Sanjay Narsee' },
];

export default function DocumentsPage() {
  const { selection } = useAcctOs();
  const state = useAcctState();
  const [type, setType] = useState('all');
  const [open, setOpen] = useState(false);

  const docs = [...state.docs, ...SEED_DOCS]
    .filter((d) => selection.kind === 'all' || d.hotelId === selection.hotelId)
    .filter((d) => type === 'all' || d.type === type);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Documents</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Store receipts, statements, reconciliation reports, and accounting documents by hotel.</p></div>
        <div className="flex gap-2">
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Upload className="w-4 h-4" /> Upload Document</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...DOC_TYPES].map((t) => (
          <button key={t} onClick={() => setType(t)} className="h-8 px-3 rounded-full text-xs font-semibold" style={{ background: type === t ? '#222' : '#fff', color: type === t ? '#fff' : '#6a6a6a', border: `1px solid ${type === t ? '#222' : '#dddddd'}` }}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Document', 'Type', 'Hotel', 'Vendor', 'Date', 'Uploaded By', ''].map((h) => <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={d.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < docs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2.5 px-3"><span className="inline-flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: '#6a4ec0' }} /><span className="text-sm font-medium" style={{ color: '#222' }}>{d.name}</span></span></td>
                <td className="py-2.5 px-3"><Badge label={d.type} fg="#6a6a6a" bg="#f0f0f0" /></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{getEntity(d.hotelId)?.propertyCode ?? '—'}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{d.vendor || '—'}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(d.dateIso)}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{d.uploadedBy}</td>
                <td className="py-2.5 px-3"><button className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button></td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm" style={{ color: '#929292' }}>No documents yet. Upload statements and receipts to populate.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && <UploadDocModal onClose={() => setOpen(false)} preHotel={selection.kind === 'hotel' ? selection.hotelId : ''} />}
    </div>
  );
}

function UploadDocModal({ onClose, preHotel }: { onClose: () => void; preHotel: string }) {
  const [name, setName] = useState('');
  const [hotelId, setHotelId] = useState(preHotel);
  const [type, setType] = useState(DOC_TYPES[0]);
  const valid = name.trim() && hotelId;
  const save = () => { if (!valid) return; addDoc({ name: name.trim(), type, hotelId, dateIso: '2026-05-31', uploadedBy: 'Sanjay Narsee' }); onClose(); };
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Upload Document</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <L label="File"><label className="flex items-center justify-center gap-2 py-5 rounded-xl cursor-pointer" style={{ border: '2px dashed #dddddd', background: '#fafafa' }}><Upload className="w-5 h-5" style={{ color: '#6a4ec0' }} /><span className="text-xs" style={{ color: name ? '#222' : '#929292' }}>{name || 'Choose a file'}</span><input type="file" className="hidden" onChange={(e) => setName(e.target.files?.[0]?.name ?? 'document.pdf')} /></label></L>
          <L label="Hotel Entity"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp} style={inpS}><option value="">Select…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select></L>
          <L label="Document Type"><select value={type} onChange={(e) => setType(e.target.value)} className={inp} style={inpS}>{DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={save} disabled={!valid} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: valid ? 1 : 0.5 }}>Upload</button>
        </div>
      </div>
    </div>
  );
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
