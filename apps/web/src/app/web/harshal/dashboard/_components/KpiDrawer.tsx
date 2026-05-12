'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface KpiDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Slide-in detail panel anchored to the left edge of the main content area.
 * Opens when a KPI tile is clicked; closes on X, scrim click, or Escape.
 */
export function KpiDrawer({ open, onClose, title, subtitle, children }: KpiDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          background: 'rgba(0,0,0,0.35)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 'min(620px, calc(100vw - 64px))',
          background: '#ffffff',
          borderLeft: '1px solid #dddddd',
          boxShadow: '-16px 0 40px -8px rgba(0,0,0,0.2), -4px 0 12px rgba(0,0,0,0.06)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <header
          className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid #dddddd' }}
        >
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: '#222' }}>{title}</h2>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex w-9 h-9 items-center justify-center rounded-full flex-shrink-0"
            style={{ border: '1px solid #dddddd', color: '#222', background: '#f7f7f7' }}
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </aside>
    </>
  );
}
