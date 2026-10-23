import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { AuthHeader } from '../components/AuthHeader';
import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { TenantSelector } from '../components/TenantSelector';
import { useAuth } from '../hooks/useAuth';
import { secureStorageService } from '../services/secure-storage.service';
import type { Tenant } from '../types/auth.types';

export function SelectTenantScreen() {
  const { colors, spacing, radius, typography, control } = useTheme();
  const { isOffline, tenants, activeOrganizationId, lastActiveTenantId: contextLastActiveId, switchTenant } =
    useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSwitchMode = params.mode === 'switch';

  const [lastActiveId, setLastActiveId] = useState<string | null>(contextLastActiveId);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  // Criterio 1: Entrada directa si solo tiene 1 empresa
  useEffect(() => {
    if (tenants.length === 1 && tenants[0]) {
      void switchTenant(tenants[0].id).then(() => {
        router.replace('/');
      });
    }
  }, [tenants, switchTenant]);

  // Criterio 2: Consultar la última empresa recordada para destacarla
  useEffect(() => {
    if (!lastActiveId) {
      void secureStorageService.getLastActiveTenantId().then(id => {
        if (id) setLastActiveId(id);
      });
    }
  }, [lastActiveId]);

  const handleSelectTenant = async (tenant: Tenant) => {
    setIsSelecting(true);
    try {
      await switchTenant(tenant.id);
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

        {isSwitchMode ? (
          <View style={styles.topBackRow}>
            <Pressable
              testID="select-tenant-back-btn"
              accessibilityRole="button"
              accessibilityLabel="Volver al panel"
              onPress={() => router.back()}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.space1,
                paddingVertical: spacing.space2,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <ArrowLeft size={20} color={colors.ink} />
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>Volver</Text>
            </Pressable>
          </View>
        ) : null}

        <AuthHeader
          centered
          logoHeight={spacing.space6 + spacing.space1}
          badgeText="Multi-Empresa"
          title="¿Dónde vas a trabajar hoy?"
          subtitle="Tu cuenta está vinculada a más de una empresa. Elige una para cargar tus órdenes y permisos."
        />

        <TenantSelector
          tenants={tenants}
          selectedTenantId={activeOrganizationId ?? lastActiveId}
          lastActiveTenantId={lastActiveId}
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
  topBackRow: {
    width: '100%',
    alignItems: 'flex-start',
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
