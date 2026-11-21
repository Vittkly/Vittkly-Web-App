import { Tabs } from 'expo-router';
import React from 'react';

import { MobileTabBar, type NavItem } from '@/components/MobileTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigateToTab }) => {
        const items: NavItem[] = [
          {
            label: 'Hoy',
            icon: 'home',
            active: state.index === 0,
            onPress: () => {
              const route = state.routes[0];
              if (route) navigateToTab(route.key);
            },
          },
          {
            label: 'Agenda',
            icon: 'calendar',
            active: state.index === 1,
            onPress: () => {
              const route = state.routes[1];
              if (route) navigateToTab(route.key);
            },
          },
          {
            label: 'Perfil',
            icon: 'user',
            active: state.index === 2,
            onPress: () => {
              const route = state.routes[2];
              if (route) navigateToTab(route.key);
            },
          },
        ];

        return <MobileTabBar items={items} />;
      }}
    >
      <Tabs.Screen name="hoy" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
