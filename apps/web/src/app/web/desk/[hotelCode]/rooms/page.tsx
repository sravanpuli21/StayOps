import { RoomsClient } from './RoomsClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskRoomsPage({ params }: Props) {
  const { hotelCode } = await params;
  return <RoomsClient hotelCode={hotelCode.toUpperCase()} />;
}
