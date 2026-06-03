import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesProvider } from '../../src/store/preferencesContext';
import { tone } from '../../src/ui/tokens';

export default function RishabLayout() {
  return (
    <PreferencesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: tone.accent,
          tabBarInactiveTintColor: tone.textHint,
          tabBarStyle: {
            backgroundColor: tone.surface,
            borderTopColor: tone.line,
            borderTopWidth: 1,
            height: 84,
            paddingBottom: 24,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="queue"
          options={{
            title: 'Queue',
            tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
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
          name="team"
          options={{
            title: 'Team',
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />,
          }}
        />

        {/* Sub-routes (not in tab bar) */}
        <Tabs.Screen name="queue/[id]"   options={{ href: null }} />
        <Tabs.Screen name="room/[number]" options={{ href: null }} />
        <Tabs.Screen name="profile"       options={{ href: null }} />

      </Tabs>
    </PreferencesProvider>
  );
}
