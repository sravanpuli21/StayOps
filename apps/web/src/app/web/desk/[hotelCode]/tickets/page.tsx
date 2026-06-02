import { ActiveTicketsClient } from './ActiveTicketsClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskActiveTicketsPage({ params }: Props) {
  const { hotelCode } = await params;
  return <ActiveTicketsClient hotelCode={hotelCode.toUpperCase()} />;
}
