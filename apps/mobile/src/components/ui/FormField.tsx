import React from 'react';
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

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  testID?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function FormField({
  label,
  error,
  testID,
  leftSlot,
  rightSlot,
  containerStyle,
  style,
  editable = true,
  placeholderTextColor,
  ...inputProps
}: FormFieldProps) {
  const { colors, spacing, radius, control, typography, borderWidth } = useTheme();

  const borderColor = error ? colors.dangerInk : colors.line;

  return (
    <View style={[styles.wrapper, { gap: spacing.space1 }, containerStyle]}>
      {label ? (
        <Text style={[typography.small, styles.label, { color: colors.inkMuted }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            minHeight: control.lg,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceSunken,
            borderColor,
            borderWidth: borderWidth.thin,
            paddingHorizontal: spacing.space3,
            gap: spacing.space2,
          },
          style,
        ]}
      >
        {leftSlot}

        <TextInput
          testID={testID}
          editable={editable}
          placeholderTextColor={placeholderTextColor ?? colors.inkMuted}
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
