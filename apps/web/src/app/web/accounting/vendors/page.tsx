'use client';

import { useState } from 'react';
import { Users, Search, Building2 } from 'lucide-react';
import { ACCT_VENDORS } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { hotelLabel } from '../_domain';
import { card, money, Badge, PageHeader, EmptyState, inputStyle, PURPLE } from '../_ui';

export default function VendorsPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [q, setQ] = useState('');

  const vendors = ACCT_VENDORS.filter((v) => {
    if (hotelId && !v.hotelsUsedIn.includes(hotelId)) return false;
    if (q && !v.name.toLowerCase().includes(q.toLowerCase()) && !v.defaultCategory.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Vendors" subtitle="Vendors are hotel-specific. The same name can exist under multiple hotels as separate records." />
      <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg max-w-sm" style={inputStyle}>
        <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendors…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
      </div>
      {vendors.length === 0 ? <EmptyState icon={<Users className="w-8 h-8" />} title="No vendors found." /> : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Vendor', 'Default Category', 'Department', 'Hotels', 'Spend (May)', 'Transactions', 'Missing Receipts'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.name} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{v.name}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.defaultCategory}</td>
                  <td className="py-2.5 px-3"><Badge label={v.defaultDepartment} fg="#6a6a6a" bg="#f0f0f0" /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.hotelsUsedIn.length}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-medium" style={{ color: '#222' }}>{money(v.spendMonth)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{v.txCount}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: v.missingReceipts ? '#b91c1c' : '#c1c1c1' }}>{v.missingReceipts || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
