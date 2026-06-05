'use client';

import { Wrench } from 'lucide-react';
import { card } from './_ui';

/** Clean "being built in this product" state so no nav item is ever a broken page. */
export function Placeholder({ title, subtitle, note }: { title: string; subtitle: string; note?: string }) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>{title}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{subtitle}</p>
      </div>
      <div className="rounded-2xl p-12 flex flex-col items-center text-center gap-3" style={{ ...card, borderStyle: 'dashed' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f0eefb' }}>
          <Wrench className="w-6 h-6" style={{ color: '#6a4ec0' }} />
        </div>
        <p className="text-base font-semibold" style={{ color: '#222' }}>{title} is coming together</p>
        <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>{note ?? 'This screen is part of StayOps Accounting OS and is being built in this product. Check back shortly.'}</p>
      </div>
    </div>
  );
}
