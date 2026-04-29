import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { RedFlag } from '@hos/shared';
import { HOTELS } from '@hos/shared';

interface RedFlagsPanelProps {
  flags: RedFlag[];
  title?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    Icon: AlertCircle,
    bg: '#fef2f2',
    border: '#fecaca',
    iconColor: '#dc2626',
    textColor: '#b91c1c',
    label: 'Critical',
    labelBg: '#dc2626',
  },
  warning: {
    Icon: AlertTriangle,
    bg: '#fffbeb',
    border: '#fde68a',
    iconColor: '#d97706',
    textColor: '#92400e',
    label: 'Warning',
    labelBg: '#d97706',
  },
  info: {
    Icon: Info,
    bg: '#eff6ff',
    border: '#bfdbfe',
    iconColor: '#2563eb',
    textColor: '#1e40af',
    label: 'Info',
    labelBg: '#2563eb',
  },
};

export function RedFlagsPanel({ flags, title = 'Red Flags' }: RedFlagsPanelProps) {
  if (flags.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} />
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#222222' }}>
          {title}
        </h3>
        <span
          className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
          style={{ background: '#dc2626' }}
        >
          {flags.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {flags.map((flag) => {
          const cfg = SEVERITY_CONFIG[flag.severity];
          const hotel = HOTELS.find((h) => h.id === flag.hotelId);
          return (
            <div
              key={flag.id}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              <cfg.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.iconColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: cfg.textColor }}>
                  {flag.message}
                </p>
                {hotel && (
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                    {hotel.shortName}
                  </p>
                )}
              </div>
              <span
                className="text-xs font-semibold text-white px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: cfg.labelBg }}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
