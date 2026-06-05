'use client';

import { useState } from 'react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, Badge } from '../../_ui';
import { vendorSpendRows } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function VendorReportsPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const [q, setQ] = useState('');
  const rows = vendorSpendRows(single ? selection.hotelId : undefined).filter((v) => !q || v.vendor.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="vendor-reports" title="Vendor Spend" subtitle="Vendor spend by hotel — vendors are hotel-level in V1, so each vendor shows with its hotel." scopeLabel={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} extra={
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Search Vendor</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Home Depot" className="h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#3f3f3f]" /></div>
      } />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Vendor Spend</h2><ReportMeta company={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} period="May 2026" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Vendor', 'Hotel', 'Code', 'Category', 'Spend', 'Transactions', 'Missing Receipts'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 40).map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2 px-3 font-medium" style={{ color: '#222' }}>{v.vendor}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(v.hotelId)?.hotelName}</td>
                  <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(v.hotelId)?.propertyCode}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#3f3f3f' }}>{v.category}</td>
                  <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(v.spend)}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{v.count}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: v.missing ? '#b91c1c' : '#15803d' }}>{v.missing}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm" style={{ color: '#929292' }}>No vendor spend found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
