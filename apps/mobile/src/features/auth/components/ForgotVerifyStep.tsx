import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

import { OtpVerification } from './OtpVerification';

export interface ForgotVerifyStepProps {
  email: string;
  otpCode: string;
  onChangeOtpCode: (code: string) => void;
  error?: string | null;
  isSubmitting: boolean;
  onVerify: (code?: string) => void;
  onResend: () => void;
}

export function ForgotVerifyStep({
  email,
  otpCode,
  onChangeOtpCode,
  error,
  isSubmitting,
  onVerify,
  onResend,
}: ForgotVerifyStepProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.centerBody, { gap: spacing.space6 }]}>
      <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
        <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
          Ingresa el código
        </Text>
        <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
          Te lo enviamos a {email.trim() || 'tu correo'}
        </Text>
      </View>

      <OtpVerification
        value={otpCode}
        error={error}
        disabled={isSubmitting}
        onChange={onChangeOtpCode}
        onCodeComplete={code => {
          onChangeOtpCode(code);
          onVerify(code);
        }}
        onResendCode={onResend}
      />

      <Button
        testID="forgot-verify-continue-btn"
        variant="inverse"
        shape="pill"
        block
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onPress={() => onVerify()}
      >
        Continuar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
