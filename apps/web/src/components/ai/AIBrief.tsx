import { Sparkles } from 'lucide-react';
import type { ModuleBrief, AIBriefBullet } from '@hos/shared';

interface AIBriefProps {
  brief: ModuleBrief;
}

const TONE_COLOR: Record<AIBriefBullet['tone'], string> = {
  neutral:  '#6a6a6a',
  positive: '#15803d',
  negative: '#b91c1c',
  decision: '#ff385c',
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
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, #fff6f8 0%, #ffffff 70%)',
        border: '1px solid #ffe0e6',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,56,92,0.1)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#ff385c' }} />
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: '#ff385c' }}
        >
          AI Brief
        </span>
        <span className="text-xs" style={{ color: '#c1c1c1' }}>· updated now</span>
      </div>
      <p className="font-semibold text-sm mb-3 leading-snug" style={{ color: '#222222' }}>
        {brief.headline}
      </p>
      <ul className="flex flex-col gap-2">
        {brief.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: TONE_DOT[bullet.tone] }}
            />
            <span className="text-sm leading-relaxed" style={{ color: TONE_COLOR[bullet.tone] }}>
              {bullet.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
