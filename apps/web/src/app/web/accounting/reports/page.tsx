'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Package, FolderOpen, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useAcctState, toggleFavoriteReport } from '../_store';
import { card, Badge } from '../_ui';
import { REPORT_CATALOG } from './_reports';
import { ReportTabs } from './_shell';

const CATEGORIES = ['Financial Statements', 'Transactions', 'Banking', 'Credit Cards', 'Vendors', 'Reconciliation', 'Month Close', 'Portfolio'];

export default function ReportsLibraryPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const [q, setQ] = useState('');
  const [catF, setCatF] = useState('all');

  const scopeLabel = selection.kind === 'hotel' ? 'Selected Hotel' : 'All Hotels';
  const reports = useMemo(() => REPORT_CATALOG.filter((r) => {
    const s = q.toLowerCase();
    return (!s || r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)) && (catF === 'all' || r.category === catF);
  }), [q, catF]);

  const byCategory = CATEGORIES.map((c) => ({ category: c, reports: reports.filter((r) => r.category === c) })).filter((g) => g.reports.length);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Run financial, banking, vendor, reconciliation, and portfolio reports for HOS hotel entities.</p>
          <p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Select All Hotels for portfolio reporting or choose one hotel to run entity-level reports. Currently: <b>{scopeLabel}</b>.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/web/accounting/reports/saved" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FolderOpen className="w-3.5 h-3.5" /> Saved Reports</Link>
          <Link href="/web/accounting/reports/settings" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><SettingsIcon className="w-3.5 h-3.5" /> Settings</Link>
          <Link href="/web/accounting/reports/cpa-package" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Package className="w-4 h-4" /> Create Report Package</Link>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[260px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports, P&L, balance sheet, vendor spend, reconciliation..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
        <select value={catF} onChange={(e) => setCatF(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]"><option value="all">All Categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      {byCategory.map((g) => (
        <div key={g.category} className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{g.category}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.reports.map((r) => { const fav = store.favoriteReports.includes(r.id); return (
              <div key={r.id} className="p-5 flex flex-col gap-2" style={card}>
                <div className="flex items-start justify-between">
                  <p className="font-bold text-sm" style={{ color: '#222' }}>{r.name}</p>
                  <button onClick={() => toggleFavoriteReport(r.id)}><Star className="w-4 h-4" style={{ color: fav ? '#f59e0b' : '#cfcfcf', fill: fav ? '#f59e0b' : 'none' }} /></button>
                </div>
                <p className="text-xs flex-1" style={{ color: '#6a6a6a' }}>{r.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge label={r.scope} fg="#1d4ed8" bg="#dbeafe" />
                  <Badge label={r.bestFor} fg="#6a4ec0" bg="#ece4fb" />
                </div>
                <Link href={r.href} className="mt-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}>Open Report <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            ); })}
          </div>
        </div>
      ))}

      {byCategory.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No reports match.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing the search or category.</p>
        </div>
      )}
    </div>
  );
}
