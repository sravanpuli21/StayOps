'use client';

import Link from 'next/link';
import { BarChart3, ArrowRight, FileText, Package, Download } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { unpostedCount, REPORT_LIST } from './_reports';
import { hotelLabel } from '../_domain';
import { card, PageHeader, PURPLE } from '../_ui';

export default function ReportsPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const unposted = unpostedCount(store, hotelId);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Reports" subtitle="Reports use only posted accounting data. Click any number to trace it back to the source statement line."
        actions={
          <>
            <button className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Package className="w-4 h-4" /> Create CPA Package</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </>
        }
      />
      {unposted > 0 && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
          This report may be incomplete because <b>{unposted}</b> statement line{unposted === 1 ? ' is' : 's are'} not posted yet. <Link href="/web/accounting/reconciliation-workbench" className="font-semibold underline">Open the workbench</Link> to post them.
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORT_LIST.map((r) => (
          <Link key={r.key} href={`/web/accounting/reports/${r.key}`} className="p-5 rounded-2xl flex flex-col gap-2 hover:shadow-md transition-shadow" style={card}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f0eefb', color: PURPLE }}><FileText className="w-4 h-4" /></div>
            <p className="text-sm font-bold" style={{ color: '#222' }}>{r.name}</p>
            <p className="text-xs flex-1" style={{ color: '#929292' }}>{r.desc}</p>
            <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Run report <ArrowRight className="w-3 h-3" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
