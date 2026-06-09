/**
 * Sydney (day supervisor) home / "Today" — iOS-native, web palette. Large title,
 * a single quiet summary line, then plain grouped lists in priority order. Money
 * shows as a quiet trailing value; urgency as a single leading dot.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { auditsForPerson, totalItems } from '../../data/audits';
import { isPaused } from '../../data/audit-progress';
import { Screen, TopBar, ListGroup, ListRow, StatusDot } from '../kit';
import { tone, type, space, priorityTone, secondaryLabel } from '../tokens';

export function SydneyHome({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const router = useRouter();
  const { allTickets } = useTickets();
  const open = allTickets.filter((t) => t.status !== 'resolved');

  const openTicket = onOpenTicket ?? ((id: string) => router.push(`/sydney/ticket/${id}` as never));
  const openAudit = (id: string) => router.push(`/sydney/audit/${encodeURIComponent(id)}` as never);
  const pendingAudits = auditsForPerson('Sydney Rivera').filter((a) => a.status !== 'completed');
  const blockingIssues = open.filter((t) => t.priority === 'urgent' || t.priority === 'high').length;

  const urgent   = open.filter((t) => t.priority === 'urgent');
  const blockers = open.filter((t) => t.revenueLost > 0).sort((a, b) => b.revenueLost - a.revenueLost);
  const blockerIds = new Set(blockers.map((t) => t.id));
  const due = open.filter((t) => t.priority !== 'urgent' && !blockerIds.has(t.id));
  const atRisk = blockers.reduce((sum, t) => sum + t.revenueLost, 0);

  const owner = (t: Ticket) => `→ ${t.assignee.split(' ')[0]}`;

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen title="Today" subtitle={`${urgent.length} urgent · ${open.length} open${atRisk > 0 ? ` · $${atRisk}/night at risk` : ''}`}>
        {urgent.length > 0 && (
          <ListGroup header="Needs you now">
            {urgent.map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName="urgent" />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={`${owner(t)} · ${t.updatedAt}`}
                value={t.revenueLost > 0 ? `$${t.revenueLost}` : undefined}
                valueTone="money"
                onPress={() => openTicket(t.id)}
              />
            ))}
          </ListGroup>
        )}

        {blockers.filter((t) => t.priority !== 'urgent').length > 0 && (
          <ListGroup header="Costing money">
            {blockers.filter((t) => t.priority !== 'urgent').map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName="money" />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={`${owner(t)} · ${t.updatedAt}`}
                value={`$${t.revenueLost}`}
                valueTone="money"
                onPress={() => openTicket(t.id)}
              />
            ))}
          </ListGroup>
        )}

        {due.length > 0 && (
          <ListGroup header="Also today">
            {due.map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName={priorityTone(t.priority)} />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={`${t.area} · ${owner(t)}`}
                onPress={() => openTicket(t.id)}
              />
            ))}
          </ListGroup>
        )}

        {/* Preventive audits — run once open issues are handled; pausable mid-audit. */}
        {pendingAudits.length > 0 && (
          <ListGroup header={`Preventive audits · ${pendingAudits.length}`}>
            {blockingIssues > 0 && (
              <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xs }}>
                <Text style={[type.footnote, { color: secondaryLabel }]}>
                  {blockingIssues} priority issue{blockingIssues === 1 ? '' : 's'} open — finish those first, then start audits. Audits pause if a ticket comes in.
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
