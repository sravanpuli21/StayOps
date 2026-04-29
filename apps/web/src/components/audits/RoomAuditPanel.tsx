'use client';

import { useMemo } from 'react';
import {
  getRoomAuditSummary, AUDIT_AREA_DEFS, AUDIT_AREA_IDS,
} from '@hos/shared';
import type { AuditAreaId, AreaStatus } from '@hos/shared';
import { SlidePanel } from '../operations/SlidePanel';
import { HOTELS } from '@hos/shared';
import {
  CheckCircle2, AlertTriangle, Clock, ChevronRight,
} from 'lucide-react';

// ── Smart timestamp ────────────────────────────────────────────────────────────

const REF = new Date('2026-04-27T14:00:00Z').getTime();

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = REF - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nextDueLabel(iso: string | null): string {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - REF;
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days <= 7) return `In ${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Area row ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  overdue:  { color: '#b91c1c', bg: 'rgba(239,68,68,0.08)',   dotColor: '#ef4444', label: 'Overdue',  icon: AlertTriangle },
  due_soon: { color: '#b45309', bg: 'rgba(245,158,11,0.08)',  dotColor: '#f59e0b', label: 'Due Soon', icon: Clock },
  current:  { color: '#15803d', bg: 'rgba(34,197,94,0.06)',   dotColor: '#22c55e', label: 'Current',  icon: CheckCircle2 },
  never:    { color: '#6a6a6a', bg: '#f7f7f7',                dotColor: '#c1c1c1', label: 'Never',    icon: Clock },
};

const SCORE_CFG = {
  pass:            { color: '#15803d' },
  needs_attention: { color: '#b45309' },
  fail:            { color: '#b91c1c' },
};

function AreaRow({ area, onClick }: { area: AreaStatus; onClick: () => void }) {
  const def = AUDIT_AREA_DEFS[area.areaId];
  const cfg = STATUS_CFG[area.status];
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 transition-all group"
      style={{ background: cfg.bg, border: `1px solid ${cfg.dotColor}30` }}
    >
      {/* Status dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dotColor }}
      />

      {/* Area info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold" style={{ color: '#222222' }}>{def.label}</p>
          <span
            className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: cfg.dotColor + '20', color: cfg.color }}
          >
            <Icon className="w-3 h-3" />{cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs" style={{ color: '#929292' }}>
            {def.frequencyLabel} · Last: <span className="font-medium" style={{ color: '#6a6a6a' }}>{timeAgo(area.lastAuditAt)}</span>
          </span>
          {area.lastScore !== null && (
            <span
              className="text-xs font-bold"
              style={{ color: area.lastResult ? SCORE_CFG[area.lastResult].color : '#6a6a6a' }}
            >
              {area.lastScore}/100
            </span>
          )}
          <span className="text-xs" style={{ color: area.status === 'overdue' ? '#b91c1c' : '#929292' }}>
            {area.status === 'overdue' ? '⚠ ' : ''}Next: {nextDueLabel(area.nextDueAt)}
          </span>
        </div>
      </div>

      {/* Record count + chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: '#929292' }}>{area.recordCount} records</span>
        <ChevronRight
          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
          style={{ color: '#929292' }}
        />
      </div>
    </button>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────────

function SummaryBar({ areas }: { areas: AreaStatus[] }) {
  const overdue = areas.filter((a) => a.status === 'overdue').length;
  const dueSoon = areas.filter((a) => a.status === 'due_soon').length;
  const current = areas.filter((a) => a.status === 'current').length;
  return (
    <div
      className="rounded-2xl px-4 py-3 grid grid-cols-3 gap-2 mb-5"
      style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
    >
      {[
        { label: 'Overdue', count: overdue, color: '#b91c1c' },
        { label: 'Due Soon', count: dueSoon, color: '#b45309' },
        { label: 'Current', count: current, color: '#15803d' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-xl font-black" style={{ color: item.color }}>{item.count}</p>
          <p className="text-xs" style={{ color: '#929292' }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  hotelId: string | null;
  roomNumber: string | null;
  onClose: () => void;
  onAreaClick: (areaId: AuditAreaId) => void;
  backLabel?: string;
  onBack?: () => void;
}

export function RoomAuditPanel({ hotelId, roomNumber, onClose, onAreaClick, backLabel, onBack }: Props) {
  const summary = useMemo(() => {
    if (!hotelId || !roomNumber) return null;
    return getRoomAuditSummary(hotelId, roomNumber);
  }, [hotelId, roomNumber]);

  if (!hotelId || !roomNumber || !summary) return null;
  const hotel = HOTELS.find((h) => h.id === hotelId);

  return (
    <SlidePanel
      open={true}
      onClose={onClose}
      title={`Room ${roomNumber}`}
      subtitle={`${hotel?.shortName ?? hotelId} · ${AUDIT_AREA_IDS.length} audit areas`}
      backLabel={backLabel}
      onBack={onBack}
    >
      <div className="px-6 py-5 flex flex-col gap-3">
        <SummaryBar areas={summary.areas} />

        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>
          Audit Areas — tap to view history
        </p>

        {summary.areas.map((area) => (
          <AreaRow
            key={area.areaId}
            area={area}
            onClick={() => onAreaClick(area.areaId)}
          />
        ))}
      </div>
    </SlidePanel>
  );
}
