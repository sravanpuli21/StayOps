import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import {
  CATEGORY_CFG, USAGE_TODAY, FOLLOWUP_TICKETS,
  type InventoryItem, type StockLevel, type Category,
} from '../../src/data/amir-inventory';
import { useInventory, decrementItem, restockItem } from '../../src/store/inventory-store';

const LEVEL_CFG: Record<StockLevel, { color: string; bg: string; label: string }> = {
  good: { color: '#15803d', bg: '#dcfce7', label: 'Good' },
  low:  { color: '#b45309', bg: '#fef3c7', label: 'Low' },
  out:  { color: '#b91c1c', bg: '#fee2e2', label: 'Out' },
};

type Filter = 'all' | 'low' | 'used_today' | 'pending_followups' | Category;
const PRIMARY_FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',                label: 'All' },
  { key: 'low',                label: 'Low / Out' },
  { key: 'used_today',         label: 'Used today' },
  { key: 'pending_followups',  label: 'Borrowed-room follow-ups' },
];
const CATEGORY_FILTERS: { key: Category; label: string }[] = [
  { key: 'bulbs',      label: 'Bulbs' },
  { key: 'remotes',    label: 'Remotes' },
  { key: 'batteries',  label: 'Batteries' },
  { key: 'hvac',       label: 'HVAC' },
  { key: 'plumbing',   label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
];

export default function SydneyInventory() {
  const [filter, setFilter] = useState<Filter>('all');
  const inventory = useInventory();

  const lowCount = inventory.filter((p) => p.level === 'low' || p.level === 'out').length;
  const borrowed = USAGE_TODAY.filter((u) => u.source === 'another_room');

  const filtered = useMemo(() => {
    if (filter === 'all')                return inventory;
    if (filter === 'low')                return inventory.filter((p) => p.level === 'low' || p.level === 'out');
    if (filter === 'used_today') {
      const used = new Set(USAGE_TODAY.map((u) => `${u.itemName}|${u.variant ?? ''}`));
      return inventory.filter((p) => used.has(`${p.name}|${p.variant}`));
    }
    if (filter === 'pending_followups')  return [];   // shown as separate section below
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

  function requestOrder(item: InventoryItem) {
    const suggestedQty = Math.max(item.par * 2, 10);
    Alert.alert(
      'Request order',
      `${item.name} · ${item.variant}\nCurrent: ${item.count} · PAR: ${item.par}\n\nSuggested order: ${suggestedQty} ${item.unit}\nApproval needed: Rishab`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send to Rishab', onPress: () => {
          /* Mock: pretend Rishab approves immediately */
          restockItem(item.id, suggestedQty);
          Alert.alert('Approved', `Rishab approved · ${suggestedQty} ${item.unit} added to stock.`);
        } },
      ]
    );
  }

  function adjust(item: InventoryItem) {
    Alert.alert(
      'Adjust count',
      `${item.name} · ${item.variant}\nCurrent: ${item.count}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '−1',   onPress: () => decrementItem(item.id, 1) },
        { text: '+1',   onPress: () => restockItem(item.id, 1) },
        { text: '+10',  onPress: () => restockItem(item.id, 10) },
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
        {FOLLOWUP_TICKETS.length > 0 && <>
          <View style={styles.summaryDot} />
          <Text style={[styles.summaryHero, { color: '#b91c1c' }]}>{FOLLOWUP_TICKETS.length}</Text>
          <Text style={styles.summarySub}>follow-ups</Text>
        </>}
      </View>

      {/* Filters */}
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

        {/* Borrowed-room follow-ups (Sydney's responsibility — preview always when it's filter or there are some) */}
        {(filter === 'pending_followups' || filter === 'all') && FOLLOWUP_TICKETS.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: '#b91c1c' }]} />
              <SectionLabel>Borrowed-room follow-ups</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.countText, { color: '#b91c1c' }]}>{FOLLOWUP_TICKETS.length}</Text>
              </View>
            </View>
            <View style={styles.card}>
              {FOLLOWUP_TICKETS.map((f, i) => (
                <View key={f.id} style={[styles.row, i < FOLLOWUP_TICKETS.length - 1 && styles.rowBorder]}>
                  <View style={[styles.iconWrap, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="git-branch-outline" size={16} color="#b91c1c" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {f.room} · {f.title}</Text>
                    <Text style={styles.rowSub}>
                      {f.arrivalSoon ? 'URGENT — arrival today · ' : ''}linked to {f.linkedTicketId}
                    </Text>
                    {f.note && <Text style={styles.note}>{f.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Borrowed today (separate signal) */}
        {filter !== 'pending_followups' && borrowed.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: '#b45309' }]} />
              <SectionLabel>Borrowed today</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.countText, { color: '#b45309' }]}>{borrowed.length}</Text>
              </View>
            </View>
            <View style={styles.card}>
              {borrowed.map((u, i) => (
                <View key={u.id} style={[styles.row, i < borrowed.length - 1 && styles.rowBorder]}>
                  <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="swap-horizontal-outline" size={16} color="#b45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {u.itemName} · from Room {u.sourceRoom} → Room {u.destinationRoom}
                    </Text>
                    <Text style={styles.rowSub}>{u.variant} · {u.loggedAt}</Text>
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
                          onPress={() => adjust(p)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="create-outline" size={16} color={C.sub} />
                        </TouchableOpacity>
                        {p.level !== 'good' && (
                          <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}
                            onPress={() => requestOrder(p)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Ionicons name="cart-outline" size={16} color="#b45309" />
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

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  countChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  countText: { fontSize: F.xs, fontWeight: '800' },

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
