'use client';

import { useState, useMemo } from 'react';
import { Building2, Plus } from 'lucide-react';
import { HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { hotelRules, conditionSummary, actionSummary } from '../../_rules';
import { card } from '../../_ui';
import { RuleTabs } from '../_shared';
import { RulesTable } from '../_RulesTable';
import { CreateRuleModal } from '../_CreateRule';

export default function HotelLevelRulesPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const [hotelF, setHotelF] = useState(selection.kind === 'hotel' ? selection.hotelId : 'all');
  const [statusF, setStatusF] = useState('all');
  const [create, setCreate] = useState(false);

  const all = hotelRules(store, hotelF === 'all' ? undefined : hotelF);
  const rows = useMemo(() => all.filter((r) => statusF === 'all' || r.status === statusF), [all, statusF]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2"><Building2 className="w-5 h-5" style={{ color: '#1d4ed8' }} /><div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Hotel-Level Rules</h1><p className="text-sm" style={{ color: '#929292' }}>Rules that apply only to specific hotel entities.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Hotel-level rules override global rules for their selected hotel.</p></div></div>
        <button onClick={() => setCreate(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Hotel-Level Rule</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select value={hotelF} onChange={(e) => setHotelF(e.target.value)} className={fil}><option value="all">All Hotels</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={fil}><option value="all">All Status</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="draft">Draft</option></select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No hotel-level rules for this hotel yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Create hotel-level rules for transactions that need property-specific handling.</p>
          <button onClick={() => setCreate(true)} className="mt-3 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Create Hotel-Level Rule</button>
        </div>
      ) : <RulesTable rules={rows} showScope={false} showHotel showOverrides />}

      {create && <CreateRuleModal prefill={{ scope: 'hotel_level', hotelId: hotelF === 'all' ? undefined : hotelF }} onClose={() => setCreate(false)} />}
    </div>
  );
}
const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
