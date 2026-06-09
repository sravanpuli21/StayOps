import { HomeClient } from './HomeClient';

export default async function FrontDeskHomePage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <HomeClient hotelCode={hotelCode.toUpperCase()} />;
}
