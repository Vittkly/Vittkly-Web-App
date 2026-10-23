import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { PinPadLock } from '../components/PinPadLock';
import { UserBioHeader } from '../components/UserBioHeader';
import { useAuth } from '../hooks/useAuth';
import { useQuickUnlock } from '../hooks/useQuickUnlock';
import { getInitials } from '../utils/profile';

export function PinLockScreen() {
  const { colors, spacing, radius, typography, control } = useTheme();
  const { user, isOffline, tenants, activeTenant, activeOrganizationId, switchTenant, signOut } =
    useAuth();

  // Bloquea el botón físico "Atrás" de Android para impedir saltar el bloqueo por PIN.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      subscription.remove();
    };
  }, []);

  const navigateAfterUnlock = () => {
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

  const {
    pin,
    length,
    errorMessage,
    helperText,
    helperTone,
    isLockedOut,
    isBusy,
    biometricAvailable,
    biometricType,
    handleKeyPress,
    handleDelete,
    handleBiometricPress,
  } = useQuickUnlock({
    onUnlocked: navigateAfterUnlock,
  });

  const handleSwitchAccountPress = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const fullName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    'Rosa Mendoza';
  const initials = getInitials(fullName);

  const currentTenant = activeTenant ?? tenants[0] ?? null;
  const roleLabel =
    currentTenant?.jobTitle ||
    (currentTenant?.role === 'owner'
      ? 'Titular'
      : currentTenant?.role === 'admin'
        ? 'Supervisor'
        : 'Técnica de campo');
  const accessProfileSubtitle = currentTenant?.name
    ? `${roleLabel} · ${currentTenant.name}`
    : `${roleLabel} · Vitta Kleanly`;

  return (
    <SafeAreaView
      testID="pin-lock-screen"
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.space6,
            paddingVertical: spacing.space4,
            gap: spacing.space6,
          },
        ]}
      >
        <OfflineSessionBanner visible={isOffline} />

        {/* 1. Perfil Básico del Usuario */}
        <UserBioHeader fullName={fullName} initials={initials} subtitle={accessProfileSubtitle} />

        {/* 2. Indicadores de dígitos y 3. Teclado Numérico */}
        <PinPadLock
          pin={pin}
          length={length}
          error={errorMessage}
          helperText={helperText}
          helperTone={helperTone}
          disabled={isBusy || isLockedOut}
          biometricAvailable={biometricAvailable}
          biometricType={biometricType}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onBiometricPress={handleBiometricPress}
        />

        {/* Opción discreta inferior: Cambiar de cuenta / Usar contraseña */}
        <View style={styles.footerActions}>
          <Pressable
            testID="pin-lock-switch-account-btn"
            accessibilityRole="button"
            accessibilityLabel="Cambiar de cuenta o usar contraseña"
            onPress={() => void handleSwitchAccountPress()}
            style={({ pressed }) => [
              styles.switchAccountBtn,
              {
                minHeight: control.lg,
                paddingHorizontal: spacing.space4,
                borderRadius: radius.pill,
                backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
              },
            ]}
          >
            <Text style={[typography.small, styles.switchText, { color: colors.inkMuted }]}>
              Cambiar de cuenta / Usar contraseña
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
  footerActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAccountBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
