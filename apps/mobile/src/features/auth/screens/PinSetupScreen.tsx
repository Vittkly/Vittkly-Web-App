import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { PinPadLock } from '../components/PinPadLock';
import { usePinSetup } from '../hooks/usePinSetup';

export function PinSetupScreen() {
  const { colors, spacing, typography } = useTheme();

  const {
    pinEntry,
    pinLength,
    error,
    isSaving,
    isMandatoryPhoneFlow,
    handleBackPress,
    handleKeyPress,
    handleDelete,
    handleContinuePress,
  } = usePinSetup();

  return (
    <AuthScreenLayout
      testID="pin-setup-screen"
      backButtonTestID="pin-setup-back-btn"
      onBackPress={isMandatoryPhoneFlow ? undefined : handleBackPress}
    >
      <View style={[styles.centerBody, { gap: spacing.space6 }]}>
        <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
          <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
            Crea un PIN de 4 dígitos
          </Text>
          <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
            Lo usarás para entrar rápido, incluso sin conexión.
          </Text>
        </View>

        <PinPadLock
          testID="pin-setup-pad"
          pin={pinEntry}
          length={pinLength}
          error={error}
          disabled={isSaving}
          biometricAvailable={false}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />

        <Button
          testID="pin-setup-continue-btn"
          variant="inverse"
          shape="pill"
          block
          isLoading={isSaving}
          disabled={pinEntry.length < pinLength || isSaving}
          onPress={() => void handleContinuePress()}
          style={styles.actionBtn}
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
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  actionBtn: {
    maxWidth: 320,
    alignSelf: 'center',
  },
});
