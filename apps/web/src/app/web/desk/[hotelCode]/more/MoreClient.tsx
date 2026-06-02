'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, HelpCircle, Settings as SettingsIcon, LogOut, X, ChevronRight, Check } from 'lucide-react';

interface Props { hotelCode: string }

type Panel = 'profile' | 'help' | 'settings' | null;

export function MoreClient({ hotelCode }: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const cards: { key: Panel | 'logout'; icon: typeof User; title: string; subtitle: string; accent: string }[] = [
    { key: 'profile',  icon: User,         title: 'Profile',  subtitle: 'Front-desk session details for this kiosk.', accent: '#0f766e' },
    { key: 'help',     icon: HelpCircle,   title: 'Help',     subtitle: 'Quick guide for the front-desk module.',     accent: '#1d4ed8' },
    { key: 'settings', icon: SettingsIcon, title: 'Settings', subtitle: 'Hotel preferences for this kiosk PC.',       accent: '#6a6a6a' },
    { key: 'logout',   icon: LogOut,       title: 'Logout',   subtitle: 'Sign out of the desk session.',             accent: '#b91c1c' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>More</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotelCode} · settings + help
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => (s.key === 'logout' ? setConfirmLogout(true) : setPanel(s.key as Panel))}
              className="rounded-2xl p-5 text-left flex items-start gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: '#ffffff', border: '1px solid #dddddd' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa', borderLeft: `3px solid ${s.accent}` }}>
                <Icon className="w-5 h-5" style={{ color: s.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#222' }}>{s.title}</p>
                <p className="text-xs mt-1" style={{ color: '#929292' }}>{s.subtitle}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#c1c1c1' }} />
            </button>
          );
        })}
      </div>

      {/* Profile panel */}
      {panel === 'profile' && (
        <Modal title="Front Desk Profile" onClose={() => setPanel(null)}>
          <Row k="Role" v="Front Desk Agent" />
          <Row k="Station" v={`${hotelCode} · Lobby kiosk`} />
          <Row k="Access" v="Rooms · Requests · Callbacks · Punch" />
          <Row k="Shift handover" v="Log all open requests before sign-out" />
          <p className="text-xs mt-2" style={{ color: '#929292' }}>
            Per-user profiles and photo arrive with full auth in a later phase. This kiosk runs a shared front-desk session.
          </p>
        </Modal>
      )}

      {/* Help panel */}
      {panel === 'help' && (
        <Modal title="Front Desk — Quick Guide" onClose={() => setPanel(null)}>
          <Guide n="1" t="Log a request" d="Home → Work Order (Engineering) or Service Request (Housekeeping). Pick a room or hotel area, then the item." />
          <Guide n="2" t="Track requests" d="Requests tab groups everything by status. Tap any row to open the detail, add notes, or change status." />
          <Guide n="3" t="Close callbacks" d="Callbacks tab lists guests needing follow-up. Confirm with the guest, then close." />
          <Guide n="4" t="Rooms grid" d="Rooms tab shows every room by floor. Tap a room to see its open work and log a new request pre-filled." />
          <Guide n="5" t="Punch in / out" d="Punch tab — enter employee ID + PIN on the keypad." />
        </Modal>
      )}

      {/* Settings panel */}
      {panel === 'settings' && (
        <Modal title="Kiosk Settings" onClose={() => setPanel(null)}>
          <Row k="Hotel" v={hotelCode} />
          <Row k="Mode" v="Shared front-desk kiosk" />
          <Row k="Default request type" v="Ask each time" />
          <Row k="Auto-logout" v="Not enabled on this kiosk" />
          <p className="text-xs mt-2" style={{ color: '#929292' }}>
            Kiosk-level preferences are managed by the GM. Contact your manager to change hotel defaults.
          </p>
        </Modal>
      )}

      {/* Logout confirm */}
      {confirmLogout && (
        <Modal title="Sign out?" onClose={() => setConfirmLogout(false)}>
          <p className="text-sm" style={{ color: '#3f3f3f' }}>
            This ends the front-desk session on this kiosk and returns to the persona picker.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setConfirmLogout(false)}
              className="h-9 px-4 rounded-lg text-sm font-semibold"
              style={{ background: '#f7f7f7', color: '#222' }}
            >
              Cancel
            </button>
            <button
              onClick={() => router.push('/web')}
              className="h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#b91c1c', color: '#fff' }}
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[85vh]"
        style={{ border: '1px solid #dddddd' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <p className="text-xs uppercase tracking-wide w-32 flex-shrink-0" style={{ color: '#929292' }}>{k}</p>
      <p className="text-sm" style={{ color: '#222' }}>{v}</p>
    </div>
  );
}

function Guide({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>{n}</div>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#222' }}>{t}</p>
        <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{d}</p>
      </div>
    </div>
  );
}
