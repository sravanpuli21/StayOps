'use client';

import { useState } from 'react';
import { Globe, Plus } from 'lucide-react';
import { useAcctState } from '../../_store';
import { globalRules, monthMatchCount, suggestions, conflicts } from '../../_rules';
import { card } from '../../_ui';
import { RuleTabs, SummaryCard } from '../_shared';
import { RulesTable } from '../_RulesTable';
import { CreateRuleModal } from '../_CreateRule';

export default function GlobalRulesPage() {
  const store = useAcctState();
  const [create, setCreate] = useState(false);
  const rules = globalRules(store);
  const active = rules.filter((r) => r.status === 'active');
  const matched = active.reduce((n, r) => n + monthMatchCount(r), 0);
  const sug = suggestions(store).filter((s) => s.scope === 'global');
  const cf = conflicts(store);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2"><Globe className="w-5 h-5" style={{ color: '#6a4ec0' }} /><div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Global Rules</h1><p className="text-sm" style={{ color: '#929292' }}>Rules that apply across all HOS hotel entities.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Global rules apply to all hotels unless a hotel-level rule overrides them.</p></div></div>
        <button onClick={() => setCreate(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Global Rule</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Active Global Rules" value={active.length} accent="#15803d" />
        <SummaryCard label="Matched / mo" value={matched} />
        <SummaryCard label="Overridden by Hotel" value={cf.length} accent="#b45309" />
        <SummaryCard label="Conflicts" value={cf.length} accent={cf.length ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Suggested Global" value={sug.length} accent="#b45309" />
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No global rules yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Global rules help standardize repeated transactions across all hotels.</p>
          <button onClick={() => setCreate(true)} className="mt-3 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Create Global Rule</button>
        </div>
      ) : <RulesTable rules={rules} showScope={false} showOverrides />}

      {create && <CreateRuleModal prefill={{ scope: 'global' }} onClose={() => setCreate(false)} />}
    </div>
  );
}
