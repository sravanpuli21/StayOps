'use client';

import { getEntity } from '@hos/shared/accounting-os';
import { Badge, PURPLE } from '../_ui';
import { RISK_LABEL, type RuleRow } from './_data';

/** Shared table row for rules across All / Global / Hotel-Level pages. */
export function RuleTableRow({ r, onOpen, showScope = true }: { r: RuleRow; onOpen: () => void; showScope?: boolean }) {
  const risk = RISK_LABEL[r.risk];
  const reviewReq = r.behavior === 'Review Required';
  return (
    <tr className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={onOpen}>
      <td className="py-2.5 px-2.5"><p className="text-sm font-medium" style={{ color: '#222' }}>{r.rule.name}</p>{r.rule.hotelId && <p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(r.rule.hotelId)?.hotelName}</p>}</td>
      {showScope && <td className="py-2.5 px-2.5">{r.rule.scope === 'hotel_level' ? <Badge label="Hotel-Level" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Global" fg={PURPLE} bg="#ece4fb" />}</td>}
      <td className="py-2.5 px-2.5 text-xs" style={{ color: '#222' }}>{r.rule.actions.setCategoryName ?? r.rule.actions.setTransactionType ?? '—'}</td>
      <td className="py-2.5 px-2.5"><Badge label={risk.label} fg={risk.fg} bg={risk.bg} /></td>
      <td className="py-2.5 px-2.5">{reviewReq ? <Badge label="Review Required" fg="#b45309" bg="#fef3c7" /> : <Badge label="Auto-Code" fg="#15803d" bg="#dcfce7" />}</td>
      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#222' }}>{r.matched}</td>
      <td className="py-2.5 px-2.5 text-xs text-right font-semibold" style={{ color: '#15803d' }}>{r.accuracy}%</td>
      <td className="py-2.5 px-2.5">{r.rule.status === 'active' ? <Badge label="Active" fg="#15803d" bg="#dcfce7" /> : r.rule.status === 'disabled' ? <Badge label="Disabled" fg="#6a6a6a" bg="#f0f0f0" /> : <Badge label="Draft" fg="#b45309" bg="#fef3c7" />}</td>
      <td className="py-2.5 px-2.5 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>View</span></td>
    </tr>
  );
}
