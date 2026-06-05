'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAcctOs } from '../../_context';
import { CreateRuleModal } from '../_CreateRule';

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const scope = (params.get('scope') as 'global' | 'hotel_level' | null) ?? undefined;
  const prefill = {
    scope: scope ?? (selection.kind === 'hotel' ? 'hotel_level' as const : 'global' as const),
    hotelId: selection.kind === 'hotel' ? selection.hotelId : undefined,
    contains: params.get('contains') ?? undefined,
    vendorName: params.get('vendor') ?? undefined,
  };
  return <CreateRuleModal prefill={prefill} onClose={() => router.push('/web/accounting/rules')} onCreated={(id) => router.prefetch?.(`/web/accounting/rules/${id}`)} />;
}

export default function NewRulePage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
