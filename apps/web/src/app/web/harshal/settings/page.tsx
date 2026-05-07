'use client';

import { SettingsPanel } from '@/components/common/SettingsPanel';

export default function HarshalSettings() {
  return (
    <SettingsPanel
      profile={{
        name: 'Harshal Patel',
        role: 'Regional Director of Operations',
        hotel: '8-hotel region · LA, FL, TX',
        email: 'harshal@hosmgmt.com',
        phone: '(225) 555-0002',
        initials: 'HP',
        accentColor: '#222222',
      }}
    />
  );
}
