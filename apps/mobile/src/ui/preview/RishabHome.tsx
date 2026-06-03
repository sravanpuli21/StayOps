/**
 * Rishab (General Manager) home / "Today" — iOS-native, web palette. A calm
 * hotel pulse (a few headline numbers) then a grouped "Needs attention" list.
 * GM-level: cross-department, money + guest impact surfaced quietly.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, TopBar, ListGroup, ListRow, StatusDot, GroupHeader } from '../kit';
import { tone, type, space, radius, secondaryLabel, toneColors, type ToneName } from '../tokens';
import { needsAttention } from '../../data/queue';

type PulseTone = 'go' | 'warn' | 'urgent';
const PULSE: Array<{ label: string; value: string; tone: PulseTone; sub?: string }> = [
  { label: 'Occupancy',         value: '87%',   tone: 'go' },
  { label: 'Clean for arrivals',value: '18/42', tone: 'urgent', sub: '24-room gap' },
  { label: 'OOO rooms',         value: '4',     tone: 'urgent', sub: '$568/night' },
  { label: 'Open guest issues', value: '3',     tone: 'warn' },
  { label: 'Urgent actions',    value: '6',     tone: 'urgent' },
  { label: 'Payroll %',         value: '28.4%', tone: 'warn',  sub: 'over 28%' },
];

const prioTone = (p: string): ToneName => (p === 'urgent' ? 'urgent' : p === 'high' ? 'warn' : 'neutral');

export function RishabHome() {
  const router = useRouter();
  const attention = needsAttention();

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen title="Today" subtitle="Good morning, Rishab">
        {/* Hotel pulse — quiet 2-col grid, color only on the numbers that matter */}
        <View style={{ gap: 7 }}>
          <GroupHeader>Hotel pulse</GroupHeader>
          <View style={ps.grid}>
            {PULSE.map((p, i) => {
              const c = toneColors(p.tone === 'go' ? 'neutral' : p.tone);
              const valueColor = p.tone === 'go' ? tone.text : c.fg;
              return (
                <View key={p.label} style={[ps.cell, { borderBottomWidth: i < PULSE.length - 2 ? StyleSheet.hairlineWidth : 0, borderRightWidth: i % 2 === 0 ? StyleSheet.hairlineWidth : 0 }]}>
                  <View style={ps.cellHead}>
                    <StatusDot toneName={p.tone === 'go' ? 'go' : p.tone} />
                    <Text style={[type.footnote, { color: secondaryLabel }]} numberOfLines={1}>{p.label}</Text>
                  </View>
                  <View style={ps.cellVal}>
                    <Text style={[type.title2, { color: valueColor }]}>{p.value}</Text>
                    {p.sub ? <Text style={[type.caption, { color: tone.textHint }]}>{p.sub}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Needs attention */}
        <ListGroup header="Needs attention">
          {attention.map((item) => (
            <ListRow
              key={item.id}
              leading={<StatusDot toneName={prioTone(item.priority)} />}
              title={item.title}
              subtitle={item.whyItMatters}
              value={item.revenueImpact ? `$${item.revenueImpact}` : undefined}
              valueTone="money"
              onPress={() => router.push(`/rishab/queue/${item.id}` as never)}
            />
          ))}
          <ListRow
            title="View full Action Queue"
            onPress={() => router.push('/rishab/queue' as never)}
          />
        </ListGroup>
      </Screen>
    </View>
  );
}

const ps = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: tone.surface, borderRadius: radius.lg, marginHorizontal: space.lg, overflow: 'hidden', borderColor: tone.separator },
  cell: { width: '50%', padding: space.lg, gap: 6, borderColor: tone.separator },
  cellHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cellVal: { gap: 1 },
});
