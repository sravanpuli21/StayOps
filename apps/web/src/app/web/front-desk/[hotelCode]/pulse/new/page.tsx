import { NewPulseClient } from './NewPulseClient';

export default async function NewPulsePage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  return <NewPulseClient hotelCode={hotelCode.toUpperCase()} />;
}
