import type { Bill } from '@hos/shared';
import { formatCurrencyM } from '@hos/shared';

interface Props {
  bills: Bill[];
}

const TODAY = '2026-05-04';

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function ApAgingCard({ bills }: Props) {
  const open = bills.filter((b) => b.status === 'open' || b.status === 'overdue');
  const buckets = {
    current: 0,
    b1_30: 0,
    b31_60: 0,
    b61_90: 0,
    b90: 0,
  };
  for (const b of open) {
    const overdueDays = daysBetween(b.dueDateIso, TODAY);
    if (overdueDays <= 0) buckets.current += b.amount;
    else if (overdueDays <= 30) buckets.b1_30 += b.amount;
    else if (overdueDays <= 60) buckets.b31_60 += b.amount;
    else if (overdueDays <= 90) buckets.b61_90 += b.amount;
    else buckets.b90 += b.amount;
  }
  const total = buckets.current + buckets.b1_30 + buckets.b31_60 + buckets.b61_90 + buckets.b90;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const segments = [
    { label: 'Current',  value: buckets.current, color: '#15803d' },
    { label: '1–30',     value: buckets.b1_30,   color: '#ca8a04' },
    { label: '31–60',    value: buckets.b31_60,  color: '#d97706' },
    { label: '61–90',    value: buckets.b61_90,  color: '#dc2626' },
    { label: '90+',      value: buckets.b90,     color: '#7f1d1d' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>AP Aging</h3>
        <p className="text-2xl font-bold" style={{ color: '#222222' }}>{formatCurrencyM(total)}</p>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-3" style={{ background: '#f0f0f0' }}>
        {segments.map((s) => (
          <div key={s.label} style={{ width: `${pct(s.value)}%`, background: s.color }} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{s.label}</p>
            </div>
            <p className="text-sm font-medium mt-0.5" style={{ color: '#222222' }}>{formatCurrencyM(s.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
