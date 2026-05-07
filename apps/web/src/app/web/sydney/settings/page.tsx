'use client';

import { SettingsPanel } from '@/components/common/SettingsPanel';

export default function SydneySettings() {
  return (
    <SettingsPanel
      profile={{
        name: 'Sydney Rivera',
        role: 'Maintenance & Engineering Supervisor',
        hotel: 'Home2 Suites Baton Rouge',
        email: 'sydney@hosmgmt.com',
        phone: '(225) 555-0110',
        initials: 'SR',
        accentColor: '#7c3aed',
      }}
    />
  );
}
