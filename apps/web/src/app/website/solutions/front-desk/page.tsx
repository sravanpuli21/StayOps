import type { Metadata } from 'next';
import { ConciergeBell } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For Front Desk Teams',
  description:
    'Know room status before the guest asks. StayOps helps front desk teams see which rooms are ready, delayed, blocked, or under maintenance — before the guest is standing at the counter.',
};

export default function FrontDeskPage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For Front Desk Teams"
      pill="For Front Desk Teams"
      icon={<ConciergeBell className="w-3.5 h-3.5" />}
      heroHeadline="Know room status before the guest asks."
      heroSubcopy="StayOps helps front desk teams see which rooms are ready, delayed, blocked, or under maintenance — before the guest is standing at the counter."
      heroCtaLabel="See Front Desk Flow"
      problemTitle="The front desk feels every operations delay first."
      problemBody="When a room is not ready, a maintenance issue is unresolved, or housekeeping status is unclear, the front desk has to explain it to the guest. StayOps gives front desk clearer visibility before problems reach the counter."
      featuresTitle="What front desk can see in StayOps."
      features={[
        'Ready rooms',
        'Delayed rooms',
        'Out-of-order rooms',
        'Maintenance blockers',
        'Housekeeping progress',
        'Priority rooms',
        'Guest-impacting issues',
        'Notes from teams',
      ]}
      trustTitle="Fewer awkward calls. Better guest communication."
      trustBody="StayOps helps front desk teams answer with confidence and coordinate faster with housekeeping and maintenance. Fewer surprises at the counter, fewer unhappy guests, fewer unnecessary phone calls."
      ctaTitle="Give front desk a clearer view of room readiness."
      ctaLabel="See Front Desk Flow"
      blobVariant="green"
      blobHeadline="Arrivals today"
      blobPills={[
        '32 arrivals',
        '28 rooms ready',
        '3 delayed · ETA 2:30pm',
        '1 blocked · maintenance',
        '4 VIP notes',
      ]}
      relatedLinks={[
        { href: '/website/solutions/housekeeping', label: 'For Housekeeping',  description: 'Clear rooms, clear proof, less blame.' },
        { href: '/website/solutions/maintenance',  label: 'For Maintenance',   description: 'Clear tickets, photos, priorities.' },
        { href: '/website/solutions/gms',          label: 'For General Managers', description: 'Run the day without chasing every department.' },
      ]}
    />
  );
}
