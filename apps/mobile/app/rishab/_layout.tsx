import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { C, F, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';
import { PreferencesProvider } from '../../src/store/preferencesContext';

function BackToPicker() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.replace('/')}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.back}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={22} color={C.text} />
      <Text style={styles.backText}>Switch user</Text>
    </TouchableOpacity>
  );
}

function PropertyBadge() {
  return (
    <View style={styles.badge}>
      <CambriaLogo size="sm" />
    </View>
  );
}

export default function RishabLayout() {
  return (
    <PreferencesProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: C.card,
            borderBottomColor: C.border,
            borderBottomWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 56,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: F.md, fontWeight: '700', color: C.text },
          headerLeft: () => <BackToPicker />,
          headerRight: () => <PropertyBadge />,
          tabBarActiveTintColor: C.ink,
          tabBarInactiveTintColor: C.hint,
          tabBarStyle: {
            backgroundColor: C.card,
            borderTopColor: C.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 20,
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

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.sm,
    marginLeft: 4,
  },
  backText: {
    fontSize: F.sm,
    fontWeight: '600',
    color: C.text,
    marginLeft: -2,
  },
  badge: {
    marginRight: S.md,
  },
});
