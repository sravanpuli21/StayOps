import { OpenWorkOrdersClient } from './OpenWorkOrdersClient';

export default async function WorkOrdersPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <OpenWorkOrdersClient hotelCode={hotelCode.toUpperCase()} />;
}
