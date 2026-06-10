'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES, TEMPLATE_ACCOUNT_COUNT, coaTemplateSummary } from '@hos/shared/accounting-os';
import { card, Badge, PageHeader, inputCls, inputStyle, PURPLE } from '../../_ui';

const TEMPLATES = [
  { name: 'Hotel Standard COA', accounts: TEMPLATE_ACCOUNT_COUNT, applied: 14, primary: true },
  { name: 'Limited Service Hotel COA', accounts: 58, applied: 0, primary: false },
  { name: 'Full Service Hotel COA', accounts: 96, applied: 0, primary: false },
  { name: 'Extended Stay Hotel COA', accounts: 64, applied: 0, primary: false },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [applyOpen, setApplyOpen] = useState(false);
  const [hotelId, setHotelId] = useState('');
  const [template, setTemplate] = useState('Hotel Standard COA');
  const [mode, setMode] = useState('Create missing accounts only');
  const [done, setDone] = useState('');

  const apply = () => { if (!hotelId) return; setDone(`Applied ${template} to ${HOTEL_ENTITIES.find((h) => h.id === hotelId)?.hotelName}.`); setApplyOpen(false); setTimeout(() => setDone(''), 2500); };

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>
      <PageHeader scope="All Hotels" title="COA Templates" subtitle="Manage reusable account structures for hotel entities." actions={<button onClick={() => setApplyOpen(true)} className="h-9 px-3.5 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Apply Template to Hotel</button>} />

      <div className="grid md:grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="rounded-2xl p-5 flex flex-col gap-2" style={card}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: '#222' }}>{t.name}</p>
              {t.primary && <Badge label="Primary" fg={PURPLE} bg="#ece4fb" />}
            </div>
            <p className="text-xs" style={{ color: '#929292' }}>{t.accounts} accounts · applied to {t.applied} hotels</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setTemplate(t.name); setApplyOpen(true); }} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#ece4fb', color: PURPLE }}>Apply to Hotel</button>
              <button className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>View Template</button>
            </div>
          </div>
        ))}
      </div>

      {done && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg" style={{ background: '#15803d', color: '#fff' }}>{done}</div>}

      {applyOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setApplyOpen(false)}>
          <div className="w-full max-w-md rounded-2xl flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Apply Chart of Accounts Template</h2><button onClick={() => setApplyOpen(false)}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <Field label="Hotel Entity"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inputCls} style={inputStyle}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></Field>
              <Field label="Template"><select value={template} onChange={(e) => setTemplate(e.target.value)} className={inputCls} style={inputStyle}>{TEMPLATES.map((t) => <option key={t.name}>{t.name}</option>)}</select></Field>
              <Field label="Apply Mode"><select value={mode} onChange={(e) => setMode(e.target.value)} className={inputCls} style={inputStyle}><option>Create missing accounts only</option><option>Add template accounts and keep custom accounts</option><option>Reset hotel COA to template</option></select></Field>
              {mode === 'Reset hotel COA to template' && <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Resetting COA can affect reports, mappings, and workbench coding.</div>}
            </div>
            <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => setApplyOpen(false)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
              <button onClick={apply} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Apply Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
