'use client';

import { BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
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
  const grouped = SRAVAN_SOPS.reduce<Record<string, SopItem[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  const required = SRAVAN_SOPS.filter((s) => s.required).length;

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
          Required SOPs must be read & acknowledged annually. You have <strong>{required} required</strong> items.
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
                    {s.required && (
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
    </div>
  );
}
