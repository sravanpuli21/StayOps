'use client';

import { useState } from 'react';
import { BookOpen, ChevronRight, AlertCircle, X, Check, Clock } from 'lucide-react';
import { type SopItem } from '@hos/shared';
import { useSravanSops } from '@/lib/sravan-data';

const CATEGORY_COLORS: Record<SopItem['category'], { bg: string; fg: string }> = {
  'Check-in':       { bg: '#e0e7ff', fg: '#3730a3' },
  'Check-out':      { bg: '#fce7f3', fg: '#9d174d' },
  'Cash':           { bg: '#fef3c7', fg: '#b45309' },
  'Safety':         { bg: '#fee2e2', fg: '#b91c1c' },
  'Guest Service':  { bg: '#d1fae5', fg: '#047857' },
  'Systems':        { bg: '#e0f2fe', fg: '#075985' },
};

export default function SravanSopPage() {
  const SRAVAN_SOPS = useSravanSops() as SopItem[];
  const [openSop, setOpenSop] = useState<SopItem | null>(null);
  const [acked, setAcked] = useState<Set<string>>(new Set());

  const grouped = SRAVAN_SOPS.reduce<Record<string, SopItem[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  const required = SRAVAN_SOPS.filter((s) => s.required).length;
  const requiredAcked = SRAVAN_SOPS.filter((s) => s.required && acked.has(s.id)).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>SOP Library</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SRAVAN_SOPS.length} standard operating procedures · {required} required for front desk
        </p>
      </div>

      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#b45309' }} />
        <p className="text-xs" style={{ color: '#78350f' }}>
          Required SOPs must be read &amp; acknowledged annually.{' '}
          <strong>{requiredAcked} of {required}</strong> acknowledged this session.
        </p>
      </div>

      {categories.map((cat) => {
        const items = grouped[cat];
        const c = CATEGORY_COLORS[cat as SopItem['category']];
        return (
          <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: c.bg, color: c.fg }}
              >
                {cat}
              </span>
              <span className="text-xs" style={{ color: '#929292' }}>{items.length} items</span>
            </div>
            <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setOpenSop(s)}
                  className="w-full px-5 py-3 flex items-center justify-between text-left transition-colors hover:bg-[#fafafa]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#222222' }}>{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                        Updated {s.updatedAt} · {s.minutesToRead} min read
                      </p>
                    </div>
                    {acked.has(s.id) && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 inline-flex items-center gap-1"
                        style={{ background: '#dcfce7', color: '#15803d' }}
                      >
                        <Check className="w-3 h-3" /> Read
                      </span>
                    )}
                    {s.required && !acked.has(s.id) && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: '#fee2e2', color: '#b91c1c' }}
                      >
                        Required
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 ml-3" style={{ color: '#c1c1c1' }} />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {openSop && (
        <SopReaderModal
          sop={openSop}
          acked={acked.has(openSop.id)}
          onAck={() => setAcked((prev) => new Set(prev).add(openSop.id))}
          onClose={() => setOpenSop(null)}
        />
      )}
    </div>
  );
}

function SopReaderModal({
  sop, acked, onAck, onClose,
}: { sop: SopItem; acked: boolean; onAck: () => void; onClose: () => void }) {
  const c = CATEGORY_COLORS[sop.category];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
        style={{ border: '1px solid #dddddd' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: c.bg, color: c.fg }}>
                {sop.category}
              </span>
              {sop.required && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  Required
                </span>
              )}
            </div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>{sop.title}</h2>
            <p className="text-xs mt-0.5 inline-flex items-center gap-1" style={{ color: '#929292' }}>
              <Clock className="w-3 h-3" /> {sop.minutesToRead} min read · updated {sop.updatedAt}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto text-sm leading-relaxed flex flex-col gap-3" style={{ color: '#3f3f3f' }}>
          <p style={{ color: '#929292', fontStyle: 'italic' }}>
            Procedure summary — full document is maintained in the property binder and the operations portal.
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-2">
            <li>Review the scope of this procedure and confirm it applies to your current shift and station.</li>
            <li>Follow each step in order. Do not skip verification checkpoints, especially for cash and safety items.</li>
            <li>Escalate anything outside the standard flow to the GM on duty before improvising.</li>
            <li>Log the action in the front-desk system so the next shift has a clean handover.</li>
          </ol>
          <p>
            This is a demo reader. In production, the full SOP body, screenshots, and revision history render here from the operations portal.
          </p>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          {acked ? (
            <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#15803d' }}>
              <Check className="w-4 h-4" /> Acknowledged
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#929292' }}>
              {sop.required ? 'Acknowledgment required for this SOP.' : 'Optional reference.'}
            </span>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>
              Close
            </button>
            <button
              onClick={() => { onAck(); onClose(); }}
              disabled={acked}
              className="h-9 px-4 rounded-lg text-sm font-semibold transition-opacity"
              style={{ background: '#ff385c', color: '#fff', opacity: acked ? 0.5 : 1 }}
            >
              {acked ? 'Already read' : 'Mark as read'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
