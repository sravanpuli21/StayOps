'use client';

import { useMemo } from 'react';
import { ACCT_TRANSACTIONS, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, fmtDate, Badge, TX_STATUS } from '../../_ui';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function TransactionDetailPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const txs = useMemo(() => ACCT_TRANSACTIONS.filter((t) => !single || t.hotelId === selection.hotelId).slice(0, 60), [single, selection]);
  const scopeName = single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels';

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="transaction-detail" title="Transaction Detail" subtitle="Transaction-level detail by hotel, source, vendor, category, and status." scopeLabel={scopeName} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>Transaction Detail</h2>
          <ReportMeta company={scopeName} period="May 2026" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Hotel', 'Source', 'Description', 'Vendor', 'Category', 'Department', 'Amount', 'Status'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 7 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {txs.map((t) => { const st = TX_STATUS[t.status]; return (
                <tr key={t.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
                  <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.vendor ?? '—'}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#3f3f3f' }}>{t.category ?? '—'}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.department ?? '—'}</td>
                  <td className="py-2 px-3 text-xs text-right font-semibold" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                  <td className="py-2 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
