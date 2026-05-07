import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { TicketProvider } from '../src/store/ticketsContext';
import { AuditProvider } from '../src/store/auditsContext';
import { InventoryProvider } from '../src/store/inventoryContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <TicketProvider>
        <AuditProvider>
          <InventoryProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </InventoryProvider>
        </AuditProvider>
      </TicketProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
