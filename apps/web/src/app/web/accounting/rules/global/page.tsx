'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { card, PageHeader, EmptyState, PURPLE } from '../../_ui';
import { ruleRows } from '../_data';
import { RuleTableRow } from '../_RuleRow';

export default function GlobalRulesPage() {
  const router = useRouter();
  const rows = useMemo(() => ruleRows().filter((r) => r.rule.scope === 'global'), []);
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="All Hotels" title="Global Rules" subtitle="Rules that apply across all HOS hotel entities." actions={<Link href="/web/accounting/rules/new" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Create Global Rule</Link>} />
      <p className="text-xs -mt-3" style={{ color: '#929292' }}>Global rules apply to every hotel unless a hotel-level rule overrides them. Category mapping uses the template account code and maps to each hotel's matching account. Vendors stay hotel-specific.</p>
      {rows.length === 0 ? <EmptyState title="No global rules yet." body="Global rules help standardize repeated transactions across all hotels." /> : (
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
