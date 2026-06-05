'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, saveCoaOpening } from '../../_store';
import { accountsForHotel, coaSetupForHotel } from '../../_coa';
import { card, Badge, money } from '../../_ui';
import { CoaTabs } from '../_shared';

export default function OpeningBalancesPage() {
  const { selection, selectHotel } = useAcctOs();
  const router = useRouter();
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />
      {selection.kind === 'hotel'
        ? <SingleHotel hotelId={selection.hotelId} />
        : <AllHotels onEnter={(id) => { selectHotel(id); }} />}
    </div>
  );
}

function AllHotels({ onEnter }: { onEnter: (id: string) => void }) {
  const store = useAcctState();
  return (
    <>
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Opening Balances</h1><p className="text-sm" style={{ color: '#929292' }}>Enter starting balances for each hotel’s accounts before beginning accounting in StayOps. Opening balances are per hotel entity.</p></div>
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Opening Date', 'Assets', 'Liabilities', 'Equity', 'Debits', 'Credits', 'Difference', 'Status', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 && i <= 8 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {HOTEL_ENTITIES.map((h) => {
              const ob = store.coaOpening[h.id];
              const setup = coaSetupForHotel(store, h.id);
              const status = ob?.posted ? 'Posted' : ob ? 'Draft' : setup.openingStatus === 'entered' ? 'Entered' : 'Not Started';
              return (
                <tr key={h.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{ob?.date ?? '2026-01-01'}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(180000)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(90000)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(90000)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(180000)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(180000)}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: '#15803d' }}>$0.00</td>
                  <td className="py-2.5 px-3"><Badge label={status} fg={status === 'Posted' || status === 'Entered' ? '#15803d' : status === 'Draft' ? '#b45309' : '#6a6a6a'} bg={status === 'Posted' || status === 'Entered' ? '#dcfce7' : status === 'Draft' ? '#fef3c7' : '#f0f0f0'} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => onEnter(h.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{status === 'Not Started' ? 'Enter Balances' : 'View Entry'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SingleHotel({ hotelId }: { hotelId: string }) {
  const store = useAcctState();
  const h = getEntity(hotelId);
  const existing = store.coaOpening[hotelId];
  const accts = accountsForHotel(store, hotelId).filter((a) => !a.isHeader);
  // Pre-seed worksheet with accounts that carry an opening balance.
  const seedLines = useMemo(() => {
    const lines: Record<string, { debit: number; credit: number }> = {};
    accts.forEach((a) => {
      if (a.openingBalance != null && a.openingBalance > 0) {
        const isDebitNormal = ['Asset', 'Expense', 'COGS', 'Other Expense'].includes(a.type);
        lines[a.code] = isDebitNormal ? { debit: a.openingBalance, credit: 0 } : { debit: 0, credit: a.openingBalance };
      }
    });
    return lines;
  }, [accts]);

  const [date, setDate] = useState(existing?.date ?? '2026-01-01');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [lines, setLines] = useState<Record<string, { debit: number; credit: number; memo?: string }>>(existing?.lines ?? seedLines);
  const [posted, setPosted] = useState(existing?.posted ?? false);

  const totalDebit = Object.values(lines).reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = Object.values(lines).reduce((s, l) => s + (l.credit || 0), 0);
  const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
  const balanced = diff === 0 && totalDebit > 0;

  const setLine = (code: string, field: 'debit' | 'credit', val: string) => {
    const n = Number(val) || 0;
    setLines((p) => ({ ...p, [code]: { ...p[code], debit: field === 'debit' ? n : (p[code]?.debit ?? 0), credit: field === 'credit' ? n : (p[code]?.credit ?? 0) } }));
  };

  const saveDraft = () => saveCoaOpening(hotelId, { date, notes, lines }, false);
  const post = () => { if (!balanced) return; saveCoaOpening(hotelId, { date, notes, lines }, true); setPosted(true); };

  // Show a manageable set: accounts that have a balance or are balance-sheet accounts.
  const worksheet = accts.filter((a) => ['Asset', 'Liability', 'Equity'].includes(a.type)).slice(0, 30);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2"><Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" /><div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Opening Balances for {h?.hotelName}</h1><p className="text-sm" style={{ color: '#929292' }}>Enter starting balances for this hotel’s accounts before beginning accounting in StayOps.</p></div></div>
      </div>

      {posted && <div className="px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ background: '#dcfce7', color: '#15803d' }}><CheckCircle2 className="w-4 h-4" /> Opening balances posted successfully. An Opening Balance Journal Entry was created.</div>}

      <div className="flex gap-4 flex-wrap items-end">
        <Field label="Opening Balance Date *"><input type="date" value={date} disabled={posted} onChange={(e) => setDate(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} /></Field>
        <Field label="Notes"><input value={notes} disabled={posted} onChange={(e) => setNotes(e.target.value)} placeholder="Migrated from QuickBooks" className="h-9 px-2.5 rounded-lg text-sm w-64" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} /></Field>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Debits" value={money(totalDebit)} />
        <Stat label="Total Credits" value={money(totalCredit)} />
        <Stat label="Difference" value={money(Math.abs(diff))} accent={balanced ? '#15803d' : '#b91c1c'} />
      </div>
      {!balanced && totalDebit > 0 && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>Total debits must equal total credits. Difference must be $0.00 before posting.</p>}

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Code', 'Account Name', 'Type', 'Debit', 'Credit'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {worksheet.map((a, i) => (
              <tr key={a.code} style={{ borderBottom: i < worksheet.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{a.code}</td>
                <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.type}</td>
                <td className="py-2 px-3 text-right"><input disabled={posted} value={lines[a.code]?.debit || ''} onChange={(e) => setLine(a.code, 'debit', e.target.value)} placeholder="0.00" className="w-28 h-8 px-2 rounded-lg text-sm text-right" style={{ border: '1px solid #eee', background: posted ? '#f7f7f7' : '#fff', color: '#222' }} /></td>
                <td className="py-2 px-3 text-right"><input disabled={posted} value={lines[a.code]?.credit || ''} onChange={(e) => setLine(a.code, 'credit', e.target.value)} placeholder="0.00" className="w-28 h-8 px-2 rounded-lg text-sm text-right" style={{ border: '1px solid #eee', background: posted ? '#f7f7f7' : '#fff', color: '#222' }} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{ background: '#f7f7f7', borderTop: '1px solid #dddddd' }}><td colSpan={3} className="py-2.5 px-3 text-xs font-bold uppercase" style={{ color: '#6a6a6a' }}>Totals</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(totalDebit)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(totalCredit)}</td></tr></tfoot>
        </table>
      </div>

      {!posted && (
        <div className="flex justify-end gap-2">
          <button onClick={saveDraft} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Save Draft</button>
          <button onClick={post} disabled={!balanced} title={!balanced ? 'Difference must be $0.00 before posting.' : undefined} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: balanced ? 1 : 0.5 }}>Post Opening Balances</button>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
