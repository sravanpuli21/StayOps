import { NewRequestClient } from './NewRequestClient';

interface Props {
  params:       Promise<{ hotelCode: string }>;
  searchParams: Promise<{ type?: string; room?: string; area?: string }>;
}

export default async function NewRequestPage({ params, searchParams }: Props) {
  const { hotelCode } = await params;
  const { type, room, area } = await searchParams;
  const initialType =
    type === 'work-order' ? 'work-order'
    : type === 'service-request' ? 'service-request'
    : null;
  return (
    <NewRequestClient
      hotelCode={hotelCode.toUpperCase()}
      initialType={initialType}
      initialRoom={room ?? ''}
      initialArea={area ?? ''}
    />
  );
}
