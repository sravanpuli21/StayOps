'use client';

import { Shield, Check, X } from 'lucide-react';
import { PageHeader, card, Badge, PURPLE } from '../_ui';

const ROLES = [
  { role: 'Corporate Accountant', who: 'Sanjay Narsee', upload: true, code: true, post: true, reconcile: true, finish: true, reopen: true },
  { role: 'Bookkeeper', who: 'Staff', upload: true, code: true, post: false, reconcile: false, finish: false, reopen: false },
  { role: 'Hotel GM', who: 'Per hotel', upload: true, code: false, post: false, reconcile: false, finish: false, reopen: false },
  { role: 'Owner', who: 'Per entity', upload: false, code: false, post: false, reconcile: false, finish: false, reopen: false },
  { role: 'CPA', who: 'Patel & Co.', upload: false, code: false, post: false, reconcile: false, finish: false, reopen: false },
  { role: 'Super Admin', who: 'Sravan', upload: true, code: true, post: true, reconcile: true, finish: true, reopen: true },
];
const CAPS = ['upload', 'code', 'post', 'reconcile', 'finish', 'reopen'] as const;
const CAP_LABEL: Record<typeof CAPS[number], string> = { upload: 'Upload', code: 'Code', post: 'Post', reconcile: 'Reconcile', finish: 'Finish', reopen: 'Reopen' };

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader scope="Admin" title="Permissions" subtitle="Who can upload, code, post, clear, reconcile, finish, and reopen." />
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>Role</th>
            {CAPS.map((c) => <th key={c} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-center" style={{ color: '#6a6a6a' }}>{CAP_LABEL[c]}</th>)}
          </tr></thead>
          <tbody>
            {ROLES.map((r, i) => (
              <tr key={r.role} style={{ borderBottom: i < ROLES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2.5 px-3"><p className="text-sm font-medium" style={{ color: '#222' }}>{r.role}</p><p className="text-[11px]" style={{ color: '#929292' }}>{r.who}</p></td>
                {CAPS.map((c) => (
                  <td key={c} className="py-2.5 px-3 text-center">
                    {r[c] ? <Check className="w-4 h-4 mx-auto" style={{ color: '#15803d' }} /> : <X className="w-4 h-4 mx-auto" style={{ color: '#dddddd' }} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
