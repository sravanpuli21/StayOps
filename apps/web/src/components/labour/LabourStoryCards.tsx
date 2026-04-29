import { TrendingUp, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

const STORIES = [
  {
    icon: TrendingUp,
    iconColor: '#dc2626',
    bg: '#fef2f2',
    headline: 'Biggest Overrun',
    body: 'Fairfield Pooler clocked +59 hrs over schedule, driven by Kitchen and Housekeeping departments.',
  },
  {
    icon: AlertTriangle,
    iconColor: '#d97706',
    bg: '#fffbeb',
    headline: 'Highest Overtime',
    body: 'Home2 TX logged 16 overtime hours this period. Review scheduling to prevent repeat next pay cycle.',
  },
  {
    icon: TrendingDown,
    iconColor: '#16a34a',
    bg: '#f0fdf4',
    headline: 'Best Labour Control',
    body: 'Woodspring Brunswick came in 12 hrs under schedule with only 2 OT hours — tightest control in portfolio.',
  },
  {
    icon: DollarSign,
    iconColor: '#dc2626',
    bg: '#fef2f2',
    headline: 'Payroll Pressure',
    body: 'Home2 TX payroll at 34% of revenue against a 30% target. Immediate scheduling review required.',
  },
];

export function LabourStoryCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STORIES.map((s) => (
        <div
          key={s.headline}
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: s.bg, border: '1px solid #dddddd' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <s.icon className="w-4.5 h-4.5" style={{ color: s.iconColor }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#222222' }}>{s.headline}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6a6a6a' }}>{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
