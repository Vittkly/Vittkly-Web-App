import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Logo, type LogoVariant } from '@/components/Logo';
import { tokens, useTheme } from '@/theme';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  variant?: 'default' | 'hero';
  centered?: boolean;
  logoVariant?: LogoVariant;
  logoHeight?: number;
  showLogo?: boolean;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BACK_BUTTON_SIZE = tokens.control.lg; // 48px
const BACK_ICON_SIZE = tokens.spacing.space4 + tokens.spacing.space1; // 20px
const LOGO_HEIGHT_DEFAULT = tokens.control.lg; // 48px
const HERO_DECOR_CIRCLE_LG = tokens.control.lg * 3 + tokens.spacing.space6; // 168px
const HERO_DECOR_CIRCLE_SM = tokens.control.lg * 3; // 144px
const HERO_DECOR_OFFSET_NEG = -tokens.control.lg; // -48px

/**
 * Cabecera reutilizable de Autenticación alineada a `vittkly-campo-app.html`.
 * Soporta variante Hero (`heroFrom` -> `heroTo`), centrado de marca y botón de retroceso de `48×48px`.
 */
export function AuthHeader({
  title,
  subtitle,
  badgeText,
  variant = 'default',
  centered = false,
  logoVariant = 'wordmark',
  logoHeight = LOGO_HEIGHT_DEFAULT,
  showLogo = true,
  onBackPress,
  style,
  testID = 'auth-header',
}: AuthHeaderProps) {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const isHero = variant === 'hero';
  const isCentered = centered || isHero;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: isHero ? colors.heroFrom : 'transparent',
          borderColor: isHero ? colors.heroTo : 'transparent',
          borderBottomWidth: isHero ? 1 : 0,
          paddingHorizontal: isHero ? spacing.space6 : 0,
          paddingVertical: isHero ? spacing.space8 : spacing.space2,
          borderRadius: isHero ? radius.xl : 0,
          gap: spacing.space4,
          alignItems: isCentered ? 'center' : 'flex-start',
        },
        style,
      ]}
    >
      {isHero ? (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.heroGlowTopRight,
              {
                width: HERO_DECOR_CIRCLE_LG,
                height: HERO_DECOR_CIRCLE_LG,
                borderRadius: radius.pill,
                backgroundColor: colors.heroTo,
                top: HERO_DECOR_OFFSET_NEG,
                right: HERO_DECOR_OFFSET_NEG,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.heroGlowBottomLeft,
              {
                width: HERO_DECOR_CIRCLE_SM,
                height: HERO_DECOR_CIRCLE_SM,
                borderRadius: radius.pill,
                backgroundColor: colors.heroTo,
                bottom: HERO_DECOR_OFFSET_NEG,
                left: HERO_DECOR_OFFSET_NEG,
              },
            ]}
          />
        </>
      ) : null}

      {onBackPress ? (
        <View style={[styles.topBar, { minHeight: BACK_BUTTON_SIZE }]}>
          <Pressable
            testID="auth-header-back-btn"
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.backButton,
              {
                width: BACK_BUTTON_SIZE,
                height: BACK_BUTTON_SIZE,
                borderRadius: radius.pill,
                backgroundColor: isHero
                  ? colors.heroTo
                  : pressed
                    ? colors.surfaceSunken
                    : 'transparent',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ArrowLeft size={BACK_ICON_SIZE} color={isHero ? colors.heroInk : colors.ink} />
          </Pressable>
        </View>
      ) : null}

      {showLogo ? (
        <View style={isCentered ? styles.centeredBlock : undefined}>
          <Logo
            variant={logoVariant}
            tone={isHero ? 'white' : isDark ? 'white' : 'color'}
            height={logoHeight}
          />
        </View>
      ) : null}

      {badgeText ? (
        <View
          testID="auth-header-badge"
          style={[
            styles.badge,
            isCentered && styles.badgeCentered,
            {
              backgroundColor: isHero ? colors.heroTo : colors.primarySoft,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.space3,
              paddingVertical: spacing.space1,
            },
          ]}
        >
          <Text
            style={[
              typography.label,
              {
                color: isHero ? colors.tenantAccent : colors.primaryInk,
              },
            ]}
          >
            {badgeText}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.textGroup,
          isCentered && styles.centeredBlock,
          {
            gap: spacing.space1,
          },
        ]}
      >
        <Text
          testID="auth-header-title"
          style={[
            typography.title1,
            isCentered && styles.centerText,
            {
              color: isHero ? colors.heroInk : colors.ink,
            },
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            testID="auth-header-subtitle"
            style={[
              typography.small,
              isCentered && styles.centerText,
              {
                color: isHero ? colors.heroInk : colors.inkMuted,
                opacity: isHero ? 0.88 : 1,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowTopRight: {
    position: 'absolute',
    opacity: 0.65,
  },
  heroGlowBottomLeft: {
    position: 'absolute',
    opacity: 0.45,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredBlock: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  textGroup: {
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeCentered: {
    alignSelf: 'center',
  },
});
