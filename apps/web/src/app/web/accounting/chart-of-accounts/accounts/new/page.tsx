'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAcctOs } from '../../../_context';
import { AccountForm } from '../../_AccountForm';

function NewAccountInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const preHotel = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const parent = params.get('parent') ?? undefined;
  const back = () => router.push('/web/accounting/chart-of-accounts/accounts');
  return <AccountForm preHotel={preHotel} parentCode={parent} onClose={back} onSaved={(c) => router.push(`/web/accounting/chart-of-accounts/accounts/${c}`)} />;
}

export default function NewAccountPage() {
  return <Suspense fallback={null}><NewAccountInner /></Suspense>;
}
