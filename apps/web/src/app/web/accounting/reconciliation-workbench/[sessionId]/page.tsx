'use client';

import { use, useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, ExternalLink, ListChecks, Rows3 } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useStore2, finishReconciliation, reopenReconciliation } from '../../_store2';
import {
  getImport2, liveLines, computeMath, sessionCounts, sessionBlockers,
  manualMetrics, manualBlockers,
} from '../../_recon2';
import { hotelLabel, type ReconMode } from '../../_domain';
import { card, money, fmtMonth, fmtDate, Badge, EmptyState, PURPLE } from '../../_ui';
import { LinesPanel, SummaryPanel, FinishModal } from './_panels';
import { CodingPanel } from './_coding';
import { ClassicMode } from './_classic';

function Inner({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const store = useStore2();
  const imp = getImport2(store, sessionId);

  const lines = useMemo(() => imp ? liveLines(store, sessionId) : [], [store, sessionId, imp]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  // View mode: classic for manual sessions, statement-line for imported CSV.
  const defaultMode: ReconMode = (params.get('mode') as ReconMode) ?? imp?.mode ?? 'statement-line';
  const [mode, setMode] = useState<ReconMode>(defaultMode);
  useEffect(() => { setMode((params.get('mode') as ReconMode) ?? imp?.mode ?? 'statement-line'); }, [imp?.mode, params]);

  if (!imp) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Back />
        <EmptyState title="Session not found." body="Open a statement from the inbox, or start a new reconciliation." />
      </div>
    );
  }

  const finished = !!store.sessions[sessionId]?.finished;
  const hl = hotelLabel(imp.hotelId);
  const isCard = imp.statementType === 'credit-card';

  // Finish math depends on the mode: classic uses selection-based manual metrics.
  const slMath = computeMath(imp, lines);
  const slCounts = sessionCounts(lines);
  const slBlockers = sessionBlockers(store, sessionId);
  const mMetrics = manualMetrics(imp, lines);
  const mBlockers = manualBlockers(imp, lines);

  const subtitle = `${hl.name} · ${isCard ? `${imp.institution} ${imp.accountLast4}` : hl.legal} · ${fmtDate(imp.startDate)}–${fmtDate(imp.endDate)}`;

  const onFinish = () => { finishReconciliation(sessionId, imp.hotelId, `${imp.accountName} · ${imp.startDate}–${imp.endDate} · difference $0.00`); setFinishOpen(false); };
  const onReopen = () => reopenReconciliation(sessionId, imp.hotelId, 'Reopened from workbench');

  if (finished) return <Report imp={imp} math={mode === 'classic' ? toReportMath(mMetrics) : slMath} counts={slCounts} router={router} onReopen={onReopen} />;

  const classicCanFinish = mMetrics.balanced && mBlockers.filter((b) => b.severity === 'high').length === 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap flex-shrink-0">
        <div>
          <Back />
          <h1 className="text-xl font-bold mt-1" style={{ color: '#222' }}>Reconcile {imp.accountName}</h1>
          <p className="text-sm" style={{ color: '#929292' }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={isCard ? 'Credit Card' : 'Bank'} fg={isCard ? '#b45309' : '#1d4ed8'} bg={isCard ? '#fef3c7' : '#dbeafe'} />
          {/* View-mode toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
            <button onClick={() => setMode('statement-line')} className="h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: mode === 'statement-line' ? PURPLE : '#fff', color: mode === 'statement-line' ? '#fff' : '#6a6a6a' }}><Rows3 className="w-3.5 h-3.5" /> Statement Line</button>
            <button onClick={() => setMode('classic')} className="h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: mode === 'classic' ? PURPLE : '#fff', color: mode === 'classic' ? '#fff' : '#6a6a6a' }}><ListChecks className="w-3.5 h-3.5" /> Classic</button>
          </div>
          {mode === 'classic' && (
            <button onClick={classicCanFinish ? () => setFinishOpen(true) : undefined} disabled={!classicCanFinish}
              title={classicCanFinish ? '' : mBlockers[0]?.message ?? ''}
              className="h-8 px-4 rounded-xl text-xs font-bold" style={{ background: classicCanFinish ? '#15803d' : '#dddddd', color: '#fff', cursor: classicCanFinish ? 'pointer' : 'not-allowed' }}>Finish Reconciliation</button>
          )}
        </div>
      </div>

      {mode === 'classic' ? (
        <div className="flex-1 min-h-0"><ClassicMode imp={imp} lines={lines} sessionId={sessionId} finished={finished} /></div>
      ) : (
        <div className="grid gap-4 flex-1 min-h-0" style={{ gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr) minmax(280px, 320px)' }}>
          <div className="min-h-0"><LinesPanel lines={lines} imp={imp} selectedId={selectedId} onSelect={setSelectedId} /></div>
          <div className="min-h-0 overflow-hidden">
            {(lines.find((l) => l.id === selectedId) ?? null) ? (
              <CodingPanel line={lines.find((l) => l.id === selectedId)!} imp={imp} sessionId={sessionId} finished={finished} />
            ) : (
              <div className="rounded-2xl h-full flex items-center justify-center p-8 text-center" style={{ ...card, borderStyle: 'dashed' }}>
                <div>
                  <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>Select a statement line to code it.</p>
                  <p className="text-xs mt-1" style={{ color: '#929292' }}>Choose what it is, map it to the chart of accounts, review the journal entry, then post and clear.</p>
                </div>
              </div>
            )}
          </div>
          <div className="min-h-0"><SummaryPanel imp={imp} math={slMath} counts={slCounts} blockers={slBlockers} finished={finished} onFinish={() => setFinishOpen(true)} onReopen={onReopen} /></div>
        </div>
      )}

      {finishOpen && <FinishModal imp={imp} math={mode === 'classic' ? toReportMath(mMetrics) : slMath} counts={slCounts} onClose={() => setFinishOpen(false)} onConfirm={onFinish} />}
    </div>
  );
}

/** Adapt manual metrics to the ReconMath shape the FinishModal/Report expect. */
function toReportMath(m: ReturnType<typeof manualMetrics>) {
  return {
    beginningBalance: m.beginningBalance, statementBalance: m.statementBalance,
    postedIn: m.selectedIn, postedOut: m.selectedOut, clearedIn: m.selectedIn, clearedOut: m.selectedOut,
    bookBalance: m.clearedBalance, clearedBalance: m.clearedBalance, difference: m.difference, balanced: m.balanced,
  };
}

function Back() {
  return <Link href="/web/accounting/reconciliation-workbench" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation Workbench</Link>;
}

/* ── Reconciliation report (finished session) ─────────────────────────── */
function Report({ imp, math, counts, router, onReopen }: any) {
  const hl = hotelLabel(imp.hotelId);
  const isCard = imp.statementType === 'credit-card';
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Back />
      <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={card}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-7 h-7" style={{ color: '#15803d' }} /></div>
        <h1 className="text-lg font-bold" style={{ color: '#222' }}>Reconciliation Complete</h1>
        <p className="text-sm" style={{ color: '#6a6a6a' }}>{fmtMonth(imp.month)} reconciliation is complete for {imp.accountName}.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mt-2">
          <Stat label="Hotel" value={hl.code} />
          <Stat label={isCard ? 'Card' : 'Account'} value={imp.accountName} />
          <Stat label="Period" value={fmtMonth(imp.month)} />
          <Stat label={isCard ? 'Statement Balance' : 'Ending Balance'} value={money(math.statementBalance)} />
          <Stat label="Cleared Balance" value={money(math.clearedBalance)} />
          <Stat label="Difference" value="$0.00" accent="#15803d" />
          <Stat label="Lines Posted" value={String(counts.posted + counts.cleared + counts.reconciled)} />
          <Stat label="Lines Cleared" value={String(counts.cleared + counts.reconciled)} />
          <Stat label="Excluded" value={String(counts.excluded)} />
        </div>
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          <Link href="/web/accounting/reports/reconciliation" className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>View Reconciliation Report</Link>
          <Link href="/web/accounting/month-close" className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Continue Month Close</Link>
          <button onClick={onReopen} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Reopen</button>
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3 rounded-xl text-left" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}

export default function WorkbenchSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  return <Suspense fallback={null}><Inner sessionId={decodeURIComponent(sessionId)} /></Suspense>;
}
