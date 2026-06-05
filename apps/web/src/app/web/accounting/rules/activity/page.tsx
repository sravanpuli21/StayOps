'use client';

import { useState, useMemo } from 'react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctState } from '../../_store';
import { card, Badge, fmtDate } from '../../_ui';
import { RuleTabs } from '../_shared';

const ACTIONS = ['Rule Created', 'Rule Edited', 'Rule Disabled', 'Rule Enabled', 'Rule Tested', 'Rule Applied to Existing', 'Rule Priority Changed', 'Rule Conflict Resolved', 'Suggested Rule Ignored'];

export default function RulesActivityPage() {
  const store = useAcctState();
  const [scopeF, setScopeF] = useState('all');
  const [actionF, setActionF] = useState('all');

  const rows = useMemo(() => store.ruleActivity.filter((a) =>
    (scopeF === 'all' || a.scope === scopeF) && (actionF === 'all' || a.action === actionF)
  ), [store.ruleActivity, scopeF, actionF]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Rules Activity Log</h1><p className="text-sm" style={{ color: '#929292' }}>Track rule creation, edits, applications, conflicts, and priority changes.</p></div>

      <div className="flex gap-2 flex-wrap">
        <select value={scopeF} onChange={(e) => setScopeF(e.target.value)} className={fil}><option value="all">All Scopes</option><option value="global">Global</option><option value="hotel_level">Hotel-Level</option></select>
        <select value={actionF} onChange={(e) => setActionF(e.target.value)} className={fil}><option value="all">All Actions</option>{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No rule activity yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Creating, editing, testing, and applying rules will be tracked here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date / Time', 'User', 'Rule', 'Scope', 'Hotel', 'Action', 'Before', 'After', 'Details'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 100).map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(a.ts.slice(0, 10))}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{a.actor}</td>
                  <td className="py-2.5 px-3 text-xs font-medium" style={{ color: '#222' }}>{a.ruleName}</td>
                  <td className="py-2.5 px-3">{a.scope === 'global' ? <Badge label="Global" fg="#6a4ec0" bg="#ece4fb" /> : <Badge label="Hotel" fg="#1d4ed8" bg="#dbeafe" />}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.hotelId ? (getEntity(a.hotelId)?.propertyCode ?? a.hotelId) : '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={a.action} fg="#6a4ec0" bg="#ece4fb" /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{a.before ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{a.after ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{a.detail ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
