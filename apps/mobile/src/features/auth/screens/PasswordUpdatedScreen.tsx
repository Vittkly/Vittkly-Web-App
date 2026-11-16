import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CheckIcon } from '@/components/icons';
import { tokens, useTheme } from '@/theme';

const ICON_CIRCLE_SIZE = tokens.control.lg;
const CHECK_ICON_SIZE = tokens.spacing.space6;

export function PasswordUpdatedScreen() {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <SafeAreaView
      testID="password-updated-screen"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.space6,
          gap: spacing.space4,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            width: ICON_CIRCLE_SIZE,
            height: ICON_CIRCLE_SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.primarySoft,
          },
        ]}
      >
        <CheckIcon size={CHECK_ICON_SIZE} color={colors.primaryInk} />
      </View>

      <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
        Contraseña actualizada
      </Text>

      <Text
        style={[
          typography.small,
          styles.centerText,
          styles.subtitleWidth,
          { color: colors.inkMuted },
        ]}
      >
        Ya puedes iniciar sesión con tu nueva contraseña.
      </Text>

      <Button
        testID="password-updated-login-btn"
        variant="inverse"
        shape="pill"
        block
        onPress={() => router.replace('/(auth)/login')}
      >
        Ir a iniciar sesión
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  subtitleWidth: {
    maxWidth: 280,
  },
});
