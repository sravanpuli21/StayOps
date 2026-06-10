'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, AlertTriangle, UploadCloud, FileText, Landmark, CreditCard, Check,
} from 'lucide-react';
import { HOTEL_ENTITIES, bankAccountsForHotel, creditCardsForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { startManualReconciliation } from '../../_store2';
import {
  genBookTransactions, hotelLabel, CODE, ACCOUNTANT,
  type StatementType, type StatementSource, type StatementImport,
  STATEMENT_SOURCES,
} from '../../_domain';
import { accountCycle, validatePeriod } from '../../_cycle';
import { card, money, Badge, PageHeader, inputCls, inputStyle, PURPLE, fmtDate } from '../../_ui';

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();

  const preHotel = params.get('hotel') ?? (selection.kind === 'hotel' ? selection.hotelId : '');
  const preType = (params.get('type') as StatementType) ?? 'bank';
  const preAccount = params.get('account') ?? '';

  const [hotelId, setHotelId] = useState(preHotel);
  const [acctType, setAcctType] = useState<StatementType>(preType);
  const [accountId, setAccountId] = useState(preAccount);
  const [source, setSource] = useState<StatementSource>('manual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endBalance, setEndBalance] = useState('');
  const [beginOverride, setBeginOverride] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [seeded, setSeeded] = useState(false);

  const accounts = hotelId ? (acctType === 'bank' ? bankAccountsForHotel(hotelId) : creditCardsForHotel(hotelId)) : [];
  const acct = accounts.find((a) => a.id === accountId);

  // If we arrived with ?account=, seed its cycle dates once.
  if (preAccount && acct && !seeded) {
    const beg = 'openingBalance' in acct ? (acct as any).openingBalance : 0;
    const type = 'type' in acct ? (acct as any).type : 'Credit Card';
    const c = accountCycle(acct.name, type, acctType, beg);
    setStartDate(c.statementStart); setEndDate(c.statementEnd); setSeeded(true);
  }

  // Cycle is derived from the account's prior reconciliation (auto-filled).
  const cycle = useMemo(() => {
    if (!acct) return null;
    const beg = 'openingBalance' in acct ? (acct as any).openingBalance : 0;
    const type = 'type' in acct ? (acct as any).type : 'Credit Card';
    return accountCycle(acct.name, type, acctType, beg);
  }, [acct, acctType]);

  // Seed the date/balance inputs from the cycle when the account changes.
  const onAccount = (id: string) => {
    setAccountId(id);
    const a = accounts.find((x) => x.id === id);
    if (!a) return;
    const beg = 'openingBalance' in a ? (a as any).openingBalance : 0;
    const type = 'type' in a ? (a as any).type : 'Credit Card';
    const c = accountCycle(a.name, type, acctType, beg);
    setStartDate(c.statementStart);
    setEndDate(c.statementEnd);
    setEndBalance('');
  };

  const beginningBalance = beginOverride !== '' ? Number(beginOverride) : (cycle?.lastReconciledBalance ?? 0);
  const periodCheck = cycle ? validatePeriod(cycle.lastReconciledThrough, startDate) : { kind: 'ok' as const };

  const start = () => {
    if (!hotelId) return setError('Please select a hotel entity.');
    if (!accountId || !acct) return setError('Please select a bank account or credit card.');
    if (!endDate) return setError('Please enter the current statement end date.');
    if (source !== 'manual' && source !== 'pdf-printed' && source !== 'existing') {
      // CSV → hand off to the upload flow with the account pre-selected.
      router.push(`/web/accounting/statements/upload?hotel=${hotelId}`);
      return;
    }
    if (!endBalance) return setError('Please enter the statement ending balance.');

    const sessionId = `manual-${accountId}-${endDate}-${Math.random().toString(36).slice(2, 6)}`;
    const book = genBookTransactions({ sessionId, hotelId, statementType: acctType, accountId, start: startDate, end: endDate, beginningBalance });
    const institution = 'bank' in acct ? (acct as any).bank : (acct as any).issuer;
    const sourceAccountCode = acctType === 'bank'
      ? ((acct as any).type === 'Payroll Checking' ? CODE.payroll : (acct as any).type === 'Reserve' ? CODE.reserve : CODE.operating)
      : (acct.name.includes('GM') ? CODE.gmCard : CODE.corporateCard);
    const imp: StatementImport = {
      id: sessionId, hotelId, statementType: acctType, accountId, accountName: acct.name, accountLast4: acct.last4,
      institution, sourceAccountCode, cardHolder: 'cardHolder' in acct ? (acct as any).cardHolder : undefined,
      month: endDate.slice(0, 7), startDate, endDate,
      beginningBalance, endingBalance: Number(endBalance),
      fileName: pdfName || 'Manual reconciliation (no CSV)', uploadedBy: ACCOUNTANT, uploadedIso: '2026-06-09T12:00:00Z',
      seedStatus: 'in-review', source, mode: 'classic',
      lastReconciledThrough: cycle?.lastReconciledThrough, lastReconciledBalance: cycle?.lastReconciledBalance,
      pdfName: pdfName || undefined, notes: notes || undefined,
      paymentDueDate: acctType === 'credit-card' ? undefined : undefined,
    };
    startManualReconciliation(imp, book.lines);
    router.push(`/web/accounting/reconciliation-workbench/${sessionId}?mode=classic`);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/reconciliation-workbench')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation Workbench</button>
      <PageHeader title="Start Reconciliation" subtitle="Reconcile any account against its own statement cycle — with or without a CSV import." />

      <div className="p-6 flex flex-col gap-4" style={card}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Hotel Entity">
            <select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setAccountId(''); }} className={inputCls} style={inputStyle}>
              <option value="">Select hotel…</option>
              {HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}
            </select>
          </Field>
          <Field label="Account Type">
            <select value={acctType} onChange={(e) => { setAcctType(e.target.value as StatementType); setAccountId(''); }} className={inputCls} style={inputStyle}>
              <option value="bank">Bank Account</option>
              <option value="credit-card">Credit Card</option>
            </select>
          </Field>
          <Field label={acctType === 'bank' ? 'Account' : 'Card'}>
            <select value={accountId} onChange={(e) => onAccount(e.target.value)} disabled={!hotelId} className={inputCls} style={inputStyle}>
              <option value="">{hotelId ? 'Select…' : 'Pick a hotel first'}</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · ••{a.last4}</option>)}
            </select>
          </Field>
          <Field label="Statement Source">
            <select value={source} onChange={(e) => setSource(e.target.value as StatementSource)} className={inputCls} style={inputStyle}>
              {STATEMENT_SOURCES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>
        </div>

        {acct && cycle && (
          <div className="rounded-xl p-3.5 grid grid-cols-2 md:grid-cols-3 gap-3" style={{ background: '#f6f4fd', border: '1px solid #e3d9fb' }}>
            <Auto label="Last Reconciled Through" value={fmtDate(cycle.lastReconciledThrough)} />
            <Auto label="Last Reconciled Balance" value={money(cycle.lastReconciledBalance)} />
            <Auto label="Beginning Balance" value={money(beginningBalance)} accent={PURPLE} />
          </div>
        )}

        {acct && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Current Statement Start Date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
              <Field label="Current Statement End Date"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
              <Field label={acctType === 'bank' ? 'Statement Ending Balance' : 'Statement Balance'}><input value={endBalance} onChange={(e) => setEndBalance(e.target.value)} placeholder="$0.00" className={inputCls} style={inputStyle} /></Field>
              <Field label="Beginning Balance Override (optional)"><input value={beginOverride} onChange={(e) => setBeginOverride(e.target.value)} placeholder={money(cycle?.lastReconciledBalance ?? 0)} className={inputCls} style={inputStyle} /></Field>
            </div>

            {periodCheck.kind !== 'ok' && (
              <Warn>{periodCheck.message}</Warn>
            )}
            {beginOverride !== '' && Math.abs(Number(beginOverride) - (cycle?.lastReconciledBalance ?? 0)) > 0.005 && (
              <Warn>Beginning balance does not match the previous reconciliation ending balance of {money(cycle?.lastReconciledBalance ?? 0)}. Continuing with an override will be recorded in the audit log.</Warn>
            )}

            {(source === 'pdf-printed' || source === 'manual') && (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Attach PDF / Printed Statement (optional)">
                  <label className="flex items-center gap-2 h-9 px-2.5 rounded-lg cursor-pointer" style={{ border: '1px dashed #dddddd', background: '#fafafa' }}>
                    <UploadCloud className="w-4 h-4" style={{ color: PURPLE }} />
                    <span className="text-xs truncate" style={{ color: pdfName ? '#222' : '#929292' }}>{pdfName || 'Upload statement PDF…'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? `statement-${endDate}.pdf`)} />
                  </label>
                </Field>
                <Field label="Notes (optional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Statement printed from bank portal" className={inputCls} style={inputStyle} /></Field>
              </div>
            )}
          </>
        )}

        {error && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {error}</div>}

        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <p className="text-xs max-w-md" style={{ color: '#929292' }}>{STATEMENT_SOURCES.find((s) => s.key === source)?.hint}</p>
          <button onClick={start} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}>
            {source === 'csv' ? 'Continue to CSV Import' : 'Start Reconciliation'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Auto({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}
function Warn({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{children}</span></div>;
}

export default function StartReconciliationPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
