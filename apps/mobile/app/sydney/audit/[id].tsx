import { useLocalSearchParams } from 'expo-router';
import { AuditDetail } from '../../../src/components/audit/AuditDetail';

export default function SydneyAuditDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AuditDetail id={id ?? ''} mode="sydney" backHref="Audits" />;
}
