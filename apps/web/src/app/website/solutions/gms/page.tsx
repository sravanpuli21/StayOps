import type { Metadata } from 'next';
import { UserCheck } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For General Managers',
  description:
    'Run the property without chasing every department all day. StayOps helps GMs manage room readiness, maintenance, audits, team tasks, and handovers in one place.',
};

export default function GmsPage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For General Managers"
      pill="For General Managers"
      icon={<UserCheck className="w-3.5 h-3.5" />}
      heroHeadline="Run the property without chasing every department all day."
      heroSubcopy="StayOps helps GMs manage room readiness, maintenance, audits, team tasks, and handovers in one place — so the day runs cleaner and owner reporting becomes easier."
      heroCtaLabel="See GM Workflow"
      problemTitle="Most of the day gets lost in follow-ups."
      problemBody="A GM is constantly checking rooms, calling housekeeping, following up with maintenance, answering owners, handling guest issues, and making sure nothing slips. StayOps brings those updates into one system."
      featuresTitle="What GMs can do in StayOps."
      features={[
        'See live room readiness',
        'Track open maintenance issues',
        'Assign tasks by department',
        'See delayed work',
        'Manage audits',
        'Check proof of completion',
        'Review handovers',
        'Generate owner-ready updates',
      ]}
      trustTitle="Less chasing. Better reporting. Cleaner days."
      trustBody="Fewer calls and texts. Clearer department accountability. Faster room turnover. Easier maintenance follow-up. Better audit control. Cleaner owner communication. Less confusion during busy check-in windows."
      ctaTitle="Run the property with fewer blind spots."
      ctaLabel="Book a Demo"
      blobVariant="blue"
      blobHeadline="GM workday"
      blobPills={[
        '47 of 48 rooms clean',
        '2 tickets open',
        'Audit passed',
        'Labour 24.1%',
        'Owner update ready',
      ]}
      relatedLinks={[
        { href: '/website/solutions/owners',       label: 'For Hotel Owners',      description: 'Owner-level visibility across every property.' },
        { href: '/website/solutions/regional',     label: 'For Regional Managers', description: 'Compare property health across hotels.' },
        { href: '/website/solutions/housekeeping', label: 'For Housekeeping',      description: 'Clear rooms, clear proof, less blame.' },
      ]}
    />
  );
}
