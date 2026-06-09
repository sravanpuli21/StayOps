import { WorkOrderDetailClient } from './WorkOrderDetailClient';

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ hotelCode: string; id: string }> }) {
  const { hotelCode, id } = await params;
  return <WorkOrderDetailClient hotelCode={hotelCode.toUpperCase()} id={id} />;
}
