import { PunchClient } from './PunchClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskPunchPage({ params }: Props) {
  const { hotelCode } = await params;
  return <PunchClient hotelCode={hotelCode.toUpperCase()} />;
}
