'use client';

import { SettingsPanel } from '@/components/common/SettingsPanel';

export default function RishabSettings() {
  return (
    <SettingsPanel
      profile={{
        name: 'Rishab Patel',
        role: 'General Manager',
        hotel: 'Home2 Suites Baton Rouge',
        email: 'rishab@hosmgmt.com',
        phone: '(225) 555-0120',
        initials: 'RP',
        accentColor: '#1e40af',
      }}
    />
  );
}
