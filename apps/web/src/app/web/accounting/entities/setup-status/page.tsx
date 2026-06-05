'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertTriangle, Minus } from 'lucide-react';
import { useAcctState } from '../../_store';
import { allEntities } from '../../_entities';
import { setupForHotel } from '../../_setup';
import { card, Badge } from '../../_ui';

export default function SetupStatusPage() {
  const router = useRouter();
  const store = useAcctState();
  const entities = allEntities(store);

  const COLS: Array<{ key: 'basic' | 'coa' | 'bank' | 'cards' | 'opening' | 'users' | 'firstUpload'; label: string }> = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'coa', label: 'Chart of Accounts' },
    { key: 'bank', label: 'Bank Accounts' },
    { key: 'cards', label: 'Credit Cards' },
    { key: 'opening', label: 'Opening Balances' },
    { key: 'users', label: 'Users' },
    { key: 'firstUpload', label: 'First Upload' },
  ];

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/entities" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</Link>
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Hotel Entity Setup Status</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>See which hotels are ready for accounting and which hotels need setup work.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>Hotel</th>
              {COLS.map((c) => <th key={c.key} className="text-center text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{c.label}</th>)}
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>Overall</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((h) => {
              const s = setupForHotel(h.id, store);
              return (
                <tr key={h.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
                  {COLS.map((c) => <td key={c.key} className="py-2.5 px-3 text-center">{s.steps[c.key] ? <Check className="w-4 h-4 inline" style={{ color: '#15803d' }} /> : <AlertTriangle className="w-4 h-4 inline" style={{ color: '#b45309' }} />}</td>)}
                  <td className="py-2.5 px-3"><Badge label={s.label} fg={s.label === 'Complete' ? '#15803d' : '#b45309'} bg={s.label === 'Complete' ? '#dcfce7' : '#fef3c7'} /></td>
                  <td className="py-2.5 px-3">
                    {s.label === 'Complete'
                      ? <span className="text-xs" style={{ color: '#929292' }}>—</span>
                      : <button onClick={() => router.push(`/web/accounting/entities/${h.id}?tab=Accounting+Setup`)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Complete Setup</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
