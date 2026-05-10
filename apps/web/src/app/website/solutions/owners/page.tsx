import type { Metadata } from 'next';
import { Eye } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For Hotel Owners',
  description:
    'See what is happening across every property without chasing updates. StayOps gives hotel owners one control room for rooms, maintenance, audits, labour, inventory, and operational risks.',
};

export default function OwnersPage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For Hotel Owners"
      pill="For Hotel Owners"
      icon={<Eye className="w-3.5 h-3.5" />}
      heroHeadline="See what is happening across every property without chasing updates."
      heroSubcopy="StayOps gives hotel owners one control room for rooms, maintenance, audits, labour, inventory, and operational risks — so you can protect revenue and run cleaner properties."
      heroCtaLabel="Book an Owner Demo"
      problemTitle="You should not need ten phone calls to know what is happening."
      problemBody="Owners often depend on GMs, supervisors, paper reports, WhatsApp messages, spreadsheets, and delayed updates to understand property operations. By the time an issue reaches you, money may already be lost. StayOps helps you see problems earlier."
      featuresTitle="Owner-level visibility in one place."
      features={[
        'Rooms out of order',
        'Room downtime',
        'Open maintenance issues',
        'Missed audits',
        'Labour activity',
        'Inventory and asset issues',
        'Recurring room problems',
        'Revenue at risk',
        'Property health summaries',
        'Cross-property comparison',
      ]}
      trustTitle="Built to help your team use it properly."
      trustBody="StayOps is designed for teams on the ground. Employees get clear tasks, simple updates, and proof of work. Owners get visibility without making the team feel watched."
      ctaTitle="Get control without adding more chaos."
      ctaLabel="Book an Owner Demo"
      blobVariant="amber"
      blobHeadline="Owner dashboard"
      blobPills={[
        '16 properties',
        '4 rooms OOO',
        '12 open tickets',
        '$8,240 at risk',
        '1 missed audit',
      ]}
      relatedLinks={[
        { href: '/website/solutions/gms',          label: 'For General Managers',      description: 'Run the day without chasing every department.' },
        { href: '/website/solutions/regional',     label: 'For Regional Managers',     description: 'Compare property health across hotels.' },
        { href: '/website/solutions/housekeeping', label: 'For Housekeeping Teams',    description: 'Clear rooms, clear proof, less blame.' },
      ]}
    />
  );
}
