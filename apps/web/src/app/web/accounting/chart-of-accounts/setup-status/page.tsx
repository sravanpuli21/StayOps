'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { portfolioCoaSummary } from '../../_coa';
import { card, Badge } from '../../_ui';
import { CoaTabs, SummaryCard } from '../_shared';
import { ApplyTemplateModal } from '../_ApplyTemplate';

const STATUS_BADGE: Record<string, { fg: string; bg: string }> = {
  Complete: { fg: '#15803d', bg: '#dcfce7' },
  'Needs Template': { fg: '#b91c1c', bg: '#fee2e2' },
  'Needs Mapping': { fg: '#b45309', bg: '#fef3c7' },
  'Needs Opening Balance': { fg: '#b45309', bg: '#fef3c7' },
  'Needs Review': { fg: '#1d4ed8', bg: '#dbeafe' },
};

export default function SetupStatusPage() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const store = useAcctState();
  const [applyHotel, setApplyHotel] = useState<string | undefined>();
  const [applyOpen, setApplyOpen] = useState(false);
  const p = portfolioCoaSummary(store);

  const openCoa = (id: string) => { selectHotel(id); router.push('/web/accounting/chart-of-accounts/accounts'); };
  const openMapping = (id: string) => { selectHotel(id); router.push('/web/accounting/chart-of-accounts/mapping'); };
  const openOpening = (id: string) => { selectHotel(id); router.push('/web/accounting/chart-of-accounts/opening-balances'); };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Chart of Accounts Setup Status</h1><p className="text-sm" style={{ color: '#929292' }}>See which hotels have complete account setup and which hotels need attention.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Hotel Entities" value={p.entities} />
        <SummaryCard label="COA Applied" value={p.applied} accent="#15803d" />
        <SummaryCard label="Missing COA" value={p.missing} accent={p.missing ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Complete" value={p.setups.filter((s) => s.status === 'Complete').length} accent="#15803d" />
        <SummaryCard label="Need Mapping" value={p.setups.filter((s) => s.status === 'Needs Mapping').length} accent="#b45309" />
        <SummaryCard label="Setup Issues" value={p.issues} accent={p.issues ? '#b45309' : '#15803d'} />
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Legal Entity', 'Code', 'Template', 'Required Accts', 'Bank Map', 'Card Map', 'Opening Bal.', 'Custom', 'Issues', 'Overall Status', 'Action'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
          <tbody>
            {p.setups.map((s) => {
              const h = getEntity(s.hotelId)!;
              const issues = [!s.templateApplied && 'No template', !s.bankMapped && 'Bank mapping', s.openingStatus === 'missing' && 'Opening balance'].filter(Boolean).length;
              return (
                <tr key={s.hotelId} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{h.legalEntity}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3">{s.templateApplied ? <Badge label="Applied" fg="#15803d" bg="#dcfce7" /> : <Badge label="Missing" fg="#b91c1c" bg="#fee2e2" />}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: s.missingRequired ? '#b91c1c' : '#15803d' }}>{s.missingRequired ? `${s.missingRequired} missing` : 'OK'}</td>
                  <td className="py-2.5 px-3">{s.bankMapped ? <Badge label="OK" fg="#15803d" bg="#dcfce7" /> : <Badge label="Needs" fg="#b45309" bg="#fef3c7" />}</td>
                  <td className="py-2.5 px-3">{s.cardMapped ? <Badge label="OK" fg="#15803d" bg="#dcfce7" /> : <Badge label="Needs" fg="#b45309" bg="#fef3c7" />}</td>
                  <td className="py-2.5 px-3 text-xs capitalize" style={{ color: s.openingStatus === 'entered' ? '#15803d' : '#b45309' }}>{s.openingStatus}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a4ec0' }}>{s.customAccounts || '—'}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: issues ? '#b45309' : '#15803d' }}>{issues || '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={s.status} {...(STATUS_BADGE[s.status] ?? STATUS_BADGE.Complete)} /></td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {s.status === 'Needs Template' ? <button onClick={() => { setApplyHotel(s.hotelId); setApplyOpen(true); }} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Apply Template</button>
                      : s.status === 'Needs Mapping' ? <button onClick={() => openMapping(s.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review Mapping</button>
                      : s.status === 'Needs Opening Balance' ? <button onClick={() => openOpening(s.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Enter Opening Balances</button>
                      : <button onClick={() => openCoa(s.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review Accounts</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {applyOpen && <ApplyTemplateModal preHotel={applyHotel} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
