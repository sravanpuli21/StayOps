import { OpenServiceRequestsClient } from './OpenServiceRequestsClient';

export default async function ServiceRequestsPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <OpenServiceRequestsClient hotelCode={hotelCode.toUpperCase()} />;
}
