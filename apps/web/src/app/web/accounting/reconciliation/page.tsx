'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Download, GitMerge, AlertOctagon, History as HistoryIcon, Check, X,
} from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState } from '../_store';
import { card, Badge, money, fmtDate } from '../_ui';
import {
  portfolioReconSummary, hotelReconSummary, hotelReconRows, reconAccounts,
  statusForAccount, differenceForAccount, blockerRows, reconHistory, type ReconAccount,
} from '../_recon';
import { ReconTabs, SummaryCard, ReconStatusBadge, actionFor } from './_shared';
import { StartFlow } from './_StartFlow';

function Inner() {
  const { selection, selectHotel } = useAcctOs();
  const router = useRouter();
  const params = useSearchParams();
  const [start, setStart] = useState<{ hotel?: string; account?: string } | null>(null);

  // Deep-link from Banking / Credit Cards: ?account=<id> opens Start preselected.
  useEffect(() => {
    const acct = params.get('account');
    if (acct) setStart({ account: acct });
  }, [params]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReconTabs />
      {selection.kind === 'hotel'
        ? <SingleHotel hotelId={selection.hotelId} onStart={(a) => setStart({ hotel: selection.hotelId, account: a })} router={router} />
        : <AllHotels onStart={() => setStart({})} onPick={selectHotel} router={router} />}
      {start && <StartFlow preHotel={start.hotel} preAccountId={start.account} onClose={() => { setStart(null); if (params.get('account')) router.replace('/web/accounting/reconciliation'); }} />}
    </div>
  );
}

/* ─────────── ALL HOTELS ─────────── */
function AllHotels({ onStart, onPick, router }: { onStart: () => void; onPick: (id: string) => void; router: ReturnType<typeof useRouter> }) {
  const store = useAcctState();
  const p = portfolioReconSummary(store);
  const rows = hotelReconRows(store);
  const needing = reconAccounts(store).map((a) => ({ a, s: statusForAccount(store, a) })).filter((x) => x.s !== 'reconciled').slice(0, 12);
  const blockers = blockerRows(store).slice(0, 6);
  const history = reconHistory(store).slice(0, 6);

  const openHotel = (id: string) => { onPick(id); router.push('/web/accounting/reconciliation'); };

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Track bank and credit card reconciliation across all HOS hotel entities.</p>
          <p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Each hotel reconciles its own bank accounts and credit cards separately.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/web/accounting/reconciliation/differences" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><GitMerge className="w-3.5 h-3.5" /> View Differences</Link>
          <Link href="/web/accounting/reconciliation/blockers" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><AlertOctagon className="w-3.5 h-3.5" /> View Blockers</Link>
          <Link href="/web/accounting/reconciliation/history" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><HistoryIcon className="w-3.5 h-3.5" /> History</Link>
          <button onClick={onStart} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Play className="w-4 h-4" /> Start Reconciliation</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <SummaryCard label="To Reconcile" value={p.total} />
        <SummaryCard label="Reconciled" value={p.reconciled} accent="#15803d" />
        <SummaryCard label="In Progress" value={p.inProgress} accent="#1d4ed8" />
        <SummaryCard label="Not Started" value={p.notStarted} />
        <SummaryCard label="Difference" value={p.difference} accent={p.difference ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Blocked" value={p.blocked} accent={p.blocked ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Missing Stmts" value={p.missingStatements} accent="#b45309" />
        <SummaryCard label="Ready to Close" value={`${p.readyForClose} hotels`} accent="#15803d" />
      </div>

      <Section title="Reconciliation Status by Hotel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Legal Entity', 'Code', 'Banks', 'Cards', 'Reconciled', 'In Progress', 'Difference', 'Missing', 'Close Impact', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 && i <= 8 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => { const h = getEntity(r.hotelId)!; return (
                <tr key={r.hotelId} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{h.legalEntity}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{r.banks}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{r.cards}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#15803d' }}>{r.reconciled}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#1d4ed8' }}>{r.inProgress}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: r.difference ? '#b91c1c' : '#3f3f3f' }}>{r.difference || '—'}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: r.missing ? '#b45309' : '#3f3f3f' }}>{r.missing || '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={r.closeImpact} fg={r.closeImpact === 'Ready' ? '#15803d' : r.closeImpact === 'Blocked' ? '#b91c1c' : '#b45309'} bg={r.closeImpact === 'Ready' ? '#dcfce7' : r.closeImpact === 'Blocked' ? '#fee2e2' : '#fef3c7'} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => openHotel(r.hotelId)} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>View</button></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Accounts Needing Reconciliation">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account', 'Type', 'Status', 'Action'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
              <tbody>
                {needing.map(({ a, s }) => (
                  <tr key={a.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(a.hotelId)?.propertyCode}</td>
                    <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.kind === 'bank' ? 'Bank' : 'Credit Card'}</td>
                    <td className="py-2.5 px-3"><ReconStatusBadge status={s} /></td>
                    <td className="py-2.5 px-3"><button onClick={() => { onPick(a.hotelId); router.push('/web/accounting/reconciliation'); }} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{actionFor(s)}</button></td>
                  </tr>
                ))}
                {needing.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-xs" style={{ color: '#929292' }}>All accounts are reconciled.</td></tr>}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Reconciliation Issues">
          <div className="p-4 flex flex-col gap-2">
            {blockers.map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
                <Badge label={b.severity === 'high' ? 'High' : 'Warning'} fg={b.severity === 'high' ? '#b91c1c' : '#b45309'} bg={b.severity === 'high' ? '#fee2e2' : '#fef3c7'} />
                <span className="text-sm flex-1" style={{ color: '#3f3f3f' }}><b>{getEntity(b.acct.hotelId)?.propertyCode}</b> · {b.acct.name}: {b.message}</span>
                <Link href={b.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{b.action}</Link>
              </div>
            ))}
            {blockers.length === 0 && <p className="text-xs" style={{ color: '#929292' }}>No reconciliation issues found.</p>}
          </div>
        </Section>
      </div>

      <Section title="Recent Reconciliations">
        {history.length === 0 ? <p className="px-5 py-6 text-sm" style={{ color: '#929292' }}>Completed reconciliations will appear here.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Completed', 'Hotel', 'Account', 'Period', 'Ending Balance', 'Difference', 'By', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 || i === 5 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.finishedIso ? fmtDate(r.finishedIso.slice(0, 10)) : '—'}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{getEntity(r.hotelId)?.propertyCode}</td>
                    <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.accountName}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.month}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(r.endingBalance)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#15803d' }}>$0.00</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.finishedBy ?? '—'}</td>
                    <td className="py-2.5 px-3"><Link href={`/web/accounting/reconciliation/${encodeURIComponent(r.id)}/report`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View Report</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}

/* ─────────── SINGLE HOTEL ─────────── */
function SingleHotel({ hotelId, onStart, router }: { hotelId: string; onStart: (a?: string) => void; router: ReturnType<typeof useRouter> }) {
  const store = useAcctState();
  const h = getEntity(hotelId);
  const s = hotelReconSummary(store, hotelId);
  const accts = reconAccounts(store, hotelId);
  const banks = accts.filter((a) => a.kind === 'bank');
  const cards = accts.filter((a) => a.kind === 'card');

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" />
          <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation for {h?.hotelName}</h1><p className="text-sm" style={{ color: '#929292' }}>{h?.legalEntity} · {h?.propertyCode} · Reconcile this hotel’s bank accounts and credit cards.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Finish reconciliation before closing the month.</p></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/web/accounting/reconciliation/history" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><HistoryIcon className="w-3.5 h-3.5" /> View History</Link>
          <button onClick={() => onStart()} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Play className="w-4 h-4" /> Start Reconciliation</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Accounts to Reconcile" value={s.total} />
        <SummaryCard label="Reconciled" value={s.reconciled} accent="#15803d" />
        <SummaryCard label="In Progress" value={s.inProgress} accent="#1d4ed8" />
        <SummaryCard label="Difference Found" value={s.difference} accent={s.difference ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Missing Statements" value={s.missingStatements} accent="#b45309" />
        <SummaryCard label="Month Close" value={s.monthClose} accent={s.monthClose === 'Ready' ? '#15803d' : s.monthClose === 'Blocked' ? '#b91c1c' : '#b45309'} />
      </div>

      <AcctSection title="Bank Accounts" accts={banks} store={store} onStart={onStart} router={router} />
      <AcctSection title="Credit Cards" accts={cards} store={store} onStart={onStart} router={router} />

      <Section title="Current Month Close Impact">
        <div className="p-4 flex flex-col gap-2">
          {accts.map((a) => { const st = statusForAccount(store, a); const ok = st === 'reconciled'; return (
            <div key={a.id} className="flex items-center gap-2.5">
              {ok ? <Check className="w-4 h-4" style={{ color: '#15803d' }} /> : <X className="w-4 h-4" style={{ color: '#b45309' }} />}
              <span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{a.name} reconciled</span>
              <ReconStatusBadge status={st} />
              {!ok && <button onClick={() => onStart(a.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Reconcile</button>}
            </div>
          ); })}
        </div>
      </Section>
    </>
  );
}

function AcctSection({ title, accts, store, onStart, router }: { title: string; accts: ReconAccount[]; store: ReturnType<typeof useAcctState>; onStart: (a?: string) => void; router: ReturnType<typeof useRouter> }) {
  return (
    <Section title={title}>
      {accts.length === 0 ? <p className="px-5 py-6 text-sm" style={{ color: '#929292' }}>No {title.toLowerCase()} for this hotel.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{[title.includes('Bank') ? 'Account Name' : 'Card Name', title.includes('Bank') ? 'Bank' : 'Issuer', 'Last 4', 'Statement', 'Last Reconciled', 'Difference', 'Status', 'Action'].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 5 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
            <tbody>
              {accts.map((a) => { const st = statusForAccount(store, a); const diff = differenceForAccount(store, a); return (
                <tr key={a.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{a.name}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.institution}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{a.last4}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.statementUploaded ? a.statementMonth : <span style={{ color: '#b45309' }}>Missing</span>}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.lastReconciled ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: diff ? '#b91c1c' : '#15803d' }}>{money(Math.abs(diff))}</td>
                  <td className="py-2.5 px-3"><ReconStatusBadge status={st} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => onStart(a.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{actionFor(st)}</button></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2></div>{children}</div>;
}

export default function ReconciliationPage() {
  return <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}><Inner /></Suspense>;
}
