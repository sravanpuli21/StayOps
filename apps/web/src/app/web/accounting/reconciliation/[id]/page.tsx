'use client';

import { use, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, Save, AlertTriangle, Lock, X, CheckCircle2, ChevronDown,
} from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctState, setReconClearedRich, saveReconProgress, finishReconciliationRich } from '../../_store';
import { oneReconAccount, reconTransactions, computeMath, blockersForAccount } from '../../_recon';
import { card, money, fmtDate, Badge } from '../../_ui';

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const store = useAcctState();
  const rec = store.reconRecords[id];

  if (!rec) return <Wrap><Empty title="Reconciliation not found." body="Start a reconciliation from the dashboard, a bank account, or a credit card." /></Wrap>;
  const acct = oneReconAccount(store, rec.accountId);
  if (!acct) return <Wrap><Empty title="Account not found." body="This account is no longer available." /></Wrap>;

  const isCard = acct.kind === 'card';
  const txs = useMemo(() => reconTransactions(acct.id), [acct.id]);
  const cleared = new Set(rec.cleared);
  const m = computeMath({ ...acct, beginningBalance: rec.beginningBalance, statementBalance: rec.endingBalance }, txs, cleared);
  const blockers = blockersForAccount(store, acct);
  const highBlockers = blockers.filter((b) => b.severity === 'high');
  const finished = rec.status === 'reconciled';

  const [tab, setTab] = useState<string>('All');
  const [finishOpen, setFinishOpen] = useState(false);
  const [done, setDone] = useState(finished);

  const h = getEntity(acct.hotelId);
  const TABS = isCard ? ['All', 'Uncleared', 'Cleared', 'Charges', 'Credits', 'Blocked'] : ['All', 'Uncleared', 'Cleared', 'Money In', 'Money Out', 'Blocked'];

  const toggle = (txId: string) => {
    if (finished) return;
    const next = new Set(cleared); next.has(txId) ? next.delete(txId) : next.add(txId);
    setReconClearedRich(id, [...next]);
  };
  const clearAll = () => { if (!finished) setReconClearedRich(id, txs.filter((t) => t.status === 'posted').map((t) => t.id)); };

  const filtered = txs.filter((t) => {
    if (tab === 'Uncleared') return !cleared.has(t.id);
    if (tab === 'Cleared') return cleared.has(t.id);
    if (tab === 'Money In' || tab === 'Credits') return t.amount > 0;
    if (tab === 'Money Out' || tab === 'Charges') return t.amount < 0;
    if (tab === 'Blocked') return t.status !== 'posted' || t.duplicate;
    return true;
  });

  const finish = () => { finishReconciliationRich(id); setDone(true); setFinishOpen(false); };

  if (done) return <Success rec={rec} acct={acct} m={m} router={router} id={id} />;

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-4">
      <Link href="/web/accounting/reconciliation" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconcile {acct.name}</h1><p className="text-sm" style={{ color: '#929292' }}>{h?.hotelName} · {acct.institution} · {acct.last4} · {rec.month}</p></div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => saveReconProgress(id)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Save className="w-3.5 h-3.5" /> Save Progress</button>
          <FinishButton balanced={m.balanced} blockers={highBlockers} onClick={() => setFinishOpen(true)} />
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SC label={isCard ? 'Statement Balance' : 'Statement Ending Balance'} value={money(m.statementBalance)} />
        <SC label="Cleared Balance" value={money(m.clearedBalance)} />
        <DiffCard difference={m.difference} balanced={m.balanced} />
        <SC label="Beginning Balance" value={money(m.beginningBalance)} />
        <SC label={isCard ? 'Cleared Charges' : 'Cleared Money In'} value={money(isCard ? m.clearedOut : m.clearedIn)} />
        <SC label={isCard ? 'Cleared Credits' : 'Cleared Money Out'} value={money(isCard ? m.clearedIn : m.clearedOut)} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* clearing table */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
            {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={clearAll} disabled={finished} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Mark all posted as cleared</button>
            <span className="text-xs" style={{ color: '#929292' }}>{cleared.size} of {txs.length} cleared</span>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="w-10 py-2.5 px-3"></th>
                {(isCard ? ['Date', 'Description', 'Vendor', 'Charge', 'Credit', 'Posted', 'Cleared'] : ['Date', 'Description', 'Vendor', 'Money In', 'Money Out', 'Posted', 'Cleared']).map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 3 || i === 4 ? 'right' : 'left' }}>{hd}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((t) => {
                  const isCleared = cleared.has(t.id);
                  const unposted = t.status !== 'posted';
                  const inAmt = t.amount > 0 ? Math.abs(t.amount) : 0;
                  const outAmt = t.amount < 0 ? Math.abs(t.amount) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', opacity: finished ? 0.7 : 1 }} onClick={() => toggle(t.id)}>
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        {finished ? <Lock className="w-3.5 h-3.5" style={{ color: '#929292' }} /> : <input type="checkbox" checked={isCleared} onChange={() => toggle(t.id)} />}
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                      <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>
                        {t.description}
                        <span className="ml-1.5 inline-flex gap-1 align-middle">
                          {unposted && <Badge label="Unposted" fg="#b45309" bg="#fef3c7" />}
                          {t.duplicate && <Badge label="Possible Duplicate" fg="#b91c1c" bg="#fee2e2" />}
                          {t.receipt === 'missing' && <Badge label="Missing Receipt" fg="#b91c1c" bg="#fee2e2" />}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.vendor ?? '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-right" style={{ color: isCard ? '#b91c1c' : '#15803d' }}>{(isCard ? outAmt : inAmt) ? money(isCard ? outAmt : inAmt) : '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-right" style={{ color: isCard ? '#15803d' : '#b91c1c' }}>{(isCard ? inAmt : outAmt) ? money(isCard ? inAmt : outAmt) : '—'}</td>
                      <td className="py-2.5 px-3">{unposted ? <Badge label="No" fg="#b45309" bg="#fef3c7" /> : <Check className="w-4 h-4" style={{ color: '#15803d' }} />}</td>
                      <td className="py-2.5 px-3">{isCleared && <Check className="w-4 h-4" style={{ color: '#15803d' }} />}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-sm" style={{ color: '#929292' }}>No transactions in this view.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* right summary panel */}
        <div className="flex flex-col gap-4">
          <Panel title="Reconciliation Summary">
            <Line k="Beginning Balance" v={money(m.beginningBalance)} />
            <Line k={isCard ? 'Cleared Charges' : 'Cleared Money In'} v={money(isCard ? m.clearedOut : m.clearedIn)} />
            <Line k={isCard ? 'Cleared Credits' : 'Cleared Money Out'} v={money(isCard ? m.clearedIn : m.clearedOut)} />
            <Line k="Cleared Balance" v={money(m.clearedBalance)} bold />
            <Line k={isCard ? 'Statement Balance' : 'Statement Ending Balance'} v={money(m.statementBalance)} />
            <div className="pt-2 mt-1" style={{ borderTop: '1px solid #f0f0f0' }}><Line k="Difference" v={money(Math.abs(m.difference))} accent={m.balanced ? '#15803d' : '#b91c1c'} bold /></div>
          </Panel>
          <Panel title="Progress">
            <Line k="Total transactions" v={String(txs.length)} />
            <Line k="Cleared" v={String(cleared.size)} />
            <Line k="Uncleared" v={String(txs.length - cleared.size)} />
            <Line k="Posted" v={String(txs.filter((t) => t.status === 'posted').length)} />
            <Line k="Blocked" v={String(txs.filter((t) => t.status !== 'posted').length)} />
          </Panel>
          {blockers.length > 0 && (
            <Panel title="Blockers">
              {blockers.map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-xs" style={{ color: b.severity === 'high' ? '#b91c1c' : '#b45309' }}>{b.type} ({b.count})</span>
                  <Link href={b.href} className="text-[11px] font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{b.action}</Link>
                </div>
              ))}
            </Panel>
          )}
        </div>
      </div>

      {finishOpen && <FinishModal rec={rec} acct={acct} m={m} cleared={cleared.size} uncleared={txs.length - cleared.size} onClose={() => setFinishOpen(false)} onConfirm={finish} />}
    </div>
  );
}

function FinishButton({ balanced, blockers, onClick }: { balanced: boolean; blockers: ReturnType<typeof blockersForAccount>; onClick: () => void }) {
  const reason = !balanced ? 'Difference must be $0.00 before finishing.' : blockers.length ? blockers[0].message : '';
  const disabled = !balanced || blockers.length > 0;
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} title={reason} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: disabled ? '#dddddd' : '#15803d', color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer' }}>Finish Reconciliation</button>;
}

function DiffCard({ difference, balanced }: { difference: number; balanced: boolean }) {
  return (
    <div className="p-3 rounded-2xl" style={{ background: balanced ? '#dcfce7' : '#fee2e2', border: `1px solid ${balanced ? '#bbf7d0' : '#fecaca'}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: balanced ? '#15803d' : '#b91c1c' }}>Difference</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color: balanced ? '#15803d' : '#b91c1c' }}>{money(Math.abs(difference))}</p>
      <p className="text-[11px]" style={{ color: balanced ? '#15803d' : '#b91c1c' }}>{balanced ? 'Ready to finish.' : 'Not reconciled yet.'}</p>
    </div>
  );
}

function FinishModal({ rec, acct, m, cleared, uncleared, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Finish Reconciliation</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-sm" style={{ color: '#3f3f3f' }}>You are about to finish reconciliation for <b>{acct.name}</b> for {rec.month}.</p>
          <div className="rounded-xl p-3 flex flex-col gap-1.5" style={{ background: '#f7f7f7' }}>
            <Line k="Hotel" v={getEntity(acct.hotelId)?.hotelName ?? '—'} />
            <Line k="Statement Period" v={rec.month} />
            <Line k={acct.kind === 'card' ? 'Statement Balance' : 'Statement Ending Balance'} v={money(m.statementBalance)} />
            <Line k="Cleared Balance" v={money(m.clearedBalance)} />
            <Line k="Difference" v="$0.00" accent="#15803d" bold />
            <Line k="Cleared Transactions" v={String(cleared)} />
            <Line k="Uncleared Transactions" v={String(uncleared)} />
          </div>
          <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>After finishing, cleared transactions will be locked for this period. Reopening requires permission and will be recorded in the activity log.</p>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={onConfirm} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#15803d', color: '#fff' }}>Finish Reconciliation</button>
        </div>
      </div>
    </div>
  );
}

function Success({ rec, acct, m, router, id }: any) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/reconciliation" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation</Link>
      <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={card}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-7 h-7" style={{ color: '#15803d' }} /></div>
        <h1 className="text-lg font-bold" style={{ color: '#222' }}>Reconciliation Complete</h1>
        <p className="text-sm" style={{ color: '#6a6a6a' }}>{rec.month} reconciliation is complete for {acct.name}.</p>
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <Stat label="Hotel" value={getEntity(acct.hotelId)?.propertyCode ?? '—'} />
          <Stat label="Account" value={acct.name} />
          <Stat label="Statement Period" value={rec.month} />
          <Stat label={acct.kind === 'card' ? 'Statement Balance' : 'Ending Balance'} value={money(m.statementBalance)} />
          <Stat label="Cleared Balance" value={money(m.clearedBalance)} />
          <Stat label="Difference" value="$0.00" accent="#15803d" />
        </div>
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          <Link href={`/web/accounting/reconciliation/${encodeURIComponent(id)}/report`} className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>View Reconciliation Report</Link>
          <button onClick={() => router.push('/web/accounting/reconciliation')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Go to Dashboard</button>
          <Link href="/web/accounting/month-close" className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Continue Month Close</Link>
        </div>
      </div>
    </div>
  );
}

function SC({ label, value }: { label: string; value: string }) { return <div className="p-3 rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl p-4" style={card}><h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>{title}</h3><div className="flex flex-col">{children}</div></div>; }
function Line({ k, v, bold, accent = '#222' }: { k: string; v: string; bold?: boolean; accent?: string }) { return <div className="flex justify-between gap-3 py-0.5"><span className="text-xs" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-xs" style={{ color: accent, fontWeight: bold ? 700 : 500 }}>{v}</span></div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3 rounded-xl text-left" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
function Wrap({ children }: { children: React.ReactNode }) { return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Link href="/web/accounting/reconciliation" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation</Link>{children}</div>; }
function Empty({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl p-10 text-center" style={{ ...card, borderStyle: 'dashed' }}><p className="text-base font-semibold" style={{ color: '#222' }}>{title}</p><p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>{body}</p></div>; }

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner id={decodeURIComponent(id)} /></Suspense>;
}
