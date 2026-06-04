'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CRM_OPPORTUNITIES, OPP_STAGES, OPP_STAGE_LABEL, OPP_KIND_LABEL,
  type OppKind, type OppStage,
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
  const [kind, setKind] = useState<OppKind | 'all'>('all');
  const items = CRM_OPPORTUNITIES.filter((o) => kind === 'all' || o.kind === kind);
  const open = items.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const totalValue = open.reduce((s, o) => s + o.estValue, 0);

  // Group by stage for a pipeline view.
  const stages = OPP_STAGES.filter((s) => s !== 'won' && s !== 'lost');

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Opportunities</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {open.length} open · {fmtMoneyFull(totalValue)} potential
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

      {/* Pipeline by stage */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const col = items.filter((o) => o.stage === stage);
          const val = col.reduce((s, o) => s + o.estValue, 0);
          return (
            <div key={stage} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: STAGE_STYLE[stage].fg }}>
                  {OPP_STAGE_LABEL[stage]}
                </span>
                <span className="text-[11px]" style={{ color: '#929292' }}>{col.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {col.length === 0 ? (
                  <div className="rounded-xl px-3 py-6 text-center text-xs" style={{ border: '1px dashed #dddddd', color: '#c1c1c1' }}>—</div>
                ) : col.map((o) => {
                  const k = KIND_STYLE[o.kind];
                  return (
                    <Link key={o.id} href={`/web/kwanisha/accounts/${o.accountId}`} className="p-3.5 flex flex-col gap-2" style={card}>
                      <Badge label={k.label} fg={k.fg} bg={k.bg} />
                      <p className="text-sm font-semibold" style={{ color: '#222' }}>{o.accountName}</p>
                      <p className="text-xs" style={{ color: '#6a6a6a' }}>{o.title}</p>
                      <p className="text-[11px]" style={{ color: '#929292' }}>{o.signal}</p>
                      <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid #f0f0f0' }}>
                        <span className="text-sm font-bold" style={{ color: '#222' }}>{fmtMoneyFull(o.estValue)}</span>
                        <span className="text-[11px]" style={{ color: '#929292' }}>{o.estRooms} rm · {o.confidence}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
