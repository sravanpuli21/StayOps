'use client';

import { useState } from 'react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { Download, CheckCircle2 } from 'lucide-react';
import { card, money, Badge } from '../../_ui';
import { hotelComparison, cashPosition } from '../_reports';
import { ReportTabs } from '../_shell';
import { printReport } from '../_export';

const SECTIONS = ['Portfolio Summary', 'Best Performing Hotels', 'Hotels Needing Attention', 'Revenue by Hotel', 'Expenses by Hotel', 'Cash Position', 'Month Close Status'];

export default function OwnerPackagePage() {
  const ids = HOTEL_ENTITIES.slice(0, 6).map((h) => h.id);
  const comp = hotelComparison(ids);
  const cash = cashPosition(ids);
  const [preview, setPreview] = useState(true);

  const totalRev = comp.reduce((s, c) => s + c.revenue, 0);
  const totalNet = comp.reduce((s, c) => s + c.netIncome, 0);
  const best = comp.slice(0, 3);
  const attention = comp.filter((c) => c.margin < 15);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Owner Package</h1><p className="text-sm" style={{ color: '#929292' }}>A simple, high-level financial summary for ownership.</p></div>
        <button onClick={() => printReport('Owner Package — HOS Management')} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Download className="w-3.5 h-3.5" /> Export PDF</button>
      </div>

      {/* Portfolio summary */}
      <div className="rounded-2xl p-5" style={card}>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Portfolio Summary · May 2026</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total Revenue" value={money(totalRev)} />
          <Stat label="Net Income" value={money(totalNet)} accent="#15803d" />
          <Stat label="Total Cash" value={money(cash.totals.total)} />
          <Stat label="Hotels" value={String(comp.length)} />
        </div>
      </div>

      {/* Best performing */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Best Performing Hotels</h2></div>
        <table className="w-full text-sm border-collapse"><tbody>
          {best.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
              <td className="py-2 px-5 text-sm" style={{ color: '#222' }}>{getEntity(c.id)?.hotelName}</td>
              <td className="py-2 px-5 text-right text-xs" style={{ color: '#15803d' }}>{money(c.netIncome)}</td>
              <td className="py-2 px-5 text-right"><Badge label={`${c.margin}% margin`} fg="#15803d" bg="#dcfce7" /></td>
            </tr>
          ))}
        </tbody></table>
      </div>

      {/* Hotels needing attention */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hotels Needing Attention</h2></div>
        {attention.length === 0 ? <p className="px-5 py-4 text-sm" style={{ color: '#929292' }}>All hotels are performing above a 15% margin.</p> : (
          <table className="w-full text-sm border-collapse"><tbody>
            {attention.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-5 text-sm" style={{ color: '#222' }}>{getEntity(c.id)?.hotelName}</td>
                <td className="py-2 px-5 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(c.netIncome)}</td>
                <td className="py-2 px-5 text-right"><Badge label={`${c.margin}% margin`} fg="#b45309" bg="#fef3c7" /></td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      {/* Cash position */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Cash Position by Hotel</h2></div>
        <table className="w-full text-sm border-collapse"><tbody>
          {cash.rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
              <td className="py-2 px-5 text-sm" style={{ color: '#222' }}>{getEntity(r.id)?.hotelName}</td>
              <td className="py-2 px-5 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(r.total)}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3 rounded-xl" style={{ background: '#f7f7f7' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
