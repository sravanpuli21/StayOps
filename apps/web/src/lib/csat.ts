export interface CsatTier {
  label: string;
  color: string;
  bg: string;
  alert: boolean;
}

export function csatTier(rating: number): CsatTier {
  if (rating >= 4.6) return { label: 'Excellent',       color: '#15803d', bg: '#f0fdf4', alert: false };
  if (rating >= 4.3) return { label: 'Good',            color: '#2563eb', bg: '#eff6ff', alert: false };
  if (rating >= 4.0) return { label: 'Fair',            color: '#b45309', bg: '#fffbeb', alert: false };
  return                    { label: 'Needs attention', color: '#b91c1c', bg: '#fef2f2', alert: true };
}
