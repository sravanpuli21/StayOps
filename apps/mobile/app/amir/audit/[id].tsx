import { useLocalSearchParams } from 'expo-router';
import { AuditDetail } from '../../../src/components/audit/AuditDetail';

export default function AmirAuditDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AuditDetail id={id ?? ''} mode="amir" backHref="Queue" />;
}
