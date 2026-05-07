'use client';

import { useState } from 'react';
import { BookOpen, Clock, CheckCircle2, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface SOPShift {
  label: string;
  hours: string;
  headcount: string;
  responsibilities: string[];
  checklist: string[];
  criticalProcedures?: string[];
}

interface SOPRole {
  id: string;
  title: string;
  team: string;
  summary: string;
  brand?: string;
  reportsTo: string;
  shifts: SOPShift[];
}

const SOPS: SOPRole[] = [
  {
    id: 'fd-asst',
    title: 'Front Desk Associate',
    team: 'Front Desk',
    summary: 'Front-line guest experience. Owns check-in/out, guest requests, problem resolution, and phones.',
    brand: 'Hilton Hampton',
    reportsTo: 'Front Desk Manager',
    shifts: [
      {
        label: 'Morning (AM)',
        hours: '7:00 AM – 3:00 PM',
        headcount: '1 weekdays, 2 weekends',
        responsibilities: [
          'Handle check-outs (peak 8–11 AM)',
          'Greet early arrivals; offer early check-in per availability',
          'Breakfast oversight & guest-inquiry triage',
          'Review overnight activity log from Night Audit',
          'Restock lobby supplies',
        ],
        checklist: [
          'Log in to PMS by 6:55 AM',
          'Print arrivals list for the day',
          'Coordinate with HK on rooms-ready count by 10 AM',
          'Count cash drawer, sign off on NA handoff',
        ],
        criticalProcedures: [
          'Any refund >$100 → must have GM approval before processing',
          'Lost-and-found: log in system immediately, tag, lock in LF cabinet',
        ],
      },
      {
        label: 'Afternoon (PM)',
        hours: '3:00 PM – 11:00 PM',
        headcount: '1 weekdays, 2 Fri/Sat',
        responsibilities: [
          'Own the check-in rush (3–7 PM)',
          'Post-arrival guest requests and upsells',
          'Evening parking/event coordination',
          'Incident logging · first-level complaint resolution',
          'Coordinate evening maintenance tickets with Amir',
        ],
        checklist: [
          'Receive AM cash drawer with signed count',
          'Review VIP arrivals list · prep welcome amenities',
          'Pre-assign rooms for next-day arrivals',
          'Hand off to Night Audit at 11 PM — log any open issues',
        ],
        criticalProcedures: [
          'Oversell: first offer room upgrade, then walk with full re-booking',
          'Late check-in past 11 PM: warm welcome + key delivery, no NA interruption',
        ],
      },
      {
        label: 'Night Audit (NA)',
        hours: '11:00 PM – 7:00 AM',
        headcount: '1',
        responsibilities: [
          'Run end-of-day audit — posts all charges, closes books',
          'Process late arrivals',
          'Generate daily reports: occupancy, revenue, ADR',
          'Security rounds (midnight + 4 AM)',
          'First response to emergencies overnight',
          'Prep arrivals list for AM',
        ],
        checklist: [
          'Complete close-of-day in PMS by 2 AM',
          'Generate and print daily report pack by 3 AM',
          'Run bank drop before AM',
          'Email report pack to GM + AGM before 7 AM',
        ],
        criticalProcedures: [
          'Any security incident → call 911 first, then GM, then regional on-call',
          'System failure: switch to backup paper folios, document every transaction',
        ],
      },
    ],
  },
  {
    id: 'fd-mgr',
    title: 'Front Desk Manager',
    team: 'Front Desk',
    summary: 'Owns the front-of-house team, scheduling, training, and escalated guest recovery.',
    brand: 'Hilton Hampton',
    reportsTo: 'General Manager',
    shifts: [
      {
        label: 'Day (flex 7a–4p)',
        hours: 'Overlapping AM/PM',
        headcount: '1',
        responsibilities: [
          'Staff scheduling & coverage planning',
          'Training new FD associates (90-day plan)',
          'Guest complaint escalation (level 2)',
          'VIP coordination with GM',
          'Front desk budgeting & supplies',
          'Review guest scores weekly',
        ],
        checklist: [
          'Approve shift swaps in portal',
          'Weekly 1:1 with each associate',
          'Monthly brand-standards audit',
          'Quarterly training refresh per Hilton standards',
        ],
      },
    ],
  },
  {
    id: 'hk-staff',
    title: 'Housekeeper',
    team: 'Housekeeping',
    summary: 'Room turnover, stayover service, public-area cleaning. Reports hourly progress during turnover window.',
    brand: 'Hilton Hampton',
    reportsTo: 'Housekeeping Lead',
    shifts: [
      {
        label: 'Day',
        hours: '8:00 AM – 4:00 PM',
        headcount: '4–6 depending on occupancy',
        responsibilities: [
          'Clean assigned rooms per Hilton Hampton brand standard',
          'Strip & remake beds with fresh linens',
          'Deep-clean bathrooms, replenish all amenities',
          'Flag maintenance issues (damaged items, repairs needed)',
          'Public-area touch-ups during downtime',
          'Report room-ready in PMS so FD can release',
        ],
        checklist: [
          'Target 25–30 min per checkout room',
          '60% rooms ready by 12 PM · 100% by 3 PM',
          'Inspection by HK Lead before release',
          'Log broken or missing items immediately',
        ],
        criticalProcedures: [
          'Guest personal items found → log in Lost & Found within 1 hr',
          'Suspicious items → do not touch, call FD Manager immediately',
        ],
      },
    ],
  },
  {
    id: 'hk-lead',
    title: 'Housekeeping Lead',
    team: 'Housekeeping',
    summary: 'Morning planning, room assignments, inspections, and inventory management.',
    brand: 'Hilton Hampton',
    reportsTo: 'General Manager',
    shifts: [
      {
        label: 'Day',
        hours: '7:30 AM – 4:00 PM',
        headcount: '1',
        responsibilities: [
          'Morning room-assignment printing (1-person + 2-person teams)',
          'Inspect every room before release to FD',
          'Linen inventory & reorder',
          'Staff coaching & quality control',
          'Coordinate with Maintenance on room holds',
        ],
        checklist: [
          'Run room-status report at 7:45 AM',
          'Inspection at release: 100% target',
          'Flag any room needing maintenance hold',
          'End-of-day report to GM: rooms turned, inspection scores, issues found',
        ],
      },
    ],
  },
  {
    id: 'maint-tech',
    title: 'Maintenance Technician',
    team: 'Maintenance',
    summary: 'Reactive + preventive maintenance. Evening coverage owns check-in-window guest issues.',
    brand: 'Hilton Hampton',
    reportsTo: 'Maintenance Supervisor',
    shifts: [
      {
        label: 'Morning',
        hours: '7:00 AM – 3:00 PM',
        headcount: '1 (Sydney)',
        responsibilities: [
          'Preventive maintenance per schedule (HVAC, plumbing, electrical)',
          'Major repair projects',
          'Weekly building systems audit',
          'Vendor coordination (roof, elevator, POS)',
        ],
        checklist: [
          'Check overnight tickets from Amir',
          'Review preventive schedule for today',
          'Handoff plan to evening tech by 3 PM',
        ],
      },
      {
        label: 'Evening',
        hours: '4:00 PM – 10:00 PM',
        headcount: '1 (Amir)',
        responsibilities: [
          'Rapid response to guest-in-room issues',
          'TV/remote, thermostat, light bulbs, door latches',
          'Leave clean handover notes for morning tech',
          'Walkie-ready for FD and HK during check-in rush',
        ],
        checklist: [
          'Clock in 4 PM · review open tickets + Sydney\'s handover',
          'Prioritize: occupied urgent → arrival blockers → aging → audits',
          'End-of-shift: all urgent tickets resolved or escalated',
          'Log parts used + item source (stock / vacant room / temp fix)',
        ],
        criticalProcedures: [
          'OOO during check-in rush → immediate escalate to GM + FD',
          'Guest safety issue → stop current work, address safety first',
        ],
      },
    ],
  },
  {
    id: 'restaurant-breakfast',
    title: 'Breakfast Attendant',
    team: 'Restaurant',
    summary: 'Continental breakfast setup, service, and breakdown. Brand-standard hot/cold bar.',
    brand: 'Hilton Hampton On the House',
    reportsTo: 'General Manager',
    shifts: [
      {
        label: 'Breakfast',
        hours: '5:30 AM – 10:30 AM',
        headcount: '1 weekdays, 2 weekends',
        responsibilities: [
          'Set up hot + cold breakfast bar per brand standard',
          'Monitor and restock throughout service',
          'Greet guests, handle allergen requests',
          'Breakdown and clean by 10:30 AM',
          'Inventory count for next-day prep',
        ],
        checklist: [
          'Temperature logs every 30 min during service',
          'Hand-wash station + sanitizer stocked',
          'Waffle/pancake batter replenished every hour',
          'Coffee urns swapped every 2 hrs',
        ],
        criticalProcedures: [
          'Temperature out of range → dispose, restock, log time',
          'Allergen cross-contact concern → immediate GM notification',
        ],
      },
    ],
  },
];

export default function SOPPage() {
  const [expanded, setExpanded] = useState<string | null>('fd-asst');

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Standard Operating Procedures</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Role-based shift templates · responsibilities · checklists · critical procedures
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
        >
          <Printer className="w-3.5 h-3.5" />
          Print SOP book
        </button>
      </div>

      {/* Role list */}
      <div className="flex flex-col gap-3">
        {SOPS.map((role) => {
          const isExpanded = expanded === role.id;
          return (
            <div
              key={role.id}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #dddddd' }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : role.id)}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-[#fafafa]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,56,92,0.08)' }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: '#ff385c' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-semibold text-base" style={{ color: '#222' }}>{role.title}</p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#f7f7f7', color: '#6a6a6a' }}
                    >
                      {role.team}
                    </span>
                    <span className="text-xs" style={{ color: '#929292' }}>· Reports to {role.reportsTo}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>{role.summary}</p>
                </div>
                <div className="text-xs font-semibold text-right" style={{ color: '#929292' }}>
                  <p>{role.shifts.length} {role.shifts.length === 1 ? 'shift' : 'shifts'}</p>
                  {role.brand && <p className="text-[10px] mt-0.5">{role.brand}</p>}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: '#6a6a6a' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#6a6a6a' }} />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid #f0f0f0' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {role.shifts.map((shift, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4"
                        style={{ background: '#fafafa', border: '1px solid #ebebeb' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-3.5 h-3.5" style={{ color: '#ff385c' }} />
                          <p className="text-sm font-bold" style={{ color: '#222' }}>{shift.label}</p>
                        </div>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#222' }}>{shift.hours}</p>
                        <p className="text-[10px] mb-3" style={{ color: '#929292' }}>Staffing: {shift.headcount}</p>

                        <div className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6a6a6a' }}>Responsibilities</p>
                          <ul className="space-y-1">
                            {shift.responsibilities.map((r, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs" style={{ color: '#3f3f3f' }}>
                                <span className="mt-1 flex-shrink-0" style={{ color: '#c1c1c1' }}>•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6a6a6a' }}>Daily checklist</p>
                          <ul className="space-y-1">
                            {shift.checklist.map((c, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs" style={{ color: '#3f3f3f' }}>
                                <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {shift.criticalProcedures && shift.criticalProcedures.length > 0 && (
                          <div
                            className="rounded-lg p-2 mt-3"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#b91c1c' }}>
                              Critical procedures
                            </p>
                            <ul className="space-y-0.5">
                              {shift.criticalProcedures.map((p, j) => (
                                <li key={j} className="text-[11px]" style={{ color: '#991b1b' }}>• {p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
