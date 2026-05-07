'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, RotateCcw, Smartphone } from 'lucide-react';

// Points at the live Expo web dev server (run `pnpm --filter @hos/mobile web`).
// Falls back to a static export at `/mobile-app/index.html` if/when we build one.
const MOBILE_APP_URL = 'http://localhost:8081';

export default function MobilePage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1a1a1a' }}>
      {/* Top bar */}
      <header
        className="h-14 flex items-center justify-between px-6 flex-shrink-0"
        style={{ background: '#ffffff', borderBottom: '1px solid #dddddd' }}
      >
        <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#222' }}>
          <ArrowLeft className="w-4 h-4" />
          Back to entry
        </Link>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: '#ff385c' }} />
          <span className="text-sm font-semibold" style={{ color: '#222' }}>HOS Mobile — Expo preview</span>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reload
        </button>
      </header>

      {/* Phone frame */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div
          className="rounded-[44px] overflow-hidden relative"
          style={{
            width: 390,
            height: 844,
            background: '#000',
            border: '10px solid #1a1a1a',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 2px #333',
          }}
        >
          {/* Notch */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{
              top: 12,
              width: 120,
              height: 28,
              background: '#000',
              borderRadius: 14,
            }}
          />
          <iframe
            key={reloadKey}
            src={MOBILE_APP_URL}
            title="HOS Mobile preview"
            allow="camera; microphone; geolocation"
            className="w-full h-full"
            style={{ border: 0, background: '#ffffff' }}
          />
        </div>
      </div>

      {/* Footer hint */}
      <footer className="py-4 text-center">
        <Link
          href={MOBILE_APP_URL}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: '#c1c1c1' }}
        >
          Open mobile app full screen
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </div>
  );
}
