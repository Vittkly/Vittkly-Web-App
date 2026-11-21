import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export interface OptionCardProps extends Omit<PressableProps, 'style' | 'children'> {
  highlighted?: boolean;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface OptionCardIconProps {
  children: React.ReactNode;
  tone?: 'primary' | 'tenant' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

export interface OptionCardBodyProps {
  title: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
}

export interface OptionCardBadgeProps {
  label: string;
  tone?: 'success' | 'warning' | 'primary';
  style?: StyleProp<ViewStyle>;
}

export interface OptionCardChevronProps {
  color?: string;
  size?: number;
}

const CHEVRON_SIZE = 20;

export function OptionCard({
  highlighted = false,
  selected = false,
  disabled = false,
  testID,
  accessibilityLabel,
  style,
  children,
  onPress,
  ...rest
}: OptionCardProps) {
  const { colors, spacing, radius, control, shadows, borderWidth, opacity } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => {
        const isActionActive = pressed && !disabled;
        const bg = isActionActive
          ? colors.primarySoft
          : selected || highlighted
            ? colors.surfaceRaised
            : colors.surfaceRaised;
        const border = highlighted || selected ? colors.primary : colors.line;

        return [
          styles.container,
          shadows.shadow1,
          {
            minHeight: control.lg + spacing.space8,
            backgroundColor: bg,
            borderColor: border,
            borderWidth: highlighted || selected ? borderWidth.emphasis : borderWidth.thin,
            borderRadius: radius.lg,
            padding: spacing.space4,
            gap: spacing.space3,
            opacity: disabled ? opacity.disabled : 1,
          },
          style,
        ];
      }}
      {...rest}
    >
      <View style={[styles.innerRow, { gap: spacing.space3 }]}>{children}</View>
    </Pressable>
  );
}

OptionCard.Icon = function OptionCardIcon({
  children,
  tone = 'primary',
  style,
}: OptionCardIconProps) {
  const { colors, radius, control } = useTheme();

  const bgMap = {
    primary: colors.primarySoft,
    tenant: colors.tenantAccentSoft,
    neutral: colors.surfaceSunken,
  };

  return (
    <View
      style={[
        styles.iconBox,
        {
          width: control.md,
          height: control.md,
          borderRadius: radius.md,
          backgroundColor: bgMap[tone],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

OptionCard.Body = function OptionCardBody({ title, description, style }: OptionCardBodyProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.body, { gap: spacing.space1 }, style]}>
      <Text style={[typography.title3, { color: colors.ink }]}>{title}</Text>
      {description ? (
        <Text style={[typography.small, { color: colors.inkMuted }]}>{description}</Text>
      ) : null}
    </View>
  );
};

OptionCard.Badge = function OptionCardBadge({
  label,
  tone = 'success',
  style,
}: OptionCardBadgeProps) {
  const { colors, radius, typography, fontFamilies, spacing } = useTheme();

  const config = {
    success: { bg: colors.tenantAccentSoft, text: colors.successInk },
    warning: { bg: colors.warningSoft, text: colors.warningInk },
    primary: { bg: colors.primarySoft, text: colors.primaryInk },
  }[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.space2,
          paddingVertical: spacing.space1 / 2,
        },
        style,
      ]}
    >
      <Text style={[typography.label, { fontFamily: fontFamilies.bold, color: config.text }]}>
        {label}
      </Text>
    </View>
  );
};

OptionCard.Chevron = function OptionCardChevron({
  color,
  size = CHEVRON_SIZE,
}: OptionCardChevronProps) {
  const { colors } = useTheme();
  return <ChevronRight size={size} color={color ?? colors.inkMuted} />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
  },
});
