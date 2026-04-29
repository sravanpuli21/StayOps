'use client';

import type { RootCause } from '@hos/shared';
import { GitBranch } from 'lucide-react';

interface Props {
  rootCause: RootCause;
}

export function RootCausePanel({ rootCause }: Props) {
  return (
    <div
      className="rounded-xl p-4 mt-2"
      style={{ background: '#fafafa', border: '1px solid #eeeeee' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="w-3.5 h-3.5" style={{ color: '#ff385c' }} />
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: '#6a6a6a' }}
        >
          Root Cause
        </span>
      </div>

      <ol className="flex flex-col gap-2 mb-4">
        {rootCause.chain.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#6a6a6a' }}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug" style={{ color: '#222222' }}>
                {step.step}
              </p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: '#6a6a6a' }}>
                {step.evidence}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div
        className="rounded-lg p-3"
        style={{ background: '#ffffff', border: '1px solid #eeeeee' }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>
          Interpretation
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#3f3f3f' }}>
          {rootCause.narrative}
        </p>
      </div>
    </div>
  );
}
