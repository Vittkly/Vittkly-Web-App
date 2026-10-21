import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

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
 * Por requerimiento de la Fase 1, se renderizan deshabilitados a modo de presentación UI.
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
          <Svg width={OAUTH_ICON_SIZE} height={OAUTH_ICON_SIZE} viewBox="0 0 48 48">
            <Path
              fill={colors.warning}
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <Path
              fill={colors.danger}
              d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <Path
              fill={colors.kleanly}
              d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.5 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"
            />
            <Path
              fill={colors.primary}
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C41.8 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </Svg>
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
          <Svg width={OAUTH_ICON_SIZE} height={OAUTH_ICON_SIZE} viewBox="0 0 23 23">
            <Rect x="1" y="1" width="10" height="10" fill={colors.danger} />
            <Rect x="12" y="1" width="10" height="10" fill={colors.kleanly} />
            <Rect x="1" y="12" width="10" height="10" fill={colors.vitta} />
            <Rect x="12" y="12" width="10" height="10" fill={colors.warning} />
          </Svg>
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
