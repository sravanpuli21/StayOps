import { notFound } from 'next/navigation';
import { SolutionSubpagePage } from '../../../_pages';
import { AccountantPage } from '../../../_accountant';
import { SOLUTION_SUBPAGES } from '../../../_site';
import type { Flavor } from '../../../_palette';

export default async function Page({ params }: { params: Promise<{ flavor: string; slug: string }> }) {
  const { flavor, slug } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  if (!SOLUTION_SUBPAGES[slug]) notFound();
  if (slug === 'accountant') return <AccountantPage flavor={flavor as Flavor} />;
  return <SolutionSubpagePage flavor={flavor as Flavor} slug={slug} />;
}

export function generateStaticParams() {
  const flavors = ['night', 'daylight'];
  const slugs = Object.keys(SOLUTION_SUBPAGES);
  return flavors.flatMap((flavor) => slugs.map((slug) => ({ flavor, slug })));
}
