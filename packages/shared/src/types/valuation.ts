export type OwnershipKind = 'owned' | 'leased';

export interface PropertyValuation {
  hotelId: string;
  ownership: OwnershipKind;

  // What they paid at acquisition. For leased properties this is the FF&E + leasehold investment.
  purchasePrice: number;
  purchaseYear: number;

  // Today's asset value — physical stuff.
  // Owned  = land + building + FF&E + inventory + equipment
  // Leased = FF&E + inventory + leasehold improvements (no land/building)
  assetValue: number;

  // Today's income-based valuation — NOI ÷ market cap rate. What the operating business is worth on its revenue.
  incomeBasedValue: number;

  noi: number;                      // trailing 12mo net operating income
  marketCapRate: number;            // local market cap rate used for incomeBasedValue (%)
  inPlaceCapRate: number;           // NOI / assetValue * 100 — for owned, the property's actual yield
  appreciationPct: number;          // (assetValue - purchasePrice) / purchasePrice * 100
  appreciationYoYPct: number;       // value change vs 12 months ago

  loanBalance: number;
  equityBuilt: number;              // assetValue - loanBalance (0 if leased)
  ltv: number;                      // loanBalance / assetValue * 100 (0 if leased)

  capExDragOnValue: number;         // dollar drag from deferred maintenance / aging assets
  refinanceReady: boolean;
  noteRate: number;
}
