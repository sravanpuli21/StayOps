import { MoreClient } from './MoreClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

/**
 * Front-desk "More" — profile / help / settings / logout. Each card opens a
 * lightweight modal; Logout returns to the persona picker. Real per-user auth
 * + profile editing arrive in a later phase.
 */
export default async function DeskMorePage({ params }: Props) {
  const { hotelCode } = await params;
  return <MoreClient hotelCode={hotelCode} />;
}
