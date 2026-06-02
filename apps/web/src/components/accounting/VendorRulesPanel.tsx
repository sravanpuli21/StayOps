import type { CategoryRule, ChartOfAccount } from '@hos/shared';

interface Props {
  rules: CategoryRule[];
  coa: ChartOfAccount[];
}

export function VendorRulesPanel({ rules, coa }: Props) {
  const accountById = new Map(coa.map((a) => [a.id, a]));
  const sorted = [...rules].sort((a, b) => b.hits - a.hits).slice(0, 12);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Learned Rules</h3>
        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Top {sorted.length} by hit count · auto-categorize on next import</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map((r) => {
          const a = accountById.get(r.accountId);
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg" style={{ background: '#f7f7f7' }}>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#222222' }}>{r.pattern}</p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: '#929292' }}>→ {a?.name ?? r.accountId}</p>
              </div>
              <p className="text-[10px] font-bold tracking-wide" style={{ color: '#6a6a6a' }}>{r.hits} hits</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
