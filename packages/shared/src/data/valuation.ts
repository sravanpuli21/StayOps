import type { PropertyValuation, OwnershipKind } from '../types/valuation';
import { HOTELS } from './hotels';

interface ValuationSeed {
  ownership: OwnershipKind;
  purchaseYear: number;
  perKeyPurchase: number;       // $/key invested at acquisition
  perKeyAsset: number;          // $/key today — owned = land+bldg+FF&E, leased = FF&E+leasehold only
  noiPerKey: number;            // trailing-12mo NOI per key
  marketCapRate: number;        // % — local market cap rate for the income approach
  ltv: number;                  // % loan-to-value at current asset value (0 for leased)
  noteRate: number;
  appreciationYoYPct: number;
  capExDragPerKey: number;
  refinanceReady: boolean;
}

const SEEDS: Record<string, ValuationSeed> = {
  // OWNED — Savannah core (strong leisure)
  SAVGW:    { ownership: 'owned',  purchaseYear: 2017, perKeyPurchase:  92000, perKeyAsset: 142000, noiPerKey: 11200, marketCapRate: 7.8, ltv: 58, noteRate: 5.9, appreciationYoYPct: 4.1, capExDragPerKey:  900, refinanceReady: true  },
  SAVVY:    { ownership: 'owned',  purchaseYear: 2018, perKeyPurchase: 165000, perKeyAsset: 235000, noiPerKey: 17500, marketCapRate: 7.4, ltv: 52, noteRate: 5.1, appreciationYoYPct: 3.2, capExDragPerKey: 2400, refinanceReady: true  },
  GA989:    { ownership: 'owned',  purchaseYear: 2019, perKeyPurchase: 105000, perKeyAsset: 138000, noiPerKey:  9600, marketCapRate: 8.0, ltv: 64, noteRate: 6.8, appreciationYoYPct: 1.4, capExDragPerKey: 2100, refinanceReady: false },
  SAVMT:    { ownership: 'owned',  purchaseYear: 2016, perKeyPurchase:  85000, perKeyAsset: 128000, noiPerKey:  9100, marketCapRate: 8.1, ltv: 55, noteRate: 5.4, appreciationYoYPct: 0.8, capExDragPerKey: 3200, refinanceReady: true  },
  SAVMD:    { ownership: 'owned',  purchaseYear: 2018, perKeyPurchase:  88000, perKeyAsset: 124000, noiPerKey:  9800, marketCapRate: 8.2, ltv: 60, noteRate: 6.1, appreciationYoYPct: 1.9, capExDragPerKey: 2400, refinanceReady: false },
  RISAV:    { ownership: 'owned',  purchaseYear: 2019, perKeyPurchase: 130000, perKeyAsset: 178000, noiPerKey: 13900, marketCapRate: 7.6, ltv: 56, noteRate: 5.7, appreciationYoYPct: 3.6, capExDragPerKey:  600, refinanceReady: true  },

  // OWNED — Pooler/Brunswick (secondary, slower growth)
  SAVFP:    { ownership: 'owned',  purchaseYear: 2017, perKeyPurchase:  82000, perKeyAsset: 118000, noiPerKey:  9000, marketCapRate: 8.4, ltv: 61, noteRate: 6.2, appreciationYoYPct: 2.4, capExDragPerKey: 1100, refinanceReady: true  },
  BQKCY:    { ownership: 'owned',  purchaseYear: 2015, perKeyPurchase:  78000, perKeyAsset: 110000, noiPerKey:  8400, marketCapRate: 8.6, ltv: 49, noteRate: 4.8, appreciationYoYPct: 1.1, capExDragPerKey: 1900, refinanceReady: true  },
  BSWVE:    { ownership: 'owned',  purchaseYear: 2018, perKeyPurchase:  90000, perKeyAsset: 121000, noiPerKey:  9200, marketCapRate: 8.5, ltv: 63, noteRate: 6.4, appreciationYoYPct: 2.0, capExDragPerKey:  800, refinanceReady: false },
  BQKFP:    { ownership: 'owned',  purchaseYear: 2019, perKeyPurchase:  84000, perKeyAsset: 109000, noiPerKey:  8500, marketCapRate: 8.5, ltv: 65, noteRate: 6.5, appreciationYoYPct: 1.7, capExDragPerKey: 1000, refinanceReady: false },

  // OWNED — FL/TX (newer adds, mixed)
  SGJES:    { ownership: 'owned',  purchaseYear: 2021, perKeyPurchase: 118000, perKeyAsset: 142000, noiPerKey: 11000, marketCapRate: 8.0, ltv: 67, noteRate: 6.7, appreciationYoYPct: 2.8, capExDragPerKey:  300, refinanceReady: false },
  DFWFW:    { ownership: 'owned',  purchaseYear: 2020, perKeyPurchase: 112000, perKeyAsset: 148000, noiPerKey: 10600, marketCapRate: 7.5, ltv: 60, noteRate: 5.9, appreciationYoYPct: 3.4, capExDragPerKey: 1200, refinanceReady: true  },
  BTRCI:    { ownership: 'owned',  purchaseYear: 2019, perKeyPurchase:  98000, perKeyAsset: 121000, noiPerKey:  9300, marketCapRate: 8.3, ltv: 64, noteRate: 6.3, appreciationYoYPct: 1.5, capExDragPerKey:  400, refinanceReady: false },

  // LEASED — operations lease only (FF&E + leasehold investment, no land/building equity)
  GAA84:     { ownership: 'leased', purchaseYear: 2020, perKeyPurchase:  18000, perKeyAsset:  16000, noiPerKey:  6400, marketCapRate: 9.0, ltv: 0, noteRate: 0,   appreciationYoYPct: 0.4, capExDragPerKey:  500, refinanceReady: false },
  JAXTX:     { ownership: 'leased', purchaseYear: 2022, perKeyPurchase:  42000, perKeyAsset:  44000, noiPerKey: 15800, marketCapRate: 7.8, ltv: 0, noteRate: 0,   appreciationYoYPct: 2.1, capExDragPerKey:  200, refinanceReady: false },
  '58090LA': { ownership: 'leased', purchaseYear: 2016, perKeyPurchase:  14000, perKeyAsset:  12000, noiPerKey:  6800, marketCapRate: 9.2, ltv: 0, noteRate: 0,   appreciationYoYPct: 0.9, capExDragPerKey:  700, refinanceReady: false },
};

export const PROPERTY_VALUATIONS: PropertyValuation[] = HOTELS.map((hotel) => {
  const seed = SEEDS[hotel.id];
  if (!seed) {
    throw new Error(`Missing valuation seed for hotel ${hotel.id}`);
  }
  const purchasePrice = hotel.rooms * seed.perKeyPurchase;
  const assetValue = hotel.rooms * seed.perKeyAsset;
  const noi = hotel.rooms * seed.noiPerKey;
  const incomeBasedValue = Math.round((noi / seed.marketCapRate) * 100);

  const inPlaceCapRate = (noi / assetValue) * 100;
  const appreciationPct = ((assetValue - purchasePrice) / purchasePrice) * 100;

  const loanBalance = seed.ownership === 'leased'
    ? 0
    : Math.round((assetValue * seed.ltv) / 100);
  const equityBuilt = seed.ownership === 'leased' ? 0 : assetValue - loanBalance;
  const capExDragOnValue = hotel.rooms * seed.capExDragPerKey;

  return {
    hotelId: hotel.id,
    ownership: seed.ownership,
    purchasePrice,
    purchaseYear: seed.purchaseYear,
    assetValue,
    incomeBasedValue,
    noi,
    marketCapRate: seed.marketCapRate,
    inPlaceCapRate: Math.round(inPlaceCapRate * 10) / 10,
    appreciationPct: Math.round(appreciationPct * 10) / 10,
    appreciationYoYPct: seed.appreciationYoYPct,
    loanBalance,
    equityBuilt,
    ltv: seed.ownership === 'leased' ? 0 : seed.ltv,
    capExDragOnValue,
    refinanceReady: seed.refinanceReady,
    noteRate: seed.noteRate,
  };
});

export const getValuationByHotel = (hotelId: string): PropertyValuation | undefined =>
  PROPERTY_VALUATIONS.find((v) => v.hotelId === hotelId);
