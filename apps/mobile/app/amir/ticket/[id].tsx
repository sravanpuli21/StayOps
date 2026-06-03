import { useLocalSearchParams } from 'expo-router';
import { TicketDetail } from '../../../src/ui/screens/TicketDetail';

export default function AmirTicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TicketDetail id={id ?? ''} mode="amir" />;
}
