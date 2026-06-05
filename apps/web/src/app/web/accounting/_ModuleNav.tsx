'use client';

import { Badge } from './_ui';

/** Reusable in-module sub-navigation tab bar (Banking / Credit Cards / Transactions / Vendors). */
export function ModuleNav<T extends string>({ tabs, active, onChange, counts }: {
  tabs: readonly T[]; active: T; onChange: (t: T) => void; counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap flex items-center gap-1.5"
          style={{ color: active === t ? '#6a4ec0' : '#6a6a6a', borderBottom: active === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>
          {t}
          {counts && counts[t] != null && counts[t]! > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: active === t ? '#ece4fb' : '#f0f0f0', color: active === t ? '#6a4ec0' : '#929292' }}>{counts[t]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function ScopeHeader({ single, title, sub }: { single: boolean; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2">
      <Badge label={single ? 'One Hotel' : 'All Hotels'} fg={single ? '#1d4ed8' : '#6a4ec0'} bg={single ? '#dbeafe' : '#ece4fb'} />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>{title}</h1><p className="text-sm" style={{ color: '#929292' }}>{sub}</p></div>
    </div>
  );
}
