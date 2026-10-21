import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

export interface OfflineSessionBannerProps {
  visible?: boolean;
  message?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ICON_SIZE = tokens.spacing.space4 + tokens.spacing.space1; // 20px
const DOT_SIZE = tokens.spacing.space2; // 8px

/**
 * Banner reactivo en tono `warning` que informa "Sin conexión · Acceso local habilitado"
 * cuando el técnico opera mediante PIN/Biometría sin internet.
 */
export function OfflineSessionBanner({
  visible = true,
  message = 'Sin conexión · Acceso local habilitado',
  style,
  testID = 'offline-session-banner',
}: OfflineSessionBannerProps) {
  const { colors, spacing, radius, typography, control } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          minHeight: control.md,
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
          borderRadius: radius.md,
          paddingHorizontal: spacing.space4,
          paddingVertical: spacing.space2,
          gap: spacing.space2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.indicatorDot,
          {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.warning,
          },
        ]}
      />
      <WifiOff size={ICON_SIZE} color={colors.warningInk} />
      <Text
        testID="offline-session-banner-text"
        style={[
          typography.bodyStrong,
          styles.text,
          {
            color: colors.warningInk,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  indicatorDot: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
  },
});
