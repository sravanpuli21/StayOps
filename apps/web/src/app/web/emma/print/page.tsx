'use client';

import { useMemo, useState } from 'react';
import type { Room } from '@hos/shared';
import { EMMA_HOTEL, useHkStaff, useAllHotelRooms, useQueueRooms, seedAssignments, ROOM_TILE } from '@/lib/emma-data';
import { Printer, Globe } from 'lucide-react';

export default function EmmaPrintPage() {
  const hotel = EMMA_HOTEL;
  const hkStaff = useHkStaff();
  const rooms = useAllHotelRooms();
  const queueRooms = useQueueRooms();
  const roomMap = useMemo(() => {
    const m = new Map<string, Room>();
    for (const r of rooms) m.set(r.number, r);
    return m;
  }, [rooms]);

  const assignments = useMemo(
    () => (hkStaff.length > 0 && queueRooms.length > 0 ? seedAssignments(hkStaff, queueRooms) : []),
    [hkStaff, queueRooms],
  );
  const [bilingual, setBilingual] = useState(true);

  const perStaff = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of assignments) {
      for (const id of a.assignees) {
        if (!m.has(id)) m.set(id, []);
        m.get(id)!.push(a.roomNumber);
      }
    }
    return m;
  }, [assignments]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Print Assignment Sheets</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {hotel.shortName} · {today} · one sheet per staff member
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBilingual((v) => !v)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: bilingual ? '#222' : '#ffffff', color: bilingual ? '#ffffff' : '#6a6a6a', border: '1px solid #dddddd' }}
          >
            <Globe className="w-3.5 h-3.5" />
            {bilingual ? 'EN + ES' : 'EN only'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print all sheets
          </button>
        </div>
      </div>

      {/* Sheets — each in its own print-break wrapper */}
      <div className="flex flex-col gap-5">
        {hkStaff.map((emp) => {
          const myRooms = (perStaff.get(emp.id) ?? [])
            .map((n) => roomMap.get(n))
            .filter((r): r is Room => !!r)
            .sort((a, b) => a.floor - b.floor || a.number.localeCompare(b.number));
          return (
            <div
              key={emp.id}
              className="print-sheet rounded-2xl p-6"
              style={{ background: '#ffffff', border: '1px solid #dddddd', breakInside: 'avoid', pageBreakAfter: 'always' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4" style={{ borderBottom: '2px solid #222' }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#929292' }}>
                    Housekeeping Assignment Sheet · {bilingual && 'Hoja de Asignación de Limpieza · '}{today}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#222' }}>{emp.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>
                    {emp.role} · {hotel.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: '#929292' }}>
                    {bilingual ? 'Rooms / Habitaciones' : 'Rooms'}
                  </p>
                  <p className="text-4xl font-black" style={{ color: '#222' }}>{myRooms.length}</p>
                </div>
              </div>

              {/* Shift info */}
              <div className="flex items-center gap-6 mt-3 pb-3 text-xs" style={{ color: '#6a6a6a', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <span className="font-bold" style={{ color: '#222' }}>Supervisor{bilingual && ' / Supervisor'}:</span> Emma Johnson
                </div>
                <div>
                  <span className="font-bold" style={{ color: '#222' }}>Phone{bilingual && ' / Teléfono'}:</span> {emp.phone ?? '—'}
                </div>
                <div>
                  <span className="font-bold" style={{ color: '#222' }}>Max hrs{bilingual && ' / Horas máx'}:</span> {emp.maxHoursWeek}h/wk
                </div>
              </div>

              {/* Rooms table */}
              {myRooms.length === 0 ? (
                <div className="py-6 text-center text-sm" style={{ color: '#929292' }}>
                  No rooms assigned today.{bilingual && ' / Sin habitaciones asignadas hoy.'}
                </div>
              ) : (
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #dddddd' }}>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        ✓
                      </th>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        Room{bilingual && ' / Habitación'}
                      </th>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        Floor{bilingual && ' / Piso'}
                      </th>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        Type{bilingual && ' / Tipo'}
                      </th>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        Status{bilingual && ' / Estado'}
                      </th>
                      <th className="text-left py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                        Notes{bilingual && ' / Notas'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRooms.map((r, i) => {
                      const cfg = ROOM_TILE[r.status];
                      return (
                        <tr key={r.id} style={{ borderBottom: i < myRooms.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                          <td className="py-3" style={{ width: 32 }}>
                            <div className="w-5 h-5 rounded border-2" style={{ borderColor: '#222' }} />
                          </td>
                          <td className="py-3 text-base font-bold" style={{ color: '#222' }}>{r.number}</td>
                          <td className="py-3 text-sm" style={{ color: '#6a6a6a' }}>{r.floor}</td>
                          <td className="py-3 text-sm" style={{ color: '#6a6a6a' }}>{r.type}</td>
                          <td className="py-3">
                            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}{bilingual && ` / ${cfg.esp}`}
                            </span>
                          </td>
                          <td className="py-3 text-xs" style={{ color: '#6a6a6a' }}>
                            {r.hasOpenTicket && (bilingual ? 'Ticket abierto · ' : 'Ticket · ')}
                            {r.oooReason ?? ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Checklist summary */}
              <div className="mt-5 pt-4 flex items-center gap-6" style={{ borderTop: '1px solid #f0f0f0' }}>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: '#929292' }}>
                    {bilingual ? 'Cleaning Protocol / Protocolo de Limpieza' : 'Cleaning Protocol'}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6a6a6a' }}>
                    1. Strip & remake beds · 2. Empty trash · 3. Clean bathroom · 4. Dust surfaces · 5. Vacuum · 6. Inspect
                    {bilingual && <><br />1. Deshacer & hacer camas · 2. Vaciar basura · 3. Limpiar baño · 4. Desempolvar · 5. Aspirar · 6. Inspeccionar</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: '#929292' }}>
                    {bilingual ? 'Signature / Firma' : 'Signature'}
                  </p>
                  <div className="mt-6 w-48 h-px" style={{ background: '#222' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print styles — force one sheet per page for assignment sheets */}
      <style jsx global>{`
        @media print {
          .print-sheet {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: always;
          }
          .print-sheet:last-child { page-break-after: auto; }
        }
      `}</style>
    </div>
  );
}
