'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Download, CheckCircle2, FileText } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, Badge } from '../../_ui';
import { CoaTabs } from '../_shared';

const STEPS = ['Select Hotel & Upload', 'Map Columns', 'Preview Import', 'Import Complete'];
const CSV_COLS = ['Account Code', 'Account Name', 'Account Type', 'Detail Type', 'Parent Account', 'Report Section', 'Description', 'Status'];
const REQUIRED = ['Account Code', 'Account Name', 'Account Type', 'Detail Type'];

const SAMPLE_ROWS = [
  { row: 1, code: '6255', name: 'Door Lock Repairs', type: 'Expense', status: 'OK', issue: '' },
  { row: 2, code: '6256', name: 'Key Card Supplies', type: 'Expense', status: 'OK', issue: '' },
  { row: 3, code: '6210', name: 'Repairs and Maintenance', type: 'Expense', status: 'Duplicate', issue: 'Account code already exists for this hotel.' },
  { row: 4, code: '', name: 'Pool Chemicals', type: 'Expense', status: 'Invalid', issue: 'Account code is required.' },
  { row: 5, code: '4115', name: 'EV Charging Revenue', type: 'Revenue', status: 'OK', issue: '' },
];

export default function ImportPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const [step, setStep] = useState(0);
  const [hotelId, setHotelId] = useState(selection.kind === 'hotel' ? selection.hotelId : '');
  const [fileName, setFileName] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>(Object.fromEntries(CSV_COLS.map((c) => [c, c])));
  const [skipped, setSkipped] = useState<Set<number>>(new Set());

  const valid = SAMPLE_ROWS.filter((r) => r.status === 'OK' && !skipped.has(r.row));
  const dupes = SAMPLE_ROWS.filter((r) => r.status === 'Duplicate');
  const invalid = SAMPLE_ROWS.filter((r) => r.status === 'Invalid');

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <CoaTabs />
      <Link href="/web/accounting/chart-of-accounts/accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Accounts</Link>
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Import Chart of Accounts</h1><p className="text-sm" style={{ color: '#929292' }}>Upload a CSV file to create or update accounts for a hotel entity.</p></div>

      {/* Stepper */}
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i <= step ? '#6a4ec0' : '#f0f0f0', color: i <= step ? '#fff' : '#929292' }}>{i + 1}</div>
            <span className="text-xs font-semibold" style={{ color: i === step ? '#222' : '#929292' }}>{s}</span>
            {i < STEPS.length - 1 && <span className="w-6 h-px" style={{ background: '#dddddd' }} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={card}>
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Field label="Hotel Entity *"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inpS}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select></Field>
            <Field label="CSV File *">
              <label className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl cursor-pointer" style={{ border: '2px dashed #dddddd' }}>
                <Upload className="w-6 h-6" style={{ color: '#929292' }} />
                <span className="text-sm" style={{ color: '#6a6a6a' }}>{fileName || 'Click to choose a CSV file'}</span>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? 'chart-of-accounts.csv')} />
              </label>
            </Field>
            <button className="self-start inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#6a4ec0' }}><Download className="w-3.5 h-3.5" /> Download COA CSV Template</button>
            <p className="text-[11px]" style={{ color: '#b0b0b0' }}>CSV columns: {CSV_COLS.join(', ')}</p>
            <div className="flex justify-end gap-2">
              <Link href="/web/accounting/chart-of-accounts/accounts" className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</Link>
              <button disabled={!hotelId || !fileName} onClick={() => setStep(1)} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: hotelId && fileName ? 1 : 0.5 }}>Continue</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: '#6a6a6a' }}>Map your CSV columns to StayOps account fields. Required fields are marked.</p>
            <div className="flex flex-col gap-2">
              {CSV_COLS.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="text-sm w-44" style={{ color: '#222' }}>{c}{REQUIRED.includes(c) && <span style={{ color: '#b91c1c' }}> *</span>}</span>
                  <select value={mapping[c]} onChange={(e) => setMapping((m) => ({ ...m, [c]: e.target.value }))} className="h-9 px-2.5 rounded-lg text-sm flex-1" style={inpS}>
                    <option value="">— Skip —</option>
                    {CSV_COLS.map((col) => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => setStep(0)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back</button><button onClick={() => setStep(2)} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Preview Import</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Stat label="New Accounts" value={valid.length} accent="#15803d" />
              <Stat label="To Update" value={0} />
              <Stat label="Invalid Rows" value={invalid.length} accent={invalid.length ? '#b91c1c' : '#222'} />
              <Stat label="Duplicate Codes" value={dupes.length} accent={dupes.length ? '#b45309' : '#222'} />
              <Stat label="Missing Fields" value={invalid.length} accent={invalid.length ? '#b91c1c' : '#222'} />
            </div>
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #f0f0f0' }}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Row', 'Code', 'Account Name', 'Type', 'Status', 'Issue', 'Action'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {SAMPLE_ROWS.map((r) => (
                    <tr key={r.row} style={{ borderBottom: '1px solid #f0f0f0', opacity: skipped.has(r.row) ? 0.4 : 1 }}>
                      <td className="py-2 px-3 text-xs" style={{ color: '#929292' }}>{r.row}</td>
                      <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{r.code || '—'}</td>
                      <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{r.name}</td>
                      <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.type}</td>
                      <td className="py-2 px-3"><Badge label={r.status} fg={r.status === 'OK' ? '#15803d' : r.status === 'Duplicate' ? '#b45309' : '#b91c1c'} bg={r.status === 'OK' ? '#dcfce7' : r.status === 'Duplicate' ? '#fef3c7' : '#fee2e2'} /></td>
                      <td className="py-2 px-3 text-xs" style={{ color: '#b91c1c' }}>{r.issue}</td>
                      <td className="py-2 px-3">{r.status !== 'OK' && <button onClick={() => setSkipped((p) => { const n = new Set(p); n.has(r.row) ? n.delete(r.row) : n.add(r.row); return n; })} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{skipped.has(r.row) ? 'Unskip' : 'Skip Row'}</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => setStep(1)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back</button><button onClick={() => setStep(3)} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Import Accounts</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-6 h-6" style={{ color: '#15803d' }} /></div>
            <h2 className="text-lg font-bold" style={{ color: '#222' }}>Chart of Accounts imported successfully.</h2>
            <div className="grid grid-cols-4 gap-3 w-full max-w-md mt-2">
              <Stat label="Created" value={valid.length} accent="#15803d" />
              <Stat label="Updated" value={0} />
              <Stat label="Skipped" value={dupes.length + invalid.length} accent="#b45309" />
              <Stat label="Errors" value={0} />
            </div>
            <p className="text-xs" style={{ color: '#929292' }}>Imported into {getEntity(hotelId)?.hotelName}.</p>
            <div className="flex gap-2 mt-2">
              <button className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileText className="w-3.5 h-3.5" /> Download Error Report</button>
              <button onClick={() => router.push('/web/accounting/chart-of-accounts/accounts')} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>View Accounts</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: number; accent?: string }) { return <div className="py-2 px-3 rounded-lg text-center" style={{ background: '#f7f7f7' }}><p className="text-lg font-bold" style={{ color: accent }}>{value}</p><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p></div>; }
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
