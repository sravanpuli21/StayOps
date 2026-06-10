'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Building2, Check, LayoutGrid } from 'lucide-react';
import { HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from './_context';

export function EntityDropdown() {
  const { selection, selectAll, selectHotel } = useAcctOs();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = selection.kind === 'all'
    ? { title: 'All Hotels', sub: `${HOTEL_ENTITIES.length} entities` }
    : (() => { const h = HOTEL_ENTITIES.find((x) => x.id === selection.hotelId); return { title: h?.hotelName ?? 'Hotel', sub: h?.legalEntity ?? '' }; })();

  const filtered = HOTEL_ENTITIES.filter((h) => {
    const s = q.toLowerCase();
    return !s || h.hotelName.toLowerCase().includes(s) || h.legalEntity.toLowerCase().includes(s)
      || h.propertyCode.toLowerCase().includes(s) || h.city.toLowerCase().includes(s) || h.manager.toLowerCase().includes(s);
  });

  const oneHotel = selection.kind === 'hotel';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl text-left max-w-[280px]"
        style={{ background: oneHotel ? '#1d4ed8' : '#f7f7f7', border: `1px solid ${oneHotel ? '#1d4ed8' : '#dddddd'}` }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: oneHotel ? 'rgba(255,255,255,0.2)' : '#ece4fb' }}>
          {oneHotel ? <Building2 className="w-3.5 h-3.5" style={{ color: '#fff' }} /> : <LayoutGrid className="w-3.5 h-3.5" style={{ color: '#6a4ec0' }} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate" style={{ color: oneHotel ? '#fff' : '#222' }}>{current.title}</p>
          {!oneHotel && <p className="text-[10px] truncate" style={{ color: '#929292' }}>{current.sub}</p>}
        </div>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: oneHotel ? 'rgba(255,255,255,0.8)' : '#929292' }} />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-[340px] rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <div className="p-2.5" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg" style={{ background: '#f7f7f7' }}>
              <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hotel, legal entity, property code…"
                className="flex-1 bg-transparent text-xs outline-none" style={{ color: '#222' }} />
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <button onClick={() => { selectAll(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ece4fb' }}><LayoutGrid className="w-4 h-4" style={{ color: '#6a4ec0' }} /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>All Hotels</p>
                <p className="text-[11px]" style={{ color: '#929292' }}>Portfolio queues &amp; close status · {HOTEL_ENTITIES.length} entities</p>
              </div>
              {selection.kind === 'all' && <Check className="w-4 h-4" style={{ color: '#6a4ec0' }} />}
            </button>
            {filtered.map((h) => {
              const sel = selection.kind === 'hotel' && selection.hotelId === h.id;
              return (
                <button key={h.id} onClick={() => { selectHotel(h.id); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}><Building2 className="w-4 h-4" style={{ color: '#6a4ec0' }} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{h.hotelName}</p>
                    <p className="text-[11px] truncate" style={{ color: '#929292' }}>{h.legalEntity}</p>
                    <p className="text-[10px]" style={{ color: '#b0b0b0' }}>{h.propertyCode} · {h.city}, {h.state}</p>
                  </div>
                  {sel && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#6a4ec0' }} />}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-xs" style={{ color: '#929292' }}>No hotels match.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
