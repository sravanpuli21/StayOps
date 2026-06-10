'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, card, PURPLE } from '../../_ui';

const SECTIONS: { title: string; fields: { k: string; v: string }[] }[] = [
  { title: 'Statement Source', fields: [
    { k: 'Allow CSV Import Mode', v: 'On' }, { k: 'Allow Manual Statement Mode', v: 'On' },
    { k: 'Allow PDF statement attachment', v: 'On' }, { k: 'Allow manual missing transaction creation', v: 'On' },
  ] },
  { title: 'Statement Dates', fields: [
    { k: 'Use account-specific statement dates', v: 'On' }, { k: 'Require statement ending date', v: 'On' },
    { k: 'Require statement ending balance', v: 'On' }, { k: 'Prevent overlapping statement periods', v: 'On' }, { k: 'Warn on date gaps', v: 'On' },
  ] },
  { title: 'Posting', fields: [
    { k: 'Require category before posting', v: 'On' }, { k: 'Require department before posting', v: 'On' },
    { k: 'Require balanced journal entry', v: 'On' }, { k: 'Require posting before finish', v: 'On' },
    { k: 'Prevent posting to inactive accounts', v: 'On' }, { k: 'Prevent posting to closed months', v: 'On' },
  ] },
  { title: 'Receipts', fields: [
    { k: 'Require receipts above threshold', v: 'On' }, { k: 'Default threshold', v: '$250' },
    { k: 'Allow mark receipt not required', v: 'On' }, { k: 'Block finish if required receipt missing', v: 'On' },
  ] },
  { title: 'Timing Differences', fields: [
    { k: 'Enable T+ timing window', v: 'On' }, { k: 'Default timing window', v: '2 days' },
    { k: 'Allow timing difference carry forward', v: 'On' }, { k: 'Show outside-period items', v: 'On' },
  ] },
  { title: 'Difference', fields: [
    { k: 'Difference must be zero to finish', v: 'On' }, { k: 'Allow adjustment entries', v: 'Permission based' },
    { k: 'Require approval for adjustments', v: 'On' }, { k: 'Show Find Difference suggestions', v: 'On' },
  ] },
  { title: 'Reopen', fields: [
    { k: 'Allow reopen', v: 'On' }, { k: 'Require reason', v: 'On' },
    { k: 'Roles allowed to reopen', v: 'Corporate Accountant, Super Admin' }, { k: 'Block reopen if month is closed', v: 'On' },
  ] },
];

export default function WorkbenchSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/reconciliation-workbench" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation Workbench</Link>
      <PageHeader scope="Settings" title="Workbench Settings" subtitle="Control how reconciliation behaves across StayOps." />
      {SECTIONS.map((s) => (
        <div key={s.title} className="rounded-2xl overflow-hidden" style={card}>
          <div className="px-4 py-2.5" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{s.title}</p></div>
          {s.fields.map((f, i) => (
            <div key={f.k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < s.fields.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
              <span className="text-sm" style={{ color: '#6a6a6a' }}>{f.k}</span>
              <span className="text-sm font-medium" style={{ color: f.v === 'On' ? '#15803d' : '#222' }}>{f.v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
