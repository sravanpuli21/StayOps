import { NewServiceRequestClient } from './NewServiceRequestClient';

export default async function NewServiceRequestPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <NewServiceRequestClient hotelCode={hotelCode.toUpperCase()} />;
}
