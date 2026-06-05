'use client';

import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, Badge } from '../../_ui';
import { balanceSheet } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function BalanceSheetPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : HOTEL_ENTITIES[2].id; // default Cambria for all-hotels demo
  const h = getEntity(hotelId);
  const { lines, totalAssets, totalLiabEquity, balanced } = balanceSheet(hotelId);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="balance-sheet" title="Balance Sheet" subtitle="What the hotel owns, owes, and owner equity. Assets = Liabilities + Equity." scopeLabel={h?.hotelName ?? ''} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={hotelId} />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4 flex items-start justify-between flex-wrap gap-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Balance Sheet</h2><ReportMeta company={`${h?.hotelName} · ${h?.legalEntity}`} period="As of May 31, 2026" basis="Accrual" /></div>
          <Badge label={balanced ? 'Balanced' : 'Out of Balance'} fg={balanced ? '#15803d' : '#b91c1c'} bg={balanced ? '#dcfce7' : '#fee2e2'} />
        </div>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f7f7f7', background: l.total ? '#fafafa' : l.section ? '#fcfcfc' : '#fff' }}>
                <td className="py-2 px-5" style={{ color: l.section || l.total ? '#222' : '#3f3f3f', fontWeight: l.section || l.total ? 700 : 400, paddingLeft: l.indent ? 36 : 20 }}>{l.label}</td>
                <td className="py-2 px-5 text-right" style={{ color: l.amount != null && l.amount < 0 ? '#b91c1c' : '#222', fontWeight: l.total ? 700 : 400 }}>{l.amount != null ? (l.amount < 0 ? `(${money(Math.abs(l.amount))})` : money(l.amount)) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f0f0f0', background: balanced ? '#f0fdf4' : '#fef2f2' }}>
          <span className="text-xs" style={{ color: '#6a6a6a' }}>Assets {money(totalAssets)} · Liabilities + Equity {money(totalLiabEquity)} · Difference {money(Math.abs(totalAssets - totalLiabEquity))}</span>
          <Badge label={balanced ? 'Balanced' : 'Balance sheet is out of balance'} fg={balanced ? '#15803d' : '#b91c1c'} bg={balanced ? '#dcfce7' : '#fee2e2'} />
        </div>
      </div>
    </div>
  );
}
