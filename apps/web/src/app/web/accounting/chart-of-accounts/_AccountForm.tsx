'use client';

import { useState, useMemo } from 'react';
import { X, Lock } from 'lucide-react';
import {
  HOTEL_ENTITIES, COA_FULL_TYPES, COA_TYPE_LABEL, COA_DETAIL_TYPES,
  reportSectionFor, type CoaFullType,
} from '@hos/shared/accounting-os';
import { createAccount, editAccount, useAcctState, type CoaAccountRecord } from '../_store';
import { accountsForHotel, type LiveAccount } from '../_coa';
import { DEPTS } from '../vendors/_constants';

const REPORT_SECTIONS = ['Current Assets', 'Fixed Assets', 'Current Liabilities', 'Long-Term Liabilities', 'Equity', 'Revenue', 'Cost of Goods Sold', 'Operating Expenses', 'Other Income', 'Other Expenses'];

/** Add or Edit an account. `editAcct` set → edit mode. */
export function AccountForm({ preHotel, editAcct, parentCode, onClose, onSaved }: {
  preHotel?: string; editAcct?: LiveAccount; parentCode?: string; onClose: () => void; onSaved?: (code: string) => void;
}) {
  const store = useAcctState();
  const isEdit = !!editAcct;
  const locked = !!editAcct?.systemLocked;
  const hasActivity = (editAcct?.txCount ?? 0) > 0;

  const [hotelId, setHotelId] = useState(editAcct?.hotelId ?? preHotel ?? '');
  const [code, setCode] = useState(editAcct?.code ?? '');
  const [name, setName] = useState(editAcct?.name ?? '');
  const [type, setType] = useState<CoaFullType>(editAcct?.type ?? 'Expense');
  const [detailType, setDetailType] = useState(editAcct?.detailType ?? '');
  const [parent, setParent] = useState(editAcct?.parent ?? parentCode ?? '');
  const [reportSection, setReportSection] = useState(editAcct?.reportSection ?? '');
  const [description, setDescription] = useState(editAcct?.description ?? '');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>(editAcct?.status === 'inactive' ? 'inactive' : 'active');
  const [errors, setErrors] = useState<string[]>([]);

  const accounts = useMemo(() => hotelId ? accountsForHotel(store, hotelId) : [], [store, hotelId]);
  const detailOptions = COA_DETAIL_TYPES[type] ?? [];
  const parentOptions = accounts.filter((a) => a.isHeader && a.type === type);

  // Auto-fill report section from type unless edited
  const effectiveReportSection = reportSection || reportSectionFor(type, detailType || undefined);

  const validate = (): string[] => {
    const e: string[] = [];
    if (!hotelId) e.push('Hotel entity is required.');
    if (!code.trim()) e.push('Account code is required.');
    if (!name.trim()) e.push('Account name is required.');
    if (!type) e.push('Account type is required.');
    if (!detailType) e.push('Detail type is required.');
    if (!effectiveReportSection) e.push('Report section is required.');
    if (!isEdit && accounts.some((a) => a.code === code.trim())) e.push('Account code already exists for this hotel.');
    if (!isEdit && accounts.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) e.push('Account name already exists for this hotel.');
    if (openingBalance && !openingDate) e.push('Opening balance date is required when opening balance is entered.');
    return e;
  };

  const save = (addAnother = false) => {
    const e = validate();
    if (e.length) { setErrors(e); return; }
    if (isEdit && editAcct) {
      editAccount(editAcct.hotelId, editAcct.code, {
        name: name.trim(),
        type: locked ? editAcct.type : type,
        detailType: hasActivity ? editAcct.detailType : detailType,
        parent: parent || undefined, reportSection: effectiveReportSection, description: description || undefined,
        status,
      }, `Edited ${editAcct.code}`);
      onSaved?.(editAcct.code);
      onClose();
      return;
    }
    const rec: CoaAccountRecord = {
      hotelId, code: code.trim(), name: name.trim(), type, detailType,
      parent: parent || undefined, reportSection: effectiveReportSection, description: description || undefined,
      status, openingBalance: openingBalance ? Number(openingBalance) : undefined, openingBalanceDate: openingDate || undefined,
    };
    createAccount(rec);
    onSaved?.(rec.code);
    if (addAnother) { setCode(''); setName(''); setDescription(''); setOpeningBalance(''); setOpeningDate(''); setErrors([]); }
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[92vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2">
            <div><h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#222' }}>{isEdit ? 'Edit Account' : 'Add Account'}{locked && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#ece4fb', color: '#6a4ec0' }}><Lock className="w-3 h-3" /> System Locked</span>}</h2><p className="text-[11px]" style={{ color: '#929292' }}>{isEdit ? 'Update this account.' : 'Create a new accounting account for this hotel entity.'}</p></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">
          {!isEdit && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#f0eefb', color: '#6a4ec0' }}>This account will belong only to the selected hotel entity.</p>}
          {hasActivity && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>This account is already used in transactions. Account type can’t change; other changes may affect reports.</p>}

          {errors.length > 0 && (
            <div className="px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5" style={{ background: '#fee2e2', color: '#b91c1c' }}>{errors.map((e) => <span key={e}>• {e}</span>)}</div>
          )}

          <Field label="Hotel Entity *">
            <select value={hotelId} disabled={isEdit} onChange={(e) => setHotelId(e.target.value)} className={inp} style={inpS}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Code *"><input value={code} disabled={isEdit && locked} onChange={(e) => setCode(e.target.value)} placeholder="6255" className={inp} style={inpS} /></Field>
            <Field label="Status">
              <select value={status} disabled={locked} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className={inp} style={inpS}><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </Field>
          </div>

          <Field label="Account Name *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering Repairs" className={inp} style={inpS} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Type *">
              <select value={type} disabled={locked || hasActivity} onChange={(e) => { setType(e.target.value as CoaFullType); setDetailType(''); setReportSection(''); }} className={inp} style={inpS}>{COA_FULL_TYPES.map((t) => <option key={t} value={t}>{COA_TYPE_LABEL[t]}</option>)}</select>
            </Field>
            <Field label="Detail Type *">
              <select value={detailType} disabled={hasActivity} onChange={(e) => setDetailType(e.target.value)} className={inp} style={inpS}><option value="">Select…</option>{detailOptions.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Parent Account">
              <select value={parent} onChange={(e) => setParent(e.target.value)} className={inp} style={inpS}><option value="">None (top level)</option>{parentOptions.map((p) => <option key={p.code} value={p.code}>{p.code} {p.name}</option>)}</select>
            </Field>
            <Field label="Report Section *">
              <select value={effectiveReportSection} onChange={(e) => setReportSection(e.target.value)} className={inp} style={inpS}>{REPORT_SECTIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
            </Field>
          </div>

          <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="px-2.5 py-2 rounded-lg text-sm outline-none w-full resize-none" style={inpS} /></Field>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Balance"><input value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" className={inp} style={inpS} /></Field>
              <Field label={`Opening Balance Date${openingBalance ? ' *' : ''}`}><input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} className={inp} style={inpS} /></Field>
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          {!isEdit && <button onClick={() => save(true)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}>Save &amp; Add Another</button>}
          <button onClick={() => save()} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>{isEdit ? 'Save Changes' : 'Save Account'}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
// re-export so other COA screens can use the same department list
export { DEPTS };
