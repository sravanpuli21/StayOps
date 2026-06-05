'use client';

import { useState, useMemo } from 'react';
import { X, Globe, Building2, Plus, Trash2, CheckCircle2, FlaskConical } from 'lucide-react';
import {
  HOTEL_ENTITIES, getEntity, COA_TEMPLATE,
  type RichRule, type RuleScope, type RuleSource, type CondField, type CondOperator,
  type TxType, type RuleCondition, ruleMatches, txMatchesRule, ACCT_TRANSACTIONS,
} from '@hos/shared/accounting-os';
import { createRichRule, logRuleApplied, useAcctState } from '../_store';
import { money } from '../_ui';
import { DEPTS } from '../vendors/_constants';

const STEPS = ['Rule Scope', 'Conditions', 'Actions', 'Review & Test', 'Save'];
const TX_TYPES: TxType[] = ['Expense', 'Revenue Deposit', 'Transfer', 'Credit Card Payment', 'Owner Contribution', 'Owner Draw', 'Owner Expense', 'Loan Payment', 'Bank Fee', 'Payroll', 'Asset Purchase', 'Refund or Credit', 'Other'];
const FIELDS: CondField[] = ['Description', 'Amount', 'Source', 'Bank Account', 'Credit Card', 'Card Holder', 'Vendor', 'Transaction Date', 'Money Direction', 'Import Batch'];
const TEXT_OPS: CondOperator[] = ['Contains', 'Does not contain', 'Starts with', 'Ends with', 'Equals', 'Does not equal'];
const AMOUNT_OPS: CondOperator[] = ['Equals', 'Greater than', 'Less than', 'Between'];

export interface CreateRulePrefill {
  scope?: RuleScope;
  hotelId?: string;
  name?: string;
  contains?: string;
  vendorName?: string;
  categoryName?: string;
  department?: string;
}

export function CreateRuleModal({ prefill, onClose, onCreated }: { prefill?: CreateRulePrefill; onClose: () => void; onCreated?: (id: string) => void }) {
  const store = useAcctState();
  const [step, setStep] = useState(0);

  // Step 1
  const [name, setName] = useState(prefill?.name ?? '');
  const [scope, setScope] = useState<RuleScope>(prefill?.scope ?? 'global');
  const [hotelId, setHotelId] = useState(prefill?.hotelId ?? '');
  const [source, setSource] = useState<RuleSource>('both');
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // Step 2
  const [logic, setLogic] = useState<'all' | 'any'>('all');
  const [conds, setConds] = useState<RuleCondition[]>([{ field: 'Description', operator: 'Contains', value: prefill?.contains ?? '' }]);

  // Step 3
  const [txType, setTxType] = useState<TxType>('Expense');
  const [vendorName, setVendorName] = useState(prefill?.vendorName ?? '');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState(prefill?.categoryName ?? '');
  const [department, setDepartment] = useState(prefill?.department ?? '');
  const [receipt, setReceipt] = useState<'no-change' | 'not-required' | 'always' | 'over-amount' | 'card-only'>('over-amount');
  const [receiptOver, setReceiptOver] = useState('250');
  const [memo, setMemo] = useState('');
  const [approval, setApproval] = useState<'suggest' | 'auto-categorize' | 'auto-approve' | 'never-auto'>('auto-categorize');
  const [applyTo, setApplyTo] = useState<'future' | 'existing-unposted' | 'existing-batch' | 'all-unposted'>('future');
  const [vendorHandling, setVendorHandling] = useState<'use-existing' | 'create-missing' | 'suggest-only'>('use-existing');

  const [errors, setErrors] = useState<string[]>([]);
  const [tested, setTested] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Build the in-progress rule for testing.
  const draft: RichRule = useMemo(() => ({
    id: createdId ?? 'draft', scope, hotelId: scope === 'hotel_level' ? hotelId : undefined, name, source, priority: scope === 'hotel_level' ? 1 : 3,
    status: status === 'draft' ? 'draft' : 'active', conditions: conds, conditionLogic: logic,
    actions: { setTransactionType: txType, setVendorName: vendorName || undefined, setCategoryAccountCode: scope === 'hotel_level' ? categoryCode || undefined : undefined, setTemplateAccountCode: scope === 'global' ? categoryCode || undefined : undefined, setCategoryName: categoryName || undefined, setDepartment: department || undefined, receipt, receiptOver: Number(receiptOver) || undefined, memo: memo || undefined, approval },
    vendorHandling, applyTo, createdBy: 'Sanjay Narsee', createdAt: '2026-06-04', updatedAt: '2026-06-04',
  }), [createdId, scope, hotelId, name, source, status, conds, logic, txType, vendorName, categoryCode, categoryName, department, receipt, receiptOver, memo, approval, vendorHandling, applyTo]);

  const previewMatches = useMemo(() => {
    if (!tested) return [];
    return ACCT_TRANSACTIONS.filter((t) => {
      if (scope === 'hotel_level') return hotelId === t.hotelId && txMatchesRule({ ...draft, scope: 'global', hotelId: undefined }, t);
      return txMatchesRule(draft, t);
    }).slice(0, 25);
  }, [tested, draft, scope, hotelId]);

  const validateStep1 = () => {
    const e: string[] = [];
    if (!name.trim()) e.push('Rule name is required.');
    if (scope === 'hotel_level' && !hotelId) e.push('Hotel entity is required for hotel-level rules.');
    return e;
  };
  const validateStep2 = () => {
    const e: string[] = [];
    if (!conds.length) e.push('At least one condition is required.');
    conds.forEach((c) => { if (!c.value.trim() && c.field !== 'Source') e.push('Condition value is required.'); });
    return e;
  };
  const validateStep3 = () => {
    const e: string[] = [];
    const hasAction = txType || vendorName || categoryName || department;
    if (!hasAction) e.push('At least one action is required.');
    if (txType === 'Expense' && !categoryName) e.push('Category is required if transaction type is Expense.');
    if (vendorName && scope === 'hotel_level' && !hotelId) e.push('Hotel-level rules must use a vendor from the selected hotel.');
    return e;
  };

  const next = () => {
    const e = step === 0 ? validateStep1() : step === 1 ? validateStep2() : step === 2 ? validateStep3() : [];
    if (e.length) { setErrors(e); return; }
    setErrors([]); setStep((s) => Math.min(4, s + 1));
  };

  const save = (alsoApply = false) => {
    const id = `cr-${Date.now()}`;
    const rule = { ...draft, id };
    createRichRule(rule, { matched: previewMatches.length });
    if (alsoApply) logRuleApplied({ id, name: rule.name, scope: rule.scope, hotelId: rule.hotelId }, previewMatches.length);
    setCreatedId(id);
    setStep(4);
    onCreated?.(id);
  };

  const addCond = () => setConds((c) => [...c, { field: 'Description', operator: 'Contains', value: '', logical: 'AND' }]);
  const removeCond = (i: number) => setConds((c) => c.filter((_, idx) => idx !== i));
  const setCond = (i: number, patch: Partial<RuleCondition>) => setConds((c) => c.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const categoryAccounts = COA_TEMPLATE.filter((a) => !a.isHeader);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[94vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        {/* header + stepper */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>{step === 4 ? 'Rule Created' : 'Create Rule'}</h2><p className="text-[11px]" style={{ color: '#929292' }}>{STEP_SUB[step]}</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        {step < 4 && (
          <div className="px-5 py-3 flex items-center gap-1.5 flex-wrap" style={{ borderBottom: '1px solid #f0f0f0', background: '#fcfcfc' }}>
            {STEPS.slice(0, 4).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: i <= step ? '#6a4ec0' : '#f0f0f0', color: i <= step ? '#fff' : '#929292' }}>{i + 1}</div>
                <span className="text-[11px] font-semibold" style={{ color: i === step ? '#222' : '#929292' }}>{s}</span>
                {i < 3 && <span className="w-4 h-px" style={{ background: '#dddddd' }} />}
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
          {errors.length > 0 && <div className="px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5" style={{ background: '#fee2e2', color: '#b91c1c' }}>{errors.map((e) => <span key={e}>• {e}</span>)}</div>}

          {/* STEP 1 — Scope */}
          {step === 0 && (
            <>
              <Field label="Rule Name *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home Depot to Repairs & Maintenance" className={inp} style={inpS} /></Field>
              <Field label="Rule Scope *">
                <div className="grid grid-cols-2 gap-2">
                  <ScopeCard active={scope === 'global'} onClick={() => setScope('global')} icon={<Globe className="w-4 h-4" />} title="Global Rule" desc="Applies across all HOS hotel entities." />
                  <ScopeCard active={scope === 'hotel_level'} onClick={() => setScope('hotel_level')} icon={<Building2 className="w-4 h-4" />} title="Hotel-Level Rule" desc="Applies only to one selected hotel entity." />
                </div>
              </Field>
              {scope === 'hotel_level' && (
                <Field label="Hotel Entity *"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp} style={inpS}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></Field>
              )}
              {scope === 'global' && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#f0eefb', color: '#6a4ec0' }}>This is a global rule. Vendors are still hotel-specific in V1 — StayOps will use or suggest the vendor name separately for each hotel.</p>}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Source *"><select value={source} onChange={(e) => setSource(e.target.value as RuleSource)} className={inp} style={inpS}><option value="both">Both Bank and Credit Card</option><option value="bank">Bank Transactions</option><option value="credit_card">Credit Card Transactions</option></select></Field>
                <Field label="Rule Status"><select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'draft')} className={inp} style={inpS}><option value="active">Active</option><option value="draft">Draft</option></select></Field>
              </div>
            </>
          )}

          {/* STEP 2 — Conditions */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span style={{ color: '#6a6a6a' }}>Match</span>
                <select value={logic} onChange={(e) => setLogic(e.target.value as 'all' | 'any')} className="h-8 px-2 rounded-lg text-xs" style={inpS}><option value="all">all conditions (AND)</option><option value="any">any condition (OR)</option></select>
              </div>
              {conds.map((c, i) => {
                const ops = c.field === 'Amount' ? AMOUNT_OPS : TEXT_OPS;
                return (
                  <div key={i} className="flex items-end gap-2 flex-wrap p-3 rounded-xl" style={{ background: '#f7f7f7' }}>
                    <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-semibold" style={{ color: '#929292' }}>Field</label><select value={c.field} onChange={(e) => setCond(i, { field: e.target.value as CondField })} className="h-9 px-2 rounded-lg text-sm" style={inpS}>{FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
                    <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-semibold" style={{ color: '#929292' }}>Operator</label><select value={c.operator} onChange={(e) => setCond(i, { operator: e.target.value as CondOperator })} className="h-9 px-2 rounded-lg text-sm" style={inpS}>{(c.field === 'Money Direction' ? ['Equals'] : ops).map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
                    {c.field === 'Money Direction' ? (
                      <div className="flex flex-col gap-1 flex-1"><label className="text-[10px] uppercase font-semibold" style={{ color: '#929292' }}>Value</label><select value={c.value} onChange={(e) => setCond(i, { value: e.target.value })} className="h-9 px-2 rounded-lg text-sm" style={inpS}><option value="">Select…</option><option>Money In</option><option>Money Out</option><option>Charge</option><option>Credit</option></select></div>
                    ) : (
                      <div className="flex flex-col gap-1 flex-1 min-w-[140px]"><label className="text-[10px] uppercase font-semibold" style={{ color: '#929292' }}>Value</label><input value={c.value} onChange={(e) => setCond(i, { value: e.target.value })} placeholder={c.field === 'Amount' ? '250' : 'HOME DEPOT'} className={inp} style={inpS} /></div>
                    )}
                    {c.operator === 'Between' && <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-semibold" style={{ color: '#929292' }}>And</label><input value={c.value2 ?? ''} onChange={(e) => setCond(i, { value2: e.target.value })} className="h-9 px-2 rounded-lg text-sm w-24" style={inpS} /></div>}
                    {conds.length > 1 && <button onClick={() => removeCond(i)} className="h-9 px-2"><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>}
                  </div>
                );
              })}
              <button onClick={addCond} className="self-start inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#6a4ec0' }}><Plus className="w-3.5 h-3.5" /> Add Condition</button>
              <p className="text-[11px]" style={{ color: '#b0b0b0' }}>Example: Description contains HOME DEPOT  ·  AND Amount greater than 250</p>
            </>
          )}

          {/* STEP 3 — Actions */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Set Transaction Type"><select value={txType} onChange={(e) => setTxType(e.target.value as TxType)} className={inp} style={inpS}>{TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
                <Field label="Set Department"><select value={department} onChange={(e) => setDepartment(e.target.value)} className={inp} style={inpS}><option value="">No change</option>{DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
              </div>
              <Field label="Set Vendor (name)"><input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Home Depot" className={inp} style={inpS} /></Field>
              {scope === 'global' && vendorName && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>Global rule: sets vendor name <b>{vendorName}</b> for each hotel. Vendors stay hotel-specific in V1.</p>}
              {scope === 'global' && vendorName && (
                <Field label="Global Vendor Handling"><select value={vendorHandling} onChange={(e) => setVendorHandling(e.target.value as typeof vendorHandling)} className={inp} style={inpS}><option value="use-existing">Use existing hotel vendor if found, otherwise suggest</option><option value="create-missing">Create hotel-level vendor if missing</option><option value="suggest-only">Suggest vendor only (do not create)</option></select></Field>
              )}
              <Field label={`Set Category ${scope === 'global' ? '(template account)' : '(this hotel’s account)'}`}>
                <select value={categoryCode} onChange={(e) => { const a = categoryAccounts.find((x) => x.code === e.target.value); setCategoryCode(e.target.value); setCategoryName(a?.name ?? ''); }} className={inp} style={inpS}>
                  <option value="">No change</option>
                  {categoryAccounts.map((a) => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Receipt Requirement"><select value={receipt} onChange={(e) => setReceipt(e.target.value as typeof receipt)} className={inp} style={inpS}><option value="no-change">Do not change</option><option value="not-required">Not required</option><option value="always">Always require</option><option value="over-amount">Require if amount is over…</option><option value="card-only">Require for credit card only</option></select></Field>
                {receipt === 'over-amount' && <Field label="Amount Over"><input value={receiptOver} onChange={(e) => setReceiptOver(e.target.value)} className={inp} style={inpS} /></Field>}
              </div>
              <Field label="Memo"><input value={memo} onChange={(e) => setMemo(e.target.value)} className={inp} style={inpS} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Approval Behavior"><select value={approval} onChange={(e) => setApproval(e.target.value as typeof approval)} className={inp} style={inpS}><option value="suggest">Suggest only</option><option value="auto-categorize">Auto categorize</option><option value="auto-approve">Auto approve if all fields present</option><option value="never-auto">Never auto approve</option></select></Field>
                <Field label="Apply Rule To"><select value={applyTo} onChange={(e) => setApplyTo(e.target.value as typeof applyTo)} className={inp} style={inpS}><option value="future">Future transactions only</option><option value="existing-unposted">Existing unposted transactions</option><option value="existing-batch">Existing import batch</option><option value="all-unposted">All unposted matching this rule</option></select></Field>
              </div>
              <p className="text-[11px]" style={{ color: '#b0b0b0' }}>Auto posting is disabled in this version — rules can categorize and optionally approve, but posting stays with Sanjay.</p>
            </>
          )}

          {/* STEP 4 — Review & Test */}
          {step === 3 && (
            <>
              <div className="rounded-xl p-4 flex flex-col gap-1.5" style={{ background: '#f7f7f7' }}>
                <Row k="Rule Name" v={name} />
                <Row k="Scope" v={scope === 'global' ? 'Global (all hotels)' : `Hotel-Level · ${getEntity(hotelId)?.hotelName}`} />
                <Row k="Source" v={source === 'both' ? 'Bank & Credit Card' : source === 'bank' ? 'Bank' : 'Credit Card'} />
                <Row k="Conditions" v={conds.map((c) => `${c.field} ${c.operator.toLowerCase()} ${c.value}`).join(logic === 'any' ? ' OR ' : ' AND ')} />
                <Row k="Actions" v={[vendorName && `vendor ${vendorName}`, categoryName && `category ${categoryName}`, department && `dept ${department}`].filter(Boolean).join(' · ') || '—'} />
                <Row k="Approval" v={approval} />
                <Row k="Status" v={status} />
              </div>
              <button onClick={() => setTested(true)} className="self-start inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}><FlaskConical className="w-3.5 h-3.5" /> Test Rule</button>
              {tested && (
                <div>
                  <p className="text-xs mb-2" style={{ color: '#6a6a6a' }}><b>{previewMatches.length}</b> transactions would match{scope === 'hotel_level' ? ' at this hotel' : ' across all hotels'}.</p>
                  <div className="overflow-x-auto rounded-xl max-h-64" style={{ border: '1px solid #f0f0f0' }}>
                    <table className="w-full text-sm border-collapse">
                      <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Hotel', 'Description', 'Amount', 'New Category', 'Result'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {previewMatches.map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                            <td className="py-1.5 px-2.5 text-xs" style={{ color: '#6a6a6a' }}>{t.dateIso.slice(5)}</td>
                            <td className="py-1.5 px-2.5 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
                            <td className="py-1.5 px-2.5 text-xs" style={{ color: '#222' }}>{t.description}</td>
                            <td className="py-1.5 px-2.5 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                            <td className="py-1.5 px-2.5 text-xs" style={{ color: '#3f3f3f' }}>{categoryName || '—'}</td>
                            <td className="py-1.5 px-2.5"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: t.category === categoryName ? '#dcfce7' : '#dbeafe', color: t.category === categoryName ? '#15803d' : '#1d4ed8' }}>{t.category === categoryName ? 'Already Matches' : 'Would Update'}</span></td>
                          </tr>
                        ))}
                        {previewMatches.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs" style={{ color: '#929292' }}>No matching transactions found. Try changing conditions.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 5 — Success */}
          {step === 4 && (
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-6 h-6" style={{ color: '#15803d' }} /></div>
              <h3 className="text-lg font-bold" style={{ color: '#222' }}>Rule created successfully.</h3>
              <div className="rounded-xl p-4 w-full max-w-sm flex flex-col gap-1.5" style={{ background: '#f7f7f7' }}>
                <Row k="Rule Name" v={name} />
                <Row k="Scope" v={scope === 'global' ? 'Global' : `Hotel-Level · ${getEntity(hotelId)?.propertyCode}`} />
                <Row k="Matched in preview" v={String(previewMatches.length)} />
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          {step === 4 ? (
            <>
              <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Go to Rules</button>
              {createdId && <a href={`/web/accounting/rules/${createdId}`} className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>View Rule</a>}
            </>
          ) : (
            <>
              <button onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{step === 0 ? 'Cancel' : 'Back'}</button>
              {step < 3 && <button onClick={next} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Continue</button>}
              {step === 3 && <>
                <button onClick={() => save(false)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}>Save Rule</button>
                <button onClick={() => save(true)} disabled={!tested} title={!tested ? 'Test the rule before applying to existing transactions.' : undefined} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: tested ? 1 : 0.5 }}>Save &amp; Apply to Matching</button>
              </>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const STEP_SUB = [
  'Choose whether this rule applies across all hotels or only one hotel.',
  'Tell StayOps which transactions should match this rule.',
  'Choose what StayOps should do when a transaction matches.',
  'Preview transactions that would match this rule before saving.',
  'Your rule is ready.',
];

function ScopeCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="text-left p-3 rounded-xl flex flex-col gap-1" style={{ border: `1px solid ${active ? '#6a4ec0' : '#dddddd'}`, background: active ? '#f7f5fd' : '#fff' }}>
      <span style={{ color: active ? '#6a4ec0' : '#6a6a6a' }}>{icon}</span>
      <span className="text-sm font-semibold" style={{ color: '#222' }}>{title}</span>
      <span className="text-[11px]" style={{ color: '#929292' }}>{desc}</span>
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3 text-xs"><span style={{ color: '#929292' }}>{k}</span><span className="text-right font-medium" style={{ color: '#222' }}>{v}</span></div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
