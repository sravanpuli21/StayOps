'use client';

import { useState } from 'react';
import { card, Badge } from '../../_ui';
import { RuleTabs } from '../_shared';

export default function RuleSettingsPage() {
  const [vendorMissing, setVendorMissing] = useState('suggest-only');
  const [minTx, setMinTx] = useState('3');
  const [minConf, setMinConf] = useState('Medium');

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <RuleTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Rule Settings</h1><p className="text-sm" style={{ color: '#929292' }}>Control how global and hotel-level rules are created, prioritized, and applied.</p></div>

      <Toggles title="Rule Scope Settings" note="In V1, vendors remain hotel-specific even when a global rule sets a vendor name." items={[
        ['Allow Global Rules', true],
        ['Allow Hotel-Level Rules', true],
        ['Hotel-Level Rules Override Global Rules', true],
        ['Allow Global Rules to Create Hotel-Level Vendors', false],
        ['Require hotel selection for hotel-level rules', true],
      ]} />

      <Toggles title="Rule Priority Settings" items={[
        ['Use priority numbers', true],
        ['Hotel-level rules always run first', true],
        ['Stop after first matching rule', false],
        ['Allow multiple rules to apply if actions do not conflict', true],
      ]} />

      <Toggles title="Rule Application Settings" items={[
        ['Apply rules during import preview', true],
        ['Apply rules after import', true],
        ['Allow applying rules to existing unposted transactions', true],
        ['Allow applying rules to posted transactions', false, 'disabled'],
        ['Require review before auto approval', true],
        ['Allow auto approval', false],
        ['Allow auto posting', false, 'disabled'],
      ]} />

      <Toggles title="Suggested Rule Settings" items={[
        ['Suggest rules based on repeated descriptions', true],
        ['Suggest global rules when pattern appears across multiple hotels', true],
        ['Suggest hotel-level rules when pattern appears in one hotel', true],
      ]} extra={
        <div className="flex flex-col gap-2 mt-2 pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <div className="flex items-center justify-between"><span className="text-sm" style={{ color: '#3f3f3f' }}>Minimum transactions needed for suggestion</span><input value={minTx} onChange={(e) => setMinTx(e.target.value)} className="h-8 w-16 px-2 rounded-lg text-sm text-center" style={{ border: '1px solid #dddddd', color: '#222' }} /></div>
          <div className="flex items-center justify-between"><span className="text-sm" style={{ color: '#3f3f3f' }}>Minimum confidence level</span><select value={minConf} onChange={(e) => setMinConf(e.target.value)} className="h-8 px-2 rounded-lg text-sm" style={{ border: '1px solid #dddddd', color: '#222' }}><option>Low</option><option>Medium</option><option>High</option></select></div>
        </div>
      } />

      <Section title="Vendor Handling for Global Rules">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between"><span className="text-sm" style={{ color: '#3f3f3f' }}>If global rule sets vendor name and hotel vendor exists</span><Badge label="Use hotel vendor" fg="#15803d" bg="#dcfce7" /></div>
          <div className="flex items-start justify-between gap-3 pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
            <span className="text-sm" style={{ color: '#3f3f3f' }}>If hotel vendor does not exist</span>
            <select value={vendorMissing} onChange={(e) => setVendorMissing(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm" style={{ border: '1px solid #dddddd', color: '#222' }}>
              <option value="suggest-only">Suggest vendor only</option>
              <option value="create">Create hotel-level vendor automatically</option>
              <option value="blank">Leave vendor blank</option>
            </select>
          </div>
          <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#f0eefb', color: '#6a4ec0' }}>Default is “Suggest vendor only” — vendors stay hotel-specific in V1.</p>
        </div>
      </Section>

      <Toggles title="Safety Settings" items={[
        ['Prevent rules from changing posted transactions', true],
        ['Prevent rules from changing closed months', true],
        ['Require balanced journal preview before posting', true],
        ['Log every rule application', true],
        ['Allow undo for unposted rule applications', true],
      ]} />
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: '#6a6a6a' }}>{title}</h2>{note && <p className="text-[11px] mb-3" style={{ color: '#b0b0b0' }}>{note}</p>}{!note && <div className="mb-3" />}{children}</div>;
}

function Toggles({ title, note, items, extra }: { title: string; note?: string; items: Array<[string, boolean] | [string, boolean, string]>; extra?: React.ReactNode }) {
  return (
    <Section title={title} note={note}>
      <div className="flex flex-col gap-2.5">
        {items.map(([label, on, lock], i) => <ToggleRow key={i} label={label as string} defaultOn={on as boolean} lock={lock as string | undefined} />)}
      </div>
      {extra}
    </Section>
  );
}

function ToggleRow({ label, defaultOn, lock }: { label: string; defaultOn: boolean; lock?: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: lock ? '#929292' : '#3f3f3f' }}>{label}</span>
      {lock === 'disabled' ? <Badge label="Off — V1" fg="#6a6a6a" bg="#f0f0f0" /> : (
        <button onClick={() => setOn((o) => !o)} className="w-10 h-6 rounded-full relative transition-colors" style={{ background: on ? '#6a4ec0' : '#dddddd' }}>
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} />
        </button>
      )}
    </div>
  );
}
