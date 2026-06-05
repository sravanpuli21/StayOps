'use client';

import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money } from '../../_ui';
import { cashFlow } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function CashFlowPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : HOTEL_ENTITIES[2].id;
  const h = getEntity(hotelId);
  const lines = cashFlow(hotelId);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="cash-flow" title="Cash Flow" subtitle="Where cash came from and where cash went." scopeLabel={h?.hotelName ?? ''} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={hotelId} extra={
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Method</label><select className="h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#3f3f3f]"><option>Indirect</option></select></div>
      } />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>Statement of Cash Flows</h2>
          <ReportMeta company={h?.hotelName ?? ''} period="May 1, 2026 to May 31, 2026 · Indirect Method" />
        </div>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}><th className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-5" style={{ color: '#6a6a6a' }}>Cash Flow Section</th><th className="text-right text-[10px] font-semibold uppercase tracking-wide py-2.5 px-5" style={{ color: '#6a6a6a' }}>May 2026</th></tr></thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f7f7f7', background: l.total ? '#fafafa' : l.section ? '#fcfcfc' : '#fff' }}>
                <td className="py-2 px-5" style={{ color: l.section || l.total ? '#222' : '#3f3f3f', fontWeight: l.section || l.total ? 700 : 400, paddingLeft: l.indent ? 36 : 20 }}>{l.label}</td>
                <td className="py-2 px-5 text-right" style={{ color: l.amount != null && l.amount < 0 ? '#b91c1c' : '#222', fontWeight: l.total ? 700 : 400 }}>{l.amount != null ? (l.amount < 0 ? `(${money(Math.abs(l.amount))})` : money(l.amount)) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
