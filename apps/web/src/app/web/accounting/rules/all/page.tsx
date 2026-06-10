'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useAcctOs } from '../../_context';
import { hotelLabel } from '../../_domain';
import { card, PageHeader, EmptyState, inputStyle, PURPLE } from '../../_ui';
import { ruleRows, RISK_LABEL, type RiskLevel } from '../_data';
import { RuleTableRow } from '../_RuleRow';

export default function AllRulesPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const rows = useMemo(() => ruleRows(hotelId), [hotelId]);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<'all' | 'global' | 'hotel_level'>('all');
  const [risk, setRisk] = useState<RiskLevel | ''>('');

  const filtered = rows.filter((r) => {
    if (q && !r.rule.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (scope !== 'all' && r.rule.scope !== scope) return false;
    if (risk && r.risk !== risk) return false;
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="All Rules" subtitle="View and manage global and hotel-level rules." actions={<Link href="/web/accounting/rules/new" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Create Rule</Link>} />
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-xs" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rule name…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        <select value={scope} onChange={(e) => setScope(e.target.value as any)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}><option value="all">All Scopes</option><option value="global">Global</option><option value="hotel_level">Hotel-Level</option></select>
        <select value={risk} onChange={(e) => setRisk(e.target.value as RiskLevel | '')} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}><option value="">All Risk</option>{Object.entries(RISK_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{filtered.length} rules</span>
      </div>
      {filtered.length === 0 ? <EmptyState title="No rules match." /> : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule', 'Scope', 'Sets', 'Risk', 'Review', 'Matched', 'Accuracy', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Matched', 'Accuracy'].includes(h) ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((r) => <RuleTableRow key={r.rule.id} r={r} onOpen={() => router.push(`/web/accounting/rules/${r.rule.id}`)} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
