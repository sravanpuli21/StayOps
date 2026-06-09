import { PunchClient } from './PunchClient';

export default async function PunchPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <PunchClient hotelCode={hotelCode.toUpperCase()} />;
}
