'use client';

import { use, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Printer, FileSpreadsheet, CalendarCheck } from 'lucide-react';
import { useStore2 } from '../../../_store2';
import { getImport2, liveLines, computeMath, manualMetrics, sessionCounts } from '../../../_recon2';
import { hotelLabel, resolutionLabel } from '../../../_domain';
import { card, money, fmtDate, fmtMonth, Badge, EmptyState, PURPLE } from '../../../_ui';

function Inner({ sessionId }: { sessionId: string }) {
  const store = useStore2();
  const imp = getImport2(store, sessionId);
  const lines = useMemo(() => imp ? liveLines(store, sessionId) : [], [store, sessionId, imp]);

  if (!imp) return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Back sessionId={sessionId} /><EmptyState title="Reconciliation not found." body="Finish reconciliation to generate the report." /></div>;

  const isCard = imp.statementType === 'credit-card';
  const classic = imp.mode === 'classic';
  const mm = manualMetrics(imp, lines);
  const cm = computeMath(imp, lines);
  const m = { beginningBalance: cm.beginningBalance, statementBalance: cm.statementBalance, clearedBalance: classic ? mm.clearedBalance : cm.clearedBalance, difference: classic ? mm.difference : cm.difference, balanced: classic ? mm.balanced : cm.balanced };
  const clearedIn = classic ? mm.selectedIn : cm.clearedIn;
  const clearedOut = classic ? mm.selectedOut : cm.clearedOut;
  const counts = sessionCounts(lines);
  const hl = hotelLabel(imp.hotelId);
  const finished = !!store.sessions[sessionId]?.finished;

  const cleared = lines.filter((l) => (l.cleared || l.status === 'reconciled') && l.status !== 'excluded');
  const timing = lines.filter((l) => l.status === 'timing-difference');
  const outstanding = lines.filter((l) => !l.cleared && l.status !== 'excluded' && l.status !== 'timing-difference' && l.status !== 'reconciled');

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <Back sessionId={sessionId} />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>{isCard ? 'Credit Card' : 'Bank'} Reconciliation Report</h1>
          <p className="text-sm" style={{ color: '#929292' }}>{imp.accountName} ••{imp.accountLast4} · {hl.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {finished ? <Badge label="Reconciled" fg="#15803d" bg="#dcfce7" /> : <Badge label="In Progress" fg="#1d4ed8" bg="#dbeafe" />}
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> PDF</button>
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
          <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>

      {/* Header block */}
      <Section title="Statement Details">
        <Grid>
          <Info k="Hotel" v={hl.name} /><Info k="Legal Entity" v={hl.legal} />
          <Info k="Property Code" v={hl.code} /><Info k="Account / Card" v={`${imp.accountName} ••${imp.accountLast4}`} />
          <Info k="Statement Period" v={`${fmtDate(imp.startDate)} – ${fmtDate(imp.endDate)}`} />
          <Info k="Statement Source" v={imp.source === 'manual' ? 'Manual Entry' : imp.source === 'pdf-printed' ? 'PDF / Printed Statement' : imp.source === 'existing' ? 'Existing Transactions' : 'CSV Import'} />
          <Info k="Prepared By" v={imp.uploadedBy} /><Info k="Completed By" v={finished ? 'Sanjay Narsee' : '—'} />
        </Grid>
      </Section>

      {/* Balance summary */}
      <Section title="Balance Summary">
        <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background: '#f7f7f7' }}>
          <Line k={isCard ? 'Statement Balance' : 'Beginning Balance'} v={money(isCard ? m.statementBalance : m.beginningBalance)} />
          {!isCard && <Line k="Statement Ending Balance" v={money(m.statementBalance)} />}
          <Line k={isCard ? 'Cleared Charges' : 'Cleared Money In'} v={money(isCard ? clearedOut : clearedIn)} />
          <Line k={isCard ? 'Cleared Credits' : 'Cleared Money Out'} v={money(isCard ? clearedIn : clearedOut)} />
          <Line k="Cleared Balance" v={money(m.clearedBalance)} bold />
          <div className="pt-1.5 mt-1" style={{ borderTop: '1px solid #e5e5e5' }}><Line k="Final Difference" v={money(Math.abs(m.difference))} accent={m.balanced ? '#15803d' : '#b91c1c'} bold /></div>
        </div>
      </Section>

      {/* Cleared transactions */}
      <Section title={`Cleared Transactions (${cleared.length})`}>
        <Table head={['Date', 'Description', 'Vendor', 'Type', isCard ? 'Charge' : 'Money Out', isCard ? 'Credit' : 'Money In']}>
          {cleared.map((l) => (
            <tr key={l.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
              <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(l.dateIso)}</td>
              <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{l.rawDescription}</td>
              <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{l.coding?.vendor ?? l.suggestedVendor ?? '—'}</td>
              <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{resolutionLabel(l.coding?.resolution ?? l.suggestedResolution)}</td>
              <td className="py-2 px-3 text-xs text-right" style={{ color: '#b91c1c' }}>{l.amount < 0 ? money(Math.abs(l.amount)) : '—'}</td>
              <td className="py-2 px-3 text-xs text-right" style={{ color: '#15803d' }}>{l.amount > 0 ? money(l.amount) : '—'}</td>
            </tr>
          ))}
          {cleared.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs" style={{ color: '#929292' }}>No cleared transactions.</td></tr>}
        </Table>
      </Section>

      {/* Timing differences */}
      {timing.length > 0 && (
        <Section title={`Timing Differences (${timing.length})`}>
          <Table head={['Date', 'Description', 'Amount', 'Type', 'Notes']}>
            {timing.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(l.dateIso)}</td>
                <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{l.rawDescription}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#222' }}>{money(Math.abs(l.amount))}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{(l.coding?.extra?.timingType as string) ?? 'Deposit in Transit'}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#929292' }}>Carried forward to next reconciliation</td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Outstanding items */}
      {outstanding.length > 0 && (
        <Section title={`Outstanding Items (${outstanding.length})`}>
          <Table head={['Date', 'Description', 'Amount', 'Reason']}>
            {outstanding.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(l.dateIso)}</td>
                <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{l.rawDescription}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#222' }}>{money(Math.abs(l.amount))}</td>
                <td className="py-2 px-3 text-xs" style={{ color: '#929292' }}>Not on this statement</td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Audit summary */}
      <Section title="Audit Summary">
        <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background: '#f7f7f7' }}>
          <Mini k="Lines / Transactions" v={String(counts.total)} />
          <Mini k="Posted" v={String(counts.posted + counts.cleared + counts.reconciled)} />
          <Mini k="Cleared" v={String(counts.cleared + counts.reconciled)} />
          <Mini k="Excluded" v={String(counts.excluded)} />
        </div>
      </Section>

      <div className="flex gap-2">
        <Link href="/web/accounting/month-close" className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><CalendarCheck className="w-3.5 h-3.5" /> Open Month Close</Link>
        <Link href={`/web/accounting/reconciliation-workbench/${sessionId}`} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Open Workbench</Link>
      </div>
    </div>
  );
}

function Back({ sessionId }: { sessionId: string }) { return <Link href={`/web/accounting/reconciliation-workbench/${sessionId}`} className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Back to Workbench</Link>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="flex flex-col gap-2"><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>{children}</section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="rounded-xl p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={card}>{children}</div>; }
function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm" style={{ color: '#222' }}>{v}</p></div>; }
function Line({ k, v, bold, accent = '#222' }: { k: string; v: string; bold?: boolean; accent?: string }) { return <div className="flex justify-between gap-3 py-0.5"><span className="text-xs" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-xs" style={{ color: accent, fontWeight: bold ? 700 : 500 }}>{v}</span></div>; }
function Mini({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-base font-bold" style={{ color: '#222' }}>{v}</p></div>; }
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{head.map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function ReconReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  return <Suspense fallback={null}><Inner sessionId={decodeURIComponent(sessionId)} /></Suspense>;
}
