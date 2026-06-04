'use client';

import { CRM_ACCOUNTS, ACCOUNT_TYPE_LABEL, type CrmAccountType } from '@hos/shared';
import { fmtMoneyFull, card } from '../_ui';

export default function ReportsPage() {
  const accts = CRM_ACCOUNTS;
  const totalRev = accts.reduce((s, a) => s + a.ytdRevenue, 0);
  const recurring = accts.filter((a) => a.cadence !== 'one-time').reduce((s, a) => s + a.ytdRevenue, 0);
  const recurringPct = totalRev ? Math.round((recurring / totalRev) * 100) : 0;

  // Production by account type
  const byType = new Map<CrmAccountType, { rev: number; nights: number }>();
  for (const a of accts) {
    const cur = byType.get(a.type) ?? { rev: 0, nights: 0 };
    cur.rev += a.ytdRevenue; cur.nights += a.ytdRoomNights;
    byType.set(a.type, cur);
  }
  const typeRows = [...byType.entries()].sort((x, y) => y[1].rev - x[1].rev);
  const maxRev = Math.max(...typeRows.map(([, v]) => v.rev), 1);

  // Top accounts
  const top = [...accts].filter((a) => a.ytdRevenue > 0).sort((a, b) => b.ytdRevenue - a.ytdRevenue);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Group production · trailing 12 months</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Total group revenue" value={fmtMoneyFull(totalRev)} />
        <Stat label="Recurring revenue" value={fmtMoneyFull(recurring)} accent="#15803d" />
        <Stat label="Recurring share" value={`${recurringPct}%`} accent="#15803d" />
      </div>

      {/* Production by type */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Production by account type</h2>
        <div className="p-4 flex flex-col gap-3" style={card}>
          {typeRows.map(([type, v]) => (
            <div key={type} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#222' }}>{ACCOUNT_TYPE_LABEL[type]}</span>
                <span className="font-semibold" style={{ color: '#222' }}>{fmtMoneyFull(v.rev)} <span style={{ color: '#929292', fontWeight: 400 }}>· {v.nights.toLocaleString()} nts</span></span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}>
                <div className="h-2 rounded-full" style={{ width: `${(v.rev / maxRev) * 100}%`, background: '#7c3aed' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top accounts */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Top accounts</h2>
        <div style={card}>
          {top.map((a, i) => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: i < top.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span className="text-sm font-bold w-5" style={{ color: '#c1c1c1' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{a.name}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{ACCOUNT_TYPE_LABEL[a.type]} · {a.ytdRoomNights.toLocaleString()} room-nights</p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: '#222' }}>{fmtMoneyFull(a.ytdRevenue)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="p-4" style={card}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-xl font-bold mt-1" style={{ color: accent }}>{value}</p>
    </div>
  );
}
