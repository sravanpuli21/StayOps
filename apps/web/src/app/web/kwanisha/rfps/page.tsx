'use client';

import { CRM_RFPS, type RfpStatus } from '@hos/shared';
import { fmtMoneyFull, Badge, card } from '../_ui';

const RFP_STYLE: Record<RfpStatus, { fg: string; bg: string; label: string }> = {
  new:       { fg: '#7c3aed', bg: '#ece4fb', label: 'New' },
  reviewing: { fg: '#1d4ed8', bg: '#dbeafe', label: 'Reviewing' },
  quoted:    { fg: '#b45309', bg: '#fef3c7', label: 'Quoted' },
  won:       { fg: '#15803d', bg: '#dcfce7', label: 'Won' },
  lost:      { fg: '#b91c1c', bg: '#fee2e2', label: 'Lost' },
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function RfpsPage() {
  const rfps = [...CRM_RFPS].sort((a, b) => +new Date(a.due) - +new Date(b.due));
  const openVal = rfps.filter((r) => r.status !== 'lost').reduce((s, r) => s + r.value, 0);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Group RFPs</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{rfps.length} requests · {fmtMoneyFull(openVal)} in play</p>
      </div>

      <div style={card}>
        {/* header row */}
        <div className="hidden md:flex items-center gap-4 px-4 py-2.5" style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          {['Account / event', 'Dates', 'Rooms', 'Value', 'Respond by', 'Status'].map((h, i) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: '#6a6a6a', flex: i === 0 ? 2 : 1, textAlign: i >= 2 && i <= 3 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {rfps.map((r, i) => {
          const st = RFP_STYLE[r.status];
          const soon = (+new Date(r.due) - Date.now()) / 86400000 < 4;
          return (
            <div key={r.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 px-4 py-3.5"
              style={{ borderBottom: i < rfps.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div className="md:flex-[2] min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#222' }}>{r.event}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{r.account}</p>
              </div>
              <span className="md:flex-1 text-sm" style={{ color: '#6a6a6a' }}>{fmtDate(r.arrival)} · {r.nights} nt</span>
              <span className="md:flex-1 md:text-right text-sm" style={{ color: '#222' }}>{r.rooms} rooms</span>
              <span className="md:flex-1 md:text-right text-sm font-semibold" style={{ color: '#222' }}>{fmtMoneyFull(r.value)}</span>
              <span className="md:flex-1 text-sm font-medium" style={{ color: soon ? '#b91c1c' : '#6a6a6a' }}>
                {fmtDate(r.due)}{soon ? ' · soon' : ''}
              </span>
              <span className="md:flex-1"><Badge label={st.label} fg={st.fg} bg={st.bg} /></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
