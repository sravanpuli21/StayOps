'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Sparkles, Check, X, Plus, Trash2, Receipt, FileText, Wand2, AlertTriangle,
  ArrowRightLeft, Search, Building2,
} from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import type { StatementImport } from '../../_domain';
import type { LiveLine } from '../../_recon2';
import {
  RESOLUTION_TYPES, resolutionLabel, TXN_TYPES, DEPARTMENTS, TIMING_TYPES, TAX_TYPES,
  INVESTIGATION_REASONS, INVESTIGATION_ASSIGNEES, EXCLUDE_REASONS, CODE,
  type ResolutionType, type TxnType, type Dept,
} from '../../_domain';
import {
  groupedCoa, findAccount, liabilityAccounts, equityAccounts, bankAccounts,
  taxAccounts, loanAccounts, ccPayableAccounts, assetAccounts, type CoaOption,
} from '../../_coa2';
import { buildJournal, journalTotals, type CodingInput, type JLine } from '../../_journal';
import {
  saveCoding, postLine, matchExisting, excludeLine, attachReceipt, requestReceipt, type CodingDecision,
} from '../../_store2';
import { card, money, fmtDate, Badge, RECEIPT_STATUS, inputStyle, PURPLE } from '../../_ui';

interface Props { line: LiveLine; imp: StatementImport; sessionId: string; finished: boolean }

/** Local editable coding state, seeded from the store decision or the suggestion. */
interface Draft {
  resolution: ResolutionType;
  txnType: TxnType;
  vendor: string;
  categoryCode: string;
  department: Dept | '';
  memo: string;
  receipt: CodingDecision['receipt'];
  // transfer
  fromCode: string; toCode: string;
  // cc-payment
  cardPayableCode: string;
  // owner
  ownerName: string; ownerEquityCode: string;
  // loan
  principal: string; interest: string; fees: string; escrow: string; loanCode: string;
  // tax
  taxType: string; taxLiabilityCode: string;
  // asset
  assetCode: string; assetName: string;
  // refund
  originalCategoryCode: string;
  // timing
  timingType: string; expectedClear: string;
  // investigation
  investigationReason: string; investigationAssignee: string;
  // exclude
  excludeReason: string;
  // split
  splits: { id: string; categoryCode: string; department: Dept | ''; amount: string; memo: string }[];
}

export function CodingPanel({ line, imp, sessionId, finished }: Props) {
  const draft = useDraft(line, imp);
  const [d, setD] = draft;
  const [toast, setToast] = useState('');
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const hotel = getEntity(imp.hotelId);
  const isCard = imp.statementType === 'credit-card';
  const amt = Math.abs(line.amount);

  // Build the journal preview from the current draft.
  const input = useMemo<CodingInput>(() => toInput(d, line, imp), [d, line, imp]);
  const built = useMemo(() => buildJournal(input), [input]);
  const totals = journalTotals(built.lines);
  const warning = resolutionWarning(d.resolution);

  // Validation gate for posting.
  const validation = validate(d, line, built.nonPosting ?? false, totals.balanced);

  const decision = (): Omit<CodingDecision, 'codedBy' | 'codedAt'> => ({
    lineId: line.id, resolution: d.resolution, txnType: d.txnType, vendor: d.vendor || undefined,
    categoryCode: d.categoryCode || undefined, categoryName: findAccount(d.categoryCode)?.name,
    department: d.department || undefined, memo: d.memo || undefined, receipt: d.receipt,
    splits: d.resolution === 'split' ? d.splits.map((s) => ({ id: s.id, categoryName: findAccount(s.categoryCode)?.name ?? '', categoryCode: s.categoryCode, department: s.department || undefined, amount: Number(s.amount) || 0, memo: s.memo || undefined })) : undefined,
    investigationReason: d.investigationReason || undefined, investigationAssignee: d.investigationAssignee || undefined,
    excludeReason: d.excludeReason || undefined,
    extra: collectExtra(d),
  });

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const doSave = (ready: boolean) => { saveCoding({ ...decision(), ready }, ready ? 'Saved and marked ready' : 'Saved coding'); flash(ready ? 'Coding saved — ready to post.' : 'Coding saved.'); };
  const doPost = (clear: boolean) => {
    if (d.resolution === 'match-existing') { matchExisting(decision(), sessionId, imp.hotelId); flash('Matched — line cleared.'); return; }
    if (d.resolution === 'duplicate') { excludeLine(decision(), sessionId, imp.hotelId); flash('Line excluded.'); return; }
    postLine({ ...decision(), ready: true }, { hotelId: imp.hotelId, dateIso: line.dateIso, sourceType: imp.statementType, lines: built.lines, memo: d.memo }, clear, sessionId);
    flash(clear ? 'Posted and cleared.' : 'Posted to books.');
  };
  const doExclude = () => { excludeLine({ ...decision(), resolution: 'duplicate' }, sessionId, imp.hotelId); flash('Line excluded.'); };
  const doInvestigate = () => { saveCoding({ ...decision(), resolution: 'needs-investigation' }, 'Marked needs investigation'); flash('Marked Needs Investigation.'); };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
      {/* Section 1: statement line */}
      <div className="rounded-2xl p-4" style={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>Statement Line</p>
            <p className="text-base font-bold" style={{ color: '#222' }}>{line.rawDescription}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{line.normalizedDescription}</p>
          </div>
          <p className="text-xl font-bold whitespace-nowrap" style={{ color: line.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(line.amount, { sign: true })}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <Mini label="Date" value={fmtDate(line.dateIso)} />
          <Mini label="Direction" value={isCard ? (line.amount > 0 ? 'Credit' : 'Charge') : (line.amount > 0 ? 'Money In' : 'Money Out')} />
          <Mini label={isCard ? 'Card' : 'Account'} value={`${imp.accountName} ••${imp.accountLast4}`} />
          <Mini label="Statement" value={imp.fileName} />
        </div>
      </div>

      {/* Rule / AI suggestion */}
      {line.suggestedResolution && line.status !== 'posted' && line.status !== 'cleared' && line.status !== 'reconciled' && (
        <div className="rounded-2xl p-3.5" style={{ background: '#f6f4fd', border: `1px solid #e3d9fb` }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: PURPLE }}><Sparkles className="w-3.5 h-3.5" /> Suggested coding</p>
            <div className="flex items-center gap-1.5">
              {line.ruleScope === 'hotel_level' && <Badge label="Hotel-level rule applied" fg="#1d4ed8" bg="#dbeafe" />}
              <Badge label={`${Math.round(line.confidence * 100)}% confidence`} fg={PURPLE} bg="#ece4fb" />
            </div>
          </div>
          <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-0.5" style={{ color: '#3f3f3f' }}>
            <span><b>Resolution:</b> {resolutionLabel(line.suggestedResolution)}</span>
            {line.suggestedVendor && <span><b>Vendor:</b> {line.suggestedVendor}</span>}
            {line.suggestedCategoryName && <span><b>Category:</b> {line.suggestedCategoryName}</span>}
            {line.suggestedDepartment && <span><b>Department:</b> {line.suggestedDepartment}</span>}
            <span><b>Receipt:</b> {line.receiptRequirement === 'required' ? 'Required' : 'Not required'}</span>
            {line.ruleName && <span><b>Reason:</b> {line.ruleName}</span>}
          </div>
          <div className="flex gap-2 mt-2.5">
            <button onClick={() => applySuggestion(line, setD)} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Check className="w-3.5 h-3.5" /> Apply Suggestion</button>
            <button className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Ignore</button>
            <button className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}><Wand2 className="w-3.5 h-3.5" /> Create Rule</button>
          </div>
        </div>
      )}

      {/* Section 2: resolution type */}
      <div className="rounded-2xl p-4" style={card}>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>What is this line?</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
          {RESOLUTION_TYPES.map((rt) => (
            <button key={rt.key} onClick={() => set('resolution', rt.key)} disabled={finished} title={rt.hint}
              className="px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold leading-tight" style={{ border: `1px solid ${d.resolution === rt.key ? PURPLE : '#e5e5e5'}`, background: d.resolution === rt.key ? '#f0eefb' : '#fff', color: d.resolution === rt.key ? PURPLE : '#3f3f3f' }}>
              {rt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: '#929292' }}>{RESOLUTION_TYPES.find((r) => r.key === d.resolution)?.hint}</p>
      </div>

      {warning && (
        <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{warning}</span>
        </div>
      )}

      {/* Section 3: resolution-specific fields */}
      {!finished && (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
          <ResolutionFields d={d} set={set} line={line} imp={imp} />
        </div>
      )}

      {/* Journal preview */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#f7f7f7', borderBottom: '1px solid #eee' }}>
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Journal Entry Preview</p>
          {built.nonPosting ? <Badge label="No Posting" fg="#6a6a6a" bg="#f0f0f0" /> : totals.balanced ? <Badge label="Balanced" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Balanced" fg="#b91c1c" bg="#fee2e2" />}
        </div>
        {built.nonPosting ? (
          <p className="px-4 py-4 text-xs" style={{ color: '#6a6a6a' }}>{built.explanation}</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {['Account', 'Debit', 'Credit'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2 px-4" style={{ color: '#929292', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {built.lines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <td className="py-2 px-4 text-sm" style={{ color: '#222' }}>{l.code && <span className="font-mono text-[11px] mr-1.5" style={{ color: '#929292' }}>{l.code}</span>}{l.account}{l.memo && <span className="text-[11px] ml-1" style={{ color: '#929292' }}>· {l.memo}</span>}</td>
                    <td className="py-2 px-4 text-sm text-right" style={{ color: l.debit ? '#222' : '#ddd' }}>{l.debit ? money(l.debit) : '—'}</td>
                    <td className="py-2 px-4 text-sm text-right" style={{ color: l.credit ? '#222' : '#ddd' }}>{l.credit ? money(l.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ borderTop: '1px solid #eee', background: '#fafafa' }}>
                <td className="py-2 px-4 text-xs font-bold" style={{ color: '#6a6a6a' }}>Totals</td>
                <td className="py-2 px-4 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totals.debit)}</td>
                <td className="py-2 px-4 text-sm text-right font-bold" style={{ color: '#222' }}>{money(totals.credit)}</td>
              </tr></tfoot>
            </table>
            <p className="px-4 py-2 text-[11px]" style={{ color: '#6a6a6a', borderTop: '1px solid #f7f7f7' }}>{built.explanation}</p>
          </>
        )}
      </div>

      {/* Validation message */}
      {validation && <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {validation}</div>}

      {/* Receipt strip */}
      {(d.receipt === 'required' || d.receipt === 'missing' || d.receipt === 'requested' || d.receipt === 'attached') && (
        <div className="rounded-xl p-3 flex items-center justify-between gap-2" style={{ background: '#f7f7f7' }}>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" style={{ color: '#6a6a6a' }} />
            <span className="text-xs font-medium" style={{ color: '#222' }}>Receipt</span>
            <Badge label={RECEIPT_STATUS[d.receipt ?? 'not-required'].label} fg={RECEIPT_STATUS[d.receipt ?? 'not-required'].fg} bg={RECEIPT_STATUS[d.receipt ?? 'not-required'].bg} />
          </div>
          {!finished && d.receipt !== 'attached' && (
            <div className="flex gap-2">
              <button onClick={() => { attachReceipt(line.id, `receipt-${line.id}.pdf`, imp.hotelId); set('receipt', 'attached'); flash('Receipt attached.'); }} className="h-7 px-2.5 rounded-lg text-[11px] font-semibold" style={{ background: PURPLE, color: '#fff' }}>Attach Receipt</button>
              <button onClick={() => { requestReceipt(line.id, INVESTIGATION_ASSIGNEES[0], imp.hotelId); set('receipt', 'requested'); flash('Receipt requested from GM.'); }} className="h-7 px-2.5 rounded-lg text-[11px] font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Request Receipt</button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!finished && (
        <div className="flex flex-wrap gap-2 sticky bottom-0 pt-1 pb-1">
          <Btn onClick={() => doSave(false)} kind="ghost">Save Coding</Btn>
          <Btn onClick={() => doSave(true)} kind="ghost">Save &amp; Mark Ready</Btn>
          {d.resolution === 'match-existing' ? (
            <Btn onClick={() => doPost(true)} kind="primary" disabled={!!validation}>Match &amp; Clear</Btn>
          ) : d.resolution === 'duplicate' ? (
            <Btn onClick={doExclude} kind="primary">Exclude Line</Btn>
          ) : d.resolution === 'timing-difference' || d.resolution === 'needs-investigation' ? (
            <Btn onClick={() => doSave(false)} kind="primary">Save Resolution</Btn>
          ) : (
            <>
              <Btn onClick={() => doPost(false)} kind="ghost" disabled={!!validation}>Post to Books</Btn>
              <Btn onClick={() => doPost(true)} kind="primary" disabled={!!validation}>Post &amp; Clear</Btn>
            </>
          )}
          <div className="ml-auto flex gap-2">
            <Btn onClick={doInvestigate} kind="ghost">Needs Investigation</Btn>
            <Btn onClick={doExclude} kind="ghost">Exclude</Btn>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg" style={{ background: '#15803d', color: '#fff' }}>{toast}</div>}
    </div>
  );
}

/* ── Resolution-specific field groups ─────────────────────────────────── */
function ResolutionFields({ d, set, line, imp }: { d: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void; line: LiveLine; imp: StatementImport }) {
  const h = imp.hotelId;
  switch (d.resolution) {
    case 'create-transaction':
      return (
        <>
          <Row>
            <Field label="Transaction Type"><Select value={d.txnType} onChange={(v) => set('txnType', v as TxnType)} options={TXN_TYPES.map((t) => ({ value: t, label: t }))} /></Field>
            <Field label="Vendor / Payee"><Text value={d.vendor} onChange={(v) => set('vendor', v)} placeholder="Search or create vendor…" /></Field>
          </Row>
          <Row>
            <Field label="Category (Chart of Accounts)"><CoaSelect hotelId={h} resolution="create-transaction" txnType={d.txnType} value={d.categoryCode} onChange={(v) => set('categoryCode', v)} /></Field>
            <Field label="Department"><Select value={d.department} onChange={(v) => set('department', v as Dept)} options={[{ value: '', label: 'Select…' }, ...DEPARTMENTS.map((x) => ({ value: x, label: x }))]} /></Field>
          </Row>
          <Field label="Memo"><Text value={d.memo} onChange={(v) => set('memo', v)} placeholder="Optional note…" /></Field>
        </>
      );
    case 'match-existing':
      return <MatchCandidates line={line} />;
    case 'transfer':
      return (
        <Row>
          <Field label="From Account"><Select value={d.fromCode} onChange={(v) => set('fromCode', v)} options={[{ value: imp.sourceAccountCode, label: `${imp.accountName} (this statement)` }, ...bankAccounts(h).filter((a) => a.code !== imp.sourceAccountCode).map(opt)]} /></Field>
          <Field label="To Account"><Select value={d.toCode} onChange={(v) => set('toCode', v)} options={[{ value: '', label: 'Select…' }, ...bankAccounts(h).map(opt)]} /></Field>
        </Row>
      );
    case 'cc-payment':
      return (
        <>
          <Row>
            <Field label="Bank Account Paid From"><Text value={imp.accountName} onChange={() => {}} disabled /></Field>
            <Field label="Credit Card Paid"><Select value={d.cardPayableCode} onChange={(v) => set('cardPayableCode', v)} options={[{ value: '', label: 'Select card payable…' }, ...ccPayableAccounts(h).map(opt)]} /></Field>
          </Row>
          <Field label="Memo"><Text value={d.memo} onChange={(v) => set('memo', v)} placeholder={`Payment for ${imp.month} statement`} /></Field>
        </>
      );
    case 'split':
      return <SplitEditor d={d} set={set} line={line} imp={imp} />;
    case 'owner-contribution':
    case 'owner-draw':
      return (
        <Row>
          <Field label="Owner Name"><Text value={d.ownerName} onChange={(v) => set('ownerName', v)} placeholder="Owner / member name" /></Field>
          <Field label="Equity Account"><Select value={d.ownerEquityCode} onChange={(v) => set('ownerEquityCode', v)} options={[{ value: '', label: 'Select…' }, ...equityAccounts(h).map(opt)]} /></Field>
        </Row>
      );
    case 'loan-payment':
      return (
        <>
          <Field label="Loan Account"><Select value={d.loanCode} onChange={(v) => set('loanCode', v)} options={[{ value: '', label: 'Select loan…' }, ...loanAccounts(h).map(opt)]} /></Field>
          <Row>
            <Field label="Principal"><Money value={d.principal} onChange={(v) => set('principal', v)} /></Field>
            <Field label="Interest"><Money value={d.interest} onChange={(v) => set('interest', v)} /></Field>
          </Row>
          <Row>
            <Field label="Fees"><Money value={d.fees} onChange={(v) => set('fees', v)} /></Field>
            <Field label="Escrow (optional)"><Money value={d.escrow} onChange={(v) => set('escrow', v)} /></Field>
          </Row>
        </>
      );
    case 'tax-payment':
      return (
        <Row>
          <Field label="Tax Type"><Select value={d.taxType} onChange={(v) => set('taxType', v)} options={TAX_TYPES.map((t) => ({ value: t, label: t }))} /></Field>
          <Field label="Liability Account"><Select value={d.taxLiabilityCode} onChange={(v) => set('taxLiabilityCode', v)} options={[{ value: '', label: 'Select…' }, ...taxAccounts(h).map(opt)]} /></Field>
        </Row>
      );
    case 'asset-purchase':
      return (
        <>
          <Row>
            <Field label="Asset Account"><Select value={d.assetCode} onChange={(v) => set('assetCode', v)} options={[{ value: '', label: 'Select…' }, ...assetAccounts(h).filter((a) => a.detailType === 'Fixed Asset').map(opt)]} /></Field>
            <Field label="Item Name"><Text value={d.assetName} onChange={(v) => set('assetName', v)} placeholder="e.g. Lobby TV 65in" /></Field>
          </Row>
          <Field label="Memo"><Text value={d.memo} onChange={(v) => set('memo', v)} placeholder="Location / serial / warranty…" /></Field>
        </>
      );
    case 'refund':
      return (
        <Row>
          <Field label="Original Vendor"><Text value={d.vendor} onChange={(v) => set('vendor', v)} placeholder="Vendor that issued the refund" /></Field>
          <Field label="Original Category"><CoaSelect hotelId={h} resolution="refund" value={d.originalCategoryCode} onChange={(v) => set('originalCategoryCode', v)} /></Field>
        </Row>
      );
    case 'timing-difference':
      return (
        <Row>
          <Field label="Timing Difference Type"><Select value={d.timingType} onChange={(v) => set('timingType', v)} options={TIMING_TYPES.map((t) => ({ value: t, label: t }))} /></Field>
          <Field label="Expected Clear Date"><Text value={d.expectedClear} onChange={(v) => set('expectedClear', v)} placeholder="YYYY-MM-DD" /></Field>
        </Row>
      );
    case 'needs-investigation':
      return (
        <>
          <Row>
            <Field label="Reason"><Select value={d.investigationReason} onChange={(v) => set('investigationReason', v)} options={INVESTIGATION_REASONS.map((t) => ({ value: t, label: t }))} /></Field>
            <Field label="Assign To"><Select value={d.investigationAssignee} onChange={(v) => set('investigationAssignee', v)} options={[{ value: '', label: 'Select…' }, ...INVESTIGATION_ASSIGNEES.map((t) => ({ value: t, label: t }))]} /></Field>
          </Row>
          <Field label="Notes"><Text value={d.memo} onChange={(v) => set('memo', v)} placeholder="What needs to be figured out?" /></Field>
        </>
      );
    case 'duplicate':
      return (
        <>
          <Field label="Reason"><Select value={d.excludeReason} onChange={(v) => set('excludeReason', v)} options={EXCLUDE_REASONS.map((t) => ({ value: t, label: t }))} /></Field>
          <Field label="Notes"><Text value={d.memo} onChange={(v) => set('memo', v)} placeholder="Why is this excluded?" /></Field>
        </>
      );
    default:
      return null;
  }
}

/* ── Split editor ─────────────────────────────────────────────────────── */
function SplitEditor({ d, set, line, imp }: { d: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void; line: LiveLine; imp: StatementImport }) {
  const total = Math.abs(line.amount);
  const splitSum = d.splits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const remaining = Math.round((total - splitSum) * 100) / 100;
  const addSplit = () => set('splits', [...d.splits, { id: `sp-${d.splits.length}-${Math.random().toString(36).slice(2, 5)}`, categoryCode: '', department: '', amount: String(remaining > 0 ? remaining : ''), memo: '' }]);
  const upd = (id: string, patch: Partial<Draft['splits'][number]>) => set('splits', d.splits.map((s) => s.id === id ? { ...s, ...patch } : s));
  const del = (id: string) => set('splits', d.splits.filter((s) => s.id !== id));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Split into categories</p>
        <span className="text-xs font-semibold" style={{ color: Math.abs(remaining) < 0.005 ? '#15803d' : '#b91c1c' }}>Remaining: {money(remaining)}</span>
      </div>
      {d.splits.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex-1"><CoaSelect hotelId={imp.hotelId} resolution="create-transaction" value={s.categoryCode} onChange={(v) => upd(s.id, { categoryCode: v })} /></div>
          <select value={s.department} onChange={(e) => upd(s.id, { department: e.target.value as Dept })} className="h-9 px-2 rounded-lg text-xs w-32" style={inputStyle}>
            <option value="">Dept…</option>{DEPARTMENTS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <input value={s.amount} onChange={(e) => upd(s.id, { amount: e.target.value })} placeholder="0.00" className="h-9 px-2 rounded-lg text-xs w-24 text-right" style={inputStyle} />
          <button onClick={() => del(s.id)}><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>
        </div>
      ))}
      <button onClick={addSplit} className="h-8 px-3 rounded-lg text-xs font-semibold self-start inline-flex items-center gap-1.5" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add Split Line</button>
    </div>
  );
}

/* ── Match candidates (mocked) ────────────────────────────────────────── */
function MatchCandidates({ line }: { line: LiveLine }) {
  const amt = Math.abs(line.amount);
  const candidates = [
    { date: line.dateIso, desc: line.normalizedDescription, vendor: line.suggestedVendor ?? '—', amount: amt, je: 'JE-3981', confidence: 0.94 },
    { date: line.dateIso, desc: `${line.suggestedVendor ?? 'Vendor'} bill payment`, vendor: line.suggestedVendor ?? '—', amount: amt, je: 'JE-3902', confidence: 0.71 },
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Matching candidates in the books</p>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
        {candidates.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5" style={{ borderBottom: i < candidates.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
            <div className="min-w-0"><p className="text-sm truncate" style={{ color: '#222' }}>{c.desc}</p><p className="text-[11px]" style={{ color: '#929292' }}>{fmtDate(c.date)} · {c.vendor} · {c.je}</p></div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge label={`${Math.round(c.confidence * 100)}%`} fg={PURPLE} bg="#ece4fb" />
              <span className="text-sm font-semibold" style={{ color: '#222' }}>{money(c.amount)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px]" style={{ color: '#929292' }}>Matching links this line to an existing transaction — no duplicate journal entry is created.</p>
    </div>
  );
}

/* ── Inputs ───────────────────────────────────────────────────────────── */
const opt = (a: CoaOption) => ({ value: a.code, label: `${a.code} · ${a.name}` });
function Row({ children }: { children: React.ReactNode }) { return <div className="grid md:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Text({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="h-9 px-2.5 rounded-lg text-sm w-full" style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }} />;
}
function Money({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className="h-9 px-2.5 rounded-lg text-sm w-full text-right" style={inputStyle} />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
function CoaSelect({ hotelId, resolution, txnType, value, onChange }: { hotelId: string; resolution: ResolutionType; txnType?: string; value: string; onChange: (v: string) => void }) {
  const groups = groupedCoa(hotelId, resolution, txnType);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>
      <option value="">Select account…</option>
      {groups.map((g) => <optgroup key={g.section} label={g.section}>{g.options.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.name}</option>)}</optgroup>)}
    </select>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-xs font-medium truncate" style={{ color: '#222' }}>{value}</p></div>;
}
function Btn({ children, onClick, kind, disabled }: { children: React.ReactNode; onClick: () => void; kind: 'primary' | 'ghost'; disabled?: boolean }) {
  const primary = kind === 'primary';
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} className="h-9 px-3.5 rounded-xl text-xs font-semibold" style={{ background: disabled ? '#dddddd' : primary ? PURPLE : '#fff', color: primary || disabled ? '#fff' : '#6a6a6a', border: primary || disabled ? 'none' : '1px solid #dddddd', cursor: disabled ? 'not-allowed' : 'pointer' }}>{children}</button>;
}

/* ── Draft state hook ─────────────────────────────────────────────────── */
function blankDraft(line: LiveLine, imp: StatementImport): Draft {
  const c = line.coding;
  return {
    resolution: c?.resolution ?? line.suggestedResolution ?? 'create-transaction',
    txnType: c?.txnType ?? line.suggestedTxnType ?? 'Expense',
    vendor: c?.vendor ?? line.suggestedVendor ?? '',
    categoryCode: c?.categoryCode ?? line.suggestedCategoryCode ?? '',
    department: (c?.department ?? line.suggestedDepartment ?? '') as Dept | '',
    memo: c?.memo ?? '',
    receipt: c?.receipt ?? line.receiptRequirement,
    fromCode: imp.sourceAccountCode, toCode: '',
    cardPayableCode: '',
    ownerName: '', ownerEquityCode: line.suggestedResolution === 'owner-draw' ? CODE.ownerDraw : CODE.ownerContribution,
    principal: line.suggestedResolution === 'loan-payment' ? String(Math.round(Math.abs(line.amount) * 0.8)) : '',
    interest: line.suggestedResolution === 'loan-payment' ? String(Math.round(Math.abs(line.amount) * 0.2)) : '',
    fees: '', escrow: '', loanCode: line.suggestedCategoryCode ?? CODE.loanPayable,
    taxType: 'Occupancy Tax', taxLiabilityCode: line.suggestedCategoryCode ?? CODE.occTax,
    assetCode: CODE.equipment, assetName: '',
    originalCategoryCode: line.suggestedCategoryCode ?? '',
    timingType: 'Deposit in Transit', expectedClear: '',
    investigationReason: '', investigationAssignee: '',
    excludeReason: 'Duplicate',
    splits: [],
  };
}
function useDraft(line: LiveLine, imp: StatementImport) {
  const [d, setD] = useState<Draft>(() => blankDraft(line, imp));
  // Reset the draft whenever the selected line changes.
  useEffect(() => { setD(blankDraft(line, imp)); /* eslint-disable-next-line */ }, [line.id]);
  return [d, setD] as const;
}

function applySuggestion(line: LiveLine, setD: React.Dispatch<React.SetStateAction<Draft>>) {
  setD((p) => ({
    ...p,
    resolution: line.suggestedResolution,
    txnType: line.suggestedTxnType ?? p.txnType,
    vendor: line.suggestedVendor ?? p.vendor,
    categoryCode: line.suggestedCategoryCode ?? p.categoryCode,
    department: (line.suggestedDepartment ?? p.department) as Dept | '',
    receipt: line.receiptRequirement,
    taxLiabilityCode: line.suggestedResolution === 'tax-payment' ? (line.suggestedCategoryCode ?? p.taxLiabilityCode) : p.taxLiabilityCode,
    loanCode: line.suggestedResolution === 'loan-payment' ? (line.suggestedCategoryCode ?? p.loanCode) : p.loanCode,
  }));
}

/* ── Build the journal input from the draft ───────────────────────────── */
function toInput(d: Draft, line: LiveLine, imp: StatementImport): CodingInput {
  const base: CodingInput = {
    resolution: d.resolution, amount: Math.abs(line.amount), direction: line.amount < 0 ? 'out' : 'in',
    statementType: imp.statementType, sourceAccountName: imp.accountName, sourceAccountCode: imp.sourceAccountCode,
    memo: d.memo,
  };
  switch (d.resolution) {
    case 'create-transaction':
    case 'refund': {
      const cat = findAccount(d.resolution === 'refund' ? d.originalCategoryCode : d.categoryCode);
      return { ...base, categoryName: cat?.name, categoryCode: cat?.code, originalCategoryName: cat?.name, originalCategoryCode: cat?.code };
    }
    case 'transfer': {
      const from = findAccount(d.fromCode) ?? { name: imp.accountName, code: imp.sourceAccountCode };
      const to = findAccount(d.toCode);
      return { ...base, fromAccountName: from?.name, fromCode: from?.code, toAccountName: to?.name, toCode: to?.code };
    }
    case 'cc-payment': {
      const cc = findAccount(d.cardPayableCode);
      return { ...base, cardPayableName: cc?.name, cardPayableCode: cc?.code };
    }
    case 'split':
      return { ...base, splits: d.splits.map((s) => ({ categoryName: findAccount(s.categoryCode)?.name ?? 'Uncategorized', categoryCode: s.categoryCode, department: s.department || undefined, amount: Number(s.amount) || 0, memo: s.memo })), cardPayableName: 'Credit Cards Payable', cardPayableCode: CODE.ccPayable };
    case 'owner-contribution':
    case 'owner-draw': {
      const eq = findAccount(d.ownerEquityCode);
      return { ...base, ownerEquityName: eq?.name, ownerEquityCode: eq?.code };
    }
    case 'loan-payment': {
      const loan = findAccount(d.loanCode);
      return { ...base, principal: Number(d.principal) || 0, interest: Number(d.interest) || 0, fees: Number(d.fees) || 0, escrow: Number(d.escrow) || 0, loanAccountName: loan?.name, loanCode: loan?.code };
    }
    case 'tax-payment': {
      const tax = findAccount(d.taxLiabilityCode);
      return { ...base, taxLiabilityName: tax?.name, taxLiabilityCode: tax?.code };
    }
    case 'asset-purchase': {
      const asset = findAccount(d.assetCode);
      return { ...base, assetAccountName: d.assetName ? `${asset?.name}` : asset?.name, assetCode: asset?.code, cardPayableName: 'Credit Cards Payable', cardPayableCode: CODE.ccPayable };
    }
    default:
      return base;
  }
}

function collectExtra(d: Draft): Record<string, string | number> {
  const e: Record<string, string | number> = {};
  if (d.resolution === 'loan-payment') { e.principal = Number(d.principal) || 0; e.interest = Number(d.interest) || 0; e.fees = Number(d.fees) || 0; }
  if (d.resolution === 'tax-payment') e.taxType = d.taxType;
  if (d.resolution === 'timing-difference') { e.timingType = d.timingType; e.expectedClear = d.expectedClear; }
  if (d.resolution === 'transfer') { e.fromCode = d.fromCode; e.toCode = d.toCode; }
  if (d.resolution === 'owner-contribution' || d.resolution === 'owner-draw') e.ownerName = d.ownerName;
  return e;
}

/* ── Validation + warnings ────────────────────────────────────────────── */
function validate(d: Draft, line: LiveLine, nonPosting: boolean, balanced: boolean): string | null {
  if (nonPosting) return null;
  if (d.resolution === 'create-transaction') {
    if ((d.txnType === 'Expense' || d.txnType === 'Other') && !d.vendor) return 'Vendor is required for this transaction type.';
    if (!d.categoryCode) return 'Category is required before posting.';
    if (!d.department) return 'Department is required before posting.';
    if ((d.receipt === 'required' || d.receipt === 'missing') && Math.abs(line.amount) > 250) return 'Receipt is required before posting.';
  }
  if (d.resolution === 'transfer') {
    if (!d.toCode) return 'Select the account money is transferred to.';
    if (d.fromCode === d.toCode) return 'From and To accounts cannot be the same.';
  }
  if (d.resolution === 'cc-payment' && !d.cardPayableCode) return 'Credit card payments should map to Credit Cards Payable, not expense.';
  if (d.resolution === 'tax-payment' && !d.taxLiabilityCode) return 'Tax payments should map to a tax payable account.';
  if (d.resolution === 'loan-payment') {
    const sum = (Number(d.principal) || 0) + (Number(d.interest) || 0) + (Number(d.fees) || 0) + (Number(d.escrow) || 0);
    if (Math.abs(sum - Math.abs(line.amount)) > 0.005) return `Principal, interest, fees, and escrow must equal ${money(Math.abs(line.amount))}.`;
  }
  if (d.resolution === 'split') {
    const sum = d.splits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    if (Math.abs(sum - Math.abs(line.amount)) > 0.005) return `Split total must equal ${money(Math.abs(line.amount))}.`;
    if (d.splits.some((s) => !s.categoryCode)) return 'Every split line needs a category.';
  }
  if (d.resolution === 'owner-contribution' || d.resolution === 'owner-draw') { if (!d.ownerEquityCode) return 'Select an equity account.'; }
  if (d.resolution === 'asset-purchase' && !d.assetCode) return 'Select a fixed asset account.';
  if (!balanced) return 'Journal entry is not balanced. Total debits must equal total credits.';
  return null;
}
function resolutionWarning(r: ResolutionType): string | null {
  switch (r) {
    case 'cc-payment': return 'This looks like a credit card payment. Do not categorize it as an expense.';
    case 'tax-payment': return 'This looks like a tax payment. It should reduce a tax payable liability, not hit expense.';
    case 'loan-payment': return 'This looks like a loan payment. Split principal and interest before posting.';
    case 'timing-difference': return 'Do not create a duplicate transaction for a valid timing difference — carry it as a reconciling item.';
    default: return null;
  }
}
