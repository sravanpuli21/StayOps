'use client';

import { use, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, ExternalLink, FileText } from 'lucide-react';
import { useAcctOs } from '../../_context';
import { useStore2 } from '../../_store2';
import {
  buildPnl, unpostedCount, postedJournalLines, drilldown, REPORT_LIST, type PnlRow, type PostedLine,
} from '../_reports';
import { allSessionRows } from '../../_recon2';
import { hotelLabel, RECON_MONTH } from '../../_domain';
import { card, money, fmtDate, Badge, PageHeader, EmptyState, PURPLE, fmtMonth } from '../../_ui';

function Inner({ report }: { report: string }) {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const meta = REPORT_LIST.find((r) => r.key === report);
  const [drill, setDrill] = useState<{ title: string; rows: PostedLine[] } | null>(null);
  const unposted = unpostedCount(store, hotelId);

  const openDrill = (title: string, lineIds: string[]) => setDrill({ title, rows: drilldown(store, lineIds, hotelId) });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/reports" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reports</Link>
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title={meta?.name ?? 'Report'} subtitle={`${meta?.desc ?? ''} · ${fmtMonth(RECON_MONTH)}`}
      />
      {unposted > 0 && (
        <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
          This report may be incomplete because <b>{unposted}</b> statement line{unposted === 1 ? ' is' : 's are'} not posted.
        </div>
      )}

      {report === 'profit-loss' && <PnlReport store={store} hotelId={hotelId} onDrill={openDrill} />}
      {report === 'trial-balance' && <TrialBalance store={store} hotelId={hotelId} onDrill={openDrill} />}
      {report === 'reconciliation' && <ReconReport store={store} hotelId={hotelId} />}
      {!['profit-loss', 'trial-balance', 'reconciliation'].includes(report) && (
        <EmptyState icon={<FileText className="w-8 h-8" />} title={`${meta?.name ?? 'This report'} is coming soon.`} body="Profit & Loss, Trial Balance, and the Reconciliation Report are live and drill back to source lines." />
      )}

      {drill && <DrillDrawer title={drill.title} rows={drill.rows} onClose={() => setDrill(null)} />}
    </div>
  );
}

function PnlReport({ store, hotelId, onDrill }: { store: any; hotelId?: string; onDrill: (t: string, ids: string[]) => void }) {
  const pnl = useMemo(() => buildPnl(store, hotelId), [store, hotelId]);
  if (pnl.revenue.length === 0 && pnl.expenses.length === 0) return <EmptyState title="No posted activity yet." body="Post statement lines in the workbench to populate the P&L." />;
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <Group title="Revenue" rows={pnl.revenue} total={pnl.totalRevenue} onDrill={onDrill} positive />
      <Group title="Expenses" rows={pnl.expenses} total={pnl.totalExpense} onDrill={onDrill} />
      <div className="flex items-center justify-between px-4 py-3" style={{ background: '#f7f7f7', borderTop: '2px solid #eee' }}>
        <span className="text-sm font-bold" style={{ color: '#222' }}>Net Income</span>
        <span className="text-base font-bold" style={{ color: pnl.net >= 0 ? '#15803d' : '#b91c1c' }}>{money(pnl.net, { sign: true })}</span>
      </div>
    </div>
  );
}
function Group({ title, rows, total, onDrill, positive }: { title: string; rows: PnlRow[]; total: number; onDrill: (t: string, ids: string[]) => void; positive?: boolean }) {
  return (
    <>
      <div className="px-4 py-2" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</p></div>
      {rows.map((r) => (
        <button key={r.account} onClick={() => onDrill(r.account, r.lineIds)} className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f7f7f7' }}>
          <span className="text-sm" style={{ color: '#222' }}>{r.account}</span>
          <span className="text-sm font-medium tabular-nums underline decoration-dotted" style={{ color: positive ? '#15803d' : '#222' }}>{money(r.amount)}</span>
        </button>
      ))}
      <div className="flex items-center justify-between px-4 py-2"><span className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Total {title}</span><span className="text-sm font-bold" style={{ color: '#222' }}>{money(total)}</span></div>
    </>
  );
}

function TrialBalance({ store, hotelId, onDrill }: { store: any; hotelId?: string; onDrill: (t: string, ids: string[]) => void }) {
  const lines = useMemo<PostedLine[]>(() => postedJournalLines(store, hotelId), [store, hotelId]);
  const agg: Record<string, { debit: number; credit: number; lineIds: string[] }> = {};
  lines.forEach((l) => { const a = (agg[l.account] ??= { debit: 0, credit: 0, lineIds: [] }); a.debit += l.debit; a.credit += l.credit; if (!a.lineIds.includes(l.lineId)) a.lineIds.push(l.lineId); });
  const rows = Object.entries(agg).map(([account, v]) => ({ account, net: v.debit - v.credit, ...v })).filter((r) => Math.abs(r.net) > 0.005).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const totalDr = rows.reduce((s, r) => s + (r.net > 0 ? r.net : 0), 0);
  const totalCr = rows.reduce((s, r) => s + (r.net < 0 ? -r.net : 0), 0);
  if (rows.length === 0) return <EmptyState title="No posted activity yet." body="Post statement lines in the workbench to populate the trial balance." />;
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <table className="w-full text-sm">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Account', 'Debit', 'Credit'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4" style={{ color: '#6a6a6a', textAlign: i ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.account} className="hover:bg-[#f7f7f7] cursor-pointer" style={{ borderBottom: '1px solid #f7f7f7' }} onClick={() => onDrill(r.account, r.lineIds)}>
              <td className="py-2.5 px-4 text-sm" style={{ color: '#222' }}>{r.account}</td>
              <td className="py-2.5 px-4 text-sm text-right tabular-nums" style={{ color: r.net > 0 ? '#222' : '#ddd' }}>{r.net > 0 ? money(r.net) : '—'}</td>
              <td className="py-2.5 px-4 text-sm text-right tabular-nums" style={{ color: r.net < 0 ? '#222' : '#ddd' }}>{r.net < 0 ? money(-r.net) : '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr style={{ background: '#fafafa', borderTop: '2px solid #eee' }}><td className="py-2.5 px-4 text-xs font-bold" style={{ color: '#6a6a6a' }}>Totals</td><td className="py-2.5 px-4 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totalDr)}</td><td className="py-2.5 px-4 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totalCr)}</td></tr></tfoot>
      </table>
    </div>
  );
}

function ReconReport({ store, hotelId }: { store: any; hotelId?: string }) {
  const rows = allSessionRows(store, hotelId).filter((r) => r.status === 'reconciled');
  if (rows.length === 0) return <EmptyState title="No finished reconciliations yet." body="Finish a reconciliation in the workbench and it appears here." />;
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account', 'Month', 'Statement', 'Cleared', 'Difference', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{hotelLabel(r.imp.hotelId).code}</td>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.imp.accountName}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtMonth(r.imp.month)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{money(r.math.statementBalance)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{money(r.math.clearedBalance)}</td>
              <td className="py-2.5 px-3 text-xs font-semibold" style={{ color: '#15803d' }}>$0.00</td>
              <td className="py-2.5 px-3"><Link href={`/web/accounting/reconciliation-workbench/${r.id}`} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>View <ExternalLink className="w-3 h-3" /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DrillDrawer({ title, rows, onClose }: { title: string; rows: PostedLine[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Drill-down</p><h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2">
          <p className="text-xs" style={{ color: '#929292' }}>{rows.length} posted journal {rows.length === 1 ? 'entry' : 'entries'} → source statement lines.</p>
          {rows.map((r, i) => (
            <Link key={i} href={`/web/accounting/reconciliation-workbench/${r.sessionId}`} className="rounded-xl p-3 flex flex-col gap-1 hover:shadow-sm" style={card}>
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium" style={{ color: '#222' }}>{r.description}</span><span className="text-sm font-semibold" style={{ color: '#222' }}>{money(r.debit || r.credit)}</span></div>
              <div className="flex items-center justify-between gap-2"><span className="text-[11px]" style={{ color: '#929292' }}>{fmtDate(r.dateIso)} · {r.account}</span><span className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Source line <ExternalLink className="w-3 h-3" /></span></div>
            </Link>
          ))}
          {rows.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#929292' }}>No source lines found.</p>}
        </div>
      </div>
    </div>
  );
}

export default function ReportDetailPage({ params }: { params: Promise<{ report: string }> }) {
  const { report } = use(params);
  return <Suspense fallback={null}><Inner report={report} /></Suspense>;
}
