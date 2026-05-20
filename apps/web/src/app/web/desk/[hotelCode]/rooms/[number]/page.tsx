import { RoomDetailClient } from './RoomDetailClient';

interface Props {
  params: Promise<{ hotelCode: string; number: string }>;
}

export default async function RoomDetailPage({ params }: Props) {
  const { hotelCode, number } = await params;
  return <RoomDetailClient hotelCode={hotelCode.toUpperCase()} roomNumber={number} />;
}
