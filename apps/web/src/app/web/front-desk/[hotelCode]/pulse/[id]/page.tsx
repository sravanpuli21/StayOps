import { PulseDetailClient } from './PulseDetailClient';

export default async function PulseDetailPage({ params }: { params: Promise<{ hotelCode: string; id: string }> }) {
  const { hotelCode, id } = await params;
  return <PulseDetailClient hotelCode={hotelCode.toUpperCase()} id={id} />;
}
