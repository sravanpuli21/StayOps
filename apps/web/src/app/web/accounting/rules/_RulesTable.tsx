'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { getEntity, type RichRule } from '@hos/shared/accounting-os';
import { setRuleStatus } from '../_store';
import { monthMatchCount, lastMatched, actionSummary, conditionSummary, hotelsAffected } from '../_rules';
import { ScopeBadge, RuleStatusBadge, SourceLabel } from './_shared';

export function RulesTable({ rules, showScope = true, showHotel = false, showOverrides = false }: { rules: RichRule[]; showScope?: boolean; showHotel?: boolean; showOverrides?: boolean }) {
  const router = useRouter();
  const cols = ['Rule Name', showScope && 'Scope', showHotel && 'Hotel', 'Source', 'Condition', 'Action', 'Priority', 'Matched / mo', 'Last', showOverrides && 'Overrides', 'Status', ''].filter(Boolean) as string[];

  if (rules.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd', borderRadius: 16 }}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{cols.map((h, i) => <th key={h + i} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Priority' || h === 'Matched / mo' ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rules.map((r) => {
            const code = r.hotelId ? getEntity(r.hotelId)?.propertyCode : undefined;
            return (
              <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/rules/${r.id}`)}>
                <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{r.name}</td>
                {showScope && <td className="py-2.5 px-3"><ScopeBadge rule={r} code={code} /></td>}
                {showHotel && <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.hotelId ? getEntity(r.hotelId)?.hotelName : '—'}</td>}
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{SourceLabel(r.source)}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f', maxWidth: 200 }}>{conditionSummary(r)}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a', maxWidth: 200 }}>{actionSummary(r)}</td>
                <td className="py-2.5 px-3 text-center text-xs font-mono" style={{ color: '#6a6a6a' }}>{r.priority}</td>
                <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: '#6a4ec0' }}>{monthMatchCount(r)}×</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{lastMatched(r) === '—' ? '—' : lastMatched(r).slice(5)}</td>
                {showOverrides && <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.scope === 'global' ? `${hotelsAffected(r)} hotels` : 'Overrides global'}</td>}
                <td className="py-2.5 px-3"><RuleStatusBadge status={r.status} /></td>
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}><RowMenu rule={r} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RowMenu({ rule }: { rule: RichRule }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn); }, []);
  const base = { name: rule.name, scope: rule.scope, hotelId: rule.hotelId };
  const canDelete = monthMatchCount(rule) === 0;

  return (
    <div ref={ref} className="relative flex items-center gap-2 whitespace-nowrap">
      <button onClick={() => router.push(`/web/accounting/rules/${rule.id}`)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button>
      <button onClick={() => setOpen((o) => !o)}><MoreHorizontal className="w-4 h-4" style={{ color: '#929292' }} /></button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-48 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <MI label="Edit" onClick={() => router.push(`/web/accounting/rules/${rule.id}?edit=1`)} />
          <MI label="Test" onClick={() => router.push(`/web/accounting/rules/test?rule=${rule.id}`)} />
          <MI label="Apply to Existing" onClick={() => router.push(`/web/accounting/rules/${rule.id}?tab=Matched+Transactions`)} />
          {rule.status === 'disabled'
            ? <MI label="Enable" onClick={() => { setRuleStatus(rule.id, base, 'active'); setOpen(false); }} />
            : <MI label="Disable" onClick={() => { setRuleStatus(rule.id, base, 'disabled'); setOpen(false); }} />}
          <MI label="Delete" disabled={!canDelete} tooltip={!canDelete ? 'Cannot delete a rule that has matched transactions. Disable it instead.' : undefined} />
        </div>
      )}
    </div>
  );
}
function MI({ label, onClick, disabled, tooltip }: { label: string; onClick?: () => void; disabled?: boolean; tooltip?: string }) {
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} title={tooltip} className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f7]" style={{ color: disabled ? '#c1c1c1' : '#222', cursor: disabled ? 'not-allowed' : 'pointer' }}>{label}</button>;
}
