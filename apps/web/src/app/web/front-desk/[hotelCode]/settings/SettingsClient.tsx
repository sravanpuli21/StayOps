'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Monitor, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { DEVICE_NAME } from '../_data';
import { resetFrontDesk } from '../_store';
import { fdCard, Badge } from '../_ui';

interface Props { hotelCode: string; hotelName: string }

export function SettingsClient({ hotelCode, hotelName }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const [deviceName, setDeviceName] = useState(DEVICE_NAME);
  const [renaming, setRenaming] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [lastLogin, setLastLogin] = useState<string>('');

  useEffect(() => { setLastLogin(new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })); }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Settings</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>This computer's front desk access settings.</p></div>

      <div className="rounded-2xl p-5 flex flex-col gap-4" style={fdCard}>
        <div className="flex items-center gap-3" style={{ paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#fff0f3' }}><Monitor className="w-6 h-6" style={{ color: '#ff385c' }} /></div>
          <div className="flex-1">
            {renaming ? (
              <div className="flex gap-2"><input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm flex-1" style={{ border: '1px solid #dddddd', color: '#222' }} /><button onClick={() => setRenaming(false)} className="h-9 px-3 rounded-lg text-xs font-bold" style={{ background: '#ff385c', color: '#fff' }}>Save</button></div>
            ) : (
              <><p className="text-base font-bold" style={{ color: '#222' }}>{deviceName}</p><p className="text-xs" style={{ color: '#929292' }}>Shared front desk computer</p></>
            )}
          </div>
          {!renaming && <button onClick={() => setRenaming(true)} className="text-sm font-semibold" style={{ color: '#ff385c' }}>Rename</button>}
        </div>

        <Row k="Current company" v="HOS Management" />
        <Row k="Current hotel" v={hotelName} />
        <Row k="Access type" v={<Badge label="Front Desk Access" fg="#ff385c" bg="#fff0f3" />} />
        <Row k="Last login" v={lastLogin || '—'} />
        <Row k="Sync status" v={<Badge label="All changes saved on this device" fg="#15803d" bg="#dcfce7" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button onClick={() => { resetFrontDesk(); setRefreshed(true); setTimeout(() => setRefreshed(false), 1800); }} className="flex-1 h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: refreshed ? '#15803d' : '#6a6a6a' }}>{refreshed ? <><CheckCircle2 className="w-4 h-4" /> Refreshed</> : <><RefreshCw className="w-4 h-4" /> Refresh Data</>}</button>
        <Link href={`${base}/home`} className="flex-1 h-11 leading-[44px] text-center rounded-xl text-sm font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back to Home</Link>
        <button className="flex-1 h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5" style={{ background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c' }}><LogOut className="w-4 h-4" /> Logout Front Desk Device</button>
      </div>
      <p className="text-[11px] text-center" style={{ color: '#cfcfcf' }}>Refresh Data resets this demo device back to its starting state.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) { return <div className="flex items-center justify-between gap-3"><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-semibold" style={{ color: '#222' }}>{v}</span></div>; }
