'use client';

import { useAcctState, deleteSavedReport } from '../../_store';
import { card, Badge, fmtDate } from '../../_ui';
import { ReportTabs } from '../_shell';

// A few seed saved reports so the screen is never empty in the demo.
const SEED = [
  { id: 'seed-1', name: 'Monthly P&L by Hotel', type: 'Profit and Loss', scope: 'All Hotels', filters: 'May 2026 · Accrual', createdBy: 'Sanjay Narsee', lastRun: '2026-06-01' },
  { id: 'seed-2', name: 'HOS Portfolio Cash Position', type: 'Cash Position', scope: 'All Hotels', filters: 'As of May 31, 2026', createdBy: 'Sanjay Narsee', lastRun: '2026-06-02' },
  { id: 'seed-3', name: 'Missing Receipts by GM', type: 'Missing Card Receipts', scope: 'All Hotels', filters: 'May 2026', createdBy: 'Sanjay Narsee', lastRun: '2026-05-30' },
  { id: 'seed-4', name: 'Vendor Spend Over $5,000', type: 'Vendor Spend', scope: 'All Hotels', filters: 'Spend > $5,000', createdBy: 'Sanjay Narsee', lastRun: '2026-05-28' },
  { id: 'seed-5', name: 'CPA Month-End Package', type: 'CPA Package', scope: 'Cambria', filters: 'May 2026 · 8 reports', createdBy: 'Sanjay Narsee', lastRun: '2026-06-03' },
];

export default function SavedReportsPage() {
  const store = useAcctState();
  const rows = [...store.savedReports, ...SEED];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Saved Reports</h1><p className="text-sm" style={{ color: '#929292' }}>Access saved report views, filters, and packages.</p></div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Report Name', 'Type', 'Scope', 'Filters', 'Created By', 'Last Run', 'Actions'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{r.name}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.type}</td>
                <td className="py-2.5 px-3"><Badge label={r.scope} fg="#1d4ed8" bg="#dbeafe" /></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.filters}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.createdBy}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastRun)}</td>
                <td className="py-2.5 px-3"><div className="flex gap-2 whitespace-nowrap"><button className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Run</button><button className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Edit Filters</button>{!r.id.startsWith('seed') && <button onClick={() => deleteSavedReport(r.id)} className="text-xs font-semibold" style={{ color: '#b91c1c' }}>Delete</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
