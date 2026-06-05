'use client';

import { useState } from 'react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import { card, Badge } from '../../_ui';
import { ReportTabs } from '../_shell';

const REPORTS = ['Profit and Loss', 'Balance Sheet', 'Cash Flow', 'Trial Balance', 'General Ledger', 'Transaction Detail', 'Bank Reconciliation Report', 'Credit Card Reconciliation Report', 'Vendor Spend', 'Journal Entry Report', 'Month Close Report'];
const DOCS = ['Bank Statements', 'Credit Card Statements', 'Receipts', 'Reconciliation Reports', 'Supporting Documents'];

export default function CpaPackagePage() {
  const { selection } = useAcctOs();
  const [scope, setScope] = useState(selection.kind === 'hotel' ? 'single' : 'all');
  const [hotelId, setHotelId] = useState(selection.kind === 'hotel' ? selection.hotelId : HOTEL_ENTITIES[2].id);
  const [reports, setReports] = useState<Set<string>>(new Set(REPORTS.slice(0, 8)));
  const [docs, setDocs] = useState<Set<string>>(new Set(DOCS.slice(0, 4)));
  const [format, setFormat] = useState('pdf');
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, v: string) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>CPA Package</h1><p className="text-sm" style={{ color: '#929292' }}>Export accounting reports and supporting documents for CPA review.</p></div>

      {done ? (
        <div className="rounded-2xl p-8 text-center flex flex-col items-center gap-3" style={card}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-6 h-6" style={{ color: '#15803d' }} /></div>
          <h2 className="text-lg font-bold" style={{ color: '#222' }}>CPA package generated successfully.</h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{reports.size} reports + {docs.size} document sets for {scope === 'all' ? 'all hotels' : getEntity(hotelId)?.hotelName} · {format.toUpperCase()}.</p>
          <button onClick={() => { setDone(false); setPreview(false); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Create Another</button>
        </div>
      ) : (
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={card}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entity Scope"><select value={scope} onChange={(e) => setScope(e.target.value)} className={inp}><option value="single">Single Hotel</option><option value="all">All Hotels</option></select></Field>
            {scope === 'single' && <Field label="Hotel Entity"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp}>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select></Field>}
            <Field label="Period"><select className={inp}><option>May 2026</option></select></Field>
            <Field label="Accounting Basis"><select className={inp}><option>Accrual</option><option>Cash</option></select></Field>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Include Reports</p>
            <div className="grid grid-cols-2 gap-1.5">{REPORTS.map((r) => <label key={r} className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="checkbox" checked={reports.has(r)} onChange={() => toggle(reports, setReports, r)} />{r}</label>)}</div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Include Documents</p>
            <div className="grid grid-cols-2 gap-1.5">{DOCS.map((d) => <label key={d} className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="checkbox" checked={docs.has(d)} onChange={() => toggle(docs, setDocs, d)} />{d}</label>)}</div>
          </div>
          <Field label="Export Format"><div className="flex gap-2">{['pdf', 'excel', 'zip', 'csv'].map((f) => <button key={f} onClick={() => setFormat(f)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: format === f ? '#6a4ec0' : '#fff', border: '1px solid #dddddd', color: format === f ? '#fff' : '#6a6a6a' }}>{f.toUpperCase()}</button>)}</div></Field>

          {preview && (
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#f7f7f7' }}>
              <p className="text-sm font-semibold" style={{ color: '#222' }}>Package Preview</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>{reports.size} reports · {docs.size} document sets · {scope === 'all' ? `${HOTEL_ENTITIES.length} hotels` : '1 hotel'} · ~{reports.size + docs.size * 4} files</p>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs flex items-center gap-1.5" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> 4 receipts are missing</span>
                <span className="text-xs flex items-center gap-1.5" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> 1 reconciliation is not complete</span>
                <span className="text-xs flex items-center gap-1.5" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> 7 transactions are not posted</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={() => setPreview(true)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Preview Package</button>
            <button onClick={() => setDone(true)} disabled={reports.size === 0} className="h-9 px-5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff', opacity: reports.size ? 1 : 0.5 }}><Package className="w-3.5 h-3.5" /> Generate CPA Package</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222]';
