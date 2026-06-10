'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { card, PageHeader, PURPLE } from '../../_ui';

const SECTIONS: { title: string; fields: { k: string; v: string }[] }[] = [
  { title: 'Rule Scope', fields: [
    { k: 'Allow Global Rules', v: 'On' }, { k: 'Allow Hotel-Level Rules', v: 'On' },
    { k: 'Hotel-Level Rules Override Global', v: 'On' }, { k: 'Allow Global Rules to Suggest Hotel Vendors', v: 'On' },
    { k: 'Allow Global Rules to Create Hotel Vendors', v: 'Off' },
  ] },
  { title: 'Rule Application', fields: [
    { k: 'Apply rules during statement import', v: 'On' }, { k: 'Apply rules inside workbench', v: 'On' },
    { k: 'Apply rules to manual missing transactions', v: 'On' }, { k: 'Apply rules to existing unposted lines', v: 'On (with test)' },
    { k: 'Apply rules to posted lines', v: 'Off' },
  ] },
  { title: 'Auto-Code', fields: [
    { k: 'Allow auto-code for low-risk rules', v: 'On' }, { k: 'Allow auto-code for medium-risk rules', v: 'Optional' },
    { k: 'Require review for high-risk rules', v: 'On' }, { k: 'Require review for critical rules', v: 'On' }, { k: 'Allow auto-post', v: 'Off (V1)' },
  ] },
  { title: 'Review Thresholds', fields: [
    { k: 'Large amount threshold', v: '$1,000' }, { k: 'Receipt threshold', v: '$250' },
    { k: 'Payroll small amount threshold', v: '$100' }, { k: 'Rule confidence threshold', v: 'Medium' }, { k: 'Correction rate warning', v: '20%' },
  ] },
  { title: 'Safety', fields: [
    { k: 'Prevent posting to inactive accounts', v: 'On' }, { k: 'Prevent using accounts from another hotel', v: 'On' },
    { k: 'Prevent changing closed periods', v: 'On' }, { k: 'Prevent suspense without review', v: 'On' },
    { k: 'Prevent reconciliation discrepancy without approval', v: 'On' }, { k: 'Log every rule application', v: 'On' },
  ] },
  { title: 'Suggested Rules', fields: [
    { k: 'Suggest from repeated descriptions', v: 'On' }, { k: 'Suggest global rules across hotels', v: 'On' },
    { k: 'Suggest hotel-level rules', v: 'On' }, { k: 'Minimum matching lines', v: '3' }, { k: 'Minimum confidence', v: 'Medium' },
  ] },
];

export default function RuleSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="Settings" title="Rule Settings" subtitle="Control how global and hotel-level rules behave." />
      {SECTIONS.map((s) => (
        <div key={s.title} className="rounded-2xl overflow-hidden" style={card}>
          <div className="px-4 py-2.5" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{s.title}</p></div>
          {s.fields.map((f, i) => (
            <div key={f.k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < s.fields.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
              <span className="text-sm" style={{ color: '#6a6a6a' }}>{f.k}</span>
              <span className="text-sm font-medium" style={{ color: f.v === 'On' ? '#15803d' : f.v.startsWith('Off') ? '#b91c1c' : '#222' }}>{f.v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
