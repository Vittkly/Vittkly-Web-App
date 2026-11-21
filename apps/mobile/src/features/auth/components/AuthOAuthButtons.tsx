import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { GoogleIcon, MicrosoftIcon } from '@/components/icons';
import { tokens, useTheme } from '@/theme';

import type { OAuthProvider } from '../types/auth.types';

export interface AuthOAuthButtonsProps {
  disabled?: boolean;
  loadingProvider?: OAuthProvider | null;
  onGooglePress?: () => void | Promise<void>;
  onMicrosoftPress?: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OAUTH_ICON_SIZE = tokens.spacing.space4 + tokens.spacing.space1 / 2; // 18px

/**
 * Bloque de botones OAuth ("Continuar con Google" y "Continuar con Microsoft")
 * con divisor superior "o", replicando `.vk-divider` y `.vk-oauth-stack` de `vittkly-campo-app.html`.
 */
export function AuthOAuthButtons({
  disabled = false,
  loadingProvider = null,
  onGooglePress,
  onMicrosoftPress,
  style,
  testID = 'auth-oauth-buttons',
}: AuthOAuthButtonsProps) {
  const { colors, spacing, radius, typography, control } = useTheme();

  const providers: {
    id: OAuthProvider;
    testID: string;
    label: string;
    onPress?: () => void | Promise<void>;
    renderIcon: () => React.ReactNode;
  }[] = [
    {
      id: 'google',
      testID: 'oauth-google-btn',
      label: 'Continuar con Google',
      onPress: onGooglePress,
      renderIcon: () => <GoogleIcon size={OAUTH_ICON_SIZE} />,
    },
    {
      id: 'microsoft',
      testID: 'oauth-microsoft-btn',
      label: 'Continuar con Microsoft',
      onPress: onMicrosoftPress,
      renderIcon: () => <MicrosoftIcon size={OAUTH_ICON_SIZE} />,
    },
  ];

  return (
    <View testID={testID} style={[styles.container, { gap: spacing.space2 }, style]}>
      <View style={[styles.dividerRow, { gap: spacing.space3, marginVertical: spacing.space1 }]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
        <Text style={[typography.small, { color: colors.inkMuted }]}>o</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
      </View>

      <View style={[styles.oauthStack, { gap: spacing.space2 }]}>
        {providers.map((item) => {
          const isLoading = loadingProvider === item.id;
          const isDisabled = disabled || loadingProvider !== null || !item.onPress;

          return (
            <Pressable
              key={item.id}
              testID={item.testID}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ disabled: isDisabled, busy: isLoading }}
              disabled={isDisabled}
              onPress={() => {
                if (item.onPress) {
                  void item.onPress();
                }
              }}
              style={({ pressed }) => [
                styles.oauthButton,
                {
                  minHeight: control.lg,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surfaceSunken,
                  paddingHorizontal: spacing.space4,
                  gap: spacing.space2,
                  opacity: isDisabled && !isLoading ? 0.55 : pressed ? 0.8 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : (
                item.renderIcon()
              )}
              <Text style={[typography.button, { color: colors.ink }]}>{item.label}</Text>
            </Pressable>
          );
        })}
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
