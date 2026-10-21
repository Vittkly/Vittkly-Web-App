import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';

export interface DashboardHeaderProps {
  onSignOut: () => void;
  isLoggingOut?: boolean;
}

export function DashboardHeader({ onSignOut, isLoggingOut = false }: DashboardHeaderProps) {
  const { colors, spacing, radius, typography, isDark, fontWeights } = useTheme();
  const { user } = useAuth();

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Rosa';

  return (
    <View style={{ gap: spacing.space2 }}>
      <View style={styles.topRow}>
        <Logo variant="wordmark" tone={isDark ? 'white' : 'color'} height={32} />
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
            {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
          </Text>
        </Pressable>
      </View>
      <Text style={[typography.display, { color: colors.ink }]}>Buen día, {firstName}</Text>
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
});
