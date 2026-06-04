'use client';

import { card } from '../_ui';

export default function KwanishaSettings() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Sales preferences</p>
      </div>

      <div className="p-5 flex items-center gap-4" style={card}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: '#7c3aed' }}>KB</div>
        <div>
          <p className="text-base font-bold" style={{ color: '#222' }}>Kwanisha Brown</p>
          <p className="text-sm" style={{ color: '#929292' }}>Director of Sales · Home2 Baton Rouge</p>
        </div>
      </div>

      <div style={card}>
        {[
          { label: 'Rebook reminders', sub: 'Alert when a recurring account is due to rebook', on: true },
          { label: 'Win-back alerts', sub: 'Flag regulars who lapse past their pattern', on: true },
          { label: 'RFP response SLA', sub: 'Warn 48h before an RFP response is due', on: true },
          { label: 'Weekly production digest', sub: 'Email summary every Monday', on: false },
        ].map((row, i, arr) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#222' }}>{row.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.sub}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: row.on ? '#dcfce7' : '#f0f0f0', color: row.on ? '#15803d' : '#929292' }}>
              {row.on ? 'On' : 'Off'}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: '#c1c1c1' }}>Demo settings — toggles are illustrative.</p>
    </div>
  );
}
