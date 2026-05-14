import { notFound } from 'next/navigation';
import { getPalette, type Flavor } from '../_palette';
import { FlavoredSiteNav, FlavoredSiteFooter } from '../_shell';

export default async function FlavorLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ flavor: string }>;
}) {
  const { flavor } = await params;
  if (flavor !== 'night' && flavor !== 'daylight') notFound();
  const palette = getPalette(flavor as Flavor);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: palette.pageBg, color: palette.text }}>
      <FlavoredSiteNav palette={palette} flavor={flavor as Flavor} />
      <div className="flex-1">{children}</div>
      <FlavoredSiteFooter palette={palette} flavor={flavor as Flavor} />
    </div>
  );
}
