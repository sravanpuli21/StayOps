'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, UploadCloud, Download, FileSpreadsheet } from 'lucide-react';
import { card, Badge } from '../../_ui';

const STEPS = ['Upload CSV', 'Map Columns', 'Review', 'Complete'];
const FIELDS = ['Legal Entity Name', 'Hotel Name', 'Property Address', 'Phone', 'Rooms', 'Tax ID', 'Property Code', 'Opening Date', 'Manager'];

const SAMPLE_ROWS = [
  { hotel: 'Lakeside Inn - Macon', legal: 'Macon Lodging LLC', code: 'MACLK', issue: null },
  { hotel: 'Harbor Suites - Mobile', legal: 'Gulf Harbor LLC', code: 'MOBHS', issue: null },
  { hotel: 'Cambria Hotel - Savannah', legal: '321 Montgomery, LLC', code: 'GA989', issue: 'Duplicate property code' },
  { hotel: 'Pine Ridge Hotel', legal: '', code: 'PINE1', issue: 'Missing legal entity' },
];

export default function ImportEntitiesPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState('');

  const newCount = SAMPLE_ROWS.filter((r) => !r.issue).length;
  const issues = SAMPLE_ROWS.filter((r) => r.issue);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/entities')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</button>
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: step > i ? '#15803d' : step === i ? '#6a4ec0' : '#f0f0f0', color: step >= i ? '#fff' : '#929292' }}>{step > i ? '✓' : i + 1}</div><span className="text-xs font-medium hidden sm:block" style={{ color: step === i ? '#222' : '#929292' }}>{s}</span></div>
            {i < STEPS.length - 1 && <div className="w-5 h-px" style={{ background: '#dddddd' }} />}
          </div>
        ))}
      </div>

      <div className="p-6 flex flex-col gap-4" style={card}>
        {step === 0 && (<>
          <div><h2 className="text-lg font-bold" style={{ color: '#222' }}>Import Hotel Entities</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Upload a CSV file to create or update multiple hotel entities.</p></div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold self-start" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Download CSV Template</button>
          <label className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl cursor-pointer" style={{ border: '2px dashed #dddddd', background: '#fafafa' }}>
            <UploadCloud className="w-7 h-7" style={{ color: '#6a4ec0' }} />
            {file ? <span className="text-sm font-medium" style={{ color: '#222' }}><FileSpreadsheet className="w-4 h-4 inline mr-1" />{file}</span> : <span className="text-sm" style={{ color: '#929292' }}>Drag and drop CSV file here or browse</span>}
            <input type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? 'hotel-entities.csv')} />
            {!file && <button type="button" onClick={(e) => { e.preventDefault(); setFile('hotel-entities-sample.csv'); }} className="text-xs font-semibold mt-1" style={{ color: '#6a4ec0' }}>Use a sample file</button>}
          </label>
          <p className="text-[11px]" style={{ color: '#929292' }}>Required columns: {FIELDS.join(', ')}.</p>
          <Footer onBack={() => router.push('/web/accounting/entities')} backLabel="Cancel" onNext={() => file && setStep(1)} nextLabel="Upload CSV" nextDisabled={!file} />
        </>)}

        {step === 1 && (<>
          <div><h2 className="text-lg font-bold" style={{ color: '#222' }}>Map Columns</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Match your CSV columns to StayOps entity fields.</p></div>
          <div className="flex flex-col gap-2">
            {FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-xs w-44" style={{ color: '#3f3f3f' }}>{f}</span>
                <select className="flex-1 h-9 px-2 rounded-lg text-xs" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} defaultValue={f}><option>{f}</option><option>— Not mapped —</option></select>
                <Check className="w-4 h-4" style={{ color: '#15803d' }} />
              </div>
            ))}
          </div>
          <Footer onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Continue" />
        </>)}

        {step === 2 && (<>
          <div><h2 className="text-lg font-bold" style={{ color: '#222' }}>Review Import</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Confirm before creating these entities.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="New" value={String(newCount)} accent="#15803d" /><Stat label="To Update" value="1" /><Stat label="Missing Fields" value="1" accent="#b45309" /><Stat label="Duplicate Codes" value="1" accent="#b91c1c" />
          </div>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #dddddd' }}>
            <table className="w-full text-xs border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Legal Entity', 'Code', 'Status', 'Issue'].map((h) => <th key={h} className="text-left px-2.5 py-2 font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
              <tbody>{SAMPLE_ROWS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="px-2.5 py-1.5" style={{ color: '#222' }}>{r.hotel}</td>
                  <td className="px-2.5 py-1.5" style={{ color: '#3f3f3f' }}>{r.legal || '—'}</td>
                  <td className="px-2.5 py-1.5 font-mono" style={{ color: '#6a6a6a' }}>{r.code}</td>
                  <td className="px-2.5 py-1.5">{r.issue ? <Badge label="Needs Fix" fg="#b45309" bg="#fef3c7" /> : <Badge label="Ready" fg="#15803d" bg="#dcfce7" />}</td>
                  <td className="px-2.5 py-1.5" style={{ color: r.issue ? '#b91c1c' : '#c1c1c1' }}>{r.issue ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Footer onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Import Entities" />
        </>)}

        {step === 3 && (<>
          <div className="flex flex-col items-center text-center gap-3 py-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
            <h2 className="text-lg font-bold" style={{ color: '#222' }}>Import Complete</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Created" value={String(newCount)} accent="#15803d" /><Stat label="Updated" value="1" /><Stat label="Skipped" value="1" accent="#b45309" /><Stat label="Errors" value="1" accent="#b91c1c" />
          </div>
          <div className="flex gap-2 justify-end">
            <button className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Download Error Report</button>
            <button onClick={() => router.push('/web/accounting/entities')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>View Hotel Entities</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function Footer({ onBack, backLabel = 'Back', onNext, nextLabel, nextDisabled }: { onBack: () => void; backLabel?: string; onNext: () => void; nextLabel: string; nextDisabled?: boolean }) {
  return <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
    <button onClick={onBack} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{backLabel}</button>
    <button onClick={onNext} disabled={nextDisabled} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff', opacity: nextDisabled ? 0.5 : 1 }}>{nextLabel} <ArrowRight className="w-4 h-4" /></button>
  </div>;
}
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}
