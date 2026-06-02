import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import {
  CATEGORY_CFG, USAGE_TODAY,
  type InventoryItem, type StockLevel, type Category,
} from '../../src/data/amir-inventory';
import { useInventory } from '../../src/store/inventory-store';
import { askWhatItem } from '../../src/lib/inventory-flow';
import { useT } from '../../src/i18n/amir-phrases';

const LEVEL_CFG: Record<StockLevel, { color: string; bg: string; label: string }> = {
  good: { color: '#15803d', bg: '#dcfce7', label: 'Good' },
  low:  { color: '#b45309', bg: '#fef3c7', label: 'Low' },
  out:  { color: '#b91c1c', bg: '#fee2e2', label: 'Out' },
};

type Filter = 'all' | 'low' | 'used_today' | Category;
const PRIMARY_FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'low',        label: 'Low / Out' },
  { key: 'used_today', label: 'Used today' },
];
const CATEGORY_FILTERS: { key: Category; label: string }[] = [
  { key: 'bulbs',      label: 'Bulbs' },
  { key: 'remotes',    label: 'Remotes' },
  { key: 'batteries',  label: 'Batteries' },
  { key: 'hvac',       label: 'HVAC' },
  { key: 'plumbing',   label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
];

export default function AmirInventory() {
  const t = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const inventory = useInventory();

  const filtered = useMemo(() => {
    if (filter === 'all')        return inventory;
    if (filter === 'low')        return inventory.filter((p) => p.level === 'low' || p.level === 'out');
    if (filter === 'used_today') {
      const used = new Set(USAGE_TODAY.map((u) => `${u.itemName}|${u.variant ?? ''}`));
      return inventory.filter((p) => used.has(`${p.name}|${p.variant}`));
    }
    return inventory.filter((p) => p.category === filter);
  }, [filter, inventory]);

  const grouped = useMemo(() => {
    const m = new Map<Category, InventoryItem[]>();
    filtered.forEach((it) => {
      const arr = m.get(it.category) ?? [];
      arr.push(it);
      m.set(it.category, arr);
    });
    return Array.from(m.entries());
  }, [filtered]);

  const lowCount = inventory.filter((p) => p.level === 'low' || p.level === 'out').length;

  /* ── Use-item flow ─ shared chained helper ───────────────── */
  function useItem(item?: InventoryItem) {
    const label = item ? `${item.name} · ${item.variant}` : 'Pick from the list';
    askWhatItem(label, () => {
      /* Decrement happens inside the flow when source = inventory.
         Borrowed-from-room flow handles its own follow-up creation. */
    });
  }

  function requestRestock(item: InventoryItem) {
    Alert.alert(
      t('request_restock'),
      `${item.name} · ${item.variant}\n\nSend restock request to Sydney?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => Alert.alert('Sent', 'Sydney notified.') },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Compact summary strip */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryHero}>{inventory.length}</Text>
        <Text style={styles.summarySub}>tracked</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#b45309' }]}>{lowCount}</Text>
        <Text style={styles.summarySub}>low/out</Text>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryHero}>{USAGE_TODAY.length}</Text>
        <Text style={styles.summarySub}>used today</Text>
      </View>

      {/* Primary filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[...PRIMARY_FILTERS, ...CATEGORY_FILTERS].map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Big "Log item used" CTA */}
        <TouchableOpacity style={styles.bigBtn} onPress={() => useItem()} activeOpacity={0.88}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.bigBtnText}>{t('log_item_used')}</Text>
        </TouchableOpacity>

        {/* Used today preview (only when not filtering on it) */}
        {filter !== 'used_today' && USAGE_TODAY.length > 0 && (
          <>
            <SectionLabel>Used today ({USAGE_TODAY.length})</SectionLabel>
            <View style={styles.card}>
              {USAGE_TODAY.map((u, i) => (
                <View key={u.id} style={[styles.row, i < USAGE_TODAY.length - 1 && styles.rowBorder]}>
                  <View style={[styles.iconWrap, { backgroundColor: u.source === 'another_room' ? '#fef3c7' : '#dbeafe' }]}>
                    <Ionicons
                      name={u.source === 'another_room' ? 'swap-horizontal-outline' : 'cube-outline'}
                      size={16}
                      color={u.source === 'another_room' ? '#b45309' : '#1d4ed8'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {u.itemName}{u.variant ? ` · ${u.variant}` : ''}
                    </Text>
                    <Text style={styles.rowSub}>
                      {u.source === 'another_room'
                        ? `from Room ${u.sourceRoom} → Room ${u.destinationRoom}`
                        : `from inventory${u.destinationRoom ? ` → Room ${u.destinationRoom}` : ''}`}
                      {' · '}{u.loggedAt}
                    </Text>
                    {u.followUpTicketId && (
                      <View style={styles.followUpRow}>
                        <Ionicons name="git-branch-outline" size={11} color="#b91c1c" />
                        <Text style={styles.followUpText}>Follow-up: replace in Room {u.sourceRoom}</Text>
                      </View>
                    )}
                    {u.note && <Text style={styles.note}>{u.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Inventory grouped by category */}
        {grouped.map(([cat, items]) => {
          const cfg = CATEGORY_CFG[cat];
          return (
            <View key={cat} style={{ gap: S.sm }}>
              <View style={styles.catHead}>
                <View style={[styles.catIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                </View>
                <SectionLabel>{cfg.label}</SectionLabel>
                <Text style={styles.catCount}>{items.length}</Text>
              </View>
              <View style={styles.card}>
                {items.map((p, i) => {
                  const lvl = LEVEL_CFG[p.level];
                  return (
                    <View key={p.id} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.partTopRow}>
                          <Text style={styles.rowTitle}>{p.name}</Text>
                          <View style={[styles.levelChip, { backgroundColor: lvl.bg }]}>
                            <Text style={[styles.levelChipText, { color: lvl.color }]}>{lvl.label.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.variantText}>{p.variant}</Text>
                        <Text style={styles.rowSub}>
                          {p.count} {p.unit} · PAR {p.par} · {p.location}
                        </Text>
                      </View>
                      <View style={styles.partActions}>
                        <TouchableOpacity
                          style={styles.miniBtn}
                          onPress={() => useItem(p)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="remove-circle-outline" size={18} color={C.brand} />
                        </TouchableOpacity>
                        {p.level !== 'good' && (
                          <TouchableOpacity
                            style={styles.miniBtn}
                            onPress={() => requestRestock(p)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Ionicons name="arrow-up-circle-outline" size={18} color="#b45309" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  summaryBar: {
    flexDirection: 'row', alignItems: 'baseline',
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
    gap: 6, backgroundColor: C.bg, flexWrap: 'wrap',
  },
  summaryHero: { fontSize: F.md, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  summarySub: { fontSize: F.xs, fontWeight: '600', color: C.sub, marginRight: 2 },
  summaryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.faint, alignSelf: 'center' },

  filterRow: { backgroundColor: C.bg, marginBottom: S.xs },
  filterScroll: { paddingHorizontal: S.lg, gap: S.xs },
  chip: {
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  chipTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: S.lg, paddingTop: S.sm, gap: S.md },

  bigBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.ink,
    paddingVertical: S.md + 2, borderRadius: R.full,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  bigBtnText: { color: '#fff', fontSize: F.md, fontWeight: '800', letterSpacing: -0.2 },

  catHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catIcon: { width: 24, height: 24, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  catCount: { marginLeft: 'auto', fontSize: F.xs, color: C.hint, fontWeight: '700' },

  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  iconWrap: { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  rowSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  variantText: { fontSize: F.xs, color: C.text, fontWeight: '600', marginTop: 2 },
  note: { fontSize: F.xs, color: C.text, marginTop: 4, fontStyle: 'italic' },

  followUpRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  followUpText: { fontSize: F.xs, fontWeight: '700', color: '#b91c1c' },

  partTopRow: { flexDirection: 'row', alignItems: 'center', gap: S.xs, flexWrap: 'wrap' },
  levelChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  levelChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },

  partActions: { flexDirection: 'row', gap: S.sm },
  miniBtn: {
    width: 32, height: 32, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
  },
});
