import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type AlertTone = 'danger' | 'warning' | 'success' | 'info';

export interface AlertBannerProps {
  message?: string | null;
  tone?: AlertTone;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const ICON_SIZE = 16;

export function AlertBanner({
  message,
  tone = 'danger',
  testID = 'alert-banner',
  style,
}: AlertBannerProps) {
  const { colors, spacing, radius, typography, borderWidth } = useTheme();

  if (!message || message.trim().length === 0) {
    return null;
  }

  const toneConfig = {
    danger: {
      bg: colors.dangerSoft,
      border: colors.dangerInk,
      text: colors.dangerInk,
      icon: AlertCircle,
    },
    warning: {
      bg: colors.warningSoft,
      border: colors.warningInk,
      text: colors.warningInk,
      icon: AlertTriangle,
    },
    success: {
      bg: colors.successSoft,
      border: colors.successInk,
      text: colors.successInk,
      icon: CheckCircle,
    },
    info: {
      bg: colors.primarySoft,
      border: colors.primaryInk,
      text: colors.primaryInk,
      icon: Info,
    },
  }[tone];

  const IconComponent = toneConfig.icon;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: toneConfig.bg,
          borderColor: toneConfig.border,
          borderWidth: borderWidth.thin,
          borderRadius: radius.md,
          padding: spacing.space3,
          gap: spacing.space2,
        },
        style,
      ]}
    >
      <IconComponent size={ICON_SIZE} color={toneConfig.text} />
      <Text style={[typography.small, styles.message, { color: toneConfig.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
  },
});
