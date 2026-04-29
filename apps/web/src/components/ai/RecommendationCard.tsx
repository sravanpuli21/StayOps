'use client';

import { useState } from 'react';
import { Check, X, Edit3, Sparkles } from 'lucide-react';
import type { Recommendation, RecommendationStatus } from '@hos/shared';

interface Props {
  recommendation: Recommendation;
  compact?: boolean;
}

const CONFIDENCE_COLOR = {
  high:   { bg: '#f0fdf4', color: '#15803d' },
  medium: { bg: '#fffbeb', color: '#b45309' },
  low:    { bg: '#f5f3ff', color: '#6d28d9' },
} as const;

export function RecommendationCard({ recommendation, compact = false }: Props) {
  const [status, setStatus] = useState<RecommendationStatus>(recommendation.status);

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isOverridden = status === 'overridden';
  const isDecided = isApproved || isRejected || isOverridden;

  const cfg = CONFIDENCE_COLOR[recommendation.confidence];

  return (
    <div
      className="rounded-xl p-4 mt-2 transition-opacity"
      style={{
        background: '#ffffff',
        border: isApproved
          ? '1px solid #16a34a'
          : isRejected
          ? '1px solid #dddddd'
          : isOverridden
          ? '1px solid #6d28d9'
          : '1px solid #ffe0e6',
        boxShadow: isApproved
          ? '0 0 0 3px rgba(22,163,74,0.1)'
          : isOverridden
          ? '0 0 0 3px rgba(109,40,217,0.1)'
          : 'none',
        opacity: isRejected ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: '#ff385c' }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#ff385c' }}>
          Recommended Action
        </span>
        <span
          className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {recommendation.confidence.toUpperCase()} CONFIDENCE
        </span>
      </div>

      <p className="font-semibold text-sm mb-1.5 leading-snug" style={{ color: '#222222' }}>
        {recommendation.action}
      </p>

      {!compact && (
        <p className="text-xs mb-2 leading-relaxed" style={{ color: '#6a6a6a' }}>
          {recommendation.rationale}
        </p>
      )}

      <div
        className="rounded-lg px-3 py-2 mb-3"
        style={{ background: '#f7f7f7' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
          Projected Impact
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: '#222222' }}>
          {recommendation.projectedImpact}
        </p>
      </div>

      {!isDecided && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatus('approved')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors text-white"
            style={{ background: '#ff385c' }}
          >
            <Check className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => setStatus('rejected')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#6a6a6a' }}
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
          <button
            onClick={() => setStatus('overridden')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#6a6a6a' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Override
          </button>
        </div>
      )}

      {isApproved && (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#15803d' }}>
          <Check className="w-3.5 h-3.5" /> Approved — will be flagged for GM action
        </div>
      )}
      {isRejected && (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#6a6a6a' }}>
          <X className="w-3.5 h-3.5" /> Rejected · logged to decisions ledger
        </div>
      )}
      {isOverridden && (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#6d28d9' }}>
          <Edit3 className="w-3.5 h-3.5" /> Overridden · add your own note
        </div>
      )}
    </div>
  );
}
