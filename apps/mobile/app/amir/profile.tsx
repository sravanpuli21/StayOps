import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';
import { usePreferences, type ShiftType, type DayCode, type LangCode } from '../../src/store/preferencesContext';
import { useTickets } from '../../src/store/ticketsContext';
import { useAudits } from '../../src/store/auditsContext';

const STATS = [
  { label: 'Tickets Closed', value: '128', period: 'this month' },
  { label: 'Avg Response',   value: '42m', period: 'this month' },
  { label: 'Audits Done',    value: '34',  period: 'this quarter' },
  { label: 'On-Time Rate',   value: '94%', period: 'this month' },
];

const SHIFT_OPTIONS: Array<{ value: ShiftType; label: string; icon: string; hours: string }> = [
  { value: 'day',       label: 'Day',       icon: 'sunny-outline',  hours: '7 AM – 3:30 PM' },
  { value: 'evening',   label: 'Evening',   icon: 'partly-sunny-outline', hours: '3 PM – 11 PM' },
  { value: 'overnight', label: 'Overnight', icon: 'moon-outline',   hours: '11 PM – 7 AM' },
];

const DAY_OPTIONS: Array<{ code: DayCode; label: string }> = [
  { code: 'M',  label: 'M' },
  { code: 'T',  label: 'T' },
  { code: 'W',  label: 'W' },
  { code: 'Th', label: 'T' },
  { code: 'F',  label: 'F' },
  { code: 'Sa', label: 'S' },
  { code: 'Su', label: 'S' },
];

const MAX_HOURS_OPTIONS = [32, 36, 40, 44, 48];

export default function AmirProfile() {
  const router = useRouter();
  const {
    prefs, hours, shifts, timeOff,
    setPreferredShift, setMaxWeeklyHours, setOpenToOvertime, setWillingToSwap, toggleDayOff, setLanguage,
  } = usePreferences();
  const { allTickets } = useTickets();
  const { allAudits } = useAudits();

  // Live today's summary
  const resolvedToday    = allTickets.filter((t) => t.status === 'resolved').length;
  const inProgressCount  = allTickets.filter((t) => t.status === 'in_progress' || t.status === 'en_route').length;
  const urgentOpenCount  = allTickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;
  const auditsRemaining  = allAudits.filter((a) => a.state !== 'completed').length;

  const periodPct = Math.min(100, Math.round((hours.periodClockedHours / hours.periodScheduledHours) * 100));
  const approvedTimeOff = timeOff.find((r) => r.status === 'approved');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AL</Text>
          </View>
          <Text style={styles.name}>Amir Lopez</Text>
          <Text style={styles.role}>Maintenance Tech</Text>

          <View style={styles.hotelBadge}>
            <CambriaLogo size="sm" />
          </View>

          <View style={styles.shiftRow}>
            <Ionicons name="time-outline" size={13} color={C.hint} />
            <Text style={styles.shiftText}>Evening Shift · 4:00 PM – 10:00 PM</Text>
          </View>
        </View>

        {/* HOURS THIS PAY PERIOD */}
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
              {hours.todayClockedIn && (
                <Text style={styles.hoursCellSub}>clocked in {hours.todayClockedIn}</Text>
              )}
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
                  <Text style={[styles.shiftDate, shift.isToday && { color: C.amber }]}>
                    {shift.date}
                  </Text>
                  {shift.offDay && <Text style={styles.shiftOff}>Day off</Text>}
                </View>
              </View>
              {!shift.offDay && (
                <Text style={[styles.shiftTime, shift.isToday && { color: C.amber, fontWeight: '700' }]}>
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
          <TouchableOpacity
            style={styles.timeoffBtn}
            onPress={() => Alert.alert('Request time off', 'Time-off request form would open here.')}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={16} color={C.brand} />
            <Text style={styles.timeoffText}>Request time off</Text>
          </TouchableOpacity>
          {approvedTimeOff && (
            <View style={styles.timeoffApproved}>
              <Ionicons name="checkmark-circle" size={14} color={C.green} />
              <Text style={styles.timeoffApprovedText}>
                PTO approved: {approvedTimeOff.startDate} – {approvedTimeOff.endDate}
              </Text>
            </View>
          )}
        </View>

        {/* LANGUAGE */}
        <Text style={styles.sectionTitle}>Language · Idioma</Text>
        <View style={styles.prefsCard}>
          <View style={styles.langRow}>
            {([
              { code: 'en' as LangCode, label: 'English', flag: '🇺🇸' },
              { code: 'es' as LangCode, label: 'Español', flag: '🇲🇽' },
            ]).map((l) => {
              const isActive = prefs.language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, isActive && styles.langBtnActive]}
                  onPress={() => setLanguage(l.code)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>{l.label}</Text>
                  {isActive && <Ionicons name="checkmark-circle" size={16} color={C.amber} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.prefHint}>
            {prefs.language === 'es'
              ? 'Las etiquetas clave aparecerán en español. Esta función se expandirá en futuras versiones.'
              : 'Key labels will appear in Spanish. Full translation rolling out in future updates.'}
          </Text>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>Shift Preferences</Text>
        <View style={styles.prefsCard}>

          {/* Preferred shift */}
          <View style={styles.prefGroup}>
            <Text style={styles.prefLabel}>Preferred shift</Text>
            <View style={styles.shiftSelector}>
              {SHIFT_OPTIONS.map((s) => {
                const isActive = prefs.preferredShift === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.shiftOption, isActive && styles.shiftOptionActive]}
                    onPress={() => setPreferredShift(s.value)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name={s.icon as any} size={18} color={isActive ? C.amber : C.hint} />
                    <Text style={[styles.shiftOptionLabel, isActive && styles.shiftOptionLabelActive]}>
                      {s.label}
                    </Text>
                    <Text style={[styles.shiftOptionHours, isActive && { color: C.amber }]}>
                      {s.hours}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.prefDivider} />

          {/* Max weekly hours */}
          <View style={styles.prefGroup}>
            <Text style={styles.prefLabel}>Max weekly hours</Text>
            <View style={styles.hoursSelector}>
              {MAX_HOURS_OPTIONS.map((h) => {
                const isActive = prefs.maxWeeklyHours === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hoursBtn, isActive && styles.hoursBtnActive]}
                    onPress={() => setMaxWeeklyHours(h)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.hoursBtnText, isActive && styles.hoursBtnTextActive]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.prefHint}>Scheduling won't exceed this.</Text>
          </View>

          <View style={styles.prefDivider} />

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Open to overtime</Text>
              <Text style={styles.toggleHint}>Supervisors can schedule extra hours</Text>
            </View>
            <Switch
              value={prefs.openToOvertime}
              onValueChange={setOpenToOvertime}
              trackColor={{ false: C.border, true: C.amber }}
              thumbColor="#fff"
              ios_backgroundColor={C.border}
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Willing to swap shifts</Text>
              <Text style={styles.toggleHint}>Coworkers can request coverage swaps</Text>
            </View>
            <Switch
              value={prefs.willingToSwap}
              onValueChange={setWillingToSwap}
              trackColor={{ false: C.border, true: C.amber }}
              thumbColor="#fff"
              ios_backgroundColor={C.border}
            />
          </View>

          <View style={styles.prefDivider} />

          {/* Preferred days off */}
          <View style={styles.prefGroup}>
            <Text style={styles.prefLabel}>Preferred days off</Text>
            <View style={styles.daysRow}>
              {DAY_OPTIONS.map((d) => {
                const isOff = prefs.preferredDaysOff.includes(d.code);
                return (
                  <TouchableOpacity
                    key={d.code}
                    style={[styles.dayBtn, isOff && styles.dayBtnActive]}
                    onPress={() => toggleDayOff(d.code)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.dayBtnText, isOff && styles.dayBtnTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.prefHint}>
              {prefs.preferredDaysOff.length === 0
                ? 'No preferences — open any day'
                : `Prefer ${prefs.preferredDaysOff.length} day${prefs.preferredDaysOff.length > 1 ? 's' : ''} off per week`}
            </Text>
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
            { icon: 'checkmark-circle', color: C.green,  label: `${resolvedToday} ticket${resolvedToday !== 1 ? 's' : ''} resolved` },
            { icon: 'construct-outline', color: C.amber, label: `${inProgressCount} in progress` },
            { icon: 'alert-circle',     color: C.red,    label: `${urgentOpenCount} urgent open`, hide: urgentOpenCount === 0 },
            { icon: 'calendar-outline', color: C.blue,   label: `${auditsRemaining} audit${auditsRemaining !== 1 ? 's' : ''} remaining` },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.xl, gap: S.sm },

  // Profile card
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
    backgroundColor: C.amberBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: S.xs,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: C.amber },
  name: { fontSize: F.xl, fontWeight: '800', color: C.text },
  role: { fontSize: F.md, color: C.sub },
  hotelBadge: { marginTop: S.xs },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shiftText: { fontSize: F.sm, color: C.hint },

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
  hoursPctValue: { fontSize: F.xl, fontWeight: '800', color: C.amber },
  hoursPctLabel: { fontSize: F.xs, color: C.hint },
  progressBar: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: R.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: C.amber, borderRadius: R.full },

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
  shiftRowToday: { backgroundColor: C.amberBg },
  shiftLeft: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  shiftDate: { fontSize: F.sm, fontWeight: '700', color: C.text },
  shiftTime: { fontSize: F.sm, color: C.text, fontWeight: '500' },
  shiftOff: { fontSize: F.xs, color: C.hint, marginTop: 1 },
  offBadge: {
    backgroundColor: C.input,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: R.full,
  },
  offBadgeText: { fontSize: 10, fontWeight: '700', color: C.sub, letterSpacing: 0.6 },

  timeoffBtn: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.xs,
    padding: S.md,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  timeoffText: { fontSize: F.sm, fontWeight: '700', color: C.brand },
  timeoffApproved: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 4,
    padding: S.sm,
    backgroundColor: C.greenBg,
  },
  timeoffApprovedText: { fontSize: F.xs, fontWeight: '700', color: C.green },

  // Preferences
  prefsCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
  },
  prefGroup: { gap: S.sm },
  prefLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  prefHint: { fontSize: F.xs, color: C.hint, marginTop: 4 },
  prefDivider: { height: 1, backgroundColor: C.border, marginVertical: S.md },

  langRow: { flexDirection: 'row', gap: S.sm },
  langBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.xs,
    paddingVertical: S.md,
    borderRadius: R.lg,
    backgroundColor: C.input,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langBtnActive: { backgroundColor: C.amberBg, borderColor: C.amber },
  langFlag: { fontSize: 20 },
  langLabel: { fontSize: F.sm, fontWeight: '700', color: C.sub },
  langLabelActive: { color: C.amber },

  shiftSelector: { flexDirection: 'row', gap: S.xs },
  shiftOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: S.md, paddingHorizontal: 4,
    borderRadius: R.lg,
    backgroundColor: C.input,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shiftOptionActive: { backgroundColor: C.amberBg, borderColor: C.amber },
  shiftOptionLabel: { fontSize: F.sm, fontWeight: '700', color: C.sub },
  shiftOptionLabelActive: { color: C.amber },
  shiftOptionHours: { fontSize: 10, color: C.hint },

  hoursSelector: { flexDirection: 'row', gap: S.xs },
  hoursBtn: {
    flex: 1,
    paddingVertical: S.md,
    alignItems: 'center',
    borderRadius: R.lg,
    backgroundColor: C.input,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hoursBtnActive: { backgroundColor: C.amberBg, borderColor: C.amber },
  hoursBtnText: { fontSize: F.md, fontWeight: '700', color: C.sub },
  hoursBtnTextActive: { color: C.amber },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  toggleLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  toggleHint: { fontSize: F.xs, color: C.hint, marginTop: 1 },

  daysRow: { flexDirection: 'row', gap: 6 },
  dayBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: R.full,
    backgroundColor: C.input,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayBtnActive: { backgroundColor: C.amberBg, borderColor: C.amber },
  dayBtnText: { fontSize: F.sm, fontWeight: '700', color: C.sub },
  dayBtnTextActive: { color: C.amber },

  // Performance (existing)
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: F.xxl, fontWeight: '800', color: C.amber },
  statLabel: { fontSize: F.sm, color: C.text, fontWeight: '600', marginTop: 2 },
  statPeriod: { fontSize: F.xs, color: C.hint },

  // Today summary (existing)
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
