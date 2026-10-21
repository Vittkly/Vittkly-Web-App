import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { useTheme } from '@/theme';

import { AuthOAuthButtons } from '../components/AuthOAuthButtons';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { useEmailLogin } from '../hooks/useEmailLogin';

const LOGO_HEIGHT = 48;

export function EmailLoginScreen() {
  const { colors, spacing, typography, control } = useTheme();

  const {
    email,
    setEmail,
    password,
    setPassword,
    fieldErrors,
    setFieldErrors,
    authError,
    setAuthError,
    isSubmitting,
    handleBackPress,
    handleLoginSubmit,
  } = useEmailLogin();

  return (
    <AuthScreenLayout
      testID="login-email-screen"
      backButtonTestID="login-email-back-btn"
      onBackPress={handleBackPress}
    >
      <View style={{ gap: spacing.space3 }}>
        {/* Cabecera centrada */}
        <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
          <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
            Inicia sesión
          </Text>
        </View>

        <AlertBanner message={authError} tone="danger" testID="login-email-error-box" />

        <View style={{ gap: spacing.space3 }}>
          {/* Correo electrónico */}
          <FormField
            testID="login-email-input"
            label="Correo electrónico"
            value={email}
            editable={!isSubmitting}
            onChangeText={text => {
              setEmail(text);
              setAuthError(null);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="demo@vittkly.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={fieldErrors.email}
          />

          {/* Contraseña */}
          <PasswordField
            testID="login-password-input"
            toggleTestID="login-toggle-password-btn"
            label="Contraseña"
            value={password}
            editable={!isSubmitting}
            onChangeText={text => {
              setPassword(text);
              setAuthError(null);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••"
            autoComplete="password"
            error={fieldErrors.password}
          />

          {/* Enlace: Recuperar contraseña */}
          <Pressable
            testID="login-forgot-password-btn"
            accessibilityRole="button"
            accessibilityLabel="Recuperar contraseña"
            onPress={() =>
              router.push({
                pathname: '/(auth)/forgot',
                params: email.trim() ? { email: email.trim() } : undefined,
              })
            }
            style={[styles.forgotLink, { minHeight: control.lg }]}
          >
            <Text style={[typography.small, { color: colors.inkMuted }]}>Recuperar contraseña</Text>
          </Pressable>

          {/* Botón Iniciar sesión */}
          <Button
            testID="login-submit-email-btn"
            variant="inverse"
            shape="pill"
            block
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onPress={() => void handleLoginSubmit()}
          >
            Iniciar sesión
          </Button>

          {/* Enlace a Crear cuenta */}
          <View style={[styles.toggleRow, { gap: spacing.space1 }]}>
            <Text style={[typography.small, { color: colors.inkMuted }]}>¿No tienes cuenta?</Text>
            <Pressable
              testID="login-go-to-signup-btn"
              accessibilityRole="button"
              accessibilityLabel="Créala"
              onPress={() => router.push('/(auth)/login')}
              style={[styles.inlineLink, { minHeight: control.lg }]}
            >
              <Text style={[typography.bodyStrong, { color: colors.primaryInk }]}>Créala</Text>
            </Pressable>
          </View>

          {/* Botones OAuth */}
          <AuthOAuthButtons disabled />
        </View>

        <Text style={[typography.small, styles.legalText, { color: colors.inkMuted }]}>
          Al continuar aceptas los Términos y la Política de privacidad.
        </Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineLink: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    textAlign: 'center',
  },
});
