'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, UploadCloud, FileSpreadsheet, AlertTriangle,
  Landmark, CreditCard, Building2,
} from 'lucide-react';
import {
  HOTEL_ENTITIES, bankAccountsForHotel, creditCardsForHotel, getEntity,
} from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { importStatement } from '../../_store2';
import {
  type StatementType, type StatementLineSeed, type TxnType, type Dept,
  CODE, ACCOUNTANT, RECON_MONTH,
} from '../../_domain';
import { card, money, Badge, inputCls, inputStyle, PURPLE, fmtMonth } from '../../_ui';

const MONTHS = ['2026-05', '2026-04', '2026-03', '2026-02', '2026-01'];
const STEPS = ['Type', 'Account', 'Upload CSV', 'Map Columns', 'Preview', 'Done'];

const BANK_CSV_COLS = ['Date', 'Description', 'Amount', 'Debit', 'Credit', 'Balance', 'Reference', 'Check #', 'Memo'];
const BANK_FIELDS = [{ f: 'Date', req: true }, { f: 'Description', req: true }, { f: 'Amount', req: true }, { f: 'Balance', req: false }, { f: 'Reference Number', req: false }, { f: 'Check Number', req: false }, { f: 'Memo', req: false }];
const CARD_CSV_COLS = ['Date', 'Posted Date', 'Description', 'Amount', 'Charge', 'Credit', 'Card Holder', 'Reference', 'Merchant Category', 'Memo'];
const CARD_FIELDS = [{ f: 'Date', req: true }, { f: 'Description', req: true }, { f: 'Amount', req: true }, { f: 'Card Holder', req: false }, { f: 'Posted Date', req: false }, { f: 'Reference Number', req: false }, { f: 'Merchant Category', req: false }, { f: 'Memo', req: false }];

/* Deterministic preview rows so the import feels real. */
function genPreviewRows(hotelId: string, accountId: string, kind: StatementType, month: string): StatementLineSeed[] {
  let s = (hotelId.charCodeAt(0) * 31 + accountId.length * 7 + Number(month.slice(5))) >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const expense = [
    { v: 'HOME DEPOT', code: CODE.rm, cat: 'Repairs and Maintenance', dept: 'Engineering' as Dept },
    { v: 'AMAZON BUSINESS', code: CODE.guestSupplies, cat: 'Guest Supplies', dept: 'Housekeeping' as Dept },
    { v: 'GEORGIA POWER', code: CODE.utilities, cat: 'Electricity', dept: 'Engineering' as Dept },
    { v: 'COMCAST', code: CODE.internet, cat: 'Internet and Cable', dept: 'Admin' as Dept },
    { v: 'OFFICE DEPOT', code: CODE.office, cat: 'Office Supplies', dept: 'Admin' as Dept },
    { v: 'PEST CONTROL', code: CODE.pest, cat: 'Pest Control', dept: 'Engineering' as Dept },
  ];
  const n = 9 + Math.floor(r() * 6);
  const rows: StatementLineSeed[] = [];
  for (let i = 0; i < n; i++) {
    const inflow = kind === 'bank' && r() > 0.8;
    const sug = expense[Math.floor(r() * expense.length)];
    const amount = inflow ? Math.round((2000 + r() * 8000) * 100) / 100 : -Math.round((35 + r() * 1800) * 100) / 100;
    const dayN = 1 + Math.floor(r() * 27);
    rows.push({
      id: `prev-${accountId}-${month}-${i}`, importId: '', hotelId, statementType: kind, accountId,
      dateIso: `${month}-${String(dayN).padStart(2, '0')}`, postedDateIso: `${month}-${String(dayN).padStart(2, '0')}`,
      rawDescription: inflow ? 'PMS DEPOSIT' : `${sug.v}${kind === 'bank' ? ` #${1000 + Math.floor(r() * 8999)}` : ''}`,
      normalizedDescription: inflow ? 'PMS Deposit' : sug.v,
      referenceNumber: `${4000 + Math.floor(r() * 5000)}`,
      amount, direction: amount < 0 ? 'out' : 'in',
      suggestedResolution: 'create-transaction',
      suggestedTxnType: (inflow ? 'Revenue Deposit' : 'Expense') as TxnType,
      suggestedVendor: inflow ? 'PMS Deposit' : sug.v,
      suggestedCategoryCode: inflow ? CODE.roomRevenue : sug.code,
      suggestedCategoryName: inflow ? 'Room Revenue' : sug.cat,
      suggestedDepartment: inflow ? 'Front Office' : sug.dept,
      receiptRequirement: !inflow && Math.abs(amount) > 250 ? 'required' : 'not-required',
      confidence: 0.8, seedStatus: 'suggested', seedPosted: false, seedCleared: false,
    });
  }
  return rows;
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();

  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<StatementType>('bank');
  const [hotelId, setHotelId] = useState(selection.kind === 'hotel' ? selection.hotelId : '');
  const [accountId, setAccountId] = useState('');
  const [month, setMonth] = useState(RECON_MONTH);
  const [startDate, setStartDate] = useState(`${RECON_MONTH}-01`);
  const [endDate, setEndDate] = useState(`${RECON_MONTH}-31`);
  const [endBalance, setEndBalance] = useState('');
  const [beginBalance, setBeginBalance] = useState('');
  const [fileName, setFileName] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ importId: string; count: number; dups: number; suggested: number } | null>(null);

  const accounts = hotelId ? (kind === 'bank' ? bankAccountsForHotel(hotelId) : creditCardsForHotel(hotelId)) : [];
  const rows = useMemo(() => (hotelId && accountId ? genPreviewRows(hotelId, accountId, kind, month) : []), [hotelId, accountId, kind, month]);
  const dupIds = useMemo(() => new Set(rows.filter((_, i) => i % 8 === 5).map((x) => x.id)), [rows]);
  const fields = kind === 'bank' ? BANK_FIELDS : CARD_FIELDS;
  const cols = kind === 'bank' ? BANK_CSV_COLS : CARD_CSV_COLS;

  const kept = rows.filter((x) => !removed.has(x.id));
  const moneyIn = kept.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const moneyOut = kept.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);

  const goAccount = () => setStep(2);
  const toUpload = () => {
    if (!hotelId) return setError('Please select a hotel entity.');
    if (!accountId) return setError('Please select a bank account or credit card.');
    setError(''); setStep(3);
  };
  const toMapping = () => {
    if (!fileName) return setError('Please upload a CSV file.');
    setError(''); setStep(4);
  };
  const autoMap = () => setMapping(kind === 'bank'
    ? { Date: 'Date', Description: 'Description', Amount: 'Amount', Balance: 'Balance', 'Reference Number': 'Reference', 'Check Number': 'Check #', Memo: 'Memo' }
    : { Date: 'Date', Description: 'Description', Amount: 'Amount', 'Card Holder': 'Card Holder', 'Posted Date': 'Posted Date', 'Reference Number': 'Reference', 'Merchant Category': 'Merchant Category', Memo: 'Memo' });
  const toPreview = () => {
    if (!mapping['Date']) return setError('Date column is required.');
    if (!mapping['Amount']) return setError('Amount column is required.');
    setError(''); setStep(5);
  };

  const doImport = () => {
    const acct = accounts.find((a) => a.id === accountId)!;
    const importId = `up-${accountId}-${month}-${Math.random().toString(36).slice(2, 6)}`;
    const beg = Number(beginBalance) || ('openingBalance' in acct ? (acct as any).openingBalance : 0) || 0;
    const net = kept.reduce((s, r) => s + r.amount, 0);
    const ending = endBalance ? Number(endBalance) : (kind === 'bank' ? Math.round((beg + net) * 100) / 100 : Math.round((beg + moneyOut - moneyIn) * 100) / 100);
    const lines: StatementLineSeed[] = kept.filter((x) => !dupIds.has(x.id)).map((x, i) => ({ ...x, id: `${importId}-l${i}`, importId, seedStatus: 'suggested' }));
    importStatement({
      id: importId, hotelId, statementType: kind, accountId, accountName: acct.name, accountLast4: acct.last4,
      institution: 'bank' in acct ? (acct as any).bank : (acct as any).issuer,
      sourceAccountCode: kind === 'bank' ? ((acct as any).type === 'Payroll Checking' ? CODE.payroll : (acct as any).type === 'Reserve' ? CODE.reserve : CODE.operating) : (acct.name.includes('GM') ? CODE.gmCard : CODE.corporateCard),
      cardHolder: 'cardHolder' in acct ? (acct as any).cardHolder : undefined,
      month, startDate, endDate, beginningBalance: beg, endingBalance: ending,
      fileName: fileName || `${kind}-statement-${month}.csv`, uploadedBy: ACCOUNTANT, uploadedIso: '2026-06-09T12:00:00Z', seedStatus: 'imported',
    }, lines);
    setDone({ importId, count: lines.length, dups: dupIds.size, suggested: lines.length });
    setStep(6);
  };

  if (done) return <Complete done={done} kind={kind} hotelId={hotelId} accountName={accounts.find((a) => a.id === accountId)?.name ?? ''} month={month} router={router} reset={() => { setDone(null); setStep(1); setFileName(''); setMapping({}); setRemoved(new Set()); setAccountId(''); }} />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/statements')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Statement Inbox</button>
      <StepRail step={step} />

      {/* STEP 1: type */}
      {step === 1 && (
        <Panel title="Upload Statement" sub="What kind of statement are you uploading?">
          <div className="grid md:grid-cols-2 gap-4">
            <TypeCard active={kind === 'bank'} onClick={() => setKind('bank')} icon={<Landmark className="w-6 h-6" />} title="Bank Statement" sub="Operating, payroll, or reserve account" />
            <TypeCard active={kind === 'credit-card'} onClick={() => setKind('credit-card')} icon={<CreditCard className="w-6 h-6" />} title="Credit Card Statement" sub="Corporate or GM card" />
          </div>
          <Footer><span /><Primary onClick={goAccount}>Continue <ArrowRight className="w-4 h-4" /></Primary></Footer>
        </Panel>
      )}

      {/* STEP 2: hotel + account */}
      {step === 2 && (
        <Panel title="Select Hotel and Account" sub="Every statement belongs to one hotel entity and one account.">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Hotel Entity">
              <select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setAccountId(''); }} className={inputCls} style={inputStyle}>
                <option value="">Select hotel…</option>
                {HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}
              </select>
            </Field>
            <Field label="Statement Type">
              <select value={kind} onChange={(e) => { setKind(e.target.value as StatementType); setAccountId(''); }} className={inputCls} style={inputStyle}>
                <option value="bank">Bank Statement</option>
                <option value="credit-card">Credit Card Statement</option>
              </select>
            </Field>
            <Field label={kind === 'bank' ? 'Bank Account' : 'Credit Card'}>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} disabled={!hotelId} className={inputCls} style={inputStyle}>
                <option value="">{hotelId ? 'Select account…' : 'Pick a hotel first'}</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · ••{a.last4}</option>)}
              </select>
            </Field>
            <Field label="Statement Month">
              <select value={month} onChange={(e) => { setMonth(e.target.value); setStartDate(`${e.target.value}-01`); setEndDate(`${e.target.value}-31`); }} className={inputCls} style={inputStyle}>
                {MONTHS.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
              </select>
            </Field>
            <Field label="Statement Start Date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
            <Field label="Statement End Date"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
            {kind === 'bank' && <Field label="Beginning Balance"><input value={beginBalance} onChange={(e) => setBeginBalance(e.target.value)} placeholder="$0.00" className={inputCls} style={inputStyle} /></Field>}
            <Field label={kind === 'bank' ? 'Statement Ending Balance' : 'Statement Balance'}><input value={endBalance} onChange={(e) => setEndBalance(e.target.value)} placeholder="Auto if blank" className={inputCls} style={inputStyle} /></Field>
          </div>
          {error && <ErrorMsg text={error} />}
          <Footer><Ghost onClick={() => setStep(1)}>Back</Ghost><Primary onClick={toUpload}>Continue <ArrowRight className="w-4 h-4" /></Primary></Footer>
        </Panel>
      )}

      {/* STEP 3: upload */}
      {step === 3 && (
        <Panel title="Upload CSV" sub="V1 accepts CSV files only.">
          <label className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl cursor-pointer" style={{ border: '2px dashed #dddddd', background: '#fafafa' }}>
            <UploadCloud className="w-8 h-8" style={{ color: PURPLE }} />
            {fileName ? <span className="text-sm font-medium" style={{ color: '#222' }}><FileSpreadsheet className="w-4 h-4 inline mr-1" />{fileName}</span> : <span className="text-sm" style={{ color: '#929292' }}>Click to choose a CSV file</span>}
            <input type="file" accept=".csv" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? `${kind}-statement-${month}.csv`)} />
            {!fileName && <button type="button" onClick={(e) => { e.preventDefault(); setFileName(`${kind}-statement-${month}.csv`); }} className="text-xs font-semibold mt-1" style={{ color: PURPLE }}>Use a sample file</button>}
          </label>
          {fileName && <div className="flex items-center gap-4 text-xs" style={{ color: '#6a6a6a' }}><span>File: <b style={{ color: '#222' }}>{fileName}</b></span><span>Rows detected: <b style={{ color: '#222' }}>{rows.length}</b></span></div>}
          {error && <ErrorMsg text={error} />}
          <Footer><Ghost onClick={() => setStep(2)}>Back</Ghost><Primary onClick={toMapping}>Continue <ArrowRight className="w-4 h-4" /></Primary></Footer>
        </Panel>
      )}

      {/* STEP 4: map columns */}
      {step === 4 && (
        <Panel title="Map Columns" sub="Match the columns from your CSV to StayOps fields.">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>CSV Preview</p>
              <div className="rounded-xl overflow-hidden text-xs" style={{ border: '1px solid #dddddd' }}>
                <div className="grid grid-cols-3" style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  {['Date', 'Description', 'Amount'].map((c) => <div key={c} className="px-2 py-1.5 font-semibold" style={{ color: '#6a6a6a' }}>{c}</div>)}
                </div>
                {rows.slice(0, 7).map((row) => (
                  <div key={row.id} className="grid grid-cols-3" style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <div className="px-2 py-1.5" style={{ color: '#3f3f3f' }}>{row.dateIso.slice(5)}</div>
                    <div className="px-2 py-1.5 truncate" style={{ color: '#3f3f3f' }}>{row.rawDescription}</div>
                    <div className="px-2 py-1.5" style={{ color: row.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(row.amount, { sign: true })}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Map to fields</p>
              {fields.map(({ f, req }) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-xs w-36 flex items-center gap-1" style={{ color: '#3f3f3f' }}>{f}{req && <span style={{ color: '#b91c1c' }}>*</span>}</span>
                  <select value={mapping[f] ?? ''} onChange={(e) => setMapping((m) => ({ ...m, [f]: e.target.value }))} className="flex-1 h-9 px-2 rounded-lg text-xs" style={inputStyle}>
                    <option value="">— Not mapped —</option>
                    {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {mapping[f] && <Check className="w-4 h-4" style={{ color: '#15803d' }} />}
                </div>
              ))}
            </div>
          </div>
          {error && <ErrorMsg text={error} />}
          <Footer>
            <Ghost onClick={() => setStep(3)}>Back</Ghost>
            <div className="flex gap-2">
              <button onClick={autoMap} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: PURPLE }}>Auto Map Columns</button>
              <Primary onClick={toPreview}>Continue to Preview <ArrowRight className="w-4 h-4" /></Primary>
            </div>
          </Footer>
        </Panel>
      )}

      {/* STEP 5: preview */}
      {step === 5 && (
        <Panel title="Preview Statement Lines" sub="Review what will be imported into the workbench. Possible duplicates are flagged.">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <Stat label="Total Rows" value={String(rows.length)} />
            <Stat label="New Lines" value={String(kept.length - dupIds.size)} accent="#15803d" />
            <Stat label="Possible Dupes" value={String(dupIds.size)} accent="#b45309" />
            <Stat label="Missing Fields" value="0" />
            <Stat label={kind === 'bank' ? 'Money In' : 'Credits'} value={money(moneyIn)} accent="#15803d" />
            <Stat label={kind === 'bank' ? 'Money Out' : 'Charges'} value={money(moneyOut)} accent="#b91c1c" />
          </div>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #dddddd' }}>
            <table className="w-full text-xs border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['#', 'Date', 'Description', 'Amount', kind === 'bank' ? 'Direction' : 'Type', 'Status', ''].map((h) => <th key={h} className="text-left px-2.5 py-2 font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((row, i) => {
                  const dup = dupIds.has(row.id);
                  const gone = removed.has(row.id);
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f7f7f7', opacity: gone ? 0.4 : 1 }}>
                      <td className="px-2.5 py-1.5" style={{ color: '#929292' }}>{i + 1}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#3f3f3f' }}>{row.dateIso.slice(5)}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#222' }}>{row.rawDescription}</td>
                      <td className="px-2.5 py-1.5 font-medium" style={{ color: row.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(row.amount, { sign: true })}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#6a6a6a' }}>{kind === 'bank' ? (row.amount < 0 ? 'Money Out' : 'Money In') : (row.amount < 0 ? 'Charge' : 'Credit')}</td>
                      <td className="px-2.5 py-1.5">{dup ? <Badge label="Possible Duplicate" fg="#b45309" bg="#fef3c7" /> : <Badge label="New" fg="#15803d" bg="#dcfce7" />}</td>
                      <td className="px-2.5 py-1.5"><button onClick={() => setRemoved((p) => { const n = new Set(p); n.has(row.id) ? n.delete(row.id) : n.add(row.id); return n; })} className="text-[11px] font-semibold" style={{ color: gone ? PURPLE : '#b91c1c' }}>{gone ? 'Keep' : 'Remove'}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Footer><Ghost onClick={() => setStep(4)}>Back</Ghost><Primary onClick={doImport}>Import to Workbench <ArrowRight className="w-4 h-4" /></Primary></Footer>
        </Panel>
      )}
    </div>
  );
}

function Complete({ done, kind, hotelId, accountName, month, router, reset }: any) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/statements')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Statement Inbox</button>
      <StepRail step={6} />
      <div className="p-6 flex flex-col gap-4" style={card}>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <p className="text-base font-bold" style={{ color: '#222' }}>Statement lines imported successfully.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Hotel" value={getEntity(hotelId)?.propertyCode ?? '—'} />
          <Stat label={kind === 'bank' ? 'Account' : 'Card'} value={accountName} />
          <Stat label="Month" value={fmtMonth(month)} />
          <Stat label="Rows Imported" value={String(done.count)} accent="#15803d" />
          <Stat label="Duplicates Skipped" value={String(done.dups)} accent="#b45309" />
          <Stat label="Suggested by Rules" value={String(done.suggested)} accent={PURPLE} />
        </div>
        <Footer>
          <Ghost onClick={reset}>Upload Another</Ghost>
          <div className="flex gap-2">
            <button onClick={() => router.push('/web/accounting/statements')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Go to Inbox</button>
            <Primary onClick={() => router.push(`/web/accounting/reconciliation-workbench/${done.importId}`)}>Open Reconciliation Workbench <ArrowRight className="w-4 h-4" /></Primary>
          </div>
        </Footer>
      </div>
    </div>
  );
}

/* ── bits ─────────────────────────────────────────────────────────────── */
function StepRail({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STEPS.map((l, i) => {
        const n = i + 1; const isDone = step > n; const active = step === n;
        return (
          <div key={l} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: isDone ? '#15803d' : active ? PURPLE : '#f0f0f0', color: isDone || active ? '#fff' : '#929292' }}>{isDone ? '✓' : n}</div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: active ? '#222' : '#929292' }}>{l}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-5 h-px" style={{ background: '#dddddd' }} />}
          </div>
        );
      })}
    </div>
  );
}
function TypeCard({ active, onClick, icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button onClick={onClick} className="p-5 rounded-2xl text-left flex flex-col gap-2" style={{ border: `2px solid ${active ? PURPLE : '#dddddd'}`, background: active ? '#f0eefb' : '#fff' }}>
      <div style={{ color: active ? PURPLE : '#6a6a6a' }}>{icon}</div>
      <p className="text-sm font-bold" style={{ color: '#222' }}>{title}</p>
      <p className="text-xs" style={{ color: '#929292' }}>{sub}</p>
    </button>
  );
}
function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return <div className="p-6 flex flex-col gap-4" style={card}><div><h2 className="text-lg font-bold" style={{ color: '#222' }}>{title}</h2>{sub && <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{sub}</p>}</div>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>{children}</div>;
}
function Primary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}>{children}</button>;
}
function Ghost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{children}</button>;
}
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}
function ErrorMsg({ text }: { text: string }) {
  return <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {text}</div>;
}

export default function UploadStatementPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
