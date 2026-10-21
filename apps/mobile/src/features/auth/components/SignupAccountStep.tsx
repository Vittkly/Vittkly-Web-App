import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { useTheme } from '@/theme';

import { AuthOAuthButtons } from './AuthOAuthButtons';

export interface SignupAccountStepProps {
  fullName: string;
  onChangeFullName: (val: string) => void;
  email: string;
  onChangeEmail: (val: string) => void;
  password: string;
  onChangePassword: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  nameError?: string;
  emailError?: string;
  passwordError?: string;
  onContinue: () => void;
  onGoToLogin: () => void;
}

export function SignupAccountStep({
  fullName,
  onChangeFullName,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  nameError,
  emailError,
  passwordError,
  onContinue,
  onGoToLogin,
}: SignupAccountStepProps) {
  const { colors, spacing, typography, control } = useTheme();

  return (
    <View style={{ gap: spacing.space3 }}>
      <FormField
        testID="signup-name-input"
        label="Nombre completo"
        value={fullName}
        onChangeText={onChangeFullName}
        placeholder="Ej. Andree Injante"
        autoCapitalize="words"
        error={nameError}
      />

      <FormField
        testID="signup-email-input"
        label="Correo"
        value={email}
        onChangeText={onChangeEmail}
        placeholder="tucorreo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={emailError}
      />

      <View style={{ gap: spacing.space1 }}>
        <PasswordField
          testID="signup-password-input"
          toggleTestID="signup-toggle-password-btn"
          label="Contraseña"
          value={password}
          onChangeText={onChangePassword}
          placeholder="••••••••"
          error={passwordError}
        />
        {!passwordError ? (
          <Text style={[typography.small, { color: colors.inkMuted }]}>
            Mín. 8 caracteres, mayúscula, número y símbolo.
          </Text>
        ) : null}
      </View>

      <Button
        testID="signup-step1-continue-btn"
        variant="inverse"
        shape="pill"
        block
        onPress={onContinue}
      >
        Continuar
      </Button>

      <View style={[styles.toggleRow, { gap: spacing.space1 }]}>
        <Text style={[typography.small, { color: colors.inkMuted }]}>¿Ya tienes cuenta?</Text>
        <Pressable
          testID="signup-go-to-login-btn"
          accessibilityRole="button"
          accessibilityLabel="Inicia sesión"
          onPress={onGoToLogin}
          style={[styles.inlineLink, { minHeight: control.lg }]}
        >
          <Text style={[typography.bodyStrong, { color: colors.primaryInk }]}>Inicia sesión</Text>
        </Pressable>
      </View>

      <AuthOAuthButtons disabled />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineLink: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
