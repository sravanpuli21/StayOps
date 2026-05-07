'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, Globe, Printer } from 'lucide-react';
import { EMMA_HOTEL } from '@/lib/emma-data';

interface SopStep { en: string; es: string; }
interface Sop {
  id: string;
  titleEn: string;
  titleEs: string;
  summaryEn: string;
  summaryEs: string;
  durationMinutes: number;
  steps: SopStep[];
}

const SOPS: Sop[] = [
  {
    id: 'checkout',
    titleEn: 'Checkout cleaning',
    titleEs: 'Limpieza de salida',
    summaryEn: 'Full turnover clean when a guest has checked out. Target time: 30–35 min.',
    summaryEs: 'Limpieza completa después de la salida del huésped. Tiempo objetivo: 30–35 min.',
    durationMinutes: 32,
    steps: [
      { en: 'Knock, announce "Housekeeping", wait 10s before entering.',        es: 'Tocar, anunciar "Housekeeping", esperar 10s antes de entrar.' },
      { en: 'Open curtains, turn on lights, inspect for damage or lost items.', es: 'Abrir cortinas, encender luces, inspeccionar daños u objetos olvidados.' },
      { en: 'Strip all bed linens and towels; deliver to laundry cart.',        es: 'Retirar toda la ropa de cama y toallas; llevar al carrito de lavandería.' },
      { en: 'Empty all trash bins and replace liners.',                         es: 'Vaciar todos los basureros y reemplazar las bolsas.' },
      { en: 'Clean and sanitize bathroom: toilet, shower, sink, mirror, floor.', es: 'Limpiar y desinfectar baño: inodoro, ducha, lavabo, espejo, piso.' },
      { en: 'Remake bed with fresh linens, military corners, 4 pillows.',       es: 'Hacer la cama con ropa limpia, esquinas militares, 4 almohadas.' },
      { en: 'Dust all surfaces: nightstands, desk, TV stand, lamps.',           es: 'Desempolvar todas las superficies: mesitas, escritorio, mueble TV, lámparas.' },
      { en: 'Restock amenities: coffee, cups, soap, shampoo, toilet paper.',    es: 'Reponer amenidades: café, vasos, jabón, champú, papel higiénico.' },
      { en: 'Vacuum carpet starting from far corner back to the door.',         es: 'Aspirar la alfombra desde la esquina más lejana hacia la puerta.' },
      { en: 'Spray air freshener, check HVAC setpoint (72°F / 22°C).',          es: 'Rociar ambientador, verificar la temperatura (72°F / 22°C).' },
      { en: 'Mark room ready in app and radio Emma for inspection.',            es: 'Marcar habitación lista en la app y avisar a Emma por radio.' },
    ],
  },
  {
    id: 'stayover',
    titleEn: 'Stayover cleaning',
    titleEs: 'Limpieza de permanencia',
    summaryEn: 'Lighter daily clean for rooms still occupied. Target time: 15–20 min.',
    summaryEs: 'Limpieza diaria más ligera para habitaciones aún ocupadas. Tiempo objetivo: 15–20 min.',
    durationMinutes: 18,
    steps: [
      { en: 'Confirm no "Do Not Disturb" sign; knock and announce.',            es: 'Confirmar que no hay letrero "No molestar"; tocar y anunciar.' },
      { en: 'Do NOT move guest belongings — clean around them.',                es: 'NO mover las pertenencias del huésped — limpiar alrededor.' },
      { en: 'Change used towels only (leave folded towels).',                   es: 'Cambiar solo las toallas usadas (dejar las dobladas).' },
      { en: 'Make bed with existing linens unless stained.',                    es: 'Hacer la cama con la ropa existente a menos que esté manchada.' },
      { en: 'Empty trash, clean bathroom, restock consumed amenities.',         es: 'Vaciar basura, limpiar baño, reponer amenidades consumidas.' },
      { en: 'Dust visible surfaces, quick vacuum high-traffic areas.',          es: 'Desempolvar superficies visibles, aspirar áreas de alto tráfico.' },
      { en: 'Mark stayover complete in app.',                                    es: 'Marcar permanencia completa en la app.' },
    ],
  },
  {
    id: 'deep',
    titleEn: 'Deep clean',
    titleEs: 'Limpieza profunda',
    summaryEn: 'Scheduled deep clean — monthly rotation or post-incident. Target time: 60–90 min.',
    summaryEs: 'Limpieza profunda programada — rotación mensual o después de incidente. Tiempo objetivo: 60–90 min.',
    durationMinutes: 75,
    steps: [
      { en: 'All checkout steps, plus:',                                         es: 'Todos los pasos de salida, más:' },
      { en: 'Steam-clean carpet spots and high-traffic zones.',                  es: 'Limpiar con vapor manchas en alfombra y zonas de alto tráfico.' },
      { en: 'Remove and wash curtains, dust blinds and tracks.',                 es: 'Retirar y lavar cortinas, desempolvar persianas y rieles.' },
      { en: 'Deep-sanitize bathroom grout, descale faucets and showerheads.',   es: 'Desinfectar a fondo lechada, descalcificar grifos y cabezales de ducha.' },
      { en: 'Flip/rotate mattress, vacuum box spring and bed skirt.',            es: 'Voltear/rotar colchón, aspirar somier y faldón de cama.' },
      { en: 'Clean HVAC vent covers, inspect filter (swap if >90 days).',       es: 'Limpiar rejillas de ventilación, revisar filtro (reemplazar si >90 días).' },
      { en: 'Wipe down all walls below 6 ft, inspect for scuffs to touch-up.',  es: 'Limpiar paredes hasta 6 pies, inspeccionar marcas para retocar.' },
      { en: 'Report any maintenance findings via in-app ticket.',                es: 'Reportar cualquier hallazgo de mantenimiento por ticket en la app.' },
    ],
  },
  {
    id: 'inspection',
    titleEn: 'Room inspection',
    titleEs: 'Inspección de habitación',
    summaryEn: 'Emma\'s walkthrough before marking room "Ready". Target time: 3–5 min.',
    summaryEs: 'Recorrido de Emma antes de marcar "Listo". Tiempo objetivo: 3–5 min.',
    durationMinutes: 4,
    steps: [
      { en: 'Bed: crisp corners, 4 pillows, no stray hair, no wrinkles.',       es: 'Cama: esquinas firmes, 4 almohadas, sin pelos, sin arrugas.' },
      { en: 'Bathroom: mirror streak-free, toilet 45° open, fresh towels.',    es: 'Baño: espejo sin rayas, inodoro a 45°, toallas frescas.' },
      { en: 'Amenities: complete — coffee, cups, soap, shampoo, toiletries.',  es: 'Amenidades: completas — café, vasos, jabón, champú, artículos.' },
      { en: 'Scent check — air should smell clean, not chemical.',              es: 'Olor — el aire debe oler limpio, no químico.' },
      { en: 'Lighting on, HVAC at 72°F, curtains open, TV off.',                es: 'Luces encendidas, A/C a 72°F, cortinas abiertas, TV apagada.' },
      { en: 'If ANY fail: send back to HK staff, do NOT mark ready.',           es: 'Si ALGO falla: devolver al personal, NO marcar listo.' },
    ],
  },
  {
    id: 'lost-found',
    titleEn: 'Lost & Found protocol',
    titleEs: 'Protocolo de Objetos Perdidos',
    summaryEn: 'Any item left in a checkout room must be logged and secured.',
    summaryEs: 'Cualquier objeto olvidado en una habitación de salida debe registrarse y asegurarse.',
    durationMinutes: 5,
    steps: [
      { en: 'Do NOT pocket or hand to another guest.',                          es: 'NO guardar ni entregar a otro huésped.' },
      { en: 'Photograph item in place, note room number & date.',                es: 'Fotografiar el objeto en su lugar, anotar número de habitación y fecha.' },
      { en: 'Bag item, label with room+date+your initials.',                     es: 'Guardar en bolsa, etiquetar con habitación+fecha+sus iniciales.' },
      { en: 'Deposit at Front Desk within 15 min.',                              es: 'Entregar en recepción dentro de 15 min.' },
      { en: 'Log in system so Front Desk can respond to guest inquiries.',       es: 'Registrar en el sistema para que recepción pueda responder al huésped.' },
    ],
  },
];

export default function EmmaSopPage() {
  const [bilingual, setBilingual] = useState(true);
  const [expanded, setExpanded] = useState<string | null>('checkout');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Standard Operating Procedures</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {EMMA_HOTEL.shortName} · Housekeeping playbook · {SOPS.length} procedures
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
            style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print SOPs
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {SOPS.map((sop) => {
          const isOpen = expanded === sop.id;
          return (
            <div
              key={sop.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', border: '1px solid #dddddd' }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : sop.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
                style={{ background: isOpen ? '#fafafa' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff1f3', color: '#ff385c' }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#222' }}>
                    {sop.titleEn}{bilingual && <span className="ml-2 text-[11px] font-medium" style={{ color: '#929292' }}>/ {sop.titleEs}</span>}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
                    {sop.summaryEn}
                    {bilingual && <><br /><span style={{ color: '#929292' }}>{sop.summaryEs}</span></>}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-bold" style={{ color: '#222' }}>~{sop.durationMinutes} min</p>
                  <p className="text-[10px]" style={{ color: '#929292' }}>{sop.steps.length} steps</p>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid #f0f0f0' }}>
                  <ol className="flex flex-col gap-2 mt-3">
                    {sop.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold" style={{ background: '#ffffff', color: '#222', border: '1px solid #dddddd' }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: '#222' }}>{s.en}</p>
                          {bilingual && <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{s.es}</p>}
                        </div>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 opacity-30" style={{ color: '#15803d' }} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @media print {
          body { background: #ffffff !important; }
        }
      `}</style>
    </div>
  );
}
