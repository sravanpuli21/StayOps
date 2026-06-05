'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { card, Badge } from '../../_ui';
import { CoaTabs } from '../_shared';

export default function CoaSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <CoaTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Chart of Accounts Settings</h1><p className="text-sm" style={{ color: '#929292' }}>Control account templates, account code rules, mappings, and account editing permissions.</p></div>

      {/* A. Account Scope */}
      <Section title="Account Scope">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold" style={{ color: '#222' }}>Chart of Accounts Scope</p><p className="text-xs" style={{ color: '#929292' }}>Each hotel has its own Chart of Accounts. A shared template can be applied to create consistency.</p></div>
          <Badge label="Hotel Entity Level" fg="#1d4ed8" bg="#dbeafe" />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          <div><p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#929292' }}><Lock className="w-3.5 h-3.5" /> Global Shared COA</p><p className="text-xs" style={{ color: '#b0b0b0' }}>One combined Chart of Accounts across all hotels.</p></div>
          <Badge label="Coming Soon" fg="#6a6a6a" bg="#f0f0f0" />
        </div>
      </Section>

      <Toggles title="Account Code Settings" items={[
        ['Require account codes', true],
        ['Account code must be unique within hotel', true],
        ['Allow duplicate account code across different hotels', true],
        ['Auto suggest next account code', true],
        ['Allow custom account code ranges', false],
      ]} />

      <Toggles title="Template Settings" items={[
        ['Default template: Hotel Standard COA', true, true],
        ['Apply template during hotel creation', true],
        ['Allow hotel custom accounts', true],
        ['Allow editing template accounts at hotel level', true],
        ['Lock required system accounts', true],
      ]} />

      <Toggles title="Posting Protection" items={[
        ['Prevent posting to unmapped accounts', true],
        ['Prevent posting to inactive accounts', true],
        ['Prevent deleting accounts with transactions', true],
        ['Prevent changing type after transactions exist', true],
        ['Require balanced journal entries', true],
      ]} />

      <Toggles title="Opening Balance Settings" items={[
        ['Require opening balance review', true],
        ['Allow opening balances to be skipped', false],
        ['Require balanced opening entry', true],
        ['Lock opening balance after posting', true],
      ]} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>{title}</h2>{children}</div>;
}

function Toggles({ title, items }: { title: string; items: Array<[string, boolean] | [string, boolean, boolean]> }) {
  return (
    <Section title={title}>
      <div className="flex flex-col gap-2.5">
        {items.map(([label, on, locked], i) => <ToggleRow key={i} label={label as string} defaultOn={on as boolean} locked={locked as boolean} />)}
      </div>
    </Section>
  );
}

function ToggleRow({ label, defaultOn, locked }: { label: string; defaultOn: boolean; locked?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: '#3f3f3f' }}>{label}</span>
      {locked ? <Badge label="Default" fg="#6a4ec0" bg="#ece4fb" /> : (
        <button onClick={() => setOn((o) => !o)} className="w-10 h-6 rounded-full relative transition-colors" style={{ background: on ? '#6a4ec0' : '#dddddd' }}>
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} />
        </button>
      )}
    </div>
  );
}
