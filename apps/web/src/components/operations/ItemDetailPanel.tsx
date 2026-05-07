'use client';

import { useState } from 'react';
import type { RoomInventoryItem, AssetStatus } from '@hos/shared';
import { HOTELS } from '@hos/shared';
import { SlidePanel } from './SlidePanel';
import { ConditionBadge } from './OpsBadges';
import { Tabs } from '@/components/ui/tabs';
import {
  AlertTriangle, TrendingUp, Wrench, Calendar, FileText, Download, Gauge,
} from 'lucide-react';

interface Props {
  item: RoomInventoryItem | null;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
}

const HISTORY_ICON: Record<string, string> = {
  repair: '🔧',
  replacement: '📦',
  inspection: '🔍',
  complaint: '💬',
};

const HISTORY_COLOR: Record<string, string> = {
  repair: '#c0392b',
  replacement: '#1d6fa4',
  inspection: '#15803d',
  complaint: '#d97706',
};

const STATUS_CHIP: Record<AssetStatus, { bg: string; color: string }> = {
  'operational':    { bg: '#ecfdf5', color: '#047857' },
  'repair needed':  { bg: '#fffbeb', color: '#b45309' },
  'out of service': { bg: '#fef2f2', color: '#b91c1c' },
  'retired':        { bg: '#f3f4f6', color: '#6a6a6a' },
};

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function pctBetween(startIso: string, endIso: string, nowIso = new Date().toISOString().split('T')[0]): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const now = new Date(nowIso).getTime();
  if (end <= start) return 100;
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

function daysBetween(aIso: string, bIso: string): number {
  return Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / (1000 * 60 * 60 * 24));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5 px-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <span className="text-xs" style={{ color: '#929292' }}>{label}</span>
      <span className="text-sm" style={{ color: '#222' }}>{value}</span>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-wide px-4 py-2"
      style={{ color: '#6a6a6a', background: '#fafafa', borderTop: '1px solid #dddddd', borderBottom: '1px solid #f0f0f0' }}
    >
      {children}
    </p>
  );
}

function LifecycleBar({ label, pct, hint }: { label: string; pct: number; hint?: string }) {
  const color = pct >= 85 ? '#b91c1c' : pct >= 60 ? '#b45309' : '#15803d';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>{label}</p>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      {hint && <p className="text-[11px] mt-1" style={{ color: '#929292' }}>{hint}</p>}
    </div>
  );
}

export function ItemDetailPanel({ item, onClose, backLabel, onBack }: Props) {
  const [tab, setTab] = useState<'details' | 'tasks' | 'measurements'>('details');
  if (!item) return null;
  const hotel = HOTELS.find((h) => h.id === item.hotelId);

  const repairThresholdExceeded = item.repairCount >= 3;
  const costRatio = item.replacementCost > 0 ? item.totalRepairCost / item.replacementCost : 0;

  // Lifecycle %s
  const today = new Date().toISOString().split('T')[0];
  const warrantyPct = item.purchaseDate && item.warrantyEnd ? pctBetween(item.purchaseDate, item.warrantyEnd, today) : null;
  const lifePct = item.firstUseDate && item.endOfLifeDate ? pctBetween(item.firstUseDate, item.endOfLifeDate, today) : null;
  const daysToWarrantyEnd = item.warrantyEnd ? daysBetween(today, item.warrantyEnd) : null;

  // Tasks — upcoming (derived) + history
  const upcoming: { date: string; label: string }[] = [];
  if (item.lastServiceDate) {
    const cadenceDays = item.category === 'appliance' ? 180 : item.category === 'fixture' ? 365 : 730;
    const next = new Date(item.lastServiceDate);
    next.setDate(next.getDate() + cadenceDays);
    upcoming.push({ date: next.toISOString().split('T')[0], label: 'Preventive inspection' });
  }
  if (item.warrantyEnd && daysToWarrantyEnd !== null && daysToWarrantyEnd > 0 && daysToWarrantyEnd < 120) {
    upcoming.push({ date: item.warrantyEnd, label: 'Warranty expires — replace if failing' });
  }

  const statusLabel = item.status ?? (item.condition === 'condemned' ? 'out of service' : 'operational');
  const statusChip = STATUS_CHIP[statusLabel as AssetStatus] ?? STATUS_CHIP.operational;

  return (
    <SlidePanel
      open={!!item}
      onClose={onClose}
      title={item.name}
      subtitle={`${item.roomNumber !== 'N/A' ? `Room ${item.roomNumber} · ` : ''}${hotel?.shortName ?? item.hotelId}`}
      backLabel={backLabel}
      onBack={onBack}
    >
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Condition row + Quick actions */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Condition</p>
              <div className="mt-0.5"><ConditionBadge condition={item.condition} /></div>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Status</p>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 capitalize"
                style={{ background: statusChip.bg, color: statusChip.color }}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: '#ff385c', color: '#ffffff' }}
              onClick={() => alert('Repair ticket created (mock)')}
            >
              <Wrench className="w-3.5 h-3.5" /> Report repair
            </button>
            <button
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: '#ffffff', color: '#222', border: '1px solid #dddddd' }}
              onClick={() => alert('Preventive task scheduled (mock)')}
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule maintenance
            </button>
          </div>
        </div>

        {/* Lifecycle bars */}
        {(warrantyPct !== null || lifePct !== null) && (
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#fafafa', border: '1px solid #ebebeb' }}>
            {warrantyPct !== null && (
              <LifecycleBar
                label="Warranty coverage"
                pct={warrantyPct}
                hint={daysToWarrantyEnd !== null && daysToWarrantyEnd > 0
                  ? `Warranty expires ${fmtDate(item.warrantyEnd!)} · ${daysToWarrantyEnd} days left`
                  : `Warranty ended ${fmtDate(item.warrantyEnd!)}`}
              />
            )}
            {lifePct !== null && (
              <LifecycleBar
                label="Useful life"
                pct={lifePct}
                hint={`First use ${fmtDate(item.firstUseDate!)} · end of life ${fmtDate(item.endOfLifeDate!)}`}
              />
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'details', label: 'Asset details' },
            { id: 'tasks', label: 'Tasks', count: upcoming.length + item.history.length },
            { id: 'measurements', label: 'Measurements' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as typeof tab)}
        />

        {/* Tab content */}
        {tab === 'details' && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <SectionHeader>General</SectionHeader>
            <Row label="Asset type" value={item.name} />
            <Row label="Category" value={<span className="capitalize">{item.category}</span>} />
            <Row label="Status" value={<span className="capitalize">{statusLabel}</span>} />
            <Row label="Location" value={item.location ?? '—'} />
            <Row label="Counter type" value={item.counterType ?? '—'} />
            <Row label="Counter unit" value={item.counterUnit ?? '—'} />

            <SectionHeader>Asset details</SectionHeader>
            <Row label="Description" value={<span className="leading-relaxed">{item.description ?? '—'}</span>} />
            <Row label="Manufacturer" value={item.manufacturer ?? '—'} />
            <Row label="Model" value={item.model ?? '—'} />
            <Row label="Serial number" value={<span className="font-mono text-[12px]">{item.serialNumber ?? '—'}</span>} />
            <Row label="First use date" value={item.firstUseDate ? fmtDate(item.firstUseDate) : '—'} />
            <Row label="End of life" value={item.endOfLifeDate ? fmtDate(item.endOfLifeDate) : '—'} />

            <SectionHeader>Purchase details</SectionHeader>
            <Row label="Supplier" value={item.supplier ?? '—'} />
            <Row label="Purchase cost" value={item.purchaseCost !== undefined ? `$${item.purchaseCost.toLocaleString()}` : '—'} />
            <Row label="Purchase date" value={item.purchaseDate ? fmtDate(item.purchaseDate) : '—'} />
            <Row label="Warranty end" value={item.warrantyEnd ? fmtDate(item.warrantyEnd) : '—'} />
            <Row label="Replace cost" value={`$${item.replacementCost.toLocaleString()}`} />

            {item.attachments && item.attachments.length > 0 && (
              <>
                <SectionHeader>Attachments · {item.attachments.length}</SectionHeader>
                <div className="p-3 flex flex-col gap-2">
                  {item.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: '#ffffff', border: '1px solid #dddddd' }}
                      >
                        <FileText className="w-4 h-4" style={{ color: '#b91c1c' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{a.name}</p>
                        <p className="text-[11px]" style={{ color: '#929292' }}>
                          {a.type.toUpperCase()} · {a.sizeKb.toLocaleString()} KB
                        </p>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${a.name} (mock)`)}
                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-semibold"
                        style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="flex flex-col gap-5">
            {/* Cost summary */}
            <div className="grid grid-cols-3 gap-3 rounded-xl p-4" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#222222' }}>{item.repairCount}</p>
                <p className="text-xs" style={{ color: '#929292' }}>Repairs</p>
              </div>
              <div className="text-center" style={{ borderLeft: '1px solid #dddddd', borderRight: '1px solid #dddddd' }}>
                <p className="text-lg font-bold" style={{ color: item.totalRepairCost > 0 ? '#c0392b' : '#15803d' }}>
                  ${item.totalRepairCost.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#929292' }}>Total repair spend</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: '#222222' }}>${item.replacementCost.toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#929292' }}>Replace cost</p>
              </div>
            </div>

            {/* Replacement recommendation */}
            {(repairThresholdExceeded || costRatio > 0.5) && (
              <div className="rounded-xl p-4 flex gap-3" style={{ background: '#fff8f0', border: '1px solid #fcd8a8' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#b45309' }}>Replacement recommended</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6a6a6a' }}>
                    {repairThresholdExceeded ? `This item has ${item.repairCount} repairs — above the 3-repair threshold. ` : ''}
                    {costRatio > 0.5 ? `Repair spend ($${item.totalRepairCost.toLocaleString()}) is ${Math.round(costRatio * 100)}% of replacement cost. ` : ''}
                    Replacement delivers better long-term value.
                  </p>
                </div>
              </div>
            )}

            {/* Upcoming tasks */}
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Upcoming</p>
                <div className="flex flex-col gap-2">
                  {upcoming.map((u, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2 flex items-center gap-3"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#1d4ed8' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#1e3a8a' }}>{u.label}</p>
                        <p className="text-xs" style={{ color: '#1e40af' }}>Due {fmtDate(u.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: '#929292' }}>
                <TrendingUp className="w-3.5 h-3.5" />
                History · {item.history.length}
              </p>
              <div className="flex flex-col gap-0">
                {item.history.map((entry, i) => (
                  <div key={i} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm leading-none">{HISTORY_ICON[entry.type]}</span>
                      {i < item.history.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: '#ebebeb', minHeight: 16 }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-0.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-semibold capitalize" style={{ color: HISTORY_COLOR[entry.type] }}>{entry.type}</span>
                        <span className="text-xs" style={{ color: '#929292' }}>{fmtDate(entry.date)}</span>
                        {entry.cost !== undefined && entry.cost > 0 && (
                          <span className="text-xs font-semibold ml-auto" style={{ color: '#c0392b' }}>${entry.cost.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: '#333' }}>{entry.description}</p>
                      {entry.technician && (
                        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>By {entry.technician}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'measurements' && (
          <div>
            {item.readings && item.readings.length > 0 ? (
              <div className="rounded-xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-4 h-4" style={{ color: '#2563eb' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#222' }}>
                      {item.counterType} · {item.counterUnit}
                    </p>
                    <p className="text-xs" style={{ color: '#929292' }}>Last {item.readings.length} readings</p>
                  </div>
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end gap-0.5 h-20 mb-2">
                  {[...item.readings].reverse().map((r, i) => {
                    const values = item.readings!.map((x) => x.value);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const pct = max === min ? 50 : ((r.value - min) / (max - min)) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ height: `${Math.max(8, pct)}%`, background: '#60a5fa' }}
                        title={`${fmtDate(r.date)} · ${r.value}${item.counterUnit === 'Celsius' ? '°C' : ''}`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold" style={{ color: '#929292' }}>Latest</p>
                    <p className="text-sm font-bold" style={{ color: '#222' }}>
                      {item.readings[0].value}{item.counterUnit === 'Celsius' ? '°C' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold" style={{ color: '#929292' }}>Min</p>
                    <p className="text-sm font-bold" style={{ color: '#15803d' }}>
                      {Math.min(...item.readings.map((r) => r.value))}{item.counterUnit === 'Celsius' ? '°C' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold" style={{ color: '#929292' }}>Max</p>
                    <p className="text-sm font-bold" style={{ color: '#b45309' }}>
                      {Math.max(...item.readings.map((r) => r.value))}{item.counterUnit === 'Celsius' ? '°C' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-6 text-center" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <Gauge className="w-6 h-6 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
                <p className="text-sm font-semibold" style={{ color: '#6a6a6a' }}>No sensors attached to this asset</p>
                <p className="text-xs mt-1" style={{ color: '#929292' }}>Install a meter to track readings over time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </SlidePanel>
  );
}
