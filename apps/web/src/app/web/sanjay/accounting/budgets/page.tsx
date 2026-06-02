'use client';

import { useMemo } from 'react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { BUDGET_LINES, formatCurrency } from '@hos/shared';

export default function BudgetsPage() {
  const data = useAccountingData();

  // Aggregate budget vs actual by account, scoped to current hotel selection.
  const rows = useMemo(() => {
    const accountById = new Map(data.coa.map((a) => [a.id, a]));
    const budgeted = new Map<string, number>();
    for (const b of BUDGET_LINES) {
      if (!data.hotelIdSet.has(b.hotelId)) continue;
      if (b.periodMonth < data.period.from.slice(0, 7) || b.periodMonth > data.period.to.slice(0, 7)) continue;
      budgeted.set(b.accountId, (budgeted.get(b.accountId) ?? 0) + b.budgetedAmount);
    }
    const actual = new Map<string, number>();
    for (const t of data.transactions) actual.set(t.accountId, (actual.get(t.accountId) ?? 0) + t.amount);

    const all = new Set([...budgeted.keys(), ...actual.keys()]);
    return Array.from(all).map((accountId) => {
      const a = accountById.get(accountId);
      const budget = budgeted.get(accountId) ?? 0;
      const act = actual.get(accountId) ?? 0;
      const diff = act - budget;                       // for expenses (negative) "more negative = over"
      const isExpense = a?.type === 'expense';
      const isOver = isExpense ? act < budget : act < budget;
      const variancePct = budget !== 0 ? Math.round((diff / Math.abs(budget)) * 1000) / 10 : 0;
      return { accountId, account: a, budget, actual: act, diff, isOver, variancePct };
    }).filter((r) => r.budget !== 0).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [data.transactions, data.coa, data.hotelIdSet, data.period.from, data.period.to]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Budget vs Actual</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{data.scopeSub} · {data.period.from} → {data.period.to}</p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Account</th>
              <th className={th}>Type</th>
              <th className={th + ' text-right'}>Budget</th>
              <th className={th + ' text-right'}>Actual</th>
              <th className={th + ' text-right'}>Variance</th>
              <th className={th + ' text-right'}>%</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.accountId} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium" style={{ color: '#222222' }}>{r.account?.name ?? r.accountId}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{r.account?.number}</p>
                </td>
                <td className="py-3 px-4 text-xs uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{r.account?.type}</td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(r.budget)}</td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(r.actual)}</td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: r.isOver ? '#b91c1c' : '#15803d' }}>
                  {r.diff >= 0 ? '+' : ''}{formatCurrency(r.diff)}
                </td>
                <td className="py-3 px-4 text-xs text-right" style={{ color: r.isOver ? '#b91c1c' : '#15803d' }}>
                  {r.variancePct >= 0 ? '+' : ''}{r.variancePct}%
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{
                    background: r.isOver ? '#fee2e2' : '#dcfce7',
                    color: r.isOver ? '#b91c1c' : '#15803d',
                  }}>
                    {r.isOver ? 'OVER' : 'UNDER'}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No budget lines for the current scope/period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
