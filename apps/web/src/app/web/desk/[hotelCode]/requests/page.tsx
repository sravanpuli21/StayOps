import { RequestsClient } from './RequestsClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskRequestsPage({ params }: Props) {
  const { hotelCode } = await params;
  return <RequestsClient hotelCode={hotelCode.toUpperCase()} />;
}
