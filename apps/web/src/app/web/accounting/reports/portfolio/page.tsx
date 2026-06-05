'use client';

import { useState } from 'react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { card, money, Badge } from '../../_ui';
import { hotelComparison, cashPosition, profitLoss } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

const VIEWS = ['Hotel Comparison', 'Expense Comparison', 'Cash Position', 'Hotels Losing Money'] as const;
const EXP_CATS = ['Payroll Expense', 'Repairs and Maintenance', 'Utilities', 'Franchise Fees', 'OTA Commissions'];

export default function PortfolioReportsPage() {
  const ids = HOTEL_ENTITIES.slice(0, 8).map((h) => h.id);
  const [view, setView] = useState<typeof VIEWS[number]>('Hotel Comparison');
  const comp = hotelComparison(ids);
  const cash = cashPosition(ids);
  const losing = comp.filter((c) => c.netIncome < 0);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="portfolio" title="Portfolio Reports" subtitle="Compare hotels across the HOS portfolio." scopeLabel="All Hotels" />
      <FilterBar scope="All Hotels" />

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {VIEWS.map((v) => <button key={v} onClick={() => setView(v)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: view === v ? '#6a4ec0' : '#6a6a6a', borderBottom: view === v ? '2px solid #6a4ec0' : '2px solid transparent' }}>{v}</button>)}
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>{view}</h2><ReportMeta company="HOS Management" period="May 2026" /></div>

        {view === 'Hotel Comparison' && (
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Rooms', 'Revenue', 'Expenses', 'Net Income', 'Profit Margin', 'Cash'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>{comp.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{getEntity(c.id)?.hotelName}</td>
                <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(c.id)?.propertyCode}</td>
                <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{c.rooms}</td>
                <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(c.revenue)}</td>
                <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(c.expenses)}</td>
                <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: c.netIncome < 0 ? '#b91c1c' : '#15803d' }}>{c.netIncome < 0 ? `(${money(Math.abs(c.netIncome))})` : money(c.netIncome)}</td>
                <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{c.margin}%</td>
                <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(c.cash)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}

        {view === 'Expense Comparison' && (
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}><th className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>Expense Category</th>{comp.slice(0, 5).map((c) => <th key={c.id} className="text-right text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{getEntity(c.id)?.propertyCode}</th>)}</tr></thead>
            <tbody>{EXP_CATS.map((cat) => (
              <tr key={cat} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-3 text-sm whitespace-nowrap" style={{ color: '#222' }}>{cat}</td>
                {comp.slice(0, 5).map((c) => { const pnl = profitLoss(c.id); const amt = pnl.lines.find((l) => l.account === cat)?.amount ?? 0; return <td key={c.id} className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(amt)}</td>; })}
              </tr>
            ))}</tbody>
          </table></div>
        )}

        {view === 'Cash Position' && (
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Operating Checking', 'Payroll Checking', 'Reserve Account', 'Total Cash'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {cash.rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{getEntity(r.id)?.hotelName}</td>
                  <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(r.id)?.propertyCode}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.op)}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.pay)}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.res)}</td>
                  <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(r.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#fafafa', borderTop: '1px solid #dddddd' }}><td className="py-2.5 px-3 font-bold" colSpan={2} style={{ color: '#222' }}>Total</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.op)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.pay)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.res)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.total)}</td></tr>
            </tbody>
          </table></div>
        )}

        {view === 'Hotels Losing Money' && (
          losing.length === 0 ? <div className="p-10 text-center"><p className="text-sm font-semibold" style={{ color: '#222' }}>No hotels show a net loss for this period.</p><p className="text-xs mt-1" style={{ color: '#929292' }}>Every HOS hotel was profitable in May 2026.</p></div> : (
            <table className="w-full text-sm border-collapse"><tbody>{losing.map((c) => (<tr key={c.id}><td className="py-2 px-3">{getEntity(c.id)?.hotelName}</td><td className="py-2 px-3 text-right" style={{ color: '#b91c1c' }}>{money(c.netIncome)}</td></tr>))}</tbody></table>
          )
        )}
      </div>
    </div>
  );
}
