'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES, COA_FULL_TYPES, COA_TYPE_LABEL, COA_DETAIL_TYPES, type CoaFullType } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../../_context';
import { card, PageHeader, inputCls, inputStyle, PURPLE } from '../../../_ui';

const SECTION_FOR: Record<CoaFullType, string> = {
  Asset: 'Current Assets', Liability: 'Current Liabilities', Equity: 'Equity', Revenue: 'Revenue',
  COGS: 'Cost of Goods Sold', Expense: 'Operating Expenses', 'Other Income': 'Other Income', 'Other Expense': 'Other Expenses',
};

export default function NewAccountPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const [hotelId, setHotelId] = useState(selection.kind === 'hotel' ? selection.hotelId : '');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CoaFullType>('Expense');
  const [detail, setDetail] = useState('');
  const [desc, setDesc] = useState('');
  const [opening, setOpening] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const normalBalance = ['Asset', 'Expense', 'COGS', 'Other Expense'].includes(type) ? 'Debit' : 'Credit';

  const save = () => {
    if (!hotelId) return setError('Hotel entity is required.');
    if (!code) return setError('Account code is required.');
    if (!name) return setError('Account name is required.');
    if (!detail) return setError('Detail type is required.');
    if (opening && !openingDate) return setError('Opening balance date is required when opening balance is entered.');
    setError(''); setDone(true);
  };

  if (done) return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/chart-of-accounts')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</button>
      <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={card}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
        <h1 className="text-lg font-bold" style={{ color: '#222' }}>Account created successfully.</h1>
        <p className="text-sm" style={{ color: '#6a6a6a' }}>{code} {name} was added to this hotel's Chart of Accounts and is available in the workbench.</p>
        <button onClick={() => router.push('/web/accounting/chart-of-accounts')} className="h-9 px-4 rounded-xl text-xs font-semibold mt-2" style={{ background: PURPLE, color: '#fff' }}>Back to Chart of Accounts</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/chart-of-accounts')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</button>
      <PageHeader title="Add Account" subtitle="Create a new account for this hotel's Chart of Accounts." />
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#f6f4fd', color: PURPLE, border: '1px solid #e3d9fb' }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>This account will belong only to the selected hotel entity.</span>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-4" style={card}>
        <Field label="Hotel Entity *"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inputCls} style={inputStyle}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></Field>
        <Field label="Account Code *"><input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. 6255" /></Field>
        <Field label="Account Name *"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Door Lock Repairs" /></Field>
        <Field label="Account Type *"><select value={type} onChange={(e) => { setType(e.target.value as CoaFullType); setDetail(''); }} className={inputCls} style={inputStyle}>{COA_FULL_TYPES.map((t) => <option key={t} value={t}>{COA_TYPE_LABEL[t]}</option>)}</select></Field>
        <Field label="Detail Type *"><select value={detail} onChange={(e) => setDetail(e.target.value)} className={inputCls} style={inputStyle}><option value="">Select…</option>{COA_DETAIL_TYPES[type].map((d) => <option key={d}>{d}</option>)}</select></Field>
        <Field label="Normal Balance"><input value={normalBalance} disabled className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} /></Field>
        <Field label="Report Section"><input value={SECTION_FOR[type]} disabled className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} /></Field>
        <Field label="Description"><input value={desc} onChange={(e) => setDesc(e.target.value)} className={inputCls} style={inputStyle} placeholder="Optional" /></Field>
        <Field label="Opening Balance"><input value={opening} onChange={(e) => setOpening(e.target.value)} className={inputCls} style={inputStyle} placeholder="Optional" /></Field>
        <Field label="Opening Balance Date"><input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
      </div>
      {error && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {error}</div>}
      <div className="flex justify-end gap-2">
        <button onClick={() => router.push('/web/accounting/chart-of-accounts')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
        <button onClick={save} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Save Account</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
