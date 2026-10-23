import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { QuickAccessChoice } from '../components/QuickAccessChoice';
import { useAuth } from '../hooks/useAuth';

export function QuickAccessPromptScreen() {
  const { colors, spacing } = useTheme();
  const { isOffline, tenants, activeOrganizationId, switchTenant } = useAuth();

  const handleSelectPin = () => {
    router.replace({
      pathname: '/(auth)/pin-setup',
      params: { flow: 'email' },
    });
  };

  const handleSelectEmailOnly = () => {
    if (tenants.length === 1 && tenants[0]) {
      void switchTenant(tenants[0].id);
      router.replace('/');
      return;
    }
    if (tenants.length > 1 && !activeOrganizationId) {
      router.replace('/(auth)/select-tenant');
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView
      testID="quick-access-prompt-screen"
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.space6,
            paddingVertical: spacing.space6,
            gap: spacing.space4,
          },
        ]}
      >
        <OfflineSessionBanner visible={isOffline} />

        <View style={styles.centerBody}>
          <QuickAccessChoice
            onSelectPin={handleSelectPin}
            onSelectEmailOnly={handleSelectEmailOnly}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
