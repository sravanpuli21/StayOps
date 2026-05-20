import { RequestDetailClient } from './RequestDetailClient';

interface Props {
  params: Promise<{ hotelCode: string; id: string }>;
}

export default async function RequestDetailPage({ params }: Props) {
  const { hotelCode, id } = await params;
  return <RequestDetailClient hotelCode={hotelCode.toUpperCase()} ticketId={id} />;
}
