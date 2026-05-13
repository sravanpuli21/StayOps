'use client';

import { DollarSign, Download } from 'lucide-react';
import { formatCurrency } from '@hos/shared';
import { useSravanProfile, useSravanPaystubs } from '@/lib/sravan-data';

export default function SravanEarningsPage() {
  const SRAVAN_EMPLOYEE = useSravanProfile() as any;
  const SRAVAN_PAYSTUBS = useSravanPaystubs();
  const current = SRAVAN_PAYSTUBS.find((p) => p.status === 'pending');
  if (!SRAVAN_EMPLOYEE || !current) return <div className="p-6 text-sm text-[#6a6a6a]">Loading…</div>;
  const history = SRAVAN_PAYSTUBS.filter((p) => p.status === 'paid');

  const totalHours = current.regularHours + current.overtimeHours;
  const ytd = SRAVAN_PAYSTUBS.reduce((s, p) => s + p.grossPay + p.tips + p.bonus, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Earnings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Pay rate {formatCurrency(SRAVAN_EMPLOYEE.payRate)}/hr · bi-weekly · direct deposit
        </p>
      </div>

      {/* Current period card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">Current Pay Period</p>
        <h2 className="text-xl font-bold mt-1">{current.period}</h2>
        <p className="text-sm mt-0.5 opacity-90">Pays {current.payDate}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatBlock label="Gross" value={formatCurrency(current.grossPay)} sub={`${totalHours} hrs`} />
          <StatBlock label="Tips" value={formatCurrency(current.tips)} sub="this period" />
          <StatBlock label="Bonus" value={formatCurrency(current.bonus)} sub="earned" />
          <StatBlock label="Est. Net" value={formatCurrency(current.netPay)} sub="after tax" highlight />
        </div>
      </div>

      {/* YTD + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmallStat label="YTD Earnings" value={formatCurrency(ytd)} sub="gross + tips + bonus" />
        <SmallStat label="Paystubs This Year" value={history.length.toString()} sub="on file" />
        <SmallStat label="Direct Deposit" value="••••4421" sub="Checking · Chase" />
      </div>

      {/* Paystubs table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Paystub History</h2>
          <span className="text-xs" style={{ color: '#929292' }}>{history.length} paid stubs</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #f0f0f0' }}>
              <th className="text-left py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Period</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reg Hrs</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>OT</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Gross</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Tips</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Bonus</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Net</th>
              <th className="py-2 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {history.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < history.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-5">
                  <p className="text-sm font-medium" style={{ color: '#222222' }}>{p.period}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>paid {p.payDate}</p>
                </td>
                <td className="py-3 px-5 text-right" style={{ color: '#3f3f3f' }}>{p.regularHours}</td>
                <td className="py-3 px-5 text-right" style={{ color: p.overtimeHours > 0 ? '#b45309' : '#929292' }}>{p.overtimeHours}</td>
                <td className="py-3 px-5 text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(p.grossPay)}</td>
                <td className="py-3 px-5 text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(p.tips)}</td>
                <td className="py-3 px-5 text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(p.bonus)}</td>
                <td className="py-3 px-5 text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(p.netPay)}</td>
                <td className="py-3 px-5 text-right">
                  <button
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[11px] font-semibold"
                    style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBlock({
  label, value, sub, highlight,
}: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: highlight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
        border: highlight ? '1px solid rgba(255,255,255,0.3)' : 'none',
      }}
    >
      <p className="text-[10px] uppercase tracking-wide font-medium opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-[10px] mt-0.5 opacity-80">{sub}</p>
    </div>
  );
}

function SmallStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(15,118,110,0.1)' }}
        >
          <DollarSign className="w-4 h-4" style={{ color: '#0f766e' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: '#222222' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}
