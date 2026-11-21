import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { BUTTON_ICON_MAP, ButtonIconName } from './button-icons';

export type { ButtonIconName };
export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tenant' | 'option' | 'inverse';
export type ButtonAccent = 'vitta' | 'kleanly' | 'tinta';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  accent?: ButtonAccent;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  inAuthSheet?: boolean;
  icon?: ButtonIconName;
  isLoading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Botón nativo de Vittkly UI Kit.
 */
export function Button({
  variant = 'primary',
  accent = 'vitta',
  size = 'lg',
  shape = 'rounded',
  block = false,
  inAuthSheet = false,
  icon,
  disabled = false,
  isLoading = false,
  onPress,
  onClick,
  accessibilityLabel,
  hitSlop,
  children,
  style,
  testID,
  ...rest
}: ButtonProps) {
  const { colors, control, spacing, radius, fontFamilies, isDark, opacity, borderWidth } =
    useTheme();

  const heightMap: Record<ButtonSize, number> = { sm: control.sm, md: control.md, lg: control.lg };
  const paddingHorizontalMap: Record<ButtonSize, number> = {
    sm: spacing.space3,
    md: spacing.space4,
    lg: spacing.space6,
  };
  const fontSizeMap: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 16 };
  const minHitPad = Math.max(0, (control.lg - heightMap[size]) / 2);
  const resolvedHitSlop =
    hitSlop ?? (minHitPad > 0 ? { top: minHitPad, bottom: minHitPad } : undefined);

  const IconComponent = icon ? BUTTON_ICON_MAP[icon] : null;
  const iconSize = size === 'sm' ? 16 : 18;
  const resolvedLabel =
    accessibilityLabel ??
    (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);

  const resolveColors = (pressed: boolean) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? colors.primaryHover : colors.primary,
          borderColor: 'transparent',
          borderWidth: borderWidth.thin,
          textColor: colors.onPrimary,
          iconColor: colors.onPrimary,
        };
      case 'inverse':
        return {
          backgroundColor: pressed
            ? isDark
              ? colors.primaryHover
              : colors.inkMuted
            : isDark
              ? colors.primary
              : colors.ink,
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: isDark ? colors.onPrimary : colors.surface,
          iconColor: isDark ? colors.onPrimary : colors.surface,
        };
      case 'secondary':
        return inAuthSheet
          ? {
              backgroundColor: pressed ? colors.sheetCardActive : colors.sheetCard,
              borderColor: 'transparent',
              borderWidth: 0,
              textColor: colors.ink,
              iconColor: colors.ink,
            }
          : {
              backgroundColor: pressed ? colors.surfaceSunken : colors.surfaceRaised,
              borderColor: colors.lineStrong,
              borderWidth: borderWidth.thin,
              textColor: colors.ink,
              iconColor: colors.ink,
            };
      case 'outline':
        return {
          backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
          borderColor: colors.lineStrong,
          borderWidth: borderWidth.thin,
          textColor: colors.ink,
          iconColor: colors.ink,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? colors.primarySoft : 'transparent',
          borderColor: 'transparent',
          borderWidth: borderWidth.thin,
          textColor: colors.primaryInk,
          iconColor: colors.primaryInk,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger,
          borderColor: 'transparent',
          borderWidth: borderWidth.thin,
          textColor: colors.onDanger,
          iconColor: colors.onDanger,
        };
      case 'tenant':
        return {
          backgroundColor: colors.tenantAccent,
          borderColor: 'transparent',
          borderWidth: borderWidth.thin,
          textColor: colors.onTenantAccent,
          iconColor: colors.onTenantAccent,
        };
      case 'option': {
        const optionBorder =
          accent === 'kleanly' ? colors.kleanly : accent === 'tinta' ? colors.ink : colors.vitta;
        const optionText =
          accent === 'kleanly'
            ? colors.successInk
            : accent === 'tinta'
              ? colors.ink
              : colors.primaryInk;

        return {
          backgroundColor: colors.surfaceRaised,
          borderColor: pressed ? optionBorder : colors.line,
          borderWidth: borderWidth.emphasis,
          textColor: pressed ? optionText : colors.ink,
          iconColor: pressed ? optionText : colors.inkMuted,
        };
      }
    }
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
      accessibilityState={{ disabled: !!disabled || isLoading, busy: isLoading }}
      hitSlop={resolvedHitSlop}
      disabled={disabled || isLoading}
      onPress={onPress ?? onClick}
      style={({ pressed }) => {
        const c = resolveColors(pressed && !disabled && !isLoading);
        return [
          styles.base,
          {
            minHeight: heightMap[size],
            height: heightMap[size],
            paddingHorizontal: paddingHorizontalMap[size],
            borderRadius: shape === 'pill' ? radius.pill : radius.md,
            gap: spacing.space2,
            backgroundColor: c.backgroundColor,
            borderColor: c.borderColor,
            borderWidth: c.borderWidth,
            width: block ? '100%' : undefined,
            alignSelf: block ? 'stretch' : 'flex-start',
            opacity: disabled || isLoading ? opacity.disabled : 1,
          },
          style,
        ];
      }}
      {...rest}
    >
      {({ pressed }) => {
        const c = resolveColors(pressed && !disabled && !isLoading);
        if (isLoading) {
          return <ActivityIndicator size="small" color={c.textColor} />;
        }
        return (
          <>
            {IconComponent ? (
              <IconComponent size={iconSize} color={c.iconColor} strokeWidth={2} />
            ) : null}
            {typeof children === 'string' || typeof children === 'number' ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: c.textColor,
                    fontFamily: fontFamilies.bold,
                    fontSize: fontSizeMap[size],
                  },
                ]}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    lineHeight: 20,
    fontWeight: '700',
  },
});
