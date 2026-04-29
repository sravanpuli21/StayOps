export type PersonaRole =
  | 'managing-director'
  | 'corporate'
  | 'regional-director'
  | 'general-manager'
  | 'agm'
  | 'housekeeping-supervisor'
  | 'maintenance-supervisor';

export type PersonaScope = 'portfolio' | 'regional' | 'property';

export interface Persona {
  id: string;
  name: string;
  title: string;
  role: PersonaRole;
  scope: PersonaScope;
  initials: string;
  avatarColor: string;
  route: string;
}
