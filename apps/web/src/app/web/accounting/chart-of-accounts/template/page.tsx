'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers, Copy, Download } from 'lucide-react';
import { COA_TEMPLATES, coaTemplateSummary } from '@hos/shared/accounting-os';
import { card, Badge, fmtDate } from '../../_ui';
import { CoaTabs } from '../_shared';
import { ApplyTemplateModal } from '../_ApplyTemplate';

export default function TemplatesPage() {
  const router = useRouter();
  const [applyOpen, setApplyOpen] = useState(false);
  const t = coaTemplateSummary();

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>COA Templates</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Create and manage standard account templates for hotel entities.</p>
          <p className="text-xs mt-0.5 max-w-2xl" style={{ color: '#b0b0b0' }}>Templates create a consistent account structure across hotels. Each hotel still has its own separate accounts and balances.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Copy className="w-3.5 h-3.5" /> Duplicate Template</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export Template</button>
          <button onClick={() => setApplyOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Layers className="w-3.5 h-3.5" /> Apply Template to Hotel</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Template</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Template Name', 'Hotel Type', 'Accounts', 'Applied Hotels', 'Last Updated', 'Status', 'Actions'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 2 || i === 3 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
          <tbody>
            {COA_TEMPLATES.map((tp) => (
              <tr key={tp.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/chart-of-accounts/template/${tp.id}`)}>
                <td className="py-2.5 px-3"><span className="font-medium inline-flex items-center gap-2" style={{ color: '#222' }}>{tp.name}{tp.primary && <Badge label="Primary" fg="#6a4ec0" bg="#ece4fb" />}</span></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{tp.hotelType}</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{tp.accounts}</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{tp.appliedHotels}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(tp.lastUpdated)}</td>
                <td className="py-2.5 px-3"><Badge label={tp.status === 'active' ? 'Active' : tp.status === 'draft' ? 'Draft' : 'Archived'} fg={tp.status === 'active' ? '#15803d' : '#6a6a6a'} bg={tp.status === 'active' ? '#dcfce7' : '#f0f0f0'} /></td>
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 whitespace-nowrap">
                    <button onClick={() => router.push(`/web/accounting/chart-of-accounts/template/${tp.id}`)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button>
                    <button onClick={() => setApplyOpen(true)} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Apply</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl p-5" style={card}>
        <p className="text-sm font-bold" style={{ color: '#222' }}>Hotel Standard Chart of Accounts</p>
        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>The default account structure applied to HOS hotel entities.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
          {[['Total', t.total], ['Required', t.required], ['System', t.system], ['Revenue', t.revenue], ['Expenses', t.expenses], ['Assets', t.assets], ['Liabilities', t.liabilities], ['Equity', t.equity], ['COGS', t.cogs], ['Other', t.otherIncome + t.otherExpense]].map(([l, v]) => (
            <div key={l as string} className="py-2 text-center rounded-lg" style={{ background: '#f7f7f7' }}><p className="text-base font-bold" style={{ color: '#222' }}>{v}</p><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>{l}</p></div>
          ))}
        </div>
      </div>

      {applyOpen && <ApplyTemplateModal onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
