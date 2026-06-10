'use client';

import { useState } from 'react';
import { Wand2, ArrowDown } from 'lucide-react';
import { SEED_RICH_RULES, getEntity, type RichRule } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { hotelLabel } from '../_domain';
import { card, Badge, PageHeader, PURPLE } from '../_ui';

export default function RulesPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [scope, setScope] = useState<'all' | 'global' | 'hotel_level'>('all');

  const rules = SEED_RICH_RULES.filter((r) => {
    if (hotelId && r.scope === 'hotel_level' && r.hotelId !== hotelId) return false;
    if (scope !== 'all' && r.scope !== scope) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Rules" subtitle="Rules run before review to suggest vendor, category, department, and receipt requirement." />

      <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: '#f6f4fd', border: '1px solid #e3d9fb' }}>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: PURPLE }}>
          <Badge label="1. Hotel-level" fg="#1d4ed8" bg="#dbeafe" /> <ArrowDown className="w-3 h-3" /> <Badge label="2. Global" fg={PURPLE} bg="#ece4fb" /> <ArrowDown className="w-3 h-3" /> <Badge label="3. System suggestion" fg="#6a6a6a" bg="#f0f0f0" />
        </div>
        <p className="text-xs" style={{ color: '#6a6a6a' }}>Hotel-level rules override global rules for that hotel. Vendors stay hotel-specific even when a global rule sets a name.</p>
      </div>

      <div className="flex gap-1">
        {(['all', 'hotel_level', 'global'] as const).map((s) => (
          <button key={s} onClick={() => setScope(s)} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: scope === s ? '#ece4fb' : '#fff', color: scope === s ? PURPLE : '#6a6a6a', border: '1px solid #eee' }}>
            {s === 'all' ? 'All Rules' : s === 'global' ? 'Global' : 'Hotel-level'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule', 'Scope', 'When', 'Sets', 'Receipt', 'Status'].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-2.5 px-3"><p className="text-sm font-medium" style={{ color: '#222' }}>{r.name}</p>{r.hotelId && <p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(r.hotelId)?.hotelName}</p>}</td>
                <td className="py-2.5 px-3">{r.scope === 'hotel_level' ? <Badge label="Hotel-level" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Global" fg={PURPLE} bg="#ece4fb" />}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.conditions[0] ? `${r.conditions[0].field} ${r.conditions[0].operator.toLowerCase()} “${r.conditions[0].value}”` : '—'}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{r.actions.setCategoryName ?? r.actions.setTransactionType ?? '—'}{r.actions.setDepartment ? ` · ${r.actions.setDepartment}` : ''}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.actions.receipt === 'over-amount' ? `Over $${r.actions.receiptOver}` : r.actions.receipt === 'always' ? 'Always' : 'Not required'}</td>
                <td className="py-2.5 px-3">{r.status === 'active' ? <Badge label="Active" fg="#15803d" bg="#dcfce7" /> : r.status === 'disabled' ? <Badge label="Disabled" fg="#6a6a6a" bg="#f0f0f0" /> : <Badge label="Draft" fg="#b45309" bg="#fef3c7" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
