import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme';

const ICON_CIRCLE_SIZE = 48;
const CHECK_ICON_SIZE = 24;

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
        <Check size={CHECK_ICON_SIZE} color={colors.primaryInk} />
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
        onPress={() => router.replace('/(auth)/login_email')}
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
