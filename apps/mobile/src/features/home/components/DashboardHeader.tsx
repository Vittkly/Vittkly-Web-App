import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { CompanyCircleButton } from '@/components/ui/CompanyCircleButton';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';

export interface DashboardHeaderProps {
  onSignOut: () => void;
  isLoggingOut?: boolean;
}

export function DashboardHeader({ onSignOut, isLoggingOut = false }: DashboardHeaderProps) {
  const { colors, spacing, radius, typography, isDark, fontWeights } = useTheme();
  const { user, activeTenant } = useAuth();

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Rosa';
  const roleLabel =
    activeTenant?.jobTitle ||
    (activeTenant?.role === 'owner'
      ? 'Titular'
      : activeTenant?.role === 'admin'
        ? 'Supervisor'
        : 'Técnico de campo');

  return (
    <View style={{ gap: spacing.space2 }}>
      <View style={styles.topRow}>
        <Logo variant="wordmark" tone={isDark ? 'white' : 'color'} height={32} />

        <View style={[styles.headerControls, { gap: spacing.space2 }]}>
          <CompanyCircleButton />

          <Pressable
            testID="dashboard-header-logout-btn"
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            disabled={isLoggingOut}
            onPress={onSignOut}
            style={({ pressed }) => ({
              paddingHorizontal: spacing.space3,
              paddingVertical: spacing.space1,
              borderRadius: radius.pill,
              backgroundColor: pressed ? colors.dangerSoft : colors.surfaceRaised,
              borderWidth: 1,
              borderColor: colors.lineStrong,
              opacity: isLoggingOut ? 0.5 : 1,
              minHeight: 36,
              justifyContent: 'center',
            })}
          >
            <Text style={[typography.small, { color: colors.danger, fontWeight: fontWeights.bold }]}>
              {isLoggingOut ? 'Saliendo...' : 'Cerrar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: spacing.space1 }}>
        <Text style={[typography.display, { color: colors.ink }]}>Buen día, {firstName}</Text>
        {activeTenant?.name ? (
          <View style={styles.tenantInfoRow}>
            <View
              testID="dashboard-header-active-tenant-tag"
              style={[
                styles.tenantPill,
                {
                  backgroundColor: colors.tenantAccentSoft,
                  borderColor: colors.tenantAccent,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space2,
                  paddingVertical: spacing.space1 / 2,
                },
              ]}
            >
              <Text style={[typography.small, { color: colors.successInk, fontWeight: fontWeights.bold }]}>
                {activeTenant.name} · {roleLabel}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <Text style={[typography.bodyLg, { color: colors.inkMuted }]}>
        Siguiente visita: Av. Larco 1150, piso 4
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantPill: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
