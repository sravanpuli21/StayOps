import { HomeBoardClient } from './HomeBoardClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskHomeBoardPage({ params }: Props) {
  const { hotelCode } = await params;
  return <HomeBoardClient hotelCode={hotelCode.toUpperCase()} />;
}
