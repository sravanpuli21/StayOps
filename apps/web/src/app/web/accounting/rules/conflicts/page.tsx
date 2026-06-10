'use client';

import Link from 'next/link';
import { ArrowLeft, GitMerge } from 'lucide-react';
import { card, Badge, PageHeader, EmptyState, PURPLE } from '../../_ui';

const CONFLICTS = [
  { type: 'Global vs Hotel-Level', hotel: 'Cambria Hotel - Savannah', line: 'AMAZON BUSINESS $620', ruleA: 'Global: AMAZON → Office Supplies', ruleB: 'Cambria: AMAZON → Guest Supplies', result: 'Hotel-level wins → Guest Supplies', severity: 'medium' },
];

export default function RuleConflictsPage() {
  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="All Hotels" title="Rule Conflicts" subtitle="Review rules that match the same lines or create different accounting suggestions." />
      {CONFLICTS.length === 0 ? <EmptyState icon={<GitMerge className="w-8 h-8" />} title="No rule conflicts found." body="Rules are applying without conflicts." /> : (
        <div className="flex flex-col gap-3">
          {CONFLICTS.map((c, i) => (
            <div key={i} className="p-4 rounded-2xl flex flex-col gap-2" style={card}>
              <div className="flex items-center gap-2"><Badge label={c.type} fg="#b45309" bg="#fef3c7" /><span className="text-sm font-bold" style={{ color: '#222' }}>{c.hotel}</span></div>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>Example line: {c.line}</p>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ border: '1px solid #eee' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Rule A</p><p className="text-sm" style={{ color: '#222' }}>{c.ruleA}</p></div>
                <div className="rounded-lg p-2.5" style={{ border: '1px solid #eee' }}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Rule B</p><p className="text-sm" style={{ color: '#222' }}>{c.ruleB}</p></div>
              </div>
              <p className="text-xs" style={{ color: '#15803d' }}>Recommended: {c.result}</p>
              <div className="flex gap-2"><button className="h-8 px-3 rounded-lg text-[11px] font-semibold" style={{ background: PURPLE, color: '#fff' }}>Use Hotel-Level Rule</button><button className="h-8 px-3 rounded-lg text-[11px] font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Mark Resolved</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
