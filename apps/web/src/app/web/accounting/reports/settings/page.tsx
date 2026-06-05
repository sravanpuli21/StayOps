'use client';

import { useState } from 'react';
import { card, Badge } from '../../_ui';
import { ReportTabs } from '../_shell';

export default function ReportSettingsPage() {
  const [basis, setBasis] = useState('Accrual');
  const [range, setRange] = useState('This Month');
  const [neg, setNeg] = useState('Parentheses');

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Report Settings</h1><p className="text-sm" style={{ color: '#929292' }}>Control report defaults, export formats, and report package settings.</p></div>

      <Section title="Default Report Settings">
        <Row label="Default accounting basis"><select value={basis} onChange={(e) => setBasis(e.target.value)} className={inp}><option>Accrual</option><option>Cash</option></select></Row>
        <Row label="Default date range"><select value={range} onChange={(e) => setRange(e.target.value)} className={inp}><option>This Month</option><option>Last Month</option><option>Year to Date</option></select></Row>
        <Row label="Default entity scope"><select className={inp}><option>Current selected entity</option><option>All Hotels</option></select></Row>
        <Toggle label="Show zero balance accounts" defaultOn={false} />
        <Toggle label="Show cents" defaultOn />
        <Row label="Negative number format"><select value={neg} onChange={(e) => setNeg(e.target.value)} className={inp}><option>Parentheses</option><option>Minus sign</option></select></Row>
      </Section>

      <Section title="Export Settings">
        <Row label="Default PDF orientation"><select className={inp}><option>Portrait</option><option>Landscape</option></select></Row>
        <Toggle label="Include company logo" defaultOn />
        <Toggle label="Include generated timestamp" defaultOn />
        <Toggle label="Include filters in export" defaultOn />
        <Toggle label="Include page numbers" defaultOn />
      </Section>

      <ToggleSection title="CPA Package Settings" items={[
        ['Include reconciliation reports by default', true],
        ['Include general ledger by default', true],
        ['Include bank and card statements by default', true],
        ['Include receipts by default', true],
        ['Warn if missing receipts', true],
        ['Warn if unreconciled accounts', true],
      ]} />

      <ToggleSection title="Owner Package Settings" items={[
        ['Use simplified report names', true],
        ['Hide journal entry details', true],
        ['Show hotel comparison', true],
        ['Show profit margin', true],
        ['Show cash position', true],
        ['Show close status', true],
      ]} />

      <Section title="Permissions">
        <Row label="Who can run reports"><Badge label="All accounting roles" fg="#6a4ec0" bg="#ece4fb" /></Row>
        <Row label="Who can view all-hotels reports"><Badge label="Owner, Corporate Accountant, Super Admin" fg="#6a4ec0" bg="#ece4fb" /></Row>
        <Row label="Who can create CPA package"><Badge label="Corporate Accountant, Super Admin" fg="#6a4ec0" bg="#ece4fb" /></Row>
        <Row label="Who can create owner package"><Badge label="Corporate Accountant, Owner, Super Admin" fg="#6a4ec0" bg="#ece4fb" /></Row>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>{title}</h2><div className="flex flex-col gap-3">{children}</div></div>; }
function Row({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex items-center justify-between gap-3"><span className="text-sm" style={{ color: '#3f3f3f' }}>{label}</span>{children}</div>; }
function ToggleSection({ title, items }: { title: string; items: Array<[string, boolean]> }) { return <Section title={title}>{items.map(([l, on]) => <Toggle key={l} label={l} defaultOn={on} />)}</Section>; }
function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <div className="flex items-center justify-between"><span className="text-sm" style={{ color: '#3f3f3f' }}>{label}</span><button onClick={() => setOn((o) => !o)} className="w-10 h-6 rounded-full relative transition-colors" style={{ background: on ? '#6a4ec0' : '#dddddd' }}><span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} /></button></div>;
}
const inp = 'h-9 px-2.5 rounded-lg text-sm border border-[#dddddd] bg-white text-[#222]';
