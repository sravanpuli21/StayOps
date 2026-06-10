'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity, bankAccountsForHotel, creditCardsForHotel, ACCT_VENDORS } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { hotelLabel } from '../../_domain';
import { card, Badge, PageHeader, PURPLE } from '../../_ui';

const TABS = ['Bank Accounts', 'Credit Cards', 'Resolution Types', 'Vendors', 'Report Mapping'];

export default function AccountMappingPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [tab, setTab] = useState('Bank Accounts');
  const hotels = hotelId ? [hotelId] : HOTEL_ENTITIES.map((h) => h.id);

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Account Mapping" subtitle="Connect bank accounts, credit cards, vendors, and resolution types to the correct accounts." />
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: tab === t ? PURPLE : '#6a6a6a', borderBottom: tab === t ? `2px solid ${PURPLE}` : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Bank Accounts' && (
        <Table head={['Hotel', 'Bank Account', 'Bank', 'Last 4', 'Maps To (Asset)', 'Status']}>
          {hotels.flatMap((hid) => bankAccountsForHotel(hid).map((b) => (
            <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{hotelLabel(hid).code}</td>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{b.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.bank}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{b.last4}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{b.type === 'Operating Checking' ? '1010 Operating Checking' : b.type === 'Payroll Checking' ? '1020 Payroll Checking' : '1030 Reserve Account'}</td>
              <td className="py-2.5 px-3">{getEntity(hid)?.propertyCode === 'GAA84' && b.type === 'Reserve' ? <Badge label="Mapping Missing" fg="#b91c1c" bg="#fee2e2" /> : <Badge label="Mapped" fg="#15803d" bg="#dcfce7" />}</td>
            </tr>
          )))}
        </Table>
      )}
      {tab === 'Credit Cards' && (
        <Table head={['Hotel', 'Credit Card', 'Issuer', 'Last 4', 'Maps To (Liability)', 'Status']}>
          {hotels.flatMap((hid) => creditCardsForHotel(hid).map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{hotelLabel(hid).code}</td>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{c.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.issuer}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{c.last4}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{c.name.includes('GM') ? '2120 GM Card Payable' : '2110 Corporate Card Payable'}</td>
              <td className="py-2.5 px-3"><Badge label="Mapped" fg="#15803d" bg="#dcfce7" /></td>
            </tr>
          )))}
        </Table>
      )}
      {tab === 'Resolution Types' && (
        <Table head={['Resolution Type', 'Default Debit', 'Default Credit', 'Status']}>
          {[
            ['Bank Fee', '6650 Bank Fees', 'Selected Bank Account'],
            ['Credit Card Payment', '2100 Credit Cards Payable', 'Selected Bank Account'],
            ['Tax Payment', 'Selected Tax Payable', 'Selected Bank Account'],
            ['Loan Payment', 'Loan Payable + Interest Expense', 'Selected Bank Account'],
            ['Owner Contribution', 'Selected Bank Account', '3010 Owner Contribution'],
            ['Owner Draw', '3020 Owner Draw', 'Selected Bank Account'],
            ['Transfer', 'Receiving Bank Account', 'Sending Bank Account'],
          ].map(([r, dr, cr]) => (
            <tr key={r} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{r}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{dr}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{cr}</td>
              <td className="py-2.5 px-3"><Badge label="Configured" fg="#15803d" bg="#dcfce7" /></td>
            </tr>
          ))}
        </Table>
      )}
      {tab === 'Vendors' && (
        <Table head={['Vendor', 'Default Account', 'Department', 'Status']}>
          {ACCT_VENDORS.filter((v) => !hotelId || v.hotelsUsedIn.includes(hotelId)).slice(0, 20).map((v) => (
            <tr key={v.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{v.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.defaultCategory}</td>
              <td className="py-2.5 px-3"><Badge label={v.defaultDepartment} fg="#6a6a6a" bg="#f0f0f0" /></td>
              <td className="py-2.5 px-3"><Badge label="Mapped" fg="#15803d" bg="#dcfce7" /></td>
            </tr>
          ))}
        </Table>
      )}
      {tab === 'Report Mapping' && (
        <p className="text-sm rounded-2xl p-6 text-center" style={{ ...card, color: '#929292' }}>Every account maps to a report line: Revenue, COGS, and Expenses to the P&amp;L; Assets, Liabilities, and Equity to the Balance Sheet; cash accounts to Cash Flow. All accounts in the standard template are mapped.</p>
      )}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{head.map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
