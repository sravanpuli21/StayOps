import { notFound } from 'next/navigation';
import { CompanyOverviewPage } from '../../_pages';
import type { Flavor } from '../../_palette';

export default async function Page({ params }: { params: Promise<{ flavor: string }> }) {
  const { flavor } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  return <CompanyOverviewPage flavor={flavor as Flavor} />;
}
