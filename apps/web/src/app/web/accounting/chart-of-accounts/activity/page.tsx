'use client';

import { useState, useMemo } from 'react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctState } from '../../_store';
import { card, Badge, fmtDate } from '../../_ui';
import { CoaTabs } from '../_shared';

const COA_ACTIONS = ['Account Created', 'Account Edited', 'Account Made Inactive', 'Account Reactivated', 'Setting Changed', 'Mapping Changed', 'Opening Balance Saved', 'Opening Balance Posted'];
const COA_RECORD_TYPES = ['Account', 'Mapping', 'Opening Balance', 'Chart of Accounts'];

export default function CoaActivityPage() {
  const store = useAcctState();
  const [hotelF, setHotelF] = useState('all');
  const [actionF, setActionF] = useState('all');

  const rows = useMemo(() => store.entityActivity.filter((a) => {
    const isCoa = COA_RECORD_TYPES.includes(a.recordType ?? '') || COA_ACTIONS.includes(a.action);
    const matchesHotel = hotelF === 'all' || a.hotelId === hotelF;
    const matchesAction = actionF === 'all' || a.action === actionF;
    return isCoa && matchesHotel && matchesAction;
  }), [store.entityActivity, hotelF, actionF]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Chart of Accounts Activity Log</h1><p className="text-sm" style={{ color: '#929292' }}>Track account creation, edits, mappings, template changes, and opening balances.</p></div>

      <div className="flex gap-2 flex-wrap">
        <select value={hotelF} onChange={(e) => setHotelF(e.target.value)} className={fil}><option value="all">All Hotels</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select>
        <select value={actionF} onChange={(e) => setActionF(e.target.value)} className={fil}><option value="all">All Actions</option>{COA_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No Chart of Accounts activity yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Account edits, template applications, mappings, and opening balances will appear here as you work.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date / Time', 'User', 'Hotel', 'Action', 'Before', 'After', 'Details'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 100).map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(a.ts.slice(0, 10))}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{a.actor}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.hotelId ? (getEntity(a.hotelId)?.propertyCode ?? a.hotelId) : '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={a.action} fg="#6a4ec0" bg="#ece4fb" /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{a.before ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{a.after ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{a.detail ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
