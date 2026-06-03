import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesProvider } from '../../src/store/preferencesContext';
import { tone } from '../../src/ui/tokens';

export default function AmirLayout() {
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
          name="inventory"
          options={{
            title: 'Inventory',
            tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="handover"
          options={{
            title: 'Handover',
            tabBarIcon: ({ color, size }) => <Ionicons name="paper-plane-outline" size={size} color={color} />,
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
        <Tabs.Screen name="ticket/[id]"  options={{ href: null }} />
        <Tabs.Screen name="audit/[id]"   options={{ href: null }} />
        <Tabs.Screen name="room/[number]" options={{ href: null }} />
        <Tabs.Screen name="profile"       options={{ href: null }} />

      </Tabs>
    </PreferencesProvider>
  );
}
