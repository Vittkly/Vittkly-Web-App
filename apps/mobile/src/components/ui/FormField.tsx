import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export type FormFieldVariant = 'filled' | 'underline';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: FormFieldVariant;
  testID?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function FormField({
  label,
  hint,
  error,
  variant = 'filled',
  testID,
  leftSlot,
  rightSlot,
  containerStyle,
  style,
  editable = true,
  placeholderTextColor,
  onFocus,
  onBlur,
  ...inputProps
}: FormFieldProps) {
  const { colors, spacing, radius, control, typography, borderWidth, opacity } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const isUnderline = variant === 'underline';
  const borderColor = error
    ? colors.dangerInk
    : isFocused
      ? colors.focus
      : isUnderline
        ? colors.lineStrong
        : colors.line;
  const activeBorderWidth = error || isFocused ? borderWidth.emphasis : borderWidth.thin;

  return (
    <View style={[styles.wrapper, { gap: spacing.space1 }, containerStyle]}>
      {label ? (
        <Text style={[typography.small, styles.label, { color: colors.inkMuted }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isUnderline
            ? {
                minHeight: control.lg,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderBottomColor: borderColor,
                borderBottomWidth: activeBorderWidth,
                paddingHorizontal: 0,
                gap: spacing.space2,
                opacity: editable ? 1 : opacity.disabled,
              }
            : {
                minHeight: control.lg,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceSunken,
                borderColor,
                borderWidth: activeBorderWidth,
                paddingHorizontal: spacing.space3,
                gap: spacing.space2,
                opacity: editable ? 1 : opacity.disabled,
              },
          style,
        ]}
      >
        {leftSlot}

        <TextInput
          testID={testID}
          editable={editable}
          placeholderTextColor={placeholderTextColor ?? colors.inkMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            typography.body,
            styles.input,
            {
              color: colors.ink,
            },
          ]}
          {...inputProps}
        />

        {rightSlot}
      </View>

      {error ? (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          accessibilityLiveRegion="polite"
          style={[typography.small, { color: colors.dangerInk }]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text style={[typography.small, { color: colors.inkMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
