'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AnalyticsOptOut() {
  const [excluded, setExcluded] = useState<boolean | null>(null);

  useEffect(() => {
    setExcluded(window.localStorage.getItem('stayops_analytics_exclude') === '1');
  }, []);

  function toggle() {
    if (excluded) {
      window.localStorage.removeItem('stayops_analytics_exclude');
      setExcluded(false);
    } else {
      window.localStorage.setItem('stayops_analytics_exclude', '1');
      setExcluded(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f7f7f7' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md" style={{ border: '1px solid #dddddd' }}>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Analytics opt-out</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>
          Control whether this browser reports page views to Vercel Analytics.
          Only affects this browser (localStorage).
        </p>

        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl" style={{
          background: excluded ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${excluded ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {excluded ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
          ) : (
            <XCircle className="w-5 h-5" style={{ color: '#b91c1c' }} />
          )}
          <p className="text-sm font-semibold" style={{ color: excluded ? '#065f46' : '#991b1b' }}>
            {excluded === null ? 'Loading…' : excluded ? 'Excluded — your visits are NOT tracked' : 'Tracked — your visits count in analytics'}
          </p>
        </div>

        <button
          onClick={toggle}
          className="mt-4 w-full h-10 rounded-lg text-sm font-semibold"
          style={{
            background: excluded ? '#ffffff' : '#ff385c',
            color: excluded ? '#6a6a6a' : '#ffffff',
            border: excluded ? '1px solid #dddddd' : 'none',
          }}
        >
          {excluded ? 'Start tracking my visits again' : 'Exclude my visits from analytics'}
        </button>

        <p className="text-xs mt-4" style={{ color: '#929292' }}>
          Note: this flag is per-browser. If you visit from your phone, laptop, or another browser, you'd need to set it there too.
          Clearing your browser data also removes the flag.
        </p>
      </div>
    </div>
  );
}
