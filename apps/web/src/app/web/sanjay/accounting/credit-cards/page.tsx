'use client';

import { useMemo } from 'react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { formatCurrency, HOTELS } from '@hos/shared';

export default function CreditCardsPage() {
  const data = useAccountingData();

  const ccCards = useMemo(() => data.bankAccounts.filter((b) => b.kind === 'cc' && b.hotelId !== 'CONSOLIDATED'), [data.bankAccounts]);

  const spendByCard = useMemo(() => {
    const m = new Map<string, { spend: number; count: number }>();
    for (const r of data.ccRows) {
      const cur = m.get(r.bankAccountId) ?? { spend: 0, count: 0 };
      cur.spend += r.amount;
      cur.count += 1;
      m.set(r.bankAccountId, cur);
    }
    return m;
  }, [data.ccRows]);

  const totalSpend = ccCards.reduce((s, c) => s + (spendByCard.get(c.id)?.spend ?? 0), 0);
  const totalCount = ccCards.reduce((s, c) => s + (spendByCard.get(c.id)?.count ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Credit Cards</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {ccCards.length} cards · {totalCount} charges · {formatCurrency(totalSpend)} period spend
          </p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ccCards.map((c) => {
          const stats = spendByCard.get(c.id) ?? { spend: 0, count: 0 };
          const hotel = HOTELS.find((h) => h.id === c.hotelId);
          return (
            <div key={c.id} className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #dddddd', background: 'linear-gradient(135deg,#222222 0%,#3f3f3f 100%)', color: '#ffffff' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Amex Business</p>
                  <p className="text-sm font-semibold mt-0.5">{hotel?.shortName ?? c.hotelId}</p>
                </div>
                <p className="text-[10px] opacity-70">····{c.last4}</p>
              </div>
              <p className="text-2xl font-bold tabular-nums">{formatCurrency(c.bookBalance)}</p>
              <div className="flex items-center justify-between text-xs opacity-90">
                <span>Period spend: {formatCurrency(stats.spend)}</span>
                <span>{stats.count} txns</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Recent Charges</h3>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #f0f0f0' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                <th className={th}>Date</th>
                <th className={th}>Card</th>
                <th className={th}>Description</th>
                <th className={th + ' text-right'}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.ccRows.slice(0, 30).map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < 29 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{r.dateIso}</td>
                  <td className="py-2.5 px-4 text-xs font-mono" style={{ color: '#3f3f3f' }}>····{r.cardLast4}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#222222' }}>{r.description}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-semibold" style={{ color: '#b91c1c' }}>{formatCurrency(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
