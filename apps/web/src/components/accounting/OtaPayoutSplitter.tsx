import type { OtaRemittanceRow } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  row: OtaRemittanceRow;
  hotelLabel: string;
}

export function OtaPayoutSplitter({ row, hotelLabel }: Props) {
  const lines = [
    { label: 'Rooms Revenue (gross)',          account: '4100 · Rooms Revenue',         amount: row.grossBookings,    color: '#15803d' },
    { label: `${row.otaName} commission`,      account: '5210 · Rooms – OTA Commission', amount: -row.commission,      color: '#b91c1c' },
    { label: 'Occupancy tax collected',        account: '2210 · Occupancy Tax Payable',  amount: -row.taxesCollected,  color: '#b45309' },
    { label: 'Net deposit to operating',       account: '1010 · Cash – Operating',       amount: row.netPayout,        color: '#1d4ed8' },
  ];

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs" style={{ color: '#929292' }}>{row.dateIso} · {hotelLabel}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: '#222222' }}>{row.otaName} payout</p>
          <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{row.reservationCount} reservations</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Net deposit</p>
          <p className="text-xl font-bold" style={{ color: '#222222' }}>{formatCurrency(row.netPayout)}</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
        {lines.map((line, i) => (
          <div
            key={line.label}
            className="px-4 py-2 flex items-center justify-between"
            style={{ borderBottom: i < lines.length - 1 ? '1px solid #f0f0f0' : 'none', background: '#ffffff' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: '#222222' }}>{line.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{line.account}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: line.color }}>
              {line.amount >= 0 ? '+' : ''}{formatCurrency(line.amount)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px]" style={{ color: '#929292' }}>
        Posts as 4 ledger entries — gross room revenue, OTA commission expense, occupancy tax liability, net cash deposit.
      </p>
    </div>
  );
}
