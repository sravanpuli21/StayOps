'use client';

import { Suspense } from 'react';
import { UploadFlow } from '../../_UploadFlow';

export default function CardUploadPage() {
  return (
    <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}>
      <UploadFlow kind="credit-card" />
    </Suspense>
  );
}
