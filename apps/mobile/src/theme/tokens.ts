import { Platform, TextStyle, ViewStyle } from 'react-native';
import {
  colors as canonicalColors,
  spacingNumbers,
  radiusNumbers,
  controlNumbers,
  layout as canonicalLayout,
  borderWidth as canonicalBorderWidth,
  opacity as canonicalOpacity,
  duration as canonicalDuration,
  fontWeights as canonicalFontWeights,
  type ThemeMode,
} from '@vittkly/ui-tokens';

/**
 * Re-exportación y fachadas de tokens de diseño para Vittkly Mobile.
 * Conectado con la fuente única de verdad canónica `@vittkly/ui-tokens`.
 * Mantiene compatibilidad 1:1 con todas las importaciones existentes.
 */

export const fontFamilies = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semiBold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extraBold: 'Manrope-ExtraBold',
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

export const colors = canonicalColors;
export const spacing = spacingNumbers;
export const radius = radiusNumbers;
export const control = controlNumbers;
export const layout = canonicalLayout;
export const borderWidth = canonicalBorderWidth;
export const opacity = canonicalOpacity;
export const duration = canonicalDuration;
export const fontWeights = canonicalFontWeights;

export const typography = {
  display: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.48, // -0.015em * 32px
  },
  title1: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.24, // -0.01em * 24px
  },
  title2: {
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  title3: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyLg: {
    fontFamily: fontFamilies.regular,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
  },
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  label: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.72, // 0.06em * 12px
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  code: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  timerDisplay: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
} as const satisfies Record<string, TextStyle>;

export const shadows: Record<'light' | 'dark', { shadow1: ViewStyle; shadow2: ViewStyle }> = {
  light: {
    shadow1: {
      shadowColor: '#0E2A3B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    shadow2: {
      shadowColor: '#0E2A3B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  dark: {
    shadow1: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 1,
    },
    shadow2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

export type { ThemeMode };
export type ThemeColors = (typeof colors)[ThemeMode];
export type ThemeSpacing = typeof spacing;
export type ThemeRadius = typeof radius;
export type ThemeControl = typeof control;
export type ThemeLayout = typeof layout;
export type ThemeBorderWidth = typeof borderWidth;
export type ThemeOpacity = typeof opacity;
export type ThemeDuration = typeof duration;
export type ThemeFontWeights = typeof fontWeights;
export type ThemeTypography = typeof typography;

export const tokens = {
  fontFamilies,
  colors,
  spacing,
  radius,
  control,
  layout,
  borderWidth,
  opacity,
  duration,
  fontWeights,
  typography,
  shadows,
} as const;
