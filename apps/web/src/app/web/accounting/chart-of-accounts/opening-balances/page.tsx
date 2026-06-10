'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity, COA_TEMPLATE } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { hotelLabel } from '../../_domain';
import { card, money, Badge, PageHeader, inputStyle, PURPLE } from '../../_ui';

const SEED_MISSING = ['SAVMT', 'JAXTX'];

export default function OpeningBalancesPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  if (hotelId) return <Worksheet hotelId={hotelId} />;
  return <Portfolio />;
}

function Portfolio() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>
      <PageHeader scope="All Hotels" title="Opening Balances" subtitle="Enter starting balances before StayOps begins accounting for each hotel." />
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Opening Date', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {HOTEL_ENTITIES.map((h) => {
              const missing = SEED_MISSING.includes(h.propertyCode);
              return (
                <tr key={h.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => { selectHotel(h.id); router.push('/web/accounting/chart-of-accounts/opening-balances'); }}>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{missing ? '—' : 'Jan 1, 2026'}</td>
                  <td className="py-2.5 px-3">{missing ? <Badge label="Missing" fg="#b91c1c" bg="#fee2e2" /> : <Badge label="Posted" fg="#15803d" bg="#dcfce7" />}</td>
                  <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{missing ? 'Enter Balances' : 'View'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Worksheet({ hotelId }: { hotelId: string }) {
  const h = getEntity(hotelId)!;
  const accounts = COA_TEMPLATE.filter((a) => !a.isHeader && ['Asset', 'Liability', 'Equity'].includes(a.type)).slice(0, 14);
  const [vals, setVals] = useState<Record<string, { debit: string; credit: string }>>({});
  const [date, setDate] = useState('2026-01-01');

  const totalDr = accounts.reduce((s, a) => s + (Number(vals[a.code]?.debit) || 0), 0);
  const totalCr = accounts.reduce((s, a) => s + (Number(vals[a.code]?.credit) || 0), 0);
  const diff = Math.round((totalDr - totalCr) * 100) / 100;
  const balanced = Math.abs(diff) < 0.005 && (totalDr > 0 || totalCr > 0);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>
      <PageHeader scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe" title="Opening Balances" subtitle={`${h.hotelName} · enter starting balances. The opening entry must balance.`} />
      <div className="flex items-center gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Opening Balance Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm" style={inputStyle} />
      </div>
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Code', 'Account', 'Type', 'Debit', 'Credit'].map((hd) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Debit', 'Credit'].includes(hd) ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-1.5 px-3 text-xs font-mono" style={{ color: '#929292' }}>{a.code}</td>
                <td className="py-1.5 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
                <td className="py-1.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.type}</td>
                <td className="py-1.5 px-3"><input value={vals[a.code]?.debit ?? ''} onChange={(e) => setVals((p) => ({ ...p, [a.code]: { debit: e.target.value, credit: p[a.code]?.credit ?? '' } }))} className="h-8 px-2 rounded-lg text-xs w-28 text-right" style={inputStyle} placeholder="0.00" /></td>
                <td className="py-1.5 px-3"><input value={vals[a.code]?.credit ?? ''} onChange={(e) => setVals((p) => ({ ...p, [a.code]: { debit: p[a.code]?.debit ?? '', credit: e.target.value } }))} className="h-8 px-2 rounded-lg text-xs w-28 text-right" style={inputStyle} placeholder="0.00" /></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{ background: '#fafafa', borderTop: '2px solid #eee' }}>
            <td colSpan={3} className="py-2.5 px-3 text-xs font-bold" style={{ color: '#6a6a6a' }}>Totals</td>
            <td className="py-2.5 px-3 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totalDr)}</td>
            <td className="py-2.5 px-3 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totalCr)}</td>
          </tr></tfoot>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#6a6a6a' }}>Difference:</span>
          <span className="text-sm font-bold" style={{ color: balanced ? '#15803d' : '#b91c1c' }}>{money(Math.abs(diff))}</span>
          {balanced ? <Badge label="Balanced" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Balanced" fg="#b91c1c" bg="#fee2e2" />}
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Save Draft</button>
          <button disabled={!balanced} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: balanced ? '#15803d' : '#dddddd', color: '#fff', cursor: balanced ? 'pointer' : 'not-allowed' }}><Check className="w-4 h-4" /> Post Opening Balances</button>
        </div>
      </div>
      {!balanced && (totalDr > 0 || totalCr > 0) && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309' }}><AlertTriangle className="w-4 h-4" /> Total debits must equal total credits. Difference must be $0.00 before posting.</div>}
    </div>
  );
}
