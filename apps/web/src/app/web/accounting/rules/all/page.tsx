'use client';

import { useState, useMemo } from 'react';
import { Plus, Download, Search, Ban } from 'lucide-react';
import { HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { allRules, rulesAffectingHotel, conditionSummary, actionSummary } from '../../_rules';
import { card } from '../../_ui';
import { RuleTabs } from '../_shared';
import { RulesTable } from '../_RulesTable';
import { CreateRuleModal } from '../_CreateRule';

export default function AllRulesPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const [q, setQ] = useState('');
  const [scopeF, setScopeF] = useState('all');
  const [sourceF, setSourceF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [create, setCreate] = useState(false);

  const base = selection.kind === 'hotel' ? rulesAffectingHotel(store, selection.hotelId) : allRules(store);
  const rows = useMemo(() => base.filter((r) => {
    const s = q.toLowerCase();
    const matchesQ = !s || [r.name, conditionSummary(r), actionSummary(r), r.hotelId ?? ''].some((v) => v.toLowerCase().includes(s));
    const matchesScope = scopeF === 'all' || (scopeF === 'global' ? r.scope === 'global' : r.scope === 'hotel_level');
    const matchesSource = sourceF === 'all' || r.source === sourceF;
    const matchesStatus = statusF === 'all' || r.status === statusF;
    return matchesQ && matchesScope && matchesSource && matchesStatus;
  }), [base, q, scopeF, sourceF, statusF]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>All Rules</h1><p className="text-sm" style={{ color: '#929292' }}>View, manage, and monitor global and hotel-level transaction rules.</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export Rules</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Ban className="w-3.5 h-3.5" /> Bulk Disable</button>
          <button onClick={() => setCreate(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Rule</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[260px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rule name, description, vendor, category, department, hotel, condition..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
        <select value={scopeF} onChange={(e) => setScopeF(e.target.value)} className={fil}><option value="all">All Scopes</option><option value="global">Global</option><option value="hotel">Hotel-Level</option></select>
        <select value={sourceF} onChange={(e) => setSourceF(e.target.value)} className={fil}><option value="all">All Sources</option><option value="bank">Bank</option><option value="credit_card">Credit Card</option><option value="both">Both</option></select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={fil}><option value="all">All Status</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="draft">Draft</option><option value="needs_review">Needs Review</option><option value="conflict">Conflict</option></select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No rules match.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing filters, or create a global or hotel-level rule.</p>
          <button onClick={() => { setQ(''); setScopeF('all'); setSourceF('all'); setStatusF('all'); }} className="mt-3 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Clear Filters</button>
        </div>
      ) : <RulesTable rules={rows} showScope showHotel />}

      {create && <CreateRuleModal prefill={selection.kind === 'hotel' ? { scope: 'hotel_level', hotelId: selection.hotelId } : {}} onClose={() => setCreate(false)} />}
    </div>
  );
}
const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
