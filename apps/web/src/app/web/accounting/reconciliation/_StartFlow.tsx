'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Landmark, CreditCard, Check, AlertTriangle, AlertCircle, Upload } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctState, startReconciliation } from '../_store';
import { reconAccounts, reconTransactions, blockersForAccount, computeMath, RECON_MONTH, type ReconAccount } from '../_recon';
import { money } from '../_ui';

const STEPS = ['Select Account', 'Statement Details', 'Pre-Check', 'Open Workspace'];

export function StartFlow({ preHotel, preAccountId, onClose }: { preHotel?: string; preAccountId?: string; onClose: () => void }) {
  const router = useRouter();
  const store = useAcctState();
  const [step, setStep] = useState(preAccountId ? 1 : 0);

  // Step 1
  const preAcct = preAccountId ? reconAccounts(store).find((a) => a.id === preAccountId) : undefined;
  const [hotelId, setHotelId] = useState(preHotel ?? preAcct?.hotelId ?? '');
  const [kind, setKind] = useState<'bank' | 'card'>(preAcct?.kind ?? 'bank');
  const [accountId, setAccountId] = useState(preAccountId ?? '');

  const accounts = useMemo(() => hotelId ? reconAccounts(store, hotelId).filter((a) => a.kind === kind) : [], [store, hotelId, kind]);
  const acct = reconAccounts(store).find((a) => a.id === accountId);

  // Step 2
  const [month, setMonth] = useState(RECON_MONTH);
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [beginBalance, setBeginBalance] = useState(acct ? String(acct.beginningBalance) : '');
  const [endBalance, setEndBalance] = useState(acct ? String(acct.statementBalance) : '');
  const [errors, setErrors] = useState<string[]>([]);

  const validate1 = () => { const e: string[] = []; if (!hotelId) e.push('Please select a hotel entity.'); if (!accountId) e.push(`Please select a ${kind === 'bank' ? 'bank account' : 'credit card'}.`); return e; };
  const validate2 = () => { const e: string[] = []; if (!month) e.push('Statement month is required.'); if (!startDate) e.push('Statement start date is required.'); if (!endDate) e.push('Statement end date is required.'); if (!beginBalance) e.push('Beginning balance is required.'); if (!endBalance) e.push(kind === 'bank' ? 'Ending balance is required.' : 'Statement balance is required.'); if (startDate && endDate && endDate < startDate) e.push('Statement end date must be after start date.'); return e; };

  const next = () => { const e = step === 0 ? validate1() : step === 1 ? validate2() : []; if (e.length) { setErrors(e); return; } setErrors([]); setStep((s) => s + 1); };

  const open = () => {
    if (!acct) return;
    const id = startReconciliation({
      accountId: acct.id, hotelId: acct.hotelId, kind: acct.kind, accountName: acct.name, month,
      startDate, endDate, beginningBalance: Number(beginBalance) || acct.beginningBalance, endingBalance: Number(endBalance) || acct.statementBalance,
    });
    router.push(`/web/accounting/reconciliation/${encodeURIComponent(id)}`);
    onClose();
  };

  const blockers = acct ? blockersForAccount(store, acct) : [];
  const precheck = acct ? buildPrecheck(store, acct) : [];

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl flex flex-col max-h-[94vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Start Reconciliation</h2><p className="text-[11px]" style={{ color: '#929292' }}>{STEP_SUB[step]}</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-3 flex items-center gap-1.5 flex-wrap" style={{ borderBottom: '1px solid #f0f0f0', background: '#fcfcfc' }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: i <= step ? '#6a4ec0' : '#f0f0f0', color: i <= step ? '#fff' : '#929292' }}>{i + 1}</div>
              <span className="text-[11px] font-semibold" style={{ color: i === step ? '#222' : '#929292' }}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-3 h-px" style={{ background: '#dddddd' }} />}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
          {errors.length > 0 && <div className="px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5" style={{ background: '#fee2e2', color: '#b91c1c' }}>{errors.map((e) => <span key={e}>• {e}</span>)}</div>}

          {step === 0 && (
            <>
              <Field label="Hotel Entity *"><select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setAccountId(''); }} className={inp} style={inpS}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></Field>
              <Field label="Account Type *">
                <div className="grid grid-cols-2 gap-2">
                  <TypeCard active={kind === 'bank'} onClick={() => { setKind('bank'); setAccountId(''); }} icon={<Landmark className="w-4 h-4" />} title="Bank Account" />
                  <TypeCard active={kind === 'card'} onClick={() => { setKind('card'); setAccountId(''); }} icon={<CreditCard className="w-4 h-4" />} title="Credit Card" />
                </div>
              </Field>
              <Field label={`${kind === 'bank' ? 'Bank Account' : 'Credit Card'} *`}>
                <select value={accountId} onChange={(e) => { const a = accounts.find((x) => x.id === e.target.value); setAccountId(e.target.value); if (a) { setBeginBalance(String(a.beginningBalance)); setEndBalance(String(a.statementBalance)); } }} disabled={!hotelId} className={inp} style={inpS}>
                  <option value="">{hotelId ? 'Select…' : 'Select a hotel first'}</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.institution} ••{a.last4}{a.lastReconciled ? ` · last ${a.lastReconciled}` : ''}</option>)}
                </select>
              </Field>
            </>
          )}

          {step === 1 && acct && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Statement Month *"><input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-05" className={inp} style={inpS} /></Field>
                <Field label="Statement File">{acct.statementUploaded ? <span className="text-xs flex items-center gap-1 h-9" style={{ color: '#15803d' }}><Check className="w-3.5 h-3.5" /> {month} statement uploaded</span> : <span className="text-xs flex items-center gap-1 h-9" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> No statement uploaded</span>}</Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Statement Start Date *"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inp} style={inpS} /></Field>
                <Field label="Statement End Date *"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inp} style={inpS} /></Field>
                <Field label="Beginning Balance *"><input value={beginBalance} onChange={(e) => setBeginBalance(e.target.value)} placeholder="0.00" className={inp} style={inpS} /></Field>
                <Field label={kind === 'bank' ? 'Ending Balance *' : 'Statement Balance *'}><input value={endBalance} onChange={(e) => setEndBalance(e.target.value)} placeholder="0.00" className={inp} style={inpS} /></Field>
              </div>
              {!acct.statementUploaded && (
                <div className="px-3 py-2 rounded-lg text-xs flex items-center justify-between" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <span>No statement file has been uploaded for this account and month.</span>
                  <a href={acct.kind === 'bank' ? `/web/accounting/banking/upload?hotel=${acct.hotelId}` : `/web/accounting/credit-cards/upload?hotel=${acct.hotelId}`} className="font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ color: '#6a4ec0' }}><Upload className="w-3 h-3" /> Upload Statement</a>
                </div>
              )}
              <p className="text-[11px]" style={{ color: '#b0b0b0' }}>Beginning balance should match the ending balance from the previous reconciliation.</p>
            </>
          )}

          {step === 2 && acct && (
            <div className="flex flex-col gap-2">
              <p className="text-xs" style={{ color: '#6a6a6a' }}>StayOps checked whether {acct.name} is ready to reconcile.</p>
              {precheck.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: '#f7f7f7' }}>
                  {c.state === 'complete' ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#15803d' }} /> : c.state === 'warning' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#b45309' }} /> : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#b91c1c' }} />}
                  <span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{c.label}</span>
                  {c.state !== 'complete' && c.action && <a href={c.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{c.action}</a>}
                </div>
              ))}
              {blockers.some((b) => b.severity === 'high') && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>You can open the workspace, but you won’t be able to finish until blocking items are resolved.</p>}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{step === 0 ? 'Cancel' : 'Back'}</button>
          {step < 2 && <button onClick={next} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Continue</button>}
          {step === 2 && <button onClick={open} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Open Reconciliation Workspace</button>}
        </div>
      </div>
    </div>
  );
}

const STEP_SUB = ['Choose the hotel and account you want to reconcile.', 'Enter the statement period and ending balance from the statement.', 'StayOps will check if this account is ready to reconcile.', 'Opening the workspace.'];

function buildPrecheck(store: Parameters<typeof blockersForAccount>[0], acct: ReconAccount) {
  const txs = reconTransactions(acct.id);
  const unposted = txs.filter((t) => t.status !== 'posted').length;
  const dupes = txs.filter((t) => t.duplicate).length;
  const missingReceipt = txs.filter((t) => t.receipt === 'missing').length;
  const list: Array<{ label: string; state: 'complete' | 'warning' | 'blocking'; action?: string; href: string }> = [];
  list.push({ label: acct.statementUploaded ? 'Statement uploaded.' : 'Statement not uploaded.', state: acct.statementUploaded ? 'complete' : 'blocking', action: acct.statementUploaded ? undefined : 'Upload', href: acct.kind === 'bank' ? `/web/accounting/banking/upload?hotel=${acct.hotelId}` : `/web/accounting/credit-cards/upload?hotel=${acct.hotelId}` });
  list.push({ label: `${acct.kind === 'bank' ? 'Bank account mapped to Chart of Accounts.' : 'Credit card mapped to liability account.'}`, state: 'complete', href: '/web/accounting/chart-of-accounts/mapping' });
  list.push({ label: 'Transactions imported for statement period.', state: 'complete', href: '/web/accounting/transactions' });
  list.push({ label: unposted > 0 ? `${unposted} transactions are not posted to books.` : 'Transactions posted to books.', state: unposted > 0 ? 'blocking' : 'complete', action: unposted > 0 ? 'Review Transactions' : undefined, href: '/web/accounting/transactions' });
  list.push({ label: dupes > 0 ? `${dupes} possible duplicates to resolve.` : 'Possible duplicates resolved.', state: dupes > 0 ? 'blocking' : 'complete', action: dupes > 0 ? 'Resolve Duplicates' : undefined, href: '/web/accounting/transactions' });
  if (acct.kind === 'card') list.push({ label: missingReceipt > 0 ? `${missingReceipt} transactions missing receipts but already posted.` : 'Required receipts resolved.', state: missingReceipt > 0 ? 'warning' : 'complete', action: missingReceipt > 0 ? 'Review' : undefined, href: '/web/accounting/transactions' });
  list.push({ label: 'No unbalanced journal entries.', state: 'complete', href: '/web/accounting/transactions' });
  return list;
}

function TypeCard({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return <button onClick={onClick} className="p-3 rounded-xl flex items-center gap-2" style={{ border: `1px solid ${active ? '#6a4ec0' : '#dddddd'}`, background: active ? '#f7f5fd' : '#fff' }}><span style={{ color: active ? '#6a4ec0' : '#6a6a6a' }}>{icon}</span><span className="text-sm font-semibold" style={{ color: '#222' }}>{title}</span></button>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
