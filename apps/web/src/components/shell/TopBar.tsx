'use client';

import { Search, Printer, Bell, ChevronDown } from 'lucide-react';
import { HotelSelector } from './HotelSelector';
import { DateFilter } from './DateFilter';
import { RED_FLAGS } from '@hos/shared';

const criticalCount = RED_FLAGS.filter((f) => f.severity === 'critical').length;

export function TopBar() {
  return (
    <header
      className="h-16 flex items-center gap-4 px-6 flex-shrink-0"
      style={{ background: '#ffffff', borderBottom: '1px solid #dddddd' }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          style={{ color: '#c1c1c1' }}
        />
        <input
          type="text"
          placeholder="Search hotels, metrics…"
          className="w-full h-9 pl-8 pr-3 text-xs rounded-xl outline-none"
          style={{
            background: '#f7f7f7',
            border: '1px solid #dddddd',
            color: '#222222',
          }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <HotelSelector />
        <DateFilter />

        {/* Print */}
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-colors"
          style={{
            background: '#f7f7f7',
            border: '1px solid #dddddd',
            color: '#6a6a6a',
          }}
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>

        {/* Alerts bell */}
        <button
          className="no-print relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{
            background: '#f7f7f7',
            border: '1px solid #dddddd',
          }}
        >
          <Bell className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          {criticalCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ background: '#ff385c', fontSize: '10px' }}
            >
              {criticalCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          className="no-print flex items-center gap-2 h-9 pl-1 pr-3 rounded-xl transition-colors"
          style={{
            background: '#f7f7f7',
            border: '1px solid #dddddd',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#ff385c' }}
          >
            KP
          </div>
          <span className="text-xs font-medium" style={{ color: '#222222' }}>
            Kirit
          </span>
          <ChevronDown className="w-3 h-3" style={{ color: '#929292' }} />
        </button>
      </div>
    </header>
  );
}
