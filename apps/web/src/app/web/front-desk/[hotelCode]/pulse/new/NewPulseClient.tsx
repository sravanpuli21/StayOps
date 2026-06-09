'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Camera, TrendingUp, Megaphone } from 'lucide-react';
import { addDemandSignal } from '@/lib/demand-signals-store';
import {
  OCCUPANCY_FEELINGS, PULSE_REASONS, GUEST_SOURCES, FOUND_OUT, GUESTS_MENTIONED,
  GROUP_BOOKING, YES_MAYBE_NO, FOLLOWUP_YES, FOLLOWUP_TIMING,
} from '../../_data';
import { createPulse, type HotelPulse } from '../../_store';
import { pulseToSignal } from '../../_pulse-to-sales';
import { fdCard, Field, fdInput, fdInputStyle, BackTo } from '../../_ui';

interface Props { hotelCode: string }

export function NewPulseClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [occupancyFeeling, setOccupancyFeeling] = useState(OCCUPANCY_FEELINGS[1]);
  const [mainReason, setMainReason] = useState(PULSE_REASONS[2]);
  const [eventName, setEventName] = useState('');
  const [guestSource, setGuestSource] = useState('');
  const [foundOut, setFoundOut] = useState<string[]>([]);
  const [guestsMentioned, setGuestsMentioned] = useState(GUESTS_MENTIONED[1]);
  const [groupBooking, setGroupBooking] = useState(GROUP_BOOKING[1]);
  const [missedOpportunity, setMissedOpportunity] = useState('Yes');
  const [shouldFollowUp, setShouldFollowUp] = useState('Yes');
  const [followUpTiming, setFollowUpTiming] = useState(FOLLOWUP_TIMING[4]);
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [created, setCreated] = useState<HotelPulse | null>(null);
  const [notified, setNotified] = useState(false);

  const toggleFound = (v: string) => setFoundOut((f) => f.includes(v) ? f.filter((x) => x !== v) : [...f, v]);

  const save = (notifySales: boolean) => {
    const p = createPulse({ hotelCode, date, occupancyFeeling, mainReason, eventName, guestSource, foundOut, guestsMentioned, groupBooking, missedOpportunity, shouldFollowUp, followUpTiming, notes, salesNotified: notifySales });
    if (notifySales) addDemandSignal(pulseToSignal(p));
    setNotified(notifySales); setCreated(p);
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={fdCard}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: notified ? '#ece4fb' : '#dcfce7' }}>{notified ? <Megaphone className="w-7 h-7" style={{ color: '#7c3aed' }} /> : <CheckCircle2 className="w-7 h-7" style={{ color: '#15803d' }} />}</div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Hotel Pulse saved successfully</h1>
          {notified && <p className="text-sm" style={{ color: '#7c3aed' }}>Sales has been notified — this is now a tracked opportunity.</p>}
          <div className="w-full rounded-xl p-4 flex flex-col gap-2 mt-1" style={{ background: '#f7f7f7' }}>
            <Row k="Date" v={created.date} />
            <Row k="Reason" v={created.mainReason} />
            <Row k="Event" v={created.eventName || '—'} />
            <Row k="Missed opportunity" v={created.missedOpportunity} />
            <Row k="Sales follow-up" v={created.shouldFollowUp} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
            <button onClick={() => setCreated(null)} className="flex-1 h-11 rounded-xl text-sm font-bold" style={{ background: '#7c3aed', color: '#fff' }}>Add Another Pulse</button>
            <Link href={`${base}/pulse`} className="flex-1 h-11 leading-[44px] text-center rounded-xl text-sm font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Today's Pulse</Link>
          </div>
          <Link href={`${base}/home`} className="text-sm font-semibold mt-1" style={{ color: '#929292' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <BackTo href={`${base}/home`} label="Home" />
      <div className="flex items-center gap-2"><TrendingUp className="w-6 h-6" style={{ color: '#7c3aed' }} /><div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Today's Hotel Pulse</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Log why guests are here today and what opportunity we might be missing.</p></div></div>

      <div className="rounded-2xl p-5 flex flex-col gap-4" style={fdCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fdInput} style={fdInputStyle} /></Field>
          <Field label="Occupancy feeling"><select value={occupancyFeeling} onChange={(e) => setOccupancyFeeling(e.target.value)} className={fdInput} style={fdInputStyle}>{OCCUPANCY_FEELINGS.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
        </div>
        <Field label="Main reason guests are here"><select value={mainReason} onChange={(e) => setMainReason(e.target.value)} className={fdInput} style={fdInputStyle}>{PULSE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
        <Field label="Event or reason name"><input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="SCAD Commencement" className={fdInput} style={fdInputStyle} /></Field>
        <Field label="Where are guests coming from?"><input value={guestSource} onChange={(e) => setGuestSource(e.target.value)} placeholder="Florida, Atlanta, Northeast…" list="guest-sources" className={fdInput} style={fdInputStyle} /><datalist id="guest-sources">{GUEST_SOURCES.map((g) => <option key={g} value={g} />)}</datalist></Field>

        <Field label="How did front desk find out?">
          <div className="flex flex-wrap gap-2">{FOUND_OUT.map((f) => <button key={f} onClick={() => toggleFound(f)} className="px-3 h-9 rounded-full text-xs font-semibold" style={{ background: foundOut.includes(f) ? '#ece4fb' : '#fff', border: `1px solid ${foundOut.includes(f) ? '#7c3aed' : '#dddddd'}`, color: foundOut.includes(f) ? '#7c3aed' : '#6a6a6a' }}>{f}</button>)}</div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="How many guests mentioned this?"><select value={guestsMentioned} onChange={(e) => setGuestsMentioned(e.target.value)} className={fdInput} style={fdInputStyle}>{GUESTS_MENTIONED.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
          <Field label="Connected to a group booking?"><select value={groupBooking} onChange={(e) => setGroupBooking(e.target.value)} className={fdInput} style={fdInputStyle}>{GROUP_BOOKING.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
          <Field label="Is this a missed sales opportunity?"><select value={missedOpportunity} onChange={(e) => setMissedOpportunity(e.target.value)} className={fdInput} style={fdInputStyle}>{YES_MAYBE_NO.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
          <Field label="Should sales follow up?"><select value={shouldFollowUp} onChange={(e) => setShouldFollowUp(e.target.value)} className={fdInput} style={fdInputStyle}>{FOLLOWUP_YES.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
        </div>
        <Field label="Follow-up timing"><select value={followUpTiming} onChange={(e) => setFollowUpTiming(e.target.value)} className={fdInput} style={fdInputStyle}>{FOLLOWUP_TIMING.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Example: Many guests said they came for SCAD commencement. Most booked individually. Next year we should contact SCAD families or create a room block." className="px-3 py-2.5 rounded-xl text-base outline-none w-full resize-none" style={fdInputStyle} /></Field>
        <Field label="Photo or screenshot (optional)"><label className="flex items-center gap-2 h-11 px-3 rounded-xl cursor-pointer" style={{ border: '1px dashed #dddddd', color: '#6a6a6a' }}><Camera className="w-4 h-4" /> <span className="text-sm">{photoName || 'Attach an image'}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? 'image.jpg')} /></label></Field>

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => save(true)} className="flex-1 h-12 rounded-xl text-base font-bold inline-flex items-center justify-center gap-2" style={{ background: '#7c3aed', color: '#fff' }}><Megaphone className="w-5 h-5" /> Save and Notify Sales</button>
          <button onClick={() => save(false)} className="h-12 px-5 rounded-xl text-sm font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Save Hotel Pulse</button>
          <Link href={`${base}/home`} className="h-12 px-5 leading-[48px] text-center rounded-xl text-sm font-bold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-semibold text-right" style={{ color: '#222' }}>{v}</span></div>; }
