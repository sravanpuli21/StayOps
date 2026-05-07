'use client';

import { useState } from 'react';
import { User, Bell, Globe, Printer, Shield, LogOut, ChevronRight } from 'lucide-react';

interface SettingsProfile {
  name: string;
  role: string;
  hotel: string;
  email: string;
  phone?: string;
  initials: string;
  accentColor: string;
}

/**
 * Shared settings page body. Each persona's `settings/page.tsx` just renders
 * this with a SettingsProfile prop. Keeps layouts consistent across Kris /
 * Harshal / Rishab / Emma / Sydney.
 */
export function SettingsPanel({ profile }: { profile: SettingsProfile }) {
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Manage your profile, notifications, and preferences
        </p>
      </div>

      {/* Profile card */}
      <Section icon={<User className="w-4 h-4" style={{ color: '#6a6a6a' }} />} title="Profile">
        <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: profile.accentColor, color: '#ffffff' }}
          >
            {profile.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold" style={{ color: '#222' }}>{profile.name}</p>
            <p className="text-xs" style={{ color: '#929292' }}>{profile.role} · {profile.hotel}</p>
          </div>
          <button className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}>
            Edit photo
          </button>
        </div>
        <Row label="Full name" value={profile.name} />
        <Row label="Role" value={profile.role} />
        <Row label="Property" value={profile.hotel} />
        <Row label="Email" value={profile.email} />
        {profile.phone && <Row label="Phone" value={profile.phone} />}
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4" style={{ color: '#6a6a6a' }} />} title="Notifications">
        <Toggle
          label="Critical alerts"
          hint="Urgent tickets, callouts, red flags — sent immediately"
          value={notifCritical}
          onChange={setNotifCritical}
        />
        <Toggle
          label="Daily summary email"
          hint="One email per morning with yesterday's numbers"
          value={notifDaily}
          onChange={setNotifDaily}
        />
        <Toggle
          label="Weekly digest"
          hint="Monday rollup of last week's highlights"
          value={notifWeekly}
          onChange={setNotifWeekly}
        />
      </Section>

      {/* Display */}
      <Section icon={<Globe className="w-4 h-4" style={{ color: '#6a6a6a' }} />} title="Display & language">
        <div className="flex items-center justify-between py-3 px-4">
          <div>
            <p className="text-sm" style={{ color: '#222' }}>Language</p>
            <p className="text-xs" style={{ color: '#929292' }}>Interface + email language</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-9 px-3 text-xs font-semibold rounded-lg outline-none cursor-pointer"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-3 px-4" style={{ borderTop: '1px solid #f0f0f0' }}>
          <div>
            <p className="text-sm" style={{ color: '#222' }}>Theme</p>
            <p className="text-xs" style={{ color: '#929292' }}>Light / Dark — coming soon</p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: '#f7f7f7', color: '#929292' }}>
            Soon
          </span>
        </div>
      </Section>

      {/* Print preferences */}
      <Section icon={<Printer className="w-4 h-4" style={{ color: '#6a6a6a' }} />} title="Print & export">
        <Row label="Paper size" value={'US Letter (8.5" × 11")'} />
        <Row label="Page margins" value="0.4 inch" />
        <Row label="Default format" value="PDF (via browser print)" />
      </Section>

      {/* Account */}
      <Section icon={<Shield className="w-4 h-4" style={{ color: '#6a6a6a' }} />} title="Account">
        <LinkRow label="Change password" hint="Last changed 30+ days ago" />
        <LinkRow label="Two-factor authentication" hint="Not enabled" badge="Recommended" />
        <LinkRow label="Connected sessions" hint="1 active device" />
      </Section>

      {/* Sign out */}
      <button
        className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: '#ffffff', color: '#b91c1c', border: '1px solid #fca5a5' }}
      >
        <LogOut className="w-4 h-4" />
        Sign out of stayops
      </button>

      <p className="text-xs text-center" style={{ color: '#c1c1c1' }}>
        stayops v1.0 · Phase 1 demo · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</p>
      </div>
      <div className="px-2 py-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <p className="text-xs" style={{ color: '#929292' }}>{label}</p>
      <p className="text-sm" style={{ color: '#222' }}>{value}</p>
    </div>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm" style={{ color: '#222' }}>{label}</p>
        <p className="text-xs" style={{ color: '#929292' }}>{hint}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? '#16a34a' : '#d1d5db' }}
        aria-pressed={value}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: value ? 22 : 2, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
        />
      </button>
    </div>
  );
}

function LinkRow({ label, hint, badge }: { label: string; hint: string; badge?: string }) {
  return (
    <button className="w-full flex items-center justify-between py-3 px-4 text-left" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm" style={{ color: '#222' }}>{label}</p>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#b45309' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: '#929292' }}>{hint}</p>
      </div>
      <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
    </button>
  );
}
