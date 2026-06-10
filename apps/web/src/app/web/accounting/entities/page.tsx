'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Landmark, CreditCard, ChevronRight, MapPin, Plus } from 'lucide-react';
import { HOTEL_ENTITIES, bankAccountsForHotel, creditCardsForHotel, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { card, money, Badge, PageHeader, PURPLE } from '../_ui';

export default function EntitiesPage() {
  const { selection, selectHotel } = useAcctOs();
  if (selection.kind === 'hotel') return <EntityDetail hotelId={selection.hotelId} />;
  return <EntityList onOpen={selectHotel} />;
}

function EntityList({ onOpen }: { onOpen: (id: string) => void }) {
  const router = useRouter();
  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <PageHeader scope="All Hotels" title="Hotel Entities" subtitle="Every hotel is its own accounting entity — its own legal company, bank accounts, cards, and books." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {HOTEL_ENTITIES.map((h) => {
          const banks = bankAccountsForHotel(h.id).length;
          const cards = creditCardsForHotel(h.id).length;
          return (
            <button key={h.id} onClick={() => { onOpen(h.id); router.push('/web/accounting/entities'); }} className="p-4 rounded-2xl text-left flex flex-col gap-2 hover:shadow-md transition-shadow" style={card}>
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f0eefb' }}><Building2 className="w-4 h-4" style={{ color: PURPLE }} /></div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>{h.propertyCode}</span>
              </div>
              <div><p className="text-sm font-bold" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></div>
              <p className="text-[11px] inline-flex items-center gap-1" style={{ color: '#929292' }}><MapPin className="w-3 h-3" /> {h.city}, {h.state} · {h.rooms} rooms</p>
              <div className="flex items-center gap-3 pt-1 mt-auto" style={{ borderTop: '1px solid #f7f7f7' }}>
                <span className="text-[11px] inline-flex items-center gap-1 pt-2" style={{ color: '#6a6a6a' }}><Landmark className="w-3 h-3" /> {banks} bank</span>
                <span className="text-[11px] inline-flex items-center gap-1 pt-2" style={{ color: '#6a6a6a' }}><CreditCard className="w-3 h-3" /> {cards} card</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EntityDetail({ hotelId }: { hotelId: string }) {
  const h = getEntity(hotelId)!;
  const banks = bankAccountsForHotel(hotelId);
  const cards = creditCardsForHotel(hotelId);
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe" title={h.hotelName} subtitle={`${h.legalEntity} · ${h.address}`} />
      <div className="grid md:grid-cols-2 gap-3">
        <Info label="Legal Entity" value={h.legalEntity} />
        <Info label="Tax ID" value={h.taxId} />
        <Info label="Property Code" value={h.propertyCode} />
        <Info label="Rooms" value={String(h.rooms)} />
        <Info label="General Manager" value={h.manager} />
        <Info label="Opened" value={h.openingDate} />
      </div>

      <Section title="Bank Accounts" icon={<Landmark className="w-4 h-4" />}>
        {banks.map((b) => (
          <Row key={b.id} title={b.name} sub={`${b.bank} · ••${b.last4}`} right={money(b.currentBalance)} tag={b.type} />
        ))}
      </Section>
      <Section title="Credit Cards" icon={<CreditCard className="w-4 h-4" />}>
        {cards.map((c) => (
          <Row key={c.id} title={c.name} sub={`${c.issuer} · ••${c.last4} · ${c.cardHolder}`} right={money(c.currentBalance)} tag="Credit Card" />
        ))}
      </Section>
      <p className="text-xs" style={{ color: '#929292' }}>Banking and credit cards live here, under the entity, in the redesigned flow. Statements for these accounts are uploaded in the <span style={{ color: PURPLE }}>Statement Inbox</span>.</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-medium mt-0.5" style={{ color: '#222' }}>{value}</p></div>;
}
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: '#6a6a6a' }}>{icon} {title}</h2>
      <div className="rounded-2xl overflow-hidden" style={card}>{children}</div>
    </section>
  );
}
function Row({ title, sub, right, tag }: { title: string; sub: string; right: string; tag: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid #f7f7f7' }}>
      <div><p className="text-sm font-medium" style={{ color: '#222' }}>{title}</p><p className="text-[11px]" style={{ color: '#929292' }}>{sub}</p></div>
      <div className="flex items-center gap-3"><Badge label={tag} fg="#6a6a6a" bg="#f0f0f0" /><span className="text-sm font-semibold" style={{ color: '#222' }}>{right}</span></div>
    </div>
  );
}
