import { notFound } from 'next/navigation';
import { ProductSubpagePage } from '../../../_pages';
import { PRODUCT_SUBPAGES } from '../../../_site';
import type { Flavor } from '../../../_palette';

export default async function Page({ params }: { params: Promise<{ flavor: string; slug: string }> }) {
  const { flavor, slug } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  if (!PRODUCT_SUBPAGES[slug]) notFound();
  return <ProductSubpagePage flavor={flavor as Flavor} slug={slug} />;
}

export function generateStaticParams() {
  const flavors = ['night', 'daylight'];
  const slugs = Object.keys(PRODUCT_SUBPAGES);
  return flavors.flatMap((flavor) => slugs.map((slug) => ({ flavor, slug })));
}
