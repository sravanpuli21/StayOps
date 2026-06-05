'use client';

import { useState } from 'react';
import { X, Lightbulb, Globe, Building2 } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctState, ignoreSuggestion } from '../../_store';
import { suggestions, type RuleSuggestion } from '../../_rules';
import { card, Badge } from '../../_ui';
import { RuleTabs } from '../_shared';
import { CreateRuleModal, type CreateRulePrefill } from '../_CreateRule';

export default function SuggestedRulesPage() {
  const store = useAcctState();
  const [scopeF, setScopeF] = useState('all');
  const [confF, setConfF] = useState('all');
  const [review, setReview] = useState<RuleSuggestion | null>(null);
  const [create, setCreate] = useState<CreateRulePrefill | null>(null);

  const sug = suggestions(store).filter((s) => (scopeF === 'all' || (scopeF === 'global' ? s.scope === 'global' : s.scope === 'hotel_level')) && (confF === 'all' || s.confidence.toLowerCase() === confF));

  const toPrefill = (s: RuleSuggestion): CreateRulePrefill => ({
    scope: s.scope, hotelId: s.hotelId, name: s.name,
    contains: s.pattern.replace('Description contains ', ''),
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Suggested Rules</h1><p className="text-sm" style={{ color: '#929292' }}>StayOps found repeated transaction patterns that can be turned into rules.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Suggested rules are based on repeated vendors, descriptions, categories, and manual edits.</p></div>

      <div className="flex gap-2 flex-wrap">
        <select value={scopeF} onChange={(e) => setScopeF(e.target.value)} className={fil}><option value="all">All Scopes</option><option value="global">Global</option><option value="hotel">Hotel-Level</option></select>
        <select value={confF} onChange={(e) => setConfF(e.target.value)} className={fil}><option value="all">All Confidence</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      </div>

      {sug.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No suggested rules right now.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>StayOps will suggest rules when it finds repeated transaction patterns.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Suggested Rule', 'Scope', 'Hotel', 'Matching Pattern', 'Suggested Action', 'Matches', 'Confidence', 'Actions'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 5 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {sug.map((s) => (
                <tr key={s.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{s.name}</td>
                  <td className="py-2.5 px-3">{s.scope === 'global' ? <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" style={{ color: '#6a4ec0' }} /><Badge label="Global" fg="#6a4ec0" bg="#ece4fb" /></span> : <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} /><Badge label="Hotel" fg="#1d4ed8" bg="#dbeafe" /></span>}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{s.hotelId ? getEntity(s.hotelId)?.hotelName : '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{s.pattern}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{s.action}</td>
                  <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: '#6a4ec0' }}>{s.matches}</td>
                  <td className="py-2.5 px-3"><Badge label={s.confidence} fg={s.confidence === 'High' ? '#15803d' : s.confidence === 'Medium' ? '#b45309' : '#6a6a6a'} bg={s.confidence === 'High' ? '#dcfce7' : s.confidence === 'Medium' ? '#fef3c7' : '#f0f0f0'} /></td>
                  <td className="py-2.5 px-3"><div className="flex gap-2 whitespace-nowrap"><button onClick={() => setReview(s)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review</button><button onClick={() => setCreate(toPrefill(s))} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Create Rule</button><button onClick={() => ignoreSuggestion(s.id, s.name)} className="text-xs font-semibold" style={{ color: '#929292' }}>Ignore</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {review && (
        <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setReview(null)}>
          <div className="w-full max-w-md h-full flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><div className="flex items-center gap-2"><Lightbulb className="w-5 h-5" style={{ color: '#b45309' }} /><h2 className="text-base font-bold" style={{ color: '#222' }}>{review.name}</h2></div><button onClick={() => setReview(null)}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
            <div className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
              <D label="Pattern" value={review.pattern} />
              <D label="Scope Recommendation" value={review.scope === 'global' ? 'Global (all hotels)' : `Hotel-Level · ${getEntity(review.hotelId ?? '')?.hotelName}`} />
              <D label="Suggested Action" value={review.action} />
              <D label="Matching Transactions" value={String(review.matches)} />
              <D label="Confidence" value={review.confidence} />
              <D label="Why" value={review.reason} />
            </div>
            <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => { ignoreSuggestion(review.id, review.name); setReview(null); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Ignore</button>
              <button onClick={() => { setCreate(toPrefill(review)); setReview(null); }} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Create Rule</button>
            </div>
          </div>
        </div>
      )}

      {create && <CreateRuleModal prefill={create} onClose={() => setCreate(null)} />}
    </div>
  );
}

function D({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }
const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
