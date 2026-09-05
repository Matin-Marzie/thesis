import React from 'react';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from "expo-router/react-navigation";

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { PRIMARY_COLOR } from '@/constants/App';
import TabBarIcon from '@/components/TabBarIcon';
import ProgressHeaderTitle from '@/components/ProgressHeaderTitle';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarActiveBackgroundColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: "#333",
        tabBarStyle: {
          backgroundColor: PRIMARY_COLOR,
        },
        headerStyle: {
          backgroundColor: PRIMARY_COLOR,
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
          headerTitle: () => <ProgressHeaderTitle />,
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
        options={({ route }) => {
          const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'index';
          return {
            title: 'Create',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
            tabBarStyle: focusedRouteName === 'index'
              ? { backgroundColor: PRIMARY_COLOR }
              : { display: 'none' },
          };
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          headerTitle: () => <ProgressHeaderTitle />,
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
