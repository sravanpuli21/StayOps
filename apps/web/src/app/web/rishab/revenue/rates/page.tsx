'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react';

interface RateEvent {
  id: string;
  room_type_id: string | null;
  rate_plan: string;
  stay_date: string;
  old_rate: number | null;
  new_rate: number;
  changed_at: string;
  reason: string | null;
}

const HOTEL_CODE = 'BTRCI';
const ROOM_TYPES = ['K', 'Q', 'KK', 'QQ', 'KS', 'QS', 'KPD', 'QPD'];

export default function RateManagerPage() {
  const [events, setEvents] = useState<RateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [roomType, setRoomType] = useState('K');
  const [stayFrom, setStayFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [stayTo, setStayTo] = useState(() => new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10));
  const [newRate, setNewRate] = useState('129');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/rates/log?hotelCode=${HOTEL_CODE}`)
      .then((r) => r.json())
      .then((j) => { setEvents(j.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    try {
      const r = await fetch('/api/rates/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelCode: HOTEL_CODE,
          roomTypeCode: roomType,
          ratePlan: 'BAR',
          stayDateFrom: stayFrom,
          stayDateTo: stayTo,
          newRate: Number(newRate),
          reason: reason || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) setSavedMsg(`Error: ${j.error ?? 'unknown'}`);
      else {
        setSavedMsg(`Logged ${j.inserted} rate events across ${j.stayDates} stay dates.`);
        setShowForm(false);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Rate Manager</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Log BAR changes for BTRCI. Every change stamps the stay date it applies to.
          </p>
        </div>
        <button
          onClick={() => setShowForm((x) => !x)}
          className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          style={{ background: '#ff385c', color: '#ffffff' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Log Rate Change
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              >
                {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Stay From</label>
              <input
                type="date"
                value={stayFrom}
                onChange={(e) => setStayFrom(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Stay To</label>
              <input
                type="date"
                value={stayTo}
                onChange={(e) => setStayTo(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>New BAR ($)</label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. weekend demand spike, comp set dropped, event"
              className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
              style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="h-9 px-4 rounded-lg text-xs font-semibold"
              style={{ background: '#ff385c', color: '#ffffff', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving...' : 'Save rate change'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="h-9 px-3 rounded-lg text-xs font-semibold"
              style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
            >
              Cancel
            </button>
          </div>
          {savedMsg && <p className="text-xs mt-2" style={{ color: '#15803d' }}>{savedMsg}</p>}
        </div>
      )}

      {/* Recent events */}
      <div className="bg-white rounded-2xl" style={{ border: '1px solid #dddddd' }}>
        <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Calendar className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Rate History</h2>
        </div>
        {loading ? (
          <p className="p-6 text-sm" style={{ color: '#929292' }}>Loading…</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: '#929292' }}>No rate changes logged yet. Use "Log Rate Change" above.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {events.slice(0, 50).map((e) => {
              const delta = e.old_rate != null ? e.new_rate - Number(e.old_rate) : 0;
              const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
              return (
                <div key={e.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" style={{ color: '#6a6a6a' }} />
                    <span className="text-sm font-semibold" style={{ color: '#222' }}>{e.rate_plan}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: '#222' }}>
                      Stay {e.stay_date} · {e.old_rate ? `$${Number(e.old_rate).toFixed(0)} → ` : ''}${Number(e.new_rate).toFixed(0)}
                    </p>
                    <p className="text-xs" style={{ color: '#929292' }}>
                      {new Date(e.changed_at).toLocaleString()}
                      {e.reason ? ` · ${e.reason}` : ''}
                    </p>
                  </div>
                  {dir !== 'flat' && (
                    <div className="flex items-center gap-1 text-xs font-semibold"
                         style={{ color: dir === 'up' ? '#15803d' : '#b91c1c' }}>
                      {dir === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {delta > 0 ? `+$${delta.toFixed(0)}` : `-$${Math.abs(delta).toFixed(0)}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
