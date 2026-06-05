'use client';

import { useState } from 'react';
import { card, Badge } from '../../_ui';
import { ReconTabs } from '../_shared';

export default function ReconSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <ReconTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation Settings</h1><p className="text-sm" style={{ color: '#929292' }}>Control reconciliation requirements, permissions, and month close rules.</p></div>

      <Toggles title="Reconciliation Requirements" items={[
        ['Require bank reconciliation before month close', true],
        ['Require credit card reconciliation before month close', true],
        ['Require statement file before reconciliation', true],
        ['Require transactions to be posted before finish', true],
        ['Require difference to be $0.00 before finish', true],
        ['Require account mapping before reconciliation', true],
      ]} />

      <Toggles title="Transaction Clearing Rules" items={[
        ['Allow clearing unposted transactions', false],
        ['Allow clearing transactions with missing receipts', true],
        ['Allow clearing possible duplicates', false],
        ['Allow clearing transactions outside statement period', false, 'Warning only'],
        ['Allow clearing already reconciled transactions', false],
      ]} />

      <Section title="Reopen Rules">
        <Toggle label="Allow reconciliation reopen" defaultOn />
        <Row k="Roles allowed to reopen" v="Corporate Accountant, Super Admin" />
        <Toggle label="Require reason for reopen" defaultOn />
        <Toggle label="Block reopen if month is closed" defaultOn />
        <Toggle label="Block reopen if later reconciliation exists" defaultOn />
      </Section>

      <Section title="Adjustment Rules">
        <Toggle label="Allow reconciliation adjustments" defaultOn />
        <Row k="Roles allowed to create adjustment" v="Corporate Accountant, Super Admin" />
        <Toggle label="Require adjustment reason" defaultOn />
        <Toggle label="Require adjustment approval" defaultOn />
      </Section>

      <Toggles title="Report Settings" items={[
        ['Generate report after finish', true],
        ['Save PDF copy in Documents', true],
        ['Allow CPA access to reports', true],
        ['Include uncleared transactions', true],
        ['Include activity log summary', true],
      ]} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>{title}</h2><div className="flex flex-col gap-2.5">{children}</div></div>;
}
function Toggles({ title, items }: { title: string; items: Array<[string, boolean] | [string, boolean, string]> }) {
  return <Section title={title}>{items.map(([label, on, note], i) => <Toggle key={i} label={label as string} defaultOn={on as boolean} note={note as string | undefined} />)}</Section>;
}
function Toggle({ label, defaultOn, note }: { label: string; defaultOn: boolean; note?: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: '#3f3f3f' }}>{label}{note && <span className="ml-2 text-[11px]" style={{ color: '#929292' }}>({note})</span>}</span>
      <button onClick={() => setOn((o) => !o)} className="w-10 h-6 rounded-full relative transition-colors" style={{ background: on ? '#6a4ec0' : '#dddddd' }}><span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} /></button>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex items-center justify-between"><span className="text-sm" style={{ color: '#3f3f3f' }}>{k}</span><Badge label={v} fg="#6a4ec0" bg="#ece4fb" /></div>; }
