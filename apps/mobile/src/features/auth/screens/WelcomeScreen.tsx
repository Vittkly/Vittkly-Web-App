import { router } from 'expo-router';
import { ScanFace, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTheme } from '@/theme';

import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { useAuth } from '../hooks/useAuth';

const HERO_LOGO_HEIGHT = 60;
const CARD_ICON_WRAP_SIZE = 32;
const CARD_ICON_SIZE = 16;

export function WelcomeScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { isOffline } = useAuth();

  return (
    <SafeAreaView
      testID="welcome-screen"
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <OfflineSessionBanner visible={isOffline} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        {/* Bloque Superior */}
        <View
          style={[
            styles.authTop,
            {
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.space6,
              paddingVertical: spacing.space8,
              gap: spacing.space3,
            },
          ]}
        >
          <Logo variant="wordmark" tone="color" height={HERO_LOGO_HEIGHT} />
          <View style={[styles.titleBlock, { gap: spacing.space1 }]}>
            <Text style={[typography.title1, styles.centerText, { color: colors.ink }]}>
              Te damos la bienvenida
            </Text>
            <Text
              style={[
                typography.body,
                styles.centerText,
                styles.subtitleWidth,
                { color: colors.inkMuted },
              ]}
            >
              Tus visitas, órdenes, cobros y más, todo en un solo lugar.
            </Text>
          </View>
        </View>

        {/* Hoja Inferior */}
        <BottomSheet testID="welcome-bottom-sheet">
          {/* Botón 1: Crear cuenta nueva */}
          <Button
            testID="welcome-create-account-btn"
            variant="inverse"
            shape="pill"
            block
            onPress={() => router.push('/(auth)/login')}
          >
            Crear cuenta nueva
          </Button>

          {/* Botón 2: Iniciar sesión */}
          <Button
            testID="welcome-login-btn"
            variant="secondary"
            shape="pill"
            block
            onPress={() => router.push('/(auth)/login_email')}
          >
            Iniciar sesión
          </Button>

          {/* Tarjetas de acceso rápido en 2 columnas */}
          <View
            style={[styles.accessCardsGrid, { gap: spacing.space3, marginTop: spacing.space2 }]}
          >
            {/* Tarjeta 1: Tengo una invitación */}
            <Pressable
              testID="welcome-card-invite"
              accessibilityRole="button"
              accessibilityLabel="Tengo una invitación, únete al equipo de tu empresa"
              onPress={() => router.push('/(auth)/invitation')}
              style={({ pressed }) => [
                styles.accessCard,
                {
                  backgroundColor: pressed ? colors.primarySoft : colors.surfaceSunken,
                  borderRadius: radius.lg,
                  paddingHorizontal: spacing.space3,
                  paddingVertical: spacing.space4,
                  gap: spacing.space1,
                },
              ]}
            >
              <View
                style={[
                  styles.accessCardIconWrap,
                  {
                    width: CARD_ICON_WRAP_SIZE,
                    height: CARD_ICON_WRAP_SIZE,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surfaceRaised,
                  },
                ]}
              >
                <Users size={CARD_ICON_SIZE} color={colors.ink} />
              </View>
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>
                Tengo una invitación
              </Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Únete al equipo de tu empresa
              </Text>
            </Pressable>

            {/* Tarjeta 2: Soy un técnico */}
            <Pressable
              testID="welcome-card-technician"
              accessibilityRole="button"
              accessibilityLabel="Soy un técnico, entra con tu celular"
              onPress={() => router.push('/(auth)/phone')}
              style={({ pressed }) => [
                styles.accessCard,
                {
                  backgroundColor: pressed ? colors.primarySoft : colors.surfaceSunken,
                  borderRadius: radius.lg,
                  paddingHorizontal: spacing.space3,
                  paddingVertical: spacing.space4,
                  gap: spacing.space1,
                },
              ]}
            >
              <View
                style={[
                  styles.accessCardIconWrap,
                  {
                    width: CARD_ICON_WRAP_SIZE,
                    height: CARD_ICON_WRAP_SIZE,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surfaceRaised,
                  },
                ]}
              >
                <ScanFace size={CARD_ICON_SIZE} color={colors.ink} />
              </View>
              <Text style={[typography.bodyStrong, { color: colors.ink }]}>Soy un técnico</Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Entra con tu celular
              </Text>
            </Pressable>
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  authTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  subtitleWidth: {
    maxWidth: 280,
  },
  accessCardsGrid: {
    width: '100%',
    flexDirection: 'row',
  },
  accessCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  accessCardIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
