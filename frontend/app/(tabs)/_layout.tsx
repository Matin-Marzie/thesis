import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { PRIMARY_COLOR } from '@/constants/App';
import TabBarIcon from '@/components/TabBarIcon';
import HomeHeaderTitle from '@/components/HomeHeaderTitle';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarActiveBackgroundColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: PRIMARY_COLOR,
          height: 80,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => <HomeHeaderTitle />,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Reels',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="film" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerRight: () => (
            <Link href="/more" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="bars"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
