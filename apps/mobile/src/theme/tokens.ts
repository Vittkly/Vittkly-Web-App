import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * Fuente única de tokens de Vittkly UI Kit (versión 1).
 * Generado fielmente a partir de `Vittkly-UI-Kit/vittkly-ui-kit/tokens/tokens.json`.
 * PROHIBIDO alterar o inventar valores HEX, espaciados, alturas táctiles o radios.
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

export const colors = {
  light: {
    surface: '#F3F8FA',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: '#EAF2F6',
    line: '#DDE7EC',
    lineStrong: '#778B97',
    ink: '#0E2A3B',
    inkMuted: '#52626D',
    vitta: '#2AA8DE',
    kleanly: '#3EC49B',
    primary: '#157AA8',
    primaryHover: '#0F6A93',
    onPrimary: '#FFFFFF',
    primaryInk: '#106C97',
    primarySoft: '#E3F4FB',
    success: '#3EC49B',
    onSuccess: '#0E2A3B',
    successInk: '#146F55',
    successSoft: '#E2F6EF',
    warning: '#F2A93B',
    onWarning: '#0E2A3B',
    warningInk: '#8A5A0B',
    warningSoft: '#FDF1DC',
    danger: '#B3322C',
    onDanger: '#FFFFFF',
    dangerInk: '#B3322C',
    dangerSoft: '#FDE8E7',
    focus: '#157AA8',
    tenantAccent: '#3EC49B',
    onTenantAccent: '#0E2A3B',
    tenantAccentSoft: '#E2F6EF',
    heroFrom: '#0E2A3B',
    heroTo: '#15425C',
    heroInk: '#FFFFFF',
  },
  dark: {
    surface: '#0A1C27',
    surfaceRaised: '#10283A',
    surfaceSunken: '#081620',
    line: '#1F3B4E',
    lineStrong: '#6A8CA1',
    ink: '#E7F1F6',
    inkMuted: '#9DB2BE',
    vitta: '#2AA8DE',
    kleanly: '#3EC49B',
    primary: '#5BC0EA',
    primaryHover: '#7FCFF0',
    onPrimary: '#0A1C27',
    primaryInk: '#5BC0EA',
    primarySoft: '#0F3347',
    success: '#3EC49B',
    onSuccess: '#0A1C27',
    successInk: '#4FD1A9',
    successSoft: '#0E3A2E',
    warning: '#F2A93B',
    onWarning: '#0A1C27',
    warningInk: '#F2B45A',
    warningSoft: '#3D2A0B',
    danger: '#F08A84',
    onDanger: '#0A1C27',
    dangerInk: '#F08A84',
    dangerSoft: '#3F1614',
    focus: '#5BC0EA',
    tenantAccent: '#3EC49B',
    onTenantAccent: '#0A1C27',
    tenantAccentSoft: '#0E3A2E',
    heroFrom: '#071825',
    heroTo: '#0F3347',
    heroInk: '#E7F1F6',
  },
} as const;

export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space6: 24,
  space8: 32,
  space12: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 24,
  pill: 999,
} as const;

export const control = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

export const layout = {
  formMaxWidth: 320,
  contentMaxWidth: 360,
  keypadWidth: 280,
  cardGap: 12,
} as const;

export const borderWidth = {
  none: 0,
  thin: 1,
  emphasis: 1.5,
  dot: 2,
  focus: 2,
} as const;

export const opacity = {
  disabled: 0.4,
  subtle: 0.45,
  dim: 0.5,
  pressed: 0.6,
  hover: 0.8,
  full: 1,
} as const;

export const duration = {
  instant: 150,
  fast: 200,
  normal: 300,
  progress: 900,
  splashHold: 950,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

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

export type ThemeMode = 'light' | 'dark';
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
