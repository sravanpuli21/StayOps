'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { Forecast } from '@hos/shared';

interface Props {
  forecast: Forecast;
}

export function ForecastWidget({ forecast }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = forecast.scenarios[activeIdx];

  const delta = active.projectedPct;
  const deltaColor = delta > 0 ? '#15803d' : delta < 0 ? '#b91c1c' : '#6a6a6a';
  const deltaPrefix = delta > 0 ? '+' : '';

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,56,92,0.1)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#ff385c' }} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#ff385c' }}>
          Forecast & What-If
        </span>
        <span className="ml-auto text-xs" style={{ color: '#929292' }}>
          {forecast.horizon}
        </span>
      </div>

      <p className="font-semibold text-sm mb-4" style={{ color: '#222222' }}>
        {forecast.metric}
      </p>

      <div className="flex items-end gap-8 mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>
            Projected
          </p>
          <p className="text-3xl font-bold leading-none" style={{ color: '#222222' }}>
            {active.formattedValue}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
            vs Baseline
          </p>
          <div className="flex items-baseline gap-1">
            <TrendingUp
              className="w-3 h-3"
              style={{ color: deltaColor, transform: delta < 0 ? 'scaleY(-1)' : 'none' }}
            />
            <span className="text-base font-semibold" style={{ color: deltaColor }}>
              {deltaPrefix}{delta.toFixed(1)}%
            </span>
            <span className="text-xs" style={{ color: '#929292' }}>
              vs {forecast.formattedBaseline}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {forecast.scenarios.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActiveIdx(i)}
            className="px-3 h-8 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: i === activeIdx ? '#ff385c' : '#ffffff',
              border: i === activeIdx ? '1px solid #ff385c' : '1px solid #dddddd',
              color: i === activeIdx ? '#ffffff' : '#6a6a6a',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-lg px-3 py-2"
        style={{ background: '#f7f7f7' }}
      >
        <p className="text-xs leading-relaxed" style={{ color: '#6a6a6a' }}>
          <span className="font-semibold" style={{ color: '#222222' }}>Lever:</span>{' '}
          {active.delta}
        </p>
      </div>

      <p className="text-xs mt-3 leading-relaxed" style={{ color: '#6a6a6a' }}>
        {forecast.narrative}
      </p>
    </div>
  );
}
