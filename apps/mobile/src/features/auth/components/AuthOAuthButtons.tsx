import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { GoogleIcon, MicrosoftIcon } from '@/components/icons';
import { tokens, useTheme } from '@/theme';

export interface AuthOAuthButtonsProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OAUTH_ICON_SIZE = tokens.spacing.space4 + tokens.spacing.space1 / 2; // 18px

/**
 * Bloque de botones OAuth ("Continuar con Google" y "Continuar con Microsoft")
 * con divisor superior "o", replicando `.vk-divider` y `.vk-oauth-stack` de `vittkly-campo-app.html`.
 */
export function AuthOAuthButtons({
  disabled = true,
  style,
  testID = 'auth-oauth-buttons',
}: AuthOAuthButtonsProps) {
  const { colors, spacing, radius, typography, control } = useTheme();

  return (
    <View testID={testID} style={[styles.container, { gap: spacing.space2 }, style]}>
      <View style={[styles.dividerRow, { gap: spacing.space3, marginVertical: spacing.space1 }]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
        <Text style={[typography.small, { color: colors.inkMuted }]}>o</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
      </View>

      <View style={[styles.oauthStack, { gap: spacing.space2 }]}>
        <Pressable
          testID="oauth-google-btn"
          accessibilityRole="button"
          accessibilityLabel="Continuar con Google"
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={[
            styles.oauthButton,
            {
              minHeight: control.lg,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceSunken,
              paddingHorizontal: spacing.space4,
              gap: spacing.space2,
              opacity: disabled ? 0.55 : 1,
            },
          ]}
        >
          <GoogleIcon size={OAUTH_ICON_SIZE} />
          <Text style={[typography.button, { color: colors.ink }]}>Continuar con Google</Text>
        </Pressable>

        <Pressable
          testID="oauth-microsoft-btn"
          accessibilityRole="button"
          accessibilityLabel="Continuar con Microsoft"
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={[
            styles.oauthButton,
            {
              minHeight: control.lg,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceSunken,
              paddingHorizontal: spacing.space4,
              gap: spacing.space2,
              opacity: disabled ? 0.55 : 1,
            },
          ]}
        >
          <MicrosoftIcon size={OAUTH_ICON_SIZE} />
          <Text style={[typography.button, { color: colors.ink }]}>Continuar con Microsoft</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  oauthStack: {
    width: '100%',
  },
  oauthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
