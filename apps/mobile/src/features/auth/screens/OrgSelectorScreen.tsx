import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { BackIcon } from '@/components/icons';
import { useTheme } from '@/theme';

import { AuthHeader } from '../components/AuthHeader';
import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { TenantSelector } from '../components/TenantSelector';
import { useAuth } from '../hooks/useAuth';
import { secureStorageService } from '../services/secure-storage.service';
import type { Tenant } from '../types/auth.types';

export function OrgSelectorScreen() {
  const { colors, spacing, typography, control } = useTheme();
  const {
    isOffline,
    tenants,
    activeOrganizationId,
    lastActiveTenantId: contextLastActiveId,
    switchTenant,
    signOut,
  } = useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSwitchMode = params.mode === 'switch';

  const [lastActiveId, setLastActiveId] = useState<string | null>(contextLastActiveId);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  // Entrada directa si solo tiene 1 empresa con acceso móvil y no viene a cambiar empresa
  useEffect(() => {
    if (!isSwitchMode && tenants.length === 1 && tenants[0]) {
      void switchTenant(tenants[0].id).then(() => {
        router.replace('/(tabs)/hoy');
      });
    }
  }, [isSwitchMode, switchTenant, tenants]);

  useEffect(() => {
    if (!lastActiveId) {
      void secureStorageService.getLastActiveTenantId().then((id) => {
        if (id) setLastActiveId(id);
      });
    }
  }, [lastActiveId]);

  const handleSelectTenant = async (tenant: Tenant) => {
    setIsSelecting(true);
    try {
      await switchTenant(tenant.id);
      router.replace('/(tabs)/hoy');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSignOutPress = async () => {
    setIsSelecting(true);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <SafeAreaView
      testID="org-selector-screen"
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
              testID="org-selector-back-btn"
              accessibilityRole="button"
              accessibilityLabel="Volver al panel"
              onPress={() => router.back()}
              style={({ pressed }) => ({
                minHeight: control.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.space1,
                paddingVertical: spacing.space2,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <BackIcon size={20} color={colors.ink} />
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>Volver</Text>
            </Pressable>
          </View>
        ) : null}

        <AuthHeader
          centered
          logoHeight={spacing.space6 + spacing.space1}
          badgeText="Multi-Empresa"
          title="¿Dónde vas a trabajar hoy?"
          subtitle="Elige una de tus empresas activas para cargar tus órdenes, precios y permisos."
        />

        <TenantSelector
          tenants={tenants}
          selectedTenantId={activeOrganizationId ?? lastActiveId}
          lastActiveTenantId={lastActiveId}
          disabled={isSelecting}
          onSelectTenant={handleSelectTenant}
        />

        <View style={styles.footer}>
          <Button
            testID="org-selector-signout-btn"
            variant="ghost"
            shape="pill"
            block
            disabled={isSelecting}
            onPress={() => void handleSignOutPress()}
          >
            Cambiar de cuenta / Cerrar sesión
          </Button>
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
});
