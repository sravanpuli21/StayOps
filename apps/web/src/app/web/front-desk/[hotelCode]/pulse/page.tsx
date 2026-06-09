import { PulseListClient } from './PulseListClient';

export default async function PulsePage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <PulseListClient hotelCode={hotelCode.toUpperCase()} />;
}
