'use client';

import { AuditsClient } from '@/components/audits/AuditsClient';
import { useScopedData } from '@/lib/use-scoped-data';

export default function Page() {
  const { scopeSub, hotels, isPortfolio, selection } = useScopedData();
  const hotelIds = isPortfolio ? undefined : hotels.map((h) => h.id);
  // Single hotel selected up top → open that hotel's room grid directly. Driven
  // by `selection` (immediate) rather than `hotels` (gated on data loading).
  const initialHotelId = selection.kind === 'single' ? selection.hotelId : undefined;
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Audits</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Compliance tracking · audit history · item replacements</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AuditsClient hotelIds={hotelIds} initialHotelId={initialHotelId} />
      </div>
    </div>
  );
}
