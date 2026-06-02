'use client';

import { useAccountingDemo } from '@/lib/accounting-demo-context';

export function DemoDataToggle() {
  const { mode, setMode } = useAccountingDemo();
  const seg = (active: boolean) => ({
    background: active ? '#222222' : 'transparent',
    color: active ? '#ffffff' : '#6a6a6a',
  });
  return (
    <div
      className="inline-flex items-center text-xs font-semibold rounded-full p-0.5"
      style={{ border: '1px solid #dddddd', background: '#ffffff' }}
    >
      <button
        type="button"
        onClick={() => setMode('seeded')}
        className="px-3 py-1 rounded-full transition-colors"
        style={seg(mode === 'seeded')}
      >
        Seeded · 3 mo
      </button>
      <button
        type="button"
        onClick={() => setMode('empty')}
        className="px-3 py-1 rounded-full transition-colors"
        style={seg(mode === 'empty')}
      >
        Empty
      </button>
    </div>
  );
}
