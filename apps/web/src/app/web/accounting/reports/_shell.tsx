'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, Save, Download, MoreHorizontal, X, FileSpreadsheet } from 'lucide-react';
import { getEntity, type AcctTransaction } from '@hos/shared/accounting-os';
import { useAcctState, toggleFavoriteReport, saveReport } from '../_store';
import { card, money, fmtDate, Badge } from '../_ui';
import { exportExcel, exportCsv, printReport, copyReportLink } from './_export';

export const REPORT_TABS = [
  { label: 'Library', href: '/web/accounting/reports' },
  { label: 'Favorites', href: '/web/accounting/reports/favorites' },
  { label: 'Financial Statements', href: '/web/accounting/reports/financial-statements' },
  { label: 'Banking', href: '/web/accounting/reports/banking' },
  { label: 'Credit Cards', href: '/web/accounting/reports/credit-cards' },
  { label: 'Vendors', href: '/web/accounting/reports/vendors' },
  { label: 'Reconciliation', href: '/web/accounting/reports/reconciliation' },
  { label: 'Month Close', href: '/web/accounting/reports/month-close' },
  { label: 'Portfolio', href: '/web/accounting/reports/portfolio' },
  { label: 'CPA Package', href: '/web/accounting/reports/cpa-package' },
  { label: 'Saved', href: '/web/accounting/reports/saved' },
  { label: 'Settings', href: '/web/accounting/reports/settings' },
];

export function ReportTabs() {
  const pathname = usePathname() ?? '';
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {REPORT_TABS.map((t) => {
        const active = t.href === '/web/accounting/reports' ? pathname === t.href : pathname.startsWith(t.href);
        return <Link key={t.href} href={t.href} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: active ? '#6a4ec0' : '#6a6a6a', borderBottom: active ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t.label}</Link>;
      })}
    </div>
  );
}

/** Standard report builder header: title, favorite, save, export, more. */
export function ReportHeader({ id, title, subtitle, scopeLabel }: { id: string; title: string; subtitle: string; scopeLabel: string }) {
  const store = useAcctState();
  const fav = store.favoriteReports.includes(id);
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = () => { saveReport({ name: `${title} — ${scopeLabel}`, type: title, scope: scopeLabel, filters: 'May 2026 · Accrual', createdBy: 'Sanjay Narsee', lastRun: '2026-06-04' }); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button onClick={() => toggleFavoriteReport(id)}><Star className="w-5 h-5" style={{ color: fav ? '#f59e0b' : '#cfcfcf', fill: fav ? '#f59e0b' : 'none' }} /></button>
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>{title}</h1><p className="text-sm" style={{ color: '#929292' }}>{subtitle}</p></div>
      </div>
      <div className="flex gap-2 relative">
        <button onClick={onSave} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: saved ? '#15803d' : '#6a6a6a' }}><Save className="w-3.5 h-3.5" /> {saved ? 'Saved' : 'Save Report'}</button>
        <button onClick={() => printReport(title)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export PDF</button>
        <button onClick={() => exportExcel(title)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
        <button onClick={() => setMenu((m) => !m)} className="h-9 w-9 rounded-xl inline-flex items-center justify-center" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><MoreHorizontal className="w-4 h-4" /></button>
        {menu && (
          <div className="absolute right-0 top-10 z-50 w-48 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            {([
              ['Export CSV', () => exportCsv(title)],
              ['Print', () => printReport(title)],
              ['Add to Favorites', () => toggleFavoriteReport(id)],
              ['Copy Report Link', () => copyReportLink()],
            ] as Array<[string, () => void]>).map(([l, fn]) => (
              <button key={l} onClick={() => { fn(); setMenu(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f7]" style={{ color: '#222' }}>{l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** The filter bar shown above every report. Compact, demo-friendly. */
export function FilterBar({ scope, hotelId, extra, onRun }: { scope: string; hotelId?: string; extra?: React.ReactNode; onRun?: () => void }) {
  return (
    <div className="rounded-2xl p-3 flex items-end gap-3 flex-wrap" style={card}>
      <FB label="Entity Scope"><span className="text-sm h-9 inline-flex items-center px-2 rounded-lg" style={{ background: '#f7f7f7', color: '#222' }}>{scope}</span></FB>
      {hotelId && <FB label="Hotel"><span className="text-sm h-9 inline-flex items-center px-2 rounded-lg" style={{ background: '#f7f7f7', color: '#222' }}>{getEntity(hotelId)?.hotelName}</span></FB>}
      <FB label="Date Range"><select className={fil} defaultValue="this-month"><option value="this-month">This Month</option><option value="last-month">Last Month</option><option value="this-quarter">This Quarter</option><option value="ytd">Year to Date</option><option value="last-year">Last Year</option><option value="custom">Custom</option></select></FB>
      <FB label="Accounting Basis"><select className={fil} defaultValue="accrual"><option value="accrual">Accrual</option><option value="cash">Cash</option></select></FB>
      <FB label="Comparison"><select className={fil} defaultValue="none"><option value="none">None</option><option value="prev-month">Previous Month</option><option value="prev-year">Same Month Last Year</option><option value="ytd">Year to Date</option></select></FB>
      {extra}
      <button onClick={onRun} className="h-9 px-4 rounded-xl text-xs font-semibold ml-auto" style={{ background: '#6a4ec0', color: '#fff' }}>Run Report</button>
    </div>
  );
}
function FB({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</label>{children}</div>; }
const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#3f3f3f]';

/** Report meta block shown above the table. */
export function ReportMeta({ company, period, basis }: { company: string; period: string; basis?: string }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-1">
      <div><p className="font-bold" style={{ color: '#222' }}>{company}</p><p className="text-xs" style={{ color: '#929292' }}>{period}{basis ? ` · ${basis} basis` : ''}</p></div>
      <p className="text-[11px]" style={{ color: '#b0b0b0' }}>Last updated {fmtDate('2026-06-04')}</p>
    </div>
  );
}

/** Drill-down drawer: transactions behind a clicked number. */
export function DrillDrawer({ title, hotelLabel, txs, onClose }: { title: string; hotelLabel: string; txs: AcctTransaction[]; onClose: () => void }) {
  const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);
  return (
    <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl h-full flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>{title} Detail</h2><p className="text-[11px]" style={{ color: '#929292' }}>{hotelLabel} · {txs.length} transactions · {money(total)}</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {txs.length === 0 ? <p className="p-6 text-sm" style={{ color: '#929292' }}>No transactions behind this number for the selected period.</p> : (
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd', position: 'sticky', top: 0 }}>{['Date', 'Source', 'Description', 'Vendor', 'Amount', 'JE', 'Actions'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {txs.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.vendor ?? '—'}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                    <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a4ec0' }}>JE-{1000 + i}</td>
                    <td className="py-2 px-3"><Link href="/web/accounting/transactions" className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
