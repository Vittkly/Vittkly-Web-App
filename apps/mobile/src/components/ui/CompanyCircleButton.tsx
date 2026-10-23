import { ChevronsUpDown, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useAuth } from '@/features/auth';
import { getInitials } from '@/features/auth/utils/profile';
import { useTheme } from '@/theme';

import { BottomSheet } from './BottomSheet';
import { TenantSelector } from '@/features/auth/components/TenantSelector';
import type { Tenant } from '@/features/auth/types/auth.types';

export interface CompanyCircleButtonProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CompanyCircleButton({
  style,
  testID = 'company-circle-button',
}: CompanyCircleButtonProps) {
  const { colors, spacing, radius, typography, fontFamilies, control } = useTheme();
  const { tenants, activeTenant, lastActiveTenantId, switchTenant } = useAuth();

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastOpacity] = useState(() => new Animated.Value(0));
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMultipleTenants = tenants.length > 1;
  const companyName = activeTenant?.name || tenants[0]?.name || 'Vitta Kleanly';
  const companyInitials = getInitials(companyName);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showSingleTenantFeedback = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(`Perteneces únicamente a ${companyName}`);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
      });
    }, 3000);
  };

  const handlePress = () => {
    if (hasMultipleTenants) {
      setIsSheetVisible(true);
    } else {
      showSingleTenantFeedback();
    }
  };

  const handleSelectTenantFromSheet = async (tenant: Tenant) => {
    setIsSheetVisible(false);
    if (tenant.id !== activeTenant?.id) {
      await switchTenant(tenant.id);
    }
  };

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Empresa activa: ${companyName}.${
          hasMultipleTenants ? ' Toca para cambiar de empresa.' : ' Perteneces únicamente a esta empresa.'
        }`}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          {
            width: control.lg,
            height: control.lg,
            borderRadius: radius.pill,
            backgroundColor: colors.tenantAccentSoft,
            borderColor: colors.tenantAccent,
            borderWidth: 1.5,
            opacity: pressed ? 0.75 : 1,
          },
          style,
        ]}
      >
        <Text
          style={[
            typography.bodyStrong,
            {
              fontFamily: fontFamilies.bold,
              color: colors.onTenantAccent,
              fontSize: 14,
            },
          ]}
        >
          {companyInitials}
        </Text>

        {hasMultipleTenants ? (
          <View
            testID="company-circle-badge-indicator"
            style={[
              styles.badgeIndicator,
              {
                borderRadius: radius.pill,
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.tenantAccent,
                borderWidth: 1,
              },
            ]}
          >
            <ChevronsUpDown size={11} color={colors.primaryInk} />
          </View>
        ) : null}
      </Pressable>

      {/* Toast informativo cuando el usuario solo tiene una empresa */}
      {toastMessage ? (
        <Animated.View
          testID="company-single-tenant-toast"
          style={[
            styles.toastWrapper,
            {
              opacity: toastOpacity,
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.tenantAccent,
              borderRadius: radius.md,
              shadowColor: colors.ink,
            },
          ]}
        >
          <Text style={[typography.small, { color: colors.ink, fontWeight: '600' }]}>
            {toastMessage}
          </Text>
        </Animated.View>
      ) : null}

      {/* Modal BottomSheet interactivo para cambio rápido sin cerrar sesión */}
      <Modal
        visible={isSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSheetVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            testID="company-modal-backdrop"
            style={styles.backdropPressable}
            onPress={() => setIsSheetVisible(false)}
          />

          <BottomSheet style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.title2, { color: colors.ink }]}>Cambiar de empresa</Text>
                <Text style={[typography.small, { color: colors.inkMuted }]}>
                  Selecciona con cuál vas a trabajar ahora
                </Text>
              </View>

              <Pressable
                testID="company-sheet-close-btn"
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector de empresa"
                onPress={() => setIsSheetVisible(false)}
                style={({ pressed }) => ({
                  padding: spacing.space1,
                  borderRadius: radius.pill,
                  backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
                })}
              >
                <X size={22} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ gap: spacing.space3, paddingVertical: spacing.space2 }}
              style={{ maxHeight: 320 }}
            >
              <TenantSelector
                tenants={tenants}
                selectedTenantId={activeTenant?.id}
                lastActiveTenantId={lastActiveTenantId}
                onSelectTenant={handleSelectTenantFromSheet}
              />
            </ScrollView>
          </BottomSheet>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeIndicator: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastWrapper: {
    position: 'absolute',
    top: 54,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxWidth: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 42, 59, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContent: {
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
});
