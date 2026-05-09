'use client';

import { Analytics } from '@vercel/analytics/next';

/**
 * Wraps Vercel Analytics with a localStorage-based opt-out.
 * Set `stayops_analytics_exclude=1` in localStorage (via /analytics-opt-out)
 * and no events fire from that browser.
 */
export function AnalyticsGate() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (typeof window !== 'undefined' && window.localStorage.getItem('stayops_analytics_exclude') === '1') {
          return null;
        }
        return event;
      }}
    />
  );
}
