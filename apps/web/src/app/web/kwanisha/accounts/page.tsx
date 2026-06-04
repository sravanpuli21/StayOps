'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  CRM_ACCOUNTS, ACCOUNT_TYPE_LABEL, CADENCE_LABEL,
  type AccountStatus,
} from '@hos/shared';
import { fmtMoney, Badge, STATUS_STYLE, CADENCE_FG, card } from '../_ui';

const STATUS_FILTERS: Array<{ key: AccountStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'lapsed', label: 'Lapsed' },
  { key: 'prospect', label: 'Prospects' },
];

export default function AccountsPage() {
  const [status, setStatus] = useState<AccountStatus | 'all'>('all');
  const [q, setQ] = useState('');

  const items = CRM_ACCOUNTS
    .filter((a) => status === 'all' || a.status === status)
    .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.contactName.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.ytdRevenue - a.ytdRevenue);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Accounts</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{CRM_ACCOUNTS.length} group &amp; corporate accounts</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[200px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts or contacts"
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const on = f.key === status;
            return (
              <button key={f.key} onClick={() => setStatus(f.key)}
                className="h-9 px-3.5 rounded-full text-xs font-semibold"
                style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={card}>
        {items.map((a, i) => {
          const st = STATUS_STYLE[a.status];
          return (
            <Link key={a.id} href={`/web/kwanisha/accounts/${a.id}`} className="flex items-center gap-4 px-4 py-3.5"
              style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate" style={{ color: '#222' }}>{a.name}</p>
                  <Badge label={st.label} fg={st.fg} bg={st.bg} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                  {ACCOUNT_TYPE_LABEL[a.type]} · {a.contactName} · {a.contactTitle}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{fmtMoney(a.ytdRevenue)}</p>
                <p className="text-[11px] font-semibold" style={{ color: CADENCE_FG[a.cadence] }}>{CADENCE_LABEL[a.cadence]}</p>
              </div>
            </Link>
          );
        })}
        {items.length === 0 && <p className="px-4 py-8 text-center text-sm" style={{ color: '#929292' }}>No accounts match.</p>}
      </div>
    </div>
  );
}
