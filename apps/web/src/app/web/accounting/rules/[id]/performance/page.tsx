'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RulePerformanceRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => { router.replace(`/web/accounting/rules/${id}?tab=Performance`); }, [id, router]);
  return null;
}
