import { ChevronsUpDown } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useAuth } from '@/features/auth';
import { getInitials } from '@/features/auth/utils/profile';
import { OrgSwitchSheet, useOrgStore } from '@/features/tenants';
import { useTheme } from '@/theme';

export interface CompanyCircleButtonProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  showChevron?: boolean;
}

export function CompanyCircleButton({
  style,
  testID = 'company-circle-button',
  showChevron = true,
}: CompanyCircleButtonProps) {
  const { colors, radius, typography, fontFamilies, control } = useTheme();
  const { tenants, activeTenant } = useAuth();
  const { activeOrg, organizations } = useOrgStore();

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastOpacity] = useState(() => new Animated.Value(0));
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalOrgs = organizations.length > 0 ? organizations.length : tenants.length;
  const hasMultipleTenants = totalOrgs > 1;

  const currentOrgName =
    activeOrg?.name ||
    activeTenant?.name ||
    organizations[0]?.name ||
    tenants[0]?.name ||
    'Vitta Kleanly';

  const companyInitials = getInitials(currentOrgName);

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
    setToastMessage(`Perteneces únicamente a ${currentOrgName}`);
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

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Empresa activa: ${currentOrgName}.${
          hasMultipleTenants
            ? ' Toca para cambiar de empresa.'
            : ' Perteneces únicamente a esta empresa.'
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

        {hasMultipleTenants && showChevron ? (
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

      {/* BottomSheet modal interactivo para conmutar de empresa */}
      <OrgSwitchSheet visible={isSheetVisible} onClose={() => setIsSheetVisible(false)} />
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
});
