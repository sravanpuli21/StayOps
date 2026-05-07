import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';
import { useSupervisor, type NotifLevel, type AuditCadence } from '../../src/store/supervisorContext';
import { useTickets } from '../../src/store/ticketsContext';
import { useAudits } from '../../src/store/auditsContext';
import { BroadcastModal } from '../../src/components/BroadcastModal';

const STATS = [
  { label: 'Tickets Managed', value: '312',  period: 'this month' },
  { label: 'Avg Resolution',  value: '3.2h', period: 'this month' },
  { label: 'Audit Score',     value: '91%',  period: 'this quarter' },
  { label: 'Staff Managed',   value: '8',    period: 'current' },
];

const NOTIF_OPTIONS: Array<{ value: NotifLevel; label: string; icon: string }> = [
  { value: 'always', label: 'Always',     icon: 'notifications' },
  { value: 'quiet',  label: 'Quiet hrs',  icon: 'moon-outline' },
  { value: 'off',    label: 'Off',        icon: 'notifications-off-outline' },
];

const CADENCE_OPTIONS: Array<{ value: AuditCadence; label: string }> = [
  { value: 'daily',           label: 'Daily' },
  { value: 'every-other-day', label: 'Every other day' },
  { value: 'weekly',          label: 'Weekly' },
  { value: 'custom',          label: 'Custom' },
];

export default function SydneyProfile() {
  const router = useRouter();
  const {
    prefs, hours, shifts, broadcasts,
    setNotifLevel, setAutoAssign, setAuditCadence, setOnCallThisWeek, setAfterHoursContactable,
    sendBroadcast,
  } = useSupervisor();
  const { allTickets } = useTickets();
  const { allAudits } = useAudits();

  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const urgentOpen    = allTickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;
  const inProgress    = allTickets.filter((t) => t.status === 'in_progress' || t.status === 'en_route').length;
  const resolvedToday = allTickets.filter((t) => t.status === 'resolved').length;
  const staffOnShift  = 5;

  const periodPct = Math.min(100, Math.round((hours.periodClockedHours / hours.periodScheduledHours) * 100));

  const handleQuickAction = (action: 'inventory' | 'broadcast' | 'audit' | 'report') => {
    if (action === 'broadcast') {
      setBroadcastOpen(true);
    } else if (action === 'inventory') {
      router.push('/sydney/inventory' as any);
    } else if (action === 'audit') {
      router.push('/amir/audit' as any);
    } else if (action === 'report') {
      Alert.alert(
        'Daily Report',
        `April 27, 2026\n\n• ${resolvedToday} resolved\n• ${inProgress} in progress\n• ${urgentOpen} urgent open\n• ${allAudits.filter(a => a.state === 'completed').length} audits complete\n• ${staffOnShift} staff on shift\n\nReport emailed to Kris, Harshal.`,
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SR</Text>
          </View>
          <Text style={styles.name}>Sydney Rivera</Text>
          <Text style={styles.role}>Supervisor</Text>

          <View style={styles.hotelBadge}>
            <CambriaLogo size="sm" />
          </View>

          <View style={styles.shiftRow}>
            <Ionicons name="time-outline" size={13} color={C.hint} />
            <Text style={styles.shiftText}>Day Shift · 7:00 AM – 3:00 PM</Text>
          </View>
          <View style={styles.shiftRow}>
            <Ionicons name="location-outline" size={13} color={C.hint} />
            <Text style={styles.shiftText}>BTRCI · Baton Rouge, LA</Text>
          </View>

          {prefs.onCallThisWeek && (
            <View style={styles.onCallBadge}>
              <View style={styles.onCallDot} />
              <Text style={styles.onCallText}>On-call this week</Text>
            </View>
          )}
        </View>

        {/* HOURS */}
        <Text style={styles.sectionTitle}>Hours This Pay Period</Text>
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <View>
              <Text style={styles.hoursValue}>
                <Text style={{ color: C.text }}>{hours.periodClockedHours}</Text>
                <Text style={{ color: C.hint }}> / {hours.periodScheduledHours} hrs</Text>
              </Text>
              <Text style={styles.hoursSub}>{hours.periodStart} – {hours.periodEnd}</Text>
            </View>
            <View style={styles.hoursPct}>
              <Text style={styles.hoursPctValue}>{periodPct}%</Text>
              <Text style={styles.hoursPctLabel}>of period</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${periodPct}%` }]} />
          </View>

          <View style={styles.hoursGrid}>
            <View style={styles.hoursCell}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.liveDot, { backgroundColor: C.green }]} />
                <Text style={styles.hoursCellLabel}>Today</Text>
              </View>
              <Text style={styles.hoursCellValue}>{hours.todayHours} hrs</Text>
              {hours.todayClockedIn && <Text style={styles.hoursCellSub}>clocked in {hours.todayClockedIn}</Text>}
            </View>
            <View style={styles.hoursCellDivider} />
            <View style={styles.hoursCell}>
              <Text style={styles.hoursCellLabel}>This week</Text>
              <Text style={styles.hoursCellValue}>{hours.weekSoFarHours} hrs</Text>
              <Text style={styles.hoursCellSub}>Mon – today</Text>
            </View>
            <View style={styles.hoursCellDivider} />
            <View style={styles.hoursCell}>
              <Text style={styles.hoursCellLabel}>Overtime</Text>
              <Text style={[styles.hoursCellValue, { color: hours.periodOvertimeHours > 0 ? C.amber : C.text }]}>
                {hours.periodOvertimeHours} hrs
              </Text>
              <Text style={styles.hoursCellSub}>this period</Text>
            </View>
          </View>
        </View>

        {/* UPCOMING SHIFTS */}
        <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
        <View style={styles.shiftsCard}>
          {shifts.map((shift, i) => (
            <View
              key={shift.date}
              style={[
                styles.shiftRow2,
                i < shifts.length - 1 && styles.shiftRowBorder,
                shift.isToday && styles.shiftRowToday,
              ]}
            >
              <View style={styles.shiftLeft}>
                {shift.isToday && <View style={[styles.todayDot]} />}
                <View>
                  <Text style={[styles.shiftDate, shift.isToday && { color: C.blue }]}>{shift.date}</Text>
                  {shift.offDay && <Text style={styles.shiftOff}>Day off</Text>}
                  {shift.onCall && <Text style={styles.onCallLabel}>· On-call</Text>}
                </View>
              </View>
              {!shift.offDay && (
                <Text style={[styles.shiftTime, shift.isToday && { color: C.blue, fontWeight: '700' }]}>
                  {shift.start} – {shift.end}
                </Text>
              )}
              {shift.offDay && (
                <View style={styles.offBadge}>
                  <Text style={styles.offBadgeText}>OFF</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'cube-outline',          label: 'Inventory',        color: C.blue,   action: 'inventory' as const },
            { icon: 'megaphone-outline',     label: 'Broadcast Note',   color: C.amber,  action: 'broadcast' as const },
            { icon: 'calendar-outline',      label: 'Schedule Audit',   color: C.purple, action: 'audit' as const },
            { icon: 'document-text-outline', label: 'Daily Report',     color: C.green,  action: 'report' as const },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => handleQuickAction(a.action)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}18` }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Broadcast history */}
        {broadcasts.length > 0 && (
          <View style={styles.broadcastHistory}>
            <Text style={styles.broadcastTitle}>Recent broadcasts</Text>
            {broadcasts.slice(0, 3).map((b) => (
              <View key={b.id} style={styles.broadcastItem}>
                <Ionicons name="megaphone" size={12} color={C.amber} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.broadcastMsg} numberOfLines={2}>{b.message}</Text>
                  <Text style={styles.broadcastMeta}>
                    → {b.audience.replace('_', ' ')} · {b.sentAt}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <View style={styles.prefsCard}>
          {[
            { key: 'urgentTickets' as const, label: 'Urgent tickets',     hint: 'OOO rooms, guest complaints' },
            { key: 'escalations' as const,   label: 'Escalations',         hint: 'From Amir or housekeeping' },
            { key: 'auditOverdue' as const,  label: 'Audit overdue',       hint: 'Areas past scheduled date' },
            { key: 'staffIssues' as const,   label: 'Staff issues',        hint: 'Callouts, lateness, handoffs' },
          ].map((n, i) => (
            <View key={n.key}>
              <View style={styles.notifRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifLabel}>{n.label}</Text>
                  <Text style={styles.notifHint}>{n.hint}</Text>
                </View>
                <View style={styles.notifLevels}>
                  {NOTIF_OPTIONS.map((o) => {
                    const isActive = prefs[n.key] === o.value;
                    return (
                      <TouchableOpacity
                        key={o.value}
                        style={[styles.notifBtn, isActive && styles.notifBtnActive]}
                        onPress={() => setNotifLevel(n.key, o.value)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name={o.icon as any} size={14} color={isActive ? C.blue : C.hint} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {i < 3 && <View style={styles.prefDivider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Assignment & Cadence</Text>
        <View style={styles.prefsCard}>
          {/* Auto-assign */}
          <View style={styles.prefGroup}>
            <Text style={styles.prefLabel}>Auto-assign maintenance tickets</Text>
            <View style={styles.segRow}>
              {[
                { value: 'auto' as const,   label: 'Auto → Amir' },
                { value: 'manual' as const, label: 'Manual' },
              ].map((opt) => {
                const isActive = prefs.autoAssignMaintenance === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segBtn, isActive && styles.segBtnActive]}
                    onPress={() => setAutoAssign(opt.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segBtnText, isActive && styles.segBtnTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.prefDivider} />

          {/* Audit cadence */}
          <View style={styles.prefGroup}>
            <Text style={styles.prefLabel}>Audit cadence</Text>
            <View style={styles.cadenceRow}>
              {CADENCE_OPTIONS.map((opt) => {
                const isActive = prefs.auditCadence === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.cadenceBtn, isActive && styles.cadenceBtnActive]}
                    onPress={() => setAuditCadence(opt.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.cadenceBtnText, isActive && styles.cadenceBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.prefDivider} />

          {/* On-call this week */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>On-call this week</Text>
              <Text style={styles.toggleHint}>Get paged for after-hours urgent tickets</Text>
            </View>
            <Switch
              value={prefs.onCallThisWeek}
              onValueChange={setOnCallThisWeek}
              trackColor={{ false: C.border, true: C.blue }}
              thumbColor="#fff"
              ios_backgroundColor={C.border}
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Contactable after hours</Text>
              <Text style={styles.toggleHint}>Allow staff to message you outside shift</Text>
            </View>
            <Switch
              value={prefs.afterHoursContactable}
              onValueChange={setAfterHoursContactable}
              trackColor={{ false: C.border, true: C.blue }}
              thumbColor="#fff"
              ios_backgroundColor={C.border}
            />
          </View>
        </View>

        {/* PERFORMANCE */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statPeriod}>{s.period}</Text>
            </View>
          ))}
        </View>

        {/* TODAY SUMMARY (live) */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryCard}>
          {[
            { icon: 'warning',           color: C.red,    label: `${urgentOpen} urgent ticket${urgentOpen !== 1 ? 's' : ''} open`, hide: urgentOpen === 0 },
            { icon: 'construct-outline', color: C.amber,  label: `${inProgress} ticket${inProgress !== 1 ? 's' : ''} in progress`, hide: inProgress === 0 },
            { icon: 'checkmark-circle',  color: C.green,  label: `${resolvedToday} ticket${resolvedToday !== 1 ? 's' : ''} resolved today` },
            { icon: 'people-outline',    color: C.blue,   label: `${staffOnShift} staff on day shift` },
          ].filter((item) => !(item as any).hide).map((item, i, arr) => (
            <View key={i} style={[styles.summaryItem, i < arr.length - 1 && styles.summaryBorder]}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={C.red} />
          <Text style={styles.signOutText}>Switch User</Text>
        </TouchableOpacity>

        <View style={{ height: S.xxl }} />
      </ScrollView>

      <BroadcastModal
        visible={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSend={(msg) => {
          sendBroadcast(msg);
          Alert.alert('Broadcast sent', `Sent to ${msg.audience.replace('_', ' ')}.`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.xl, gap: S.sm },

  profileCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.xl,
    alignItems: 'center',
    gap: S.sm,
    marginBottom: S.sm,
  },
  avatar: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: C.blueBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: S.xs,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: C.blue },
  name: { fontSize: F.xl, fontWeight: '800', color: C.text },
  role: { fontSize: F.md, color: C.sub },
  hotelBadge: { marginTop: S.xs },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shiftText: { fontSize: F.sm, color: C.hint },
  onCallBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: S.xs,
    paddingHorizontal: S.md, paddingVertical: S.xs,
    borderRadius: R.full,
    backgroundColor: C.blueBg,
  },
  onCallDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  onCallText: { fontSize: F.xs, fontWeight: '700', color: C.blue },

  sectionTitle: {
    fontSize: F.xs, fontWeight: '700',
    color: C.hint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: S.md,
    marginBottom: 2,
  },

  // Hours
  hoursCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
    gap: S.md,
  },
  hoursHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hoursValue: { fontSize: F.xxl, fontWeight: '800' },
  hoursSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  hoursPct: { alignItems: 'flex-end' },
  hoursPctValue: { fontSize: F.xl, fontWeight: '800', color: C.blue },
  hoursPctLabel: { fontSize: F.xs, color: C.hint },
  progressBar: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: R.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.blue, borderRadius: R.full },

  hoursGrid: { flexDirection: 'row', alignItems: 'flex-start' },
  hoursCell: { flex: 1, alignItems: 'center', paddingHorizontal: S.xs },
  hoursCellDivider: { width: 1, height: 40, backgroundColor: C.border, alignSelf: 'center' },
  hoursCellLabel: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  hoursCellValue: { fontSize: F.lg, fontWeight: '800', color: C.text, marginTop: 2 },
  hoursCellSub: { fontSize: 10, color: C.hint, marginTop: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },

  // Shifts
  shiftsCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    overflow: 'hidden',
  },
  shiftRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  shiftRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  shiftRowToday: { backgroundColor: C.blueBg },
  shiftLeft: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  shiftDate: { fontSize: F.sm, fontWeight: '700', color: C.text },
  shiftTime: { fontSize: F.sm, color: C.text, fontWeight: '500' },
  shiftOff: { fontSize: F.xs, color: C.hint, marginTop: 1 },
  onCallLabel: { fontSize: F.xs, color: C.blue, fontWeight: '600', marginTop: 1 },
  offBadge: {
    backgroundColor: C.input,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: R.full,
  },
  offBadgeText: { fontSize: 10, fontWeight: '700', color: C.sub, letterSpacing: 0.6 },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  actionCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
    gap: S.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: F.xs, fontWeight: '700', color: C.text, textAlign: 'center' },

  broadcastHistory: {
    backgroundColor: C.amberBg,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.sm,
    marginTop: S.sm,
  },
  broadcastTitle: { fontSize: F.xs, fontWeight: '700', color: C.amber, textTransform: 'uppercase', letterSpacing: 0.6 },
  broadcastItem: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  broadcastMsg: { fontSize: F.sm, color: C.text, fontWeight: '600' },
  broadcastMeta: { fontSize: F.xs, color: C.sub, marginTop: 1 },

  // Preferences
  prefsCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
  },
  prefGroup: { gap: S.sm },
  prefLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  prefDivider: { height: 1, backgroundColor: C.border, marginVertical: S.md },

  notifRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  notifLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  notifHint: { fontSize: F.xs, color: C.hint, marginTop: 1 },
  notifLevels: { flexDirection: 'row', gap: 4 },
  notifBtn: {
    width: 36, height: 32,
    borderRadius: R.md,
    backgroundColor: C.input,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  notifBtnActive: { backgroundColor: C.blueBg, borderColor: C.blue },

  segRow: { flexDirection: 'row', gap: S.xs },
  segBtn: {
    flex: 1, paddingVertical: S.md,
    alignItems: 'center',
    borderRadius: R.lg,
    backgroundColor: C.input,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  segBtnActive: { backgroundColor: C.blueBg, borderColor: C.blue },
  segBtnText: { fontSize: F.sm, fontWeight: '700', color: C.sub },
  segBtnTextActive: { color: C.blue },

  cadenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  cadenceBtn: {
    paddingHorizontal: S.md, paddingVertical: S.sm,
    borderRadius: R.full,
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cadenceBtnActive: { backgroundColor: C.blueBg, borderColor: C.blue },
  cadenceBtnText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  cadenceBtnTextActive: { color: C.blue },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  toggleLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  toggleHint: { fontSize: F.xs, color: C.hint, marginTop: 1 },

  // Performance
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: F.xxl, fontWeight: '800', color: C.blue },
  statLabel: { fontSize: F.sm, color: C.text, fontWeight: '600', marginTop: 2 },
  statPeriod: { fontSize: F.xs, color: C.hint },

  // Today summary
  summaryCard: { backgroundColor: C.card, borderRadius: R.xl, overflow: 'hidden' },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { flex: 1, fontSize: F.sm, fontWeight: '600', color: C.text },

  // Sign out
  signOut: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.sm,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginTop: S.sm,
  },
  signOutText: { fontSize: F.md, fontWeight: '700', color: C.red },
});
