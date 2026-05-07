import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { C, F, R, S } from '../../src/theme';
import { useTickets, type TicketStatus, type Ticket } from '../../src/store/ticketsContext';
import { useAudits } from '../../src/store/auditsContext';
import { useInventory } from '../../src/store/inventoryContext';

// ── Bilingual strings — EN / ES ───────────────────────────────────────────
type Lang = 'en' | 'es';
const STR = {
  greeting:         { en: 'Good evening, Amir',                    es: 'Buenas tardes, Amir' },
  shift:            { en: 'Evening Shift 4–10 PM',                 es: 'Turno de Tarde 4–10 PM' },
  handoverTitle:    { en: 'From Sydney',                           es: 'De Sydney' },
  handoverSub:      { en: 'End-of-day handover · tap for details', es: 'Entrega de día · toca para ver' },
  kpiOccupied:      { en: 'Occupied urgent',                       es: 'Ocupadas urgentes' },
  kpiArrivals:      { en: 'Arrivals',                              es: 'Llegadas' },
  kpiAging:         { en: 'Aging',                                 es: 'Pendientes' },
  kpiAudits:        { en: 'Audits',                                es: 'Auditorías' },
  inventoryAlerts:  { en: 'Inventory alerts',                      es: 'Alertas de inventario' },
  inventoryLowSfx:  { en: 'low',                                   es: 'bajo' },
  pausedAudits:     { en: 'audit paused',                          es: 'auditoría pausada' },
  pausedAuditsPl:   { en: 'audits paused',                         es: 'auditorías pausadas' },
  pausedSub:        { en: 'Resume where you left off',             es: 'Continuar donde lo dejaste' },
  resume:           { en: 'Resume →',                              es: 'Continuar →' },
  queueOccupied:    { en: 'Guest in room — urgent',                es: 'Huésped en habitación — urgente' },
  queueOccupiedSub: { en: 'Guests actively waiting',               es: 'Huéspedes esperando' },
  queueArrival:     { en: 'Arrival blockers',                      es: 'Bloqueando llegadas' },
  queueArrivalSub:  { en: 'Blocking check-in',                     es: 'Bloqueando check-in' },
  queueRepeat:      { en: 'Repeat complaint rooms',                es: 'Habitaciones con quejas repetidas' },
  queueRepeatSub:   { en: 'Flagged history — investigate deeper',  es: 'Historial marcado — investigar a fondo' },
  queueAging:       { en: 'Aging open tickets',                    es: 'Tickets abiertos pendientes' },
  queueAgingSub:    { en: 'Older than 1 day',                      es: 'Más de 1 día' },
  queueOther:       { en: 'Other open',                            es: 'Otros abiertos' },
  queueOtherSub:    { en: 'Secondary work when quiet',             es: 'Trabajo secundario cuando haya calma' },
  auditsDue:        { en: 'Audits Due',                            es: 'Auditorías Pendientes' },
  overdue:          { en: 'd overdue',                             es: 'd atrasado' },
  dueToday:         { en: 'Due today',                             es: 'Para hoy' },
  supervisor:       { en: 'Supervisor',                            es: 'Supervisor' },
  frontDesk:        { en: 'Front Desk',                            es: 'Recepción' },
  hkLead:           { en: 'HK Lead',                               es: 'Líder Limpieza' },
  gm:               { en: 'GM',                                    es: 'GM' },
};
const t = (key: keyof typeof STR, lang: Lang) => STR[key][lang];

const PRIORITY_CFG: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: C.red,   bg: C.redBg,   label: 'Urgent' },
  high:   { color: C.amber, bg: C.amberBg, label: 'High' },
  normal: { color: C.blue,  bg: C.blueBg,  label: 'Normal' },
};

const STATUS_CFG: Record<TicketStatus, { color: string; label: string }> = {
  open:         { color: C.red,    label: 'Open' },
  en_route:     { color: C.blue,   label: 'En route' },
  in_progress:  { color: C.amber,  label: 'In Progress' },
  pending_part: { color: C.purple, label: 'Wait part' },
  scheduled:    { color: C.blue,   label: 'Scheduled' },
  resolved:     { color: C.green,  label: 'Resolved' },
  escalated:    { color: C.red,    label: 'Escalated' },
};

const TYPE_CFG: Record<string, { color: string; bg: string; label: string }> = {
  reactive:   { color: C.red,    bg: C.redBg,    label: 'Reactive' },
  preventive: { color: C.blue,   bg: C.blueBg,   label: 'Preventive' },
  audit:      { color: C.purple, bg: C.purpleBg, label: 'Audit' },
  scheduled:  { color: C.sub,    bg: C.input,    label: 'Scheduled' },
};

function callRadio(role: string, name: string, lang: Lang) {
  // Baton Rouge 225 area code — matches BTRCI (Home2 Suites Baton Rouge)
  const contacts: Record<string, string> = {
    'Sydney Rivera':     '(225) 555-0110',
    'Front Desk':        '(225) 555-0100',
    'Emma Johnson':      '(225) 555-0188',
    'Rishab Patel':      '(225) 555-0120',
  };
  const phone = contacts[name] ?? '';
  const cancel = lang === 'es' ? 'Cancelar' : 'Cancel';
  const textLabel = lang === 'es' ? 'Mensaje' : 'Text';
  const callLabel = lang === 'es' ? 'Llamar' : 'Call';
  Alert.alert(name, `${role} · ${phone}`, [
    { text: cancel, style: 'cancel' },
    { text: textLabel, onPress: () => Linking.openURL(`sms:${phone.replace(/\D/g, '')}`).catch(() => {}) },
    { text: callLabel, onPress: () => Linking.openURL(`tel:${phone.replace(/\D/g, '')}`).catch(() => {}) },
  ]);
}

export default function AmirHome() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const { allAudits } = useAudits();
  const { lowItems: lowInventory, getStatus } = useInventory();
  const [lang, setLang] = useState<Lang>('en');

  const active = allTickets.filter((t) => t.status !== 'resolved');

  // 4 buckets per persona spec
  const occupiedUrgent = active.filter((t) => t.guestContext === 'occupied_urgent');
  const arrivalIssues  = active.filter((t) => t.guestContext === 'arrival');
  const repeat         = active.filter((t) => t.repeatInRoom && t.guestContext !== 'occupied_urgent' && t.guestContext !== 'arrival');
  const aging          = active.filter((t) => {
    if (occupiedUrgent.includes(t) || arrivalIssues.includes(t) || repeat.includes(t)) return false;
    return ['1d', '3d', '4d', '5d'].some((age) => (t.createdAt ?? '').includes(age)) || t.status === 'pending_part';
  });
  const otherOpen = active.filter((t) =>
    !occupiedUrgent.includes(t) && !arrivalIssues.includes(t) && !repeat.includes(t) && !aging.includes(t)
  );

  const openAuditsDue = allAudits.filter((a) => a.state !== 'completed');
  const pausedCount = allAudits.filter((a) => a.state === 'paused').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{t('greeting', lang)} 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {t('shift', lang)}
          </Text>
        </View>
        {/* EN/ES language toggle */}
        <TouchableOpacity
          onPress={() => setLang((l) => (l === 'en' ? 'es' : 'en'))}
          activeOpacity={0.7}
          style={styles.langToggle}
        >
          <Text style={[styles.langText, lang === 'en' && styles.langActive]}>EN</Text>
          <View style={styles.langSep} />
          <Text style={[styles.langText, lang === 'es' && styles.langActive]}>ES</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* KPI strip — summary snapshot at a glance */}
        <View style={styles.kpiRow}>
          {[
            { label: t('kpiOccupied', lang), value: String(occupiedUrgent.length), color: C.red },
            { label: t('kpiArrivals', lang), value: String(arrivalIssues.length),  color: C.amber },
            { label: t('kpiAging',    lang), value: String(aging.length),          color: C.purple },
            { label: t('kpiAudits',   lang), value: String(openAuditsDue.length),  color: C.blue },
          ].map((k) => (
            <View key={k.label} style={styles.kpi}>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Tickets, priority-bucketed (what Amir is here to do) ── */}
        {occupiedUrgent.length > 0 && (
          <QueueSection
            title={t('queueOccupied', lang)}
            subtitle={t('queueOccupiedSub', lang)}
            icon="warning"
            color={C.red}
            tickets={occupiedUrgent}
            router={router}
          />
        )}
        {arrivalIssues.length > 0 && (
          <QueueSection
            title={t('queueArrival', lang)}
            subtitle={t('queueArrivalSub', lang)}
            icon="enter-outline"
            color={C.amber}
            tickets={arrivalIssues}
            router={router}
          />
        )}
        {repeat.length > 0 && (
          <QueueSection
            title={t('queueRepeat', lang)}
            subtitle={t('queueRepeatSub', lang)}
            icon="refresh-outline"
            color={C.purple}
            tickets={repeat}
            router={router}
          />
        )}
        {aging.length > 0 && (
          <QueueSection
            title={t('queueAging', lang)}
            subtitle={t('queueAgingSub', lang)}
            icon="hourglass-outline"
            color="#0891b2"
            tickets={aging}
            router={router}
          />
        )}
        {otherOpen.length > 0 && (
          <QueueSection
            title={t('queueOther', lang)}
            subtitle={t('queueOtherSub', lang)}
            icon="list-outline"
            color={C.hint}
            tickets={otherOpen}
            router={router}
          />
        )}

        {/* Audits due */}
        <Text style={styles.sectionTitle}>{t('auditsDue', lang)}</Text>
        {openAuditsDue.slice(0, 3).map((a) => {
          const isPaused = a.state === 'paused';
          const done = a.items.filter((it) => it.checked).length;
          return (
            <TouchableOpacity
              key={a.id}
              style={styles.auditCard}
              onPress={() => router.push('/amir/audit')}
              activeOpacity={0.88}
            >
              <View style={[styles.auditDot, { backgroundColor: isPaused ? C.purple : a.overdueDays > 7 ? C.red : C.amber }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.auditArea}>{a.area}</Text>
                  {isPaused && (
                    <View style={{ backgroundColor: C.purpleBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.purple }}>PAUSED {done}/{a.items.length}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.auditRoom}>Room {a.room} · Floor {a.floor}</Text>
              </View>
              <Text style={[styles.auditDays, { color: isPaused ? C.purple : a.overdueDays > 7 ? C.red : C.amber }]}>
                {a.overdueDays > 0 ? `${a.overdueDays}${t('overdue', lang)}` : t('dueToday', lang)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Paused audits banner (kept near the audits section for context) */}
        {pausedCount > 0 && (
          <TouchableOpacity style={styles.resumeCard} onPress={() => router.push('/amir/audit')} activeOpacity={0.88}>
            <Ionicons name="pause-circle" size={16} color={C.purple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle}>
                {pausedCount} {pausedCount > 1 ? t('pausedAuditsPl', lang) : t('pausedAudits', lang)}
              </Text>
              <Text style={styles.resumeSub}>{t('pausedSub', lang)}</Text>
            </View>
            <Text style={styles.resumeAction}>{t('resume', lang)}</Text>
          </TouchableOpacity>
        )}

        {/* Sydney → Amir handover card (context from day shift — secondary info) */}
        <HandoverCard lang={lang} />

        {/* Inventory alerts */}
        {lowInventory.length > 0 && (
          <View style={styles.invCard}>
            <View style={styles.invHeader}>
              <Ionicons name="warning-outline" size={14} color={C.amber} />
              <Text style={styles.invTitle}>{t('inventoryAlerts', lang)}</Text>
              <Text style={styles.invCount}>{lowInventory.length} {t('inventoryLowSfx', lang)}</Text>
            </View>
            {lowInventory.slice(0, 4).map((inv) => {
              const status = getStatus(inv);
              const critical = status === 'critical' || status === 'out';
              return (
                <View key={inv.id} style={styles.invItem}>
                  <View style={[styles.invDot, { backgroundColor: critical ? C.red : C.amber }]} />
                  <Text style={styles.invName}>{inv.name}</Text>
                  <Text style={[styles.invQty, { color: critical ? C.red : C.amber }]}>
                    {inv.onHand} {inv.unit}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Radio quick-contacts (move to bottom — reach for them when needed) */}
        <View style={styles.radioRow}>
          {[
            { name: 'Sydney Rivera', role: t('supervisor', lang), icon: 'walkie-talkie-outline' as any, color: C.blue },
            { name: 'Front Desk',    role: t('frontDesk',  lang), icon: 'desktop-outline',      color: C.amber },
            { name: 'Emma Johnson',  role: t('hkLead',     lang), icon: 'people-outline',       color: C.purple },
            { name: 'Rishab Patel',  role: t('gm',         lang), icon: 'briefcase-outline',    color: C.red },
          ].map((c) => (
            <TouchableOpacity key={c.name} style={styles.radioBtn} onPress={() => callRadio(c.role, c.name, lang)} activeOpacity={0.85}>
              <View style={[styles.radioIcon, { backgroundColor: `${c.color}18` }]}>
                <Ionicons name={c.icon as any} size={18} color={c.color} />
              </View>
              <Text style={styles.radioLabel} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Queue section (reusable) ──

function QueueSection({
  title, subtitle, icon, color, tickets, router,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  tickets: Ticket[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <View style={{ gap: S.xs }}>
      <View style={styles.queueHeader}>
        <Ionicons name={icon as any} size={14} color={color} />
        <Text style={[styles.queueTitle, { color }]}>{title}</Text>
        <Text style={styles.queueCount}>{tickets.length}</Text>
      </View>
      <Text style={styles.queueSub}>{subtitle}</Text>
      {tickets.map((t) => {
        const p = PRIORITY_CFG[t.priority];
        const ty = TYPE_CFG[t.type];
        const st = STATUS_CFG[t.status];
        return (
          <TouchableOpacity
            key={t.id}
            style={styles.ticketCard}
            onPress={() => router.push(`/amir/ticket/${t.id}` as any)}
            activeOpacity={0.88}
          >
            <View style={[styles.ticketBar, { backgroundColor: p.color }]} />
            <View style={styles.ticketBody}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketId}>{t.id}</Text>
                <View style={[styles.badge, { backgroundColor: p.bg }]}>
                  <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: ty.bg }]}>
                  <Text style={[styles.badgeText, { color: ty.color }]}>{ty.label}</Text>
                </View>
                {t.repeatInRoom && (
                  <View style={[styles.badge, { backgroundColor: C.purpleBg }]}>
                    <Text style={[styles.badgeText, { color: C.purple }]}>REPEAT</Text>
                  </View>
                )}
                <Text style={styles.ticketAge}>{t.updatedAt}</Text>
              </View>
              <Text style={styles.ticketTitle}>{t.title}</Text>
              <View style={styles.ticketMeta}>
                <Ionicons name="location-outline" size={12} color={C.hint} />
                <Text style={styles.ticketRoom}>
                  {t.room === 'Lobby' ? 'Lobby' : `Room ${t.room}`} · {st.label}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.hint} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Handover card — what Sydney left Amir at the end of day shift ──

function HandoverCard({ lang }: { lang: Lang }) {
  // Synthetic handover items — in real product these come from the day-shift's app state
  const items = lang === 'es'
    ? [
        '2 tickets en progreso — revisar estado',
        'Filtro PTAC entregado — instalar en Hab. 312',
        'Ascensor Otis — técnico regresa mañana 9am',
        'Auditoría de vestíbulo pausada — 6 de 12 hecha',
      ]
    : [
        '2 tickets in progress — check status',
        'PTAC filter part delivered — install in Room 312',
        'Otis elevator — tech returning tomorrow 9am',
        'Lobby audit paused — 6 of 12 done',
      ];
  const title = lang === 'es' ? 'De Sydney' : 'From Sydney';
  const sub = lang === 'es' ? 'Entrega de fin de día' : 'End-of-day handover';

  return (
    <View style={handoverStyles.card}>
      <View style={handoverStyles.header}>
        <View style={handoverStyles.avatar}>
          <Text style={handoverStyles.avatarText}>SR</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={handoverStyles.title}>{title}</Text>
          <Text style={handoverStyles.sub}>{sub}</Text>
        </View>
        <View style={handoverStyles.badge}>
          <Text style={handoverStyles.badgeText}>{items.length}</Text>
        </View>
      </View>
      <View style={handoverStyles.divider} />
      {items.map((line, i) => (
        <View key={i} style={handoverStyles.item}>
          <View style={handoverStyles.dot} />
          <Text style={handoverStyles.itemText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

const handoverStyles = StyleSheet.create({
  card: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: R.lg,
    padding: S.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  title: { fontSize: F.sm, fontWeight: '800', color: '#1e3a8a' },
  sub: { fontSize: F.xs, color: '#1e40af', marginTop: 1 },
  badge: {
    backgroundColor: '#1d4ed8', borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#bfdbfe', marginVertical: S.sm },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm, paddingVertical: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#1d4ed8', marginTop: 7 },
  itemText: { flex: 1, fontSize: F.sm, color: '#1e40af', lineHeight: 18 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: S.xl,
    paddingTop: S.lg,
    paddingBottom: S.lg,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  greeting: { fontSize: F.lg, fontWeight: '800', color: C.text },
  date: { fontSize: F.sm, color: C.sub, marginTop: 2 },

  // Header right cluster: language toggle + logo stacked
  headerRight: { alignItems: 'flex-end', gap: 6 },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.input,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langText: { fontSize: 10, fontWeight: '700', color: C.hint, letterSpacing: 0.5 },
  langActive: { color: C.text },
  langSep: { width: 1, height: 10, backgroundColor: C.border },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  // Radio row
  radioRow: { flexDirection: 'row', gap: S.sm },
  radioBtn: { flex: 1, alignItems: 'center', gap: 4 },
  radioIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  radioLabel: { fontSize: 10, fontWeight: '700', color: C.text },

  // KPI
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
  },
  kpi: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: F.xl, fontWeight: '800' },
  kpiLabel: { fontSize: 10, color: C.hint, marginTop: 2, textAlign: 'center' },

  // Inventory
  invCard: {
    backgroundColor: C.amberBg,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: R.lg,
    padding: S.md,
  },
  invHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S.xs },
  invTitle: { fontSize: F.xs, fontWeight: '800', color: C.amber, textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 },
  invCount: { fontSize: 10, fontWeight: '700', color: C.amber },
  invItem: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 4 },
  invDot: { width: 6, height: 6, borderRadius: 3 },
  invName: { flex: 1, fontSize: F.sm, color: C.text },
  invQty: { fontSize: F.xs, fontWeight: '700' },

  // Paused banner
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.purpleBg,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    borderRadius: R.lg,
    padding: S.md,
  },
  resumeTitle: { fontSize: F.sm, fontWeight: '700', color: C.purple },
  resumeSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  resumeAction: { fontSize: F.sm, fontWeight: '700', color: C.purple },

  // Queue
  queueHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.sm },
  queueTitle: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  queueCount: { fontSize: F.xs, fontWeight: '800', color: C.hint, backgroundColor: C.input, paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  queueSub: { fontSize: F.xs, color: C.hint, marginBottom: 2 },

  sectionTitle: {
    fontSize: F.xs,
    fontWeight: '700',
    color: C.hint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: S.sm,
  },

  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: R.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketBar: { width: 4, alignSelf: 'stretch' },
  ticketBody: { flex: 1, padding: S.md },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.xs, flexWrap: 'wrap' },
  ticketId: { fontSize: F.xs, fontWeight: '700', color: C.hint },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  ticketAge: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },
  ticketTitle: { fontSize: F.sm, fontWeight: '600', color: C.text, marginBottom: S.xs },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ticketRoom: { fontSize: F.xs, color: C.hint },

  auditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.md,
  },
  auditDot: { width: 10, height: 10, borderRadius: 5 },
  auditArea: { fontSize: F.sm, fontWeight: '600', color: C.text },
  auditRoom: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  auditDays: { fontSize: F.xs, fontWeight: '700' },
});
