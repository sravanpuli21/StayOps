import { notFound } from 'next/navigation';
import { HomePage } from '../_pages';
import type { Flavor } from '../_palette';

export default async function Page({ params }: { params: Promise<{ flavor: string }> }) {
  const { flavor } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  return <HomePage flavor={flavor as Flavor} />;
}

export function generateStaticParams() {
  return [{ flavor: 'night' }, { flavor: 'daylight' }];
}
