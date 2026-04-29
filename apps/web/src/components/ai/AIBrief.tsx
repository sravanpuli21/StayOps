import { Sparkles, RefreshCw } from 'lucide-react';
import type { ModuleBrief, AIBriefBullet } from '@hos/shared';

interface AIBriefProps {
  brief: ModuleBrief;
}

const TONE_COLOR: Record<AIBriefBullet['tone'], string> = {
  neutral:  '#3f3f3f',
  positive: '#15803d',
  negative: '#b91c1c',
  decision: '#222222',
};

const TONE_DOT: Record<AIBriefBullet['tone'], string> = {
  neutral:  '#c1c1c1',
  positive: '#16a34a',
  negative: '#dc2626',
  decision: '#ff385c',
};

export function AIBrief({ brief }: AIBriefProps) {
  return (
    <div
      className="bg-white p-6"
      style={{
        borderRadius: 14,
        border: '1px solid #dddddd',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,56,92,0.1)' }}
        >
          <Sparkles className="w-3 h-3" style={{ color: '#ff385c' }} />
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: '#ff385c' }}
        >
          AI Brief
        </span>
        <span className="text-xs" style={{ color: '#c1c1c1' }}>·</span>
        <span className="text-xs" style={{ color: '#929292' }}>
          personalized for Kirit Patel
        </span>
      </div>

      <p className="font-semibold text-base mb-3 leading-snug" style={{ color: '#222222' }}>
        {brief.headline}
      </p>

      <ul className="flex flex-col gap-2">
        {brief.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ background: TONE_DOT[bullet.tone] }}
            />
            <span className="text-sm leading-relaxed" style={{ color: TONE_COLOR[bullet.tone] }}>
              {bullet.text}
            </span>
          </li>
        ))}
      </ul>

      <div
        className="flex items-center gap-1.5 mt-4 pt-3"
        style={{ borderTop: '1px solid #ebebeb' }}
      >
        <RefreshCw className="w-3 h-3" style={{ color: '#ff385c' }} />
        <span className="text-xs" style={{ color: '#ff385c' }}>
          Data updated 5 min ago
        </span>
      </div>
    </div>
  );
}
