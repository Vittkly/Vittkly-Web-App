import { router, useRootNavigationState, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme';

import { useAuth } from '../hooks/useAuth';

const LOGO_SPLASH_HEIGHT = 68;
const PROGRESS_TRACK_WIDTH = 192;
const PROGRESS_TRACK_HEIGHT = 6;

export function SplashScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const rootNavigationState = useRootNavigationState();
  const { isLoading, status, pin, isPinRequired, tenants, activeOrganizationId } = useAuth();
  const [progressAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  useEffect(() => {
    let isMounted = true;

    if (!rootNavigationState?.key || isLoading || status === 'loading') {
      return () => {
        isMounted = false;
      };
    }

    let targetRoute: Href = '/(auth)/welcome';

    if (status === 'offline_locked' || (pin.isConfigured && pin.isLocked)) {
      targetRoute = '/(auth)/pin-lock';
    } else if (status === 'logged_in' || status === 'offline_authenticated') {
      if (!pin.isConfigured && isPinRequired) {
        targetRoute = '/(auth)/pin-setup';
      } else if (tenants.length > 1 && !activeOrganizationId) {
        targetRoute = '/(auth)/select-tenant';
      } else {
        targetRoute = '/';
      }
    }

    const timerId = setTimeout(() => {
      if (isMounted) {
        router.replace(targetRoute);
      }
    }, 950);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [
    activeOrganizationId,
    isLoading,
    isPinRequired,
    pin.isConfigured,
    pin.isLocked,
    rootNavigationState?.key,
    status,
    tenants.length,
  ]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <SafeAreaView
      testID="auth-splash-screen"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          padding: spacing.space6,
        },
      ]}
    >
      <View style={[styles.content, { gap: spacing.space4 }]}>
        <Logo variant="wordmark" tone="color" height={LOGO_SPLASH_HEIGHT} />

        <Text
          testID="auth-splash-description"
          style={[typography.small, styles.description, { color: colors.inkMuted }]}
        >
          Todo lo que necesita tu negocio de servicios, en un solo lugar.
        </Text>

        <View
          testID="auth-splash-progress-track"
          accessibilityRole="progressbar"
          accessibilityLabel="Verificando sesión"
          style={[
            styles.progressTrack,
            {
              width: PROGRESS_TRACK_WIDTH,
              height: PROGRESS_TRACK_HEIGHT,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceSunken,
              marginTop: spacing.space6,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                borderRadius: radius.pill,
                backgroundColor: colors.vitta,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 240,
  },
  progressTrack: {
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
