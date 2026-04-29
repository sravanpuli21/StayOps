'use client';

import { X } from 'lucide-react';

interface FilterPill {
  label: string;
  value: string;
  onRemove?: () => void;
}

interface Props {
  filters: FilterPill[];
  className?: string;
}

export function FilterPillRow({ filters, className }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {filters.map((f, i) => (
        <div
          key={`${f.label}-${i}`}
          className="flex items-center rounded-full text-sm pl-3 pr-1 py-1"
          style={{
            background: '#f7f7f7',
            border: '1px solid #dddddd',
          }}
        >
          <span style={{ color: '#6a6a6a' }}>{f.label}:</span>
          <span className="ml-1 font-semibold" style={{ color: '#222222' }}>
            {f.value}
          </span>
          {f.onRemove && (
            <button
              onClick={f.onRemove}
              className="ml-2 flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-white"
              aria-label={`Remove ${f.label} filter`}
              style={{ color: '#6a6a6a' }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
