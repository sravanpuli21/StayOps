import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For Maintenance Teams',
  description:
    'Know what is broken, what matters first, and what was fixed. StayOps gives maintenance teams clear tickets with photos, priorities, room impact, and repair history.',
};

export default function MaintenancePage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For Maintenance Teams"
      pill="For Maintenance Teams"
      icon={<Wrench className="w-3.5 h-3.5" />}
      heroHeadline="Know what is broken, what matters first, and what was fixed."
      heroSubcopy="StayOps gives maintenance teams clear tickets with photos, priorities, room impact, and repair history — so work does not get lost in calls or verbal handovers."
      heroCtaLabel="See Maintenance Flow"
      problemTitle="Maintenance issues should not live in texts, calls, and memory."
      problemBody="When requests are unclear, maintenance teams waste time asking questions, finding the room, understanding the issue, or proving the fix. StayOps gives every issue a clear record."
      featuresTitle="What maintenance can do in StayOps."
      features={[
        'Receive tickets with photos',
        'See priority level',
        'View room or asset details',
        'Add repair notes',
        'Upload proof of completion',
        'Track repeat issues',
        'See repair history',
        'Mark room ready after resolution',
      ]}
      trustTitle="Fewer random calls. Better repair history. Clearer work."
      trustBody="StayOps helps maintenance teams understand what needs attention first and keeps a record of what was done. It reduces calls, protects completed work, and builds the repair history owners use to spot recurring issues."
      ctaTitle="Fix issues with clarity and proof."
      ctaLabel="See Maintenance Flow"
      blobVariant="amber"
      blobHeadline="Today's tickets"
      blobPills={[
        '7 assigned',
        'Room 214 · AC unit',
        'Priority · Room 301',
        '3 closed with photos',
        'Repeat issue flagged',
      ]}
      relatedLinks={[
        { href: '/website/solutions/housekeeping', label: 'For Housekeeping',   description: 'Clear rooms, clear proof, less blame.' },
        { href: '/website/solutions/gms',          label: 'For General Managers', description: 'Run the day without chasing every department.' },
        { href: '/website/solutions/owners',       label: 'For Hotel Owners',    description: 'Owner-level visibility across every property.' },
      ]}
    />
  );
}
