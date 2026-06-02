import { usePreferences } from '../store/preferencesContext';

/**
 * Hot-path phrases for Amir's field-worker app. Spanish-first per spec —
 * action verbs that he taps under pressure are translated; chrome stays English
 * for now. Add keys here as needed.
 */
export const PHRASES = {
  /* Navigation */
  queue:           { en: 'Queue',           es: 'Cola' },
  rooms:           { en: 'Rooms',           es: 'Habitaciones' },
  parts:           { en: 'Parts',           es: 'Piezas' },
  handover:        { en: 'Handover',        es: 'Traspaso' },
  more:            { en: 'More',            es: 'Más' },

  /* Status flow */
  on_my_way:       { en: 'On my way',       es: 'Voy en camino' },
  arrived:         { en: 'Arrived',         es: 'Llegué' },
  fixed:           { en: 'Fixed',           es: 'Arreglado' },
  need_part:       { en: 'Need part',       es: 'Necesito pieza' },
  need_followup:   { en: 'Need follow-up',  es: 'Necesita seguimiento' },
  escalate:        { en: 'Escalate',        es: 'Escalar' },
  add_photo:       { en: 'Add photo',       es: 'Agregar foto' },
  add_note:        { en: 'Add note',        es: 'Agregar nota' },
  call:            { en: 'Call',            es: 'Llamar' },

  /* Section labels */
  urgent_now:           { en: 'Urgent now',           es: 'Urgente ahora' },
  arrival_blockers:     { en: 'Arrival blockers',     es: 'Bloqueos de llegada' },
  assigned_tasks:       { en: 'Assigned tasks',       es: 'Tareas asignadas' },
  if_time_allows:       { en: 'If time allows',       es: 'Si hay tiempo' },
  completed_today:      { en: 'Completed today',      es: 'Completados hoy' },

  /* Common */
  open_for:        { en: 'Open for',        es: 'Abierto hace' },
  occupied_room:   { en: 'Occupied room',   es: 'Habitación ocupada' },
  vacant:          { en: 'Vacant',          es: 'Vacante' },
  guest_inside:    { en: 'Guest inside',    es: 'Huésped dentro' },
  requested_by:    { en: 'Requested by',    es: 'Solicitado por' },
  assigned_to:     { en: 'Assigned to',     es: 'Asignado a' },
  room:            { en: 'Room',            es: 'Habitación' },
  room_history:    { en: 'Room history',    es: 'Historial de habitación' },
  repeat_issue:    { en: 'Repeat issue',    es: 'Problema repetido' },

  /* Parts */
  low_stock:           { en: 'Low stock',           es: 'Bajo stock' },
  log_item_used:       { en: 'Log item used',       es: 'Registrar pieza usada' },
  request_restock:     { en: 'Request restock',     es: 'Solicitar reposición' },
  what_did_you_use:    { en: 'What did you use?',   es: '¿Qué usaste?' },
  where_from:          { en: 'Where did it come from?', es: '¿De dónde lo tomaste?' },
  stock_cabinet:       { en: 'Stock cabinet',       es: 'Gabinete de stock' },
  maintenance_closet:  { en: 'Maintenance closet',  es: 'Armario de mantenimiento' },
  vacant_room:         { en: 'Vacant room',         es: 'Habitación vacante' },
  vendor_delivery:     { en: 'Vendor delivery',     es: 'Entrega de proveedor' },
  temporary_swap:      { en: 'Temporary swap',      es: 'Cambio temporal' },
  other:               { en: 'Other',               es: 'Otro' },

  /* Handover */
  fixed_today:        { en: 'Fixed today',         es: 'Arreglado hoy' },
  unresolved:         { en: 'Unresolved',          es: 'Sin resolver' },
  parts_needed:       { en: 'Parts needed',        es: 'Piezas necesarias' },
  watchlist_rooms:    { en: 'Watchlist rooms',     es: 'Habitaciones en lista' },
  notes_for_sydney:   { en: 'Notes for Sydney',    es: 'Notas para Sydney' },
  send_handover:      { en: 'Send handover to Sydney', es: 'Enviar traspaso a Sydney' },

  /* More */
  language:           { en: 'Language',            es: 'Idioma' },
  english:            { en: 'English',             es: 'Inglés' },
  spanish:            { en: 'Spanish',             es: 'Español' },
  profile:            { en: 'Profile',             es: 'Perfil' },
  emergency_contacts: { en: 'Emergency contacts',  es: 'Contactos de emergencia' },
  help:               { en: 'Help',                es: 'Ayuda' },
  switch_user:        { en: 'Switch user',         es: 'Cambiar usuario' },
  sign_out:           { en: 'Sign out',            es: 'Cerrar sesión' },
} as const;

export type PhraseKey = keyof typeof PHRASES;

export function useT(): (key: PhraseKey) => string {
  const { prefs } = usePreferences();
  return (key) => PHRASES[key][prefs.language] ?? PHRASES[key].en;
}
