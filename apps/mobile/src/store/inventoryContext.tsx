import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

export type InventoryCategory =
  | 'Electronics'
  | 'Lighting'
  | 'HVAC'
  | 'Plumbing'
  | 'Bathroom'
  | 'Batteries'
  | 'Hardware'
  | 'Guest amenities';

export type StockStatus = 'ok' | 'low' | 'critical' | 'out';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  icon: string;              // Ionicons name
  onHand: number;
  threshold: number;
  unit: string;
  location: string;
  lastRestocked: string;
  monthlyUsage: number;
  vendor?: string;
  costPerUnit?: number;
  notes?: string;
}

export interface RestockRequest {
  id: string;
  itemId: string;
  qty: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'ordered' | 'received';
}

const INITIAL_INVENTORY: InventoryItem[] = [
  // Electronics
  { id: 'inv-001', name: 'TV remote (Samsung)',      category: 'Electronics', icon: 'tv-outline',          onHand: 2,  threshold: 5,  unit: 'units', location: 'Stock cabinet · shelf A2', lastRestocked: 'Mar 18',  monthlyUsage: 8,  vendor: 'Samsung Direct', costPerUnit: 24 },
  { id: 'inv-002', name: 'TV remote (LG)',            category: 'Electronics', icon: 'tv-outline',          onHand: 4,  threshold: 3,  unit: 'units', location: 'Stock cabinet · shelf A2', lastRestocked: 'Feb 22',  monthlyUsage: 3,  vendor: 'LG Parts',       costPerUnit: 22 },
  { id: 'inv-003', name: 'HDMI cables 6ft',           category: 'Electronics', icon: 'git-network-outline', onHand: 12, threshold: 5,  unit: 'units', location: 'Stock cabinet · shelf A3', lastRestocked: 'Apr 02',  monthlyUsage: 2,  vendor: 'Amazon',          costPerUnit: 6 },
  { id: 'inv-004', name: 'Power adapters USB-C',      category: 'Electronics', icon: 'flash-outline',       onHand: 3,  threshold: 5,  unit: 'units', location: 'Stock cabinet · shelf A4', lastRestocked: 'Jan 30',  monthlyUsage: 2,  vendor: 'Amazon',          costPerUnit: 9 },
  { id: 'inv-005', name: 'Bathroom speakers (JBL)',   category: 'Electronics', icon: 'volume-high-outline', onHand: 1,  threshold: 3,  unit: 'units', location: 'Stock cabinet · shelf A5', lastRestocked: 'Dec 12',  monthlyUsage: 1,  vendor: 'JBL Pro',         costPerUnit: 52 },

  // Lighting
  { id: 'inv-010', name: 'LED bulbs A19 2700K',       category: 'Lighting', icon: 'bulb-outline',        onHand: 3,  threshold: 10, unit: 'bulbs', location: 'Stock cabinet · shelf B1', lastRestocked: 'Feb 14',  monthlyUsage: 18, vendor: 'HD Supply',       costPerUnit: 4 },
  { id: 'inv-011', name: 'LED bulbs PAR20 spotlight', category: 'Lighting', icon: 'bulb-outline',        onHand: 6,  threshold: 6,  unit: 'bulbs', location: 'Stock cabinet · shelf B1', lastRestocked: 'Mar 01',  monthlyUsage: 4,  vendor: 'HD Supply',       costPerUnit: 8 },
  { id: 'inv-012', name: 'Bathroom vanity bulbs G25', category: 'Lighting', icon: 'bulb-outline',        onHand: 14, threshold: 8,  unit: 'bulbs', location: 'Stock cabinet · shelf B2', lastRestocked: 'Apr 05',  monthlyUsage: 6,  vendor: 'HD Supply',       costPerUnit: 5 },
  { id: 'inv-013', name: 'Lamp cords / sockets',      category: 'Lighting', icon: 'flash-outline',       onHand: 9,  threshold: 4,  unit: 'units', location: 'Stock cabinet · shelf B3', lastRestocked: 'Mar 22',  monthlyUsage: 1,  vendor: 'HD Supply',       costPerUnit: 11 },
  { id: 'inv-014', name: 'Lobby pendant LED drivers', category: 'Lighting', icon: 'hardware-chip-outline', onHand: 2,  threshold: 2,  unit: 'units', location: 'Maintenance closet 1F',   lastRestocked: 'Jan 08',  monthlyUsage: 0,  vendor: 'Brite-Lite',      costPerUnit: 38 },
  { id: 'inv-015', name: 'Emergency exit light batteries', category: 'Lighting', icon: 'warning-outline', onHand: 5,  threshold: 6,  unit: 'units', location: 'Maintenance closet 1F',   lastRestocked: 'Feb 28',  monthlyUsage: 1,  vendor: 'Brite-Lite',      costPerUnit: 14 },

  // HVAC
  { id: 'inv-020', name: 'PTAC capacitors 45µF',      category: 'HVAC', icon: 'hardware-chip-outline', onHand: 1,  threshold: 3,  unit: 'units', location: 'HVAC cart',                lastRestocked: 'Mar 22',  monthlyUsage: 2,  vendor: 'GE Zoneline',     costPerUnit: 28 },
  { id: 'inv-021', name: 'PTAC air filters',          category: 'HVAC', icon: 'grid-outline',          onHand: 24, threshold: 15, unit: 'units', location: 'HVAC cart',                lastRestocked: 'Apr 10',  monthlyUsage: 12, vendor: 'GE Zoneline',     costPerUnit: 3 },
  { id: 'inv-022', name: 'Thermostat batteries (AA)', category: 'HVAC', icon: 'battery-half-outline',  onHand: 8,  threshold: 12, unit: 'pairs', location: 'HVAC cart',                lastRestocked: 'Feb 18',  monthlyUsage: 6,  vendor: 'Amazon',          costPerUnit: 2 },
  { id: 'inv-023', name: 'PTAC fan motor mount kit',  category: 'HVAC', icon: 'construct-outline',     onHand: 0,  threshold: 2,  unit: 'units', location: 'On order',                 lastRestocked: '—',       monthlyUsage: 1,  vendor: 'GE Zoneline',     costPerUnit: 85, notes: 'Arrives tomorrow for T001' },

  // Plumbing
  { id: 'inv-030', name: 'Drain snake (25ft)',        category: 'Plumbing', icon: 'git-commit-outline',   onHand: 2,  threshold: 1,  unit: 'units', location: 'Plumbing closet',          lastRestocked: 'Nov 11',  monthlyUsage: 0,  vendor: 'HD Supply',       costPerUnit: 32 },
  { id: 'inv-031', name: 'Enzyme drain treatment',    category: 'Plumbing', icon: 'flask-outline',         onHand: 5,  threshold: 4,  unit: 'bottles', location: 'Plumbing closet',        lastRestocked: 'Mar 04',  monthlyUsage: 3,  vendor: 'Grainger',        costPerUnit: 14 },
  { id: 'inv-032', name: 'Toilet flapper kit',        category: 'Plumbing', icon: 'water-outline',         onHand: 7,  threshold: 4,  unit: 'kits',  location: 'Plumbing closet',          lastRestocked: 'Apr 01',  monthlyUsage: 2,  vendor: 'HD Supply',       costPerUnit: 8 },
  { id: 'inv-033', name: 'Shower head chrome',        category: 'Plumbing', icon: 'water-outline',         onHand: 3,  threshold: 2,  unit: 'units', location: 'Plumbing closet',          lastRestocked: 'Feb 22',  monthlyUsage: 1,  vendor: 'HD Supply',       costPerUnit: 28 },

  // Bathroom
  { id: 'inv-040', name: 'Bathroom exhaust fan motor',category: 'Bathroom', icon: 'cog-outline',           onHand: 2,  threshold: 2,  unit: 'units', location: 'Bath supply bin',          lastRestocked: 'Dec 18',  monthlyUsage: 0,  vendor: 'HD Supply',       costPerUnit: 45 },
  { id: 'inv-041', name: 'Bathroom fan switch',       category: 'Bathroom', icon: 'toggle-outline',        onHand: 4,  threshold: 2,  unit: 'units', location: 'Bath supply bin',          lastRestocked: 'Jan 15',  monthlyUsage: 1,  vendor: 'HD Supply',       costPerUnit: 9 },
  { id: 'inv-042', name: 'Caulk white (bathroom)',    category: 'Bathroom', icon: 'brush-outline',         onHand: 6,  threshold: 3,  unit: 'tubes', location: 'Bath supply bin',          lastRestocked: 'Mar 28',  monthlyUsage: 2,  vendor: 'HD Supply',       costPerUnit: 5 },

  // Batteries
  { id: 'inv-050', name: 'AA batteries',              category: 'Batteries', icon: 'battery-half-outline', onHand: 8,  threshold: 24, unit: 'pairs', location: 'Stock cabinet · shelf C1', lastRestocked: 'Feb 10',  monthlyUsage: 16, vendor: 'Amazon',          costPerUnit: 1 },
  { id: 'inv-051', name: 'AAA batteries',             category: 'Batteries', icon: 'battery-half-outline', onHand: 36, threshold: 20, unit: 'pairs', location: 'Stock cabinet · shelf C1', lastRestocked: 'Apr 05',  monthlyUsage: 10, vendor: 'Amazon',          costPerUnit: 1 },
  { id: 'inv-052', name: '9V batteries (smoke det.)', category: 'Batteries', icon: 'battery-full-outline', onHand: 14, threshold: 10, unit: 'units', location: 'Stock cabinet · shelf C2', lastRestocked: 'Mar 30',  monthlyUsage: 4,  vendor: 'Amazon',          costPerUnit: 3 },
  { id: 'inv-053', name: 'CR2032 coin cells',         category: 'Batteries', icon: 'ellipse-outline',      onHand: 20, threshold: 10, unit: 'units', location: 'Stock cabinet · shelf C2', lastRestocked: 'Apr 12',  monthlyUsage: 2,  vendor: 'Amazon',          costPerUnit: 1 },

  // Hardware
  { id: 'inv-060', name: 'Door latch kit',            category: 'Hardware', icon: 'lock-closed-outline',   onHand: 4,  threshold: 3,  unit: 'kits',  location: 'Stock cabinet · shelf D1', lastRestocked: 'Feb 20',  monthlyUsage: 1,  vendor: 'Schlage',         costPerUnit: 22 },
  { id: 'inv-061', name: 'Door strike plate screws',  category: 'Hardware', icon: 'construct-outline',     onHand: 40, threshold: 20, unit: 'count', location: 'Hardware drawer',          lastRestocked: 'Jan 02',  monthlyUsage: 2,  vendor: 'HD Supply',       costPerUnit: 0.2 },
  { id: 'inv-062', name: 'Keycard reader batteries',  category: 'Hardware', icon: 'card-outline',          onHand: 3,  threshold: 4,  unit: 'units', location: 'Hardware drawer',          lastRestocked: 'Mar 10',  monthlyUsage: 1,  vendor: 'Onity',           costPerUnit: 12 },

  // Guest amenities
  { id: 'inv-070', name: 'Hair dryers',               category: 'Guest amenities', icon: 'aperture-outline', onHand: 2,  threshold: 2,  unit: 'units', location: 'Storage room 1F',         lastRestocked: 'Nov 20',  monthlyUsage: 0,  vendor: 'HD Supply',       costPerUnit: 28 },
  { id: 'inv-071', name: 'Iron + board sets',         category: 'Guest amenities', icon: 'reader-outline',   onHand: 1,  threshold: 1,  unit: 'sets',  location: 'Storage room 1F',         lastRestocked: 'Oct 14',  monthlyUsage: 0,  vendor: 'HD Supply',       costPerUnit: 45 },
];

function statusOf(item: InventoryItem): StockStatus {
  if (item.onHand === 0)                           return 'out';
  if (item.onHand <= Math.floor(item.threshold / 3)) return 'critical';
  if (item.onHand <= item.threshold)                return 'low';
  return 'ok';
}

interface InventoryContextValue {
  items: InventoryItem[];
  lowItems: InventoryItem[];
  criticalItems: InventoryItem[];
  restockRequests: RestockRequest[];
  getStatus: (item: InventoryItem) => StockStatus;
  byCategory: (cat: InventoryCategory) => InventoryItem[];
  requestRestock: (itemId: string, qty: number, requestedBy: string) => void;
  adjustStock: (itemId: string, delta: number) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);

  const requestRestock = useCallback((itemId: string, qty: number, requestedBy: string) => {
    setRestockRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        itemId, qty, requestedBy,
        requestedAt: 'just now',
        status: 'pending',
      },
      ...prev,
    ]);
  }, []);

  const adjustStock = useCallback((itemId: string, delta: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, onHand: Math.max(0, i.onHand + delta) } : i)));
  }, []);

  const value = useMemo<InventoryContextValue>(() => {
    const withStatus = items.map((i) => ({ item: i, status: statusOf(i) }));
    return {
      items,
      lowItems:     withStatus.filter((x) => x.status === 'low' || x.status === 'critical' || x.status === 'out').map((x) => x.item),
      criticalItems: withStatus.filter((x) => x.status === 'critical' || x.status === 'out').map((x) => x.item),
      restockRequests,
      getStatus: (item: InventoryItem) => statusOf(item),
      byCategory: (cat: InventoryCategory) => items.filter((i) => i.category === cat),
      requestRestock,
      adjustStock,
    };
  }, [items, restockRequests, requestRestock, adjustStock]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
