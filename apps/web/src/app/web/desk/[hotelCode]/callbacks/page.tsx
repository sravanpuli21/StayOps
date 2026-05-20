import { CallbacksClient } from './CallbacksClient';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

export default async function DeskCallbacksPage({ params }: Props) {
  const { hotelCode } = await params;
  return <CallbacksClient hotelCode={hotelCode.toUpperCase()} />;
}
