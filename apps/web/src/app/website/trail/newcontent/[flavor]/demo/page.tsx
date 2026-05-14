import { notFound } from 'next/navigation';
import { DemoPage } from '../../_pages';
import type { Flavor } from '../../_palette';

export default async function Page({ params }: { params: Promise<{ flavor: string }> }) {
  const { flavor } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  return <DemoPage flavor={flavor as Flavor} />;
}
