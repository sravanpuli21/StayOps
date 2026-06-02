'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { formatCurrency } from '@hos/shared';
import type { ChartOfAccount, AccountType } from '@hos/shared';

const TYPE_ORDER: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];
const TYPE_LABEL: Record<AccountType, string> = {
  asset: 'Assets', liability: 'Liabilities', equity: 'Equity', revenue: 'Revenue', expense: 'Expenses',
};

export default function ChartOfAccountsPage() {
  const data = useAccountingData();
  const [query, setQuery] = useState('');

  const balanceByAccount = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of data.transactions) m.set(t.accountId, (m.get(t.accountId) ?? 0) + t.amount);
    return m;
  }, [data.transactions]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = (a: ChartOfAccount) =>
      !q || a.name.toLowerCase().includes(q) || a.number.toLowerCase().includes(q);
    const out: Record<AccountType, ChartOfAccount[]> = {
      asset: [], liability: [], equity: [], revenue: [], expense: [],
    };
    for (const a of data.coa) if (filter(a)) out[a.type].push(a);
    return out;
  }, [data.coa, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Chart of Accounts</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{data.coa.length} accounts · USALI-aligned · period {data.period.from} → {data.period.to}</p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
        <input
          type="text"
          placeholder="Search by name or number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm pl-9 pr-3 py-2 rounded-full"
          style={{ border: '1px solid #dddddd', background: '#ffffff' }}
        />
      </div>

      <div className="flex flex-col gap-6">
        {TYPE_ORDER.map((type) => {
          const rows = grouped[type];
          if (rows.length === 0) return null;
          const total = rows.reduce((s, a) => s + (balanceByAccount.get(a.id) ?? 0), 0);
          return (
            <div key={type}>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{TYPE_LABEL[type]} · {rows.length}</h2>
                <p className="text-sm font-semibold" style={{ color: '#222222' }}>{formatCurrency(total)}</p>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
                {rows.map((a, i) => {
                  const balance = balanceByAccount.get(a.id) ?? 0;
                  return (
                    <div key={a.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <p className="text-xs font-mono w-20" style={{ color: '#6a6a6a' }}>{a.number}</p>
                        <p className="text-sm font-medium truncate" style={{ color: '#222222' }}>{a.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>
                          {a.usaliDept.toUpperCase()}
                        </span>
                        <p className="text-sm tabular-nums w-32 text-right" style={{ color: '#222222', fontWeight: balance !== 0 ? 600 : 400 }}>
                          {balance === 0 ? '—' : formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
