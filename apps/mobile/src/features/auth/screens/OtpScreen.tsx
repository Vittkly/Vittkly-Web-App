import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { OtpVerification } from '../components/OtpVerification';
import { useOtpVerification } from '../hooks/useOtpVerification';

export function OtpScreen() {
  const { colors, spacing, typography } = useTheme();

  const {
    flow,
    params,
    targetEmail,
    targetPhone,
    otpCode,
    setOtpCode,
    error,
    setError,
    isVerifying,
    handleBackPress,
    handleVerifyOtp,
    handleResendCode,
  } = useOtpVerification();

  const displayPhone = params.phone || targetPhone;
  const subtitle =
    flow === 'signup' || flow === 'recovery'
      ? `Te enviamos un código de 6 dígitos a ${targetEmail || 'tu correo'}`
      : `Enviado por WhatsApp al ${displayPhone}`;

  return (
    <AuthScreenLayout
      testID="otp-screen"
      backButtonTestID="otp-back-btn"
      onBackPress={handleBackPress}
    >
      <View style={[styles.centerBody, { gap: spacing.space6 }]}>
        <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
          <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
            Ingresa el código
          </Text>
          <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
            {subtitle}
          </Text>
        </View>

        <OtpVerification
          value={otpCode}
          disabled={isVerifying}
          error={error}
          focusVariant="primary"
          onChange={code => {
            setOtpCode(code);
            setError(null);
          }}
          onCodeComplete={code => {
            setOtpCode(code);
            void handleVerifyOtp(code);
          }}
          onResendCode={() => void handleResendCode()}
        />

        <Button
          testID="otp-continue-btn"
          variant="inverse"
          shape="pill"
          block
          isLoading={isVerifying}
          disabled={isVerifying || otpCode.length < 6}
          onPress={() => void handleVerifyOtp()}
        >
          Continuar
        </Button>
      </View>
    </AuthScreenLayout>
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
  },
  centerText: {
    textAlign: 'center',
  },
});
