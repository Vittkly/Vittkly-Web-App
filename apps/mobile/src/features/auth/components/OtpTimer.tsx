import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens, useTheme } from '@/theme';

export interface OtpTimerProps {
  formattedTime: string;
  isExpired: boolean;
  disabled?: boolean;
  resendLabel?: string;
  onResendPress: () => void;
  testIDPrefix?: string;
}

export function OtpTimer({
  formattedTime,
  isExpired,
  disabled = false,
  resendLabel = 'Reenviar código',
  onResendPress,
  testIDPrefix = 'otp',
}: OtpTimerProps) {
  const { colors, spacing, radius, typography, control, fontFamilies } = useTheme();

  return (
    <View style={[styles.timerSection, { gap: spacing.space2 }]}>
      <View style={[styles.timerRow, { gap: spacing.space2 }]}>
        <Text style={[typography.small, { color: colors.inkMuted }]}>
          {isExpired ? '¿No llegó el código?' : '¿No llegó? Reenviar en'}
        </Text>
        <Text
          testID={`${testIDPrefix}-countdown-timer`}
          accessibilityLabel={`Tiempo restante ${formattedTime}`}
          style={[
            tokens.typography.timerDisplay,
            styles.centerText,
            {
              fontFamily: fontFamilies.mono,
              color: isExpired ? colors.inkMuted : colors.primaryInk,
            },
          ]}
        >
          {formattedTime}
        </Text>
      </View>

      <Pressable
        testID={`${testIDPrefix}-resend-btn`}
        accessibilityRole="button"
        accessibilityLabel={resendLabel}
        accessibilityState={{ disabled: !isExpired || disabled }}
        disabled={!isExpired || disabled}
        onPress={onResendPress}
        style={({ pressed }) => [
          styles.resendButton,
          {
            minHeight: control.lg,
            paddingHorizontal: spacing.space4,
            borderRadius: radius.pill,
            backgroundColor: isExpired ? colors.primarySoft : 'transparent',
            opacity: !isExpired || disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text
          style={[typography.button, { color: isExpired ? colors.primaryInk : colors.inkMuted }]}
        >
          {resendLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  resendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
