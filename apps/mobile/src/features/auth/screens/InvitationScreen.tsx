import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormField } from '@/components/ui/FormField';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { useAuthBackNavigation } from '../hooks/useAuthBackNavigation';
import { useInvitation } from '../hooks/useInvitation';

const LOGO_HEIGHT = 52;

export function InvitationScreen() {
  const { colors, spacing, typography } = useTheme();
  const { handleBack } = useAuthBackNavigation('/(auth)/welcome');
  const { code, isValidating, error, handleCodeChange, validateCode } = useInvitation();

  const handleValidatePress = async () => {
    if (isValidating) return;
    const result = await validateCode();
    if (result?.isValid) {
      router.push({
        pathname: '/(auth)/invite-welcome',
        params: {
          code: result.code,
          organizationName: result.organizationName ?? 'Vitta Kleanly',
          jobTitle: result.jobTitle ?? 'Técnico de campo',
          invitedName: result.invitedName ?? 'Jorge',
          invitedPhone: result.invitedPhone ?? '',
        },
      });
    }
  };

  return (
    <AuthScreenLayout
      testID="invitation-screen"
      backButtonTestID="invitation-back-btn"
      onBackPress={() => handleBack('/(auth)/welcome')}
    >
      <View style={[styles.centerBody, { gap: spacing.space6 }]}>
        <View style={[styles.headerCenter, { gap: spacing.space2 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
          <View style={{ gap: spacing.space1 }}>
            <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
              Tengo una invitación
            </Text>
            <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
              Ingresa el código que te compartió tu empresa.
            </Text>
          </View>
        </View>

        <View style={[styles.formCard, { gap: spacing.space3 }]}>
          <View style={{ gap: spacing.space1 }}>
            <FormField
              testID="invitation-code-input"
              label="Código de invitación"
              value={code}
              editable={!isValidating}
              onChangeText={handleCodeChange}
              placeholder="Ej. VK-7F3K9"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
            />
            <Text style={[typography.small, { color: colors.inkMuted }]}>
              Distingue mayúsculas y minúsculas.
            </Text>
          </View>

          <AlertBanner message={error} tone="danger" testID="invitation-error-box" />

          <Button
            testID="invitation-validate-btn"
            variant="inverse"
            shape="pill"
            block
            isLoading={isValidating}
            disabled={isValidating || code.trim().length < 4}
            onPress={() => void handleValidatePress()}
          >
            Validar código
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
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 320,
  },
});
