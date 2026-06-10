'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { card, Badge, PageHeader, EmptyState, PURPLE } from '../../_ui';
import { SUGGESTED_RULES, RISK_LABEL } from '../_data';

export default function SuggestedRulesPage() {
  const router = useRouter();
  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="All Hotels" title="Suggested Rules" subtitle="StayOps found repeated coding patterns that may become rules." />
      {SUGGESTED_RULES.length === 0 ? <EmptyState icon={<Sparkles className="w-8 h-8" />} title="No suggested rules right now." body="StayOps will suggest rules when it finds repeated coding patterns." /> : (
        <div className="flex flex-col gap-3">
          {SUGGESTED_RULES.map((s, i) => {
            const rl = RISK_LABEL[s.risk];
            return (
              <div key={i} className="p-4 rounded-2xl flex items-start gap-3" style={card}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb', color: PURPLE }}><Sparkles className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="text-sm font-bold" style={{ color: '#222' }}>{s.name}</p>{s.scope === 'global' ? <Badge label="Global" fg={PURPLE} bg="#ece4fb" /> : <Badge label={`Hotel: ${getEntity(s.hotelId!)?.propertyCode}`} fg="#1d4ed8" bg="#dbeafe" />}<Badge label={rl.label} fg={rl.fg} bg={rl.bg} /></div>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{s.pattern}</p>
                  <p className="text-[11px] mt-1" style={{ color: '#6a6a6a' }}>Suggested: {s.action} · {s.matched} matching lines · {s.confidence} confidence</p>
                </div>
                <div className="flex flex-col gap-1.5 self-center">
                  <button onClick={() => router.push('/web/accounting/rules/new')} className="h-8 px-3 rounded-lg text-[11px] font-semibold" style={{ background: PURPLE, color: '#fff' }}>Create Rule</button>
                  <button className="h-8 px-3 rounded-lg text-[11px] font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Ignore</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
