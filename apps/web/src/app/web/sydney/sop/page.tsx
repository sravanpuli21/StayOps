'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, Printer, Wrench } from 'lucide-react';
import { SYDNEY_HOTEL } from '@/lib/sydney-data';

interface Sop {
  id: string;
  title: string;
  system: string;
  summary: string;
  frequency: string;
  steps: string[];
}

const SOPS: Sop[] = [
  {
    id: 'ptac-filter',
    title: 'PTAC filter change',
    system: 'HVAC',
    summary: 'Monthly filter rotation on all guestroom PTAC units. Extends coil life and reduces short-cycling.',
    frequency: 'Monthly, floor-rotating',
    steps: [
      'Pull the scheduled room list from the calendar (usually one floor per month).',
      'Knock + announce "Maintenance", wait 10s before entering.',
      'Pop the front cover, slide out the old filter, inspect for heavy dust or mold.',
      'Replace with 20×14×1 MERV-8 filter. Write install date on the new filter with a Sharpie.',
      'Wipe coil face if visible debris. Vacuum drain pan.',
      'Test unit — confirm cool air within 2 minutes, fan sounds smooth, no rattles.',
      'Log the room in the PPM calendar as done. Flag any abnormal noise for follow-up ticket.',
    ],
  },
  {
    id: 'emergency-light',
    title: 'Emergency light monthly test',
    system: 'Fire & Life',
    summary: 'Push-to-test every EM/exit light in corridors, stairwells, and public areas. Required by brand + code.',
    frequency: 'Monthly · 1st of each month',
    steps: [
      'Pull the emergency lighting map (posted in Mech Room A).',
      'Walk the property with Amir (or alone if Amir unavailable).',
      'At each fixture: press the TEST button, confirm LED illuminates for the full 90 seconds.',
      'For batteries that fail < 90 sec, log the fixture number and create a ticket.',
      'Exit signs: confirm letters are fully illuminated (no dark segments).',
      'Corridor bugeye fixtures: confirm both heads fire.',
      'Stair EM: confirm all levels test.',
      'Sign + date the property emergency-lighting log. File in the red Fire Safety binder.',
    ],
  },
  {
    id: 'pool-chem',
    title: 'Pool chemistry check',
    system: 'Pool',
    summary: 'Keep chlorine 1–3 ppm, pH 7.4–7.6. Required 3× per operating day per state code.',
    frequency: '3× daily · open, midday, close',
    steps: [
      'Use the wall-mounted DPD-3 test kit (NOT the strip kit — strips are backup only).',
      'Pull sample 18" below surface, midway between skimmer and return.',
      'Test Free Chlorine: target 1.0–3.0 ppm. If < 1, add CalHypo per the dosing chart posted by the pump.',
      'Test pH: target 7.4–7.6. If < 7.2, add soda ash. If > 7.8, add muriatic acid.',
      'Test Total Alkalinity weekly: target 80–120 ppm.',
      'Log every test in the paper pool log (required by state inspector).',
      'If chemistry is out of range for > 2 consecutive tests, close the pool and escalate.',
      'Backwash filter every Sunday morning (or when pressure gauge is 10+ psi above clean).',
    ],
  },
  {
    id: 'fire-ext',
    title: 'Fire extinguisher inspection',
    system: 'Fire & Life',
    summary: 'Monthly visual check on every fire extinguisher. Annual service is a separate contracted vendor visit.',
    frequency: 'Monthly visual · annual vendor service',
    steps: [
      'Pull the extinguisher location list from the red Fire Safety binder.',
      'At each extinguisher: confirm seal intact, pin in place, gauge needle in green zone.',
      'Check that label is legible and mount is secure.',
      'Weigh extinguisher vs manufacturer tag — flag any > 10% variance.',
      'Sign + date the inspection tag.',
      'If any extinguisher fails, lock-out with an orange tag and contact vendor same-day.',
    ],
  },
  {
    id: 'handover',
    title: 'End-of-shift handover to Amir',
    system: 'General',
    summary: '4:00 PM daily handover so Amir starts his evening shift fully briefed.',
    frequency: 'Daily · 4:00 PM',
    steps: [
      'Close out any tickets completed today in the app.',
      'Write a 3–5 line handover note in the Handover channel:',
      '   · What got done today (preventive + reactive).',
      '   · What\'s still open and needs follow-up.',
      '   · Any guest complaints in progress.',
      '   · Parts expected / deliveries.',
      '   · Rooms locked out or OOO and why.',
      'Walk the property together if anything is unusual (fire panel alarm, pool closed, elevator issue).',
      'Hand Amir the radio + keys + on-call phone.',
    ],
  },
];

export default function SydneySopPage() {
  const [expanded, setExpanded] = useState<string | null>('ptac-filter');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance SOPs</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {SYDNEY_HOTEL.shortName} · Sydney's playbook · {SOPS.length} procedures
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
          style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
        >
          <Printer className="w-3.5 h-3.5" />
          Print SOPs
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {SOPS.map((sop) => {
          const isOpen = expanded === sop.id;
          return (
            <div key={sop.id} className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : sop.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
                style={{ background: isOpen ? '#fafafa' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#222' }}>
                    {sop.title}
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{sop.system}</span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{sop.summary}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Cadence</p>
                  <p className="text-xs" style={{ color: '#222' }}>{sop.frequency}</p>
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
                          <p className="text-sm whitespace-pre-line" style={{ color: '#222' }}>{s}</p>
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
    </div>
  );
}
