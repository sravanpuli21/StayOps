export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertModule = 'labour' | 'revenue' | 'operations' | 'maintenance';

export interface RedFlag {
  id: string;
  hotelId: string;
  severity: AlertSeverity;
  module: AlertModule;
  message: string;
  timestamp: string;
}
