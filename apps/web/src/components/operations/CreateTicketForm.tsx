'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { apiKeys } from '@/lib/swr-keys';
import type { ApiRoomSnapshotRow } from '@hos/shared';

type Priority   = 'urgent' | 'high' | 'normal' | 'low';
type Department = 'Front Desk' | 'Housekeeping' | 'Maintenance';

interface Props {
  hotelCode: string;
  /** Rooms for the picker — sourced from /api/ops/property-rooms. */
  rooms: ApiRoomSnapshotRow[];
  /** Pre-fill the room number when the user opened the form via a tile click. */
  initialRoomNumber?: string;
  /** Optional callback fired after a successful insert. */
  onCreated?: () => void;
}

/**
 * Front-desk-friendly request types from the spec. Each maps to a default
 * department so the agent rarely has to think about routing.
 */
const REQUEST_TYPES: { label: string; department: Department; ticketType: 'reactive' }[] = [
  { label: 'Extra towels',          department: 'Housekeeping', ticketType: 'reactive' },
  { label: 'Extra blanket',         department: 'Housekeeping', ticketType: 'reactive' },
  { label: 'Room cleaning request', department: 'Housekeeping', ticketType: 'reactive' },
  { label: 'AC not working',        department: 'Maintenance',  ticketType: 'reactive' },
  { label: 'TV not working',        department: 'Maintenance',  ticketType: 'reactive' },
  { label: 'Plumbing issue',        department: 'Maintenance',  ticketType: 'reactive' },
  { label: 'Door lock issue',       department: 'Maintenance',  ticketType: 'reactive' },
  { label: 'Noise complaint',       department: 'Front Desk',   ticketType: 'reactive' },
  { label: 'Missing item',          department: 'Front Desk',   ticketType: 'reactive' },
  { label: 'General complaint',     department: 'Front Desk',   ticketType: 'reactive' },
  { label: 'Other',                 department: 'Front Desk',   ticketType: 'reactive' },
];

const DEPARTMENTS: Department[] = ['Front Desk', 'Housekeeping', 'Maintenance'];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low',    label: 'Low',    color: '#94a3b8' },
  { value: 'normal', label: 'Normal', color: '#3b82f6' },
  { value: 'high',   label: 'High',   color: '#d97706' },
  { value: 'urgent', label: 'Urgent', color: '#b91c1c' },
];

export function CreateTicketForm({ hotelCode, rooms, initialRoomNumber, onCreated }: Props) {
  const [roomNumber, setRoomNumber]       = useState<string>(initialRoomNumber ?? '');
  const [area, setArea]                   = useState<string>('');
  const [useArea, setUseArea]             = useState<boolean>(false);
  const [requestType, setRequestType]     = useState<string>('');
  const [department, setDepartment]       = useState<Department>('Front Desk');
  const [title, setTitle]                 = useState<string>('');
  const [description, setDescription]     = useState<string>('');
  const [priority, setPriority]           = useState<Priority>('normal');
  const [callbackRequired, setCallback]   = useState<boolean>(false);
  const [reportedBy, setReportedBy]       = useState<string>('');
  const [submitting, setSubmitting]       = useState<boolean>(false);
  const [error, setError]                 = useState<string | null>(null);
  const [confirm, setConfirm]             = useState<string | null>(null);

  const sortedRooms = [...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

  // When the user picks a request type, default the title + department + callback flag.
  const handleRequestTypeChange = (label: string) => {
    setRequestType(label);
    const opt = REQUEST_TYPES.find((r) => r.label === label);
    if (opt) {
      setDepartment(opt.department);
      // Default title to the request label so the agent can submit fast.
      if (!title) setTitle(label);
      // Maintenance / Plumbing-type issues default to needing a callback.
      if (opt.department === 'Maintenance') setCallback(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirm(null);

    const finalTitle = title.trim() || requestType.trim();
    if (!finalTitle) { setError('Tell us what the request is about'); return; }
    if (!useArea && !roomNumber) { setError('Pick a room or switch to area'); return; }
    if (useArea && !area.trim()) { setError('Area is required'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ops/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          hotelCode,
          roomNumber:       useArea ? undefined : roomNumber,
          area:             useArea ? area.trim() : undefined,
          type:             'reactive',
          priority,
          title:            finalTitle,
          description:      description.trim() || undefined,
          reportedBy:       reportedBy.trim() || undefined,
          department,
          requestType:      requestType || undefined,
          callbackRequired,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Failed to create request');
        return;
      }
      // Reset form, refresh data.
      setTitle('');
      setDescription('');
      setRoomNumber(initialRoomNumber ?? '');
      setArea('');
      setUseArea(false);
      setRequestType('');
      setDepartment('Front Desk');
      setPriority('normal');
      setCallback(false);
      setConfirm('Request logged.');
      mutate(apiKeys.opsTickets(hotelCode)[0]);
      mutate((key) => typeof key === 'string' && key.startsWith('/api/ops/property-stats') && key.includes(hotelCode));
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const lblCls = 'text-[11px] font-semibold uppercase tracking-wide';
  const inputCls = 'w-full h-9 px-3 rounded-lg outline-none focus:ring-2 focus:ring-[#ff385c] text-sm';
  const inputStyle = { border: '1px solid #dddddd', background: '#ffffff', color: '#222' };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ border: '1px solid #dddddd', background: '#ffffff' }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold" style={{ color: '#222' }}>New Guest Request</h3>
        <span className="text-xs" style={{ color: '#929292' }}>{hotelCode}</span>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Location</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setUseArea(false)}
              className="flex-1 h-9 px-3 rounded-lg text-sm font-semibold"
              style={{
                background: !useArea ? '#222' : '#f7f7f7',
                color: !useArea ? '#fff' : '#6a6a6a',
              }}
            >Room</button>
            <button
              type="button"
              onClick={() => setUseArea(true)}
              className="flex-1 h-9 px-3 rounded-lg text-sm font-semibold"
              style={{
                background: useArea ? '#222' : '#f7f7f7',
                color: useArea ? '#fff' : '#6a6a6a',
              }}
            >Area</button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>{useArea ? 'Area name' : 'Room number'}</label>
          {useArea ? (
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Lobby, Pool deck, …"
              className={inputCls}
              style={inputStyle}
            />
          ) : (
            <select
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">Select a room…</option>
              {sortedRooms.map((r) => (
                <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} · {r.type}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Request type + department */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Request type</label>
          <select
            value={requestType}
            onChange={(e) => handleRequestTypeChange(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">Select a type…</option>
            {REQUEST_TYPES.map((r) => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className={inputCls}
            style={inputStyle}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Title (free text — defaults to request type) */}
      <div className="flex flex-col gap-1">
        <label className={lblCls} style={{ color: '#6a6a6a' }}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={requestType || 'AC not cooling, faucet leak, …'}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* Priority + callback */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Priority</label>
          <div className="flex gap-1">
            {PRIORITY_OPTIONS.map((o) => {
              const active = priority === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setPriority(o.value)}
                  className="flex-1 h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  style={{
                    background: active ? '#222' : '#f7f7f7',
                    color: active ? '#fff' : '#6a6a6a',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: o.color }} />
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Callback required</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCallback(false)}
              className="flex-1 h-9 px-3 rounded-lg text-sm font-semibold"
              style={{
                background: !callbackRequired ? '#222' : '#f7f7f7',
                color: !callbackRequired ? '#fff' : '#6a6a6a',
              }}
            >No</button>
            <button
              type="button"
              onClick={() => setCallback(true)}
              className="flex-1 h-9 px-3 rounded-lg text-sm font-semibold"
              style={{
                background: callbackRequired ? '#ff385c' : '#f7f7f7',
                color: callbackRequired ? '#fff' : '#6a6a6a',
              }}
            >Yes</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={lblCls} style={{ color: '#6a6a6a' }}>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Anything the team should know."
          className="w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#ff385c] text-sm resize-y"
          style={inputStyle}
        />
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className={lblCls} style={{ color: '#6a6a6a' }}>Your name (optional)</label>
          <input
            type="text"
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
            placeholder="Front Desk"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-9 px-5 rounded-lg text-sm font-semibold transition-opacity"
          style={{
            background: '#ff385c',
            color: '#fff',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Logging…' : 'Submit request'}
        </button>
      </div>

      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
      {confirm && <p className="text-xs" style={{ color: '#15803d' }}>{confirm}</p>}
    </form>
  );
}
