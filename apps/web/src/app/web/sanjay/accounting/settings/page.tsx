'use client';

import { useState } from 'react';
import { HOTELS, ENTITIES, ALL_BANK_ACCOUNTS, getEntityByHotel, formatCurrency } from '@hos/shared';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';

type Tab = 'hotels' | 'entities' | 'bank-accounts' | 'credit-cards';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('hotels');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Hotels · entities · bank accounts · credit cards</p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="flex border-b" style={{ borderColor: '#dddddd' }}>
        {([
          { v: 'hotels', label: `Hotels · ${HOTELS.length}` },
          { v: 'entities', label: `Entities · ${ENTITIES.length}` },
          { v: 'bank-accounts', label: `Bank Accounts · ${ALL_BANK_ACCOUNTS.filter((b) => b.kind !== 'cc').length}` },
          { v: 'credit-cards', label: `Credit Cards · ${ALL_BANK_ACCOUNTS.filter((b) => b.kind === 'cc').length}` },
        ] as Array<{ v: Tab; label: string }>).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: tab === t.v ? '#222222' : '#6a6a6a', borderBottom: tab === t.v ? '2px solid #ff385c' : '2px solid transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hotels' && (
        <Table headers={['Hotel', 'Brand', 'City / State', 'Rooms', 'Entity', 'EIN']}>
          {HOTELS.map((h) => {
            const ent = getEntityByHotel(h.id);
            return (
              <tr key={h.id} style={rowStyle}>
                <td className="py-3 px-4 font-medium" style={{ color: '#222222' }}>{h.shortName}<p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{h.code}</p></td>
                <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h.brand}</td>
                <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h.city}, {h.state}</td>
                <td className="py-3 px-4 text-xs text-right" style={{ color: '#3f3f3f' }}>{h.rooms}</td>
                <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{ent?.name ?? '—'}</td>
                <td className="py-3 px-4 text-xs font-mono" style={{ color: '#6a6a6a' }}>{ent?.ein ?? '—'}</td>
              </tr>
            );
          })}
        </Table>
      )}

      {tab === 'entities' && (
        <Table headers={['Entity', 'EIN', 'State', 'Hotels', 'CPA', 'Status']}>
          {ENTITIES.map((e) => (
            <tr key={e.id} style={rowStyle}>
              <td className="py-3 px-4">
                <p className="font-medium" style={{ color: '#222222' }}>{e.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{e.registeredAddress}</p>
              </td>
              <td className="py-3 px-4 text-xs font-mono" style={{ color: '#222222' }}>{e.ein}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{e.state}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{e.hotelIds.length}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{e.cpaContact ?? '—'}<p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{e.cpaEmail}</p></td>
              <td className="py-3 px-4">
                <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#dcfce7', color: '#15803d' }}>
                  {e.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {tab === 'bank-accounts' && (
        <Table headers={['Hotel', 'Account', 'Bank', 'Last 4', 'Statement Bal', 'Book Bal', 'Last Reconciled']}>
          {ALL_BANK_ACCOUNTS.filter((b) => b.kind !== 'cc' && b.hotelId !== 'CONSOLIDATED').map((b) => (
            <tr key={b.id} style={rowStyle}>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{HOTELS.find((h) => h.id === b.hotelId)?.shortName ?? b.hotelId}</td>
              <td className="py-3 px-4 font-medium text-sm" style={{ color: '#222222' }}>{b.kind.toUpperCase()}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{b.name.split('·')[0].trim()}</td>
              <td className="py-3 px-4 text-xs font-mono" style={{ color: '#222222' }}>····{b.last4}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(b.statementBalance)}</td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(b.bookBalance)}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{b.lastReconciledIso ?? '—'}</td>
            </tr>
          ))}
        </Table>
      )}

      {tab === 'credit-cards' && (
        <Table headers={['Hotel', 'Card', 'Last 4', 'Statement Bal', 'Book Bal', 'Last Reconciled']}>
          {ALL_BANK_ACCOUNTS.filter((b) => b.kind === 'cc').map((b) => (
            <tr key={b.id} style={rowStyle}>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{HOTELS.find((h) => h.id === b.hotelId)?.shortName ?? b.hotelId}</td>
              <td className="py-3 px-4 font-medium text-sm" style={{ color: '#222222' }}>Amex Business</td>
              <td className="py-3 px-4 text-xs font-mono" style={{ color: '#222222' }}>····{b.last4}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(b.statementBalance)}</td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(b.bookBalance)}</td>
              <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{b.lastReconciledIso ?? '—'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

const rowStyle = { borderBottom: '1px solid #f0f0f0' };

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            {headers.map((h) => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
