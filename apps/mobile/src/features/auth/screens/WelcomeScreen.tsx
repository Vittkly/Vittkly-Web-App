import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FaceIdIcon, ForwardIcon, MailIcon, PhoneIcon } from '@/components/icons';
import { Logo } from '@/components/Logo';
import { tokens, useTheme } from '@/theme';

const LOGO_HERO_HEIGHT = 56;
const HERO_DECOR_LG = tokens.control.lg * 3 + tokens.spacing.space6;
const HERO_DECOR_SM = tokens.control.lg * 3;
const HERO_OFFSET_NEG = -tokens.control.lg;
const ICON_BOX_SIZE = tokens.control.md;

export function WelcomeScreen() {
  const { colors, spacing, radius, typography, control, fontFamilies } = useTheme();

  return (
    <SafeAreaView
      testID="welcome-screen"
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.heroFrom }]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Hero alineada a screenAcceso() de vittkly-campo-app.html */}
        <View
          style={[
            styles.heroTop,
            {
              backgroundColor: colors.heroFrom,
              paddingHorizontal: spacing.space6,
              paddingTop: spacing.space8,
              paddingBottom: spacing.space8,
              gap: spacing.space6,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.heroGlowTopRight,
              {
                width: HERO_DECOR_LG,
                height: HERO_DECOR_LG,
                borderRadius: radius.pill,
                backgroundColor: colors.heroTo,
                top: HERO_OFFSET_NEG,
                right: HERO_OFFSET_NEG,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.heroGlowBottomLeft,
              {
                width: HERO_DECOR_SM,
                height: HERO_DECOR_SM,
                borderRadius: radius.pill,
                backgroundColor: colors.heroTo,
                bottom: HERO_OFFSET_NEG,
                left: HERO_OFFSET_NEG,
              },
            ]}
          />

          <Logo variant="wordmark" tone="white" height={LOGO_HERO_HEIGHT} />

          <View style={[styles.heroCopy, { gap: spacing.space2 }]}>
            <Text style={[typography.display, styles.centerText, { color: colors.heroInk }]}>
              Te damos la bienvenida
            </Text>
            <Text style={[typography.body, styles.centerText, { color: colors.heroInkSoft }]}>
              Tus visitas, órdenes, cobros y más, todo en un solo lugar.
            </Text>
          </View>
        </View>

        {/* Panel inferior blanco con las 2 únicas vías aprobadas de acceso móvil */}
        <View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.surfaceRaised,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: spacing.space6,
              paddingTop: spacing.space6,
              paddingBottom: spacing.space8,
              gap: spacing.space4,
            },
          ]}
        >
          {/* Vía 1 (Principal): Soy un técnico -> Flujo celular + OTP + PIN + Biometría */}
          <Pressable
            testID="welcome-phone-btn"
            accessibilityRole="button"
            accessibilityLabel="Soy un técnico, entra con tu celular"
            onPress={() => router.push('/(auth)/phone')}
            style={({ pressed }) => [
              styles.roleCard,
              {
                minHeight: control.lg + spacing.space4,
                backgroundColor: pressed ? colors.primarySoft : colors.surfaceRaised,
                borderColor: colors.primary,
                borderWidth: 1.5,
                borderRadius: radius.lg,
                padding: spacing.space4,
                gap: spacing.space3,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  width: ICON_BOX_SIZE,
                  height: ICON_BOX_SIZE,
                  borderRadius: radius.md,
                  backgroundColor: colors.primarySoft,
                },
              ]}
            >
              <PhoneIcon size={20} color={colors.primaryInk} />
            </View>

            <View style={[styles.cardText, { gap: spacing.space1 / 2 }]}>
              <Text
                style={[
                  typography.bodyStrong,
                  { fontFamily: fontFamilies.bold, color: colors.ink },
                ]}
              >
                Soy un técnico
              </Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Entra con tu celular y código SMS
              </Text>
            </View>

            <ForwardIcon size={20} color={colors.primaryInk} />
          </Pressable>

          {/* Vía 2 (Correo y contraseña): Supervisores, administradores o técnicos */}
          <Button
            testID="welcome-login-btn"
            variant="secondary"
            shape="pill"
            block
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          >
            Iniciar sesión con correo
          </Button>

          <View style={[styles.hintRow, { gap: spacing.space2, marginTop: spacing.space1 }]}>
            <View style={[styles.hintChip, { gap: spacing.space1 }]}>
              <FaceIdIcon size={14} color={colors.inkMuted} />
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                PIN y Biometría offline
              </Text>
            </View>
            <Text style={[typography.small, { color: colors.lineStrong }]}>·</Text>
            <View style={[styles.hintChip, { gap: spacing.space1 }]}>
              <MailIcon size={14} color={colors.inkMuted} />
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Acceso multiempresa
              </Text>
            </View>
          </View>

          <Text style={[typography.small, styles.legalText, { color: colors.inkMuted }]}>
            Al continuar aceptas los Términos y la Política de privacidad.
          </Text>
        </View>
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
  heroTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowTopRight: {
    position: 'absolute',
    opacity: 0.4,
  },
  heroGlowBottomLeft: {
    position: 'absolute',
    opacity: 0.3,
  },
  heroCopy: {
    alignItems: 'center',
    maxWidth: 320,
  },
  centerText: {
    textAlign: 'center',
  },
  bottomSheet: {
    width: '100%',
  },
  roleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalText: {
    textAlign: 'center',
  },
});
