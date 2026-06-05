'use client';

import { useState } from 'react';
import { ACCT_COMPANY, getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money } from '../../_ui';
import { profitLoss, portfolioPnl, drillTransactions } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta, DrillDrawer } from '../_shell';

export default function ProfitLossPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const [drill, setDrill] = useState<{ account: string; hotelId: string } | null>(null);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="profit-loss" title={single ? 'Profit and Loss' : 'Portfolio Profit and Loss'} subtitle="View revenue, expenses, and net income for the selected hotel or portfolio." scopeLabel={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} />

      {single ? <SingleHotelPnl hotelId={selection.hotelId} onDrill={(account) => setDrill({ account, hotelId: selection.hotelId })} /> : <PortfolioPnl />}

      {drill && <DrillDrawer title={drill.account} hotelLabel={getEntity(drill.hotelId)?.hotelName ?? ''} txs={drillTransactions(drill.hotelId, drill.account)} onClose={() => setDrill(null)} />}
    </div>
  );
}

function SingleHotelPnl({ hotelId, onDrill }: { hotelId: string; onDrill: (account: string) => void }) {
  const h = getEntity(hotelId);
  const { lines } = profitLoss(hotelId);
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <h2 className="text-base font-bold" style={{ color: '#222' }}>Profit and Loss</h2>
        <ReportMeta company={`${h?.hotelName} · ${h?.legalEntity} · ${h?.propertyCode}`} period="May 1, 2026 to May 31, 2026" basis="Accrual" />
      </div>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}><th className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-5" style={{ color: '#6a6a6a' }}>Account</th><th className="text-right text-[10px] font-semibold uppercase tracking-wide py-2.5 px-5" style={{ color: '#6a6a6a' }}>May 2026</th></tr></thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f7f7f7', background: l.total ? '#fafafa' : l.section ? '#fcfcfc' : '#fff' }}>
              <td className="py-2 px-5" style={{ color: l.section || l.total ? '#222' : '#3f3f3f', fontWeight: l.section || l.total ? 700 : 400, paddingLeft: l.indent ? 36 : 20 }}>{l.label}</td>
              <td className="py-2 px-5 text-right" style={{ color: '#222', fontWeight: l.total ? 700 : 400 }}>
                {l.amount != null && (l.account ? <button onClick={() => onDrill(l.account!)} className="hover:underline" style={{ color: '#6a4ec0' }}>{money(l.amount)}</button> : money(l.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 text-[11px]" style={{ color: '#b0b0b0', borderTop: '1px solid #f0f0f0' }}>Click any account amount to drill into the transactions and journal entries behind it.</div>
    </div>
  );
}

function PortfolioPnl() {
  const ids = HOTEL_ENTITIES.slice(0, 6).map((h) => h.id);
  const { rows, perHotel, totals } = portfolioPnl(ids);
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <h2 className="text-base font-bold" style={{ color: '#222' }}>Portfolio Profit and Loss</h2>
        <ReportMeta company={ACCT_COMPANY?.name ?? 'HOS Management'} period="May 1, 2026 to May 31, 2026" basis="Accrual" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4 whitespace-nowrap" style={{ color: '#6a6a6a' }}>Account</th>
            <th className="text-right text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4 whitespace-nowrap" style={{ color: '#6a6a6a' }}>Total HOS</th>
            {perHotel.map((ph) => <th key={ph.id} className="text-right text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{getEntity(ph.id)?.propertyCode}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} style={{ borderBottom: '1px solid #f7f7f7', background: row.total ? '#fafafa' : '#fff' }}>
                <td className="py-2 px-4 whitespace-nowrap" style={{ color: '#222', fontWeight: row.total ? 700 : 400 }}>{row.label}</td>
                <td className="py-2 px-4 text-right" style={{ color: '#222', fontWeight: 700 }}>{money(totals[row.key])}</td>
                {perHotel.map((ph) => <td key={ph.id} className="py-2 px-4 text-right" style={{ color: '#3f3f3f', fontWeight: row.total ? 600 : 400 }}>{money(ph.vals[row.key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
