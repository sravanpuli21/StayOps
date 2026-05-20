import { HomeClient } from './HomeClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskHomePage({ params }: Props) {
  const { hotelCode } = await params;
  return <HomeClient hotelCode={hotelCode.toUpperCase()} />;
}
