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
import { auditsForPerson, totalItems } from '../../data/audits';
import { isPaused } from '../../data/audit-progress';
import { Screen, TopBar, ListGroup, ListRow, StatusDot } from '../kit';
import { tone, type, space, priorityTone, secondaryLabel } from '../tokens';

const RANK = { urgent: 0, high: 1, normal: 2 } as const;
const byPriority = (a: Ticket, b: Ticket) => RANK[a.priority] - RANK[b.priority];

export function AmirHome({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const router = useRouter();
  const { allTickets } = useTickets();
  const open = allTickets.filter((t) => t.status !== 'resolved');
  const openTicket = onOpenTicket ?? ((id: string) => router.push(`/amir/ticket/${id}` as never));
  const openAudit = (id: string) => router.push(`/amir/audit/${encodeURIComponent(id)}` as never);

  // Preventive audits assigned to Amir — the planned upkeep to run once issues
  // are handled. Sourced from the same data the audit screen renders.
  const pendingAudits = auditsForPerson('Amir Lopez').filter((a) => a.status !== 'completed');
  // Only urgent/high reactive issues should block starting audits.
  const blockingIssues = open.filter((t) => t.type === 'reactive' && (t.priority === 'urgent' || t.priority === 'high')).length;

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
        subtitle={`Evening, Amir · ${issues.length + urgentIssues.length} issue${issues.length + urgentIssues.length === 1 ? '' : 's'} · ${pendingAudits.length} preventive audit${pendingAudits.length === 1 ? '' : 's'}`}
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

        {/* Preventive audits — run these once tickets are handled. You can
            pause an audit anytime to take a ticket, then resume where you left off. */}
        {pendingAudits.length > 0 && (
          <ListGroup header={`Preventive audits · ${pendingAudits.length}`}>
            {blockingIssues > 0 && (
              <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xs }}>
                <Text style={[type.footnote, { color: secondaryLabel }]}>
                  Clear your {blockingIssues} priority issue{blockingIssues === 1 ? '' : 's'} first — then work these. You can pause an audit if a new ticket comes in.
                </Text>
              </View>
            )}
            {pendingAudits.map((a) => {
              const paused = isPaused(a.id);
              const inProg = a.status === 'in_progress';
              const overdue = a.status === 'overdue';
              return (
                <ListRow
                  key={a.id}
                  leading={<StatusDot toneName={overdue ? 'urgent' : inProg || paused ? 'watch' : 'neutral'} />}
                  title={a.area}
                  subtitle={`${totalItems(a)} checks · ${a.scopeLabel} · ${a.dueDate}`}
                  value={paused ? 'Resume' : inProg ? 'Continue' : 'Start'}
                  valueTone="accent"
                  onPress={() => openAudit(a.id)}
                />
              );
            })}
          </ListGroup>
        )}
      </Screen>
    </View>
  );
}
