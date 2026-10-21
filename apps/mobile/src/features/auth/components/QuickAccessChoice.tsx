import { ChevronRight, Mail, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { tokens, useTheme } from '@/theme';

export interface QuickAccessChoiceProps {
  onSelectPin: () => void;
  onSelectEmailOnly: () => void;
  testID?: string;
}

const LOGO_HEIGHT = tokens.control.lg; // 48px
const CARD_ICON_BOX_SIZE = tokens.control.md; // 40px
const CARD_ICON_SIZE = tokens.spacing.space4 + tokens.spacing.space1; // 20px
const CHEVRON_SIZE = tokens.spacing.space4 + tokens.spacing.space1; // 20px

/**
 * Componente reutilizable de elección en 2 tarjetas (`QuickAccessChoice`) para configurar
 * el inicio rápido tras iniciar sesión o registrarse con correo electrónico (R9):
 * - Tarjeta 1 (Recomendada / Destacada): "Crear inicio rápido con PIN y Biometría"
 * - Tarjeta 2 (Secundaria): "Continuar solo con correo"
 */
export function QuickAccessChoice({
  onSelectPin,
  onSelectEmailOnly,
  testID = 'quick-access-choice',
}: QuickAccessChoiceProps) {
  const { colors, spacing, radius, typography, control, shadows, fontFamilies } = useTheme();

  return (
    <View testID={testID} style={[styles.container, { gap: spacing.space6 }]}>
      <View style={[styles.header, { gap: spacing.space2 }]}>
        <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
        <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
          Elige cómo quieres ingresar
        </Text>
        <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
          Configura un acceso rápido para entrar en segundos cuando vuelvas a abrir la app o estés
          sin señal.
        </Text>
      </View>

      <View style={[styles.cardsColumn, { gap: spacing.space3 }]}>
        {/* Tarjeta 1 (Recomendada / Destacada): Crear inicio rápido con PIN y Biometría */}
        <Pressable
          testID="quick-access-card-pin"
          accessibilityRole="button"
          accessibilityLabel="Crear inicio rápido con PIN y Biometría"
          onPress={onSelectPin}
          style={({ pressed }) => [
            styles.card,
            shadows.shadow1,
            {
              minHeight: control.lg + spacing.space8,
              backgroundColor: pressed ? colors.primarySoft : colors.surfaceRaised,
              borderColor: colors.primary,
              borderWidth: 1.5,
              borderRadius: radius.lg,
              padding: spacing.space4,
              gap: spacing.space3,
            },
          ]}
        >
          <View style={[styles.cardTopRow, { gap: spacing.space3 }]}>
            <View
              style={[
                styles.iconBox,
                {
                  width: CARD_ICON_BOX_SIZE,
                  height: CARD_ICON_BOX_SIZE,
                  borderRadius: radius.md,
                  backgroundColor: colors.primarySoft,
                },
              ]}
            >
              <ShieldCheck size={CARD_ICON_SIZE} color={colors.primaryInk} />
            </View>

            <View style={[styles.cardTextColumn, { gap: spacing.space1 }]}>
              <View style={[styles.badgeRow, { gap: spacing.space2 }]}>
                <View
                  style={[
                    styles.recommendedBadge,
                    {
                      backgroundColor: colors.tenantAccentSoft,
                      borderRadius: radius.pill,
                      paddingHorizontal: spacing.space2,
                      paddingVertical: spacing.space1 / 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.label,
                      {
                        fontFamily: fontFamilies.bold,
                        color: colors.successInk,
                      },
                    ]}
                  >
                    RECOMENDADO
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  typography.bodyStrong,
                  {
                    fontFamily: fontFamilies.bold,
                    color: colors.ink,
                  },
                ]}
              >
                Crear inicio rápido con PIN y Biometría
              </Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Desbloquea rápido con PIN de 4 dígitos, Huella o Face ID al cerrar la app o estar
                sin señal.
              </Text>
            </View>

            <ChevronRight size={CHEVRON_SIZE} color={colors.primaryInk} />
          </View>
        </Pressable>

        {/* Tarjeta 2 (Secundaria): Continuar solo con correo */}
        <Pressable
          testID="quick-access-card-email-only"
          accessibilityRole="button"
          accessibilityLabel="Continuar solo con correo"
          onPress={onSelectEmailOnly}
          style={({ pressed }) => [
            styles.card,
            {
              minHeight: control.lg + spacing.space6,
              backgroundColor: pressed ? colors.surfaceSunken : colors.surfaceRaised,
              borderColor: colors.line,
              borderWidth: 1,
              borderRadius: radius.lg,
              padding: spacing.space4,
              gap: spacing.space3,
            },
          ]}
        >
          <View style={[styles.cardTopRow, { gap: spacing.space3 }]}>
            <View
              style={[
                styles.iconBox,
                {
                  width: CARD_ICON_BOX_SIZE,
                  height: CARD_ICON_BOX_SIZE,
                  borderRadius: radius.md,
                  backgroundColor: colors.surfaceSunken,
                },
              ]}
            >
              <Mail size={CARD_ICON_SIZE} color={colors.inkMuted} />
            </View>

            <View style={[styles.cardTextColumn, { gap: spacing.space1 }]}>
              <Text
                style={[
                  typography.bodyStrong,
                  {
                    fontFamily: fontFamilies.bold,
                    color: colors.ink,
                  },
                ]}
              >
                Continuar solo con correo
              </Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Mantener el acceso tradicional con correo y contraseña sin configurar PIN por ahora.
              </Text>
            </View>

            <ChevronRight size={CHEVRON_SIZE} color={colors.inkMuted} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  cardsColumn: {
    width: '100%',
  },
  card: {
    width: '100%',
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextColumn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
  },
});
