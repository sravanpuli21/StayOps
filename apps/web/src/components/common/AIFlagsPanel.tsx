'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnomalyFinding, AlertSeverity } from '@hos/shared';
import { HOTELS, AI_ROOT_CAUSES, AI_RECOMMENDATIONS } from '@hos/shared';
import { AnomalyBadge } from '@/components/ai/AnomalyBadge';
import { RootCausePanel } from '@/components/ai/RootCausePanel';
import { RecommendationCard } from '@/components/ai/RecommendationCard';

interface Props {
  findings: AnomalyFinding[];
  title?: string;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { Icon: typeof AlertCircle; color: string; label: string }> = {
  critical: { Icon: AlertCircle,   color: '#dc2626', label: 'Critical' },
  warning:  { Icon: AlertTriangle, color: '#d97706', label: 'Warning' },
  info:     { Icon: Info,          color: '#2563eb', label: 'Info' },
};

export function AIFlagsPanel({ findings, title = 'AI-Detected Findings' }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (findings.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} />
        <h3 className="text-sm font-bold" style={{ color: '#222222' }}>
          {title}
        </h3>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: '#f7f7f7', color: '#6a6a6a' }}
        >
          {findings.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {findings.map((finding) => {
          const cfg = SEVERITY_CONFIG[finding.severity];
          const hotel = HOTELS.find((h) => h.id === finding.hotelId);
          const isExpanded = expandedId === finding.id;
          const rootCause = AI_ROOT_CAUSES.find((rc) => rc.findingId === finding.id);
          const recommendation = AI_RECOMMENDATIONS.find((r) => r.findingId === finding.id);

          return (
            <div
              key={finding.id}
              className="bg-white overflow-hidden relative"
              style={{
                borderRadius: 14,
                border: '1px solid #dddddd',
              }}
            >
              {/* Left severity rail */}
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{ width: 3, background: cfg.color }}
              />

              <button
                onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                className="w-full flex items-start gap-3 px-4 py-3 pl-5 text-left transition-colors hover:bg-[#fafafa]"
              >
                <cfg.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <AnomalyBadge kind={finding.kind} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    {hotel && (
                      <>
                        <span className="text-xs" style={{ color: '#c1c1c1' }}>·</span>
                        <span className="text-xs font-medium" style={{ color: '#6a6a6a' }}>
                          {hotel.shortName}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug" style={{ color: '#222222' }}>
                    {finding.headline}
                  </p>
                  <p className="text-xs mt-1 leading-snug" style={{ color: '#6a6a6a' }}>
                    {finding.detail}
                  </p>
                </div>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6a6a6a' }} />
                }
              </button>

              {isExpanded && (
                <div
                  className="px-4 pb-3 pl-5"
                  style={{ borderTop: '1px solid #ebebeb', background: '#fafafa' }}
                >
                  {rootCause && <RootCausePanel rootCause={rootCause} />}
                  {recommendation && <RecommendationCard recommendation={recommendation} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
