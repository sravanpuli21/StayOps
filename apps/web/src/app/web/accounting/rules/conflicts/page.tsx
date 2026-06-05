'use client';

import { useState } from 'react';
import { X, GitMerge } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctState, resolveConflict } from '../../_store';
import { conflicts, actionSummary, type RuleConflict } from '../../_rules';
import { card, Badge } from '../../_ui';
import { RuleTabs, SummaryCard } from '../_shared';

export default function ConflictsPage() {
  const store = useAcctState();
  const [review, setReview] = useState<RuleConflict | null>(null);
  const cf = conflicts(store);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Rule Conflicts</h1><p className="text-sm" style={{ color: '#929292' }}>Review transactions or rules where multiple rules may apply.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Hotel-level rules override global rules by default. Lower priority number runs first.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Total Conflicts" value={cf.length} accent={cf.length ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="High Priority" value={0} />
        <SummaryCard label="Global vs Hotel" value={cf.length} accent="#b45309" />
        <SummaryCard label="Same Scope" value={0} />
        <SummaryCard label="Resolved" value={store.resolvedConflicts.length} accent="#15803d" />
      </div>

      {cf.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No rule conflicts found.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Rules are currently applying without conflicts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Conflict Type', 'Transaction Example', 'Hotel', 'Rule A (wins)', 'Rule B', 'Resolution', 'Status', 'Actions'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {cf.map((c) => (
                <tr key={c.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{c.type}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{c.example}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(c.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs"><span className="inline-flex items-center gap-1"><Badge label="Hotel" fg="#1d4ed8" bg="#dbeafe" />{c.ruleA.name}</span></td>
                  <td className="py-2.5 px-3 text-xs"><span className="inline-flex items-center gap-1"><Badge label="Global" fg="#6a4ec0" bg="#ece4fb" />{c.ruleB.name}</span></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.resolution}</td>
                  <td className="py-2.5 px-3"><Badge label="Needs Review" fg="#b45309" bg="#fef3c7" /></td>
                  <td className="py-2.5 px-3"><button onClick={() => setReview(c)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {review && (
        <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setReview(null)}>
          <div className="w-full max-w-md h-full flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><div className="flex items-center gap-2"><GitMerge className="w-5 h-5" style={{ color: '#b91c1c' }} /><h2 className="text-base font-bold" style={{ color: '#222' }}>Conflict Review</h2></div><button onClick={() => setReview(null)}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
            <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Transaction Example</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{review.example} at {getEntity(review.hotelId)?.hotelName}</p></div>
              <div className="rounded-xl p-3" style={{ background: '#dbeafe' }}><div className="flex items-center gap-2 mb-1"><Badge label="Rule A · Hotel-Level" fg="#1d4ed8" bg="#fff" /><span className="text-[10px] font-bold" style={{ color: '#1d4ed8' }}>RECOMMENDED</span></div><p className="text-sm font-semibold" style={{ color: '#222' }}>{review.ruleA.name}</p><p className="text-xs" style={{ color: '#3f3f3f' }}>Sets {actionSummary(review.ruleA)}</p></div>
              <div className="rounded-xl p-3" style={{ background: '#ece4fb' }}><div className="flex items-center gap-2 mb-1"><Badge label="Rule B · Global" fg="#6a4ec0" bg="#fff" /></div><p className="text-sm font-semibold" style={{ color: '#222' }}>{review.ruleB.name}</p><p className="text-xs" style={{ color: '#3f3f3f' }}>Sets {actionSummary(review.ruleB)}</p></div>
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#f0eefb', color: '#6a4ec0' }}>Recommended: use the hotel-level rule. Hotel-level rules override global rules for this hotel.</p>
            </div>
            <div className="px-5 py-4 flex justify-end gap-2 flex-wrap" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => setReview(null)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Ignore</button>
              <button onClick={() => { resolveConflict(review.id, `${review.ruleA.name} overrides ${review.ruleB.name}`); setReview(null); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#1d4ed8', color: '#fff' }}>Use Rule A (hotel)</button>
              <button onClick={() => { resolveConflict(review.id, `${review.ruleB.name} kept for ${getEntity(review.hotelId)?.propertyCode}`); setReview(null); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Use Rule B (global)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
