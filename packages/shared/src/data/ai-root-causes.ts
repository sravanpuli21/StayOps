import type { RootCause } from '../types/ai';

export const AI_ROOT_CAUSES: RootCause[] = [
  {
    findingId: 'af-001',
    chain: [
      { step: 'Revenue flat', evidence: 'Home2 TX room revenue has held at ~$13.5K/week for 3 periods' },
      { step: 'Clocked hours up', evidence: 'Clocked hours rose 447 → 478 → 491 over the same window' },
      { step: 'OT accelerating', evidence: 'Overtime 9 → 13 → 16 hrs — supervisors covering short shifts' },
      { step: 'Payroll % crosses target', evidence: '28% → 31% → 34% of revenue, breaching 30% ceiling' },
    ],
    narrative:
      'Not a revenue problem — a scheduling one. Demand is stable but labour creep is accelerating because OT is being used to cover shifts that should be scheduled. A single-period fix would be cosmetic; need a 2-week schedule reset.',
  },
  {
    findingId: 'af-002',
    chain: [
      { step: 'OOO cluster identified', evidence: 'Rooms 312, 318, 407 flagged OOO 5+ days each in past 2 weeks' },
      { step: 'Repeat failures', evidence: 'Same PTAC units — 2010 install date, 4 tickets each in 12 months' },
      { step: 'Maintenance backlog', evidence: 'Parts ordered 10 days ago — not arrived, tickets held open' },
      { step: 'Revenue loss', evidence: '3 rooms × $158 ADR × 14 days ≈ $6,600 forgone' },
    ],
    narrative:
      'Chronic PTAC failures on aging units. Maintenance is not the bottleneck — parts procurement is. Either expedite the existing order or pre-position replacement stock for Q3 PTAC batch refresh.',
  },
  {
    findingId: 'af-003',
    chain: [
      { step: 'Kitchen staffing up', evidence: 'Kitchen clocked hours +28 over schedule vs +8 baseline' },
      { step: 'F&B revenue flat', evidence: 'F&B revenue has held at ~$2.9K/week — no matching uplift' },
      { step: 'Prep schedule mismatch', evidence: 'Breakfast prep starts 5am regardless of booked rooms' },
      { step: 'No menu or pricing change', evidence: 'Same menu, same prices, same cover count' },
    ],
    narrative:
      'Classic demand-insensitive scheduling. Kitchen is staffed for peak every day. On low-occupancy weekdays (Mon/Tue) we are over-scheduling by 15–20 hrs with no F&B upside. A demand-matched schedule template would recover $1.8K/period.',
  },
  {
    findingId: 'af-004',
    chain: [
      { step: 'Occupancy miss', evidence: 'Woodspring Brunswick at 74%, comp set at 81%' },
      { step: 'ADR gap narrow', evidence: 'Our $118 vs market $124 — only $6 behind' },
      { step: 'Weekday pickup slow', evidence: 'Sun-Wed bookings down 11% YoY' },
      { step: 'Not comp set issue', evidence: 'All local extended-stay properties up 4-7% this quarter' },
    ],
    narrative:
      'Not pricing — demand generation. Extended-stay segment is growing but our share is shrinking. Likely B2B/contract channel weakness. Recommend a targeted outreach to 5 local employer accounts and a weekday rate test.',
  },
  {
    findingId: 'af-005',
    chain: [
      { step: 'OT spike', evidence: 'Hilton Garden Midtown OT at 21 hrs — first time above 18 this year' },
      { step: 'Check-in volume up', evidence: 'Arrivals volume +14% this period driven by Savannah event calendar' },
      { step: 'Coverage gap', evidence: 'Front Desk scheduled at prior-period baseline, not adjusted for event' },
      { step: 'HK overlap', evidence: 'HK OT also up — late checkouts + event turnovers stacking' },
    ],
    narrative:
      'Calendar-driven spike, not chronic. The event schedule was known but the staffing template did not absorb it. Pre-load the next two event windows now and the OT reverts.',
  },
  {
    findingId: 'af-006',
    chain: [
      { step: 'Market rate moved', evidence: 'Comp set ADR rose $8 in March' },
      { step: 'Our rate held', evidence: 'Home2 TX ADR flat at $129 since February' },
      { step: 'Gap widened', evidence: 'Rate gap widened from -$4 to -$12 over 8 weeks' },
      { step: 'Revenue lift missed', evidence: '$8 × ~78 daily rooms sold × 56 days ≈ $35K left on table' },
    ],
    narrative:
      'Passive pricing. The comp set signaled demand strength and we did not respond. Rate should move +$6 immediately, then +$4 the following week. Low occupancy risk given market trajectory.',
  },
  {
    findingId: 'af-007',
    chain: [
      { step: 'Weekday softness', evidence: 'Mon-Thu pickup down 9% week over week' },
      { step: 'Comp set steady', evidence: 'Local comp set holding at 78-79%' },
      { step: 'Weekend holding', evidence: 'Fri-Sat bookings up 3% — not a product or brand issue' },
      { step: 'OTA mix shifting', evidence: 'Booking.com share rose 6 pts, direct share fell' },
    ],
    narrative:
      'Direct channel weakening on weekdays. Likely search visibility issue or lapsed CRM campaign. Front-desk upsell and OTA dependency are masking it.',
  },
  {
    findingId: 'af-008',
    chain: [
      { step: 'ADR dropped', evidence: 'Courtyard Brunswick ADR $142, comp $148' },
      { step: 'Group mix spiked', evidence: 'Group rooms 24% this week vs 8% typical' },
      { step: 'Event-driven', evidence: 'Regional softball tournament blocked 40 rooms at $119 rate' },
      { step: 'Transient pricing healthy', evidence: 'Transient ADR held at $151 — above comp' },
    ],
    narrative:
      'Not a pricing problem. Group business is one-off, transient pricing is strong. No action needed — gap closes next week when the tournament clears.',
  },
  {
    findingId: 'af-009',
    chain: [
      { step: 'HK overage', evidence: 'Cambria Savannah HK clocked +22 hrs' },
      { step: 'Late checkout surge', evidence: '14% late checkout rate vs 6% typical' },
      { step: 'Event spillover', evidence: 'Wedding group checked out 11am–2pm Sunday' },
      { step: 'Inspection queue', evidence: 'Inspection cycle extended from 35 to 58 min average' },
    ],
    narrative:
      'Demand-driven, not staffing mistake. Next time a wedding group is blocked, add one HK shift Sunday 10am-2pm.',
  },
  {
    findingId: 'af-010',
    chain: [
      { step: 'Failure cluster', evidence: '7 AC tickets in 7 days across 4 properties' },
      { step: 'Unit age correlation', evidence: 'All failing units are 2020 or earlier PTACs' },
      { step: 'Model concentration', evidence: '5 of 7 are Model GE AZ45E09 — known capacitor issue' },
      { step: 'Warranty expired', evidence: 'Repairs at $280 avg vs $0 pre-2024' },
    ],
    narrative:
      'Model-level defect surfacing as warranty coverage lapses. The Q3 PTAC batch refresh plan should be accelerated for this model across Savannah — 32 units, ~$96K.',
  },
  {
    findingId: 'af-011',
    chain: [
      { step: 'F&B revenue up', evidence: 'Cotton Sail F&B $14.2K this week vs $12K baseline' },
      { step: 'Brunch covers surge', evidence: 'Sat-Sun brunch covers +22% vs prior 4 weeks' },
      { step: 'New menu driving it', evidence: 'Launched spring menu 3 weeks ago' },
      { step: 'Not room guests only', evidence: '60% walk-in traffic — local market responding' },
    ],
    narrative:
      'Good news that deserves reinforcement. Consider extending brunch hours and testing a similar menu refresh at Cambria Savannah where F&B has been flat.',
  },
  {
    findingId: 'af-012',
    chain: [
      { step: 'OT dropped', evidence: 'Home2 Baton Rouge OT at 9 hrs vs 18 prior period' },
      { step: 'Schedule adjusted', evidence: 'Added one FD shift, trimmed 6 HK hrs' },
      { step: 'Revenue unaffected', evidence: 'Occupancy held at 83%' },
      { step: 'Sustained 2 periods', evidence: 'Prior period also within range (11 hrs)' },
    ],
    narrative:
      'Confirming the scheduling change worked. No further action — watch for regression after the next wedding/event window.',
  },
];

export const getRootCauseByFindingId = (findingId: string): RootCause | undefined =>
  AI_ROOT_CAUSES.find((rc) => rc.findingId === findingId);
