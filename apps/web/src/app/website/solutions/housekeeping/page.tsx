import type { Metadata } from 'next';
import { Bed } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For Housekeeping Teams',
  description:
    'Clear room assignments. Faster turnovers. Less confusion. StayOps helps housekeeping teams know which rooms need attention, what matters first, and how to show work is completed.',
};

export default function HousekeepingPage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For Housekeeping Teams"
      pill="For Housekeeping Teams"
      icon={<Bed className="w-3.5 h-3.5" />}
      heroHeadline="Clear room assignments. Faster turnovers. Less confusion."
      heroSubcopy="StayOps helps housekeeping teams know which rooms need attention, what matters first, and how to show work is completed."
      heroCtaLabel="See Housekeeping Flow"
      problemTitle="Room changes move fast. Paper and calls slow teams down."
      problemBody="Rooms change from occupied to vacant, dirty to clean, inspected to ready, and sometimes blocked for maintenance. StayOps helps housekeeping see priorities clearly and update room status faster."
      featuresTitle="What housekeeping can do in StayOps."
      features={[
        'See assigned rooms',
        'View priority rooms',
        'Mark rooms cleaned',
        'Add notes or photos',
        'Report maintenance issues',
        'See late checkout or early arrival priority',
        'Track inspected rooms',
        'Prove completed work',
      ]}
      trustTitle="Clear work. Clear proof. Less blame."
      trustBody="StayOps records what was assigned, what was completed, and when updates were made. That helps housekeeping teams avoid confusion and show their work clearly. It is not built to watch you — it is built to protect your work."
      ctaTitle="Make room turnover easier to manage."
      ctaLabel="See the Workflow"
      blobVariant="rose"
      blobHeadline="My shift"
      blobPills={[
        '14 rooms assigned',
        '3 priority rooms',
        '11 marked clean',
        '1 ticket reported',
        'Shift complete',
      ]}
      relatedLinks={[
        { href: '/website/solutions/maintenance', label: 'For Maintenance',  description: 'Clear tickets, photos, priorities.' },
        { href: '/website/solutions/front-desk',  label: 'For Front Desk',   description: 'Room status before the guest asks.' },
        { href: '/website/solutions/gms',         label: 'For General Managers', description: 'Run the day without chasing every department.' },
      ]}
    />
  );
}
