import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { useResetPassword } from '../hooks/useResetPassword';

const LOGO_HEIGHT = 48;

export function ResetPasswordScreen() {
  const { colors, spacing, typography } = useTheme();

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    errors,
    setErrors,
    isSubmitting,
    handleBackPress,
    handleSavePassword,
  } = useResetPassword();

  return (
    <AuthScreenLayout
      testID="reset-password-screen"
      backButtonTestID="reset-password-back-btn"
      onBackPress={handleBackPress}
    >
      <View style={[styles.centerBody, { gap: spacing.space4 }]}>
        <View style={[styles.formCard, { gap: spacing.space4 }]}>
          <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
            <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
            <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
              Crea una nueva contraseña
            </Text>
            <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
              Usa una contraseña segura que no hayas usado antes.
            </Text>
          </View>

          <AlertBanner message={errors.general} tone="danger" testID="reset-password-error-box" />

          <View style={{ gap: spacing.space3 }}>
            <View style={{ gap: spacing.space1 }}>
              <PasswordField
                testID="reset-password-new-input"
                toggleTestID="reset-password-toggle-btn"
                label="Nueva contraseña"
                value={password}
                editable={!isSubmitting}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.p1) setErrors(prev => ({ ...prev, p1: undefined }));
                }}
                placeholder="••••••••"
                error={errors.p1}
              />
              {!errors.p1 ? (
                <Text style={[typography.small, { color: colors.inkMuted }]}>
                  Mín. 8 caracteres, mayúscula, número y símbolo.
                </Text>
              ) : null}
            </View>

            <FormField
              testID="reset-password-confirm-input"
              label="Confirmar contraseña"
              value={confirmPassword}
              editable={!isSubmitting}
              secureTextEntry={!showPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.p2) setErrors(prev => ({ ...prev, p2: undefined }));
              }}
              placeholder="••••••••"
              error={errors.p2}
            />
          </View>

          <Button
            testID="reset-password-submit-btn"
            variant="inverse"
            shape="pill"
            block
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onPress={() => void handleSavePassword()}
          >
            Guardar contraseña
          </Button>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  centerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  formCard: {
    width: '100%',
    maxWidth: 320,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
