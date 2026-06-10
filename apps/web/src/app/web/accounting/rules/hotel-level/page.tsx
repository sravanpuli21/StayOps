'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAcctOs } from '../../_context';
import { hotelLabel } from '../../_domain';
import { card, PageHeader, EmptyState, PURPLE } from '../../_ui';
import { ruleRows } from '../_data';
import { RuleTableRow } from '../_RuleRow';

export default function HotelLevelRulesPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const rows = useMemo(() => ruleRows(hotelId).filter((r) => r.rule.scope === 'hotel_level'), [hotelId]);
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Hotel-Level Rules" subtitle="Rules that apply only to selected hotel entities and override global rules." actions={<Link href="/web/accounting/rules/new" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Create Hotel-Level Rule</Link>} />
      {rows.length === 0 ? <EmptyState title="No hotel-level rules for this hotel." body="Create hotel-level rules for property-specific vendors and patterns." /> : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule', 'Scope', 'Sets', 'Risk', 'Review', 'Matched', 'Accuracy', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Matched', 'Accuracy'].includes(h) ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((r) => <RuleTableRow key={r.rule.id} r={r} onOpen={() => router.push(`/web/accounting/rules/${r.rule.id}`)} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
