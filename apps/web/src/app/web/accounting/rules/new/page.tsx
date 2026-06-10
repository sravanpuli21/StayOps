'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, Badge, PageHeader, inputCls, inputStyle, PURPLE } from '../../_ui';

const STEPS = ['Scope', 'Conditions', 'Actions', 'Safety', 'Test', 'Save'];
const CATEGORIES = ['Expense Coding', 'Revenue Deposit', 'Transfer', 'Credit Card Payment', 'Tax Payment', 'Loan Payment', 'Payroll', 'Payroll Fee', 'Owner Activity', 'Asset Purchase', 'Refund or Credit', 'Timing Difference', 'Duplicate Detection', 'Receipt Requirement', 'Investigation'];
const FIELDS = ['Raw Description', 'Normalized Description', 'Amount', 'Amount Direction', 'Source', 'Vendor Name', 'Transaction Date', 'Day of Month', 'Reference Number', 'Merchant Category'];
const OPERATORS = ['Contains', 'Does not contain', 'Starts with', 'Ends with', 'Equals', 'Greater than', 'Less than', 'Between'];
const RESOLUTIONS = ['Create Accounting Transaction', 'Match Existing Transaction', 'Transfer Between Accounts', 'Credit Card Payment', 'Split Transaction', 'Owner Contribution', 'Owner Draw', 'Loan Payment', 'Tax Payment', 'Asset Purchase', 'Refund or Credit', 'Duplicate or Exclude', 'Timing Difference', 'Needs Investigation'];
const DEPTS = ['Front Office', 'Housekeeping', 'Engineering', 'Kitchen', 'Laundry', 'Sales', 'Admin', 'Ownership', 'General'];
const BEHAVIORS = ['Suggest Only', 'Auto-Code, but do not post', 'Auto-Code and Mark Ready to Post', 'Review Required', 'Never Auto-Code'];
const RISKS = ['Low', 'Medium', 'High', 'Critical'];

interface Cond { id: string; field: string; operator: string; value: string }

export default function NewRulePage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [name, setName] = useState('');
  const [scope, setScope] = useState<'global' | 'hotel_level'>('global');
  const [hotelId, setHotelId] = useState(selection.kind === 'hotel' ? selection.hotelId : '');
  const [source, setSource] = useState('Both Bank and Credit Card');
  const [category, setCategory] = useState('Expense Coding');
  const [conds, setConds] = useState<Cond[]>([{ id: 'c1', field: 'Raw Description', operator: 'Contains', value: '' }]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [vendor, setVendor] = useState('');
  const [coaCode, setCoaCode] = useState('');
  const [dept, setDept] = useState('');
  const [risk, setRisk] = useState('Low');
  const [behavior, setBehavior] = useState('Auto-Code, but do not post');

  // High-risk categories force review behavior.
  const highRiskCat = ['Credit Card Payment', 'Tax Payment', 'Loan Payment', 'Payroll', 'Owner Activity'].includes(category);

  const next = () => {
    setError('');
    if (step === 1 && !name) return setError('Rule name is required.');
    if (step === 1 && scope === 'hotel_level' && !hotelId) return setError('Hotel entity is required for hotel-level rules.');
    if (step === 2 && conds.some((c) => !c.value)) return setError('Every condition needs a value.');
    if (step === 3 && highRiskCat) setBehavior('Review Required');
    setStep((s) => Math.min(6, s + 1));
  };

  if (done) return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/rules')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</button>
      <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={card}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
        <h1 className="text-lg font-bold" style={{ color: '#222' }}>Rule created successfully.</h1>
        <p className="text-sm" style={{ color: '#6a6a6a' }}>{name} · {scope === 'global' ? 'Global' : 'Hotel-Level'} · {risk} risk · {highRiskCat ? 'Review Required' : behavior}.</p>
        <div className="flex gap-2 mt-2"><button onClick={() => router.push('/web/accounting/rules')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Go to Rules</button></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/rules')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</button>
      <PageHeader title="Create Rule" subtitle="Build a rule that suggests coding when statement lines match." />
      <div className="flex items-center gap-1.5 flex-wrap">
        {STEPS.map((l, i) => { const n = i + 1; const d = step > n; const a = step === n; return (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: d ? '#15803d' : a ? PURPLE : '#f0f0f0', color: d || a ? '#fff' : '#929292' }}>{d ? '✓' : n}</div>
            <span className="text-[11px] font-medium hidden md:block" style={{ color: a ? '#222' : '#929292' }}>{l}</span>
            {i < STEPS.length - 1 && <div className="w-4 h-px" style={{ background: '#dddddd' }} />}
          </div>
        ); })}
      </div>

      <div className="p-6 flex flex-col gap-4" style={card}>
        {step === 1 && (
          <Panel title="Scope" sub="Where does this rule apply?">
            <Field label="Rule Name *"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. HOME DEPOT → Repairs and Maintenance" /></Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Scope"><select value={scope} onChange={(e) => setScope(e.target.value as any)} className={inputCls} style={inputStyle}><option value="global">Global Rule</option><option value="hotel_level">Hotel-Level Rule</option></select></Field>
              {scope === 'hotel_level' && <Field label="Hotel Entity *"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inputCls} style={inputStyle}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select></Field>}
              <Field label="Source"><select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} style={inputStyle}><option>Bank Statement Lines</option><option>Credit Card Statement Lines</option><option>Both Bank and Credit Card</option></select></Field>
              <Field label="Rule Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} style={inputStyle}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            </div>
            <p className="text-xs" style={{ color: '#929292' }}>{scope === 'global' ? 'Applies across all HOS hotel entities. Vendors remain hotel-specific.' : 'Applies only to one hotel and overrides global rules.'}</p>
          </Panel>
        )}

        {step === 2 && (
          <Panel title="Conditions" sub="Which statement lines should this rule match?">
            {conds.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-8" style={{ color: '#929292' }}>{i === 0 ? 'IF' : 'AND'}</span>
                <select value={c.field} onChange={(e) => setConds((p) => p.map((x) => x.id === c.id ? { ...x, field: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs flex-1" style={inputStyle}>{FIELDS.map((f) => <option key={f}>{f}</option>)}</select>
                <select value={c.operator} onChange={(e) => setConds((p) => p.map((x) => x.id === c.id ? { ...x, operator: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs" style={inputStyle}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select>
                <input value={c.value} onChange={(e) => setConds((p) => p.map((x) => x.id === c.id ? { ...x, value: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs flex-1" style={inputStyle} placeholder="value" />
                {conds.length > 1 && <button onClick={() => setConds((p) => p.filter((x) => x.id !== c.id))}><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>}
              </div>
            ))}
            <button onClick={() => setConds((p) => [...p, { id: `c${Date.now()}`, field: 'Raw Description', operator: 'Contains', value: '' }])} className="h-8 px-3 rounded-lg text-xs font-semibold self-start inline-flex items-center gap-1.5" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add Condition</button>
          </Panel>
        )}

        {step === 3 && (
          <Panel title="Actions" sub="What should StayOps suggest when this rule matches?">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Resolution Type"><select value={resolution} onChange={(e) => setResolution(e.target.value)} className={inputCls} style={inputStyle}>{RESOLUTIONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
              <Field label={scope === 'global' ? 'Vendor Name Template' : 'Vendor'}><input value={vendor} onChange={(e) => setVendor(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Home Depot" /></Field>
              <Field label={scope === 'global' ? 'Category (template account code)' : 'Category (hotel account)'}><input value={coaCode} onChange={(e) => setCoaCode(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. 6210 Repairs and Maintenance" /></Field>
              <Field label="Department"><select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} style={inputStyle}><option value="">Select…</option>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
            </div>
            {scope === 'global' && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#f6f4fd', color: PURPLE }}>Global category mapping uses a template account code and maps to each hotel's matching account. Vendors remain hotel-specific.</p>}
          </Panel>
        )}

        {step === 4 && (
          <Panel title="Safety & Review" sub="Decide whether this rule only suggests, auto-codes, or requires review.">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Rule Risk Level"><select value={highRiskCat ? 'High' : risk} onChange={(e) => setRisk(e.target.value)} disabled={highRiskCat} className={inputCls} style={{ ...inputStyle, opacity: highRiskCat ? 0.6 : 1 }}>{RISKS.map((r) => <option key={r}>{r}</option>)}</select></Field>
              <Field label="Application Behavior"><select value={highRiskCat ? 'Review Required' : behavior} onChange={(e) => setBehavior(e.target.value)} disabled={highRiskCat} className={inputCls} style={{ ...inputStyle, opacity: highRiskCat ? 0.6 : 1 }}>{BEHAVIORS.map((b) => <option key={b}>{b}</option>)}</select></Field>
            </div>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{highRiskCat ? 'This is a high-risk category — it requires review and cannot auto-post.' : 'Auto-post is disabled in V1 to protect accounting accuracy. Rules can auto-code but never auto-post.'}</span>
            </div>
            <Field label="Posting Behavior"><input value="Never Auto-Post (V1)" disabled className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} /></Field>
          </Panel>
        )}

        {step === 5 && (
          <Panel title="Test & Preview" sub="Preview which statement lines this rule would affect.">
            <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background: '#f7f7f7' }}>
              <Stat label="Lines Checked" value="2,846" /><Stat label="Would Match" value="84" /><Stat label="Review Required" value={highRiskCat ? '84' : '0'} /><Stat label="Mapping Missing" value="0" />
            </div>
            <p className="text-xs" style={{ color: '#929292' }}>Test must run before applying to existing lines. Rules never apply to posted, reconciled, or closed-period transactions.</p>
          </Panel>
        )}

        {step === 6 && (
          <Panel title="Review & Save" sub="Confirm the rule before saving.">
            <div className="rounded-xl p-4 flex flex-col gap-1.5" style={{ background: '#f7f7f7' }}>
              <Row k="Name" v={name} /><Row k="Scope" v={scope === 'global' ? 'Global' : `Hotel-Level (${HOTEL_ENTITIES.find((h) => h.id === hotelId)?.hotelName ?? '—'})`} />
              <Row k="When" v={conds.map((c) => `${c.field} ${c.operator.toLowerCase()} "${c.value}"`).join(' AND ')} />
              <Row k="Sets" v={`${resolution}${coaCode ? ` · ${coaCode}` : ''}${dept ? ` · ${dept}` : ''}`} />
              <Row k="Risk" v={highRiskCat ? 'High' : risk} /><Row k="Behavior" v={highRiskCat ? 'Review Required' : behavior} />
            </div>
          </Panel>
        )}

        {error && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {error}</div>}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          {step > 1 ? <button onClick={() => setStep((s) => s - 1)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back</button> : <button onClick={() => router.push('/web/accounting/rules')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>}
          {step < 6 ? <button onClick={next} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}>Continue <ArrowRight className="w-4 h-4" /></button>
            : <button onClick={() => setDone(true)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#15803d', color: '#fff' }}><Check className="w-4 h-4" /> Save Rule</button>}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) { return <div className="flex flex-col gap-4"><div><h2 className="text-lg font-bold" style={{ color: '#222' }}>{title}</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>{sub}</p></div>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1.5 w-full"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold" style={{ color: '#222' }}>{value}</p></div>; }
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><span className="text-xs" style={{ color: '#929292' }}>{k}</span><span className="text-xs font-medium text-right" style={{ color: '#222' }}>{v}</span></div>; }
