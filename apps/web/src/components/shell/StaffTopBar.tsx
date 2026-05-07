'use client';

import { Bell } from 'lucide-react';

interface StaffTopBarProps {
  firstName: string;
  initials: string;
  title: string;
  accentColor?: string;
}

export function StaffTopBar({ firstName, initials, title, accentColor = '#0f766e' }: StaffTopBarProps) {
  const now = new Date('2026-05-01T08:12:00-04:00');
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <header
      className="h-16 flex items-center gap-4 px-6 flex-shrink-0"
      style={{ background: '#ffffff', borderBottom: '1px solid #dddddd' }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: '#222222' }}>
          Good morning, {firstName}
        </p>
        <p className="text-xs" style={{ color: '#929292' }}>
          {dateStr} · {timeStr}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className="no-print relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
        >
          <Bell className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white font-bold flex items-center justify-center"
            style={{ background: '#ff385c', fontSize: '10px' }}
          >
            2
          </span>
        </button>

        <div
          className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-xl"
          style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: accentColor }}
          >
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium" style={{ color: '#222222' }}>{firstName}</span>
            <span className="text-[10px]" style={{ color: '#929292' }}>{title}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
