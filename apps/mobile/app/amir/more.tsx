import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { usePreferences, type LangCode } from '../../src/store/preferencesContext';
import { useT } from '../../src/i18n/amir-phrases';

export default function AmirMore() {
  const router = useRouter();
  const t = useT();
  const { prefs, setLanguage } = usePreferences();

  const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'es', label: 'Spanish', native: 'Español' },
  ];

  function call(label: string, number: string) {
    Alert.alert(label, `Call ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`).catch(() => {}) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Identity */}
        <View style={styles.idCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AL</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Amir Lopez</Text>
            <Text style={styles.role}>Maintenance Tech · Evening</Text>
            <Text style={styles.shift}>4:00 PM – 10:00 PM</Text>
          </View>
        </View>

        {/* Language */}
        <SectionLabel>{t('language')}</SectionLabel>
        <View style={styles.card}>
          {LANGUAGES.map((lang, i) => {
            const active = prefs.language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, i < LANGUAGES.length - 1 && styles.rowBorder]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.85}
              >
                <Text style={styles.langNative}>{lang.native}</Text>
                <Text style={styles.langLabel}>{lang.label}</Text>
                {active && <Ionicons name="checkmark-circle" size={20} color={C.brand} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Emergency contacts — one-tap call */}
        <SectionLabel>{t('emergency_contacts')}</SectionLabel>
        <View style={styles.card}>
          {[
            { label: 'Sydney Rivera', role: 'Supervisor',  number: '+1-555-0100', icon: 'clipboard-outline' as const, color: '#1d4ed8' },
            { label: 'Front Desk',    role: 'Internal',    number: '+1-555-0102', icon: 'desktop-outline'   as const, color: '#5b21b6' },
            { label: 'Rishab Patel',  role: 'GM',          number: '+1-555-0103', icon: 'briefcase-outline' as const, color: '#b45309' },
            { label: 'Emergency',     role: '911 / safety',number: '911',         icon: 'alert-circle-outline' as const, color: '#b91c1c' },
          ].map((c, i, arr) => (
            <TouchableOpacity
              key={c.label}
              style={[styles.callRow, i < arr.length - 1 && styles.rowBorder]}
              onPress={() => call(c.label, c.number)}
              activeOpacity={0.85}
            >
              <View style={[styles.callIcon, { backgroundColor: `${c.color}15` }]}>
                <Ionicons name={c.icon} size={18} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{c.label}</Text>
                <Text style={styles.rowSub}>{c.role} · {c.number}</Text>
              </View>
              <Ionicons name="call" size={18} color={C.brand} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => router.push('/amir/profile' as any)} activeOpacity={0.85}>
            <Ionicons name="person-circle-outline" size={18} color={C.sub} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>{t('profile')}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.faint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Alert.alert('Help', 'Help & feedback')} activeOpacity={0.85}>
            <Ionicons name="help-circle-outline" size={18} color={C.sub} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>{t('help')}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.faint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => router.replace('/')} activeOpacity={0.85}>
            <Ionicons name="swap-horizontal-outline" size={18} color={C.sub} />
            <Text style={[styles.rowTitle, { flex: 1 }]}>{t('switch_user')}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.faint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert(t('sign_out'), 'You will need to log in again.', [
              { text: 'Cancel', style: 'cancel' },
              { text: t('sign_out'), style: 'destructive', onPress: () => router.replace('/') },
            ])}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color="#b91c1c" />
            <Text style={[styles.rowTitle, { flex: 1, color: '#b91c1c' }]}>{t('sign_out')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>StayOps · v0.1 · BTRCI</Text>
        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

  idCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    padding: S.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.brandBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: F.lg, fontWeight: '800', color: C.brand },
  name: { fontSize: F.lg, fontWeight: '800', color: C.text },
  role: { fontSize: F.sm, color: C.sub, marginTop: 1 },
  shift: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  rowTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  rowSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  langRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  langNative: { fontSize: F.lg, fontWeight: '700', color: C.text, width: 96 },
  langLabel: { fontSize: F.xs, color: C.sub, fontWeight: '600', flex: 1 },

  callRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  callIcon: { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },

  version: { fontSize: F.xs, color: C.hint, textAlign: 'center', marginTop: S.lg },
});
