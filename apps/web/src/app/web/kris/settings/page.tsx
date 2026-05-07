'use client';

import { SettingsPanel } from '@/components/common/SettingsPanel';

export default function KrisSettings() {
  return (
    <SettingsPanel
      profile={{
        name: 'Kris Patel',
        role: 'Managing Director · Owner',
        hotel: '16-hotel portfolio',
        email: 'kris@hosmgmt.com',
        phone: '(912) 555-0001',
        initials: 'KP',
        accentColor: '#ff385c',
      }}
    />
  );
}
