'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  children: React.ReactNode;
  width?: 'md' | 'lg';
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  backLabel,
  onBack,
  children,
  width = 'md',
}: SlidePanelProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const panelWidth = width === 'lg' ? 'w-[680px]' : 'w-[520px]';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.18)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full ${panelWidth} z-50 flex flex-col transition-transform duration-250 ease-in-out`}
        style={{
          background: '#fff',
          borderLeft: '1px solid #dddddd',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid #dddddd' }}
        >
          <div className="flex-1 min-w-0 pr-4">
            {backLabel && onBack && (
              <button
                onClick={onBack}
                className="text-xs font-medium mb-1.5 flex items-center gap-1 hover:underline"
                style={{ color: '#ff385c' }}
              >
                ← {backLabel}
              </button>
            )}
            <h2 className="text-base font-bold leading-tight truncate" style={{ color: '#222222' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#f7f7f7] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
