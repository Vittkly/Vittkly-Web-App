import { LogOut, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ModulePlaceholderScreen } from '@/components';
import { useAuth } from '@/features/auth';
import { useSignOutAction } from '@/features/home/hooks/useSignOutAction';
import { OrgSwitchSheet, useOrgStore } from '@/features/tenants';
import { useTheme } from '@/theme';
import { PerfilOrgCard } from '../components/PerfilOrgCard';

export function PerfilScreen() {
  const { colors, spacing, radius, typography, fontFamilies, control } = useTheme();
  const { user, activeTenant, tenants } = useAuth();
  const { activeOrg, organizations } = useOrgStore();
  const { isLoggingOut, handleSignOut } = useSignOutAction();
  const [isSwitchSheetVisible, setIsSwitchSheetVisible] = useState(false);

  const effectiveTenant = activeOrg ?? activeTenant ?? organizations[0] ?? tenants[0];
  const userName =
    user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Usuario';
  const userIdentifier = user?.email || user?.phone || 'Sin identificador';

  return (
    <ModulePlaceholderScreen
      testID="tab-perfil-screen"
      moduleCode="MOD-PERFIL"
      title="Perfil"
      subtitle="Datos de tu cuenta y empresa activa"
    >
      {/* Tarjeta de Empresa Activa con disparador interactivo al selector */}
      <PerfilOrgCard
        organization={effectiveTenant ?? null}
        onOpenSwitcher={() => setIsSwitchSheetVisible(true)}
      />

      {/* Tarjeta de Datos del Usuario */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: spacing.space4,
            gap: spacing.space3,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <User size={16} color={colors.inkMuted} />
          <Text
            style={[
              typography.small,
              {
                fontFamily: fontFamilies.bold,
                color: colors.inkMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              },
            ]}
          >
            Datos de Cuenta
          </Text>
        </View>

        <View style={{ gap: spacing.space1 }}>
          <Text
            style={[typography.bodyStrong, { fontFamily: fontFamilies.bold, color: colors.ink }]}
          >
            {userName}
          </Text>
          <Text style={[typography.body, { color: colors.inkMuted }]}>{userIdentifier}</Text>
        </View>
      </View>

      {/* Botón de Cierre de Sesión */}
      <Pressable
        testID="perfil-signout-btn"
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        disabled={isLoggingOut}
        onPress={() => void handleSignOut()}
        style={({ pressed }) => [
          styles.signOutButton,
          {
            minHeight: control.lg,
            borderRadius: radius.md,
            backgroundColor: pressed ? colors.dangerSoft : colors.surfaceRaised,
            borderColor: colors.danger,
            borderWidth: 1,
            opacity: isLoggingOut ? 0.6 : 1,
          },
        ]}
      >
        <LogOut size={18} color={colors.danger} />
        <Text
          style={[typography.bodyStrong, { fontFamily: fontFamilies.bold, color: colors.danger }]}
        >
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </Text>
      </Pressable>

      {/* Sheet Modal para conmutar de empresa */}
      <OrgSwitchSheet
        visible={isSwitchSheetVisible}
        onClose={() => setIsSwitchSheetVisible(false)}
      />
    </ModulePlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
});
