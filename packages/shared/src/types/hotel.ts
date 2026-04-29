export type Brand = 'Hilton' | 'Marriott' | 'Choice' | 'IHG' | 'Wyndham';
export type HealthStatus = 'green' | 'amber' | 'red';

export interface Hotel {
  id: string;
  code: string;
  name: string;
  shortName: string;
  rooms: number;
  brand: Brand;
  city: string;
  state: string;
}
