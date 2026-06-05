'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, setCoaMapping } from '../../_store';
import { bankMappingRows, cardMappingRows, accountsForHotel, vendorMapStub, type MappingRow } from './_mapping-data';
import { card, Badge } from '../../_ui';
import { CoaTabs } from '../_shared';

const MAP_BADGE = (s: MappingRow['status']) => s === 'mapped'
  ? { label: 'Mapped', fg: '#15803d', bg: '#dcfce7' }
  : s === 'missing' ? { label: 'Missing Mapping', fg: '#b91c1c', bg: '#fee2e2' }
  : { label: 'Needs Review', fg: '#b45309', bg: '#fef3c7' };

export default function MappingPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const [editRow, setEditRow] = useState<{ row: MappingRow; type: 'bank' | 'card' } | null>(null);

  const hotelIds = selection.kind === 'hotel' ? [selection.hotelId] : HOTEL_ENTITIES.map((h) => h.id);
  const banks = hotelIds.flatMap((id) => bankMappingRows(store, id));
  const cards = hotelIds.flatMap((id) => cardMappingRows(store, id));
  const single = selection.kind === 'hotel';

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />
      <div className="flex items-center gap-2">
        <Badge label={single ? 'One Hotel' : 'All Hotels'} fg={single ? '#1d4ed8' : '#6a4ec0'} bg={single ? '#dbeafe' : '#ece4fb'} />
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Account Mapping</h1><p className="text-sm" style={{ color: '#929292' }}>Map bank accounts, credit cards, vendors, and transaction types to the correct accounting accounts.</p></div>
      </div>
      <p className="text-xs -mt-2 px-3 py-2 rounded-lg" style={{ background: '#f0eefb', color: '#6a4ec0' }}>Mapping prevents broken posting: bank accounts must map to asset accounts, credit cards to liability accounts.</p>

      {/* A. Bank account mapping */}
      <Section title="Bank Account Mapping">
        <MapTable
          rows={banks} cols={['Hotel', 'Bank Account', 'Bank', 'Last 4', 'Current COA Account', 'Status', 'Action']}
          onEdit={(row) => setEditRow({ row, type: 'bank' })}
        />
      </Section>

      {/* B. Credit card mapping */}
      <Section title="Credit Card Mapping">
        <MapTable
          rows={cards} cols={['Hotel', 'Credit Card', 'Issuer', 'Last 4', 'Current Liability Account', 'Status', 'Action']}
          onEdit={(row) => setEditRow({ row, type: 'card' })}
        />
      </Section>

      {/* C. Default transaction type mapping */}
      <Section title="Default Transaction Type Mapping">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Transaction Type', 'Default Debit Account', 'Default Credit Account', 'Applies To', 'Status'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                ['Bank Fee', '6650 Bank Fees', 'Selected Bank Account', 'All hotels'],
                ['Credit Card Expense', 'Selected Expense Category', '2100 Credit Cards Payable', 'All hotels'],
                ['Revenue Deposit', 'Operating Checking', '4000 Room Revenue', 'All hotels'],
                ['Credit Card Payment', '2100 Credit Cards Payable', 'Selected Bank Account', 'All hotels'],
                ['Payroll', '6000 Payroll Expenses', 'Payroll Checking', 'All hotels'],
              ].map(([type, dr, cr, applies], i, arr) => (
                <tr key={type} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{type}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{dr}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{cr}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{applies}</td>
                  <td className="py-2.5 px-3"><Badge label="Mapped" fg="#15803d" bg="#dcfce7" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* D. Vendor default mapping */}
      <Section title="Vendor Default Mapping">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Vendor', 'Hotel', 'Default Category', 'Default Department', 'Status'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {vendorMapStub(hotelIds).map((v, i, arr) => (
                <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{v.vendor}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(v.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{v.category}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.department}</td>
                  <td className="py-2.5 px-3"><Badge {...MAP_BADGE(v.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {editRow && <EditMappingDrawer info={editRow} hotelId={editRow.row.hotelId} onClose={() => setEditRow(null)} />}
    </div>
  );

  function MapTable({ rows, cols, onEdit }: { rows: MappingRow[]; cols: string[]; onEdit: (r: MappingRow) => void }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{cols.map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.recordId} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(r.hotelId)?.propertyCode}</td>
                <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{r.name}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.institution}</td>
                <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{r.last4}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{r.currentCode ? `${r.currentCode} ${r.currentName ?? ''}` : 'Not mapped'}</td>
                <td className="py-2.5 px-3"><Badge {...MAP_BADGE(r.status)} /></td>
                <td className="py-2.5 px-3"><button onClick={() => onEdit(r)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{r.status === 'missing' ? 'Add Mapping' : 'Edit Mapping'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2></div>{children}</div>;
}

function EditMappingDrawer({ info, hotelId, onClose }: { info: { row: MappingRow; type: 'bank' | 'card' }; hotelId: string; onClose: () => void }) {
  const store = useAcctState();
  const { row, type } = info;
  const accounts = accountsForHotel(store, hotelId).filter((a) => !a.isHeader && (type === 'bank' ? a.type === 'Asset' : a.type === 'Liability'));
  const [code, setCode] = useState(row.currentCode ?? '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    if (!code) { setError('Mapping account is required.'); return; }
    setCoaMapping(row.recordId, code, hotelId, `${row.name} → ${type === 'bank' ? 'asset' : 'liability'}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Edit Mapping</h2><p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(hotelId)?.hotelName}</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
          <Field label="Record"><p className="text-sm" style={{ color: '#222' }}>{row.name} · {row.institution} ••{row.last4}</p></Field>
          <Field label="Current Mapping"><p className="text-sm" style={{ color: '#6a6a6a' }}>{row.currentCode ? `${row.currentCode} ${row.currentName ?? ''}` : 'Not mapped'}</p></Field>
          <Field label={`New Account (${type === 'bank' ? 'must be an asset account' : 'must be a liability account'}) *`}>
            <select value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} className="h-9 px-2.5 rounded-lg text-sm w-full" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>
              <option value="">Select account…</option>
              {accounts.map((a) => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="px-2.5 py-2 rounded-lg text-sm w-full resize-none" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} /></Field>
          {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={save} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Save Mapping</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
