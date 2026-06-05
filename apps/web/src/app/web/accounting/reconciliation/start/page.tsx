'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAcctOs } from '../../_context';
import { StartFlow } from '../_StartFlow';

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const preHotel = params.get('hotel') ?? (selection.kind === 'hotel' ? selection.hotelId : undefined);
  const preAccount = params.get('account') ?? undefined;
  return <StartFlow preHotel={preHotel ?? undefined} preAccountId={preAccount} onClose={() => router.push('/web/accounting/reconciliation')} />;
}

export default function StartReconciliationPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
