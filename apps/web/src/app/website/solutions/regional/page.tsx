import type { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';
import { SolutionPageShell } from '../../_components/SolutionPageShell';

export const metadata: Metadata = {
  title: 'For Regional Managers',
  description:
    'Compare property health without waiting for every report. StayOps helps regional managers see room downtime, audit gaps, maintenance delays, and operational risk across multiple hotels.',
};

export default function RegionalPage() {
  return (
    <SolutionPageShell
      breadcrumbLabel="For Regional Managers"
      pill="For Regional Managers"
      icon={<LayoutDashboard className="w-3.5 h-3.5" />}
      heroHeadline="Compare property health without waiting for every report."
      heroSubcopy="StayOps helps regional managers see room downtime, audit gaps, maintenance delays, open issues, and operational risk across multiple hotels."
      heroCtaLabel="See Regional Dashboard"
      problemTitle="Every property reports differently. Problems are hard to compare."
      problemBody="Regional managers often rely on manual updates from each GM. That makes it difficult to see which property needs attention, where the same issue is repeating, and where operational risk is growing."
      featuresTitle="What regional managers see in StayOps."
      features={[
        'Multi-property dashboard',
        'Open issues by property',
        'Out-of-order room count',
        'Maintenance aging',
        'Missed audits',
        'Task completion',
        'Property health comparison',
        'Recurring issues',
        'Risk summaries',
        'Owner-ready reports',
      ]}
      trustTitle="See which property needs attention first."
      trustBody="StayOps helps regional managers identify struggling properties, repeated issues, and operational bottlenecks before they become bigger financial or guest problems."
      ctaTitle="Bring every property into one view."
      ctaLabel="Book a Demo"
      blobVariant="teal"
      blobHeadline="Regional health"
      blobPills={[
        '16 properties',
        'Cambria · 2 audits missed',
        'Hampton · 5 open tickets',
        'Cotton Sail · trending up',
        '3 properties need attention',
      ]}
      relatedLinks={[
        { href: '/website/solutions/owners', label: 'For Hotel Owners',  description: 'Owner-level visibility across every property.' },
        { href: '/website/solutions/gms',    label: 'For General Managers', description: 'Run the day without chasing every department.' },
        { href: '/website/solutions/maintenance', label: 'For Maintenance', description: 'Know what is broken, what matters first.' },
      ]}
    />
  );
}
