'use client';

import { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import {
  CATEGORY_LABEL, RECURRENCE_LABEL, CAPTURE_LABEL,
  type DemandCategory, type Recurrence, type Capture,
} from '@hos/shared';
import { addDemandSignal } from '@/lib/demand-signals-store';

interface Props { onClose: () => void; onSaved?: () => void }

const CATEGORIES = Object.keys(CATEGORY_LABEL) as DemandCategory[];
const RECURRENCES = Object.keys(RECURRENCE_LABEL) as Recurrence[];
const CAPTURES = Object.keys(CAPTURE_LABEL) as Capture[];

export function DemandNoteModal({ onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DemandCategory>('event');
  const [recurrence, setRecurrence] = useState<Recurrence>('annual');
  const [capture, setCapture] = useState<Capture>('walked-in');
  const [lift, setLift] = useState(30);
  const [note, setNote] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const valid = title.trim().length > 1 && note.trim().length > 1;

  const isWeather = category === 'weather';

  const save = () => {
    if (!valid) return;
    addDemandSignal({
      title: title.trim(), category, recurrence: isWeather ? 'one-time' : recurrence, capture,
      occupancyLift: lift, note: note.trim(),
      date: new Date().toISOString().slice(0, 10),
      loggedBy: 'Front Desk', source: 'front-desk',
      contactName: contactName.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
    });
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#ece4fb' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#222' }}>What&rsquo;s driving demand?</h2>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Log why guests are here — Sales turns it into next year&rsquo;s opportunity</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a]"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <Field label="What's happening?">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SCAD commencement, Jazz Festival, family reunion"
              className={inputCls} style={inputStyle} autoFocus />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as DemandCategory)} className={inputCls} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </Field>
            <Field label="How often?">
              {isWeather ? (
                <div className="h-11 px-3 rounded-xl flex items-center text-sm" style={{ background: '#cffafe', border: '1px solid #a5f3fc', color: '#0891b2' }}>
                  Reactive · forecast only
                </div>
              ) : (
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)} className={inputCls} style={inputStyle}>
                  {RECURRENCES.filter((r) => r !== 'one-time' || true).map((r) => <option key={r} value={r}>{RECURRENCE_LABEL[r]}</option>)}
                </select>
              )}
            </Field>
          </div>
          {isWeather && (
            <p className="text-xs -mt-2" style={{ color: '#0891b2' }}>
              Weather can&rsquo;t be predicted or pre-sold — Sales watches the live forecast (~14 days) and reacts on rate/readiness.
            </p>
          )}

          <Field label="How did they book?">
            <div className="flex gap-2">
              {CAPTURES.map((c) => (
                <button key={c} type="button" onClick={() => setCapture(c)}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold"
                  style={{ background: capture === c ? '#222' : '#f7f7f7', color: capture === c ? '#fff' : '#6a6a6a' }}>
                  {CAPTURE_LABEL[c]}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Roughly how much of the house? · ${lift}%`}>
            <input type="range" min={5} max={100} step={5} value={lift} onChange={(e) => setLift(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#7c3aed' }} />
          </Field>

          <Field label="What did guests tell you?">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="e.g. 'Half my check-ins said they're here for the jazz fest downtown — none were a group booking.'"
              className={inputCls} style={{ ...inputStyle, minHeight: 80, paddingTop: 10 }} />
          </Field>

          {(category === 'family' || capture === 'walked-in') && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Organizer name (optional)">
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Gloria Thompson" className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Phone / email (optional)">
                <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="(912) 555-0000" className={inputCls} style={inputStyle} />
              </Field>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>Cancel</button>
          <button onClick={save} disabled={!valid} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#7c3aed', color: '#fff', opacity: valid ? 1 : 0.5 }}>
            Log demand note
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'h-11 px-3 rounded-xl outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm w-full';
const inputStyle: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
