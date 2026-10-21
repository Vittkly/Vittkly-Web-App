import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  ConnectionBanner,
  DEFAULT_TECHNICIAN_TABS,
  MobileTabBar,
  type NavItem,
} from '@/components';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';

import { DashboardHeader } from '../components/DashboardHeader';
import { TodayVisitsSection } from '../components/TodayVisitsSection';
import { useSignOutAction } from '../hooks/useSignOutAction';

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { isOffline } = useAuth();
  const [activeTab, setActiveTab] = useState('Hoy');
  const { isLoggingOut, handleSignOut } = useSignOutAction();

  const tabs: NavItem[] = DEFAULT_TECHNICIAN_TABS.map(t => ({
    ...t,
    active: t.label === activeTab,
  }));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.surface }]}>
      {isOffline ? (
        <ConnectionBanner status="offline" />
      ) : (
        <View style={{ paddingHorizontal: spacing.space4, paddingTop: spacing.space2 }}>
          <ConnectionBanner status="syncing" pending={3} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.space4,
          paddingTop: spacing.space4,
          paddingBottom: spacing.space8,
          gap: spacing.space6,
        }}
      >
        <DashboardHeader onSignOut={() => void handleSignOut()} isLoggingOut={isLoggingOut} />

        <TodayVisitsSection />

        <View style={{ gap: spacing.space2 }}>
          <Button variant="primary" size="lg" block icon="forward" onPress={() => {}}>
            Iniciar visita en ruta
          </Button>

          <Button
            variant="danger"
            size="lg"
            block
            disabled={isLoggingOut}
            onPress={() => void handleSignOut()}
          >
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión (Pruebas)'}
          </Button>
        </View>
      </ScrollView>

      <MobileTabBar items={tabs} onSelect={item => setActiveTab(item.label)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
