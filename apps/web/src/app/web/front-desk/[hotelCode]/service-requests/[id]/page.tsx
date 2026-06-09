import { ServiceRequestDetailClient } from './ServiceRequestDetailClient';

export default async function ServiceRequestDetailPage({ params }: { params: Promise<{ hotelCode: string; id: string }> }) {
  const { hotelCode, id } = await params;
  return <ServiceRequestDetailClient hotelCode={hotelCode.toUpperCase()} id={id} />;
}
