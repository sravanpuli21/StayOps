'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card } from '../../_ui';
import { CoaTabs } from '../_shared';

export default function ExportPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const [scope, setScope] = useState(single ? 'current' : 'all');
  const [format, setFormat] = useState('csv');
  const [opts, setOpts] = useState({ balances: true, inactive: false, usage: true });
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <CoaTabs />
      <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Export Chart of Accounts</h1><p className="text-sm" style={{ color: '#929292' }}>Download this hotel’s accounts, the portfolio setup summary, or the template.</p></div>

      {done ? (
        <div className="rounded-2xl p-8 text-center flex flex-col items-center gap-3" style={card}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-6 h-6" style={{ color: '#15803d' }} /></div>
          <h2 className="text-lg font-bold" style={{ color: '#222' }}>Chart of Accounts exported successfully.</h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>Your {format.toUpperCase()} export is ready{scope === 'current' && single ? ` for ${getEntity(selection.hotelId)?.hotelName}` : ''}.</p>
          <div className="flex gap-2 mt-1"><button onClick={() => setDone(false)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Export Again</button><button onClick={() => router.push('/web/accounting/chart-of-accounts')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Done</button></div>
        </div>
      ) : (
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={card}>
          <Field label="Entity Scope">
            <div className="flex flex-col gap-2">
              {[['current', 'Current Hotel' + (single ? ` — ${getEntity(selection.hotelId)?.hotelName}` : ' (select a hotel first)')], ['all', 'All Hotels Setup Summary'], ['template', 'Template Only']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="radio" checked={scope === v} onChange={() => setScope(v)} disabled={v === 'current' && !single} />{l}</label>
              ))}
            </div>
          </Field>
          <Field label="File Format">
            <div className="flex gap-2">{['csv', 'excel', 'pdf'].map((f) => <button key={f} onClick={() => setFormat(f)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: format === f ? '#6a4ec0' : '#fff', border: '1px solid #dddddd', color: format === f ? '#fff' : '#6a6a6a' }}>{f.toUpperCase()}</button>)}</div>
          </Field>
          <Field label="Include">
            <div className="flex flex-col gap-2">
              {([['balances', 'Include Balances'], ['inactive', 'Include Inactive Accounts'], ['usage', 'Include Usage Count']] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} />{l}</label>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2">
            <Link href="/web/accounting/chart-of-accounts" className="h-9 px-4 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</Link>
            <button onClick={() => setDone(true)} className="h-9 px-5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-2"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
