import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '../components/AuthHeader';
import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { TenantSelector } from '../components/TenantSelector';
import { useAuth } from '../hooks/useAuth';
import type { Tenant } from '../types/auth.types';
import { useTheme } from '@/theme';

export function SelectTenantScreen() {
  const { colors, spacing, radius, typography, control } = useTheme();
  const { isOffline, tenants, activeOrganizationId, selectTenant } = useAuth();

  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const handleSelectTenant = async (tenant: Tenant) => {
    setIsSelecting(true);
    try {
      await selectTenant(tenant.id);
      router.replace('/');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <SafeAreaView
      testID="select-tenant-screen"
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            padding: spacing.space6,
            gap: spacing.space6,
          },
        ]}
      >
        <OfflineSessionBanner visible={isOffline} />

        <AuthHeader
          centered
          logoHeight={spacing.space6 + spacing.space1}
          badgeText="Multi-Empresa"
          title="¿Dónde vas a trabajar hoy?"
          subtitle="Tu cuenta está vinculada a más de una empresa. Elige una para cargar tus órdenes y permisos."
        />

        <TenantSelector
          tenants={tenants}
          selectedTenantId={activeOrganizationId}
          disabled={isSelecting}
          onSelectTenant={handleSelectTenant}
        />

        <View style={styles.footer}>
          <Pressable
            testID="select-tenant-invitation-link-btn"
            accessibilityRole="button"
            accessibilityLabel="Vincular otra organización con código VK-XXXX"
            onPress={() => router.push('/(auth)/invitation')}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                minHeight: control.lg,
                borderRadius: radius.lg,
                backgroundColor: pressed ? colors.line : colors.surfaceSunken,
                paddingHorizontal: spacing.space4,
              },
            ]}
          >
            <Text style={[typography.bodyStrong, { color: colors.ink }]}>
              Vincular otra organización (VK-XXXX)
            </Text>
          </Pressable>
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
    justifyContent: 'space-between',
  },
  footer: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
