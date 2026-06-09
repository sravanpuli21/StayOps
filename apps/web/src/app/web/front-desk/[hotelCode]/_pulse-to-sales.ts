import { HOTELS, type DemandCategory, type Recurrence, type Capture, type DemandSignal } from '@hos/shared';
import type { HotelPulse } from './_store';

/**
 * Map a front-desk Hotel Pulse onto a Sales CRM demand signal. This is the
 * single bridge between the front desk and Kwanisha's Demand radar — keep both
 * "notify sales" paths (the new-pulse form + the detail page) going through it
 * so what lands on the sales side is consistent and always carries the hotel.
 */
export function reasonToCategory(reason: string): DemandCategory {
  const r = reason.toLowerCase();
  if (r.includes('festival')) return 'festival';
  if (r.includes('sport')) return 'sports';
  if (r.includes('wedding') || r.includes('family') || r.includes('reunion')) return 'family';
  if (r.includes('weather') || r.includes('hurricane') || r.includes('snow')) return 'weather';
  if (r.includes('corporate') || r.includes('construction') || r.includes('government') || r.includes('military')) return 'corporate';
  if (r.includes('college') || r.includes('graduation') || r.includes('commencement') || r.includes('concert') || r.includes('event')) return 'event';
  return 'other';
}
function timingToRecurrence(t: string): Recurrence {
  if (t === 'Next year' || t === 'In 11 months') return 'annual';
  if (t.startsWith('In')) return 'seasonal';
  return 'unknown';
}
function feelingToLift(f: string): number {
  if (f.includes('Sold out')) return 90;
  if (f.includes('Very high')) return 65;
  if (f.includes('Higher')) return 40;
  if (f.includes('Lower')) return 10;
  return 25;
}
function bookingToCapture(g: string): Capture {
  if (g.startsWith('Yes')) return 'group-booked';
  if (g === 'Mixed') return 'mixed';
  return 'walked-in';
}

/** Build the demand-signal payload Sales will see from a pulse entry. */
export function pulseToSignal(p: Pick<HotelPulse, 'hotelCode' | 'date' | 'occupancyFeeling' | 'mainReason' | 'eventName' | 'guestSource' | 'guestsMentioned' | 'groupBooking' | 'missedOpportunity' | 'shouldFollowUp' | 'followUpTiming' | 'notes'>): Omit<DemandSignal, 'id'> {
  const hotelName = HOTELS.find((h) => h.code === p.hotelCode)?.shortName ?? p.hotelCode;
  // The note is always shown on the sales radar — pack the actionable context here.
  const noteParts = [
    `${hotelName}:`,
    p.notes?.trim() || p.mainReason,
    p.guestSource ? `· Guests from ${p.guestSource}` : '',
    `· ${p.guestsMentioned} mentioned it`,
    p.missedOpportunity === 'Yes' ? '· flagged as a MISSED opportunity' : '',
    p.shouldFollowUp === 'Yes' ? `· follow up ${p.followUpTiming}` : '',
  ].filter(Boolean);
  return {
    title: p.eventName || p.mainReason,
    category: reasonToCategory(p.mainReason),
    date: p.date,
    recurrence: timingToRecurrence(p.followUpTiming),
    capture: bookingToCapture(p.groupBooking),
    occupancyLift: feelingToLift(p.occupancyFeeling),
    note: noteParts.join(' '),
    loggedBy: `Front Desk · ${hotelName}`,
    source: 'front-desk',
  };
}
