import { CompletedClient } from './CompletedClient';

export default async function CompletedPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <CompletedClient hotelCode={hotelCode.toUpperCase()} />;
}
