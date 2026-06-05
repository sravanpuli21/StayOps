import {
  HOTEL_ENTITIES, ACCT_BANK_ACCOUNTS, ACCT_CREDIT_CARDS,
  type HotelEntity, type AcctBankAccount, type AcctCreditCard,
} from '@hos/shared/accounting-os';
import type { EntityFields, NewBankAccount, NewCreditCard } from './_store';

interface StoreLike {
  newEntities: EntityFields[];
  entityEdits: Record<string, Partial<EntityFields>>;
  addedBank: NewBankAccount[];
  addedCards: NewCreditCard[];
}

/** All hotel entities: seed + wizard-created, with field edits applied. */
export function allEntities(store: StoreLike): HotelEntity[] {
  const created: HotelEntity[] = store.newEntities.map((e) => ({
    id: e.propertyCode, legalEntity: e.legalEntity, hotelName: e.hotelName, address: e.address,
    phone: e.phone, rooms: e.rooms, taxId: e.taxId, propertyCode: e.propertyCode,
    openingDate: e.openingDate, manager: e.manager, city: e.city, state: e.state,
    status: e.status === 'archived' ? 'archived' : 'active',
  }));
  return [...created, ...HOTEL_ENTITIES].map((h) => {
    const edit = store.entityEdits[h.id];
    return edit ? { ...h, ...edit } as HotelEntity : h;
  });
}

export function oneEntity(store: StoreLike, id: string): HotelEntity | undefined {
  return allEntities(store).find((h) => h.id === id);
}

/** Bank accounts for a hotel: seed + added. */
export function banksFor(store: StoreLike, hotelId: string): Array<AcctBankAccount | NewBankAccountLike> {
  const seed = ACCT_BANK_ACCOUNTS.filter((a) => a.hotelId === hotelId);
  const added = store.addedBank.filter((a) => a.hotelId === hotelId).map(toBankLike);
  return [...added, ...seed];
}
export function cardsFor(store: StoreLike, hotelId: string): Array<AcctCreditCard | NewCardLike> {
  const seed = ACCT_CREDIT_CARDS.filter((c) => c.hotelId === hotelId);
  const added = store.addedCards.filter((c) => c.hotelId === hotelId).map(toCardLike);
  return [...added, ...seed];
}

export interface NewBankAccountLike { id: string; hotelId: string; name: string; bank: string; type: string; last4: string; currentBalance: number; lastStatementMonth: string | null; reconStatus: AcctBankAccount['reconStatus'] }
export interface NewCardLike { id: string; hotelId: string; name: string; issuer: string; last4: string; cardHolder: string; creditLimit: number; currentBalance: number; lastStatementMonth: string | null; reconStatus: AcctCreditCard['reconStatus'] }

function toBankLike(a: NewBankAccount): NewBankAccountLike {
  return { id: a.id, hotelId: a.hotelId, name: a.name, bank: a.bank, type: a.type, last4: a.last4, currentBalance: a.openingBalance, lastStatementMonth: null, reconStatus: 'not-started' };
}
function toCardLike(c: NewCreditCard): NewCardLike {
  return { id: c.id, hotelId: c.hotelId, name: c.name, issuer: c.issuer, last4: c.last4, cardHolder: c.cardHolder, creditLimit: c.creditLimit, currentBalance: c.openingBalance, lastStatementMonth: null, reconStatus: 'not-started' };
}

/** Mask a Tax ID: "81-1735885" → "81-***5885". */
export function maskTaxId(taxId: string): string {
  if (!taxId) return '—';
  const clean = taxId.replace(/[^0-9]/g, '');
  if (clean.length < 5) return taxId;
  return `${clean.slice(0, 2)}-***${clean.slice(-4)}`;
}
