export interface Entity {
  id: string;
  name: string;          // legal name, e.g. "SAVMT Hospitality LLC"
  ein: string;           // formatted "XX-XXXXXXX"
  hotelIds: string[];    // hotels owned by this entity
  registeredAddress: string;
  state: string;
  cpaContact?: string;
  cpaEmail?: string;
  fiscalYearStart: string; // "MM-DD"
  status: 'active' | 'dissolved';
}
