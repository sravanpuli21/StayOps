/**
 * Amir (night technician) home / "Queue" — clean grouped-list style. Work is
 * split by KIND so reactive issues, preventive maintenance, and audits never
 * blur together: Urgent issues → Issues → Preventive → Audits. Color marks
 * urgency; money shows as a quiet trailing value.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { Screen, TopBar, ListGroup, ListRow, StatusDot } from '../kit';
import { tone, type, space, priorityTone, secondaryLabel } from '../tokens';

const RANK = { urgent: 0, high: 1, normal: 2 } as const;
const byPriority = (a: Ticket, b: Ticket) => RANK[a.priority] - RANK[b.priority];

export function AmirHome({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const router = useRouter();
  const { allTickets } = useTickets();
  const open = allTickets.filter((t) => t.status !== 'resolved');
  const openTicket = onOpenTicket ?? ((id: string) => router.push(`/amir/ticket/${id}` as never));

  // Reactive = real issues/work orders. preventive/scheduled = planned upkeep. audit = inspections.
  const isReactive = (t: Ticket) => t.type === 'reactive';
  const isPreventive = (t: Ticket) => t.type === 'preventive' || t.type === 'scheduled';
  const isAudit = (t: Ticket) => t.type === 'audit';

  const urgentIssues = open.filter((t) => isReactive(t) && t.priority === 'urgent').sort(byPriority);
  const urgentIds = new Set(urgentIssues.map((t) => t.id));
  const issues = open.filter((t) => isReactive(t) && !urgentIds.has(t.id)).sort(byPriority);
  const preventive = open.filter(isPreventive).sort(byPriority);
  const audits = open.filter(isAudit).sort(byPriority);

  const sub = (t: Ticket) => {
    const bits = [t.area];
    if (t.guestContext === 'occupied_urgent') bits.push('guest in room');
    else if (t.guestContext === 'arrival') bits.push('arriving soon');
    if (t.repeatInRoom) bits.push('repeat');
    return bits.join(' · ');
  };

  const row = (t: Ticket, leadTone = priorityTone(t.priority)) => (
    <ListRow
      key={t.id}
      leading={<StatusDot toneName={leadTone} />}
      title={`Room ${t.room} · ${t.title}`}
      subtitle={sub(t)}
      value={t.revenueLost > 0 ? `$${t.revenueLost}` : undefined}
      valueTone="money"
      onPress={() => openTicket(t.id)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen
        title="Queue"
        subtitle={`Evening, Amir · ${issues.length + urgentIssues.length} issue${issues.length + urgentIssues.length === 1 ? '' : 's'} · ${preventive.length} preventive · ${audits.length} audit${audits.length === 1 ? '' : 's'}`}
      >
        {open.length === 0 && (
          <Text style={[type.body, { color: secondaryLabel, textAlign: 'center', marginTop: space.xl }]}>All clear — nothing open.</Text>
        )}

        {urgentIssues.length > 0 && (
          <ListGroup header="Urgent issues">
            {urgentIssues.map((t) => row(t, 'urgent'))}
          </ListGroup>
        )}

        {issues.length > 0 && (
          <ListGroup header="Issues">
            {issues.map((t) => row(t))}
          </ListGroup>
        )}

        {preventive.length > 0 && (
          <ListGroup header="Preventive maintenance">
            {preventive.map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName="watch" />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={`${t.area} · scheduled`}
                onPress={() => openTicket(t.id)}
              />
            ))}
          </ListGroup>
        )}

        {audits.length > 0 && (
          <ListGroup header="Audits">
            {audits.map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName="watch" />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={`${t.area} · inspection`}
                onPress={() => openTicket(t.id)}
              />
            ))}
          </ListGroup>
        )}
      </Screen>
    </View>
  );
}
