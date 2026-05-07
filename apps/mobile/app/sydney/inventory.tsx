import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { useInventory, type InventoryCategory, type InventoryItem, type StockStatus } from '../../src/store/inventoryContext';

const CATEGORIES: Array<{ value: InventoryCategory | 'All'; label: string; icon: string }> = [
  { value: 'All',              label: 'All',          icon: 'apps-outline' },
  { value: 'Electronics',      label: 'Electronics',  icon: 'tv-outline' },
  { value: 'Lighting',         label: 'Lighting',     icon: 'bulb-outline' },
  { value: 'HVAC',             label: 'HVAC',         icon: 'snow-outline' },
  { value: 'Plumbing',         label: 'Plumbing',     icon: 'water-outline' },
  { value: 'Bathroom',         label: 'Bathroom',     icon: 'beaker-outline' },
  { value: 'Batteries',        label: 'Batteries',    icon: 'battery-half-outline' },
  { value: 'Hardware',         label: 'Hardware',     icon: 'construct-outline' },
  { value: 'Guest amenities',  label: 'Amenities',    icon: 'gift-outline' },
];

const STATUS_FILTERS: Array<{ value: StockStatus | 'all' | 'flagged'; label: string; color: string }> = [
  { value: 'all',      label: 'All',       color: C.hint },
  { value: 'flagged',  label: 'Flagged',   color: C.red },
  { value: 'ok',       label: 'OK',        color: C.green },
];

const STATUS_CFG: Record<StockStatus, { color: string; bg: string; label: string }> = {
  ok:       { color: C.green, bg: C.greenBg, label: 'OK' },
  low:      { color: C.amber, bg: C.amberBg, label: 'LOW' },
  critical: { color: C.red,   bg: C.redBg,   label: 'CRITICAL' },
  out:      { color: C.red,   bg: C.redBg,   label: 'OUT' },
};

export default function SydneyInventory() {
  const router = useRouter();
  const { items, getStatus, lowItems, criticalItems, requestRestock, adjustStock } = useInventory();
  const [category, setCategory] = useState<InventoryCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | StockStatus>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      const s = getStatus(item);
      if (statusFilter === 'flagged' && s !== 'low' && s !== 'critical' && s !== 'out') return false;
      if (statusFilter !== 'all' && statusFilter !== 'flagged' && s !== statusFilter) return false;
      if (query.trim() && !item.name.toLowerCase().includes(query.toLowerCase()) && !item.location.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, category, statusFilter, query, getStatus]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<InventoryCategory, InventoryItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return Array.from(map.entries()).map(([cat, its]) => ({
      category: cat,
      items: its.sort((a, b) => {
        const order: StockStatus[] = ['out', 'critical', 'low', 'ok'];
        return order.indexOf(getStatus(a)) - order.indexOf(getStatus(b));
      }),
    }));
  }, [filtered, getStatus]);

  const handleItemTap = (item: InventoryItem) => {
    const status = getStatus(item);
    const pct = Math.round((item.onHand / Math.max(item.threshold, 1)) * 100);
    Alert.alert(
      item.name,
      `${item.onHand} ${item.unit} on hand · threshold ${item.threshold} (${pct}%)\n\nLocation: ${item.location}\nLast restock: ${item.lastRestocked}\nMonthly usage: ${item.monthlyUsage} ${item.unit}\nVendor: ${item.vendor ?? '—'}\nCost: $${item.costPerUnit ?? 0}/unit\n${item.notes ? '\n' + item.notes : ''}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Log use (-1)',
          onPress: () => adjustStock(item.id, -1),
        },
        {
          text: 'Request restock',
          style: status === 'ok' ? 'default' : 'destructive',
          onPress: () => {
            const qty = Math.max(item.threshold * 2 - item.onHand, 5);
            requestRestock(item.id, qty, 'Sydney Rivera');
            Alert.alert('Restock requested', `${qty} ${item.unit} of ${item.name} queued for order.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>{items.length} tracked items</Text>
        </View>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{lowItems.length}</Text>
          <Text style={styles.alertBadgeLabel}>flagged</Text>
        </View>
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: C.red }]}>{criticalItems.length}</Text>
          <Text style={styles.summaryLabel}>critical / out</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: C.amber }]}>{lowItems.length - criticalItems.length}</Text>
          <Text style={styles.summaryLabel}>low</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: C.green }]}>{items.length - lowItems.length}</Text>
          <Text style={styles.summaryLabel}>ok</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={C.hint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items or locations..."
            placeholderTextColor={C.hint}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={C.hint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status filter */}
      <View style={styles.statusRow}>
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.statusBtn, isActive && { backgroundColor: f.color + '20', borderColor: f.color }]}
              onPress={() => setStatusFilter(f.value as any)}
              activeOpacity={0.85}
            >
              <Text style={[styles.statusBtnText, isActive && { color: f.color, fontWeight: '800' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
        {CATEGORIES.map((c) => {
          const isActive = category === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              style={[styles.catChip, isActive && styles.catChipActive]}
              onPress={() => setCategory(c.value)}
              activeOpacity={0.85}
            >
              <Ionicons name={c.icon as any} size={14} color={isActive ? C.blue : C.sub} />
              <Text style={[styles.catText, isActive && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {grouped.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={40} color={C.hint} />
            <Text style={styles.emptyText}>No items match your filter</Text>
          </View>
        )}
        {grouped.map(({ category: cat, items: catItems }) => (
          <View key={cat} style={{ marginBottom: S.md }}>
            <Text style={styles.groupLabel}>{cat} · {catItems.length}</Text>
            <View style={styles.card}>
              {catItems.map((item, i) => {
                const status = getStatus(item);
                const cfg = STATUS_CFG[status];
                const pct = Math.min(100, (item.onHand / Math.max(item.threshold, 1)) * 100);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.item, i < catItems.length - 1 && styles.itemBorder]}
                    onPress={() => handleItemTap(item)}
                    activeOpacity={0.88}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={item.icon as any} size={18} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={[styles.itemBadge, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.itemBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      </View>
                      <View style={styles.itemMid}>
                        <Text style={styles.itemCount}>
                          <Text style={{ color: cfg.color, fontWeight: '800' }}>{item.onHand}</Text>
                          <Text style={{ color: C.hint }}> / {item.threshold} {item.unit}</Text>
                        </Text>
                        <Text style={styles.itemUsage}>· {item.monthlyUsage}/mo</Text>
                      </View>
                      <View style={styles.itemBar}>
                        <View style={[styles.itemBarFill, { width: `${Math.min(100, pct)}%`, backgroundColor: cfg.color }]} />
                      </View>
                      <Text style={styles.itemLocation}>
                        <Ionicons name="location-outline" size={10} color={C.hint} /> {item.location}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={C.hint} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: F.xl, fontWeight: '800', color: C.text },
  subtitle: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  alertBadge: { alignItems: 'center', backgroundColor: C.redBg, paddingHorizontal: S.md, paddingVertical: 4, borderRadius: R.lg },
  alertBadgeText: { fontSize: F.xl, fontWeight: '800', color: C.red, lineHeight: 22 },
  alertBadgeLabel: { fontSize: 10, fontWeight: '700', color: C.red, letterSpacing: 0.4 },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  summaryCell: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: C.border, alignSelf: 'center', height: 32 },
  summaryValue: { fontSize: F.xl, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: C.hint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },

  searchRow: { paddingHorizontal: S.lg, paddingTop: S.md, backgroundColor: C.card },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.input,
    borderRadius: R.lg,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  searchInput: { flex: 1, fontSize: F.sm, color: C.text, padding: 0 },

  statusRow: {
    flexDirection: 'row',
    gap: S.xs,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    backgroundColor: C.card,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: S.xs + 2,
    alignItems: 'center',
    backgroundColor: C.input,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusBtnText: { fontSize: F.xs, fontWeight: '700', color: C.sub },

  catScroll: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, flexGrow: 0 },
  catRow: { flexDirection: 'row', gap: 6, paddingHorizontal: S.lg, paddingBottom: S.md },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: S.md,
    paddingVertical: S.xs + 2,
    backgroundColor: C.input,
    borderRadius: R.full,
  },
  catChipActive: { backgroundColor: C.blueBg },
  catText: { fontSize: F.xs, fontWeight: '600', color: C.sub },
  catTextActive: { color: C.blue, fontWeight: '800' },

  scroll: { flex: 1 },
  content: { padding: S.lg },

  empty: { alignItems: 'center', gap: S.sm, paddingTop: 60 },
  emptyText: { fontSize: F.md, color: C.hint },

  groupLabel: {
    fontSize: F.xs, fontWeight: '700', color: C.hint,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: S.xs, marginLeft: S.xs,
  },
  card: { backgroundColor: C.card, borderRadius: R.xl, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: 2 },
  itemName: { flex: 1, fontSize: F.sm, fontWeight: '700', color: C.text },
  itemBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  itemBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  itemMid: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  itemCount: { fontSize: F.xs },
  itemUsage: { fontSize: F.xs, color: C.hint },
  itemBar: { height: 3, borderRadius: R.full, backgroundColor: C.border, overflow: 'hidden', marginBottom: 4 },
  itemBarFill: { height: '100%', borderRadius: R.full },
  itemLocation: { fontSize: 10, color: C.hint },
});
