'use client';

import { Sparkles, Check, Lock } from 'lucide-react';
import { formatCurrency } from '@hos/shared';
import { useSravanBonuses } from '@/lib/sravan-data';

export default function SravanBonusPage() {
  const SRAVAN_BONUSES = useSravanBonuses();
  const earned = SRAVAN_BONUSES.reduce((s, b) => s + b.earnedThisPeriod, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Bonuses</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Incentive programs for front desk · this pay period
        </p>
      </div>

      <div
        className="rounded-2xl p-6 text-white flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold opacity-80">Earned This Period</p>
          <p className="text-3xl font-bold">{formatCurrency(earned)}</p>
          <p className="text-xs opacity-90 mt-0.5">Paid out with your next paycheck</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SRAVAN_BONUSES.map((b) => {
          const pct = Math.round(b.progress * 100);
          const barColor = b.status === 'maxed' ? '#16a34a' : b.status === 'locked' ? '#c1c1c1' : '#ff385c';
          return (
            <div
              key={b.id}
              className="rounded-2xl p-5"
              style={{ background: '#ffffff', border: '1px solid #dddddd' }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: '#222222' }}>{b.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{b.description}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
                  style={{
                    background: b.status === 'maxed' ? '#d1fae5' : b.status === 'locked' ? '#f0f0f0' : '#fef3c7',
                    color: b.status === 'maxed' ? '#047857' : b.status === 'locked' ? '#6a6a6a' : '#b45309',
                  }}
                >
                  {b.status === 'maxed' ? <><Check className="w-3 h-3 inline" /> Maxed</> : b.status === 'locked' ? <><Lock className="w-3 h-3 inline" /> Locked</> : 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-3 mb-1.5" style={{ color: '#6a6a6a' }}>
                <span className="font-medium">{b.rewardLabel}</span>
                <span className="font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
              </div>

              <div className="mt-3 flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                <span className="text-xs" style={{ color: '#929292' }}>This period</span>
                <span className="text-sm font-bold" style={{ color: '#222222' }}>
                  {formatCurrency(b.earnedThisPeriod)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
