'use client';

import { SettingsPanel } from '@/components/common/SettingsPanel';

export default function EmmaSettings() {
  return (
    <SettingsPanel
      profile={{
        name: 'Emma Johnson',
        role: 'Housekeeping Supervisor',
        hotel: 'Home2 Suites Baton Rouge',
        email: 'emma@hosmgmt.com',
        phone: '(225) 555-0188',
        initials: 'EJ',
        accentColor: '#428bff',
      }}
    />
  );
}
