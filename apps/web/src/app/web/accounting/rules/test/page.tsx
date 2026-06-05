'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FlaskConical, Play, Download } from 'lucide-react';
import { getEntity, HOTEL_ENTITIES, ACCT_TRANSACTIONS, txMatchesRule } from '@hos/shared/accounting-os';
import { useAcctState, logRuleTested, logRuleApplied } from '../../_store';
import { allRules } from '../../_rules';
import { card, Badge, money } from '../../_ui';
import { RuleTabs } from '../_shared';

function Inner() {
  const params = useSearchParams();
  const store = useAcctState();
  const rules = allRules(store);
  const [ruleId, setRuleId] = useState(params.get('rule') ?? rules[0]?.id ?? '');
  const [hotelF, setHotelF] = useState('all');
  const [sourceF, setSourceF] = useState('all');
  const [includeUnposted, setIncludeUnposted] = useState(true);
  const [includePosted, setIncludePosted] = useState(false);
  const [ran, setRan] = useState(false);

  const rule = rules.find((r) => r.id === ruleId);

  const results = useMemo(() => {
    if (!ran || !rule) return [];
    return ACCT_TRANSACTIONS.filter((t) => {
      if (hotelF !== 'all' && t.hotelId !== hotelF) return false;
      if (sourceF !== 'all' && (sourceF === 'bank' ? t.source !== 'bank' : t.source !== 'credit-card')) return false;
      if (!includePosted && t.status === 'posted') return false;
      if (!includeUnposted && t.status !== 'posted') return false;
      if (rule.scope === 'hotel_level') return rule.hotelId === t.hotelId && txMatchesRule({ ...rule, scope: 'global', hotelId: undefined }, t);
      return txMatchesRule(rule, t);
    });
  }, [ran, rule, hotelF, sourceF, includePosted, includeUnposted]);

  const checked = ACCT_TRANSACTIONS.filter((t) => hotelF === 'all' || t.hotelId === hotelF).length;
  const wouldUpdate = results.filter((t) => t.category !== rule?.actions.setCategoryName).length;
  const blocked = results.filter((t) => t.status === 'posted').length;

  const run = () => { if (rule) { logRuleTested({ id: rule.id, name: rule.name, scope: rule.scope, hotelId: rule.hotelId }, results.length); } setRan(true); };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <RuleTabs />
      <div className="flex items-center gap-2"><FlaskConical className="w-5 h-5" style={{ color: '#6a4ec0' }} /><div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Rule Tester</h1><p className="text-sm" style={{ color: '#929292' }}>Test rules against existing transactions before applying them.</p></div></div>

      <div className="rounded-2xl p-5 flex flex-col gap-4" style={card}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Select Rule"><select value={ruleId} onChange={(e) => { setRuleId(e.target.value); setRan(false); }} className={inp}>{rules.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <Field label="Hotel Entity (optional)"><select value={hotelF} onChange={(e) => { setHotelF(e.target.value); setRan(false); }} className={inp}><option value="all">All Hotels</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select></Field>
          <Field label="Source"><select value={sourceF} onChange={(e) => { setSourceF(e.target.value); setRan(false); }} className={inp}><option value="all">Both</option><option value="bank">Bank</option><option value="credit_card">Credit Card</option></select></Field>
        </div>
        <div className="flex gap-5 flex-wrap">
          <label className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="checkbox" checked={includeUnposted} onChange={(e) => setIncludeUnposted(e.target.checked)} /> Include unposted transactions</label>
          <label className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}><input type="checkbox" checked={includePosted} onChange={(e) => setIncludePosted(e.target.checked)} /> Include posted transactions (view only)</label>
        </div>
        <button onClick={run} className="self-start inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Play className="w-3.5 h-3.5" /> Run Test</button>
      </div>

      {ran && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Checked" value={checked} />
            <Stat label="Matched" value={results.length} accent="#6a4ec0" />
            <Stat label="Would Update" value={wouldUpdate} accent="#15803d" />
            <Stat label="Conflicts" value={0} />
            <Stat label="Blocked (posted)" value={blocked} accent={blocked ? '#b45309' : '#222'} />
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
              <p className="text-base font-semibold" style={{ color: '#222' }}>No matching transactions found.</p>
              <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing the rule conditions or test against a wider date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl" style={card}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Hotel', 'Source', 'Description', 'Amount', 'Current Category', 'New Category', 'Result', 'Reason'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {results.slice(0, 50).map((t) => {
                    const newCat = rule?.actions.setCategoryName;
                    const isPosted = t.status === 'posted';
                    const result = isPosted ? 'Blocked' : t.category === newCat ? 'Already Matches' : 'Would Update';
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.dateIso.slice(5)}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
                        <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                        <td className="py-2.5 px-3 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{t.category ?? '—'}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{newCat ?? '—'}</td>
                        <td className="py-2.5 px-3"><Badge label={result} fg={result === 'Would Update' ? '#15803d' : result === 'Blocked' ? '#b45309' : '#1d4ed8'} bg={result === 'Would Update' ? '#dcfce7' : result === 'Blocked' ? '#fef3c7' : '#dbeafe'} /></td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{isPosted ? 'Transaction is posted' : 'Matches conditions'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex justify-end gap-2">
              <button className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export Test Results</button>
              <button onClick={() => { if (rule) logRuleApplied({ id: rule.id, name: rule.name, scope: rule.scope, hotelId: rule.hotelId }, wouldUpdate); }} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Apply to Matching Unposted</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: number; accent?: string }) { return <div className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222]';

export default function RuleTesterPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
