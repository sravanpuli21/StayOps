'use client';

import { useMemo, useState } from 'react';
import {
  getAreaAuditRecords, getRoomItemHistory, AUDIT_AREA_DEFS,
} from '@hos/shared';
import type { AuditAreaId, AreaAuditRecord, ItemReplacementRecord } from '@hos/shared';
import { SlidePanel } from '../operations/SlidePanel';
import {
  CheckCircle2, AlertTriangle, XCircle, Wrench, RefreshCw,
  Search, MessageSquare, Image as ImageIcon, ChevronDown,
} from 'lucide-react';

// ── Smart timestamp ────────────────────────────────────────────────────────────

const REF = new Date('2026-04-27T14:00:00Z').getTime();

function timeAgo(iso: string): string {
  const diff = REF - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fullDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ── Score chip ─────────────────────────────────────────────────────────────────

function ScoreChip({ score, result }: { score: number; result: AreaAuditRecord['result'] }) {
  const cfg = {
    pass:             { color: '#15803d', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle2 },
    needs_attention:  { color: '#b45309', bg: 'rgba(245,158,11,0.12)',  icon: AlertTriangle },
    fail:             { color: '#b91c1c', bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
  }[result];
  const Icon = cfg.icon;
  return (
    <span
      className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {score}/100 · {result === 'pass' ? 'Pass' : result === 'fail' ? 'Fail' : 'Attention'}
    </span>
  );
}

// ── Image grid ─────────────────────────────────────────────────────────────────

function ImageGrid({ images }: { images: AreaAuditRecord['images'] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (images.length === 0) return null;
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mt-2.5">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setLightbox(img.url)}
            className="relative rounded-xl overflow-hidden group"
            style={{ aspectRatio: '4/3', background: '#ebebeb' }}
          >
            <img
              src={img.url}
              alt={img.caption}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {img.type === 'issue' && (
              <span
                className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
              >
                Issue
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: '#929292' }}>{images[0].caption}</p>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-8"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Audit photo"
            className="max-w-full max-h-full rounded-2xl object-contain"
            style={{ maxWidth: '80vw', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-6 right-6 text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

// ── Audit record card ──────────────────────────────────────────────────────────

function AuditRecordCard({ record, isFirst }: { record: AreaAuditRecord; isFirst: boolean }) {
  const [expanded, setExpanded] = useState(isFirst);

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-3.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
        style={{
          background: record.result === 'pass' ? '#22c55e' : record.result === 'fail' ? '#ef4444' : '#f59e0b',
          borderColor: '#ffffff',
          boxShadow: '0 0 0 2px ' + (record.result === 'pass' ? '#22c55e' : record.result === 'fail' ? '#ef4444' : '#f59e0b'),
        }}
      />

      <div
        className="rounded-2xl overflow-hidden mb-4"
        style={{ border: '1px solid #ebebeb', background: '#ffffff' }}
      >
        <button
          className="w-full text-left px-4 py-3.5 flex items-start gap-3"
          onClick={() => setExpanded((x) => !x)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <ScoreChip score={record.score} result={record.result} />
              {record.images.length > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: '#929292' }}>
                  <ImageIcon className="w-3 h-3" />
                  {record.images.length} photo{record.images.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: '#222222' }}>{record.auditorName}</span>
              <span className="text-xs" style={{ color: '#929292' }} title={fullDateTime(record.completedAt)}>
                {timeAgo(record.completedAt)}
              </span>
              <span className="text-xs" style={{ color: '#c1c1c1' }}>·</span>
              <span className="text-xs" style={{ color: '#929292' }}>{fullDateTime(record.completedAt)}</span>
            </div>
          </div>
          <ChevronDown
            className="w-4 h-4 flex-shrink-0 mt-1 transition-transform"
            style={{ color: '#929292', transform: expanded ? 'rotate(180deg)' : undefined }}
          />
        </button>

        {expanded && (
          <div className="px-4 pb-4" style={{ borderTop: '1px solid #f5f5f5' }}>
            {record.findings.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-1.5 mb-2">
                {record.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#444444' }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm mt-3 mb-2" style={{ color: '#6a6a6a' }}>No findings — all items within spec.</p>
            )}
            <ImageGrid images={record.images} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Item replacement event ─────────────────────────────────────────────────────

function ItemEventRow({ event }: { event: ItemReplacementRecord }) {
  const Icon = event.type === 'replacement' ? RefreshCw : event.type === 'repair' ? Wrench : Search;
  const color = event.type === 'replacement' ? '#1d4ed8' : event.type === 'repair' ? '#b45309' : '#6a6a6a';
  return (
    <div className="relative pl-8 mb-3">
      <div
        className="absolute left-0 top-3 w-3.5 h-3.5 rounded-full flex items-center justify-center"
        style={{ background: color + '22', border: `2px solid ${color}` }}
      >
        <Icon className="w-2 h-2" style={{ color }} />
      </div>
      <div
        className="rounded-xl px-4 py-3"
        style={{ border: '1px solid #ebebeb', background: '#fafafa' }}
      >
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: color + '15', color }}
          >
            {event.type}
          </span>
          <span className="text-xs font-semibold" style={{ color: '#222222' }}>{event.itemName}</span>
        </div>
        <p className="text-sm" style={{ color: '#444444' }}>{event.description}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs" style={{ color: '#929292' }} title={fullDateTime(event.date)}>
            {timeAgo(event.date)}
          </span>
          {event.technician && (
            <span className="text-xs" style={{ color: '#929292' }}>by {event.technician}</span>
          )}
          {event.cost !== undefined && event.cost > 0 && (
            <span className="text-xs font-semibold" style={{ color: '#ff385c' }}>${event.cost.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

interface Props {
  hotelId: string | null;
  roomNumber: string | null;
  areaId: AuditAreaId | null;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
}

type HistoryTab = 'audits' | 'items';

export function AreaHistoryPanel({ hotelId, roomNumber, areaId, onClose, backLabel, onBack }: Props) {
  const [tab, setTab] = useState<HistoryTab>('audits');

  const records = useMemo(() => {
    if (!hotelId || !roomNumber || !areaId) return [];
    return getAreaAuditRecords(hotelId, roomNumber, areaId);
  }, [hotelId, roomNumber, areaId]);

  const itemHistory = useMemo(() => {
    if (!hotelId || !roomNumber) return [];
    return getRoomItemHistory(hotelId, roomNumber);
  }, [hotelId, roomNumber]);

  if (!hotelId || !roomNumber || !areaId) return null;
  const def = AUDIT_AREA_DEFS[areaId];

  return (
    <SlidePanel
      open={true}
      onClose={onClose}
      title={def.label}
      subtitle={`Room ${roomNumber} · ${def.frequencyLabel} · ${records.length} records`}
      backLabel={backLabel}
      onBack={onBack}
    >
      {/* Tab bar */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}>
          {([
            { id: 'audits' as HistoryTab, label: `Audit History (${records.length})` },
            { id: 'items' as HistoryTab, label: `Item Events (${itemHistory.length})` },
          ]).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#222222' : '#929292',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                  border: active ? '1px solid #ebebeb' : '1px solid transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === 'audits' && (
          <div className="relative">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[6px] top-4 bottom-4 w-px"
              style={{ background: '#ebebeb' }}
            />
            {records.map((rec, i) => (
              <AuditRecordCard key={rec.id} record={rec} isFirst={i === 0} />
            ))}
          </div>
        )}

        {tab === 'items' && (
          <div className="relative">
            <div
              className="absolute left-[6px] top-4 bottom-4 w-px"
              style={{ background: '#ebebeb' }}
            />
            {itemHistory.length === 0
              ? <p className="text-sm py-6 text-center" style={{ color: '#929292' }}>No item events recorded.</p>
              : itemHistory.map((ev, i) => (
                  <ItemEventRow key={i} event={ev} />
                ))
            }
          </div>
        )}
      </div>
    </SlidePanel>
  );
}
