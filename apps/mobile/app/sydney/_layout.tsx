import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../src/theme';
import { SupervisorProvider } from '../../src/store/supervisorContext';

export default function SydneyLayout() {
  return (
    <SupervisorProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.blue,
          tabBarInactiveTintColor: C.hint,
          tabBarStyle: {
            backgroundColor: C.card,
            borderTopColor: C.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            title: 'Rooms',
            tabBarIcon: ({ color, size }) => <Ionicons name="bed-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="staff"
          options={{
            title: 'Staff',
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Me',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="ticket/[id]" options={{ href: null }} />
        <Tabs.Screen name="inventory" options={{ href: null }} />
      </Tabs>
    </SupervisorProvider>
  );
}
