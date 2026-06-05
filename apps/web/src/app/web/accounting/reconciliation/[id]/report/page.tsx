'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctState } from '../../../_store';
import { oneReconAccount, reconTransactions, computeMath } from '../../../_recon';
import { card, money, fmtDate, Badge } from '../../../_ui';

function Inner({ id }: { id: string }) {
  const store = useAcctState();
  const rec = store.reconRecords[id];
  if (!rec) return <Wrap><Empty /></Wrap>;
  const acct = oneReconAccount(store, rec.accountId);
  if (!acct) return <Wrap><Empty /></Wrap>;
  const isCard = acct.kind === 'card';
  const h = getEntity(rec.hotelId);
  const txs = reconTransactions(rec.accountId);
  const clearedSet = new Set(rec.cleared);
  const m = computeMath({ ...acct, beginningBalance: rec.beginningBalance, statementBalance: rec.endingBalance }, txs, clearedSet);
  const clearedTxs = txs.filter((t) => clearedSet.has(t.id));
  const unclearedTxs = txs.filter((t) => !clearedSet.has(t.id));

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/web/accounting/reconciliation/history" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> History</Link>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Download PDF</button>
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel</button>
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>

      <div className="rounded-2xl p-6 flex flex-col gap-5" style={card}>
        {/* header */}
        <div className="flex items-start justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation Report</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{acct.name} · {acct.institution} · {acct.last4}</p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{h?.hotelName} · {h?.legalEntity} · {h?.propertyCode}</p>
          </div>
          <div className="text-right">
            <Badge label={rec.status === 'reopened' ? 'Reopened' : 'Reconciled'} fg={rec.status === 'reopened' ? '#6a4ec0' : '#15803d'} bg={rec.status === 'reopened' ? '#ece4fb' : '#dcfce7'} />
            <p className="text-xs mt-1" style={{ color: '#929292' }}>Statement Period: {rec.month}</p>
            <p className="text-xs" style={{ color: '#929292' }}>Completed: {rec.finishedIso ? fmtDate(rec.finishedIso.slice(0, 10)) : '—'} · {rec.finishedBy ?? 'Sanjay Narsee'}</p>
          </div>
        </div>

        {/* summary */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Summary</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
            <SumRow k="Beginning Balance" v={money(m.beginningBalance)} />
            <SumRow k={isCard ? 'Cleared Charges' : 'Cleared Money In'} v={money(isCard ? m.clearedOut : m.clearedIn)} />
            <SumRow k={isCard ? 'Cleared Credits' : 'Cleared Money Out'} v={money(isCard ? m.clearedIn : m.clearedOut)} />
            <SumRow k="Cleared Balance" v={money(m.clearedBalance)} bold />
            <SumRow k={isCard ? 'Statement Balance' : 'Statement Ending Balance'} v={money(m.statementBalance)} />
            <SumRow k="Difference" v="$0.00" accent="#15803d" bold last />
          </div>
        </div>

        {/* cleared transactions */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Cleared Transactions ({clearedTxs.length})</h2>
          <ReportTable txs={clearedTxs} showCleared />
        </div>

        {/* uncleared transactions */}
        {unclearedTxs.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Uncleared Transactions ({unclearedTxs.length})</h2>
            <ReportTable txs={unclearedTxs} />
          </div>
        )}

        {/* adjustments */}
        {store.reconAdjustments.filter((a) => a.accountId === rec.accountId).length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Adjustments</h2>
            {store.reconAdjustments.filter((a) => a.accountId === rec.accountId).map((a) => (
              <div key={a.id} className="flex justify-between text-sm py-1"><span style={{ color: '#3f3f3f' }}>{a.reason} · {a.category}</span><span style={{ color: '#222' }}>{money(a.amount)}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportTable({ txs, showCleared }: { txs: ReturnType<typeof reconTransactions>; showCleared?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #f0f0f0' }}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Description', 'Vendor', 'Category', 'Amount', 'JE', ...(showCleared ? ['Cleared Date'] : ['Reason'])].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
        <tbody>
          {txs.slice(0, 40).map((t, i) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
              <td className="py-1.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
              <td className="py-1.5 px-3 text-xs" style={{ color: '#222' }}>{t.description}</td>
              <td className="py-1.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.vendor ?? '—'}</td>
              <td className="py-1.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.category ?? '—'}</td>
              <td className="py-1.5 px-3 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
              <td className="py-1.5 px-3 text-xs font-mono" style={{ color: '#6a4ec0' }}>JE-{1000 + i}</td>
              <td className="py-1.5 px-3 text-xs" style={{ color: '#929292' }}>{showCleared ? 'May 31, 2026' : (t.status !== 'posted' ? 'Not posted' : 'Not on statement')}</td>
            </tr>
          ))}
          {txs.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-xs" style={{ color: '#929292' }}>None.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SumRow({ k, v, bold, accent = '#222', last }: { k: string; v: string; bold?: boolean; accent?: string; last?: boolean }) { return <div className="flex justify-between px-4 py-2.5" style={{ borderBottom: last ? 'none' : '1px solid #f0f0f0', background: bold ? '#fafafa' : '#fff' }}><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm" style={{ color: accent, fontWeight: bold ? 700 : 500 }}>{v}</span></div>; }
function Wrap({ children }: { children: React.ReactNode }) { return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Link href="/web/accounting/reconciliation/history" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> History</Link>{children}</div>; }
function Empty() { return <div className="rounded-2xl p-10 text-center" style={{ ...card, borderStyle: 'dashed' }}><p className="text-base font-semibold" style={{ color: '#222' }}>Report not available.</p><p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Finish a reconciliation to generate its report.</p></div>; }

export default function ReconReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner id={decodeURIComponent(id)} /></Suspense>;
}
