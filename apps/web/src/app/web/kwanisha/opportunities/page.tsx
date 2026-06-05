'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CRM_OPPORTUNITIES, OPP_STAGES, OPP_STAGE_LABEL,
  type OppKind, type OppStage, type Opportunity,
} from '@hos/shared';
import { fmtMoneyFull, Badge, KIND_STYLE, STAGE_STYLE, card } from '../_ui';

const KIND_FILTERS: Array<{ key: OppKind | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'rebook-due', label: 'Rebook due' },
  { key: 'win-back', label: 'Win back' },
  { key: 'grow', label: 'Grow' },
  { key: 'new-lead', label: 'New leads' },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [kind, setKind] = useState<OppKind | 'all'>('all');
  // Stages are editable via drag-and-drop, so opportunities live in state.
  const [opps, setOpps] = useState<Opportunity[]>(CRM_OPPORTUNITIES);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<OppStage | null>(null);

  const items = opps.filter((o) => kind === 'all' || o.kind === kind);
  const open = items.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const totalValue = open.reduce((s, o) => s + o.estValue, 0);

  const moveTo = (id: string, stage: OppStage) =>
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));

  const onDrop = (stage: OppStage) => {
    if (dragId) moveTo(dragId, stage);
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Opportunities</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {open.length} open · {fmtMoneyFull(totalValue)} potential · drag cards to move stage
        </p>
      </div>

      {/* Kind filter */}
      <div className="flex gap-2 flex-wrap">
        {KIND_FILTERS.map((f) => {
          const on = f.key === kind;
          return (
            <button key={f.key} onClick={() => setKind(f.key)}
              className="h-8 px-3.5 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Pipeline board — horizontally scrollable */}
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {OPP_STAGES.map((stage) => {
            const col = items.filter((o) => o.stage === stage);
            const val = col.reduce((s, o) => s + o.estValue, 0);
            const isOver = overStage === stage;
            const isClosed = stage === 'won' || stage === 'lost';
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                onDragLeave={(e) => { if (e.currentTarget === e.target) setOverStage(null); }}
                onDrop={() => onDrop(stage)}
                className="flex flex-col gap-3 rounded-2xl p-2 transition-colors"
                style={{
                  width: 260, flexShrink: 0,
                  background: isOver ? '#faf7ff' : 'transparent',
                  outline: isOver ? '2px dashed #7c3aed' : '2px dashed transparent',
                }}
              >
                <div className="flex items-center justify-between px-1.5 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: STAGE_STYLE[stage].fg }}>
                    {OPP_STAGE_LABEL[stage]}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: '#929292' }}>
                    {col.length}{val > 0 ? ` · ${fmtMoneyFull(val)}` : ''}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-h-[60px]">
                  {col.length === 0 ? (
                    <div className="rounded-xl px-3 py-6 text-center text-xs" style={{ border: '1px dashed #e0e0e0', color: '#c1c1c1' }}>
                      {isOver ? 'Drop here' : isClosed ? '—' : 'Drag here'}
                    </div>
                  ) : col.map((o) => {
                    const k = KIND_STYLE[o.kind];
                    const dragging = dragId === o.id;
                    return (
                      <div
                        key={o.id}
                        draggable
                        onDragStart={(e) => { setDragId(o.id); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => { setDragId(null); setOverStage(null); }}
                        onClick={() => router.push(`/web/kwanisha/accounts/${o.accountId}`)}
                        className="p-3.5 flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md"
                        style={{ ...card, opacity: dragging ? 0.4 : 1 }}
                      >
                        <Badge label={k.label} fg={k.fg} bg={k.bg} />
                        <p className="text-sm font-semibold" style={{ color: '#222' }}>{o.accountName}</p>
                        <p className="text-xs" style={{ color: '#6a6a6a' }}>{o.title}</p>
                        <p className="text-[11px]" style={{ color: '#929292' }}>{o.signal}</p>
                        <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid #f0f0f0' }}>
                          <span className="text-sm font-bold" style={{ color: '#222' }}>{fmtMoneyFull(o.estValue)}</span>
                          <span className="text-[11px]" style={{ color: '#929292' }}>{o.estRooms} rm · {o.confidence}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
