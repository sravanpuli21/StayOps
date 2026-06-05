'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowLeft, ArrowRight, UploadCloud, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';
import {
  HOTEL_ENTITIES, bankAccountsForHotel, creditCardsForHotel, getEntity,
  VENDOR_NAMES, VENDOR_SUGGESTIONS, type AcctTransaction,
} from '@hos/shared/accounting-os';
import { useAcctOs } from './_context';
import { importStatement } from './_store';
import { card, money, Badge, fmtMonth } from './_ui';

type Kind = 'bank' | 'credit-card';
const MONTHS = ['2026-05', '2026-04', '2026-03', '2026-02', '2026-01'];
const CSV_COLS = ['Date', 'Description', 'Amount', 'Balance', 'Reference', 'Check #', 'Memo'];
const FIELDS = ['Date', 'Description', 'Amount', 'Balance', 'Reference Number', 'Check Number', 'Memo'];

/** Deterministic sample rows so the preview feels like a real statement. */
function genRows(hotelId: string, accountId: string, kind: Kind, month: string): AcctTransaction[] {
  let s = (hotelId.charCodeAt(0) * 31 + accountId.length * 7 + Number(month.slice(5))) >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  const expense = VENDOR_NAMES.filter((v) => !['STRIPE PAYOUT', 'PMS DEPOSIT'].includes(v));
  const n = 9 + Math.floor(r() * 8);
  const rows: AcctTransaction[] = [];
  for (let i = 0; i < n; i++) {
    const inflow = kind === 'bank' && r() > 0.78;
    const vendor = inflow ? (r() > 0.5 ? 'PMS DEPOSIT' : 'STRIPE PAYOUT') : expense[Math.floor(r() * expense.length)];
    const amount = inflow ? Math.round((2000 + r() * 8000) * 100) / 100 : -Math.round((35 + r() * 2200) * 100) / 100;
    const day = 1 + Math.floor(r() * 27);
    rows.push({
      id: `up-${accountId}-${month}-${i}`,
      hotelId, accountId, source: kind,
      dateIso: `${month}-${String(day).padStart(2, '0')}`,
      description: `${vendor}${inflow ? '' : ` #${1000 + Math.floor(r() * 8999)}`}`,
      amount, vendor: undefined, status: 'needs-review', receipt: Math.abs(amount) > 250 && !inflow ? 'required' : 'not-required',
      importBatchId: '',
    });
  }
  return rows;
}

export function UploadFlow({ kind }: { kind: Kind }) {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const preHotel = params.get('hotel') ?? (selection.kind === 'hotel' ? selection.hotelId : '');
  const preAccount = params.get('account') ?? '';

  const [step, setStep] = useState(1);
  const [hotelId, setHotelId] = useState(preHotel);
  const [accountId, setAccountId] = useState(preAccount);
  const [month, setMonth] = useState('2026-05');
  const [endBalance, setEndBalance] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  // mapping: field → csv column
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<{ batchId: string; count: number; dups: number } | null>(null);

  const accounts = kind === 'bank' ? bankAccountsForHotel(hotelId) : creditCardsForHotel(hotelId);
  const rows = useMemo(() => (hotelId && accountId ? genRows(hotelId, accountId, kind, month) : []), [hotelId, accountId, kind, month]);
  // Duplicate heuristic: a couple of rows flagged as possible dupes of existing books.
  const dupIds = useMemo(() => new Set(rows.filter((_, i) => i % 7 === 3).map((x) => x.id)), [rows]);

  const label = kind === 'bank' ? 'Bank' : 'Credit Card';
  const accountWord = kind === 'bank' ? 'Bank Account' : 'Credit Card';

  /* Step 1 → 2 */
  const toMapping = () => {
    if (!hotelId) return setError('Please select a hotel entity.');
    if (!accountId) return setError('Please select an account.');
    if (!fileName) return setError('Please upload a CSV file.');
    setError(''); setStep(2);
  };
  const autoMap = () => {
    setMapping({ Date: 'Date', Description: 'Description', Amount: 'Amount', Balance: 'Balance', 'Reference Number': 'Reference', 'Check Number': 'Check #', Memo: 'Memo' });
  };
  const toPreview = () => {
    if (!mapping['Date']) return setError('Date column is required.');
    if (!mapping['Amount']) return setError('Amount column is required.');
    setError(''); setStep(3);
  };
  const doImport = () => {
    const keep = rows.filter((x) => !removed.has(x.id) && !dupIds.has(x.id));
    const acctName = accounts.find((a) => a.id === accountId)?.name ?? accountId;
    const batchId = importStatement(
      { hotelId, accountId, source: kind, month, count: keep.length, duplicates: dupIds.size },
      keep,
    );
    setImported({ batchId, count: keep.length, dups: dupIds.size });
    setStep(4);
    void acctName;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-sm inline-flex items-center gap-1" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Back</button>
      </div>
      <Steps step={step} kind={kind} />

      {/* STEP 1 */}
      {step === 1 && (
        <Panel title={`Upload ${label} Statement`} sub={`Select the hotel and ${accountWord.toLowerCase()}, then upload the statement CSV.`}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Hotel Entity">
              <select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setAccountId(''); }} className={inputCls} style={inputStyle}>
                <option value="">Select hotel…</option>
                {HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}
              </select>
            </Field>
            <Field label={accountWord}>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} disabled={!hotelId} className={inputCls} style={inputStyle}>
                <option value="">{hotelId ? 'Select account…' : 'Pick a hotel first'}</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · ••{a.last4}</option>)}
              </select>
            </Field>
            <Field label="Statement Month">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} style={inputStyle}>
                {MONTHS.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
              </select>
            </Field>
            <Field label={`Statement ${kind === 'bank' ? 'Ending' : ''} Balance`}>
              <input value={endBalance} onChange={(e) => setEndBalance(e.target.value)} placeholder="$0.00" className={inputCls} style={inputStyle} />
            </Field>
          </div>
          <Field label="Statement File (CSV)">
            <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl cursor-pointer" style={{ border: '2px dashed #dddddd', background: '#fafafa' }}>
              <UploadCloud className="w-7 h-7" style={{ color: '#6a4ec0' }} />
              {fileName ? <span className="text-sm font-medium" style={{ color: '#222' }}><FileSpreadsheet className="w-4 h-4 inline mr-1" />{fileName}</span> : <span className="text-sm" style={{ color: '#929292' }}>Click to choose a CSV file</span>}
              <input type="file" accept=".csv" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? `${label.toLowerCase()}-statement-${month}.csv`)} />
              {!fileName && <button type="button" onClick={(e) => { e.preventDefault(); setFileName(`${label.toLowerCase()}-statement-${month}.csv`); }} className="text-xs font-semibold mt-1" style={{ color: '#6a4ec0' }}>Use a sample file</button>}
            </label>
          </Field>
          {error && <ErrorMsg text={error} />}
          <Footer>
            <Ghost onClick={() => router.back()}>Cancel</Ghost>
            <Primary onClick={toMapping}>Continue <ArrowRight className="w-4 h-4" /></Primary>
          </Footer>
        </Panel>
      )}

      {/* STEP 2 — mapping */}
      {step === 2 && (
        <Panel title="Map Statement Columns" sub="Match the columns from your CSV file to StayOps accounting fields.">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>CSV Preview</p>
              <div className="rounded-xl overflow-hidden text-xs" style={{ border: '1px solid #dddddd' }}>
                <div className="grid grid-cols-3" style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  {['Date', 'Description', 'Amount'].map((c) => <div key={c} className="px-2 py-1.5 font-semibold" style={{ color: '#6a6a6a' }}>{c}</div>)}
                </div>
                {rows.slice(0, 8).map((row) => (
                  <div key={row.id} className="grid grid-cols-3" style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <div className="px-2 py-1.5" style={{ color: '#3f3f3f' }}>{row.dateIso.slice(5)}</div>
                    <div className="px-2 py-1.5 truncate" style={{ color: '#3f3f3f' }}>{row.description}</div>
                    <div className="px-2 py-1.5" style={{ color: row.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(row.amount, { sign: true })}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Map to fields</p>
              {FIELDS.map((f) => {
                const required = f === 'Date' || f === 'Amount' || f === 'Description';
                return (
                  <div key={f} className="flex items-center gap-2">
                    <span className="text-xs w-32 flex items-center gap-1" style={{ color: '#3f3f3f' }}>{f}{required && <span style={{ color: '#b91c1c' }}>*</span>}</span>
                    <select value={mapping[f] ?? ''} onChange={(e) => setMapping((m) => ({ ...m, [f]: e.target.value }))} className="flex-1 h-9 px-2 rounded-lg text-xs" style={inputStyle}>
                      <option value="">— Not mapped —</option>
                      {CSV_COLS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {mapping[f] && <Check className="w-4 h-4" style={{ color: '#15803d' }} />}
                  </div>
                );
              })}
            </div>
          </div>
          {error && <ErrorMsg text={error} />}
          <Footer>
            <Ghost onClick={() => setStep(1)}>Back</Ghost>
            <div className="flex gap-2">
              <button onClick={autoMap} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}>Auto Map Columns</button>
              <Primary onClick={toPreview}>Continue to Preview <ArrowRight className="w-4 h-4" /></Primary>
            </div>
          </Footer>
        </Panel>
      )}

      {/* STEP 3 — preview */}
      {step === 3 && (
        <Panel title="Preview Imported Transactions" sub="Review what will be imported. Possible duplicates are flagged.">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <Stat label="Total Rows" value={String(rows.length)} />
            <Stat label="New" value={String(rows.length - dupIds.size - removed.size)} accent="#15803d" />
            <Stat label="Possible Dupes" value={String(dupIds.size)} accent="#b45309" />
            <Stat label="Missing Fields" value="0" />
            <Stat label="Money In" value={money(rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0))} accent="#15803d" />
            <Stat label="Money Out" value={money(rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0))} accent="#b91c1c" />
          </div>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #dddddd' }}>
            <table className="w-full text-xs border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['#', 'Date', 'Description', 'Amount', 'In/Out', 'Status', ''].map((h) => <th key={h} className="text-left px-2.5 py-2 font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((row, i) => {
                  const dup = dupIds.has(row.id);
                  const gone = removed.has(row.id);
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f7f7f7', opacity: gone ? 0.4 : 1 }}>
                      <td className="px-2.5 py-1.5" style={{ color: '#929292' }}>{i + 1}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#3f3f3f' }}>{row.dateIso.slice(5)}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#222' }}>{row.description}</td>
                      <td className="px-2.5 py-1.5 font-medium" style={{ color: row.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(row.amount, { sign: true })}</td>
                      <td className="px-2.5 py-1.5" style={{ color: '#6a6a6a' }}>{row.amount < 0 ? 'Out' : 'In'}</td>
                      <td className="px-2.5 py-1.5">{dup ? <Badge label="Possible Duplicate" fg="#b45309" bg="#fef3c7" /> : <Badge label="New" fg="#15803d" bg="#dcfce7" />}</td>
                      <td className="px-2.5 py-1.5"><button onClick={() => setRemoved((p) => { const n = new Set(p); n.has(row.id) ? n.delete(row.id) : n.add(row.id); return n; })} className="text-[11px] font-semibold" style={{ color: gone ? '#6a4ec0' : '#b91c1c' }}>{gone ? 'Keep' : 'Remove'}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Footer>
            <Ghost onClick={() => setStep(2)}>Back</Ghost>
            <Primary onClick={doImport}>Import Transactions <ArrowRight className="w-4 h-4" /></Primary>
          </Footer>
        </Panel>
      )}

      {/* STEP 4 — complete */}
      {step === 4 && imported && (
        <Panel title={`${label} Statement Imported`} sub="">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
            <p className="text-base font-bold" style={{ color: '#222' }}>Statement uploaded successfully.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Hotel" value={getEntity(hotelId)?.propertyCode ?? '—'} />
            <Stat label="Account" value={accounts.find((a) => a.id === accountId)?.name ?? '—'} />
            <Stat label="Month" value={fmtMonth(month)} />
            <Stat label="Imported" value={String(imported.count)} accent="#15803d" />
            <Stat label="Duplicates Skipped" value={String(imported.dups)} accent="#b45309" />
            <Stat label="Needs Review" value={String(imported.count)} accent="#b45309" />
          </div>
          <Footer>
            <Ghost onClick={() => { setStep(1); setImported(null); setFileName(''); setMapping({}); setRemoved(new Set()); }}>Upload Another</Ghost>
            <div className="flex gap-2">
              <button onClick={() => router.push(kind === 'bank' ? '/web/accounting/banking' : '/web/accounting/credit-cards')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Go to {label === 'Bank' ? 'Banking' : 'Credit Cards'}</button>
              <Primary onClick={() => router.push('/web/accounting/transactions?tab=needs-review')}>Review Transactions Now <ArrowRight className="w-4 h-4" /></Primary>
            </div>
          </Footer>
        </Panel>
      )}
    </div>
  );
}

/* ── bits ─────────────────────────────────────────────────────────────── */
function Steps({ step, kind }: { step: number; kind: Kind }) {
  const labels = ['Select Account', 'Map Columns', 'Preview', 'Done'];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1; const done = step > n; const active = step === n;
        return (
          <div key={l} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: done ? '#15803d' : active ? '#6a4ec0' : '#f0f0f0', color: done || active ? '#fff' : '#929292' }}>{done ? '✓' : n}</div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: active ? '#222' : '#929292' }}>{l}</span>
            </div>
            {i < labels.length - 1 && <div className="w-6 h-px" style={{ background: '#dddddd' }} />}
          </div>
        );
      })}
    </div>
  );
}
function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="p-6 flex flex-col gap-4" style={card}>
      <div><h2 className="text-lg font-bold" style={{ color: '#222' }}>{title}</h2>{sub && <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{sub}</p>}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>{children}</div>;
}
function Primary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}>{children}</button>;
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
const inputCls = 'h-9 px-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6a4ec0] w-full';
const inputStyle: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
